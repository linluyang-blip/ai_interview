import Link from "next/link";
import { MAX_QUESTIONS, MIN_QUESTIONS } from "@/lib/interview";

const STEPS = [
  {
    no: "01",
    title: "貼上職缺描述",
    body: "把 104、LinkedIn 上的職缺內容直接貼進來，再選擇這次要練幾題。",
  },
  {
    no: "02",
    title: "與 AI 面試官對答",
    body: "面試官依職缺逐題提問；回答太模糊時，它會像真人一樣追問細節。",
  },
  {
    no: "03",
    title: "拿到評分與示範回答",
    body: "整場結束後給出總分、優缺點，以及每一題用 STAR 結構改寫的示範回答。",
  },
];

const FEATURES = [
  {
    tag: "追問",
    title: "會追問的面試官",
    body: "不是固定題庫。AI 會讀你的回答，抓出含糊之處深挖，逼你把經驗講清楚。",
  },
  {
    tag: "評分",
    title: "百分制契合度評分",
    body: "依職缺需求與回答品質打分，並條列具體優點與可執行的改進建議。",
  },
  {
    tag: "示範",
    title: "逐題示範回答",
    body: "沿用你提到的真實經驗，補上結構與量化成果；需要替換的細節以【】標出。",
  },
  {
    tag: "彈性",
    title: `${MIN_QUESTIONS}～${MAX_QUESTIONS} 題自由選`,
    body: "通勤時練 2 題熱身，面試前一晚來場 10 題完整模擬，都可以。",
  },
];

const FAQ = [
  {
    q: "需要註冊或付費嗎？",
    a: "不需要。打開頁面、貼上職缺描述就能直接開始練習。",
  },
  {
    q: "我的回答會被儲存嗎？",
    a: "本服務不會在伺服器上保存你的面試紀錄，關閉或重新開始後就會清空。為了產生題目與評分，職缺描述與回答會傳送給 Google Gemini 處理。",
  },
  {
    q: "支援哪些職缺？",
    a: "任何有文字描述的職缺都可以，工程、設計、行銷、業務、管理職皆適用。描述寫得越完整，題目越貼近實際。",
  },
  {
    q: "示範回答可以直接背嗎？",
    a: "建議當作架構參考。示範回答會用【】標出需要換成你自己經驗的地方，改成你的真實故事效果最好。",
  },
];

export default function Landing() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="grain relative overflow-hidden border-b border-line">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-20 md:py-28 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-xs text-ink-2">
              <span className="size-1.5 rounded-full bg-accent" />
              由 Gemini 驅動的模擬面試
            </span>
            <h1 className="mt-6 font-serif text-5xl font-bold leading-[1.15] tracking-tight md:text-6xl">
              下一場面試，
              <br />
              先在這裡
              <span className="relative whitespace-nowrap">
                <span className="relative z-10 text-accent">演練一次</span>
                <span className="absolute inset-x-0 bottom-1 -z-0 h-3 bg-accent-soft" />
              </span>
              。
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-2">
              貼上職缺描述，AI 面試官會即時提問、針對你的回答追問，結束後給你評分、改進建議，以及每一題的示範回答。
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/interview"
                className="rounded-full bg-accent px-7 py-3.5 font-medium text-white shadow-[0_8px_24px_-8px] shadow-accent/60 transition hover:-translate-y-0.5"
              >
                免費開始練習 →
              </Link>
              <Link
                href="#how"
                className="rounded-full border border-ink/20 px-7 py-3.5 font-medium transition hover:border-ink"
              >
                看看怎麼運作
              </Link>
            </div>
            <p className="mt-5 text-sm text-ink-2">免註冊・免安裝・繁體中文</p>
          </div>

          {/* 產品示意卡 */}
          <div className="relative">
            <div className="absolute -right-6 -top-6 size-40 rounded-full bg-sage-soft blur-2xl" />
            <div className="relative rotate-1 rounded-3xl border border-line bg-card p-6 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.35)]">
              <div className="mb-5 flex items-center justify-between text-xs text-ink-2">
                <span className="font-display text-base italic text-ink">Live session</span>
                <span>第 2 / 5 題</span>
              </div>
              <div className="mb-4 h-1 overflow-hidden rounded-full bg-paper-2">
                <div className="h-full w-2/5 rounded-full bg-accent" />
              </div>
              <div className="space-y-3 text-sm leading-relaxed">
                <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-paper-2 px-4 py-3">
                  <div className="mb-1 text-[11px] text-ink-2">面試官</div>
                  你提到曾把首頁載入時間縮短一半，當時具體做了哪些調整？
                </div>
                <div className="ml-auto max-w-[88%] rounded-2xl rounded-tr-sm bg-ink px-4 py-3 text-paper">
                  <div className="mb-1 text-[11px] opacity-60">你</div>
                  我們先用 Lighthouse 找出瓶頸，把圖片改成延遲載入，並拆分了大型套件……
                </div>
                <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-paper-2 px-4 py-3 text-ink-2">
                  面試官思考中
                  <span className="ml-1 inline-flex gap-0.5">
                    <span className="animate-pulse">·</span>
                    <span className="animate-pulse [animation-delay:150ms]">·</span>
                    <span className="animate-pulse [animation-delay:300ms]">·</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-8 -left-4 -rotate-3 rounded-2xl border border-line bg-card px-5 py-4 shadow-xl md:-left-10">
              <div className="text-[11px] text-ink-2">整體評分</div>
              <div className="font-display text-4xl leading-none text-sage">
                86<span className="ml-1 text-base text-ink-2">/100</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 數字條 */}
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-line px-5 md:grid-cols-4 md:divide-x">
          {[
            [`${MIN_QUESTIONS}–${MAX_QUESTIONS}`, "題數自由選"],
            ["STAR", "示範回答結構"],
            ["0", "註冊步驟"],
            ["100", "分制評分"],
          ].map(([num, label]) => (
            <div key={label} className="py-8 text-center">
              <div className="font-display text-4xl">{num}</div>
              <div className="mt-1 text-sm text-ink-2">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 使用流程 */}
      <section id="how" className="scroll-mt-20">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <SectionTitle eyebrow="How it works" title="三個步驟，完成一場模擬面試" />
          <ol className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.no} className="bg-card p-8">
                <div className="font-display text-5xl italic text-accent">{s.no}</div>
                <h3 className="mt-6 font-serif text-xl font-bold">{s.title}</h3>
                <p className="mt-3 leading-relaxed text-ink-2">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 功能特色 */}
      <section id="features" className="scroll-mt-20 bg-ink text-paper">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <SectionTitle eyebrow="Features" title="不只出題，更幫你把答案練好" />
          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <article
                key={f.tag}
                className="group rounded-3xl border border-paper/10 p-8 transition hover:border-accent/60 hover:bg-paper/5"
              >
                <span className="rounded-full bg-accent px-3 py-1 text-xs text-white">{f.tag}</span>
                <h3 className="mt-6 font-serif text-2xl font-bold">{f.title}</h3>
                <p className="mt-3 leading-relaxed text-paper/65">{f.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 評分範例 */}
      <section id="sample" className="scroll-mt-20 border-b border-line">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-24 lg:grid-cols-2">
          <div>
            <SectionTitle eyebrow="Sample report" title="結束後，你會拿到這樣一份報告" align="left" />
            <ul className="mt-8 space-y-4 text-ink-2">
              {["整體分數與一段總結", "具體優點與可執行的改進建議", "每一題的點評與示範回答"].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-sage text-[11px] text-paper">
                    ✓
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-line bg-card p-7">
            <div className="text-xs font-medium tracking-[0.2em] text-ink-2">第 1 題・點評</div>
            <p className="mt-3 leading-relaxed">
              有點出使用 TypeScript 的經驗，但缺少實際案例與成果，面試官難以判斷熟練程度。
            </p>
            <div className="mt-6 rounded-2xl bg-sage-soft p-5">
              <div className="text-xs font-medium tracking-[0.2em] text-sage">建議回答方式</div>
              <p className="mt-3 text-sm leading-relaxed">
                在【前公司】負責會員系統時，我發現 API 回傳格式常與前端不一致。我用泛型與 Utility Types
                建立共用型別，並在 CI 加入型別檢查，讓上線後的型別相關錯誤減少了【約 40%】……
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20">
        <div className="mx-auto max-w-3xl px-5 py-24">
          <SectionTitle eyebrow="FAQ" title="常見問題" />
          <div className="mt-12 divide-y divide-line border-y border-line">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-serif text-lg font-bold">
                  {f.q}
                  <span className="text-2xl font-normal text-accent transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 leading-relaxed text-ink-2">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 最後 CTA */}
      <section className="px-5 pb-24">
        <div className="grain mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-accent px-8 py-16 text-center text-white md:py-20">
          <h2 className="font-serif text-4xl font-bold leading-tight md:text-5xl">準備好上場了嗎？</h2>
          <p className="mx-auto mt-4 max-w-md text-white/80">只要一份職缺描述，五分鐘就能完成一場模擬面試。</p>
          <Link
            href="/interview"
            className="mt-9 inline-block rounded-full bg-white px-8 py-3.5 font-medium text-accent transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            立即開始練習 →
          </Link>
        </div>
      </section>
    </main>
  );
}

function SectionTitle({
  eyebrow,
  title,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      <div className="font-display text-lg italic text-accent">{eyebrow}</div>
      <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
    </div>
  );
}
