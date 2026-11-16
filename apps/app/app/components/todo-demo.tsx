import { CreateTodoInputSchema } from "@cw/shared/todo";
import { Result } from "better-result";
import { useState, type FormEvent, type ReactElement } from "react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { Spinner } from "~/components/ui/spinner";
import { trpc } from "~/lib/trpc";

/** Demonstrates a paginated list, validated optimistic creation, and targeted cache refresh. */
export function TodoDemo(): ReactElement {
  const [title, setTitle] = useState("");
  const [invalidTitle, setInvalidTitle] = useState(false);
  const utils = trpc.useUtils();
  const todos = trpc.listTodos.useInfiniteQuery(
    { limit: 5 },
    {
      getNextPageParam: (page) => page.nextCursor ?? undefined,
    },
  );
  const create = trpc.createTodo.useMutation({
    onSettled: () => Promise.all([utils.listTodos.invalidate(), utils.todoActivity.invalidate()]),
  });
  const items = todos.data?.pages.flatMap((page) => page.items) ?? [];

  /** Validates the browser input with the same contract as the API. */
  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const result = Result.try({
      try: () => CreateTodoInputSchema.parse({ title }),
      catch: () => ({ type: "INVALID_TODO" as const }),
    });
    setInvalidTitle(result.isErr());
    if (result.isErr()) return;
    create.mutate(result.value, {
      onSuccess: () => setTitle((current) => (current === title ? "" : current)),
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Todos</CardTitle>
        <CardDescription>A temporary example using the real API.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
          <Input
            className="h-11"
            aria-label="Todo title"
            aria-invalid={invalidTitle}
            value={title}
            onChange={(event) => setTitle(event.currentTarget.value)}
            placeholder="What needs doing?"
          />
          <Button className="h-11" type="submit" disabled={create.isPending}>
            {create.isPending && <Spinner />} Add todo
          </Button>
        </form>
        {invalidTitle && (
          <p role="alert" className="text-sm text-destructive">
            Enter a title between 1 and 200 characters.
          </p>
        )}
        {create.isError && (
          <p role="alert" className="text-sm text-destructive">
            {create.error.data?.code === "BAD_REQUEST"
              ? "Check the todo title and try again."
              : "Could not add the todo. Please try again."}
          </p>
        )}
        {todos.isPending ? (
          <output className="block">
            <Skeleton className="h-24" />
            <span className="sr-only">Loading todos</span>
          </output>
        ) : !todos.data ? (
          <div role="alert" className="space-y-2 text-sm">
            <p>Could not load todos. Please try again.</p>
            <Button
              className="h-11"
              variant="outline"
              disabled={todos.isFetching}
              onClick={() => void todos.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : (
          <>
            {todos.isError && (
              <div role="alert" className="flex flex-wrap items-center gap-2 text-sm">
                <span>Could not refresh todos. Showing saved results.</span>
                <Button
                  className="h-11"
                  variant="outline"
                  disabled={todos.isFetching}
                  onClick={() =>
                    void (todos.isFetchNextPageError
                      ? todos.fetchNextPage({ cancelRefetch: false })
                      : todos.refetch({ cancelRefetch: false }))
                  }
                >
                  Retry
                </Button>
              </div>
            )}
            {items.length === 0 && !create.isPending ? (
              <p className="text-sm text-muted-foreground">No todos yet. Add one above.</p>
            ) : (
              <ul className="divide-y">
                {create.isPending && (
                  <li aria-busy="true" className="flex items-start justify-between gap-4 py-3">
                    <p className="min-w-0 flex-1 wrap-anywhere">{create.variables.title}</p>
                    <span className="shrink-0 text-sm text-muted-foreground">Saving…</span>
                  </li>
                )}
                {items.map((todo) => (
                  <li key={todo.id} className="flex items-start justify-between gap-4 py-3">
                    <div className="min-w-0 flex-1 wrap-anywhere">
                      <p>{todo.title}</p>
                      {todo.note && (
                        <p className="text-sm text-muted-foreground">Note: {todo.note.title}</p>
                      )}
                    </div>
                    <span className="shrink-0 text-sm text-muted-foreground">
                      {todo.completed ? "Completed" : "Open"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {todos.hasNextPage && (
              <Button
                className="h-11"
                variant="outline"
                disabled={todos.isFetching}
                onClick={() => void todos.fetchNextPage({ cancelRefetch: false })}
              >
                {todos.isFetchingNextPage && <Spinner />} Load more
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
