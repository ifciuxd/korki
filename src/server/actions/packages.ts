'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { packages } from '@/db/schema';
import { requireRole } from '@/lib/auth/session';
import { packageSchema } from '@/server/validators/package';
import { parseZlotyToCents } from '@/lib/utils/cents';
import type { ActionState } from './invitations';

export async function createPackageAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole('admin');

  const priceRaw = formData.get('price') as string;
  let priceCents: number;
  try {
    priceCents = parseZlotyToCents(priceRaw || '0');
  } catch {
    return { error: 'Podaj prawidłową cenę' };
  }

  const parsed = packageSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    hoursIncluded: formData.get('hoursIncluded'),
    priceCents,
    validityDays: formData.get('validityDays'),
    displayOrder: formData.get('displayOrder') || '0',
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await db.insert(packages).values({
    name: parsed.data.name,
    description: parsed.data.description ?? null,
    hoursIncluded: parsed.data.hoursIncluded,
    priceCents: parsed.data.priceCents,
    validityDays: parsed.data.validityDays,
    displayOrder: parsed.data.displayOrder,
    isActive: true,
  });

  revalidatePath('/admin/finances');
  return { success: true };
}

export async function togglePackageAction(
  id: string,
  isActive: boolean,
): Promise<ActionState> {
  await requireRole('admin');

  await db
    .update(packages)
    .set({ isActive })
    .where(eq(packages.id, id));

  revalidatePath('/admin/finances');
  return { success: true };
}

export async function deletePackageAction(
  id: string,
): Promise<ActionState> {
  await requireRole('admin');

  await db.delete(packages).where(eq(packages.id, id));

  revalidatePath('/admin/finances');
  return { success: true };
}
