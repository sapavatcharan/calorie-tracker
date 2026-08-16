"use client";

import { MEAL_SECTION_ORDER, MEAL_TYPE_LABEL } from "@/lib/types";
import type { Meal, MealType } from "@/lib/types";
import { formatDate, formatNumber } from "@/lib/dates";
import { Button } from "./ui/Button";
import { EmptyState } from "./ui/EmptyState";
import { MealTypeBadge } from "./ui/Badge";

const DOT: Record<MealType, string> = {
  BREAKFAST: "bg-[#DE9A2C]",
  LUNCH: "bg-emerald",
  DINNER: "bg-fat",
  SNACKS: "bg-protein",
};

export function groupMealsByType(meals: Meal[]) {
  return MEAL_SECTION_ORDER.map((type) => ({
    type,
    items: meals.filter((m) => m.mealType === type),
  })).filter((g) => g.items.length > 0);
}

function macrosMissing(m: Meal) {
  const p = m.protein;
  const c = m.carbs;
  const f = m.fat;
  if (p == null && c == null && f == null) return true;
  return (p ?? 0) === 0 && (c ?? 0) === 0 && (f ?? 0) === 0;
}

export function MealMacros({ meal }: { meal: Meal }) {
  if (macrosMissing(meal)) {
    return <span className="font-mono text-[13px] text-muted">—</span>;
  }
  return (
    <span className="font-mono text-[13px] tabular-nums text-muted">
      <span className="text-protein">{formatNumber(meal.protein ?? 0)}</span>/
      <span className="text-carbs">{formatNumber(meal.carbs ?? 0)}</span>/
      <span className="text-fat">{formatNumber(meal.fat ?? 0)}</span>
    </span>
  );
}

function microsLine(m: Meal) {
  const micro = m.micronutrients;
  if (!micro || Object.keys(micro).length === 0) return null;
  return Object.entries(micro)
    .map(([k, v]) => `${k} ${v}`)
    .join(" · ");
}

export function MealGroupHeader({ type, items }: { type: MealType; items: Meal[] }) {
  const kcal = Math.round(items.reduce((s, m) => s + m.calories, 0));
  const n = items.length;
  return (
    <div className="mb-2 flex items-baseline justify-between gap-3 border-b border-line pb-2">
      <p className="flex min-w-0 items-center gap-2 text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT[type]}`} />
        <span className="truncate">{MEAL_TYPE_LABEL[type]}</span>
      </p>
      <p className="shrink-0 font-mono text-[12px] tabular-nums text-muted">
        {n} item{n === 1 ? "" : "s"} · {formatNumber(kcal)} kcal
      </p>
    </div>
  );
}

export function MealList({
  meals,
  onEdit,
  onDelete,
}: {
  meals: Meal[];
  onEdit: (meal: Meal) => void;
  onDelete: (meal: Meal) => void;
}) {
  if (meals.length === 0) {
    return <EmptyState title="No meals yet. Log your first one." hint="Extract from a photo or import a PDF." />;
  }

  const groups = groupMealsByType(meals);

  return (
    <>
      <div className="hidden space-y-6 overflow-x-auto md:block">
        {groups.map((g) => (
          <div key={g.type}>
            <MealGroupHeader type={g.type as MealType} items={g.items} />
            <table className="w-full text-left text-[14px]">
              <thead>
                <tr className="border-b border-line text-muted">
                  <th className="py-2 pr-3 text-left text-[12px] font-medium">Food</th>
                  <th className="w-20 py-2 pr-3 text-right text-[12px] font-medium">Cal</th>
                  <th className="w-28 py-2 pr-3 text-right text-[12px] font-medium">P / C / F</th>
                  <th className="w-28 py-2 pr-3 text-right text-[12px] font-medium">Date</th>
                  <th className="w-36 py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {g.items.map((m) => (
                  <tr key={m.id} className="border-b border-line last:border-0 hover:bg-inset">
                    <td className="py-2 pr-3">
                      <span className="font-medium text-ink">{m.foodName}</span>
                      {microsLine(m) ? <p className="text-[12px] text-muted">{microsLine(m)}</p> : null}
                    </td>
                    <td className="py-2 pr-3 text-right font-mono tabular-nums">{formatNumber(m.calories)}</td>
                    <td className="py-2 pr-3 text-right">
                      <MealMacros meal={m} />
                    </td>
                    <td className="py-2 pr-3 text-right text-[12px] text-muted">{formatDate(m.date)}</td>
                    <td className="py-2 text-right">
                      <Button type="button" variant="ghost" className="px-2" onClick={() => onEdit(m)}>
                        Edit
                      </Button>
                      <Button type="button" variant="ghost" className="px-2 text-protein" onClick={() => onDelete(m)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
      <div className="space-y-6 md:hidden">
        {groups.map((g) => (
          <div key={g.type}>
            <MealGroupHeader type={g.type as MealType} items={g.items} />
            <ul className="divide-y divide-line">
              {g.items.map((m) => (
                <li key={m.id} className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{m.foodName}</p>
                      <div className="mt-1">
                        <MealTypeBadge type={m.mealType} label={MEAL_TYPE_LABEL[m.mealType]} />
                      </div>
                    </div>
                    <p className="font-mono text-[16px] tabular-nums">{formatNumber(m.calories)}</p>
                  </div>
                  <div className="mt-2">
                    {macrosMissing(m) ? (
                      <p className="font-mono text-[13px] text-muted">—</p>
                    ) : (
                      <p className="font-mono text-[13px] tabular-nums text-muted">
                        <span className="text-protein">{formatNumber(m.protein ?? 0)}g P</span>
                        {" · "}
                        <span className="text-carbs">{formatNumber(m.carbs ?? 0)}g C</span>
                        {" · "}
                        <span className="text-fat">{formatNumber(m.fat ?? 0)}g F</span>
                      </p>
                    )}
                  </div>
                  {microsLine(m) ? <p className="mt-1 text-[12px] text-muted">{microsLine(m)}</p> : null}
                  <p className="mt-1 text-[12px] text-muted">{formatDate(m.date)}</p>
                  <div className="mt-3 flex gap-2">
                    <Button type="button" variant="ghost" onClick={() => onEdit(m)}>
                      Edit
                    </Button>
                    <Button type="button" variant="ghost" className="text-protein" onClick={() => onDelete(m)}>
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}
