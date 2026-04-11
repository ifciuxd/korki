import { asc } from 'drizzle-orm';
import { db } from '@/db/client';
import { availabilitySlots } from '@/db/schema';

export interface AvailabilitySlotItem {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
}

export async function listAvailabilitySlots(): Promise<AvailabilitySlotItem[]> {
  const rows = await db
    .select({
      id: availabilitySlots.id,
      dayOfWeek: availabilitySlots.dayOfWeek,
      startTime: availabilitySlots.startTime,
      endTime: availabilitySlots.endTime,
      isRecurring: availabilitySlots.isRecurring,
    })
    .from(availabilitySlots)
    .orderBy(asc(availabilitySlots.dayOfWeek), asc(availabilitySlots.startTime));

  return rows;
}
