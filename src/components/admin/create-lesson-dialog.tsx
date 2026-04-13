'use client';

import { useActionState, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { createLessonAction } from '@/server/actions/lessons';
import type { ActionState } from '@/server/actions/invitations';

interface StudentOption {
  id: string;
  label: string;
}

interface CreateLessonDialogProps {
  students: StudentOption[];
  defaultDate?: string;
}

export function CreateLessonDialog({
  students,
  defaultDate,
}: CreateLessonDialogProps) {
  const [open, setOpen] = useState(false);
  const [studentId, setStudentId] = useState('');

  const [state, formAction, isPending] = useActionState<
    ActionState,
    FormData
  >(async (prev, formData) => {
    formData.set('studentId', studentId);
    const result = await createLessonAction(prev, formData);
    if (result.success) setOpen(false);
    return result;
  }, {});

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nowa lekcja
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Zaplanuj lekcję</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          {state.error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}
          <div className="space-y-2">
            <Label>Uczeń</Label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz ucznia..." />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              name="date"
              type="date"
              required
              defaultValue={defaultDate}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="startTime">Od</Label>
              <Input
                id="startTime"
                name="startTime"
                type="time"
                required
                defaultValue="16:00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Do</Label>
              <Input
                id="endTime"
                name="endTime"
                type="time"
                required
                defaultValue="17:00"
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isPending || !studentId}>
            {isPending ? 'Planowanie...' : 'Zaplanuj lekcję'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
