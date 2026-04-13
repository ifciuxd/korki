import { WeekCalendar } from '@/components/admin/week-calendar';
import { CreateLessonDialog } from '@/components/admin/create-lesson-dialog';
import { listLessonsInRange } from '@/db/queries/lessons';
import { listStudents } from '@/db/queries/students';

function getMonday(dateStr?: string): Date {
  const d = dateStr ? new Date(dateStr) : new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  const weekStart = getMonday(week);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const [lessons, students] = await Promise.all([
    listLessonsInRange(weekStart, weekEnd),
    listStudents(),
  ]);

  const studentOptions = students.map((s) => ({
    id: s.id,
    label: `${s.firstName} ${s.lastName} (${s.gradeLevel})`,
  }));

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kalendarz</h1>
          <p className="text-sm text-muted-foreground">
            Zarządzaj swoimi lekcjami. Kliknij lekcję, aby zobaczyć
            szczegóły.
          </p>
        </div>
        <CreateLessonDialog
          students={studentOptions}
          defaultDate={todayStr}
        />
      </div>
      <WeekCalendar
        lessons={lessons}
        weekStart={weekStart}
        baseUrl="/admin/calendar"
      />
    </div>
  );
}
