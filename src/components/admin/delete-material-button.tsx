'use client';

import { useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteMaterialAction } from '@/server/actions/materials';

interface Props {
  materialId: string;
}

export function DeleteMaterialButton({ materialId }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm('Czy na pewno chcesz usunąć ten materiał?')) return;
    startTransition(async () => {
      await deleteMaterialAction(materialId);
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={handleDelete}
      className="text-destructive hover:text-destructive"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}
