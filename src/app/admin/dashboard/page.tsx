import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, Wallet, Clock } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Aktywni uczniowie"
          value="—"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Lekcje w tym tygodniu"
          value="—"
          icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Przychód (miesiąc)"
          value="—"
          icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Nadchodzące lekcje"
          value="—"
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Upcoming lessons placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Nadchodzące lekcje</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Brak zaplanowanych lekcji. Dodaj lekcję w kalendarzu.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function StatsCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
