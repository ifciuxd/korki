'use server';

import { revalidatePath } from 'next/cache';
import { eq, and, gt, gte } from 'drizzle-orm';
import { db } from '@/db/client';
import { lessons, lessonReports, purchases } from '@/db/schema';
import { requireRole, requireAuth } from '@/lib/auth/session';
import { createLessonSchema, lessonReportSchema } from '@/server/validators/lesson';
import { CANCELLATION_DEADLINE_HOURS } from '@/lib/constants';
import type { ActionState } from './invitations';

export async function createLessonAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole('admin');

  const parsed = createLessonSchema.safeParse({
    studentId: formData.get('studentId'),
    date: formData.get('date'),
    startTime: formData.get('startTime'),
    endTime: formData.get('endTime'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { studentId, date, startTime, endTime } = parsed.data;

  const startDateTime = new Date(`${date}T${startTime}:00+02:00`);
  const endDateTime = new Date(`${date}T${endTime}:00+02:00`);

  if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
    return { error: 'Nieprawidłowa data lub godzina' };
  }

  // Find a valid purchase for this student to link
  const now = new Date();
  const [activePurchase] = await db
    .select({ id: purchases.id, hoursRemaining: purchases.hoursRemaining })
    .from(purchases)
    .where(
      and(
        eq(purchases.studentId, studentId),
        gt(purchases.hoursRemaining, 0),
        gte(purchases.validUntil, now),
      ),
    )
    .limit(1);

  await db.insert(lessons).values({
    studentId,
    startTime: startDateTime,
    endTime: endDateTime,
    status: 'scheduled',
    purchaseId: activePurchase?.id ?? null,
  });

  // If linked to a purchase, decrement hours
  if (activePurchase) {
    await db
      .update(purchases)
      .set({ hoursRemaining: activePurchase.hoursRemaining - 1 })
      .where(eq(purchases.id, activePurchase.id));
  }

  revalidatePath('/admin/calendar');
  revalidatePath('/admin/dashboard');
  return { success: true };
}

export async function updateLessonStatusAction(
  lessonId: string,
  status: 'completed' | 'cancelled' | 'no_show',
  reason?: string,
): Promise<ActionState> {
  const session = await requireAuth();

  const updateData: Record<string, unknown> = { status };

  if (status === 'cancelled') {
    updateData.cancelledAt = new Date();
    updateData.cancelledBy = session.userId;
    if (reason) updateData.cancellationReason = reason;

    // Refund the hour to the purchase if lesson had one
    const [lesson] = await db
      .select({ purchaseId: lessons.purchaseId })
      .from(lessons)
      .where(eq(lessons.id, lessonId))
      .limit(1);

    if (lesson?.purchaseId) {
      const [purchase] = await db
        .select({ hoursRemaining: purchases.hoursRemaining })
        .from(purchases)
        .where(eq(purchases.id, lesson.purchaseId))
        .limit(1);

      if (purchase) {
        await db
          .update(purchases)
          .set({ hoursRemaining: purchase.hoursRemaining + 1 })
          .where(eq(purchases.id, lesson.purchaseId));
      }
    }
  }

  await db
    .update(lessons)
    .set(updateData)
    .where(eq(lessons.id, lessonId));

  revalidatePath('/admin/calendar');
  revalidatePath('/admin/dashboard');
  revalidatePath(`/admin/lessons/${lessonId}`);
  return { success: true };
}

export async function saveLessonReportAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole('admin');

  const parsed = lessonReportSchema.safeParse({
    lessonId: formData.get('lessonId'),
    rawNotes: formData.get('rawNotes'),
    topicsCovered: formData.get('topicsCovered'),
    homeworkAssigned: formData.get('homeworkAssigned'),
    studentPerformance: formData.get('studentPerformance'),
    notesForParent: formData.get('notesForParent'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { lessonId, rawNotes, topicsCovered, homeworkAssigned, studentPerformance, notesForParent } = parsed.data;

  const topics = topicsCovered
    ? topicsCovered
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  // Upsert the report
  const [existing] = await db
    .select({ id: lessonReports.id })
    .from(lessonReports)
    .where(eq(lessonReports.lessonId, lessonId))
    .limit(1);

  if (existing) {
    await db
      .update(lessonReports)
      .set({
        rawNotes: rawNotes ?? null,
        topicsCovered: topics,
        homeworkAssigned: homeworkAssigned ?? null,
        studentPerformance: (studentPerformance as number | undefined) ?? null,
        notesForParent: notesForParent ?? null,
      })
      .where(eq(lessonReports.id, existing.id));
  } else {
    await db.insert(lessonReports).values({
      lessonId,
      rawNotes: rawNotes ?? null,
      topicsCovered: topics,
      homeworkAssigned: homeworkAssigned ?? null,
      studentPerformance: (studentPerformance as number | undefined) ?? null,
      notesForParent: notesForParent ?? null,
    });
  }

  // Mark lesson as completed
  await db
    .update(lessons)
    .set({ status: 'completed' })
    .where(eq(lessons.id, lessonId));

  revalidatePath(`/admin/lessons/${lessonId}`);
  revalidatePath('/admin/calendar');
  return { success: true };
}

export async function cancelLessonByParentAction(
  lessonId: string,
): Promise<ActionState> {
  const session = await requireAuth();

  if (session.role !== 'parent') {
    return { error: 'Brak uprawnień' };
  }

  // Check cancellation deadline
  const [lesson] = await db
    .select({
      startTime: lessons.startTime,
      status: lessons.status,
      purchaseId: lessons.purchaseId,
    })
    .from(lessons)
    .where(eq(lessons.id, lessonId))
    .limit(1);

  if (!lesson) return { error: 'Nie znaleziono lekcji' };
  if (lesson.status !== 'scheduled') return { error: 'Lekcja nie jest zaplanowana' };

  const hoursUntilLesson =
    (lesson.startTime.getTime() - Date.now()) / (1000 * 60 * 60);

  if (hoursUntilLesson < CANCELLATION_DEADLINE_HOURS) {
    return {
      error: `Lekcję można odwołać najpóźniej ${CANCELLATION_DEADLINE_HOURS}h przed terminem`,
    };
  }

  await db
    .update(lessons)
    .set({
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelledBy: session.userId,
      cancellationReason: 'Odwołane przez rodzica',
    })
    .where(eq(lessons.id, lessonId));

  // Refund hour
  if (lesson.purchaseId) {
    const [purchase] = await db
      .select({ hoursRemaining: purchases.hoursRemaining })
      .from(purchases)
      .where(eq(purchases.id, lesson.purchaseId))
      .limit(1);

    if (purchase) {
      await db
        .update(purchases)
        .set({ hoursRemaining: purchase.hoursRemaining + 1 })
        .where(eq(purchases.id, lesson.purchaseId));
    }
  }

  revalidatePath('/parent/dashboard');
  return { success: true };
}
