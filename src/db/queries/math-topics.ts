import { db } from '@/db/client';
import { mathTopics } from '@/db/schema';

export interface MathTopicOption {
  slug: string;
  name: string;
  category: string;
}

export async function listMathTopics(): Promise<MathTopicOption[]> {
  return db
    .select({
      slug: mathTopics.slug,
      name: mathTopics.name,
      category: mathTopics.category,
    })
    .from(mathTopics)
    .orderBy(mathTopics.displayOrder);
}
