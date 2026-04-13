'use client';

import { useTransition } from 'react';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { updateLessonStatusAction } from '@/server/actions/lessons';

interface LessonStatusActionsProps {
  lessonId: string;
  currentStatus: string;
}

export function LessonStatusActions({
  lessonId,
  currentStatus,
}: LessonStatusActionsProps) {
  const [isPending, startTransition] = useTransition();

  if (currentStatus !== 'scheduled') return null;

  function handleStatus(status: 'completed' | 'cancelled' | 'no_show') {
    if (status === 'cancelled') {
      const reason = prompt('Powód odwołania (opcjonalnie):');
      startTransition(async () => {
        await updateLessonStatusAction(lessonId, status, reason ?? undefined);
      });
    } else {
      startTransition(async () => {
        await updateLessonStatusAction(lessonId, status);
      });
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() => handleStatus('completed')}
        className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
      >
        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
        Oznacz jako odbytoą
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() => handleStatus('cancelled')}
        className="border-muted text-muted-foreground hover:bg-muted"
      >
        <XCircle className="mr-1.5 h-3.5 w-3.5" />
        Odwołaj
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() => handleStatus('no_show')}
        className="border-destructive/30 text-destructive hover:bg-destructive/10"
      >
        <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
        Nieobecność
      </Button>
    </div>
  );
}
