"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART, ChartTooltip, chartAxis, chartMargin } from "./chartTheme";

export function MicronutrientChart({ data }: { data: Record<string, number> }) {
  const rows = Object.entries(data).map(([name, value]) => ({ name, value }));
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={chartMargin} barCategoryGap={16}>
          <CartesianGrid stroke={CHART.grid} strokeDasharray="0" vertical={false} strokeWidth={1} />
          <XAxis dataKey="name" {...chartAxis} />
          <YAxis {...chartAxis} width={40} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="value" name="Amount" fill={CHART.emerald} animationDuration={400} radius={0} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
