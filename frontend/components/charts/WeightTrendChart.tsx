"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { WeightEntry } from "@/lib/types";
import { CHART, ChartTooltip, chartMargin, chartXAxisDate, fittedDomain } from "./chartTheme";

export function WeightTrendChart({ data }: { data: WeightEntry[] }) {
  const rows = [...data]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((w) => ({ date: w.date.slice(0, 10), weight: w.weight }));
  const domain = fittedDomain(rows.map((r) => r.weight));
  return (
    <div className="h-56 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={chartMargin}>
          <CartesianGrid stroke={CHART.grid} strokeDasharray="0" vertical={false} strokeWidth={1} />
          <XAxis dataKey="date" {...chartXAxisDate} />
          <YAxis domain={domain} width={40} allowDecimals={false} tick={{ fill: CHART.muted, fontSize: 11, fontFamily: "var(--font-sans)" }} axisLine={{ stroke: CHART.grid }} tickLine={{ stroke: CHART.grid }} />
          <Tooltip content={<ChartTooltip />} />
          <Line
            type="monotone"
            dataKey="weight"
            name="Weight"
            stroke={CHART.emerald}
            strokeWidth={1.5}
            dot={false}
            animationDuration={400}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
