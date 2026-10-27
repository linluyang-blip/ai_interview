import Link from "next/link";
import Logo from "./Logo";

const NAV = [
  { href: "/#how", label: "使用流程" },
  { href: "/#features", label: "功能特色" },
  { href: "/#faq", label: "常見問題" },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-ink-2 md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="transition-colors hover:text-ink">
              {n.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/interview"
          className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper transition hover:bg-accent"
        >
          開始練習 →
        </Link>
      </div>
    </header>
  );
}
