"use client";

export const CHART = {
  protein: "#C43E5A",
  carbs: "#DE9A2C",
  fat: "#4E63C6",
  emerald: "#147A52",
  emeraldSoft: "#E7F1EB",
  grid: "#E5E7EB",
  ink: "#171717",
  muted: "#737373",
};

export const chartAxis = {
  tick: { fill: CHART.muted, fontSize: 11, fontFamily: "var(--font-sans)" },
  axisLine: { stroke: CHART.grid, strokeWidth: 1 },
  tickLine: { stroke: CHART.grid, strokeWidth: 1 },
};

export const chartMargin = { top: 8, right: 12, left: 0, bottom: 8 };

export function fittedDomain(values: number[], pad = 2): [number, number] {
  const nums = values.filter((n) => Number.isFinite(n));
  if (!nums.length) return [0, 10];
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const span = max - min;
  const padding = span < 0.5 ? pad : Math.max(pad, span * 0.1);
  const lo = Math.floor(min - padding);
  const hi = Math.ceil(max + padding);
  if (lo === hi) return [lo - pad, hi + pad];
  return [lo, hi];
}

export function shortDateTick(value: string | number) {
  const raw = String(value);
  const d = new Date(raw.length <= 10 ? `${raw}T00:00:00` : raw);
  if (Number.isNaN(d.getTime())) return raw.slice(5, 10) || raw;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export const chartXAxisDate = {
  ...chartAxis,
  tick: { ...chartAxis.tick, fontSize: 11 },
  interval: "preserveStartEnd" as const,
  minTickGap: 16,
  tickFormatter: shortDateTick,
  height: 32,
};

type TooltipItem = { dataKey?: string | number; name?: string; value?: number | string };

export function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipItem[];
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[8px] border border-line bg-surface px-3 py-2">
      <p className="mb-1 text-[12px] text-muted">{label}</p>
      {payload.map((p) => (
        <p key={String(p.dataKey)} className="font-mono text-[12px] tabular-nums text-ink">
          <span className="mr-2 text-muted">{p.name}</span>
          {typeof p.value === "number" ? Math.round(p.value) : p.value}
        </p>
      ))}
    </div>
  );
}
