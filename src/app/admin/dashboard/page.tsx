import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Calendar,
  Clock,
  UserCog,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { countStudents } from '@/db/queries/students';
import { countParents } from '@/db/queries/parents';
import { listAvailabilitySlots } from '@/db/queries/availability';
import { countUpcomingLessons, listLessonsInRange } from '@/db/queries/lessons';
import { formatTimePL } from '@/lib/utils/dates';

const DAY_NAMES: Record<number, string> = {
  0: 'Niedziela',
  1: 'Poniedziałek',
  2: 'Wtorek',
  3: 'Środa',
  4: 'Czwartek',
  5: 'Piątek',
  6: 'Sobota',
};

function getWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - day + (day === 0 ? -6 : 1));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 7);
  return { monday, sunday };
}

export default async function AdminDashboard() {
  const { monday, sunday } = getWeekRange();

  const [studentsCount, parentsCount, slots, upcomingCount, weekLessons] =
    await Promise.all([
      countStudents(),
      countParents(),
      listAvailabilitySlots(),
      countUpcomingLessons(),
      listLessonsInRange(monday, sunday),
    ]);

  const todayLessons = weekLessons.filter(
    (l) =>
      l.startTime.toDateString() === new Date().toDateString() &&
      l.status === 'scheduled',
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/admin/calendar">
            <Plus className="mr-2 h-4 w-4" />
            Nowa lekcja
          </Link>
        </Button>
      </div>

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
          value={String(weekLessons.filter((l) => l.status !== 'cancelled').length)}
          icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
          href="/admin/calendar"
        />
        <StatsCard
          title="Nadchodzące lekcje"
          value={String(upcomingCount)}
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          href="/admin/calendar"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Today's lessons */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Dzisiejsze lekcje</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/calendar">
                Kalendarz
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {todayLessons.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Brak lekcji na dziś. Sprawdź kalendarz, aby zobaczyć
                nadchodzące lekcje.
              </p>
            ) : (
              <div className="space-y-2">
                {todayLessons.map((lesson) => (
                  <Link
                    key={lesson.id}
                    href={`/admin/lessons/${lesson.id}`}
                    className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {lesson.studentFirstName} {lesson.studentLastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimePL(lesson.startTime)} –{' '}
                        {formatTimePL(lesson.endTime)}
                      </p>
                    </div>
                    <Badge variant="default" className="text-[10px]">
                      {lesson.gradeLevel}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
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
