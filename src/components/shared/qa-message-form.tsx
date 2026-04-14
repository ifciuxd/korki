'use client';

import { useActionState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { sendQAMessageAction } from '@/server/actions/qa';
import type { ActionState } from '@/server/actions/invitations';

interface Props {
  threadId: string;
}

export function QAMessageForm({ threadId }: Props) {
  const [, formAction, isPending] = useActionState<ActionState, FormData>(
    sendQAMessageAction,
    {},
  );

  return (
    <form action={formAction} className="flex gap-2">
      <input type="hidden" name="threadId" value={threadId} />
      <Textarea
        name="content"
        required
        rows={2}
        placeholder="Napisz wiadomość..."
        className="flex-1 resize-none"
      />
      <Button type="submit" disabled={isPending} size="icon" className="shrink-0 self-end">
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
