'use client';

import { useActionState } from 'react';
import { FileText, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { saveLessonReportAction } from '@/server/actions/lessons';
import type { ActionState } from '@/server/actions/invitations';

interface LessonReportFormProps {
  lessonId: string;
  existing?: {
    rawNotes: string | null;
    topicsCovered: string[];
    homeworkAssigned: string | null;
    studentPerformance: number | null;
    notesForParent: string | null;
  } | null;
}

export function LessonReportForm({
  lessonId,
  existing,
}: LessonReportFormProps) {
  const [state, formAction, isPending] = useActionState<
    ActionState,
    FormData
  >(saveLessonReportAction, {});

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="lessonId" value={lessonId} />

      {state.error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
          Raport zapisany pomyślnie.
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="rawNotes">Notatki z lekcji</Label>
        <Textarea
          id="rawNotes"
          name="rawNotes"
          rows={4}
          placeholder="Co było omawiane, jakie zadania rozwiązywaliście..."
          defaultValue={existing?.rawNotes ?? ''}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="topicsCovered">Tematy (po przecinku)</Label>
        <Input
          id="topicsCovered"
          name="topicsCovered"
          placeholder="np. Funkcja kwadratowa, Nierówności"
          defaultValue={existing?.topicsCovered?.join(', ') ?? ''}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="homeworkAssigned">Zadana praca domowa</Label>
        <Textarea
          id="homeworkAssigned"
          name="homeworkAssigned"
          rows={2}
          placeholder="Jakie zadania uczeń ma zrobić na następną lekcję..."
          defaultValue={existing?.homeworkAssigned ?? ''}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="studentPerformance">
          Ocena pracy ucznia (1–5)
        </Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((val) => (
            <label key={val} className="cursor-pointer">
              <input
                type="radio"
                name="studentPerformance"
                value={val}
                defaultChecked={existing?.studentPerformance === val}
                className="peer sr-only"
              />
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border transition-all peer-checked:border-amber-400 peer-checked:bg-amber-50 peer-checked:text-amber-600 hover:bg-muted">
                <Star className="h-4 w-4" />
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notesForParent">Uwagi dla rodzica</Label>
        <Textarea
          id="notesForParent"
          name="notesForParent"
          rows={2}
          placeholder="Informacje widoczne dla rodzica..."
          defaultValue={existing?.notesForParent ?? ''}
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        <FileText className="mr-2 h-4 w-4" />
        {isPending ? 'Zapisywanie...' : existing ? 'Zaktualizuj raport' : 'Zapisz raport'}
      </Button>
    </form>
  );
}
