import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ChevronLeft,
  Clock,
  Calendar,
  FileText,
  Star,
  CheckCircle2,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SubmitTaskForm } from '@/components/student/submit-task-form';
import { requireRole } from '@/lib/auth/session';
import { getTaskDetail } from '@/db/queries/tasks';
import { formatDateTimePL, formatDatePL } from '@/lib/utils/dates';

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'default' | 'warning' | 'success' | 'secondary' }
> = {
  todo: { label: 'Do zrobienia', variant: 'secondary' },
  submitted: { label: 'Przesłane', variant: 'warning' },
  graded: { label: 'Ocenione', variant: 'success' },
  returned: { label: 'Do poprawy', variant: 'default' },
};

export default async function StudentTaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole('student');
  const { id } = await params;
  const task = await getTaskDetail(id);

  if (!task) notFound();

  const config = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.todo;
  const canSubmit = task.status === 'todo' || task.status === 'returned';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/student/tasks">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{task.title}</h1>
          <p className="text-sm text-muted-foreground">
            {formatDateTimePL(task.createdAt)}
          </p>
        </div>
        <Badge variant={config.variant}>{config.label}</Badge>
      </div>

      {/* Task description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Treść zadania</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm">{task.description}</p>
          {task.dueDate && (
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Termin: {formatDatePL(task.dueDate)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grade card */}
      {task.status === 'graded' && task.grade && (
        <Card className="overflow-hidden border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-emerald-50/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span className="font-semibold text-emerald-800">Ocena</span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={`h-6 w-6 ${
                      n <= task.grade!
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
              <span className="text-2xl font-bold">{task.grade}/5</span>
            </div>
            {task.tutorFeedback && (
              <div className="mt-3 rounded-lg bg-white/60 p-3">
                <p className="text-sm font-medium text-muted-foreground">
                  Komentarz korepetytora:
                </p>
                <p className="mt-1 text-sm">{task.tutorFeedback}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Return notice */}
      {task.status === 'returned' && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-amber-800">
              Korepetytor zwrócił zadanie do poprawy.
            </p>
            {task.tutorFeedback && (
              <p className="mt-1 text-sm text-amber-700">
                {task.tutorFeedback}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Previous submissions */}
      {task.submissions.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">
            Twoje rozwiązania ({task.submissions.length})
          </h2>
          {task.submissions.map((sub) => (
            <Card key={sub.id}>
              <CardContent className="pt-4">
                <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDateTimePL(sub.submittedAt)}
                </div>
                {sub.textContent && (
                  <p className="whitespace-pre-wrap text-sm">
                    {sub.textContent}
                  </p>
                )}
                {sub.fileUrls.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {sub.fileUrls.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <FileText className="h-3 w-3" />
                        Załącznik {i + 1}
                      </a>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Submit form */}
      {canSubmit && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Wyślij rozwiązanie</h2>
          <SubmitTaskForm taskId={task.id} />
        </div>
      )}
    </div>
  );
}
