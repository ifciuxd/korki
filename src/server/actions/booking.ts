'use server';

import { revalidatePath } from 'next/cache';
import { and, eq, gt, gte } from 'drizzle-orm';
import { db } from '@/db/client';
import { lessons, purchases, studentProfiles } from '@/db/schema';
import { requireRole } from '@/lib/auth/session';
import type { ActionState } from './invitations';

interface BookLessonInput {
  studentId: string;
  date: string;
  startTime: string;
  endTime: string;
}

export async function bookLessonForParentAction(
  input: BookLessonInput,
): Promise<ActionState> {
  const session = await requireRole('parent');

  const { studentId, date, startTime, endTime } = input;

  // Verify the student belongs to this parent
  const [student] = await db
    .select({ parentId: studentProfiles.parentId })
    .from(studentProfiles)
    .where(eq(studentProfiles.id, studentId))
    .limit(1);

  if (!student || student.parentId !== session.userId) {
    return { error: 'Brak uprawnień do rezerwacji dla tego ucznia' };
  }

  const startDateTime = new Date(`${date}T${startTime}:00+02:00`);
  const endDateTime = new Date(`${date}T${endTime}:00+02:00`);

  if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
    return { error: 'Nieprawidłowa data lub godzina' };
  }

  if (startDateTime <= new Date()) {
    return { error: 'Nie można rezerwować lekcji w przeszłości' };
  }

  // Find a valid purchase for this student
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

  // Decrement hours from the purchase
  if (activePurchase) {
    await db
      .update(purchases)
      .set({ hoursRemaining: activePurchase.hoursRemaining - 1 })
      .where(eq(purchases.id, activePurchase.id));
  }

  revalidatePath('/parent/dashboard');
  revalidatePath('/parent/book-lesson');
  revalidatePath('/admin/calendar');
  return { success: true };
}
