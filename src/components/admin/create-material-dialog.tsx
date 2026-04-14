'use client';

import { useActionState, useState } from 'react';
import { Plus, FileText, Link2, Video } from 'lucide-react';
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
import { createMaterialAction } from '@/server/actions/materials';
import type { ActionState } from '@/server/actions/invitations';

interface Props {
  topics: { slug: string; name: string; category: string }[];
}

const FILE_TYPES = [
  { value: 'pdf', label: 'PDF', icon: FileText },
  { value: 'video', label: 'Wideo', icon: Video },
  { value: 'link', label: 'Link', icon: Link2 },
] as const;

export function CreateMaterialDialog({ topics }: Props) {
  const [open, setOpen] = useState(false);
  const [fileType, setFileType] = useState<string>('pdf');

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    async (prev, formData) => {
      const result = await createMaterialAction(prev, formData);
      if (result.success) setOpen(false);
      return result;
    },
    {},
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Dodaj materiał
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nowy materiał</DialogTitle>
          <DialogDescription>
            Dodaj materiał edukacyjny — plik, wideo lub link.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tytuł</Label>
            <Input id="title" name="title" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Opis</Label>
            <Textarea id="description" name="description" rows={2} />
          </div>

          <div className="space-y-2">
            <Label>Typ</Label>
            <div className="flex gap-2">
              {FILE_TYPES.map((ft) => (
                <button
                  key={ft.value}
                  type="button"
                  onClick={() => setFileType(ft.value)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
                    fileType === ft.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'hover:bg-muted'
                  }`}
                >
                  <ft.icon className="h-3.5 w-3.5" />
                  {ft.label}
                </button>
              ))}
            </div>
            <input type="hidden" name="fileType" value={fileType} />
          </div>

          {(fileType === 'pdf' || fileType === 'video') && (
            <div className="space-y-2">
              <Label htmlFor="fileUrl">URL pliku</Label>
              <Input
                id="fileUrl"
                name="fileUrl"
                type="url"
                placeholder="https://..."
              />
            </div>
          )}

          {fileType === 'link' && (
            <div className="space-y-2">
              <Label htmlFor="externalUrl">Link zewnętrzny</Label>
              <Input
                id="externalUrl"
                name="externalUrl"
                type="url"
                placeholder="https://..."
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="topicSlug">Dział matematyki</Label>
            <select
              id="topicSlug"
              name="topicSlug"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="">— brak —</option>
              {topics.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.name} ({t.category})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublic"
              name="isPublic"
              value="true"
              className="h-4 w-4 rounded border"
            />
            <Label htmlFor="isPublic" className="text-sm font-normal">
              Widoczny dla wszystkich uczniów
            </Label>
          </div>

          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Zapisywanie...' : 'Dodaj materiał'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
