"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART, ChartTooltip, chartAxis, chartMargin } from "./chartTheme";

export function MacroChart({ data }: { data: { period: string; protein: number; carbs: number; fat: number }[] }) {
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={chartMargin} barCategoryGap={12}>
          <CartesianGrid stroke={CHART.grid} strokeDasharray="0" vertical={false} strokeWidth={1} />
          <XAxis dataKey="period" {...chartAxis} />
          <YAxis {...chartAxis} width={40} />
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, fontFamily: "var(--font-sans)", color: CHART.muted }} />
          <Bar dataKey="protein" name="Protein" stackId="m" fill={CHART.protein} radius={0} animationDuration={400} />
          <Bar dataKey="carbs" name="Carbs" stackId="m" fill={CHART.carbs} animationDuration={400} />
          <Bar dataKey="fat" name="Fat" stackId="m" fill={CHART.fat} radius={0} animationDuration={400} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
