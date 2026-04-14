'use client';

import { useActionState, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { assignMaterialAction } from '@/server/actions/materials';
import type { ActionState } from '@/server/actions/invitations';

interface Props {
  materialId: string;
  students: { id: string; label: string }[];
}

export function AssignMaterialDialog({ materialId, students }: Props) {
  const [open, setOpen] = useState(false);

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    async (prev, formData) => {
      const result = await assignMaterialAction(prev, formData);
      if (result.success) setOpen(false);
      return result;
    },
    {},
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <UserPlus className="mr-1.5 h-3.5 w-3.5" />
          Przypisz
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Przypisz materiał</DialogTitle>
          <DialogDescription>
            Wybierz ucznia, któremu przypisać ten materiał.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="materialId" value={materialId} />

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

          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Przypisywanie...' : 'Przypisz'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
