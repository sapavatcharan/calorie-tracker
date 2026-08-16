import type { MealType } from "@/lib/types";

const DOT: Record<MealType, string> = {
  BREAKFAST: "bg-[#DE9A2C]",
  LUNCH: "bg-emerald",
  DINNER: "bg-fat",
  SNACKS: "bg-protein",
};

export function MealTypeBadge({ type, label }: { type: MealType; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-muted">
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[type]}`} />
      {label}
    </span>
  );
}
