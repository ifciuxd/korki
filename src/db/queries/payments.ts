import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { db } from '@/db/client';
import { payments, purchases, packages, users, studentProfiles } from '@/db/schema';

export interface PaymentListItem {
  id: string;
  parentId: string;
  parentName: string;
  amountCents: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  provider: 'stripe' | 'p24' | 'manual';
  description: string;
  paidAt: Date | null;
  createdAt: Date;
}

export async function listPayments(limit = 50): Promise<PaymentListItem[]> {
  const rows = await db
    .select({
      id: payments.id,
      parentId: payments.parentId,
      parentFirstName: users.firstName,
      parentLastName: users.lastName,
      amountCents: payments.amountCents,
      currency: payments.currency,
      status: payments.status,
      provider: payments.provider,
      description: payments.description,
      paidAt: payments.paidAt,
      createdAt: payments.createdAt,
    })
    .from(payments)
    .innerJoin(users, eq(payments.parentId, users.id))
    .orderBy(desc(payments.createdAt))
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    parentId: r.parentId,
    parentName: `${r.parentFirstName} ${r.parentLastName}`,
    amountCents: r.amountCents,
    currency: r.currency,
    status: r.status as PaymentListItem['status'],
    provider: r.provider as PaymentListItem['provider'],
    description: r.description,
    paidAt: r.paidAt,
    createdAt: r.createdAt,
  }));
}

export async function listPaymentsForParent(
  parentId: string,
): Promise<PaymentListItem[]> {
  const rows = await db
    .select({
      id: payments.id,
      parentId: payments.parentId,
      parentFirstName: users.firstName,
      parentLastName: users.lastName,
      amountCents: payments.amountCents,
      currency: payments.currency,
      status: payments.status,
      provider: payments.provider,
      description: payments.description,
      paidAt: payments.paidAt,
      createdAt: payments.createdAt,
    })
    .from(payments)
    .innerJoin(users, eq(payments.parentId, users.id))
    .where(eq(payments.parentId, parentId))
    .orderBy(desc(payments.createdAt));

  return rows.map((r) => ({
    id: r.id,
    parentId: r.parentId,
    parentName: `${r.parentFirstName} ${r.parentLastName}`,
    amountCents: r.amountCents,
    currency: r.currency,
    status: r.status as PaymentListItem['status'],
    provider: r.provider as PaymentListItem['provider'],
    description: r.description,
    paidAt: r.paidAt,
    createdAt: r.createdAt,
  }));
}

export async function getMonthlyRevenueCents(
  year: number,
  month: number,
): Promise<number> {
  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 1);

  const rows = await db
    .select({ amountCents: payments.amountCents })
    .from(payments)
    .where(
      and(
        eq(payments.status, 'succeeded'),
        gte(payments.paidAt, from),
        lte(payments.paidAt, to),
      ),
    );

  return rows.reduce((sum, r) => sum + r.amountCents, 0);
}

export async function getTotalRevenueCents(): Promise<number> {
  const rows = await db
    .select({ amountCents: payments.amountCents })
    .from(payments)
    .where(eq(payments.status, 'succeeded'));

  return rows.reduce((sum, r) => sum + r.amountCents, 0);
}

export async function countPaymentsByStatus(): Promise<
  Record<string, number>
> {
  const rows = await db
    .select({ status: payments.status })
    .from(payments);

  const counts: Record<string, number> = {
    pending: 0,
    succeeded: 0,
    failed: 0,
    refunded: 0,
  };
  for (const r of rows) {
    counts[r.status] = (counts[r.status] ?? 0) + 1;
  }
  return counts;
}

export interface PurchaseWithDetails {
  id: string;
  parentName: string;
  studentName: string;
  packageName: string;
  hoursTotal: number;
  hoursRemaining: number;
  validUntil: Date;
  amountCents: number;
  paymentStatus: string;
  createdAt: Date;
}

export async function listRecentPurchases(
  limit = 20,
): Promise<PurchaseWithDetails[]> {
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
      amountCents: payments.amountCents,
      paymentStatus: payments.status,
    })
    .from(purchases)
    .innerJoin(packages, eq(purchases.packageId, packages.id))
    .innerJoin(users, eq(purchases.parentId, users.id))
    .innerJoin(payments, eq(purchases.paymentId, payments.id))
    .orderBy(desc(purchases.createdAt))
    .limit(limit);

  // Fetch student names
  const allPurchaseRows = await db
    .select({
      purchaseId: purchases.id,
      studentId: purchases.studentId,
    })
    .from(purchases);

  const purchaseStudentMap = new Map(
    allPurchaseRows.map((r) => [r.purchaseId, r.studentId]),
  );

  // Get all student names
  const studentRows = await db
    .select({
      id: studentProfiles.id,
      firstName: users.firstName,
      lastName: users.lastName,
    })
    .from(studentProfiles)
    .innerJoin(users, eq(studentProfiles.userId, users.id));

  const studentNameMap = new Map(
    studentRows.map((s) => [s.id, `${s.firstName} ${s.lastName}`]),
  );

  return rows.map((r) => {
    const studentId = purchaseStudentMap.get(r.id);
    return {
      id: r.id,
      parentName: `${r.parentFirstName} ${r.parentLastName}`,
      studentName: studentId ? studentNameMap.get(studentId) ?? '—' : '—',
      packageName: r.packageName,
      hoursTotal: r.hoursTotal,
      hoursRemaining: r.hoursRemaining,
      validUntil: r.validUntil,
      amountCents: r.amountCents,
      paymentStatus: r.paymentStatus,
      createdAt: r.createdAt,
    };
  });
}
