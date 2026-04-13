'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { formatTimePL } from '@/lib/utils/dates';
import type { LessonListItem } from '@/db/queries/lessons';

const DAY_SHORT = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz'];

const STATUS_STYLES: Record<string, string> = {
  scheduled:
    'border-l-primary bg-primary/10 text-primary hover:bg-primary/15',
  completed:
    'border-l-emerald-500 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  cancelled:
    'border-l-muted bg-muted/50 text-muted-foreground line-through opacity-60',
  no_show:
    'border-l-destructive bg-destructive/10 text-destructive',
};

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Zaplanowana',
  completed: 'Odbyta',
  cancelled: 'Odwołana',
  no_show: 'Nieobecność',
};

interface WeekCalendarProps {
  lessons: LessonListItem[];
  weekStart: Date;
  baseUrl: string;
}

export function WeekCalendar({
  lessons,
  weekStart,
  baseUrl,
}: WeekCalendarProps) {
  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const prevWeek = new Date(weekStart);
  prevWeek.setDate(prevWeek.getDate() - 7);
  const nextWeek = new Date(weekStart);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Group lessons by day
  const lessonsByDay = useMemo(() => {
    const map = new Map<string, LessonListItem[]>();
    for (const lesson of lessons) {
      const key = lesson.startTime.toISOString().slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(lesson);
    }
    return map;
  }, [lessons]);

  const formatWeekLabel = () => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    const opts: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
    };
    return `${weekStart.toLocaleDateString('pl-PL', opts)} – ${end.toLocaleDateString('pl-PL', { ...opts, year: 'numeric' })}`;
  };

  return (
    <div className="space-y-4">
      {/* Header with nav */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`${baseUrl}?week=${prevWeek.toISOString().slice(0, 10)}`}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <Link href={`${baseUrl}?week=${nextWeek.toISOString().slice(0, 10)}`}>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
          <span className="ml-2 text-sm font-medium">{formatWeekLabel()}</span>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={baseUrl}>Dziś</Link>
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="overflow-hidden rounded-xl border bg-card">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b bg-muted/30">
          {days.map((day, i) => {
            const isToday = day.toDateString() === today.toDateString();
            return (
              <div
                key={i}
                className={cn(
                  'px-2 py-3 text-center text-xs font-medium',
                  i < 6 && 'border-r',
                  isToday && 'bg-primary/5',
                )}
              >
                <span className="text-muted-foreground">{DAY_SHORT[i]}</span>
                <div
                  className={cn(
                    'mx-auto mt-1 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold',
                    isToday && 'bg-primary text-primary-foreground',
                  )}
                >
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Day columns with lessons */}
        <div className="grid min-h-[400px] grid-cols-7">
          {days.map((day, i) => {
            const key = day.toISOString().slice(0, 10);
            const dayLessons = lessonsByDay.get(key) ?? [];
            const isToday = day.toDateString() === today.toDateString();

            return (
              <div
                key={i}
                className={cn(
                  'min-h-[400px] p-1.5',
                  i < 6 && 'border-r',
                  isToday && 'bg-primary/[0.02]',
                )}
              >
                {dayLessons.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-xs text-muted-foreground/40">
                      —
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {dayLessons.map((lesson) => (
                      <LessonBlock key={lesson.id} lesson={lesson} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LessonBlock({ lesson }: { lesson: LessonListItem }) {
  return (
    <Link href={`/admin/lessons/${lesson.id}`}>
      <div
        className={cn(
          'cursor-pointer rounded-lg border-l-[3px] p-2 text-xs transition-colors',
          STATUS_STYLES[lesson.status],
        )}
      >
        <div className="font-semibold">
          {formatTimePL(lesson.startTime)} – {formatTimePL(lesson.endTime)}
        </div>
        <div className="mt-0.5 truncate font-medium">
          {lesson.studentFirstName} {lesson.studentLastName[0]}.
        </div>
        <div className="mt-0.5 text-[10px] opacity-70">
          {lesson.gradeLevel}
        </div>
        {lesson.status !== 'scheduled' && (
          <Badge
            variant={
              lesson.status === 'completed'
                ? 'success'
                : lesson.status === 'cancelled'
                  ? 'secondary'
                  : 'destructive'
            }
            className="mt-1 h-4 px-1 text-[9px]"
          >
            {STATUS_LABELS[lesson.status]}
          </Badge>
        )}
      </div>
    </Link>
  );
}
