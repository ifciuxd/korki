import { eq, desc, and, inArray } from 'drizzle-orm';
import { db } from '@/db/client';
import { qaThreads, qaMessages, studentProfiles, users } from '@/db/schema';

export interface QAThreadListItem {
  id: string;
  studentId: string;
  studentName: string;
  contextType: 'task' | 'lesson' | 'general';
  contextId: string | null;
  title: string;
  lastMessageAt: Date;
  isResolved: boolean;
  messageCount: number;
  createdAt: Date;
}

export async function listAllQAThreads(
  limit = 50,
): Promise<QAThreadListItem[]> {
  const rows = await db
    .select({
      id: qaThreads.id,
      studentId: qaThreads.studentId,
      contextType: qaThreads.contextType,
      contextId: qaThreads.contextId,
      title: qaThreads.title,
      lastMessageAt: qaThreads.lastMessageAt,
      isResolved: qaThreads.isResolved,
      createdAt: qaThreads.createdAt,
    })
    .from(qaThreads)
    .orderBy(desc(qaThreads.lastMessageAt))
    .limit(limit);

  // Student names
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

  // Message counts
  const threadIds = rows.map((r) => r.id);
  const msgRows =
    threadIds.length > 0
      ? await db
          .select({ threadId: qaMessages.threadId })
          .from(qaMessages)
          .where(inArray(qaMessages.threadId, threadIds))
      : [];

  const countMap = new Map<string, number>();
  for (const m of msgRows) {
    countMap.set(m.threadId, (countMap.get(m.threadId) ?? 0) + 1);
  }

  return rows.map((r) => ({
    ...r,
    contextType: r.contextType as QAThreadListItem['contextType'],
    studentName: nameMap.get(r.studentId) ?? '—',
    messageCount: countMap.get(r.id) ?? 0,
  }));
}

export async function listQAThreadsForStudent(
  studentId: string,
): Promise<QAThreadListItem[]> {
  const rows = await db
    .select({
      id: qaThreads.id,
      studentId: qaThreads.studentId,
      contextType: qaThreads.contextType,
      contextId: qaThreads.contextId,
      title: qaThreads.title,
      lastMessageAt: qaThreads.lastMessageAt,
      isResolved: qaThreads.isResolved,
      createdAt: qaThreads.createdAt,
    })
    .from(qaThreads)
    .where(eq(qaThreads.studentId, studentId))
    .orderBy(desc(qaThreads.lastMessageAt));

  // Message counts
  const threadIds = rows.map((r) => r.id);
  const msgRows =
    threadIds.length > 0
      ? await db
          .select({ threadId: qaMessages.threadId })
          .from(qaMessages)
          .where(inArray(qaMessages.threadId, threadIds))
      : [];

  const countMap = new Map<string, number>();
  for (const m of msgRows) {
    countMap.set(m.threadId, (countMap.get(m.threadId) ?? 0) + 1);
  }

  return rows.map((r) => ({
    ...r,
    contextType: r.contextType as QAThreadListItem['contextType'],
    studentName: '',
    messageCount: countMap.get(r.id) ?? 0,
  }));
}

export interface QAMessageItem {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: 'admin' | 'student' | 'parent';
  content: string;
  attachmentUrls: string[];
  createdAt: Date;
  readAt: Date | null;
}

export async function getQAThreadWithMessages(threadId: string): Promise<{
  thread: QAThreadListItem;
  messages: QAMessageItem[];
} | null> {
  const [thread] = await db
    .select({
      id: qaThreads.id,
      studentId: qaThreads.studentId,
      contextType: qaThreads.contextType,
      contextId: qaThreads.contextId,
      title: qaThreads.title,
      lastMessageAt: qaThreads.lastMessageAt,
      isResolved: qaThreads.isResolved,
      createdAt: qaThreads.createdAt,
    })
    .from(qaThreads)
    .where(eq(qaThreads.id, threadId))
    .limit(1);

  if (!thread) return null;

  // Student name
  const [student] = await db
    .select({ firstName: users.firstName, lastName: users.lastName })
    .from(studentProfiles)
    .innerJoin(users, eq(studentProfiles.userId, users.id))
    .where(eq(studentProfiles.id, thread.studentId))
    .limit(1);

  // Messages
  const msgs = await db
    .select({
      id: qaMessages.id,
      authorId: qaMessages.authorId,
      content: qaMessages.content,
      attachmentUrls: qaMessages.attachmentUrls,
      createdAt: qaMessages.createdAt,
      readAt: qaMessages.readAt,
    })
    .from(qaMessages)
    .where(eq(qaMessages.threadId, threadId))
    .orderBy(qaMessages.createdAt);

  // Author info
  const authorIds = [...new Set(msgs.map((m) => m.authorId))];
  const authorRows =
    authorIds.length > 0
      ? await db
          .select({
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            role: users.role,
          })
          .from(users)
          .where(inArray(users.id, authorIds))
      : [];

  const authorMap = new Map(
    authorRows.map((a) => [
      a.id,
      {
        name: `${a.firstName} ${a.lastName}`,
        role: a.role as 'admin' | 'student' | 'parent',
      },
    ]),
  );

  return {
    thread: {
      ...thread,
      contextType: thread.contextType as QAThreadListItem['contextType'],
      studentName: student
        ? `${student.firstName} ${student.lastName}`
        : '—',
      messageCount: msgs.length,
    },
    messages: msgs.map((m) => ({
      ...m,
      authorName: authorMap.get(m.authorId)?.name ?? '—',
      authorRole: authorMap.get(m.authorId)?.role ?? 'student',
      attachmentUrls: (m.attachmentUrls as string[]) ?? [],
    })),
  };
}

export async function countUnresolvedThreads(): Promise<number> {
  const rows = await db
    .select({ id: qaThreads.id })
    .from(qaThreads)
    .where(eq(qaThreads.isResolved, false));
  return rows.length;
}

export async function countUnresolvedForStudent(
  studentId: string,
): Promise<number> {
  const rows = await db
    .select({ id: qaThreads.id })
    .from(qaThreads)
    .where(
      and(
        eq(qaThreads.studentId, studentId),
        eq(qaThreads.isResolved, false),
      ),
    );
  return rows.length;
}
