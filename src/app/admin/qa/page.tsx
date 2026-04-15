import Link from 'next/link';
import {
  MessageCircle,
  CheckCircle2,
  Clock,
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
import { listAllQAThreads } from '@/db/queries/qa';
import { formatDateTimePL } from '@/lib/utils/dates';

export const dynamic = 'force-dynamic';

async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn(); } catch { return fallback; }
}

const CONTEXT_LABELS: Record<string, string> = {
  general: 'Ogólne',
  task: 'Zadanie',
  lesson: 'Lekcja',
};

export default async function AdminQAPage() {
  const allThreads = await safeQuery(() => listAllQAThreads(100), []);

  const openThreads = allThreads.filter((t) => !t.isResolved);
  const resolvedThreads = allThreads.filter((t) => t.isResolved);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pytania i odpowiedzi</h1>
        <p className="text-sm text-muted-foreground">
          Odpowiadaj na pytania uczniów
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Otwarte</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openThreads.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rozwiązane</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolvedThreads.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="open">
        <TabsList>
          <TabsTrigger value="open">
            Otwarte ({openThreads.length})
          </TabsTrigger>
          <TabsTrigger value="resolved">Rozwiązane</TabsTrigger>
          <TabsTrigger value="all">Wszystkie</TabsTrigger>
        </TabsList>

        <TabsContent value="open">
          <ThreadList threads={openThreads} />
        </TabsContent>
        <TabsContent value="resolved">
          <ThreadList threads={resolvedThreads} />
        </TabsContent>
        <TabsContent value="all">
          <ThreadList threads={allThreads} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ThreadList({
  threads,
}: {
  threads: ReturnType<typeof listAllQAThreads> extends Promise<infer T>
    ? T
    : never;
}) {
  if (threads.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-12">
          <MessageCircle className="mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Brak wątków</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {threads.map((thread) => (
        <Link
          key={thread.id}
          href={`/admin/qa/${thread.id}`}
          className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/30"
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              thread.isResolved
                ? 'bg-emerald-100 text-emerald-600'
                : 'bg-amber-100 text-amber-600'
            }`}
          >
            {thread.isResolved ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <MessageCircle className="h-5 w-5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{thread.title}</p>
            <p className="text-sm text-muted-foreground">
              {thread.studentName} ·{' '}
              {CONTEXT_LABELS[thread.contextType] ?? thread.contextType} ·{' '}
              {formatDateTimePL(thread.lastMessageAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {thread.messageCount} wiad.
            </Badge>
            {thread.isResolved ? (
              <Badge variant="success">Rozwiązane</Badge>
            ) : (
              <Badge variant="warning">Otwarte</Badge>
            )}
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </Link>
      ))}
    </div>
  );
}
