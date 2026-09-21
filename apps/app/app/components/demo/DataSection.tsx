"use client";

import { type ReactElement } from "react";

import { Section, ShowcaseCard } from "~/components/demo/shared";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";
import { trpc } from "~/lib/trpc";

const ESTIMATE_QUERY_INPUT = { limit: 5 } as const;

/** Demonstrates typed cursor pagination, mutation, and focused cache invalidation. */
export function DataSection(): ReactElement {
  const utils = trpc.useUtils();
  const estimates = trpc.listEstimates.useInfiniteQuery(ESTIMATE_QUERY_INPUT, {
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 30_000,
  });
  const createEstimate = trpc.createEstimate.useMutation({
    onSuccess: async () => {
      await utils.listEstimates.invalidate(ESTIMATE_QUERY_INPUT);
    },
  });
  const items = estimates.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <Section
      title="Typed server state"
      description="tRPC and TanStack Query with bounded cursor pagination and cache reconciliation."
    >
      <ShowcaseCard
        title="Estimate query"
        description="Cached data stays visible while background refreshes run."
      >
        {estimates.isPending ? (
          <p className="text-sm text-muted-foreground">Loading estimates…</p>
        ) : estimates.isError ? (
          <div className="space-y-3">
            <p className="text-sm text-destructive">Estimates could not be loaded.</p>
            <Button variant="outline" onClick={() => void estimates.refetch()}>
              Retry
            </Button>
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No estimates yet.</p>
        ) : (
          <ul className="grid gap-2 text-sm">
            {items.map((estimate) => (
              <li key={estimate.id} className="rounded-lg border border-border px-3 py-2">
                <span className="font-medium">{estimate.estimate_number}</span>
                <span className="ml-2 text-muted-foreground">{estimate.project_name}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={createEstimate.isPending}
            onClick={() =>
              createEstimate.mutate({
                estimate_number: `DEMO-${Date.now()}`,
                account_name: "Template account",
                project_name: "Typed API example",
                workflow_stage: "Draft",
                item_count: 1,
                total_value: 1_000,
                margin_percent: 25,
              })
            }
          >
            {createEstimate.isPending && <Spinner />}
            {createEstimate.isPending ? "Creating estimate" : "Create sample estimate"}
          </Button>
          {estimates.hasNextPage && (
            <Button
              variant="outline"
              disabled={estimates.isFetchingNextPage}
              onClick={() => void estimates.fetchNextPage()}
            >
              {estimates.isFetchingNextPage && <Spinner />}
              {estimates.isFetchingNextPage ? "Loading more" : "Load more"}
            </Button>
          )}
        </div>
        {createEstimate.isError && (
          <p className="text-sm text-destructive">The estimate could not be created.</p>
        )}
      </ShowcaseCard>
    </Section>
  );
}
