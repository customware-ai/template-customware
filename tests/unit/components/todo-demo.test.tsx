import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { TodoDemo } from "~/components/todo-demo";

const mock = vi.hoisted(() => ({
  query: {
    isPending: false,
    isError: false,
    isFetchNextPageError: false,
    data: { pages: [{ items: [{ id: 1, title: "Existing todo", completed: false, note: null }] }] },
    hasNextPage: false,
    isFetchingNextPage: false,
    isFetching: false,
    fetchNextPage: vi.fn(),
    refetch: vi.fn(),
  },
  mutation: {
    isPending: false,
    isError: false,
    error: { data: { code: "CONFLICT" }, message: "secret backend detail" },
    variables: { title: "First" },
    mutate: vi.fn(),
  },
  invalidate: vi.fn(),
}));

vi.mock("~/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ listTodos: { invalidate: mock.invalidate } }),
    listTodos: { useInfiniteQuery: () => mock.query },
    createTodo: { useMutation: () => mock.mutation },
  },
}));

describe("TodoDemo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mock.query.isPending = false;
    mock.query.isError = false;
    mock.query.isFetchNextPageError = false;
    mock.query.hasNextPage = false;
    mock.query.isFetchingNextPage = false;
    mock.mutation.isPending = false;
    mock.mutation.isError = false;
    mock.mutation.error.data.code = "CONFLICT";
  });

  it("clears the submitted title only if it has not changed while pending", async () => {
    const user = userEvent.setup();
    const view = render(<TodoDemo />);
    const input = screen.getByRole("textbox", { name: "Todo title" });
    await user.type(input, "First");
    await user.click(screen.getByRole("button", { name: "Add todo" }));
    expect(mock.mutation.mutate).toHaveBeenCalledWith({ title: "First" }, expect.any(Object));
    const callback = mock.mutation.mutate.mock.calls[0][1].onSuccess;
    mock.mutation.isPending = true;
    view.rerender(<TodoDemo />);
    expect(screen.getByRole("button", { name: /Add todo/ })).toBeDisabled();
    expect(screen.getAllByRole("listitem")[0]).toHaveTextContent("FirstSaving…");
    expect(input).toBeEnabled();
    await user.type(input, " more");
    act(() => callback());
    expect(input).toHaveValue("First more");
    mock.mutation.isPending = false;
    view.rerender(<TodoDemo />);
    await user.clear(input);
    await user.type(input, "Second");
    await user.click(screen.getByRole("button", { name: "Add todo" }));
    act(() => mock.mutation.mutate.mock.calls[1][1].onSuccess());
    expect(input).toHaveValue("");
  });

  it("shows fixed feedback for validation and unknown errors", () => {
    mock.mutation.isError = true;
    const view = render(<TodoDemo />);
    for (const [code, message] of [
      ["BAD_REQUEST", "Check the todo title and try again."],
      ["UNKNOWN", "Could not add the todo. Please try again."],
    ]) {
      mock.mutation.error.data.code = code;
      view.rerender(<TodoDemo />);
      expect(screen.getByRole("alert").textContent).toBe(message);
      expect(document.body).not.toHaveTextContent("secret backend detail");
    }
  });
});
