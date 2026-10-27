import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-full bg-ink text-paper transition-transform group-hover:-rotate-12">
        <span className="font-display text-lg italic leading-none">R</span>
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-xl tracking-tight">Rehearse</span>
        <span className="mt-0.5 text-[10px] tracking-[0.3em] text-ink-2">AI 面試演練</span>
      </span>
    </Link>
  );
}
