'use client';

import { useActionState, useState, useTransition } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  createPackageAction,
  togglePackageAction,
  deletePackageAction,
} from '@/server/actions/packages';
import { formatCents } from '@/lib/utils/cents';
import type { ActionState } from '@/server/actions/invitations';
import type { PackageItem } from '@/db/queries/packages';

interface PackageManagerProps {
  packages: PackageItem[];
}

export function PackageManager({ packages }: PackageManagerProps) {
  const [open, setOpen] = useState(false);
  const [isPendingAction, startAction] = useTransition();

  const [state, formAction, isPending] = useActionState<
    ActionState,
    FormData
  >(async (prev, formData) => {
    const result = await createPackageAction(prev, formData);
    if (result.success) setOpen(false);
    return result;
  }, {});

  function handleToggle(id: string, currentActive: boolean) {
    startAction(async () => {
      await togglePackageAction(id, !currentActive);
    });
  }

  function handleDelete(id: string) {
    if (!confirm('Na pewno usunąć ten pakiet?')) return;
    startAction(async () => {
      await deletePackageAction(id);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Pakiety godzin</h2>
          <p className="text-sm text-muted-foreground">
            Zdefiniuj pakiety, które rodzice mogą wykupić.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nowy pakiet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dodaj pakiet</DialogTitle>
            </DialogHeader>
            <form action={formAction} className="space-y-4">
              {state.error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {state.error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Nazwa pakietu</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="np. Pakiet 5 godzin"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Opis (opcjonalny)</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Krótki opis pakietu..."
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="hoursIncluded">Liczba godzin</Label>
                  <Input
                    id="hoursIncluded"
                    name="hoursIncluded"
                    type="number"
                    min={1}
                    max={100}
                    required
                    placeholder="5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Cena (zł)</Label>
                  <Input
                    id="price"
                    name="price"
                    placeholder="350,00"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="validityDays">Ważność (dni)</Label>
                  <Input
                    id="validityDays"
                    name="validityDays"
                    type="number"
                    min={7}
                    max={365}
                    defaultValue={60}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayOrder">Kolejność</Label>
                  <Input
                    id="displayOrder"
                    name="displayOrder"
                    type="number"
                    min={0}
                    defaultValue={0}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'Dodawanie...' : 'Dodaj pakiet'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {packages.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-12 text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-1 font-semibold">Brak pakietów</h3>
          <p className="mb-4 max-w-sm text-sm text-muted-foreground">
            Dodaj swój pierwszy pakiet godzin, aby rodzice mogli wykupywać
            lekcje.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onToggle={handleToggle}
              onDelete={handleDelete}
              disabled={isPendingAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PackageCard({
  pkg,
  onToggle,
  onDelete,
  disabled,
}: {
  pkg: PackageItem;
  onToggle: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
  disabled: boolean;
}) {
  const pricePerHour = Math.round(pkg.priceCents / pkg.hoursIncluded);

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border transition-all hover:shadow-md ${
        pkg.isActive
          ? 'border-border bg-card'
          : 'border-dashed border-muted bg-muted/30 opacity-60'
      }`}
    >
      {/* Decorative gradient top bar */}
      <div className="h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

      <div className="p-5">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h3 className="font-semibold">{pkg.name}</h3>
            {pkg.description && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {pkg.description}
              </p>
            )}
          </div>
          <Badge variant={pkg.isActive ? 'success' : 'secondary'}>
            {pkg.isActive ? 'Aktywny' : 'Ukryty'}
          </Badge>
        </div>

        <div className="mb-4 flex items-baseline gap-1">
          <span className="text-3xl font-bold tracking-tight">
            {formatCents(pkg.priceCents)}
          </span>
        </div>

        <div className="mb-4 space-y-1.5 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Godzin w pakiecie</span>
            <span className="font-medium text-foreground">
              {pkg.hoursIncluded}h
            </span>
          </div>
          <div className="flex justify-between">
            <span>Cena za godzinę</span>
            <span className="font-medium text-foreground">
              {formatCents(pricePerHour)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Ważność</span>
            <span className="font-medium text-foreground">
              {pkg.validityDays} dni
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggle(pkg.id, pkg.isActive)}
            disabled={disabled}
            className="flex-1"
          >
            {pkg.isActive ? (
              <>
                <ToggleLeft className="mr-1 h-3.5 w-3.5" />
                Ukryj
              </>
            ) : (
              <>
                <ToggleRight className="mr-1 h-3.5 w-3.5" />
                Aktywuj
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(pkg.id)}
            disabled={disabled}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
