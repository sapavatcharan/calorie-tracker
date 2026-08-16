export function SectionHeading({
  eyebrow,
  title,
  className = "",
  actions,
}: {
  eyebrow?: string;
  title: string;
  accent?: "emerald" | "protein" | "carbs" | "fat" | "ink";
  className?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className={`mb-4 flex flex-wrap items-end justify-between gap-2 border-b border-line pb-2 ${className}`}>
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.08em] text-muted">{eyebrow}</p>
        ) : null}
        <h2 className="font-display text-[16px] font-semibold tracking-[-0.02em] text-ink">{title}</h2>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
