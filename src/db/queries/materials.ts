import { eq, desc, inArray } from 'drizzle-orm';
import { db } from '@/db/client';
import { materials, materialAssignments, studentProfiles, users, mathTopics } from '@/db/schema';

export interface MaterialListItem {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string | null;
  externalUrl: string | null;
  fileType: string | null;
  topicSlug: string | null;
  topicName: string | null;
  isPublic: boolean;
  assignmentCount: number;
  createdAt: Date;
}

export async function listMaterials(): Promise<MaterialListItem[]> {
  const rows = await db
    .select({
      id: materials.id,
      title: materials.title,
      description: materials.description,
      fileUrl: materials.fileUrl,
      externalUrl: materials.externalUrl,
      fileType: materials.fileType,
      topicSlug: materials.topicSlug,
      isPublic: materials.isPublic,
      createdAt: materials.createdAt,
    })
    .from(materials)
    .orderBy(desc(materials.createdAt));

  // Get assignment counts
  const assignmentRows = await db
    .select({
      materialId: materialAssignments.materialId,
    })
    .from(materialAssignments);

  const countMap = new Map<string, number>();
  for (const r of assignmentRows) {
    countMap.set(r.materialId, (countMap.get(r.materialId) ?? 0) + 1);
  }

  // Get topic names
  const topics = await db
    .select({ slug: mathTopics.slug, name: mathTopics.name })
    .from(mathTopics);
  const topicMap = new Map(topics.map((t) => [t.slug, t.name]));

  return rows.map((r) => ({
    ...r,
    topicName: r.topicSlug ? topicMap.get(r.topicSlug) ?? null : null,
    assignmentCount: countMap.get(r.id) ?? 0,
  }));
}

export async function getMaterialById(id: string) {
  const [row] = await db
    .select()
    .from(materials)
    .where(eq(materials.id, id))
    .limit(1);
  return row ?? null;
}

export interface MaterialAssignmentItem {
  id: string;
  studentId: string;
  studentName: string;
  assignedAt: Date;
}

export async function listAssignmentsForMaterial(
  materialId: string,
): Promise<MaterialAssignmentItem[]> {
  const rows = await db
    .select({
      id: materialAssignments.id,
      studentId: materialAssignments.studentId,
      assignedAt: materialAssignments.assignedAt,
    })
    .from(materialAssignments)
    .where(eq(materialAssignments.materialId, materialId));

  const studentIds = rows
    .map((r) => r.studentId)
    .filter((id): id is string => id !== null);

  if (studentIds.length === 0) return [];

  const studentRows = await db
    .select({
      id: studentProfiles.id,
      firstName: users.firstName,
      lastName: users.lastName,
    })
    .from(studentProfiles)
    .innerJoin(users, eq(studentProfiles.userId, users.id))
    .where(inArray(studentProfiles.id, studentIds));

  const nameMap = new Map(
    studentRows.map((s) => [s.id, `${s.firstName} ${s.lastName}`]),
  );

  return rows
    .filter((r) => r.studentId !== null)
    .map((r) => ({
      id: r.id,
      studentId: r.studentId!,
      studentName: nameMap.get(r.studentId!) ?? '—',
      assignedAt: r.assignedAt,
    }));
}

export interface StudentMaterialItem {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string | null;
  externalUrl: string | null;
  fileType: string | null;
  topicName: string | null;
  assignedAt: Date;
}

export async function listMaterialsForStudent(
  studentId: string,
): Promise<StudentMaterialItem[]> {
  const rows = await db
    .select({
      assignmentId: materialAssignments.id,
      assignedAt: materialAssignments.assignedAt,
      materialId: materials.id,
      title: materials.title,
      description: materials.description,
      fileUrl: materials.fileUrl,
      externalUrl: materials.externalUrl,
      fileType: materials.fileType,
      topicSlug: materials.topicSlug,
    })
    .from(materialAssignments)
    .innerJoin(materials, eq(materialAssignments.materialId, materials.id))
    .where(eq(materialAssignments.studentId, studentId))
    .orderBy(desc(materialAssignments.assignedAt));

  // Get topic names
  const topicSlugs = rows
    .map((r) => r.topicSlug)
    .filter((s): s is string => s !== null);

  const topics =
    topicSlugs.length > 0
      ? await db
          .select({ slug: mathTopics.slug, name: mathTopics.name })
          .from(mathTopics)
          .where(inArray(mathTopics.slug, topicSlugs))
      : [];

  const topicMap = new Map(topics.map((t) => [t.slug, t.name]));

  return rows.map((r) => ({
    id: r.materialId,
    title: r.title,
    description: r.description,
    fileUrl: r.fileUrl,
    externalUrl: r.externalUrl,
    fileType: r.fileType,
    topicName: r.topicSlug ? topicMap.get(r.topicSlug) ?? null : null,
    assignedAt: r.assignedAt,
  }));
}

export async function countMaterials(): Promise<number> {
  const rows = await db.select({ id: materials.id }).from(materials);
  return rows.length;
}
