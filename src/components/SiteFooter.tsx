import Link from "next/link";
import Logo from "./Logo";

const COLUMNS = [
  {
    title: "產品",
    links: [
      { href: "/interview", label: "開始練習" },
      { href: "/#how", label: "使用流程" },
      { href: "/#features", label: "功能特色" },
    ],
  },
  {
    title: "資源",
    links: [
      { href: "/#faq", label: "常見問題" },
      { href: "/#sample", label: "評分範例" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-paper-2">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[2fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-ink-2">
            把每一次面試，都當作第二次。用 AI 面試官先演練，正式上場更從容。
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="mb-4 text-xs font-medium tracking-[0.2em] text-ink-2">{col.title}</h3>
            <ul className="space-y-2.5 text-sm">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors hover:text-accent">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-5 text-xs text-ink-2 sm:flex-row sm:justify-between">
          <span>© 2026 Rehearse. All rights reserved.</span>
          <span>Powered by Google Gemini</span>
        </div>
      </div>
    </footer>
  );
}
