'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { qaThreads, qaMessages } from '@/db/schema';
import { requireAuth } from '@/lib/auth/session';
import { getStudentProfileIdByUserId } from '@/db/queries/student-session';
import { createQAThreadSchema, createQAMessageSchema } from '@/server/validators/qa';
import type { ActionState } from './invitations';

export async function createQAThreadAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuth();

  const parsed = createQAThreadSchema.safeParse({
    title: formData.get('title'),
    contextType: formData.get('contextType') ?? 'general',
    contextId: formData.get('contextId'),
    firstMessage: formData.get('firstMessage'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Get student profile ID
  let studentId: string | null = null;
  if (session.role === 'student') {
    studentId = await getStudentProfileIdByUserId(session.userId);
  } else if (session.role === 'admin') {
    // Admin creating on behalf — studentId from form
    studentId = (formData.get('studentId') as string) ?? null;
  }

  if (!studentId) {
    return { error: 'Nie znaleziono profilu ucznia' };
  }

  const { title, contextType, contextId, firstMessage } = parsed.data;

  const [thread] = await db
    .insert(qaThreads)
    .values({
      studentId,
      title,
      contextType,
      contextId: contextId ?? null,
    })
    .returning({ id: qaThreads.id });

  // Insert the first message
  await db.insert(qaMessages).values({
    threadId: thread.id,
    authorId: session.userId,
    content: firstMessage,
  });

  revalidatePath('/student/qa');
  revalidatePath('/admin/qa');
  return { success: true };
}

export async function sendQAMessageAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuth();

  const parsed = createQAMessageSchema.safeParse({
    threadId: formData.get('threadId'),
    content: formData.get('content'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await db.insert(qaMessages).values({
    threadId: parsed.data.threadId,
    authorId: session.userId,
    content: parsed.data.content,
  });

  // Update last_message_at
  await db
    .update(qaThreads)
    .set({ lastMessageAt: new Date() })
    .where(eq(qaThreads.id, parsed.data.threadId));

  revalidatePath('/student/qa');
  revalidatePath('/admin/qa');
  return { success: true };
}

export async function resolveQAThreadAction(
  threadId: string,
): Promise<ActionState> {
  await requireAuth();

  await db
    .update(qaThreads)
    .set({ isResolved: true })
    .where(eq(qaThreads.id, threadId));

  revalidatePath('/student/qa');
  revalidatePath('/admin/qa');
  return { success: true };
}

export async function reopenQAThreadAction(
  threadId: string,
): Promise<ActionState> {
  await requireAuth();

  await db
    .update(qaThreads)
    .set({ isResolved: false })
    .where(eq(qaThreads.id, threadId));

  revalidatePath('/student/qa');
  revalidatePath('/admin/qa');
  return { success: true };
}
