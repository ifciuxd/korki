import {
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PackageManager } from '@/components/admin/package-manager';
import { RecordPaymentDialog } from '@/components/admin/record-payment-dialog';
import { listPackages } from '@/db/queries/packages';
import {
  listPayments,
  getMonthlyRevenueCents,
  getTotalRevenueCents,
  countPaymentsByStatus,
  listRecentPurchases,
} from '@/db/queries/payments';
import { listParentsForSelect } from '@/db/queries/parents';
import { listStudents } from '@/db/queries/students';
import { formatCents } from '@/lib/utils/cents';
import { formatDateTimePL } from '@/lib/utils/dates';
import { checkUnregisteredLimit } from '@/lib/utils/unregistered-limit';

export default async function FinancesPage() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [
    allPackages,
    allPayments,
    monthlyRevenue,
    totalRevenue,
    statusCounts,
    recentPurchases,
    parents,
    students,
  ] = await Promise.all([
    listPackages(),
    listPayments(30),
    getMonthlyRevenueCents(currentYear, currentMonth),
    getTotalRevenueCents(),
    countPaymentsByStatus(),
    listRecentPurchases(10),
    listParentsForSelect(),
    listStudents(),
  ]);

  const limitStatus = checkUnregisteredLimit(monthlyRevenue);

  const studentOptions = students.map((s) => ({
    id: s.id,
    label: `${s.firstName} ${s.lastName} (${s.gradeLevel})`,
    parentId: s.parentId,
  }));

  const packageOptions = allPackages
    .filter((p) => p.isActive)
    .map((p) => ({
      id: p.id,
      label: `${p.name} — ${formatCents(p.priceCents)}`,
    }));

  const monthNames = [
    'styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec',
    'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień',
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Finanse</h1>
          <p className="text-sm text-muted-foreground">
            Przychody, płatności i pakiety godzin
          </p>
        </div>
        <RecordPaymentDialog
          parents={parents}
          students={studentOptions}
          packages={packageOptions}
        />
      </div>

      {/* Revenue stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Przychód ({monthNames[currentMonth - 1]})
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCents(monthlyRevenue)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Przychód łączny
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCents(totalRevenue)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Opłacone
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statusCounts.succeeded ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Oczekujące
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statusCounts.pending ?? 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unregistered business limit */}
      <Card
        className={
          limitStatus.isOverLimit
            ? 'border-destructive bg-destructive/5'
            : limitStatus.isWarning
              ? 'border-amber-300 bg-amber-50/50'
              : ''
        }
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              {limitStatus.isOverLimit ? (
                <AlertTriangle className="h-4 w-4 text-destructive" />
              ) : limitStatus.isWarning ? (
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              ) : (
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              )}
              Limit działalności nierejestrowanej
            </CardTitle>
            <Badge
              variant={
                limitStatus.isOverLimit
                  ? 'destructive'
                  : limitStatus.isWarning
                    ? 'warning'
                    : 'secondary'
              }
            >
              {limitStatus.percentUsed}%
            </Badge>
          </div>
          <CardDescription>
            Miesięczny limit przychodu:{' '}
            {formatCents(limitStatus.limitCents)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress
            value={Math.min(limitStatus.percentUsed, 100)}
            className={`h-3 ${
              limitStatus.isOverLimit
                ? '[&>div]:bg-destructive'
                : limitStatus.isWarning
                  ? '[&>div]:bg-amber-500'
                  : ''
            }`}
          />
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted-foreground">
              {formatCents(limitStatus.currentCents)}
            </span>
            <span className="text-muted-foreground">
              {formatCents(limitStatus.limitCents)}
            </span>
          </div>
          {limitStatus.isOverLimit && (
            <p className="mt-2 text-sm font-medium text-destructive">
              Przekroczono limit! Rozważ rejestrację działalności
              gospodarczej.
            </p>
          )}
          {limitStatus.isWarning && !limitStatus.isOverLimit && (
            <p className="mt-2 text-sm text-amber-700">
              Zbliżasz się do limitu. Monitoruj przychody.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Tabs: Payments / Purchases / Packages */}
      <Tabs defaultValue="payments">
        <TabsList>
          <TabsTrigger value="payments">Płatności</TabsTrigger>
          <TabsTrigger value="purchases">Zakupy</TabsTrigger>
          <TabsTrigger value="packages">Pakiety</TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
          {allPayments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-12">
                <CreditCard className="mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Brak zarejestrowanych płatności
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {allPayments.map((payment) => (
                <PaymentRow key={payment.id} payment={payment} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="purchases">
          {recentPurchases.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-12">
                <Wallet className="mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Brak zakupionych pakietów
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {recentPurchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="flex items-center gap-4 rounded-xl border bg-card p-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Wallet className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">
                      {purchase.packageName} — {purchase.studentName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {purchase.parentName} &middot;{' '}
                      {formatDateTimePL(purchase.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCents(purchase.amountCents)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {purchase.hoursRemaining}/{purchase.hoursTotal}h
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="packages">
          <PackageManager packages={allPackages} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PaymentRow({
  payment,
}: {
  payment: {
    id: string;
    parentName: string;
    amountCents: number;
    status: string;
    provider: string;
    description: string;
    paidAt: Date | null;
    createdAt: Date;
  };
}) {
  const statusConfig: Record<
    string,
    { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' | 'secondary' }
  > = {
    pending: { label: 'Oczekuje', variant: 'warning' },
    succeeded: { label: 'Opłacona', variant: 'success' },
    failed: { label: 'Nieudana', variant: 'destructive' },
    refunded: { label: 'Zwrócona', variant: 'secondary' },
  };

  const providerLabels: Record<string, string> = {
    manual: 'Ręczna',
    stripe: 'Stripe',
    p24: 'Przelewy24',
  };

  const config = statusConfig[payment.status] ?? statusConfig.pending;

  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/30">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
        <CreditCard className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate font-medium">{payment.description}</p>
        <p className="text-sm text-muted-foreground">
          {payment.parentName} &middot;{' '}
          {providerLabels[payment.provider] ?? payment.provider} &middot;{' '}
          {formatDateTimePL(payment.paidAt ?? payment.createdAt)}
        </p>
      </div>
      <div className="text-right">
        <p className="font-semibold">{formatCents(payment.amountCents)}</p>
        <Badge variant={config.variant} className="mt-1 text-[10px]">
          {config.label}
        </Badge>
      </div>
    </div>
  );
}
