'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertTriangle className="mb-4 h-10 w-10 text-amber-500" />
      <h2 className="text-xl font-bold">Nie udało się załadować strony</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Prawdopodobnie baza danych nie jest jeszcze skonfigurowana.
        Uruchom migracje SQL w Supabase Dashboard.
      </p>
      <p className="mt-2 max-w-md font-mono text-xs text-destructive/70">
        {error.message}
      </p>
      <Button onClick={reset} variant="outline" className="mt-6">
        Spróbuj ponownie
      </Button>
    </div>
  );
}
