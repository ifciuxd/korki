import { z } from 'zod/v4';

export const createLessonSchema = z
  .object({
    studentId: z.string().uuid('Wybierz ucznia'),
    date: z.string().min(1, 'Wybierz datę'),
    startTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, 'Podaj godzinę w formacie HH:MM'),
    endTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, 'Podaj godzinę w formacie HH:MM'),
  })
  .refine(
    (data) => data.startTime < data.endTime,
    {
      message: 'Godzina zakończenia musi być po godzinie rozpoczęcia',
      path: ['endTime'],
    },
  );

export const updateLessonStatusSchema = z.object({
  lessonId: z.string().uuid(),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']),
  cancellationReason: z.string().optional(),
});

export const lessonReportSchema = z.object({
  lessonId: z.string().uuid(),
  rawNotes: z
    .string()
    .max(5000)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  topicsCovered: z.string().optional(), // comma-separated, parsed on server
  homeworkAssigned: z
    .string()
    .max(2000)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  studentPerformance: z.coerce
    .number()
    .int()
    .min(1)
    .max(5)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  notesForParent: z
    .string()
    .max(2000)
    .optional()
    .or(z.literal('').transform(() => undefined)),
});
