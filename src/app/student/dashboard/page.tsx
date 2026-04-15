import Link from 'next/link';
import {
  Calendar,
  Clock,
  ChevronRight,
  Sparkles,
  BookOpen,
  ClipboardList,
  MessageCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { requireRole } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export default async function StudentDashboard() {
  const session = await requireRole('student');

  const profileId = await safeQuery(async () => {
    const { getStudentProfileIdByUserId } = await import('@/db/queries/student-session');
    return getStudentProfileIdByUserId(session.userId);
  }, null);

  const completedCount = await safeQuery(async () => {
    if (!profileId) return 0;
    const { listLessonsForStudent } = await import('@/db/queries/lessons');
    const all = await listLessonsForStudent(profileId);
    return all.filter((l) => l.status === 'completed').length;
  }, 0);

  const hoursRemaining = await safeQuery(async () => {
    if (!profileId) return 0;
    const { getRemainingHoursForStudent } = await import('@/db/queries/purchases');
    return getRemainingHoursForStudent(profileId);
  }, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Cześć, {session.firstName}!
        </h1>
        <p className="mt-1 text-muted-foreground">
          Oto podsumowanie Twoich lekcji i postępów.
        </p>
      </div>

      {/* Next lesson */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center py-8">
          <Calendar className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Brak zaplanowanych lekcji
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Odbyte lekcje</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pozostałe godziny</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hoursRemaining}h</div>
            <Progress value={Math.min(hoursRemaining * 20, 100)} className="mt-2 h-1" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nadchodzące</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Moje narzędzia</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickLink href="/student/lessons" icon={<Calendar className="h-5 w-5" />} label="Lekcje" />
          <QuickLink href="/student/materials" icon={<BookOpen className="h-5 w-5" />} label="Materiały" />
          <QuickLink href="/student/tasks" icon={<ClipboardList className="h-5 w-5" />} label="Zadania" />
          <QuickLink href="/student/qa" icon={<MessageCircle className="h-5 w-5" />} label="Pytania" />
        </div>
      </div>
    </div>
  );
}

function QuickLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href}>
      <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">{icon}</div>
          <span className="font-medium">{label}</span>
          <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  );
}
