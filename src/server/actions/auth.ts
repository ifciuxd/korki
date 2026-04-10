'use server';

import { z } from 'zod/v4';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getDashboardPath } from '@/lib/auth/session';
import type { UserRole } from '@/lib/constants';

const loginSchema = z.object({
  email: z.email('Podaj prawidłowy adres email'),
  password: z.string().min(6, 'Hasło musi mieć min. 6 znaków'),
});

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: 'Nieprawidłowy email lub hasło' };
  }

  // Get user role from our users table
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return { error: 'Wystąpił błąd podczas logowania' };
  }

  const [dbUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1);

  if (!dbUser) {
    return { error: 'Konto nie zostało poprawnie skonfigurowane' };
  }

  redirect(getDashboardPath(dbUser.role as UserRole));
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/auth/login');
}
