-- 001_initial_schema.sql
-- Cały schemat bazy danych dla Korepetycje Matematyka

-- Enums
CREATE TYPE user_role AS ENUM ('admin', 'parent', 'student');
CREATE TYPE lesson_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');
CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded');
CREATE TYPE payment_provider AS ENUM ('stripe', 'p24', 'manual');
CREATE TYPE task_status AS ENUM ('todo', 'submitted', 'graded', 'returned');
CREATE TYPE exam_target AS ENUM ('none', 'egzamin8', 'matura_podstawowa', 'matura_rozszerzona');
CREATE TYPE qa_context AS ENUM ('task', 'lesson', 'general');

-- Users (powiązane 1:1 z auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY, -- = auth.users.id
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  timezone TEXT NOT NULL DEFAULT 'Europe/Warsaw',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Student profiles
CREATE TABLE student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES users(id) ON DELETE SET NULL,
  grade_level TEXT NOT NULL,
  exam_target exam_target NOT NULL DEFAULT 'none',
  notes_for_tutor TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX student_parent_idx ON student_profiles(parent_id);

-- Packages
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  hours_included SMALLINT NOT NULL,
  price_cents INTEGER NOT NULL,
  validity_days SMALLINT NOT NULL DEFAULT 60,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'PLN',
  status payment_status NOT NULL DEFAULT 'pending',
  provider payment_provider NOT NULL,
  provider_payment_id TEXT,
  description TEXT NOT NULL,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX payments_parent_idx ON payments(parent_id);
CREATE INDEX payments_status_idx ON payments(status);
CREATE INDEX payments_paid_at_idx ON payments(paid_at);

-- Purchases
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE RESTRICT,
  package_id UUID NOT NULL REFERENCES packages(id),
  payment_id UUID NOT NULL REFERENCES payments(id),
  hours_total SMALLINT NOT NULL,
  hours_remaining SMALLINT NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX purchases_student_idx ON purchases(student_id);
CREATE INDEX purchases_valid_until_idx ON purchases(valid_until);

-- Availability slots
CREATE TABLE availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week SMALLINT NOT NULL, -- 0=niedziela, 6=sobota
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT true,
  valid_from DATE,
  valid_until DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lessons
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE RESTRICT,
  purchase_id UUID REFERENCES purchases(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status lesson_status NOT NULL DEFAULT 'scheduled',
  meeting_url TEXT,
  google_event_id TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX lessons_student_start_idx ON lessons(student_id, start_time);
CREATE INDEX lessons_start_idx ON lessons(start_time);

-- Lesson reports
CREATE TABLE lesson_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL UNIQUE REFERENCES lessons(id) ON DELETE CASCADE,
  raw_notes TEXT,
  topics_covered JSONB DEFAULT '[]',
  homework_assigned TEXT,
  student_performance SMALLINT, -- 1-5
  notes_for_parent TEXT,
  ai_generated_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Math topics
CREATE TABLE math_topics (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  exam_level exam_target NOT NULL,
  display_order SMALLINT NOT NULL DEFAULT 0
);

-- Student topic progress
CREATE TABLE student_topic_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  topic_slug TEXT NOT NULL REFERENCES math_topics(slug),
  mastery_score SMALLINT NOT NULL DEFAULT 0, -- 0-100
  lessons_count SMALLINT NOT NULL DEFAULT 0,
  last_practiced_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX student_topic_unique ON student_topic_progress(student_id, topic_slug);

-- Materials
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  external_url TEXT,
  file_type TEXT,
  topic_slug TEXT REFERENCES math_topics(slug),
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Material assignments
CREATE TABLE material_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  due_date TIMESTAMPTZ,
  status task_status NOT NULL DEFAULT 'todo',
  grade SMALLINT, -- 1-5
  tutor_feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX tasks_student_status_idx ON tasks(student_id, status);

-- Task submissions
CREATE TABLE task_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  file_urls JSONB DEFAULT '[]',
  text_content TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- QA threads
CREATE TABLE qa_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  context_type qa_context NOT NULL,
  context_id UUID,
  title TEXT NOT NULL,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX qa_threads_student_idx ON qa_threads(student_id);

-- QA messages
CREATE TABLE qa_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES qa_threads(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  attachment_urls JSONB DEFAULT '[]',
  voice_note_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ
);
CREATE INDEX qa_messages_thread_idx ON qa_messages(thread_id);
