'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  completeRegistrationAction,
  type ActionState,
} from '@/server/actions/invitations';

export function RegisterForm({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState<
    ActionState,
    FormData
  >(completeRegistrationAction, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      {state.error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="password">Hasło</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
        <p className="text-xs text-muted-foreground">Minimum 8 znaków</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Powtórz hasło</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>
      <div className="flex items-start gap-2">
        <input
          id="acceptTerms"
          name="acceptTerms"
          type="checkbox"
          required
          className="mt-1"
        />
        <Label htmlFor="acceptTerms" className="text-sm font-normal">
          Akceptuję regulamin i politykę prywatności (RODO).
        </Label>
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Tworzenie konta...' : 'Utwórz konto'}
      </Button>
    </form>
  );
}
