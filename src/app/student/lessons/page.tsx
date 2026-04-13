import {
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { requireRole } from '@/lib/auth/session';
import { getStudentProfileIdByUserId } from '@/db/queries/student-session';
import { listLessonsForStudent } from '@/db/queries/lessons';
import { formatDateTimePL, formatTimePL } from '@/lib/utils/dates';

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'default' | 'success' | 'secondary' | 'destructive'; icon: typeof Calendar }
> = {
  scheduled: { label: 'Zaplanowana', variant: 'default', icon: Clock },
  completed: { label: 'Odbyta', variant: 'success', icon: CheckCircle2 },
  cancelled: { label: 'Odwołana', variant: 'secondary', icon: XCircle },
  no_show: { label: 'Nieobecność', variant: 'destructive', icon: AlertTriangle },
};

export default async function StudentLessonsPage() {
  const session = await requireRole('student');
  const profileId = await getStudentProfileIdByUserId(session.userId);

  if (!profileId) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Profil nie znaleziony.</p>
      </div>
    );
  }

  const allLessons = await listLessonsForStudent(profileId);

  const upcoming = allLessons.filter((l) => l.status === 'scheduled');
  const past = allLessons.filter((l) => l.status !== 'scheduled');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Moje lekcje</h1>
        <p className="text-sm text-muted-foreground">
          Historia i nadchodzące lekcje matematyki
        </p>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">
            Nadchodzące ({upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Historia ({past.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {upcoming.length === 0 ? (
            <EmptyState
              icon={<Calendar className="h-10 w-10 text-muted-foreground" />}
              message="Brak zaplanowanych lekcji"
            />
          ) : (
            <div className="space-y-2">
              {upcoming.map((lesson) => (
                <LessonRow key={lesson.id} lesson={lesson} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {past.length === 0 ? (
            <EmptyState
              icon={<Clock className="h-10 w-10 text-muted-foreground" />}
              message="Brak historii lekcji"
            />
          ) : (
            <div className="space-y-2">
              {past.map((lesson) => (
                <LessonRow key={lesson.id} lesson={lesson} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LessonRow({
  lesson,
}: {
  lesson: {
    id: string;
    startTime: Date;
    endTime: Date;
    status: string;
    hasReport: boolean;
  };
}) {
  const config = STATUS_CONFIG[lesson.status] ?? STATUS_CONFIG.scheduled;
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/30">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1">
        <p className="font-medium">{formatDateTimePL(lesson.startTime)}</p>
        <p className="text-sm text-muted-foreground">
          {formatTimePL(lesson.startTime)} – {formatTimePL(lesson.endTime)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {lesson.hasReport && (
          <Badge variant="outline" className="text-xs">
            Raport
          </Badge>
        )}
        <Badge variant={config.variant}>{config.label}</Badge>
      </div>
    </div>
  );
}

function EmptyState({
  icon,
  message,
}: {
  icon: React.ReactNode;
  message: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center py-12">
        {icon}
        <p className="mt-3 text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}
