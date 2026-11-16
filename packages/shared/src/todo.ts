import { z } from "zod";

export const CreateTodoInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  note: z
    .object({
      title: z.string().trim().min(1).max(200),
      body: z.string().max(5_000).optional(),
    })
    .optional(),
});

export type CreateTodoInput = z.infer<typeof CreateTodoInputSchema>;
