import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ChevronLeft,
  Clock,
  Calendar,
  FileText,
  Star,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GradeTaskForm } from '@/components/admin/grade-task-form';
import { ReturnTaskButton } from '@/components/admin/return-task-button';
import { getTaskDetail } from '@/db/queries/tasks';
import { formatDateTimePL, formatDatePL } from '@/lib/utils/dates';

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'default' | 'warning' | 'success' | 'secondary' }
> = {
  todo: { label: 'Do zrobienia', variant: 'secondary' },
  submitted: { label: 'Przesłane', variant: 'warning' },
  graded: { label: 'Ocenione', variant: 'success' },
  returned: { label: 'Zwrócone', variant: 'default' },
};

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const task = await getTaskDetail(id);

  if (!task) notFound();

  const config = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.todo;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/tasks">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{task.title}</h1>
          <p className="text-sm text-muted-foreground">
            {task.studentName} · {formatDateTimePL(task.createdAt)}
          </p>
        </div>
        <Badge variant={config.variant}>{config.label}</Badge>
      </div>

      {/* Task details */}
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

      {/* Submissions */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">
          Przesłane rozwiązania ({task.submissions.length})
        </h2>
        {task.submissions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-8">
              <FileText className="mb-2 h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Uczeń jeszcze nie przesłał rozwiązania
              </p>
            </CardContent>
          </Card>
        ) : (
          task.submissions.map((sub) => (
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
          ))
        )}
      </div>

      {/* Grade section */}
      {task.status === 'graded' && task.grade && (
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={`h-5 w-5 ${
                      n <= task.grade!
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-bold">{task.grade}/5</span>
            </div>
            {task.tutorFeedback && (
              <p className="mt-2 text-sm">{task.tutorFeedback}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Grade form (for submitted tasks) */}
      {(task.status === 'submitted' || task.status === 'returned') && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Oceń zadanie</h2>
          <GradeTaskForm
            taskId={task.id}
            currentGrade={task.grade}
            currentFeedback={task.tutorFeedback}
          />
        </div>
      )}

      {/* Return task button */}
      {task.status === 'submitted' && (
        <ReturnTaskButton taskId={task.id} />
      )}
    </div>
  );
}
