'use client';

import { useState, useTransition } from 'react';
import {
  Calendar,
  Clock,
  User,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { bookLessonForParentAction } from '@/server/actions/booking';

interface Child {
  studentId: string;
  firstName: string;
  lastName: string;
  gradeLevel: string;
  hoursRemaining: number;
}

interface AvailableSlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface BookLessonWizardProps {
  studentList: Child[];
  availableSlots: AvailableSlot[];
}

type Step = 'child' | 'slot' | 'confirm' | 'done';

export function BookLessonWizard({
  studentList: childrenList,
  availableSlots,
}: BookLessonWizardProps) {
  const [step, setStep] = useState<Step>('child');
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{
    date: string;
    startTime: string;
    endTime: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Generate next 14 days of available slots
  const upcomingSlots = generateUpcomingSlots(availableSlots, 14);

  function handleSelectChild(child: Child) {
    setSelectedChild(child);
    setStep('slot');
    setError(null);
  }

  function handleSelectSlot(date: string, startTime: string, endTime: string) {
    setSelectedSlot({ date, startTime, endTime });
    setStep('confirm');
    setError(null);
  }

  function handleConfirm() {
    if (!selectedChild || !selectedSlot) return;
    setError(null);

    startTransition(async () => {
      const result = await bookLessonForParentAction({
        studentId: selectedChild.studentId,
        date: selectedSlot.date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setStep('done');
      }
    });
  }

  if (childrenList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-16 text-center">
        <AlertCircle className="mb-4 h-10 w-10 text-muted-foreground" />
        <h2 className="mb-1 text-lg font-semibold">Brak przypisanych dzieci</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Skontaktuj się z korepetytorem, aby dodał Twoje dziecko do systemu.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Progress steps */}
      <div className="flex items-center justify-center gap-1">
        {(['child', 'slot', 'confirm'] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-1">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors',
                step === s || getStepIndex(step) > i
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {getStepIndex(step) > i ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                i + 1
              )}
            </div>
            {i < 2 && (
              <div
                className={cn(
                  'h-0.5 w-12 transition-colors',
                  getStepIndex(step) > i ? 'bg-primary' : 'bg-muted',
                )}
              />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Step 1: Select child */}
      {step === 'child' && (
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold">Wybierz dziecko</h2>
            <p className="text-sm text-muted-foreground">
              Dla którego dziecka chcesz zarezerwować lekcję?
            </p>
          </div>
          <div className="grid gap-3">
            {childrenList.map((child) => (
              <button
                key={child.studentId}
                onClick={() => handleSelectChild(child)}
                className="group flex items-center gap-4 rounded-xl border bg-card p-4 text-left transition-all hover:border-primary hover:shadow-md"
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
                <div className="text-right">
                  <Badge
                    variant={child.hoursRemaining > 0 ? 'success' : 'destructive'}
                  >
                    {child.hoursRemaining}h pozostało
                  </Badge>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Select slot */}
      {step === 'slot' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setStep('child')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-xl font-semibold">Wybierz termin</h2>
              <p className="text-sm text-muted-foreground">
                Dostępne terminy na najbliższe 2 tygodnie
              </p>
            </div>
          </div>

          {upcomingSlots.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed py-10 text-center">
              <Clock className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">
                Brak dostępnych terminów. Skontaktuj się z korepetytorem.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingSlots.map((slot, i) => {
                const dayName = new Date(slot.date).toLocaleDateString(
                  'pl-PL',
                  {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  },
                );
                return (
                  <button
                    key={i}
                    onClick={() =>
                      handleSelectSlot(slot.date, slot.startTime, slot.endTime)
                    }
                    className="group flex w-full items-center gap-4 rounded-xl border bg-card p-4 text-left transition-all hover:border-primary hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium capitalize">{dayName}</p>
                      <p className="text-sm text-muted-foreground">
                        {slot.startTime.slice(0, 5)} – {slot.endTime.slice(0, 5)}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 'confirm' && selectedChild && selectedSlot && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setStep('slot')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold">Potwierdź rezerwację</h2>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Uczeń</p>
                    <p className="font-medium">
                      {selectedChild.firstName} {selectedChild.lastName} (
                      {selectedChild.gradeLevel})
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Data</p>
                    <p className="font-medium capitalize">
                      {new Date(selectedSlot.date).toLocaleDateString('pl-PL', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Godzina</p>
                    <p className="font-medium">
                      {selectedSlot.startTime} – {selectedSlot.endTime}
                    </p>
                  </div>
                </div>
              </div>

              {selectedChild.hoursRemaining <= 0 && (
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  <AlertCircle className="mb-1 inline h-4 w-4" /> Brak
                  wykupionych godzin. Lekcja zostanie zarezerwowana, ale
                  korepetytor może poprosić o wykupienie pakietu.
                </div>
              )}
            </CardContent>
          </Card>

          <Button
            onClick={handleConfirm}
            disabled={isPending}
            className="w-full"
            size="lg"
          >
            {isPending ? 'Rezerwuję...' : 'Zarezerwuj lekcję'}
          </Button>
        </div>
      )}

      {/* Step 4: Done */}
      {step === 'done' && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="mb-4 rounded-full bg-emerald-100 p-4">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <h2 className="mb-1 text-xl font-semibold">Lekcja zarezerwowana!</h2>
          <p className="mb-6 max-w-sm text-sm text-muted-foreground">
            Lekcja została pomyślnie zarezerwowana. Zobaczysz ją na swoim
            dashboardzie.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setStep('child');
                setSelectedChild(null);
                setSelectedSlot(null);
              }}
            >
              Zarezerwuj kolejną
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

function getStepIndex(step: Step): number {
  return { child: 0, slot: 1, confirm: 2, done: 3 }[step];
}

function generateUpcomingSlots(
  slots: AvailableSlot[],
  daysAhead: number,
): Array<{ date: string; startTime: string; endTime: string }> {
  const result: Array<{ date: string; startTime: string; endTime: string }> =
    [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 1; i <= daysAhead; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dayOfWeek = d.getDay();

    for (const slot of slots) {
      if (slot.dayOfWeek === dayOfWeek) {
        result.push({
          date: d.toISOString().slice(0, 10),
          startTime: slot.startTime.slice(0, 5),
          endTime: slot.endTime.slice(0, 5),
        });
      }
    }
  }

  return result;
}
