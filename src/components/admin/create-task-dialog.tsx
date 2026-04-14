'use client';

import { useActionState, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { createTaskAction } from '@/server/actions/tasks';
import type { ActionState } from '@/server/actions/invitations';

interface Props {
  students: { id: string; label: string }[];
}

export function CreateTaskDialog({ students }: Props) {
  const [open, setOpen] = useState(false);

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    async (prev, formData) => {
      const result = await createTaskAction(prev, formData);
      if (result.success) setOpen(false);
      return result;
    },
    {},
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nowe zadanie
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nowe zadanie domowe</DialogTitle>
          <DialogDescription>
            Przypisz zadanie do wybranego ucznia.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="studentId">Uczeń</Label>
            <select
              id="studentId"
              name="studentId"
              required
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="">Wybierz ucznia...</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Tytuł</Label>
            <Input id="title" name="title" required placeholder="np. Zad. 1-5 str. 42" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Opis / treść zadania</Label>
            <Textarea
              id="description"
              name="description"
              required
              rows={4}
              placeholder="Opisz co uczeń ma zrobić..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Termin (opcjonalnie)</Label>
            <Input id="dueDate" name="dueDate" type="date" />
          </div>

          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Tworzenie...' : 'Utwórz zadanie'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
