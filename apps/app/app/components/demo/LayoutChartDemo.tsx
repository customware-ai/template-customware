"use client";

import { barY, defineChart, group } from "@tanstack/charts";
import { Chart } from "@tanstack/charts/react";
import { scaleBand } from "@tanstack/charts/scales/band";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { scaleOrdinal } from "@tanstack/charts/scales/ordinal";
import { tooltip } from "@tanstack/charts/tooltip";
import type { ReactElement } from "react";

import { chartData } from "~/components/demo/shared";

const series = chartData.flatMap(({ stage, velocity, quality }) => [
  { stage, series: "Velocity", value: velocity },
  { stage, series: "Confidence", value: quality },
]);

const chart = defineChart({
  marks: [
    barY(series, {
      x: "stage",
      y: "value",
      color: "series",
      layout: group({ padding: 0.1 }),
      radius: 6,
    }),
  ],
  scales: {
    x: { scale: () => scaleBand<string>().padding(0.2) },
    y: { scale: scaleLinear, nice: true, grid: true },
  },
  color: {
    scale: () => scaleOrdinal<string, string>().range(["var(--primary)", "var(--chart-2)"]),
  },
  tooltip,
});

/** Render the example chart with keyboard and pointer interaction. */
export function LayoutChartDemo(): ReactElement {
  return <Chart definition={chart} height={320} ariaLabel="Velocity and confidence by stage" />;
}
