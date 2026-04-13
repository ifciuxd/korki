import { eq, and, gt, gte } from 'drizzle-orm';
import { db } from '@/db/client';
import { purchases, packages, users, studentProfiles } from '@/db/schema';

export interface PurchaseItem {
  id: string;
  parentName: string;
  studentName: string;
  packageName: string;
  hoursTotal: number;
  hoursRemaining: number;
  validUntil: Date;
  createdAt: Date;
}

export async function listActivePurchasesForStudent(
  studentId: string,
): Promise<PurchaseItem[]> {
  const now = new Date();
  const rows = await db
    .select({
      id: purchases.id,
      parentFirstName: users.firstName,
      parentLastName: users.lastName,
      hoursTotal: purchases.hoursTotal,
      hoursRemaining: purchases.hoursRemaining,
      validUntil: purchases.validUntil,
      createdAt: purchases.createdAt,
      packageName: packages.name,
    })
    .from(purchases)
    .innerJoin(packages, eq(purchases.packageId, packages.id))
    .innerJoin(users, eq(purchases.parentId, users.id))
    .where(
      and(
        eq(purchases.studentId, studentId),
        gt(purchases.hoursRemaining, 0),
        gte(purchases.validUntil, now),
      ),
    );

  // We need the student name too
  const [student] = await db
    .select({
      firstName: users.firstName,
      lastName: users.lastName,
    })
    .from(studentProfiles)
    .innerJoin(users, eq(studentProfiles.userId, users.id))
    .where(eq(studentProfiles.id, studentId))
    .limit(1);

  const studentName = student
    ? `${student.firstName} ${student.lastName}`
    : '—';

  return rows.map((r) => ({
    id: r.id,
    parentName: `${r.parentFirstName} ${r.parentLastName}`,
    studentName,
    packageName: r.packageName,
    hoursTotal: r.hoursTotal,
    hoursRemaining: r.hoursRemaining,
    validUntil: r.validUntil,
    createdAt: r.createdAt,
  }));
}

export async function getRemainingHoursForStudent(
  studentId: string,
): Promise<number> {
  const now = new Date();
  const rows = await db
    .select({
      hoursRemaining: purchases.hoursRemaining,
    })
    .from(purchases)
    .where(
      and(
        eq(purchases.studentId, studentId),
        gt(purchases.hoursRemaining, 0),
        gte(purchases.validUntil, now),
      ),
    );
  return rows.reduce((sum, r) => sum + r.hoursRemaining, 0);
}

export async function getChildrenWithHoursForParent(
  parentId: string,
): Promise<
  Array<{
    studentId: string;
    firstName: string;
    lastName: string;
    gradeLevel: string;
    hoursRemaining: number;
  }>
> {
  // Get all children of the parent
  const children = await db
    .select({
      studentId: studentProfiles.id,
      firstName: users.firstName,
      lastName: users.lastName,
      gradeLevel: studentProfiles.gradeLevel,
    })
    .from(studentProfiles)
    .innerJoin(users, eq(studentProfiles.userId, users.id))
    .where(eq(studentProfiles.parentId, parentId));

  // For each child, compute remaining hours
  const result = await Promise.all(
    children.map(async (child) => {
      const hours = await getRemainingHoursForStudent(child.studentId);
      return { ...child, hoursRemaining: hours };
    }),
  );

  return result;
}
