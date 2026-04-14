import { z } from 'zod/v4';

export const createTaskSchema = z.object({
  studentId: z.string().uuid('Wybierz ucznia'),
  lessonId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  title: z.string().min(1, 'Tytuł jest wymagany').max(200),
  description: z.string().min(1, 'Opis jest wymagany').max(5000),
  dueDate: z
    .string()
    .optional()
    .or(z.literal('').transform(() => undefined)),
});

export const gradeTaskSchema = z.object({
  taskId: z.string().uuid(),
  grade: z.coerce.number().int().min(1).max(5),
  tutorFeedback: z
    .string()
    .max(2000)
    .optional()
    .or(z.literal('').transform(() => undefined)),
});

export const submitTaskSchema = z.object({
  taskId: z.string().uuid(),
  textContent: z
    .string()
    .max(10000)
    .optional()
    .or(z.literal('').transform(() => undefined)),
});
