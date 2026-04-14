'use client';

import { useTransition } from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { resolveQAThreadAction, reopenQAThreadAction } from '@/server/actions/qa';

interface Props {
  threadId: string;
  isResolved: boolean;
}

export function QAThreadActions({ threadId, isResolved }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      if (isResolved) {
        await reopenQAThreadAction(threadId);
      } else {
        await resolveQAThreadAction(threadId);
      }
    });
  };

  return (
    <Button
      variant={isResolved ? 'outline' : 'default'}
      size="sm"
      disabled={isPending}
      onClick={handleToggle}
    >
      {isResolved ? (
        <>
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          {isPending ? 'Otwieranie...' : 'Otwórz ponownie'}
        </>
      ) : (
        <>
          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
          {isPending ? 'Zamykanie...' : 'Oznacz jako rozwiązane'}
        </>
      )}
    </Button>
  );
}
