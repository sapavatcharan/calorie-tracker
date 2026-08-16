"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART, ChartTooltip, chartAxis, chartMargin } from "./chartTheme";

export function GoalComparisonChart({
  data,
}: {
  data: { name: string; goal: number; actual: number; pct: number }[];
}) {
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={chartMargin} barCategoryGap={16}>
          <CartesianGrid stroke={CHART.grid} strokeDasharray="0" vertical={false} strokeWidth={1} />
          <XAxis dataKey="name" {...chartAxis} />
          <YAxis {...chartAxis} width={40} />
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, fontFamily: "var(--font-sans)", color: CHART.muted }} />
          <Bar dataKey="goal" name="Window goal" fill={CHART.grid} animationDuration={400} radius={0} />
          <Bar dataKey="actual" name="Window actual" fill={CHART.emerald} animationDuration={400} radius={0} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
