'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { users, studentProfiles } from '@/db/schema';
import { requireRole } from '@/lib/auth/session';
import { createInviteToken, verifyInviteToken } from '@/lib/auth/invite-token';
import { sendInviteEmail } from '@/lib/email/send-invite';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import {
  inviteParentSchema,
  inviteStudentSchema,
  completeRegistrationSchema,
} from '@/server/validators/invitation';

export type ActionState = {
  error?: string;
  success?: boolean;
};

function buildInviteUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  return `${baseUrl}/auth/register?token=${encodeURIComponent(token)}`;
}

export async function inviteParentAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole('admin');

  const parsed = inviteParentSchema.safeParse({
    email: formData.get('email'),
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    phone: formData.get('phone'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Check if user already exists
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1);

  if (existing.length > 0) {
    return { error: 'Użytkownik z tym adresem email już istnieje' };
  }

  const token = await createInviteToken({
    email: parsed.data.email,
    role: 'parent',
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    phone: parsed.data.phone,
  });

  await sendInviteEmail({
    to: parsed.data.email,
    firstName: parsed.data.firstName,
    inviteUrl: buildInviteUrl(token),
    role: 'parent',
  });

  revalidatePath('/admin/parents');
  return { success: true };
}

export async function inviteStudentAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole('admin');

  const parsed = inviteStudentSchema.safeParse({
    email: formData.get('email'),
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    gradeLevel: formData.get('gradeLevel'),
    examTarget: formData.get('examTarget'),
    parentId: formData.get('parentId'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1);

  if (existing.length > 0) {
    return { error: 'Użytkownik z tym adresem email już istnieje' };
  }

  const token = await createInviteToken({
    email: parsed.data.email,
    role: 'student',
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    gradeLevel: parsed.data.gradeLevel,
    examTarget: parsed.data.examTarget,
    parentId: parsed.data.parentId,
  });

  await sendInviteEmail({
    to: parsed.data.email,
    firstName: parsed.data.firstName,
    inviteUrl: buildInviteUrl(token),
    role: 'student',
  });

  revalidatePath('/admin/students');
  return { success: true };
}

/**
 * Completes registration by consuming an invite token, creating the Supabase
 * auth user, and inserting the corresponding row(s) in our DB.
 */
export async function completeRegistrationAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = completeRegistrationSchema.safeParse({
    token: formData.get('token'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    acceptTerms: formData.get('acceptTerms') === 'on',
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const payload = await verifyInviteToken(parsed.data.token);
  if (!payload) {
    return { error: 'Zaproszenie wygasło lub jest nieprawidłowe' };
  }

  // Use service role client to create the auth user (bypasses email confirmation)
  const serviceClient = await createServiceClient();
  const { data: authData, error: authError } =
    await serviceClient.auth.admin.createUser({
      email: payload.email,
      password: parsed.data.password,
      email_confirm: true,
      user_metadata: {
        role: payload.role,
        first_name: payload.firstName,
        last_name: payload.lastName,
      },
    });

  if (authError || !authData.user) {
    return {
      error: authError?.message ?? 'Nie udało się utworzyć konta',
    };
  }

  // Insert into our users table + student_profiles if needed
  try {
    await db.insert(users).values({
      id: authData.user.id,
      email: payload.email,
      role: payload.role,
      firstName: payload.firstName,
      lastName: payload.lastName,
      phone: payload.phone,
    });

    if (payload.role === 'student') {
      await db.insert(studentProfiles).values({
        userId: authData.user.id,
        parentId: payload.parentId,
        gradeLevel: payload.gradeLevel ?? 'Klasa 8',
        examTarget: payload.examTarget ?? 'none',
      });
    }
  } catch (err) {
    // Roll back auth user if DB insert fails
    await serviceClient.auth.admin.deleteUser(authData.user.id);
    return {
      error:
        err instanceof Error
          ? err.message
          : 'Nie udało się zapisać danych użytkownika',
    };
  }

  // Sign in the user immediately so they land on their dashboard
  const supabase = await createClient();
  await supabase.auth.signInWithPassword({
    email: payload.email,
    password: parsed.data.password,
  });

  redirect(`/${payload.role}/dashboard`);
}
