'use client';

import { useTransition } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { returnTaskAction } from '@/server/actions/tasks';

interface Props {
  taskId: string;
}

export function ReturnTaskButton({ taskId }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleReturn = () => {
    startTransition(async () => {
      await returnTaskAction(taskId);
    });
  };

  return (
    <Button variant="outline" disabled={isPending} onClick={handleReturn}>
      <RotateCcw className="mr-2 h-4 w-4" />
      {isPending ? 'Zwracanie...' : 'Zwróć do poprawy'}
    </Button>
  );
}
