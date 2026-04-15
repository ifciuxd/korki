import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Calendar,
  Clock,
  UserCog,
  Plus,
  BookOpen,
  ClipboardList,
  MessageCircle,
  Settings,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export default async function AdminDashboard() {
  const [studentsCount, parentsCount, upcomingCount, slotsCount] =
    await Promise.all([
      safeQuery(async () => {
        const { countStudents } = await import('@/db/queries/students');
        return countStudents();
      }, 0),
      safeQuery(async () => {
        const { countParents } = await import('@/db/queries/parents');
        return countParents();
      }, 0),
      safeQuery(async () => {
        const { countUpcomingLessons } = await import('@/db/queries/lessons');
        return countUpcomingLessons();
      }, 0),
      safeQuery(async () => {
        const { listAvailabilitySlots } = await import('@/db/queries/availability');
        return (await listAvailabilitySlots()).length;
      }, 0),
    ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Witaj, Korepetytorze!</p>
        </div>
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
          title="Uczniowie"
          value={String(studentsCount)}
          icon={<Users className="h-5 w-5" />}
          href="/admin/students"
          color="bg-blue-50 text-blue-600"
        />
        <StatsCard
          title="Rodzice"
          value={String(parentsCount)}
          icon={<UserCog className="h-5 w-5" />}
          href="/admin/parents"
          color="bg-emerald-50 text-emerald-600"
        />
        <StatsCard
          title="Nadchodzące lekcje"
          value={String(upcomingCount)}
          icon={<Calendar className="h-5 w-5" />}
          href="/admin/calendar"
          color="bg-amber-50 text-amber-600"
        />
        <StatsCard
          title="Sloty dostępności"
          value={String(slotsCount)}
          icon={<Clock className="h-5 w-5" />}
          href="/admin/availability"
          color="bg-purple-50 text-purple-600"
        />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Szybkie akcje</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction href="/admin/students" icon={<Users className="h-5 w-5" />} label="Uczniowie" desc="Lista i profile uczniów" />
          <QuickAction href="/admin/calendar" icon={<Calendar className="h-5 w-5" />} label="Kalendarz" desc="Lekcje i harmonogram" />
          <QuickAction href="/admin/materials" icon={<BookOpen className="h-5 w-5" />} label="Materiały" desc="Pliki i linki" />
          <QuickAction href="/admin/tasks" icon={<ClipboardList className="h-5 w-5" />} label="Zadania" desc="Zadania domowe" />
          <QuickAction href="/admin/qa" icon={<MessageCircle className="h-5 w-5" />} label="Q&A" desc="Pytania uczniów" />
          <QuickAction href="/admin/finances" icon={<Settings className="h-5 w-5" />} label="Finanse" desc="Pakiety i płatności" />
          <QuickAction href="/admin/availability" icon={<Clock className="h-5 w-5" />} label="Dostępność" desc="Twoje okna czasowe" />
          <QuickAction href="/admin/parents" icon={<UserCog className="h-5 w-5" />} label="Rodzice" desc="Konta rodziców" />
        </div>
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  icon,
  href,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}) {
  return (
    <Link href={href}>
      <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className={`rounded-lg p-2 ${color}`}>{icon}</div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{value}</div>
        </CardContent>
      </Card>
    </Link>
  );
}

function QuickAction({
  href,
  icon,
  label,
  desc,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  desc: string;
}) {
  return (
    <Link href={href}>
      <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="rounded-lg bg-muted p-2 text-muted-foreground">{icon}</div>
          <div>
            <p className="text-sm font-semibold">{label}</p>
            <p className="text-xs text-muted-foreground">{desc}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
