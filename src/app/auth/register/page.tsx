import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { verifyInviteToken } from '@/lib/auth/invite-token';
import { RegisterForm } from './register-form';
import { EXAM_TARGETS } from '@/lib/constants';

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Rejestracja</CardTitle>
          <CardDescription>
            Rejestracja jest możliwa tylko przez zaproszenie od korepetytora.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Jeśli otrzymałeś zaproszenie, kliknij w link z maila, aby
            dokończyć rejestrację.
          </p>
        </CardContent>
      </Card>
    );
  }

  const payload = await verifyInviteToken(token);

  if (!payload) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Nieprawidłowe zaproszenie</CardTitle>
          <CardDescription>
            Link do rejestracji wygasł lub jest nieprawidłowy. Skontaktuj się
            z korepetytorem, aby otrzymać nowy.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Witaj, {payload.firstName}!</CardTitle>
        <CardDescription>
          Ustaw hasło, aby dokończyć rejestrację.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border bg-muted/30 p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Imię i nazwisko:</span>
            <span className="font-medium">
              {payload.firstName} {payload.lastName}
            </span>
          </div>
          <div className="mt-1 flex justify-between">
            <span className="text-muted-foreground">Email:</span>
            <span className="font-medium">{payload.email}</span>
          </div>
          {payload.role === 'student' && payload.gradeLevel && (
            <>
              <div className="mt-1 flex justify-between">
                <span className="text-muted-foreground">Klasa:</span>
                <span className="font-medium">{payload.gradeLevel}</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="text-muted-foreground">Cel:</span>
                <span className="font-medium">
                  {EXAM_TARGETS[payload.examTarget ?? 'none']}
                </span>
              </div>
            </>
          )}
        </div>
        <RegisterForm token={token} />
      </CardContent>
    </Card>
  );
}
