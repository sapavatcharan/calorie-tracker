export function Card({
  children,
  className = "",
  accent: _accent,
}: {
  children: React.ReactNode;
  className?: string;
  accent?: "emerald" | "protein" | "carbs" | "fat";
}) {
  return <div className={`rounded-[8px] border border-line bg-surface p-5 ${className}`}>{children}</div>;
}
