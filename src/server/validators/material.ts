import { z } from 'zod/v4';

export const createMaterialSchema = z.object({
  title: z.string().min(1, 'Tytuł jest wymagany').max(200),
  description: z
    .string()
    .max(2000)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  fileUrl: z
    .string()
    .url('Podaj poprawny URL pliku')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  externalUrl: z
    .string()
    .url('Podaj poprawny URL')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  fileType: z
    .string()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  topicSlug: z
    .string()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  isPublic: z.coerce.boolean().default(false),
});

export const assignMaterialSchema = z.object({
  materialId: z.string().uuid(),
  studentId: z.string().uuid('Wybierz ucznia'),
});
