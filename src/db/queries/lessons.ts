import { eq, and, gte, lte, desc, asc } from 'drizzle-orm';
import { db } from '@/db/client';
import { lessons, lessonReports, studentProfiles, users } from '@/db/schema';

export interface LessonListItem {
  id: string;
  studentId: string;
  studentFirstName: string;
  studentLastName: string;
  gradeLevel: string;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  hasReport: boolean;
}

export async function listLessonsInRange(
  from: Date,
  to: Date,
): Promise<LessonListItem[]> {
  const rows = await db
    .select({
      id: lessons.id,
      studentId: lessons.studentId,
      studentFirstName: users.firstName,
      studentLastName: users.lastName,
      gradeLevel: studentProfiles.gradeLevel,
      startTime: lessons.startTime,
      endTime: lessons.endTime,
      status: lessons.status,
      reportId: lessonReports.id,
    })
    .from(lessons)
    .innerJoin(studentProfiles, eq(lessons.studentId, studentProfiles.id))
    .innerJoin(users, eq(studentProfiles.userId, users.id))
    .leftJoin(lessonReports, eq(lessons.id, lessonReports.lessonId))
    .where(and(gte(lessons.startTime, from), lte(lessons.startTime, to)))
    .orderBy(asc(lessons.startTime));

  return rows.map((r) => ({
    id: r.id,
    studentId: r.studentId,
    studentFirstName: r.studentFirstName,
    studentLastName: r.studentLastName,
    gradeLevel: r.gradeLevel,
    startTime: r.startTime,
    endTime: r.endTime,
    status: r.status as LessonListItem['status'],
    hasReport: r.reportId !== null,
  }));
}

export interface LessonDetail {
  id: string;
  studentId: string;
  studentFirstName: string;
  studentLastName: string;
  gradeLevel: string;
  parentName: string | null;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  meetingUrl: string | null;
  cancellationReason: string | null;
  cancelledAt: Date | null;
  report: {
    id: string;
    rawNotes: string | null;
    topicsCovered: string[];
    homeworkAssigned: string | null;
    studentPerformance: number | null;
    notesForParent: string | null;
  } | null;
}

export async function getLessonDetail(
  id: string,
): Promise<LessonDetail | null> {
  const [row] = await db
    .select({
      id: lessons.id,
      studentId: lessons.studentId,
      studentFirstName: users.firstName,
      studentLastName: users.lastName,
      gradeLevel: studentProfiles.gradeLevel,
      parentId: studentProfiles.parentId,
      startTime: lessons.startTime,
      endTime: lessons.endTime,
      status: lessons.status,
      meetingUrl: lessons.meetingUrl,
      cancellationReason: lessons.cancellationReason,
      cancelledAt: lessons.cancelledAt,
      reportId: lessonReports.id,
      rawNotes: lessonReports.rawNotes,
      topicsCovered: lessonReports.topicsCovered,
      homeworkAssigned: lessonReports.homeworkAssigned,
      studentPerformance: lessonReports.studentPerformance,
      notesForParent: lessonReports.notesForParent,
    })
    .from(lessons)
    .innerJoin(studentProfiles, eq(lessons.studentId, studentProfiles.id))
    .innerJoin(users, eq(studentProfiles.userId, users.id))
    .leftJoin(lessonReports, eq(lessons.id, lessonReports.lessonId))
    .where(eq(lessons.id, id))
    .limit(1);

  if (!row) return null;

  // Fetch parent name if exists
  let parentName: string | null = null;
  if (row.parentId) {
    const [parent] = await db
      .select({ firstName: users.firstName, lastName: users.lastName })
      .from(users)
      .where(eq(users.id, row.parentId))
      .limit(1);
    if (parent) parentName = `${parent.firstName} ${parent.lastName}`;
  }

  return {
    id: row.id,
    studentId: row.studentId,
    studentFirstName: row.studentFirstName,
    studentLastName: row.studentLastName,
    gradeLevel: row.gradeLevel,
    parentName,
    startTime: row.startTime,
    endTime: row.endTime,
    status: row.status as LessonDetail['status'],
    meetingUrl: row.meetingUrl,
    cancellationReason: row.cancellationReason,
    cancelledAt: row.cancelledAt,
    report: row.reportId
      ? {
          id: row.reportId,
          rawNotes: row.rawNotes,
          topicsCovered: (row.topicsCovered as string[]) ?? [],
          homeworkAssigned: row.homeworkAssigned,
          studentPerformance: row.studentPerformance,
          notesForParent: row.notesForParent,
        }
      : null,
  };
}

export async function listUpcomingLessonsForStudent(
  studentId: string,
  limit = 5,
): Promise<LessonListItem[]> {
  const now = new Date();
  const rows = await db
    .select({
      id: lessons.id,
      studentId: lessons.studentId,
      studentFirstName: users.firstName,
      studentLastName: users.lastName,
      gradeLevel: studentProfiles.gradeLevel,
      startTime: lessons.startTime,
      endTime: lessons.endTime,
      status: lessons.status,
      reportId: lessonReports.id,
    })
    .from(lessons)
    .innerJoin(studentProfiles, eq(lessons.studentId, studentProfiles.id))
    .innerJoin(users, eq(studentProfiles.userId, users.id))
    .leftJoin(lessonReports, eq(lessons.id, lessonReports.lessonId))
    .where(
      and(
        eq(lessons.studentId, studentId),
        gte(lessons.startTime, now),
        eq(lessons.status, 'scheduled'),
      ),
    )
    .orderBy(asc(lessons.startTime))
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    studentId: r.studentId,
    studentFirstName: r.studentFirstName,
    studentLastName: r.studentLastName,
    gradeLevel: r.gradeLevel,
    startTime: r.startTime,
    endTime: r.endTime,
    status: r.status as LessonListItem['status'],
    hasReport: r.reportId !== null,
  }));
}

export async function listLessonsForStudent(
  studentId: string,
): Promise<LessonListItem[]> {
  const rows = await db
    .select({
      id: lessons.id,
      studentId: lessons.studentId,
      studentFirstName: users.firstName,
      studentLastName: users.lastName,
      gradeLevel: studentProfiles.gradeLevel,
      startTime: lessons.startTime,
      endTime: lessons.endTime,
      status: lessons.status,
      reportId: lessonReports.id,
    })
    .from(lessons)
    .innerJoin(studentProfiles, eq(lessons.studentId, studentProfiles.id))
    .innerJoin(users, eq(studentProfiles.userId, users.id))
    .leftJoin(lessonReports, eq(lessons.id, lessonReports.lessonId))
    .where(eq(lessons.studentId, studentId))
    .orderBy(desc(lessons.startTime));

  return rows.map((r) => ({
    id: r.id,
    studentId: r.studentId,
    studentFirstName: r.studentFirstName,
    studentLastName: r.studentLastName,
    gradeLevel: r.gradeLevel,
    startTime: r.startTime,
    endTime: r.endTime,
    status: r.status as LessonListItem['status'],
    hasReport: r.reportId !== null,
  }));
}

export async function countUpcomingLessons(): Promise<number> {
  const now = new Date();
  const rows = await db
    .select({ id: lessons.id })
    .from(lessons)
    .where(and(gte(lessons.startTime, now), eq(lessons.status, 'scheduled')));
  return rows.length;
}

export async function listUpcomingLessonsForParent(
  parentId: string,
  limit = 10,
): Promise<LessonListItem[]> {
  const now = new Date();
  const rows = await db
    .select({
      id: lessons.id,
      studentId: lessons.studentId,
      studentFirstName: users.firstName,
      studentLastName: users.lastName,
      gradeLevel: studentProfiles.gradeLevel,
      startTime: lessons.startTime,
      endTime: lessons.endTime,
      status: lessons.status,
      reportId: lessonReports.id,
    })
    .from(lessons)
    .innerJoin(studentProfiles, eq(lessons.studentId, studentProfiles.id))
    .innerJoin(users, eq(studentProfiles.userId, users.id))
    .leftJoin(lessonReports, eq(lessons.id, lessonReports.lessonId))
    .where(
      and(
        eq(studentProfiles.parentId, parentId),
        gte(lessons.startTime, now),
        eq(lessons.status, 'scheduled'),
      ),
    )
    .orderBy(asc(lessons.startTime))
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    studentId: r.studentId,
    studentFirstName: r.studentFirstName,
    studentLastName: r.studentLastName,
    gradeLevel: r.gradeLevel,
    startTime: r.startTime,
    endTime: r.endTime,
    status: r.status as LessonListItem['status'],
    hasReport: r.reportId !== null,
  }));
}
