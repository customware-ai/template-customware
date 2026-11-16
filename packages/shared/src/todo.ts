import { z } from "zod/mini";

const TitleSchema = z.string().check(z.trim(), z.minLength(1), z.maxLength(200));

export const CreateTodoInputSchema = z.object({
  title: TitleSchema,
  note: z.optional(
    z.object({
      title: TitleSchema,
      body: z.optional(z.string().check(z.maxLength(5_000))),
    }),
  ),
});

export type CreateTodoInput = z.infer<typeof CreateTodoInputSchema>;
