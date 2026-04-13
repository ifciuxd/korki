'use client';

import { useActionState, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { recordManualPaymentAction } from '@/server/actions/payments';
import type { ActionState } from '@/server/actions/invitations';

interface ParentOption {
  id: string;
  label: string;
}

interface StudentOption {
  id: string;
  label: string;
  parentId: string | null;
}

interface PackageOption {
  id: string;
  label: string;
}

interface RecordPaymentDialogProps {
  parents: ParentOption[];
  students: StudentOption[];
  packages: PackageOption[];
}

export function RecordPaymentDialog({
  parents,
  students,
  packages,
}: RecordPaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [parentId, setParentId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [packageId, setPackageId] = useState('');

  const filteredStudents = parentId
    ? students.filter((s) => s.parentId === parentId)
    : students;

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    async (prev, formData) => {
      formData.set('parentId', parentId);
      formData.set('studentId', studentId);
      formData.set('packageId', packageId);
      const result = await recordManualPaymentAction(prev, formData);
      if (result.success) {
        setOpen(false);
        setParentId('');
        setStudentId('');
        setPackageId('');
      }
      return result;
    },
    {},
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Zarejestruj wpłatę
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Zarejestruj wpłatę ręczną</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          {state.error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Label>Rodzic</Label>
            <Select value={parentId} onValueChange={(v) => {
              setParentId(v);
              setStudentId('');
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz rodzica..." />
              </SelectTrigger>
              <SelectContent>
                {parents.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Uczeń</Label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz ucznia..." />
              </SelectTrigger>
              <SelectContent>
                {filteredStudents.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Pakiet</Label>
            <Select value={packageId} onValueChange={setPackageId}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz pakiet..." />
              </SelectTrigger>
              <SelectContent>
                {packages.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payDescription">Opis (opcjonalny)</Label>
            <Input
              id="payDescription"
              name="description"
              placeholder="np. Gotówka na lekcji"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isPending || !parentId || !studentId || !packageId}
          >
            {isPending ? 'Rejestrowanie...' : 'Zarejestruj wpłatę'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
