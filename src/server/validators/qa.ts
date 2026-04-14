import { z } from 'zod/v4';

export const createQAThreadSchema = z.object({
  title: z.string().min(1, 'Tytuł jest wymagany').max(200),
  contextType: z.enum(['task', 'lesson', 'general']).default('general'),
  contextId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  firstMessage: z.string().min(1, 'Treść pytania jest wymagana').max(5000),
});

export const createQAMessageSchema = z.object({
  threadId: z.string().uuid(),
  content: z.string().min(1, 'Treść wiadomości jest wymagana').max(5000),
});
