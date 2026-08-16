import Link from "next/link";
import { APP_NAME } from "@/lib/brand";

export function BrandMark({ size = 20 }: { size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-[6px] bg-emerald text-white"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="13" r="6.25" stroke="currentColor" strokeWidth="1.75" />
        <path d="M8 13c0-1.4 1.2-2.4 2.6-2.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M16.5 4.5v6.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        <path d="M18.2 4.5v4.2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function BrandLockup({
  href,
  size = "md",
}: {
  href?: string;
  size?: "sm" | "md";
}) {
  const word = (
    <span className="flex items-center gap-2">
      <BrandMark size={size === "sm" ? 18 : 20} />
      <span className="font-display text-[15px] font-semibold tracking-[-0.03em] text-ink">{APP_NAME}</span>
    </span>
  );
  if (!href) return word;
  return (
    <Link href={href} className="inline-flex items-center">
      {word}
    </Link>
  );
}
