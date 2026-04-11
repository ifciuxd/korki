import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, Wallet, Clock, UserCog } from 'lucide-react';
import { countStudents } from '@/db/queries/students';
import { countParents } from '@/db/queries/parents';
import { listAvailabilitySlots } from '@/db/queries/availability';

const DAY_NAMES: Record<number, string> = {
  0: 'Niedziela',
  1: 'Poniedziałek',
  2: 'Wtorek',
  3: 'Środa',
  4: 'Czwartek',
  5: 'Piątek',
  6: 'Sobota',
};

export default async function AdminDashboard() {
  const [studentsCount, parentsCount, slots] = await Promise.all([
    countStudents(),
    countParents(),
    listAvailabilitySlots(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Aktywni uczniowie"
          value={String(studentsCount)}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          href="/admin/students"
        />
        <StatsCard
          title="Rodzice"
          value={String(parentsCount)}
          icon={<UserCog className="h-4 w-4 text-muted-foreground" />}
          href="/admin/parents"
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
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Upcoming lessons placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Nadchodzące lekcje</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Brak zaplanowanych lekcji. Funkcja kalendarza będzie dostępna w
              kolejnym sprincie.
            </p>
          </CardContent>
        </Card>

        {/* Availability summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Twoja dostępność
            </CardTitle>
            <Link
              href="/admin/availability"
              className="text-xs text-muted-foreground hover:underline"
            >
              Edytuj
            </Link>
          </CardHeader>
          <CardContent>
            {slots.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nie skonfigurowałeś jeszcze żadnych slotów dostępności.
              </p>
            ) : (
              <ul className="space-y-1 text-sm">
                {slots.map((slot) => (
                  <li
                    key={slot.id}
                    className="flex justify-between border-b py-1 last:border-b-0"
                  >
                    <span className="font-medium">
                      {DAY_NAMES[slot.dayOfWeek]}
                    </span>
                    <span className="text-muted-foreground">
                      {slot.startTime.slice(0, 5)} – {slot.endTime.slice(0, 5)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  icon,
  href,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  href?: string;
}) {
  const card = (
    <Card className={href ? 'transition-colors hover:bg-muted/50' : undefined}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{card}</Link> : card;
}
