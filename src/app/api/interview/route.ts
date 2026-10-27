// 面試 API：前端每送一次回答就呼叫一次 POST /api/interview
// 後端依「已回答幾題」決定要出下一題，還是產生最終評分

// Google Gemini 官方 SDK：GoogleGenAI 是用戶端、Type 用來定義 JSON 結構、Content 是對話訊息的型別
import { GoogleGenAI, Type, type Content } from "@google/genai";
// 前後端共用的常數與型別（題數上下限、訊息、評分格式等）
import {
  MAX_QUESTIONS,
  MIN_QUESTIONS,
  type Evaluation,
  type InterviewRequest,
  type InterviewResponse,
  type Message,
} from "@/lib/interview";

// 使用的模型：可在 .env.local 用 GEMINI_MODEL 覆寫，沒設定就用 gemini-2.5-flash
const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

// 出題時的系統指令：設定 AI 扮演面試官，並規範出題方式（一次一題、可追問、不給答案）
const INTERVIEWER_PROMPT = `你是一位專業、友善但嚴謹的面試官，正在依照職缺描述進行模擬面試。
規則：
- 全程使用繁體中文。
- 每次只提出「一個」問題，整段只能有一個問號，不要把多個子問題塞在同一題裡，也不要附上答案、提示或評語。
- 根據應徵者上一題的回答決定：若回答模糊、缺乏細節或值得深挖，就針對該回答追問；否則換一個與職缺相關的新面向出題。
- 問題要具體、貼近職缺所需的技能與情境，長度控制在三句話以內。
- 直接輸出問題本身，不要加上「第 N 題」之類的前綴。`;

// 評分時的系統指令：說明每個欄位要填什麼內容
const EVALUATOR_PROMPT = `你是一位資深面試官，請根據職缺描述與完整的面試逐字稿，評估應徵者的表現。
- 全程使用繁體中文。
- score 為 0 到 100 的整數，代表與此職缺的契合程度與回答品質。
- summary 用 2~4 句話總結整體表現。
- strengths 列出 2~4 個具體優點，improvements 列出 2~4 個具體且可執行的改進建議。
- questionReviews 依逐字稿的題號順序，每一題各一筆，數量必須與題數相同：
  - feedback：1~3 句話點出這題回答的優缺點。
  - betterAnswer：以應徵者第一人稱寫一段更好的示範回答（約 100~200 字），盡量沿用應徵者提到的真實經驗並補強結構（如 STAR：情境、任務、行動、結果）與量化成果；需要應徵者自行替換的細節用【】標示。`;

// 評分結果的 JSON 結構定義，交給 Gemini 後它會照這個格式回傳，方便程式直接解析
const evaluationSchema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.INTEGER }, // 總分
    summary: { type: Type.STRING }, // 整體總結
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } }, // 優點清單
    improvements: { type: Type.ARRAY, items: { type: Type.STRING } }, // 改進建議清單
    questionReviews: {
      // 逐題點評，每題一筆
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          feedback: { type: Type.STRING }, // 這題的點評
          betterAnswer: { type: Type.STRING }, // 這題的示範回答
        },
        required: ["feedback", "betterAnswer"],
      },
    },
  },
  required: ["score", "summary", "strengths", "improvements", "questionReviews"],
};

// 模型實際回傳的格式：逐題點評只有 feedback 和 betterAnswer，
// 題目和回答之後再由我們自己補上（見 evaluate 函式）
type RawEvaluation = Omit<Evaluation, "questionReviews"> & {
  questionReviews?: { feedback: string; betterAnswer: string }[];
};

// Gemini 偶爾會因流量過高回 503 / 429，等一下再試通常就會成功
const RETRYABLE_STATUS = new Set([429, 500, 503]); // 值得重試的 HTTP 狀態碼
const RETRY_DELAYS_MS = [1000, 2000, 4000]; // 每次重試前等待的時間，越等越久，最多重試 3 次

// 包住任何 Gemini 呼叫：失敗且狀態碼可重試時，等一下再重來；其他錯誤或重試用完就直接丟出
async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn(); // 成功就直接回傳結果
    } catch (err) {
      const status = (err as { status?: number })?.status;
      // 重試次數用完、沒有狀態碼、或不是可重試的錯誤（例如 400 參數錯）→ 放棄並往外丟
      if (attempt >= RETRY_DELAYS_MS.length || !status || !RETRYABLE_STATUS.has(status)) {
        throw err;
      }
      console.warn(`Gemini 回應 ${status}，${RETRY_DELAYS_MS[attempt]}ms 後重試`);
      await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[attempt])); // 等待後進入下一輪
    }
  }
}

// 檢查前端送來的資料格式是否正確（型別守衛：通過後 TypeScript 就會把 body 視為 InterviewRequest）
function isValidRequest(body: unknown): body is InterviewRequest {
  if (typeof body !== "object" || body === null) return false;
  const { jobDescription, totalQuestions, messages } = body as Record<string, unknown>;
  return (
    // 職缺描述必須是非空字串
    typeof jobDescription === "string" &&
    jobDescription.trim().length > 0 &&
    // 題數必須是整數，且在上下限之間
    Number.isInteger(totalQuestions) &&
    (totalQuestions as number) >= MIN_QUESTIONS &&
    (totalQuestions as number) <= MAX_QUESTIONS &&
    // 對話紀錄必須是陣列，每筆都要有合法的角色和文字內容
    Array.isArray(messages) &&
    messages.every(
      (m) =>
        (m?.role === "interviewer" || m?.role === "candidate") &&
        typeof m?.content === "string",
    )
  );
}

// 把對話整理成一問一答，回答尚未送出的題目會被略過
function toQAPairs(messages: Message[]) {
  const pairs: { question: string; answer: string }[] = [];
  messages.forEach((m, i) => {
    const next = messages[i + 1];
    // 只有「面試官發問」後面緊接著「應徵者回答」，才算一組完整的問答
    if (m.role === "interviewer" && next?.role === "candidate") {
      pairs.push({ question: m.content, answer: next.content });
    }
  });
  return pairs;
}

// 把問答組合成文字逐字稿，交給 AI 評分用
function toTranscript(pairs: { question: string; answer: string }[]) {
  return pairs
    .map((p, i) => `第 ${i + 1} 題\n面試官：${p.question}\n應徵者：${p.answer}`)
    .join("\n\n");
}

// 請 AI 出下一題：把職缺描述和到目前為止的對話都交給模型，讓它接著問
async function askQuestion(
  ai: GoogleGenAI,
  jobDescription: string,
  totalQuestions: number,
  messages: Message[],
) {
  const contents: Content[] = [
    // 第一則訊息：交代職缺描述與總題數，請面試官開始
    {
      role: "user",
      parts: [
        {
          text: `職缺描述：\n${jobDescription}\n\n本次面試共 ${totalQuestions} 題，請開始面試，提出第一個問題。`,
        },
      ],
    },
    // 接著放入歷史對話：面試官的話當作模型（model）說的，應徵者的話當作使用者（user）說的
    ...messages.map<Content>((m) => ({
      role: m.role === "interviewer" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
  ];

  const res = await withRetry(() =>
    ai.models.generateContent({
      model: MODEL,
      contents,
      config: { systemInstruction: INTERVIEWER_PROMPT }, // 套用面試官的規則
    }),
  );
  return res.text?.trim() ?? ""; // 取出模型產生的題目文字
}

// 請 AI 對整場面試評分，並產生逐題點評與示範回答
async function evaluate(
  ai: GoogleGenAI,
  jobDescription: string,
  messages: Message[],
): Promise<Evaluation> {
  const pairs = toQAPairs(messages);
  const res = await withRetry(() =>
    ai.models.generateContent({
      model: MODEL,
      contents: `職缺描述：\n${jobDescription}\n\n面試逐字稿（共 ${pairs.length} 題）：\n${toTranscript(pairs)}`,
      config: {
        systemInstruction: EVALUATOR_PROMPT, // 套用評分規則
        responseMimeType: "application/json", // 要求回傳 JSON
        responseSchema: evaluationSchema, // 並且照我們定義的結構
      },
    }),
  );
  const raw = JSON.parse(res.text ?? "{}") as RawEvaluation;

  // 題目與回答用我們自己的紀錄，避免模型改寫；只取模型給的回饋與示範回答
  const questionReviews = pairs.map((p, i) => ({
    ...p,
    feedback: raw.questionReviews?.[i]?.feedback ?? "", // 模型漏給時以空字串代替，前端就不顯示
    betterAnswer: raw.questionReviews?.[i]?.betterAnswer ?? "",
  }));
  return { ...raw, questionReviews };
}

// API 進入點：處理 POST /api/interview 請求
export async function POST(request: Request) {
  // 1. 確認伺服器有設定 API 金鑰
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "伺服器未設定 GEMINI_API_KEY" }, { status: 500 });
  }

  // 2. 解析並驗證前端送來的資料（JSON 壞掉時當作 null，會在驗證時被擋下）
  const body: unknown = await request.json().catch(() => null);
  if (!isValidRequest(body)) {
    return Response.json(
      { error: `請提供職缺描述、對話紀錄，以及 ${MIN_QUESTIONS}~${MAX_QUESTIONS} 之間的題數` },
      { status: 400 },
    );
  }

  // 3. 計算應徵者已經回答了幾題，用來判斷面試進度
  const { jobDescription, totalQuestions, messages } = body;
  const answered = messages.filter((m) => m.role === "candidate").length;
  console.log(`面試進度：已回答 ${answered} / ${totalQuestions} 題`);
  const ai = new GoogleGenAI({ apiKey });

  try {
    let result: InterviewResponse;
    if (answered < totalQuestions) {
      // 4a. 還沒答完 → 出下一題
      const content = await askQuestion(ai, jobDescription, totalQuestions, messages);
      result = { type: "question", questionNumber: answered + 1, content };
    } else {
      // 4b. 題數已答滿 → 產生最終評分
      const evaluation = await evaluate(ai, jobDescription, messages);
      result = { type: "evaluation", evaluation };
    }
    return Response.json(result);
  } catch (err) {
    // 5. 重試後仍失敗（或其他錯誤）→ 回傳 502，前端會顯示錯誤並讓使用者重送
    console.error("Gemini 呼叫失敗：", err);
    return Response.json({ error: "AI 面試官暫時無法回應，請稍後再試" }, { status: 502 });
  }
}
