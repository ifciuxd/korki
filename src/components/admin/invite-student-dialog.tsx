'use client';

import { useActionState, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  inviteStudentAction,
  type ActionState,
} from '@/server/actions/invitations';
import { GRADE_LEVELS, EXAM_TARGETS } from '@/lib/constants';

interface InviteStudentDialogProps {
  parents: Array<{ id: string; label: string }>;
}

export function InviteStudentDialog({ parents }: InviteStudentDialogProps) {
  const [open, setOpen] = useState(false);
  const [gradeLevel, setGradeLevel] = useState<string>('');
  const [examTarget, setExamTarget] = useState<string>('none');
  const [parentId, setParentId] = useState<string>('');

  const [state, formAction, isPending] = useActionState<
    ActionState,
    FormData
  >(async (prev, formData) => {
    formData.set('gradeLevel', gradeLevel);
    formData.set('examTarget', examTarget);
    formData.set('parentId', parentId);
    const result = await inviteStudentAction(prev, formData);
    if (result.success) {
      setTimeout(() => setOpen(false), 1500);
    }
    return result;
  }, {});

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Zaproś ucznia
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Zaproś ucznia</DialogTitle>
          <DialogDescription>
            Wyślij email z linkiem do rejestracji. Link wygaśnie za 7 dni.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          {state.error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}
          {state.success && (
            <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">
              Zaproszenie zostało wysłane.
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">Imię</Label>
              <Input id="firstName" name="firstName" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nazwisko</Label>
              <Input id="lastName" name="lastName" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="gradeLevel">Klasa</Label>
              <Select value={gradeLevel} onValueChange={setGradeLevel}>
                <SelectTrigger id="gradeLevel">
                  <SelectValue placeholder="Wybierz klasę" />
                </SelectTrigger>
                <SelectContent>
                  {GRADE_LEVELS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="examTarget">Cel</Label>
              <Select value={examTarget} onValueChange={setExamTarget}>
                <SelectTrigger id="examTarget">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EXAM_TARGETS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="parentId">Rodzic (opcjonalnie)</Label>
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger id="parentId">
                <SelectValue placeholder="Brak przypisanego rodzica" />
              </SelectTrigger>
              <SelectContent>
                {parents.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    Brak rodziców w systemie
                  </div>
                ) : (
                  parents.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Wysyłanie...' : 'Wyślij zaproszenie'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
