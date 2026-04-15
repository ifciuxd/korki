import Link from 'next/link';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateTaskDialog } from '@/components/admin/create-task-dialog';
import { listAllTasks } from '@/db/queries/tasks';
import { listStudents } from '@/db/queries/students';
import { formatDatePL, formatDateTimePL } from '@/lib/utils/dates';

export const dynamic = 'force-dynamic';

async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn(); } catch { return fallback; }
}

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'default' | 'warning' | 'success' | 'secondary' | 'destructive'; icon: typeof Clock }
> = {
  todo: { label: 'Do zrobienia', variant: 'secondary', icon: Clock },
  submitted: { label: 'Przesłane', variant: 'warning', icon: AlertCircle },
  graded: { label: 'Ocenione', variant: 'success', icon: CheckCircle2 },
  returned: { label: 'Zwrócone', variant: 'default', icon: ClipboardList },
};

export default async function AdminTasksPage() {
  const [allTasks, students] = await Promise.all([
    safeQuery(() => listAllTasks(100), []),
    safeQuery(() => listStudents(), []),
  ]);

  const studentOptions = students.map((s) => ({
    id: s.id,
    label: `${s.firstName} ${s.lastName} (${s.gradeLevel})`,
  }));

  const pendingReview = allTasks.filter((t) => t.status === 'submitted');
  const activeTasks = allTasks.filter((t) => t.status === 'todo' || t.status === 'returned');
  const completedTasks = allTasks.filter((t) => t.status === 'graded');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Zadania</h1>
          <p className="text-sm text-muted-foreground">
            Zarządzaj zadaniami domowymi uczniów
          </p>
        </div>
        <CreateTaskDialog students={studentOptions} />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Do sprawdzenia</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReview.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktywne</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTasks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ocenione</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="review">
        <TabsList>
          <TabsTrigger value="review">
            Do sprawdzenia ({pendingReview.length})
          </TabsTrigger>
          <TabsTrigger value="active">Aktywne</TabsTrigger>
          <TabsTrigger value="all">Wszystkie</TabsTrigger>
        </TabsList>

        <TabsContent value="review">
          <TaskList tasks={pendingReview} />
        </TabsContent>
        <TabsContent value="active">
          <TaskList tasks={activeTasks} />
        </TabsContent>
        <TabsContent value="all">
          <TaskList tasks={allTasks} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TaskList({ tasks }: { tasks: ReturnType<typeof listAllTasks> extends Promise<infer T> ? T : never }) {
  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-12">
          <ClipboardList className="mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Brak zadań</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => {
        const config = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.todo;
        const StatusIcon = config.icon;

        return (
          <Link
            key={task.id}
            href={`/admin/tasks/${task.id}`}
            className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/30"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <StatusIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{task.title}</p>
              <p className="text-sm text-muted-foreground">
                {task.studentName}
                {task.dueDate && ` · termin: ${formatDatePL(task.dueDate)}`}
                {' · '}
                {formatDateTimePL(task.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {task.grade && (
                <Badge variant="success">{task.grade}/5</Badge>
              )}
              <Badge variant={config.variant}>{config.label}</Badge>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
