'use client';

import { useActionState, useState } from 'react';
import { MessageCirclePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { createQAThreadAction } from '@/server/actions/qa';
import type { ActionState } from '@/server/actions/invitations';

export function CreateQAThreadDialog() {
  const [open, setOpen] = useState(false);

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    async (prev, formData) => {
      const result = await createQAThreadAction(prev, formData);
      if (result.success) setOpen(false);
      return result;
    },
    {},
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <MessageCirclePlus className="mr-2 h-4 w-4" />
          Zadaj pytanie
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nowe pytanie</DialogTitle>
          <DialogDescription>
            Zadaj pytanie korepetytorowi. Odpowiedź otrzymasz w wiadomościach.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="contextType" value="general" />

          <div className="space-y-2">
            <Label htmlFor="title">Temat</Label>
            <Input
              id="title"
              name="title"
              required
              placeholder="np. Jak rozwiązać równanie kwadratowe?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="firstMessage">Treść pytania</Label>
            <Textarea
              id="firstMessage"
              name="firstMessage"
              required
              rows={4}
              placeholder="Opisz swoje pytanie..."
            />
          </div>

          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Wysyłanie...' : 'Wyślij pytanie'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
