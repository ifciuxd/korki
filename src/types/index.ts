import type { users, studentProfiles, lessons, packages, payments, purchases } from '@/db/schema';

// Inferred types from Drizzle schema
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type StudentProfile = typeof studentProfiles.$inferSelect;
export type NewStudentProfile = typeof studentProfiles.$inferInsert;

export type Lesson = typeof lessons.$inferSelect;
export type NewLesson = typeof lessons.$inferInsert;

export type Package = typeof packages.$inferSelect;
export type NewPackage = typeof packages.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

export type Purchase = typeof purchases.$inferSelect;
export type NewPurchase = typeof purchases.$inferInsert;
