-- 002_rls.sql
-- Row Level Security policies

-- Helper function: pobierz rolę zalogowanego usera
CREATE OR REPLACE FUNCTION auth.user_role() RETURNS text AS $$
  SELECT role::text FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

-- ===== USERS =====
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_admin_all" ON users FOR ALL
  USING (auth.user_role() = 'admin');

CREATE POLICY "users_self_read" ON users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "users_parent_read_children" ON users FOR SELECT
  USING (
    id IN (
      SELECT sp.user_id FROM student_profiles sp WHERE sp.parent_id = auth.uid()
    )
  );

-- ===== STUDENT PROFILES =====
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sp_admin_all" ON student_profiles FOR ALL
  USING (auth.user_role() = 'admin');

CREATE POLICY "sp_student_self" ON student_profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "sp_parent_children" ON student_profiles FOR SELECT
  USING (parent_id = auth.uid());

-- ===== PACKAGES =====
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "packages_admin_all" ON packages FOR ALL
  USING (auth.user_role() = 'admin');

CREATE POLICY "packages_read_all" ON packages FOR SELECT
  USING (is_active = true);

-- ===== PAYMENTS =====
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_admin_all" ON payments FOR ALL
  USING (auth.user_role() = 'admin');

CREATE POLICY "payments_parent_own" ON payments FOR SELECT
  USING (parent_id = auth.uid());

-- ===== PURCHASES =====
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "purchases_admin_all" ON purchases FOR ALL
  USING (auth.user_role() = 'admin');

CREATE POLICY "purchases_parent_own" ON purchases FOR SELECT
  USING (parent_id = auth.uid());

CREATE POLICY "purchases_student_own" ON purchases FOR SELECT
  USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));

-- ===== AVAILABILITY SLOTS =====
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "avail_admin_all" ON availability_slots FOR ALL
  USING (auth.user_role() = 'admin');

CREATE POLICY "avail_read_all" ON availability_slots FOR SELECT
  USING (true);

-- ===== LESSONS =====
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lessons_admin_all" ON lessons FOR ALL
  USING (auth.user_role() = 'admin');

CREATE POLICY "lessons_student_own" ON lessons FOR SELECT
  USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));

CREATE POLICY "lessons_parent_children" ON lessons FOR SELECT
  USING (student_id IN (SELECT id FROM student_profiles WHERE parent_id = auth.uid()));

-- ===== LESSON REPORTS =====
ALTER TABLE lesson_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_admin_all" ON lesson_reports FOR ALL
  USING (auth.user_role() = 'admin');

CREATE POLICY "reports_student_own" ON lesson_reports FOR SELECT
  USING (
    lesson_id IN (
      SELECT l.id FROM lessons l
      WHERE l.student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "reports_parent_children" ON lesson_reports FOR SELECT
  USING (
    lesson_id IN (
      SELECT l.id FROM lessons l
      WHERE l.student_id IN (SELECT id FROM student_profiles WHERE parent_id = auth.uid())
    )
  );

-- ===== MATH TOPICS =====
ALTER TABLE math_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "topics_read_all" ON math_topics FOR SELECT
  USING (true);

CREATE POLICY "topics_admin_all" ON math_topics FOR ALL
  USING (auth.user_role() = 'admin');

-- ===== STUDENT TOPIC PROGRESS =====
ALTER TABLE student_topic_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "progress_admin_all" ON student_topic_progress FOR ALL
  USING (auth.user_role() = 'admin');

CREATE POLICY "progress_student_own" ON student_topic_progress FOR SELECT
  USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));

CREATE POLICY "progress_parent_children" ON student_topic_progress FOR SELECT
  USING (student_id IN (SELECT id FROM student_profiles WHERE parent_id = auth.uid()));

-- ===== MATERIALS =====
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "materials_admin_all" ON materials FOR ALL
  USING (auth.user_role() = 'admin');

CREATE POLICY "materials_public_read" ON materials FOR SELECT
  USING (is_public = true);

-- ===== MATERIAL ASSIGNMENTS =====
ALTER TABLE material_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mat_assign_admin_all" ON material_assignments FOR ALL
  USING (auth.user_role() = 'admin');

CREATE POLICY "mat_assign_student_own" ON material_assignments FOR SELECT
  USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));

CREATE POLICY "mat_assign_parent_children" ON material_assignments FOR SELECT
  USING (student_id IN (SELECT id FROM student_profiles WHERE parent_id = auth.uid()));

-- ===== TASKS =====
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_admin_all" ON tasks FOR ALL
  USING (auth.user_role() = 'admin');

CREATE POLICY "tasks_student_own" ON tasks FOR SELECT
  USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));

CREATE POLICY "tasks_parent_children" ON tasks FOR SELECT
  USING (student_id IN (SELECT id FROM student_profiles WHERE parent_id = auth.uid()));

-- ===== TASK SUBMISSIONS =====
ALTER TABLE task_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "submissions_admin_all" ON task_submissions FOR ALL
  USING (auth.user_role() = 'admin');

CREATE POLICY "submissions_student_own" ON task_submissions FOR SELECT
  USING (
    task_id IN (
      SELECT t.id FROM tasks t
      WHERE t.student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "submissions_student_insert" ON task_submissions FOR INSERT
  WITH CHECK (
    task_id IN (
      SELECT t.id FROM tasks t
      WHERE t.student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
    )
  );

-- ===== QA THREADS =====
ALTER TABLE qa_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "threads_admin_all" ON qa_threads FOR ALL
  USING (auth.user_role() = 'admin');

CREATE POLICY "threads_student_own" ON qa_threads FOR ALL
  USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));

CREATE POLICY "threads_parent_children" ON qa_threads FOR SELECT
  USING (student_id IN (SELECT id FROM student_profiles WHERE parent_id = auth.uid()));

-- ===== QA MESSAGES =====
ALTER TABLE qa_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_admin_all" ON qa_messages FOR ALL
  USING (auth.user_role() = 'admin');

CREATE POLICY "messages_thread_participant" ON qa_messages FOR SELECT
  USING (
    thread_id IN (
      SELECT qt.id FROM qa_threads qt
      WHERE qt.student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "messages_insert_own" ON qa_messages FOR INSERT
  WITH CHECK (author_id = auth.uid());
