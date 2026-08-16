import type { LucideIcon } from "lucide-react";

export function PageTitle({
  children,
}: {
  children: React.ReactNode;
  icon?: LucideIcon;
}) {
  return <h1 className="font-display text-[22px] font-semibold tracking-[-0.02em] text-ink">{children}</h1>;
}
