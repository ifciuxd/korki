import { eq, desc, inArray } from 'drizzle-orm';
import { db } from '@/db/client';
import { tasks, taskSubmissions, studentProfiles, users } from '@/db/schema';

export interface TaskListItem {
  id: string;
  studentId: string;
  studentName: string;
  lessonId: string | null;
  title: string;
  description: string;
  dueDate: Date | null;
  status: 'todo' | 'submitted' | 'graded' | 'returned';
  grade: number | null;
  tutorFeedback: string | null;
  submissionsCount: number;
  createdAt: Date;
}

export async function listAllTasks(limit = 50): Promise<TaskListItem[]> {
  const rows = await db
    .select({
      id: tasks.id,
      studentId: tasks.studentId,
      lessonId: tasks.lessonId,
      title: tasks.title,
      description: tasks.description,
      dueDate: tasks.dueDate,
      status: tasks.status,
      grade: tasks.grade,
      tutorFeedback: tasks.tutorFeedback,
      createdAt: tasks.createdAt,
    })
    .from(tasks)
    .orderBy(desc(tasks.createdAt))
    .limit(limit);

  // Get student names
  const studentIds = [...new Set(rows.map((r) => r.studentId))];
  const studentRows =
    studentIds.length > 0
      ? await db
          .select({
            id: studentProfiles.id,
            firstName: users.firstName,
            lastName: users.lastName,
          })
          .from(studentProfiles)
          .innerJoin(users, eq(studentProfiles.userId, users.id))
          .where(inArray(studentProfiles.id, studentIds))
      : [];

  const nameMap = new Map(
    studentRows.map((s) => [s.id, `${s.firstName} ${s.lastName}`]),
  );

  // Get submission counts
  const taskIds = rows.map((r) => r.id);
  const submissionRows =
    taskIds.length > 0
      ? await db
          .select({ taskId: taskSubmissions.taskId })
          .from(taskSubmissions)
          .where(inArray(taskSubmissions.taskId, taskIds))
      : [];

  const subCountMap = new Map<string, number>();
  for (const s of submissionRows) {
    subCountMap.set(s.taskId, (subCountMap.get(s.taskId) ?? 0) + 1);
  }

  return rows.map((r) => ({
    ...r,
    status: r.status as TaskListItem['status'],
    studentName: nameMap.get(r.studentId) ?? '—',
    submissionsCount: subCountMap.get(r.id) ?? 0,
  }));
}

export async function listTasksForStudent(
  studentId: string,
): Promise<TaskListItem[]> {
  const rows = await db
    .select({
      id: tasks.id,
      studentId: tasks.studentId,
      lessonId: tasks.lessonId,
      title: tasks.title,
      description: tasks.description,
      dueDate: tasks.dueDate,
      status: tasks.status,
      grade: tasks.grade,
      tutorFeedback: tasks.tutorFeedback,
      createdAt: tasks.createdAt,
    })
    .from(tasks)
    .where(eq(tasks.studentId, studentId))
    .orderBy(desc(tasks.createdAt));

  // Get submission counts
  const taskIds = rows.map((r) => r.id);
  const submissionRows =
    taskIds.length > 0
      ? await db
          .select({ taskId: taskSubmissions.taskId })
          .from(taskSubmissions)
          .where(inArray(taskSubmissions.taskId, taskIds))
      : [];

  const subCountMap = new Map<string, number>();
  for (const s of submissionRows) {
    subCountMap.set(s.taskId, (subCountMap.get(s.taskId) ?? 0) + 1);
  }

  return rows.map((r) => ({
    ...r,
    status: r.status as TaskListItem['status'],
    studentName: '',
    submissionsCount: subCountMap.get(r.id) ?? 0,
  }));
}

export interface TaskDetail {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  description: string;
  dueDate: Date | null;
  status: 'todo' | 'submitted' | 'graded' | 'returned';
  grade: number | null;
  tutorFeedback: string | null;
  createdAt: Date;
  submissions: {
    id: string;
    textContent: string | null;
    fileUrls: string[];
    submittedAt: Date;
  }[];
}

export async function getTaskDetail(
  taskId: string,
): Promise<TaskDetail | null> {
  const [row] = await db
    .select({
      id: tasks.id,
      studentId: tasks.studentId,
      title: tasks.title,
      description: tasks.description,
      dueDate: tasks.dueDate,
      status: tasks.status,
      grade: tasks.grade,
      tutorFeedback: tasks.tutorFeedback,
      createdAt: tasks.createdAt,
    })
    .from(tasks)
    .where(eq(tasks.id, taskId))
    .limit(1);

  if (!row) return null;

  // Student name
  const [student] = await db
    .select({ firstName: users.firstName, lastName: users.lastName })
    .from(studentProfiles)
    .innerJoin(users, eq(studentProfiles.userId, users.id))
    .where(eq(studentProfiles.id, row.studentId))
    .limit(1);

  // Submissions
  const subs = await db
    .select({
      id: taskSubmissions.id,
      textContent: taskSubmissions.textContent,
      fileUrls: taskSubmissions.fileUrls,
      submittedAt: taskSubmissions.submittedAt,
    })
    .from(taskSubmissions)
    .where(eq(taskSubmissions.taskId, taskId))
    .orderBy(desc(taskSubmissions.submittedAt));

  return {
    ...row,
    status: row.status as TaskDetail['status'],
    studentName: student
      ? `${student.firstName} ${student.lastName}`
      : '—',
    submissions: subs.map((s) => ({
      ...s,
      fileUrls: (s.fileUrls as string[]) ?? [],
    })),
  };
}

export async function countPendingTasks(): Promise<number> {
  const rows = await db
    .select({ id: tasks.id })
    .from(tasks)
    .where(eq(tasks.status, 'submitted'));
  return rows.length;
}

export async function countTasksForStudent(
  studentId: string,
): Promise<{ todo: number; submitted: number; graded: number }> {
  const rows = await db
    .select({ status: tasks.status })
    .from(tasks)
    .where(eq(tasks.studentId, studentId));

  const counts = { todo: 0, submitted: 0, graded: 0 };
  for (const r of rows) {
    if (r.status === 'todo') counts.todo++;
    else if (r.status === 'submitted') counts.submitted++;
    else if (r.status === 'graded') counts.graded++;
  }
  return counts;
}
