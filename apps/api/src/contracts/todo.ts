import { z } from "zod";

/**
 * TEMPLATE EXAMPLE ONLY. These Notes and Todos contracts demonstrate the
 * repository's API patterns. Replace this whole example slice when the real
 * product contracts are implemented.
 */

export const NoteSummarySchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
});

export const TodoSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  completed: z.boolean(),
  note: NoteSummarySchema.nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateTodoInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  note: z
    .object({
      title: z.string().trim().min(1).max(200),
      body: z.string().max(5_000).optional(),
    })
    .optional(),
});

/** Stable cursor for the todo list's descending `(created_at, id)` ordering. */
export const TodoCursorSchema = z.object({
  created_at: z.string().min(1),
  id: z.number().int().positive(),
});

export const DEFAULT_TODO_PAGE_SIZE = 20;
export const MAX_TODO_PAGE_SIZE = 100;

export const ListTodosInputSchema = z.object({
  completed: z.boolean().optional(),
  search: z.string().trim().min(1).optional(),
  cursor: TodoCursorSchema.optional(),
  limit: z.number().int().min(1).max(MAX_TODO_PAGE_SIZE).default(DEFAULT_TODO_PAGE_SIZE),
});

export const TodoPageSchema = z.object({
  items: z.array(TodoSchema),
  nextCursor: TodoCursorSchema.nullable(),
});

export type Todo = z.infer<typeof TodoSchema>;
export type TodoCursor = z.infer<typeof TodoCursorSchema>;
export type TodoPage = z.infer<typeof TodoPageSchema>;
export type CreateTodoInput = z.infer<typeof CreateTodoInputSchema>;
export type ListTodosInput = z.infer<typeof ListTodosInputSchema>;
