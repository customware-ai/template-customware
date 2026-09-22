"use client";

import { type ReactElement } from "react";

import { Section, ShowcaseCard } from "~/components/demo/shared";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";
import { trpc } from "~/lib/trpc";

/**
 * TEMPLATE EXAMPLE ONLY. This Notes and Todos panel demonstrates typed server
 * state. Remove it with the rest of the demo when the product UI replaces it.
 */

const TODO_QUERY_INPUT = { limit: 5 } as const;

export function DataSection(): ReactElement {
  const utils = trpc.useUtils();
  const todos = trpc.listTodos.useInfiniteQuery(TODO_QUERY_INPUT, {
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 30_000,
  });
  const createTodo = trpc.createTodo.useMutation({
    onSuccess: (createdTodo) => {
      utils.listTodos.setInfiniteData(TODO_QUERY_INPUT, (current) => {
        const firstPage = current?.pages[0];
        if (!current || !firstPage) return current;

        const combined = [
          createdTodo,
          ...firstPage.items.filter((todo) => todo.id !== createdTodo.id),
        ];
        const items = combined.slice(0, TODO_QUERY_INPUT.limit);
        const lastItem = items.at(-1);
        const nextCursor =
          (combined.length > TODO_QUERY_INPUT.limit || firstPage.nextCursor) && lastItem
            ? { created_at: lastItem.created_at, id: lastItem.id }
            : null;

        return {
          ...current,
          pages: [{ ...firstPage, items, nextCursor }, ...current.pages.slice(1)],
        };
      });
    },
    onSettled: async () => {
      await utils.listTodos.invalidate(TODO_QUERY_INPUT);
    },
  });
  const items = todos.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <Section
      title="Typed server state"
      description="tRPC and TanStack Query with bounded cursor pagination and cache reconciliation."
    >
      <ShowcaseCard
        title="Notes and Todos query"
        description="Cached data stays visible while background refreshes run."
      >
        {todos.isPending ? (
          <p className="text-sm text-muted-foreground">Loading todos…</p>
        ) : todos.isError ? (
          <div className="space-y-3">
            <p className="text-sm text-destructive">Todos could not be loaded.</p>
            <Button variant="outline" onClick={() => void todos.refetch()}>
              Retry
            </Button>
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No todos yet.</p>
        ) : (
          <ul className="grid gap-2 text-sm">
            {items.map((todo) => (
              <li key={todo.id} className="rounded-lg border border-border px-3 py-2">
                <span className="font-medium">{todo.title}</span>
                {todo.note && (
                  <span className="ml-2 text-muted-foreground">Note: {todo.note.title}</span>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={createTodo.isPending}
            onClick={() =>
              createTodo.mutate({
                title: `Review the demo patterns ${Date.now()}`,
                note: {
                  title: "Template example",
                  body: "Replace this sample with the real product domain.",
                },
              })
            }
          >
            {createTodo.isPending && <Spinner />}
            {createTodo.isPending ? "Creating todo" : "Create sample todo"}
          </Button>
          {todos.hasNextPage && (
            <Button
              variant="outline"
              disabled={todos.isFetchingNextPage}
              onClick={() => void todos.fetchNextPage()}
            >
              {todos.isFetchingNextPage && <Spinner />}
              {todos.isFetchingNextPage ? "Loading more" : "Load more"}
            </Button>
          )}
        </div>
        {createTodo.isError && (
          <p className="text-sm text-destructive">The todo could not be created.</p>
        )}
      </ShowcaseCard>
    </Section>
  );
}
