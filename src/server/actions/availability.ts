'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { availabilitySlots } from '@/db/schema';
import { requireRole } from '@/lib/auth/session';
import { availabilitySlotSchema } from '@/server/validators/availability';
import type { ActionState } from './invitations';

export async function createAvailabilitySlotAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole('admin');

  const parsed = availabilitySlotSchema.safeParse({
    dayOfWeek: formData.get('dayOfWeek'),
    startTime: formData.get('startTime'),
    endTime: formData.get('endTime'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await db.insert(availabilitySlots).values({
    dayOfWeek: parsed.data.dayOfWeek,
    startTime: parsed.data.startTime,
    endTime: parsed.data.endTime,
    isRecurring: true,
  });

  revalidatePath('/admin/availability');
  return { success: true };
}

export async function deleteAvailabilitySlotAction(
  id: string,
): Promise<ActionState> {
  await requireRole('admin');

  await db.delete(availabilitySlots).where(eq(availabilitySlots.id, id));

  revalidatePath('/admin/availability');
  return { success: true };
}
