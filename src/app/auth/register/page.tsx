import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Rejestracja</CardTitle>
        <CardDescription>
          Rejestracja jest możliwa tylko przez zaproszenie od korepetytora.
          Sprawdź swoją skrzynkę email.
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
