import {
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { requireRole } from '@/lib/auth/session';
import { listPaymentsForParent } from '@/db/queries/payments';
import { formatCents } from '@/lib/utils/cents';
import { formatDateTimePL } from '@/lib/utils/dates';

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    variant: 'default' | 'success' | 'secondary' | 'destructive' | 'warning';
    icon: typeof Clock;
  }
> = {
  pending: { label: 'Oczekuje', variant: 'warning', icon: Clock },
  succeeded: { label: 'Opłacona', variant: 'success', icon: CheckCircle2 },
  failed: { label: 'Nieudana', variant: 'destructive', icon: XCircle },
  refunded: { label: 'Zwrócona', variant: 'secondary', icon: AlertTriangle },
};

export default async function PaymentsPage() {
  const session = await requireRole('parent');
  const allPayments = await listPaymentsForParent(session.userId);

  const totalPaid = allPayments
    .filter((p) => p.status === 'succeeded')
    .reduce((sum, p) => sum + p.amountCents, 0);

  const pendingCount = allPayments.filter(
    (p) => p.status === 'pending',
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Płatności</h1>
        <p className="text-sm text-muted-foreground">
          Historia Twoich płatności za pakiety lekcji
        </p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <CreditCard className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Łącznie opłacone</p>
              <p className="text-xl font-bold">{formatCents(totalPaid)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Oczekujące</p>
              <p className="text-xl font-bold">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Wszystkich</p>
              <p className="text-xl font-bold">{allPayments.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment list */}
      {allPayments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <CreditCard className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Brak historii płatności
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {allPayments.map((payment) => {
            const config =
              STATUS_CONFIG[payment.status] ?? STATUS_CONFIG.pending;
            const Icon = config.icon;

            return (
              <div
                key={payment.id}
                className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/30"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{payment.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {payment.paidAt
                      ? formatDateTimePL(payment.paidAt)
                      : formatDateTimePL(payment.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {formatCents(payment.amountCents)}
                  </p>
                  <Badge variant={config.variant} className="mt-1 text-[10px]">
                    {config.label}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
