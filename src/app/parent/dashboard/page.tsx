import Link from 'next/link';
import {
  CalendarPlus,
  Clock,
  Calendar,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { requireRole } from '@/lib/auth/session';
import { getChildrenWithHoursForParent } from '@/db/queries/purchases';
import { listUpcomingLessonsForParent } from '@/db/queries/lessons';
import { formatDateTimePL } from '@/lib/utils/dates';

export default async function ParentDashboard() {
  const session = await requireRole('parent');

  const [children, upcomingLessons] = await Promise.all([
    getChildrenWithHoursForParent(session.userId),
    listUpcomingLessonsForParent(session.userId, 5),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Witaj, {session.firstName}!
          </h1>
          <p className="text-sm text-muted-foreground">
            Panel rodzica — zarządzaj lekcjami swoich dzieci
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/parent/book-lesson">
              <CalendarPlus className="mr-2 h-4 w-4" />
              Zarezerwuj lekcję
            </Link>
          </Button>
        </div>
      </div>

      {/* Children overview */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Moje dzieci</h2>
        {children.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-10">
              <AlertCircle className="mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Brak przypisanych uczniów. Skontaktuj się z korepetytorem.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {children.map((child) => (
              <Card
                key={child.studentId}
                className="overflow-hidden transition-shadow hover:shadow-md"
              >
                <div className="h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
                <CardContent className="pt-5">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-11 w-11">
                      <AvatarFallback className="bg-primary/10 font-bold text-primary">
                        {child.firstName[0]}
                        {child.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">
                        {child.firstName} {child.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {child.gradeLevel}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg bg-muted/50 p-3">
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Pozostałe godziny
                      </span>
                      <span className="font-semibold">
                        {child.hoursRemaining}h
                      </span>
                    </div>
                    <Progress
                      value={Math.min(child.hoursRemaining * 20, 100)}
                      className="h-1.5"
                    />
                    {child.hoursRemaining === 0 && (
                      <p className="mt-2 text-xs text-amber-600">
                        Wykup pakiet godzin, aby rezerwować lekcje
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming lessons */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Nadchodzące lekcje</h2>
          {upcomingLessons.length > 0 && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/parent/book-lesson">
                Zobacz wszystkie
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </div>

        {upcomingLessons.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-10">
              <Calendar className="mb-3 h-8 w-8 text-muted-foreground" />
              <p className="mb-3 text-sm text-muted-foreground">
                Brak zaplanowanych lekcji
              </p>
              <Button asChild size="sm">
                <Link href="/parent/book-lesson">
                  <CalendarPlus className="mr-2 h-3.5 w-3.5" />
                  Zarezerwuj lekcję
                </Link>
              </Button>
            </CardContent>
          </Card>
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
                    {lesson.studentFirstName} {lesson.studentLastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTimePL(lesson.startTime)}
                  </p>
                </div>
                <Badge variant="default">Zaplanowana</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
