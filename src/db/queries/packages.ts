import { eq, asc } from 'drizzle-orm';
import { db } from '@/db/client';
import { packages } from '@/db/schema';

export interface PackageItem {
  id: string;
  name: string;
  description: string | null;
  hoursIncluded: number;
  priceCents: number;
  validityDays: number;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
}

export async function listPackages(): Promise<PackageItem[]> {
  return db
    .select()
    .from(packages)
    .orderBy(asc(packages.displayOrder), asc(packages.priceCents));
}

export async function listActivePackages(): Promise<PackageItem[]> {
  return db
    .select()
    .from(packages)
    .where(eq(packages.isActive, true))
    .orderBy(asc(packages.displayOrder), asc(packages.priceCents));
}

export async function getPackageById(
  id: string,
): Promise<PackageItem | null> {
  const [row] = await db
    .select()
    .from(packages)
    .where(eq(packages.id, id))
    .limit(1);
  return row ?? null;
}
