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

export const TODO_ACTIVITY_DAYS = 7;

/** The caller's local midnights for each charted day, followed by the end of today. */
export const TodoActivityInputSchema = z.object({
  dayStarts: z.array(z.iso.datetime()).length(TODO_ACTIVITY_DAYS + 1),
});

export const TodoActivitySchema = z
  .array(z.number().int().nonnegative())
  .length(TODO_ACTIVITY_DAYS);

export type Todo = z.infer<typeof TodoSchema>;
export type TodoPage = z.infer<typeof TodoPageSchema>;
export type ListTodosInput = z.infer<typeof ListTodosInputSchema>;
export type TodoActivityInput = z.infer<typeof TodoActivityInputSchema>;
export type TodoActivity = z.infer<typeof TodoActivitySchema>;
