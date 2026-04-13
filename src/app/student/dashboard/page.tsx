import Link from 'next/link';
import {
  Calendar,
  Clock,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { requireRole } from '@/lib/auth/session';
import { getStudentProfileIdByUserId } from '@/db/queries/student-session';
import {
  listUpcomingLessonsForStudent,
  listLessonsForStudent,
} from '@/db/queries/lessons';
import { getRemainingHoursForStudent } from '@/db/queries/purchases';
import { formatDateTimePL, formatTimePL } from '@/lib/utils/dates';

export default async function StudentDashboard() {
  const session = await requireRole('student');
  const profileId = await getStudentProfileIdByUserId(session.userId);

  if (!profileId) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">
          Profil ucznia nie został znaleziony.
        </p>
      </div>
    );
  }

  const [upcomingLessons, allLessons, hoursRemaining] = await Promise.all([
    listUpcomingLessonsForStudent(profileId, 3),
    listLessonsForStudent(profileId),
    getRemainingHoursForStudent(profileId),
  ]);

  const completedCount = allLessons.filter(
    (l) => l.status === 'completed',
  ).length;
  const nextLesson = upcomingLessons[0] ?? null;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold">
          Cześć, {session.firstName}!
        </h1>
        <p className="text-sm text-muted-foreground">
          Oto podsumowanie Twoich lekcji i postępów.
        </p>
      </div>

      {/* Next lesson hero card */}
      {nextLesson ? (
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <Calendar className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium uppercase tracking-wider text-primary">
                  Następna lekcja
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {formatDateTimePL(nextLesson.startTime)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatTimePL(nextLesson.startTime)} –{' '}
                  {formatTimePL(nextLesson.endTime)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-8">
            <Calendar className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Brak zaplanowanych lekcji
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Odbyte lekcje
            </CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pozostałe godziny
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hoursRemaining}h</div>
            <Progress
              value={Math.min(hoursRemaining * 20, 100)}
              className="mt-2 h-1"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nadchodzące
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {upcomingLessons.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming lessons */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Nadchodzące lekcje</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/student/lessons">
              Wszystkie lekcje
              <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
        {upcomingLessons.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Brak zaplanowanych lekcji.
          </p>
        ) : (
          <div className="space-y-2">
            {upcomingLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/30"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {formatDateTimePL(lesson.startTime)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatTimePL(lesson.startTime)} –{' '}
                    {formatTimePL(lesson.endTime)}
                  </p>
                </div>
                <Badge>Zaplanowana</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
