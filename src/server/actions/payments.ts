'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { payments, purchases, packages, studentProfiles, users } from '@/db/schema';
import { requireRole, requireAuth } from '@/lib/auth/session';
import { recordManualPaymentSchema, buyPackageSchema } from '@/server/validators/payment';
import type { ActionState } from './invitations';

/**
 * Admin records a manual payment (cash/transfer) and creates the purchase.
 */
export async function recordManualPaymentAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole('admin');

  const parsed = recordManualPaymentSchema.safeParse({
    parentId: formData.get('parentId'),
    studentId: formData.get('studentId'),
    packageId: formData.get('packageId'),
    description: formData.get('description'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { parentId, studentId, packageId, description } = parsed.data;

  // Fetch the package
  const [pkg] = await db
    .select()
    .from(packages)
    .where(eq(packages.id, packageId))
    .limit(1);

  if (!pkg) return { error: 'Pakiet nie istnieje' };

  // Fetch student name for description
  const [student] = await db
    .select({ firstName: users.firstName, lastName: users.lastName })
    .from(studentProfiles)
    .innerJoin(users, eq(studentProfiles.userId, users.id))
    .where(eq(studentProfiles.id, studentId))
    .limit(1);

  const studentName = student
    ? `${student.firstName} ${student.lastName}`
    : 'Uczeń';

  const paymentDesc =
    description || `${pkg.name} — ${studentName}`;

  // Create payment record (immediately succeeded for manual)
  const [payment] = await db
    .insert(payments)
    .values({
      parentId,
      amountCents: pkg.priceCents,
      currency: 'PLN',
      status: 'succeeded',
      provider: 'manual',
      description: paymentDesc,
      paidAt: new Date(),
    })
    .returning({ id: payments.id });

  // Create purchase
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + pkg.validityDays);

  await db.insert(purchases).values({
    parentId,
    studentId,
    packageId,
    paymentId: payment.id,
    hoursTotal: pkg.hoursIncluded,
    hoursRemaining: pkg.hoursIncluded,
    validUntil,
  });

  revalidatePath('/admin/finances');
  revalidatePath('/admin/dashboard');
  revalidatePath('/parent/dashboard');
  return { success: true };
}

/**
 * Parent requests to buy a package (creates pending payment).
 * Admin will later confirm it via confirmPaymentAction.
 */
export async function buyPackageRequestAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuth();
  if (session.role !== 'parent') {
    return { error: 'Brak uprawnień' };
  }

  const parsed = buyPackageSchema.safeParse({
    packageId: formData.get('packageId'),
    studentId: formData.get('studentId'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { packageId, studentId } = parsed.data;

  // Verify student belongs to parent
  const [student] = await db
    .select({
      parentId: studentProfiles.parentId,
      firstName: users.firstName,
      lastName: users.lastName,
    })
    .from(studentProfiles)
    .innerJoin(users, eq(studentProfiles.userId, users.id))
    .where(eq(studentProfiles.id, studentId))
    .limit(1);

  if (!student || student.parentId !== session.userId) {
    return { error: 'Brak uprawnień dla tego ucznia' };
  }

  const [pkg] = await db
    .select()
    .from(packages)
    .where(eq(packages.id, packageId))
    .limit(1);

  if (!pkg || !pkg.isActive) {
    return { error: 'Pakiet jest niedostępny' };
  }

  const paymentDesc = `${pkg.name} — ${student.firstName} ${student.lastName}`;

  // Create pending payment
  await db.insert(payments).values({
    parentId: session.userId,
    amountCents: pkg.priceCents,
    currency: 'PLN',
    status: 'pending',
    provider: 'manual',
    description: paymentDesc,
  });

  revalidatePath('/parent/payments');
  revalidatePath('/parent/buy-package');
  return { success: true };
}

/**
 * Admin confirms a pending payment and provisions the purchase.
 */
export async function confirmPaymentAction(
  paymentId: string,
  studentId: string,
): Promise<ActionState> {
  await requireRole('admin');

  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.id, paymentId))
    .limit(1);

  if (!payment) return { error: 'Płatność nie znaleziona' };
  if (payment.status !== 'pending') {
    return { error: 'Płatność nie jest w stanie oczekującym' };
  }

  // Find the matching package by price
  const [pkg] = await db
    .select()
    .from(packages)
    .where(eq(packages.priceCents, payment.amountCents))
    .limit(1);

  if (!pkg) return { error: 'Nie znaleziono pasującego pakietu' };

  // Update payment status
  await db
    .update(payments)
    .set({ status: 'succeeded', paidAt: new Date() })
    .where(eq(payments.id, paymentId));

  // Create purchase
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + pkg.validityDays);

  await db.insert(purchases).values({
    parentId: payment.parentId,
    studentId,
    packageId: pkg.id,
    paymentId: payment.id,
    hoursTotal: pkg.hoursIncluded,
    hoursRemaining: pkg.hoursIncluded,
    validUntil,
  });

  revalidatePath('/admin/finances');
  revalidatePath('/parent/dashboard');
  revalidatePath('/parent/payments');
  return { success: true };
}
