'use client';

import { useActionState, useState, useTransition } from 'react';
import { Plus, Trash2 } from 'lucide-react';
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
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  createAvailabilitySlotAction,
  deleteAvailabilitySlotAction,
} from '@/server/actions/availability';
import type { ActionState } from '@/server/actions/invitations';
import type { AvailabilitySlotItem } from '@/db/queries/availability';

const DAYS_OF_WEEK = [
  { value: '1', label: 'Poniedziałek' },
  { value: '2', label: 'Wtorek' },
  { value: '3', label: 'Środa' },
  { value: '4', label: 'Czwartek' },
  { value: '5', label: 'Piątek' },
  { value: '6', label: 'Sobota' },
  { value: '0', label: 'Niedziela' },
];

const DAY_NAMES: Record<number, string> = {
  0: 'Niedziela',
  1: 'Poniedziałek',
  2: 'Wtorek',
  3: 'Środa',
  4: 'Czwartek',
  5: 'Piątek',
  6: 'Sobota',
};

interface AvailabilityManagerProps {
  slots: AvailabilitySlotItem[];
}

export function AvailabilityManager({ slots }: AvailabilityManagerProps) {
  const [dayOfWeek, setDayOfWeek] = useState('1');
  const [isPendingDelete, startDelete] = useTransition();

  const [state, formAction, isPending] = useActionState<
    ActionState,
    FormData
  >(async (prev, formData) => {
    formData.set('dayOfWeek', dayOfWeek);
    return await createAvailabilitySlotAction(prev, formData);
  }, {});

  function handleDelete(id: string) {
    if (!confirm('Usunąć ten slot dostępności?')) return;
    startDelete(async () => {
      await deleteAvailabilitySlotAction(id);
    });
  }

  return (
    <div className="space-y-6">
      {/* Add new slot form */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Dodaj nowy slot</h2>
        <form action={formAction} className="space-y-4">
          {state.error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="dayOfWeek">Dzień tygodnia</Label>
              <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                <SelectTrigger id="dayOfWeek">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                defaultValue="20:00"
              />
            </div>
          </div>
          <Button type="submit" disabled={isPending}>
            <Plus className="mr-2 h-4 w-4" />
            {isPending ? 'Dodawanie...' : 'Dodaj slot'}
          </Button>
        </form>
      </div>

      {/* List of existing slots */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dzień</TableHead>
              <TableHead>Od</TableHead>
              <TableHead>Do</TableHead>
              <TableHead className="text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slots.length === 0 ? (
              <TableEmpty>
                Brak skonfigurowanych slotów dostępności.
              </TableEmpty>
            ) : (
              slots.map((slot) => (
                <TableRow key={slot.id}>
                  <TableCell className="font-medium">
                    {DAY_NAMES[slot.dayOfWeek]}
                  </TableCell>
                  <TableCell>{slot.startTime.slice(0, 5)}</TableCell>
                  <TableCell>{slot.endTime.slice(0, 5)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(slot.id)}
                      disabled={isPendingDelete}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
