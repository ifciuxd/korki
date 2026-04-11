import { eq, desc, sql } from 'drizzle-orm';
import { db } from '@/db/client';
import { users, studentProfiles } from '@/db/schema';

export interface ParentListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  childrenCount: number;
  createdAt: Date;
}

/**
 * Returns all parents with the number of assigned children.
 */
export async function listParents(): Promise<ParentListItem[]> {
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      phone: users.phone,
      createdAt: users.createdAt,
      childrenCount: sql<number>`(
        SELECT COUNT(*)::int FROM ${studentProfiles}
        WHERE ${studentProfiles.parentId} = ${users.id}
      )`,
    })
    .from(users)
    .where(eq(users.role, 'parent'))
    .orderBy(desc(users.createdAt));

  return rows;
}

export async function countParents(): Promise<number> {
  const rows = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role, 'parent'));
  return rows.length;
}

/**
 * Returns parents as options for a select dropdown.
 */
export async function listParentsForSelect(): Promise<
  Array<{ id: string; label: string }>
> {
  const rows = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
    })
    .from(users)
    .where(eq(users.role, 'parent'))
    .orderBy(users.lastName);

  return rows.map((r) => ({
    id: r.id,
    label: `${r.firstName} ${r.lastName} (${r.email})`,
  }));
}
