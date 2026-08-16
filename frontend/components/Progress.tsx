"use client";

import { CountUp } from "./CountUp";

function pct(actual: number, goal?: number | null) {
  if (!goal || goal <= 0) return null;
  return Math.round((actual / goal) * 100);
}

function barWidth(actual: number, goal?: number | null) {
  if (!goal || goal <= 0) return 0;
  return Math.min(100, (actual / goal) * 100);
}

function GoalBar({ width, fill }: { width: number; fill: string }) {
  return (
    <div className="mt-1 h-1.5 w-full rounded-[4px] bg-line">
      <div className={`h-full rounded-[4px] ${fill}`} style={{ width: `${width}%` }} />
    </div>
  );
}

export function NutritionFacts({
  calories,
  protein,
  carbs,
  fat,
  calorieGoal,
  proteinGoal,
  carbsGoal,
  fatGoal,
  title = "Nutrition Facts",
  caption = "Today",
  goalDenomLabel,
  showRing: _showRing = false,
}: {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  calorieGoal?: number | null;
  proteinGoal?: number | null;
  carbsGoal?: number | null;
  fatGoal?: number | null;
  title?: string;
  caption?: string;
  goalDenomLabel?: string;
  showRing?: boolean;
}) {
  const hasGoal = Boolean(calorieGoal || proteinGoal || carbsGoal || fatGoal);
  const calPct = pct(calories, calorieGoal);
  const calOver = calPct !== null && calPct > 100;
  const rows = [
    { label: "Protein", actual: protein, goal: proteinGoal, fill: "bg-[#C43E5A]" },
    { label: "Carbs", actual: carbs, goal: carbsGoal, fill: "bg-[#DE9A2C]" },
    { label: "Fat", actual: fat, goal: fatGoal, fill: "bg-[#4E63C6]" },
  ];

  return (
    <section className="w-full border border-ink bg-surface p-5">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-display text-[20px] leading-none tracking-[-0.03em] text-ink">{title}</p>
        <p className="text-[12px] text-muted">{caption}</p>
      </div>
      <div className="rule-thick mt-3" />
      <div className="py-3">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted">Calories</p>
            <p className="mt-1 font-mono text-[32px] leading-none tabular-nums tracking-tight text-ink">
              <CountUp value={Math.round(calories)} />
            </p>
          </div>
          <div className="min-w-0 pb-0.5 text-right">
            {calorieGoal ? (
              <p className="font-mono text-[12px] tabular-nums text-muted">
                / {Math.round(calorieGoal).toLocaleString()}
                {goalDenomLabel ? <span> {goalDenomLabel}</span> : null}
                {calPct !== null ? (
                  <span className={`ml-2 ${calOver ? "text-protein" : ""}`}>{calPct}%</span>
                ) : null}
              </p>
            ) : (
              <p className="text-[12px] text-muted">Set a goal to compare</p>
            )}
          </div>
        </div>
        <GoalBar width={barWidth(calories, calorieGoal)} fill={calOver ? "bg-[#C43E5A]" : "bg-emerald"} />
      </div>
      <div className="rule-medium" />
      <p className="py-1.5 text-right text-[11px] uppercase tracking-[0.08em] text-muted">% of goal</p>
      <div className="rule-thin" />
      {rows.map((row, i) => {
        const p = pct(row.actual, row.goal);
        return (
          <div key={row.label}>
            <div className="py-2">
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-[14px]">
                  <span className={`h-2 w-2 rounded-full ${row.fill}`} />
                  {row.label}
                </span>
                <span className="flex items-baseline gap-4">
                  <span className="font-mono text-[16px] leading-none tabular-nums">
                    <CountUp value={Math.round(row.actual)} />
                    <span className="ml-0.5 text-[12px] text-muted">g</span>
                  </span>
                  <span className="w-10 text-right font-mono text-[13px] tabular-nums text-muted">
                    {p === null ? "—" : `${p}%`}
                  </span>
                </span>
              </div>
              <GoalBar width={barWidth(row.actual, row.goal)} fill={row.fill} />
            </div>
            {i < rows.length - 1 ? <div className="rule-thin" /> : null}
          </div>
        );
      })}
      {!hasGoal ? <p className="mt-2 text-[13px] text-muted">Set a goal to fill these bars.</p> : null}
    </section>
  );
}
