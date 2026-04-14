'use client';

import { useActionState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { submitTaskAction } from '@/server/actions/tasks';
import type { ActionState } from '@/server/actions/invitations';

interface Props {
  taskId: string;
}

export function SubmitTaskForm({ taskId }: Props) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    submitTaskAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-3 rounded-xl border bg-card p-4">
      <input type="hidden" name="taskId" value={taskId} />

      <div className="space-y-2">
        <Label htmlFor="textContent">Twoja odpowiedź</Label>
        <Textarea
          id="textContent"
          name="textContent"
          rows={4}
          placeholder="Wpisz rozwiązanie lub opis..."
        />
      </div>

      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      {state.success && (
        <p className="text-sm text-emerald-600">Zadanie przesłane!</p>
      )}

      <Button type="submit" disabled={isPending}>
        <Send className="mr-2 h-4 w-4" />
        {isPending ? 'Wysyłanie...' : 'Wyślij rozwiązanie'}
      </Button>
    </form>
  );
}
