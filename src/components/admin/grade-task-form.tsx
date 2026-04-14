'use client';

import { useActionState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils/cn';
import { gradeTaskAction } from '@/server/actions/tasks';
import type { ActionState } from '@/server/actions/invitations';

interface Props {
  taskId: string;
  currentGrade?: number | null;
  currentFeedback?: string | null;
}

export function GradeTaskForm({ taskId, currentGrade, currentFeedback }: Props) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    gradeTaskAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-4 rounded-xl border bg-card p-4">
      <input type="hidden" name="taskId" value={taskId} />

      <div className="space-y-2">
        <Label>Ocena (1-5)</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer">
              <input
                type="radio"
                name="grade"
                value={n}
                defaultChecked={currentGrade === n}
                className="peer sr-only"
              />
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border transition-colors peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary hover:bg-muted">
                <Star className={cn('h-5 w-5', n <= (currentGrade ?? 0) && 'fill-current')} />
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tutorFeedback">Komentarz dla ucznia</Label>
        <Textarea
          id="tutorFeedback"
          name="tutorFeedback"
          rows={3}
          defaultValue={currentFeedback ?? ''}
          placeholder="Świetna robota! / Popraw zadanie 3..."
        />
      </div>

      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      {state.success && (
        <p className="text-sm text-emerald-600">Ocena zapisana!</p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Zapisywanie...' : 'Oceń zadanie'}
      </Button>
    </form>
  );
}
