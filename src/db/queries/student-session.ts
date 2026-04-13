import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { studentProfiles } from '@/db/schema';

export async function getStudentProfileIdByUserId(
  userId: string,
): Promise<string | null> {
  const [row] = await db
    .select({ id: studentProfiles.id })
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, userId))
    .limit(1);
  return row?.id ?? null;
}
