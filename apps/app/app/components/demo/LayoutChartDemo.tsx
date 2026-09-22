"use client";

/**
 * TEMPLATE EXAMPLE ONLY. Use this file to learn the shipped UI patterns, then
 * remove it with the demo surface when the real product UI replaces it.
 */
import { type ReactElement } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { chartConfig, chartData } from "~/components/demo/shared";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "~/components/ui/chart";

export function LayoutChartDemo(): ReactElement {
  return (
    <ChartContainer config={chartConfig} className="h-[320px] min-w-0 w-full">
      <BarChart
        accessibilityLayer
        data={chartData}
        margin={{ top: 8, right: 8, bottom: 0, left: 8 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis dataKey="stage" tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="velocity" fill="var(--color-velocity)" radius={6} isAnimationActive={false} />
        <Bar dataKey="quality" fill="var(--color-quality)" radius={6} isAnimationActive={false} />
      </BarChart>
    </ChartContainer>
  );
}
