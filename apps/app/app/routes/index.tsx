import { lazy, Suspense, type ReactElement } from "react";

import { ModeToggle } from "~/components/mode-toggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import type { ChartPoint } from "~/components/ui/chart";

// Charting is large and is not required for first paint.
const BarChart = lazy(() =>
  import("~/components/ui/chart").then(({ BarChart }) => ({ default: BarChart })),
);
const points: ChartPoint[] = [
  { category: "One", series: "Values", value: 3 },
  { category: "Two", series: "Values", value: 5 },
  { category: "Three", series: "Values", value: 4 },
];

/** Introduces the reusable UI foundation. */
export default function IndexPage(): ReactElement {
  return (
    <section className="mx-auto w-full max-w-3xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">UI components</h1>
          <p className="text-sm text-muted-foreground">
            Reusable components live in apps/app/app/components/ui.
          </p>
        </div>
        <ModeToggle />
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Build from the foundation</CardTitle>
          <CardDescription>Replace this page with the product experience.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-60" aria-label="Loading chart" />}>
            <BarChart data={points} label="Example values by category" />
          </Suspense>
        </CardContent>
      </Card>
    </section>
  );
}
