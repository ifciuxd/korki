import { requireRole } from '@/lib/auth/session';
import { getChildrenWithHoursForParent } from '@/db/queries/purchases';
import { listAvailabilitySlots } from '@/db/queries/availability';
import { BookLessonWizard } from '@/components/parent/book-lesson-wizard';

export default async function BookLessonPage() {
  const session = await requireRole('parent');

  const [children, slots] = await Promise.all([
    getChildrenWithHoursForParent(session.userId),
    listAvailabilitySlots(),
  ]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Zarezerwuj lekcję</h1>
        <p className="text-sm text-muted-foreground">
          Wybierz dziecko i wolny termin
        </p>
      </div>
      <BookLessonWizard
        studentList={children}
        availableSlots={slots.map((s) => ({
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
        }))}
      />
    </div>
  );
}
