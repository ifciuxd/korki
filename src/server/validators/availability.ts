import { z } from 'zod/v4';

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export const availabilitySlotSchema = z
  .object({
    dayOfWeek: z.coerce.number().int().min(0).max(6),
    startTime: z
      .string()
      .regex(timePattern, 'Godzina w formacie HH:MM (np. 14:30)'),
    endTime: z
      .string()
      .regex(timePattern, 'Godzina w formacie HH:MM (np. 14:30)'),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: 'Godzina zakończenia musi być po rozpoczęciu',
    path: ['endTime'],
  });

export type AvailabilitySlotInput = z.infer<typeof availabilitySlotSchema>;
