import { z } from 'zod/v4';

export const packageSchema = z.object({
  name: z.string().min(1, 'Nazwa pakietu jest wymagana').max(200),
  description: z
    .string()
    .max(500)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  hoursIncluded: z.coerce
    .number()
    .int()
    .min(1, 'Minimum 1 godzina')
    .max(100),
  priceCents: z.coerce
    .number()
    .int()
    .min(100, 'Minimalna cena to 1 zł'),
  validityDays: z.coerce
    .number()
    .int()
    .min(7, 'Minimum 7 dni ważności')
    .max(365),
  displayOrder: z.coerce.number().int().min(0).default(0),
});

export type PackageFormData = z.infer<typeof packageSchema>;
