import { NextResponse } from 'next/server';

const ADMIN_EMAIL = 'admin@korki.pl';
const ADMIN_PASSWORD = 'Test1234!';

const MIGRATION_SQL = `
-- Enums
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('admin', 'parent', 'student'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE lesson_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE payment_provider AS ENUM ('stripe', 'p24', 'manual'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE task_status AS ENUM ('todo', 'submitted', 'graded', 'returned'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE exam_target AS ENUM ('none', 'egzamin8', 'matura_podstawowa', 'matura_rozszerzona'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE qa_context AS ENUM ('task', 'lesson', 'general'); EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY, email TEXT NOT NULL UNIQUE, role user_role NOT NULL,
  first_name TEXT NOT NULL, last_name TEXT NOT NULL, phone TEXT,
  timezone TEXT NOT NULL DEFAULT 'Europe/Warsaw', avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES users(id) ON DELETE SET NULL, grade_level TEXT NOT NULL,
  exam_target exam_target NOT NULL DEFAULT 'none', notes_for_tutor TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, description TEXT,
  hours_included SMALLINT NOT NULL, price_cents INTEGER NOT NULL, validity_days SMALLINT NOT NULL DEFAULT 60,
  is_active BOOLEAN NOT NULL DEFAULT true, display_order SMALLINT NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), parent_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  amount_cents INTEGER NOT NULL, currency TEXT NOT NULL DEFAULT 'PLN', status payment_status NOT NULL DEFAULT 'pending',
  provider payment_provider NOT NULL, provider_payment_id TEXT, description TEXT NOT NULL,
  paid_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), parent_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE RESTRICT, package_id UUID NOT NULL REFERENCES packages(id),
  payment_id UUID NOT NULL REFERENCES payments(id), hours_total SMALLINT NOT NULL, hours_remaining SMALLINT NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), day_of_week SMALLINT NOT NULL, start_time TIME NOT NULL,
  end_time TIME NOT NULL, is_recurring BOOLEAN NOT NULL DEFAULT true, valid_from DATE, valid_until DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE RESTRICT,
  purchase_id UUID REFERENCES purchases(id) ON DELETE SET NULL, start_time TIMESTAMPTZ NOT NULL, end_time TIMESTAMPTZ NOT NULL,
  status lesson_status NOT NULL DEFAULT 'scheduled', meeting_url TEXT, google_event_id TEXT,
  cancellation_reason TEXT, cancelled_at TIMESTAMPTZ, cancelled_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS lesson_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), lesson_id UUID NOT NULL UNIQUE REFERENCES lessons(id) ON DELETE CASCADE,
  raw_notes TEXT, topics_covered JSONB DEFAULT '[]', homework_assigned TEXT, student_performance SMALLINT,
  notes_for_parent TEXT, ai_generated_summary TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS math_topics (
  slug TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL,
  exam_level exam_target NOT NULL, display_order SMALLINT NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS student_topic_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  topic_slug TEXT NOT NULL REFERENCES math_topics(slug), mastery_score SMALLINT NOT NULL DEFAULT 0,
  lessons_count SMALLINT NOT NULL DEFAULT 0, last_practiced_at TIMESTAMPTZ, updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title TEXT NOT NULL, description TEXT, file_url TEXT,
  external_url TEXT, file_type TEXT, topic_slug TEXT REFERENCES math_topics(slug),
  is_public BOOLEAN NOT NULL DEFAULT false, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS material_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE, lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL, title TEXT NOT NULL, description TEXT NOT NULL,
  due_date TIMESTAMPTZ, status task_status NOT NULL DEFAULT 'todo', grade SMALLINT, tutor_feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS task_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  file_urls JSONB DEFAULT '[]', text_content TEXT, submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS qa_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  context_type qa_context NOT NULL, context_id UUID, title TEXT NOT NULL, last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_resolved BOOLEAN NOT NULL DEFAULT false, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS qa_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), thread_id UUID NOT NULL REFERENCES qa_threads(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id), content TEXT NOT NULL, attachment_urls JSONB DEFAULT '[]',
  voice_note_url TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), read_at TIMESTAMPTZ
);
`;

/**
 * GET /api/setup
 *
 * One-time setup endpoint. Uses Supabase REST API (no DATABASE_URL needed).
 * 1. Creates admin in Supabase Auth
 * 2. Inserts admin row into users table via PostgREST
 * 3. If tables don't exist, returns migration SQL to run manually
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  const steps: string[] = [];

  try {
    // 1. Check env vars
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({
        error: 'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY',
        help: 'Set these in Vercel Dashboard → Settings → Environment Variables.',
      }, { status: 500 });
    }

    steps.push('Env vars OK');

    // 2. Create Supabase admin client
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 3. Check if users table exists by trying to query it
    const { error: tableError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (tableError && tableError.message.includes('does not exist')) {
      steps.push('Tables do not exist yet');

      // Try to run migrations via DATABASE_URL if available
      const databaseUrl = process.env.DATABASE_URL;
      if (databaseUrl) {
        try {
          const postgres = (await import('postgres')).default;
          const sql = postgres(databaseUrl, { prepare: false });
          await sql.unsafe(MIGRATION_SQL);
          await sql.end();
          steps.push('Tables created via DATABASE_URL');
        } catch (dbErr) {
          // DATABASE_URL failed, give manual instructions
          return NextResponse.json({
            error: 'Tables do not exist and DATABASE_URL connection failed.',
            dbError: dbErr instanceof Error ? dbErr.message : String(dbErr),
            steps,
            action: 'Run this SQL in Supabase Dashboard → SQL Editor:',
            sql: MIGRATION_SQL,
            help: 'Go to https://supabase.com/dashboard/project/uhlkajpwykyrxcbwyogr/sql/new and paste the SQL above.',
          }, { status: 500 });
        }
      } else {
        return NextResponse.json({
          error: 'Tables do not exist. Run the migration SQL first.',
          steps,
          action: 'Run this SQL in Supabase Dashboard → SQL Editor:',
          sql: MIGRATION_SQL,
          help: 'Go to https://supabase.com/dashboard/project/uhlkajpwykyrxcbwyogr/sql/new and paste the SQL.',
        }, { status: 500 });
      }
    } else {
      steps.push('Tables exist');
    }

    // 4. Check if admin already exists
    const { data: existingAdmin } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1)
      .single();

    if (existingAdmin) {
      return NextResponse.json({
        message: 'Setup OK! Admin already exists. You can log in.',
        steps,
        login: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
      });
    }

    // 5. Create or find auth user
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingAuthUser = existingUsers?.users?.find(
      (u) => u.email === ADMIN_EMAIL,
    );

    let authUserId: string;

    if (existingAuthUser) {
      authUserId = existingAuthUser.id;
      steps.push(`Auth user exists (${authUserId})`);
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: {
          role: 'admin',
          firstName: 'Korepetytor',
          lastName: 'Testowy',
        },
      });

      if (error) {
        return NextResponse.json(
          { error: `Auth error: ${error.message}`, steps },
          { status: 500 },
        );
      }

      authUserId = data.user.id;
      steps.push(`Auth user created (${authUserId})`);
    }

    // 6. Insert into users table via PostgREST
    const { error: insertError } = await supabase
      .from('users')
      .upsert({
        id: authUserId,
        email: ADMIN_EMAIL,
        role: 'admin',
        first_name: 'Korepetytor',
        last_name: 'Testowy',
        phone: '+48123456789',
        timezone: 'Europe/Warsaw',
      }, { onConflict: 'id' });

    if (insertError) {
      return NextResponse.json(
        { error: `Insert error: ${insertError.message}`, steps },
        { status: 500 },
      );
    }

    steps.push('Users table row created');

    return NextResponse.json({
      message: 'Setup complete! You can now log in.',
      steps,
      login: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: `Setup failed: ${err instanceof Error ? err.message : String(err)}`,
        steps,
      },
      { status: 500 },
    );
  }
}
