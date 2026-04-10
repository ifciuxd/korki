'use client';

import { useActionState } from 'react';
import { loginAction, type LoginState } from '@/server/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    loginAction,
    {},
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Logowanie</CardTitle>
        <CardDescription>
          Zaloguj się do swojego konta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state.error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="jan@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Hasło</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Logowanie...' : 'Zaloguj się'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
