import { eq, desc } from 'drizzle-orm';
import { db } from '@/db/client';
import { studentProfiles, users } from '@/db/schema';

export interface StudentListItem {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  gradeLevel: string;
  examTarget: 'none' | 'egzamin8' | 'matura_podstawowa' | 'matura_rozszerzona';
  parentId: string | null;
  parentName: string | null;
  createdAt: Date;
}

/**
 * Returns all students with their parent info (for admin list view).
 */
export async function listStudents(): Promise<StudentListItem[]> {
  const parentsAlias = users;

  const rows = await db
    .select({
      id: studentProfiles.id,
      userId: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      gradeLevel: studentProfiles.gradeLevel,
      examTarget: studentProfiles.examTarget,
      parentId: studentProfiles.parentId,
      createdAt: studentProfiles.createdAt,
    })
    .from(studentProfiles)
    .innerJoin(users, eq(studentProfiles.userId, users.id))
    .orderBy(desc(studentProfiles.createdAt));

  // Fetch parent names in a second query (simpler than self-join)
  const parentIds = rows
    .map((r) => r.parentId)
    .filter((id): id is string => id !== null);

  const parents =
    parentIds.length > 0
      ? await db
          .select({
            id: parentsAlias.id,
            firstName: parentsAlias.firstName,
            lastName: parentsAlias.lastName,
          })
          .from(parentsAlias)
      : [];

  const parentMap = new Map(
    parents.map((p) => [p.id, `${p.firstName} ${p.lastName}`]),
  );

  return rows.map((row) => ({
    ...row,
    parentName: row.parentId ? parentMap.get(row.parentId) ?? null : null,
  }));
}

export async function getStudentById(
  id: string,
): Promise<StudentListItem | null> {
  const all = await listStudents();
  return all.find((s) => s.id === id) ?? null;
}

export async function countStudents(): Promise<number> {
  const rows = await db.select({ id: studentProfiles.id }).from(studentProfiles);
  return rows.length;
}
