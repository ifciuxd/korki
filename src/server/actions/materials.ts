'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { materials, materialAssignments } from '@/db/schema';
import { requireRole } from '@/lib/auth/session';
import { createMaterialSchema, assignMaterialSchema } from '@/server/validators/material';
import type { ActionState } from './invitations';

export async function createMaterialAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole('admin');

  const parsed = createMaterialSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    fileUrl: formData.get('fileUrl'),
    externalUrl: formData.get('externalUrl'),
    fileType: formData.get('fileType'),
    topicSlug: formData.get('topicSlug'),
    isPublic: formData.get('isPublic') === 'true',
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await db.insert(materials).values({
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    fileUrl: parsed.data.fileUrl ?? null,
    externalUrl: parsed.data.externalUrl ?? null,
    fileType: parsed.data.fileType ?? null,
    topicSlug: parsed.data.topicSlug ?? null,
    isPublic: parsed.data.isPublic,
  });

  revalidatePath('/admin/materials');
  return { success: true };
}

export async function updateMaterialAction(
  materialId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole('admin');

  const parsed = createMaterialSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    fileUrl: formData.get('fileUrl'),
    externalUrl: formData.get('externalUrl'),
    fileType: formData.get('fileType'),
    topicSlug: formData.get('topicSlug'),
    isPublic: formData.get('isPublic') === 'true',
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await db
    .update(materials)
    .set({
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      fileUrl: parsed.data.fileUrl ?? null,
      externalUrl: parsed.data.externalUrl ?? null,
      fileType: parsed.data.fileType ?? null,
      topicSlug: parsed.data.topicSlug ?? null,
      isPublic: parsed.data.isPublic,
    })
    .where(eq(materials.id, materialId));

  revalidatePath('/admin/materials');
  return { success: true };
}

export async function deleteMaterialAction(
  materialId: string,
): Promise<ActionState> {
  await requireRole('admin');

  await db.delete(materials).where(eq(materials.id, materialId));

  revalidatePath('/admin/materials');
  return { success: true };
}

export async function assignMaterialAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole('admin');

  const parsed = assignMaterialSchema.safeParse({
    materialId: formData.get('materialId'),
    studentId: formData.get('studentId'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await db.insert(materialAssignments).values({
    materialId: parsed.data.materialId,
    studentId: parsed.data.studentId,
  });

  revalidatePath('/admin/materials');
  revalidatePath('/student/materials');
  return { success: true };
}

export async function removeAssignmentAction(
  assignmentId: string,
): Promise<ActionState> {
  await requireRole('admin');

  await db
    .delete(materialAssignments)
    .where(eq(materialAssignments.id, assignmentId));

  revalidatePath('/admin/materials');
  revalidatePath('/student/materials');
  return { success: true };
}
