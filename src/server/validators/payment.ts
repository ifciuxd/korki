import { z } from 'zod/v4';

export const recordManualPaymentSchema = z.object({
  parentId: z.string().uuid('Wybierz rodzica'),
  studentId: z.string().uuid('Wybierz ucznia'),
  packageId: z.string().uuid('Wybierz pakiet'),
  description: z.string().max(500).optional(),
});

export const buyPackageSchema = z.object({
  packageId: z.string().uuid('Wybierz pakiet'),
  studentId: z.string().uuid('Wybierz dziecko'),
});
