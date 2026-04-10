const MONTHLY_LIMIT_CENTS = parseInt(
  process.env.UNREGISTERED_BUSINESS_MONTHLY_LIMIT_CENTS || '349900',
  10,
);

export interface LimitStatus {
  currentCents: number;
  limitCents: number;
  percentUsed: number;
  isOverLimit: boolean;
  isWarning: boolean; // > 80%
}

export function checkUnregisteredLimit(
  currentMonthRevenueCents: number,
): LimitStatus {
  const percentUsed = (currentMonthRevenueCents / MONTHLY_LIMIT_CENTS) * 100;
  return {
    currentCents: currentMonthRevenueCents,
    limitCents: MONTHLY_LIMIT_CENTS,
    percentUsed: Math.round(percentUsed * 10) / 10,
    isOverLimit: currentMonthRevenueCents >= MONTHLY_LIMIT_CENTS,
    isWarning: percentUsed >= 80,
  };
}
