"use client";

import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_QUESTIONS,
  MAX_QUESTIONS,
  MIN_QUESTIONS,
  type Evaluation,
  type InterviewResponse,
  type Message,
} from "@/lib/interview";

type Stage = "setup" | "interview" | "result";

const STAGES: { key: Stage; label: string }[] = [
  { key: "setup", label: "設定職缺" },
  { key: "interview", label: "模擬面試" },
  { key: "result", label: "評分報告" },
];

export default function InterviewPage() {
  const [stage, setStage] = useState<Stage>("setup");
  const [jobDescription, setJobDescription] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(DEFAULT_QUESTIONS);
  const [messages, setMessages] = useState<Message[]>([]);
  const [answer, setAnswer] = useState("");
  const [questionNumber, setQuestionNumber] = useState(0);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function callInterview(history: Message[]) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, totalQuestions, messages: history }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "發生未知錯誤");

      const result = data as InterviewResponse;
      if (result.type === "question") {
        setQuestionNumber(result.questionNumber);
        setMessages([...history, { role: "interviewer", content: result.content }]);
      } else {
        setEvaluation(result.evaluation);
        setStage("result");
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "發生未知錯誤");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function startInterview() {
    if (!jobDescription.trim()) return;
    setStage("interview");
    setMessages([]);
    await callInterview([]);
  }

  async function submitAnswer() {
    const text = answer.trim();
    if (!text || loading) return;
    const history: Message[] = [...messages, { role: "candidate", content: text }];
    setMessages(history);
    setAnswer("");
    const ok = await callInterview(history);
    if (!ok) {
      // 失敗時還原，讓使用者可以重新送出
      setMessages(messages);
      setAnswer(text);
    }
  }

  function restart() {
    setStage("setup");
    setMessages([]);
    setAnswer("");
    setQuestionNumber(0);
    setEvaluation(null);
    setError("");
  }

  const answered = messages.filter((m) => m.role === "candidate").length;
  const stageIndex = STAGES.findIndex((s) => s.key === stage);

  return (
    <main className="grain flex-1">
      <div className="mx-auto flex w-full max-w-3xl flex-col px-5 py-12">
        {/* 階段指示 */}
        <ol className="mb-10 flex items-center gap-3 text-sm">
          {STAGES.map((s, i) => (
            <li key={s.key} className="flex items-center gap-3">
              <span
                className={`flex items-center gap-2 ${i <= stageIndex ? "text-ink" : "text-ink-2/60"}`}
              >
                <span
                  className={`grid size-6 place-items-center rounded-full text-xs ${
                    i < stageIndex
                      ? "bg-sage text-paper"
                      : i === stageIndex
                        ? "bg-accent text-white"
                        : "border border-line"
                  }`}
                >
                  {i < stageIndex ? "✓" : i + 1}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </span>
              {i < STAGES.length - 1 && <span className="h-px w-8 bg-line sm:w-12" />}
            </li>
          ))}
        </ol>

        {error && (
          <div className="mb-6 rounded-2xl border border-accent/40 bg-accent-soft px-5 py-3 text-sm text-accent">
            {error}
          </div>
        )}

        {stage === "setup" && (
          <section className="rounded-3xl border border-line bg-card p-7 shadow-[0_30px_60px_-40px_rgba(0,0,0,0.35)] md:p-10">
            <div className="font-display text-lg italic text-accent">Step 1</div>
            <h1 className="mt-1 font-serif text-3xl font-bold">告訴我們你要面試的職缺</h1>
            <p className="mt-3 text-ink-2">貼上職缺描述並選擇題數，AI 面試官會依內容逐題提問。</p>

            <label htmlFor="jd" className="mt-8 block text-sm font-medium">
              職缺描述
            </label>
            <textarea
              id="jd"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={10}
              placeholder="例如：前端工程師，需熟悉 React、TypeScript，有團隊協作與效能優化經驗……"
              className="mt-2 w-full resize-y rounded-2xl border border-line bg-paper p-4 leading-relaxed outline-none transition placeholder:text-ink-2/50 focus:border-accent focus:ring-4 focus:ring-accent/15"
            />

            <div className="mt-6 text-sm font-medium">題數</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {Array.from({ length: MAX_QUESTIONS - MIN_QUESTIONS + 1 }, (_, i) => MIN_QUESTIONS + i).map(
                (n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setTotalQuestions(n)}
                    aria-pressed={totalQuestions === n}
                    className={`size-11 rounded-full border text-sm transition ${
                      totalQuestions === n
                        ? "border-ink bg-ink text-paper"
                        : "border-line hover:border-ink"
                    }`}
                  >
                    {n}
                  </button>
                ),
              )}
            </div>

            <div className="mt-10 flex items-center justify-between gap-4">
              <span className="text-sm text-ink-2">預計 {totalQuestions} 題・約 {totalQuestions * 2} 分鐘</span>
              <button
                onClick={startInterview}
                disabled={!jobDescription.trim()}
                className="rounded-full bg-accent px-7 py-3 font-medium text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
              >
                開始面試 →
              </button>
            </div>
          </section>
        )}

        {stage === "interview" && (
          <section className="flex flex-1 flex-col gap-5">
            <div>
              <div className="flex items-baseline justify-between">
                <h1 className="font-serif text-2xl font-bold">模擬面試進行中</h1>
                <span className="font-display text-xl">
                  {Math.max(questionNumber, 1)}
                  <span className="text-ink-2"> / {totalQuestions}</span>
                </span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-paper-2">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-500"
                  style={{ width: `${(answered / totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-5 py-3.5 leading-relaxed ${
                    m.role === "interviewer"
                      ? "self-start rounded-tl-sm border border-line bg-card"
                      : "self-end rounded-tr-sm bg-ink text-paper"
                  }`}
                >
                  <div className="mb-1 text-[11px] opacity-60">
                    {m.role === "interviewer" ? "面試官" : "你"}
                  </div>
                  {m.content}
                </div>
              ))}
              {loading && (
                <div className="self-start rounded-2xl rounded-tl-sm border border-line bg-card px-5 py-3.5 text-ink-2">
                  {answered >= totalQuestions ? "面試官正在評估你的表現" : "面試官思考中"}
                  <span className="ml-1 inline-flex gap-0.5">
                    <span className="animate-pulse">·</span>
                    <span className="animate-pulse [animation-delay:150ms]">·</span>
                    <span className="animate-pulse [animation-delay:300ms]">·</span>
                  </span>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="sticky bottom-4 mt-auto rounded-3xl border border-line bg-card p-3 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.45)]">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submitAnswer();
                }}
                rows={4}
                disabled={loading || messages.length === 0}
                placeholder="輸入你的回答（Ctrl + Enter 送出）"
                className="w-full resize-none rounded-2xl bg-transparent p-3 leading-relaxed outline-none placeholder:text-ink-2/50 disabled:opacity-50"
              />
              <div className="flex items-center justify-between px-1">
                <button
                  onClick={restart}
                  className="rounded-full px-4 py-2 text-sm text-ink-2 transition hover:bg-paper-2 hover:text-ink"
                >
                  重新開始
                </button>
                {messages.length === 0 && !loading ? (
                  <button
                    onClick={() => callInterview([])}
                    className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white"
                  >
                    重試
                  </button>
                ) : (
                  <button
                    onClick={submitAnswer}
                    disabled={loading || !answer.trim()}
                    className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    送出回答 →
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {stage === "result" && evaluation && (
          <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-6 rounded-3xl bg-ink p-8 text-paper sm:flex-row sm:items-center">
              <div className="shrink-0 sm:pr-8 sm:border-r sm:border-paper/15">
                <div className="text-xs tracking-[0.2em] text-paper/60">整體評分</div>
                <div className="font-display text-7xl leading-none">
                  {evaluation.score}
                  <span className="ml-1 text-2xl text-paper/50">/100</span>
                </div>
              </div>
              <p className="leading-relaxed text-paper/85">{evaluation.summary}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-line bg-sage-soft p-6">
                <h2 className="mb-4 font-serif text-lg font-bold text-sage">優點</h2>
                <ul className="space-y-3">
                  {evaluation.strengths.map((s, i) => (
                    <li key={i} className="flex gap-3 leading-relaxed">
                      <span className="text-sage">✓</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl border border-line bg-accent-soft p-6">
                <h2 className="mb-4 font-serif text-lg font-bold text-accent">改進建議</h2>
                <ul className="space-y-3">
                  {evaluation.improvements.map((s, i) => (
                    <li key={i} className="flex gap-3 leading-relaxed">
                      <span className="text-accent">→</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {evaluation.questionReviews.length > 0 && (
              <div className="mt-4 flex flex-col gap-4">
                <h2 className="font-serif text-2xl font-bold">逐題建議</h2>
                {evaluation.questionReviews.map((r, i) => (
                  <article key={i} className="flex flex-col gap-4 rounded-3xl border border-line bg-card p-6">
                    <div className="flex gap-4">
                      <span className="font-display text-3xl italic leading-none text-accent">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="font-serif font-bold leading-relaxed">{r.question}</h3>
                    </div>
                    <div>
                      <div className="mb-1 text-xs tracking-[0.2em] text-ink-2">你的回答</div>
                      <p className="whitespace-pre-wrap leading-relaxed text-ink-2">{r.answer}</p>
                    </div>
                    {r.feedback && (
                      <div>
                        <div className="mb-1 text-xs tracking-[0.2em] text-ink-2">點評</div>
                        <p className="whitespace-pre-wrap leading-relaxed">{r.feedback}</p>
                      </div>
                    )}
                    {r.betterAnswer && (
                      <div className="rounded-2xl bg-sage-soft p-5">
                        <div className="mb-2 text-xs tracking-[0.2em] text-sage">建議回答方式</div>
                        <p className="whitespace-pre-wrap leading-relaxed">{r.betterAnswer}</p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}

            <button
              onClick={restart}
              className="mt-4 self-center rounded-full bg-accent px-8 py-3 font-medium text-white transition hover:-translate-y-0.5"
            >
              再練習一次 →
            </button>
          </section>
        )}
      </div>
    </main>
  );
}
