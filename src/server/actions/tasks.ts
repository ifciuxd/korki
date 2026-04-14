'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { tasks, taskSubmissions } from '@/db/schema';
import { requireRole, requireAuth } from '@/lib/auth/session';
import { createTaskSchema, gradeTaskSchema, submitTaskSchema } from '@/server/validators/task';
import type { ActionState } from './invitations';

export async function createTaskAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole('admin');

  const parsed = createTaskSchema.safeParse({
    studentId: formData.get('studentId'),
    lessonId: formData.get('lessonId'),
    title: formData.get('title'),
    description: formData.get('description'),
    dueDate: formData.get('dueDate'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { studentId, lessonId, title, description, dueDate } = parsed.data;

  await db.insert(tasks).values({
    studentId,
    lessonId: lessonId ?? null,
    title,
    description,
    dueDate: dueDate ? new Date(dueDate) : null,
    status: 'todo',
  });

  revalidatePath('/admin/tasks');
  revalidatePath('/student/tasks');
  return { success: true };
}

export async function gradeTaskAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole('admin');

  const parsed = gradeTaskSchema.safeParse({
    taskId: formData.get('taskId'),
    grade: formData.get('grade'),
    tutorFeedback: formData.get('tutorFeedback'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await db
    .update(tasks)
    .set({
      grade: parsed.data.grade,
      tutorFeedback: parsed.data.tutorFeedback ?? null,
      status: 'graded',
    })
    .where(eq(tasks.id, parsed.data.taskId));

  revalidatePath('/admin/tasks');
  revalidatePath('/student/tasks');
  return { success: true };
}

export async function returnTaskAction(
  taskId: string,
): Promise<ActionState> {
  await requireRole('admin');

  await db
    .update(tasks)
    .set({ status: 'returned' })
    .where(eq(tasks.id, taskId));

  revalidatePath('/admin/tasks');
  revalidatePath('/student/tasks');
  return { success: true };
}

export async function submitTaskAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAuth();

  const parsed = submitTaskSchema.safeParse({
    taskId: formData.get('taskId'),
    textContent: formData.get('textContent'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await db.insert(taskSubmissions).values({
    taskId: parsed.data.taskId,
    textContent: parsed.data.textContent ?? null,
    fileUrls: [],
  });

  // Update task status to submitted
  await db
    .update(tasks)
    .set({ status: 'submitted' })
    .where(eq(tasks.id, parsed.data.taskId));

  revalidatePath('/student/tasks');
  revalidatePath('/admin/tasks');
  return { success: true };
}
