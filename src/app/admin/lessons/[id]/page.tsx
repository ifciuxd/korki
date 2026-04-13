import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  GraduationCap,
  Users,
  Star,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LessonReportForm } from '@/components/admin/lesson-report-form';
import { LessonStatusActions } from '@/components/admin/lesson-status-actions';
import { getLessonDetail } from '@/db/queries/lessons';
import { formatDatePL, formatTimePL } from '@/lib/utils/dates';

const STATUS_CONFIG = {
  scheduled: {
    label: 'Zaplanowana',
    variant: 'default' as const,
    icon: Calendar,
  },
  completed: {
    label: 'Odbyta',
    variant: 'success' as const,
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Odwołana',
    variant: 'secondary' as const,
    icon: XCircle,
  },
  no_show: {
    label: 'Nieobecność',
    variant: 'destructive' as const,
    icon: AlertTriangle,
  },
};

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lesson = await getLessonDetail(id);

  if (!lesson) notFound();

  const statusConfig = STATUS_CONFIG[lesson.status];
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/calendar">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Szczegóły lekcji</h1>
          <p className="text-sm text-muted-foreground">
            {formatDatePL(lesson.startTime)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: lesson info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Main info card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarFallback className="bg-primary/10 text-lg font-bold text-primary">
                      {lesson.studentFirstName[0]}
                      {lesson.studentLastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-semibold">
                      {lesson.studentFirstName} {lesson.studentLastName}
                    </h2>
                    <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <GraduationCap className="h-3.5 w-3.5" />
                        {lesson.gradeLevel}
                      </span>
                      {lesson.parentName && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {lesson.parentName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Badge variant={statusConfig.variant} className="gap-1">
                  <StatusIcon className="h-3 w-3" />
                  {statusConfig.label}
                </Badge>
              </div>

              <Separator className="my-5" />

              {/* Time info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Data</p>
                    <p className="font-medium">
                      {formatDatePL(lesson.startTime)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Godzina</p>
                    <p className="font-medium">
                      {formatTimePL(lesson.startTime)} –{' '}
                      {formatTimePL(lesson.endTime)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cancellation info */}
              {lesson.status === 'cancelled' && lesson.cancellationReason && (
                <div className="mt-4 rounded-lg border border-muted bg-muted/30 p-3 text-sm">
                  <p className="font-medium text-muted-foreground">
                    Powód odwołania:
                  </p>
                  <p>{lesson.cancellationReason}</p>
                </div>
              )}

              {/* Actions */}
              {lesson.status === 'scheduled' && (
                <div className="mt-5">
                  <LessonStatusActions
                    lessonId={lesson.id}
                    currentStatus={lesson.status}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Report form */}
          {(lesson.status === 'scheduled' || lesson.status === 'completed') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Raport z lekcji
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LessonReportForm
                  lessonId={lesson.id}
                  existing={lesson.report}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column: report summary (if exists) */}
        <div className="space-y-4">
          {lesson.report && (
            <Card className="border-emerald-200 bg-emerald-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Raport zapisany
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {lesson.report.topicsCovered.length > 0 && (
                  <div>
                    <p className="mb-1 font-medium text-muted-foreground">
                      Tematy
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {lesson.report.topicsCovered.map((t, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {lesson.report.studentPerformance && (
                  <div>
                    <p className="mb-1 font-medium text-muted-foreground">
                      Ocena
                    </p>
                    <div className="flex gap-0.5">
                      {Array.from(
                        { length: lesson.report.studentPerformance },
                        (_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 fill-amber-400 text-amber-400"
                          />
                        ),
                      )}
                      {Array.from(
                        { length: 5 - lesson.report.studentPerformance },
                        (_, i) => (
                          <Star
                            key={`e${i}`}
                            className="h-4 w-4 text-muted-foreground/30"
                          />
                        ),
                      )}
                    </div>
                  </div>
                )}
                {lesson.report.homeworkAssigned && (
                  <div>
                    <p className="mb-1 font-medium text-muted-foreground">
                      Zadanie domowe
                    </p>
                    <p className="text-foreground">
                      {lesson.report.homeworkAssigned}
                    </p>
                  </div>
                )}
                {lesson.report.notesForParent && (
                  <div>
                    <p className="mb-1 font-medium text-muted-foreground">
                      Uwagi dla rodzica
                    </p>
                    <p className="text-foreground">
                      {lesson.report.notesForParent}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
