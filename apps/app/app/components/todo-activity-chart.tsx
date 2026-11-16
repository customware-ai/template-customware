import { lazy, Suspense, useState, type ReactElement } from "react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { trpc } from "~/lib/trpc";

// PERF: charting is large and is not required for first paint.
const BarChart = lazy(() =>
  import("~/components/ui/chart").then(({ BarChart }) => ({ default: BarChart })),
);

const loading = <Skeleton className="h-60" aria-label="Loading chart" />;

/** Returns local midnights for the last seven days plus the next midnight, so DST days keep their real length. */
function lastSevenDays(): Date[] {
  const now = new Date();
  return Array.from(
    { length: 8 },
    (_, index) => new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6 + index),
  );
}

/** Charts todos added per local day for the last week. */
export function TodoActivityChart(): ReactElement {
  const [days] = useState(lastSevenDays);
  const activity = trpc.todoActivity.useQuery({
    dayStarts: days.map((day) => day.toISOString()),
  });
  const retry = (
    <Button
      className="h-11"
      variant="outline"
      disabled={activity.isFetching}
      onClick={() => void activity.refetch()}
    >
      Retry
    </Button>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Todos added</CardTitle>
        <CardDescription>Per day for the last 7 days.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activity.isPending ? (
          loading
        ) : !activity.data ? (
          <div role="alert" className="space-y-2 text-sm">
            <p>Could not load activity. Please try again.</p>
            {retry}
          </div>
        ) : (
          <>
            {activity.isError && (
              <div role="alert" className="flex flex-wrap items-center gap-2 text-sm">
                <span>Could not refresh activity. Showing saved results.</span>
                {retry}
              </div>
            )}
            <Suspense fallback={loading}>
              <BarChart
                label="Todos added per day for the last 7 days"
                data={activity.data.map((count, index) => ({
                  category: days[index].toLocaleDateString(undefined, { weekday: "short" }),
                  series: "Todos added",
                  value: count,
                }))}
              />
            </Suspense>
          </>
        )}
      </CardContent>
    </Card>
  );
}
