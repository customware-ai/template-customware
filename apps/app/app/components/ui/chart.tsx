"use client";

import { barY, defineChart, group } from "@tanstack/charts";
import { Chart } from "@tanstack/charts/react";
import { scaleBand } from "@tanstack/charts/scales/band";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { scaleOrdinal } from "@tanstack/charts/scales/ordinal";
import { tooltip } from "@tanstack/charts/tooltip";
import { useMemo, type ReactElement } from "react";

export interface ChartPoint {
  category: string;
  series: string;
  value: number;
}

/** Displays grouped values with pointer and keyboard inspection. */
export function BarChart({
  data,
  label,
  height = 240,
}: {
  data: ChartPoint[];
  label: string;
  height?: number;
}): ReactElement {
  const definition = useMemo(
    () =>
      defineChart({
        marks: [
          barY(data, {
            x: "category",
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
          scale: () =>
            scaleOrdinal<string, string>().range([
              "var(--chart-1)",
              "var(--chart-2)",
              "var(--chart-3)",
              "var(--chart-4)",
              "var(--chart-5)",
            ]),
        },
        tooltip,
      }),
    [data],
  );
  return <Chart definition={definition} height={height} ariaLabel={label} />;
}
