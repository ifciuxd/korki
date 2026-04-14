import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QAMessageForm } from '@/components/shared/qa-message-form';
import { QAThreadActions } from '@/components/shared/qa-thread-actions';
import { getQAThreadWithMessages } from '@/db/queries/qa';
import { formatDateTimePL } from '@/lib/utils/dates';

export default async function AdminQAThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getQAThreadWithMessages(id);

  if (!data) notFound();

  const { thread, messages } = data;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/qa">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{thread.title}</h1>
          <p className="text-sm text-muted-foreground">
            {thread.studentName} · {formatDateTimePL(thread.createdAt)}
          </p>
        </div>
        <QAThreadActions threadId={thread.id} isResolved={thread.isResolved} />
      </div>

      {thread.isResolved && (
        <Badge variant="success" className="text-sm">
          Rozwiązane
        </Badge>
      )}

      {/* Messages */}
      <div className="space-y-3">
        {messages.map((msg) => {
          const isAdmin = msg.authorRole === 'admin';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isAdmin ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isAdmin
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {msg.authorName[0]}
              </div>
              <Card
                className={`max-w-[80%] ${
                  isAdmin ? 'border-primary/20 bg-primary/5' : ''
                }`}
              >
                <CardContent className="px-4 py-3">
                  <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium">
                      {msg.authorName}
                    </span>
                    <span>{formatDateTimePL(msg.createdAt)}</span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Reply form */}
      {!thread.isResolved && (
        <div className="rounded-xl border bg-card p-4">
          <p className="mb-2 text-sm font-medium">Odpowiedz</p>
          <QAMessageForm threadId={thread.id} />
        </div>
      )}
    </div>
  );
}
