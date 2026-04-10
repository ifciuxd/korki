import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
  smallint,
  jsonb,
  date,
  time,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ===== ENUMS =====
export const userRoleEnum = pgEnum('user_role', [
  'admin',
  'parent',
  'student',
]);
export const lessonStatusEnum = pgEnum('lesson_status', [
  'scheduled',
  'completed',
  'cancelled',
  'no_show',
]);
export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'succeeded',
  'failed',
  'refunded',
]);
export const paymentProviderEnum = pgEnum('payment_provider', [
  'stripe',
  'p24',
  'manual',
]);
export const taskStatusEnum = pgEnum('task_status', [
  'todo',
  'submitted',
  'graded',
  'returned',
]);
export const examTargetEnum = pgEnum('exam_target', [
  'none',
  'egzamin8',
  'matura_podstawowa',
  'matura_rozszerzona',
]);
export const qaContextEnum = pgEnum('qa_context', [
  'task',
  'lesson',
  'general',
]);

// ===== USERS =====
// Powiązane 1:1 z auth.users Supabase przez id
export const users = pgTable('users', {
  id: uuid('id').primaryKey(), // = auth.users.id
  email: text('email').notNull().unique(),
  role: userRoleEnum('role').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  phone: text('phone'),
  timezone: text('timezone').notNull().default('Europe/Warsaw'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ===== STUDENT PROFILES =====
export const studentProfiles = pgTable(
  'student_profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' })
      .unique(),
    parentId: uuid('parent_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    gradeLevel: text('grade_level').notNull(), // np. "Klasa 8", "Liceum 3"
    examTarget: examTargetEnum('exam_target').notNull().default('none'),
    notesForTutor: text('notes_for_tutor'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index('student_parent_idx').on(t.parentId)],
);

// ===== PACKAGES (definicje pakietów do sprzedaży) =====
export const packages = pgTable('packages', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(), // "Pakiet 5 godzin"
  description: text('description'),
  hoursIncluded: smallint('hours_included').notNull(),
  priceCents: integer('price_cents').notNull(),
  validityDays: smallint('validity_days').notNull().default(60),
  isActive: boolean('is_active').notNull().default(true),
  displayOrder: smallint('display_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ===== PAYMENTS =====
export const payments = pgTable(
  'payments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    parentId: uuid('parent_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    amountCents: integer('amount_cents').notNull(),
    currency: text('currency').notNull().default('PLN'),
    status: paymentStatusEnum('status').notNull().default('pending'),
    provider: paymentProviderEnum('provider').notNull(),
    providerPaymentId: text('provider_payment_id'),
    description: text('description').notNull(), // "Pakiet 5 godzin - Jan Kowalski"
    paidAt: timestamp('paid_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index('payments_parent_idx').on(t.parentId),
    index('payments_status_idx').on(t.status),
    index('payments_paid_at_idx').on(t.paidAt),
  ],
);

// ===== PURCHASES (zakupione pakiety, zużywane przez lekcje) =====
export const purchases = pgTable(
  'purchases',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    parentId: uuid('parent_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    studentId: uuid('student_id')
      .notNull()
      .references(() => studentProfiles.id, { onDelete: 'restrict' }),
    packageId: uuid('package_id')
      .notNull()
      .references(() => packages.id),
    paymentId: uuid('payment_id')
      .notNull()
      .references(() => payments.id),
    hoursTotal: smallint('hours_total').notNull(),
    hoursRemaining: smallint('hours_remaining').notNull(),
    validUntil: timestamp('valid_until', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index('purchases_student_idx').on(t.studentId),
    index('purchases_valid_until_idx').on(t.validUntil),
  ],
);

// ===== AVAILABILITY SLOTS (okna dostępności korepetytora) =====
export const availabilitySlots = pgTable('availability_slots', {
  id: uuid('id').primaryKey().defaultRandom(),
  dayOfWeek: smallint('day_of_week').notNull(), // 0=niedziela, 6=sobota
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  isRecurring: boolean('is_recurring').notNull().default(true),
  validFrom: date('valid_from'),
  validUntil: date('valid_until'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ===== LESSONS =====
export const lessons = pgTable(
  'lessons',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    studentId: uuid('student_id')
      .notNull()
      .references(() => studentProfiles.id, { onDelete: 'restrict' }),
    purchaseId: uuid('purchase_id').references(() => purchases.id, {
      onDelete: 'set null',
    }),
    startTime: timestamp('start_time', { withTimezone: true }).notNull(),
    endTime: timestamp('end_time', { withTimezone: true }).notNull(),
    status: lessonStatusEnum('status').notNull().default('scheduled'),
    meetingUrl: text('meeting_url'),
    googleEventId: text('google_event_id'),
    cancellationReason: text('cancellation_reason'),
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
    cancelledBy: uuid('cancelled_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index('lessons_student_start_idx').on(t.studentId, t.startTime),
    index('lessons_start_idx').on(t.startTime),
  ],
);

// ===== LESSON REPORTS =====
export const lessonReports = pgTable('lesson_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  lessonId: uuid('lesson_id')
    .notNull()
    .references(() => lessons.id, { onDelete: 'cascade' })
    .unique(),
  rawNotes: text('raw_notes'),
  topicsCovered: jsonb('topics_covered').$type<string[]>().default([]),
  homeworkAssigned: text('homework_assigned'),
  studentPerformance: smallint('student_performance'), // 1-5
  notesForParent: text('notes_for_parent'),
  aiGeneratedSummary: text('ai_generated_summary'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ===== MATH TOPICS (statyczne działy matematyki) =====
export const mathTopics = pgTable('math_topics', {
  slug: text('slug').primaryKey(), // "funkcja-kwadratowa"
  name: text('name').notNull(), // "Funkcja kwadratowa"
  category: text('category').notNull(), // "algebra", "geometria", "analiza" itd.
  examLevel: examTargetEnum('exam_level').notNull(),
  displayOrder: smallint('display_order').notNull().default(0),
});

// ===== STUDENT TOPIC PROGRESS (mapa opanowanych działów - Faza 3) =====
export const studentTopicProgress = pgTable(
  'student_topic_progress',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    studentId: uuid('student_id')
      .notNull()
      .references(() => studentProfiles.id, { onDelete: 'cascade' }),
    topicSlug: text('topic_slug')
      .notNull()
      .references(() => mathTopics.slug),
    masteryScore: smallint('mastery_score').notNull().default(0), // 0-100
    lessonsCount: smallint('lessons_count').notNull().default(0),
    lastPracticedAt: timestamp('last_practiced_at', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex('student_topic_unique').on(t.studentId, t.topicSlug),
  ],
);

// ===== MATERIALS =====
export const materials = pgTable('materials', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  fileUrl: text('file_url'),
  externalUrl: text('external_url'),
  fileType: text('file_type'), // pdf, video, link
  topicSlug: text('topic_slug').references(() => mathTopics.slug),
  isPublic: boolean('is_public').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ===== MATERIAL ASSIGNMENTS =====
export const materialAssignments = pgTable('material_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  materialId: uuid('material_id')
    .notNull()
    .references(() => materials.id, { onDelete: 'cascade' }),
  studentId: uuid('student_id').references(() => studentProfiles.id, {
    onDelete: 'cascade',
  }),
  lessonId: uuid('lesson_id').references(() => lessons.id, {
    onDelete: 'cascade',
  }),
  assignedAt: timestamp('assigned_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ===== TASKS =====
export const tasks = pgTable(
  'tasks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    studentId: uuid('student_id')
      .notNull()
      .references(() => studentProfiles.id, { onDelete: 'cascade' }),
    lessonId: uuid('lesson_id').references(() => lessons.id, {
      onDelete: 'set null',
    }),
    title: text('title').notNull(),
    description: text('description').notNull(),
    dueDate: timestamp('due_date', { withTimezone: true }),
    status: taskStatusEnum('status').notNull().default('todo'),
    grade: smallint('grade'), // 1-5
    tutorFeedback: text('tutor_feedback'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index('tasks_student_status_idx').on(t.studentId, t.status)],
);

// ===== TASK SUBMISSIONS =====
export const taskSubmissions = pgTable('task_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id')
    .notNull()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  fileUrls: jsonb('file_urls').$type<string[]>().default([]),
  textContent: text('text_content'),
  submittedAt: timestamp('submitted_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ===== QA THREADS =====
export const qaThreads = pgTable(
  'qa_threads',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    studentId: uuid('student_id')
      .notNull()
      .references(() => studentProfiles.id, { onDelete: 'cascade' }),
    contextType: qaContextEnum('context_type').notNull(),
    contextId: uuid('context_id'),
    title: text('title').notNull(),
    lastMessageAt: timestamp('last_message_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    isResolved: boolean('is_resolved').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index('qa_threads_student_idx').on(t.studentId)],
);

// ===== QA MESSAGES =====
export const qaMessages = pgTable(
  'qa_messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    threadId: uuid('thread_id')
      .notNull()
      .references(() => qaThreads.id, { onDelete: 'cascade' }),
    authorId: uuid('author_id')
      .notNull()
      .references(() => users.id),
    content: text('content').notNull(),
    attachmentUrls: jsonb('attachment_urls').$type<string[]>().default([]),
    voiceNoteUrl: text('voice_note_url'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    readAt: timestamp('read_at', { withTimezone: true }),
  },
  (t) => [index('qa_messages_thread_idx').on(t.threadId)],
);

// ===== RELATIONS =====
export const usersRelations = relations(users, ({ one, many }) => ({
  studentProfile: one(studentProfiles, {
    fields: [users.id],
    references: [studentProfiles.userId],
  }),
  children: many(studentProfiles, { relationName: 'parent_children' }),
  payments: many(payments),
}));

export const studentProfilesRelations = relations(
  studentProfiles,
  ({ one, many }) => ({
    user: one(users, {
      fields: [studentProfiles.userId],
      references: [users.id],
    }),
    parent: one(users, {
      fields: [studentProfiles.parentId],
      references: [users.id],
      relationName: 'parent_children',
    }),
    lessons: many(lessons),
    purchases: many(purchases),
    tasks: many(tasks),
    topicProgress: many(studentTopicProgress),
  }),
);

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  student: one(studentProfiles, {
    fields: [lessons.studentId],
    references: [studentProfiles.id],
  }),
  purchase: one(purchases, {
    fields: [lessons.purchaseId],
    references: [purchases.id],
  }),
  report: one(lessonReports, {
    fields: [lessons.id],
    references: [lessonReports.lessonId],
  }),
  tasks: many(tasks),
}));

export const purchasesRelations = relations(purchases, ({ one, many }) => ({
  parent: one(users, {
    fields: [purchases.parentId],
    references: [users.id],
  }),
  student: one(studentProfiles, {
    fields: [purchases.studentId],
    references: [studentProfiles.id],
  }),
  package: one(packages, {
    fields: [purchases.packageId],
    references: [packages.id],
  }),
  payment: one(payments, {
    fields: [purchases.paymentId],
    references: [payments.id],
  }),
  lessons: many(lessons),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  parent: one(users, {
    fields: [payments.parentId],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  student: one(studentProfiles, {
    fields: [tasks.studentId],
    references: [studentProfiles.id],
  }),
  lesson: one(lessons, {
    fields: [tasks.lessonId],
    references: [lessons.id],
  }),
  submissions: many(taskSubmissions),
}));

export const taskSubmissionsRelations = relations(
  taskSubmissions,
  ({ one }) => ({
    task: one(tasks, {
      fields: [taskSubmissions.taskId],
      references: [tasks.id],
    }),
  }),
);

export const qaThreadsRelations = relations(qaThreads, ({ one, many }) => ({
  student: one(studentProfiles, {
    fields: [qaThreads.studentId],
    references: [studentProfiles.id],
  }),
  messages: many(qaMessages),
}));

export const qaMessagesRelations = relations(qaMessages, ({ one }) => ({
  thread: one(qaThreads, {
    fields: [qaMessages.threadId],
    references: [qaThreads.id],
  }),
  author: one(users, {
    fields: [qaMessages.authorId],
    references: [users.id],
  }),
}));

export const lessonReportsRelations = relations(lessonReports, ({ one }) => ({
  lesson: one(lessons, {
    fields: [lessonReports.lessonId],
    references: [lessons.id],
  }),
}));

export const mathTopicsRelations = relations(mathTopics, ({ many }) => ({
  progress: many(studentTopicProgress),
  materials: many(materials),
}));

export const studentTopicProgressRelations = relations(
  studentTopicProgress,
  ({ one }) => ({
    student: one(studentProfiles, {
      fields: [studentTopicProgress.studentId],
      references: [studentProfiles.id],
    }),
    topic: one(mathTopics, {
      fields: [studentTopicProgress.topicSlug],
      references: [mathTopics.slug],
    }),
  }),
);

export const materialsRelations = relations(materials, ({ one, many }) => ({
  topic: one(mathTopics, {
    fields: [materials.topicSlug],
    references: [mathTopics.slug],
  }),
  assignments: many(materialAssignments),
}));

export const materialAssignmentsRelations = relations(
  materialAssignments,
  ({ one }) => ({
    material: one(materials, {
      fields: [materialAssignments.materialId],
      references: [materials.id],
    }),
    student: one(studentProfiles, {
      fields: [materialAssignments.studentId],
      references: [studentProfiles.id],
    }),
    lesson: one(lessons, {
      fields: [materialAssignments.lessonId],
      references: [lessons.id],
    }),
  }),
);
