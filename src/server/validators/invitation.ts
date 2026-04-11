import { z } from 'zod/v4';

export const inviteParentSchema = z.object({
  email: z.email('Podaj prawidłowy adres email'),
  firstName: z.string().min(1, 'Imię jest wymagane').max(100),
  lastName: z.string().min(1, 'Nazwisko jest wymagane').max(100),
  phone: z
    .string()
    .max(20)
    .optional()
    .or(z.literal('').transform(() => undefined)),
});

export type InviteParentInput = z.infer<typeof inviteParentSchema>;

export const inviteStudentSchema = z.object({
  email: z.email('Podaj prawidłowy adres email'),
  firstName: z.string().min(1, 'Imię jest wymagane').max(100),
  lastName: z.string().min(1, 'Nazwisko jest wymagane').max(100),
  gradeLevel: z.string().min(1, 'Wybierz klasę'),
  examTarget: z.enum([
    'none',
    'egzamin8',
    'matura_podstawowa',
    'matura_rozszerzona',
  ]),
  parentId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal('').transform(() => undefined)),
});

export type InviteStudentInput = z.infer<typeof inviteStudentSchema>;

export const completeRegistrationSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, 'Hasło musi mieć minimum 8 znaków'),
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, {
      message: 'Musisz zaakceptować regulamin',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Hasła nie są zgodne',
    path: ['confirmPassword'],
  });

export type CompleteRegistrationInput = z.infer<
  typeof completeRegistrationSchema
>;
