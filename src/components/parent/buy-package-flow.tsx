'use client';

import { useActionState, useState } from 'react';
import {
  Package,
  Check,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { formatCents } from '@/lib/utils/cents';
import { buyPackageRequestAction } from '@/server/actions/payments';
import type { ActionState } from '@/server/actions/invitations';

interface PackageOption {
  id: string;
  name: string;
  description: string | null;
  hoursIncluded: number;
  priceCents: number;
  validityDays: number;
}

interface ChildOption {
  studentId: string;
  firstName: string;
  lastName: string;
  gradeLevel: string;
  hoursRemaining: number;
}

interface BuyPackageFlowProps {
  packages: PackageOption[];
  studentList: ChildOption[];
}

type Step = 'package' | 'child' | 'confirm' | 'done';

export function BuyPackageFlow({ packages: pkgs, studentList: children }: BuyPackageFlowProps) {
  const [step, setStep] = useState<Step>('package');
  const [selectedPkg, setSelectedPkg] = useState<PackageOption | null>(null);
  const [selectedChild, setSelectedChild] = useState<ChildOption | null>(null);

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    async (prev, formData) => {
      const result = await buyPackageRequestAction(prev, formData);
      if (result.success) setStep('done');
      return result;
    },
    {},
  );

  if (pkgs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-16 text-center">
        <Package className="mb-4 h-10 w-10 text-muted-foreground" />
        <h2 className="mb-1 text-lg font-semibold">Brak dostępnych pakietów</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Korepetytor nie dodał jeszcze żadnych pakietów. Skontaktuj się z nim.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-center gap-1">
        {(['package', 'child', 'confirm'] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-1">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors',
                step === s || stepIndex(step) > i
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {stepIndex(step) > i ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            {i < 2 && (
              <div
                className={cn(
                  'h-0.5 w-12 transition-colors',
                  stepIndex(step) > i ? 'bg-primary' : 'bg-muted',
                )}
              />
            )}
          </div>
        ))}
      </div>

      {state.error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {/* Step 1: Choose package */}
      {step === 'package' && (
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold">Wybierz pakiet</h2>
            <p className="text-sm text-muted-foreground">
              Wybierz pakiet godzin najlepiej dopasowany do potrzeb
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pkgs.map((pkg) => {
              const pricePerHour = Math.round(pkg.priceCents / pkg.hoursIncluded);
              const isBestValue =
                pkgs.length > 1 &&
                pricePerHour ===
                  Math.min(
                    ...pkgs.map((p) =>
                      Math.round(p.priceCents / p.hoursIncluded),
                    ),
                  ) &&
                pkg.hoursIncluded > 1;

              return (
                <button
                  key={pkg.id}
                  onClick={() => {
                    setSelectedPkg(pkg);
                    setStep('child');
                  }}
                  className={cn(
                    'group relative overflow-hidden rounded-xl border text-left transition-all hover:shadow-lg',
                    isBestValue
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'hover:border-primary/50',
                  )}
                >
                  {isBestValue && (
                    <div className="flex items-center justify-center gap-1 bg-primary py-1.5 text-xs font-semibold text-primary-foreground">
                      <Sparkles className="h-3 w-3" />
                      Najlepsza wartość
                    </div>
                  )}
                  <div className="h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
                  <div className="p-5">
                    <h3 className="text-lg font-semibold">{pkg.name}</h3>
                    {pkg.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {pkg.description}
                      </p>
                    )}

                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-3xl font-bold tracking-tight">
                        {formatCents(pkg.priceCents)}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-primary" />
                        <span>
                          <strong className="text-foreground">
                            {pkg.hoursIncluded}
                          </strong>{' '}
                          godzin lekcji
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-primary" />
                        <span>
                          {formatCents(pricePerHour)} za godzinę
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        <span>Ważny {pkg.validityDays} dni</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-center rounded-lg bg-primary/5 py-2 text-sm font-medium text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      Wybierz
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Choose child */}
      {step === 'child' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setStep('package')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-xl font-semibold">Dla kogo?</h2>
              <p className="text-sm text-muted-foreground">
                Wybierz dziecko, któremu przypisać pakiet
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {children.map((child) => (
              <button
                key={child.studentId}
                onClick={() => {
                  setSelectedChild(child);
                  setStep('confirm');
                }}
                className="group flex w-full items-center gap-4 rounded-xl border bg-card p-4 text-left transition-all hover:border-primary hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  {child.firstName[0]}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">
                    {child.firstName} {child.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {child.gradeLevel}
                  </p>
                </div>
                <Badge variant={child.hoursRemaining > 0 ? 'success' : 'secondary'}>
                  {child.hoursRemaining}h pozostało
                </Badge>
                <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 'confirm' && selectedPkg && selectedChild && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setStep('child')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold">Potwierdzenie</h2>
          </div>

          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pakiet</span>
                  <span className="font-semibold">{selectedPkg.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Dla ucznia
                  </span>
                  <span className="font-semibold">
                    {selectedChild.firstName} {selectedChild.lastName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Godzin
                  </span>
                  <span className="font-semibold">
                    {selectedPkg.hoursIncluded}h
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Ważność
                  </span>
                  <span className="font-semibold">
                    {selectedPkg.validityDays} dni
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Do zapłaty</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatCents(selectedPkg.priceCents)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-medium">Jak zapłacić?</p>
            <p className="mt-1">
              Po kliknięciu &bdquo;Zamów&rdquo; korepetytor otrzyma powiadomienie.
              Opłać pakiet przelewem lub gotówką na następnej lekcji. Godziny
              zostaną aktywowane po potwierdzeniu wpłaty.
            </p>
          </div>

          <form action={formAction}>
            <input type="hidden" name="packageId" value={selectedPkg.id} />
            <input
              type="hidden"
              name="studentId"
              value={selectedChild.studentId}
            />
            <Button
              type="submit"
              disabled={isPending}
              className="w-full"
              size="lg"
            >
              {isPending ? 'Przetwarzanie...' : 'Zamów pakiet'}
            </Button>
          </form>
        </div>
      )}

      {/* Step 4: Done */}
      {step === 'done' && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="mb-4 rounded-full bg-emerald-100 p-4">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <h2 className="mb-1 text-xl font-semibold">Zamówienie złożone!</h2>
          <p className="mb-6 max-w-sm text-sm text-muted-foreground">
            Korepetytor został powiadomiony o Twoim zamówieniu. Opłać pakiet
            przelewem lub gotówką. Godziny zostaną aktywowane po potwierdzeniu
            wpłaty.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <a href="/parent/payments">Historia płatności</a>
            </Button>
            <Button asChild>
              <a href="/parent/dashboard">Wróć do panelu</a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function stepIndex(step: Step): number {
  return { package: 0, child: 1, confirm: 2, done: 3 }[step];
}
