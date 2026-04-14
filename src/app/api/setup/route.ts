import { NextResponse } from 'next/server';
import postgres from 'postgres';

const ADMIN_EMAIL = 'admin@korki.pl';
const ADMIN_PASSWORD = 'Test1234!';

/**
 * GET /api/setup
 *
 * One-time setup endpoint that:
 * 1. Checks environment variables
 * 2. Runs SQL migrations if tables don't exist
 * 3. Creates a test admin user in Supabase Auth + users table
 *
 * Only works when no admin user exists yet (first-run guard).
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  const steps: string[] = [];

  try {
    // 1. Check env vars
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const databaseUrl = process.env.DATABASE_URL;

    const missing: string[] = [];
    if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!anonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    if (!serviceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
    if (!databaseUrl) missing.push('DATABASE_URL');

    if (missing.length > 0) {
      return NextResponse.json(
        {
          error: `Missing environment variables: ${missing.join(', ')}`,
          help: 'Set these in Vercel Dashboard → Settings → Environment Variables, then redeploy.',
        },
        { status: 500 },
      );
    }

    steps.push('Environment variables OK');

    // 2. Connect to database and check/create tables
    const sql = postgres(databaseUrl!, { prepare: false });

    // Check if users table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
      ) as exists
    `;

    if (!tableCheck[0].exists) {
      steps.push('Tables not found — running migrations...');

      // Run migrations inline
      await sql.unsafe(`
        -- Enums (IF NOT EXISTS for safety)
        DO $$ BEGIN CREATE TYPE user_role AS ENUM ('admin', 'parent', 'student'); EXCEPTION WHEN duplicate_object THEN null; END $$;
        DO $$ BEGIN CREATE TYPE lesson_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show'); EXCEPTION WHEN duplicate_object THEN null; END $$;
        DO $$ BEGIN CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded'); EXCEPTION WHEN duplicate_object THEN null; END $$;
        DO $$ BEGIN CREATE TYPE payment_provider AS ENUM ('stripe', 'p24', 'manual'); EXCEPTION WHEN duplicate_object THEN null; END $$;
        DO $$ BEGIN CREATE TYPE task_status AS ENUM ('todo', 'submitted', 'graded', 'returned'); EXCEPTION WHEN duplicate_object THEN null; END $$;
        DO $$ BEGIN CREATE TYPE exam_target AS ENUM ('none', 'egzamin8', 'matura_podstawowa', 'matura_rozszerzona'); EXCEPTION WHEN duplicate_object THEN null; END $$;
        DO $$ BEGIN CREATE TYPE qa_context AS ENUM ('task', 'lesson', 'general'); EXCEPTION WHEN duplicate_object THEN null; END $$;
      `);

      await sql.unsafe(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY,
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

        CREATE TABLE IF NOT EXISTS student_profiles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
          parent_id UUID REFERENCES users(id) ON DELETE SET NULL,
          grade_level TEXT NOT NULL,
          exam_target exam_target NOT NULL DEFAULT 'none',
          notes_for_tutor TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS student_parent_idx ON student_profiles(parent_id);

        CREATE TABLE IF NOT EXISTS packages (
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

        CREATE TABLE IF NOT EXISTS payments (
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
        CREATE INDEX IF NOT EXISTS payments_parent_idx ON payments(parent_id);
        CREATE INDEX IF NOT EXISTS payments_status_idx ON payments(status);
        CREATE INDEX IF NOT EXISTS payments_paid_at_idx ON payments(paid_at);

        CREATE TABLE IF NOT EXISTS purchases (
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
        CREATE INDEX IF NOT EXISTS purchases_student_idx ON purchases(student_id);
        CREATE INDEX IF NOT EXISTS purchases_valid_until_idx ON purchases(valid_until);

        CREATE TABLE IF NOT EXISTS availability_slots (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          day_of_week SMALLINT NOT NULL,
          start_time TIME NOT NULL,
          end_time TIME NOT NULL,
          is_recurring BOOLEAN NOT NULL DEFAULT true,
          valid_from DATE,
          valid_until DATE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS lessons (
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
        CREATE INDEX IF NOT EXISTS lessons_student_start_idx ON lessons(student_id, start_time);
        CREATE INDEX IF NOT EXISTS lessons_start_idx ON lessons(start_time);

        CREATE TABLE IF NOT EXISTS lesson_reports (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          lesson_id UUID NOT NULL UNIQUE REFERENCES lessons(id) ON DELETE CASCADE,
          raw_notes TEXT,
          topics_covered JSONB DEFAULT '[]',
          homework_assigned TEXT,
          student_performance SMALLINT,
          notes_for_parent TEXT,
          ai_generated_summary TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS math_topics (
          slug TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          exam_level exam_target NOT NULL,
          display_order SMALLINT NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS student_topic_progress (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
          topic_slug TEXT NOT NULL REFERENCES math_topics(slug),
          mastery_score SMALLINT NOT NULL DEFAULT 0,
          lessons_count SMALLINT NOT NULL DEFAULT 0,
          last_practiced_at TIMESTAMPTZ,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE UNIQUE INDEX IF NOT EXISTS student_topic_unique ON student_topic_progress(student_id, topic_slug);

        CREATE TABLE IF NOT EXISTS materials (
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

        CREATE TABLE IF NOT EXISTS material_assignments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
          student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
          lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
          assigned_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS tasks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
          lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          due_date TIMESTAMPTZ,
          status task_status NOT NULL DEFAULT 'todo',
          grade SMALLINT,
          tutor_feedback TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS tasks_student_status_idx ON tasks(student_id, status);

        CREATE TABLE IF NOT EXISTS task_submissions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
          file_urls JSONB DEFAULT '[]',
          text_content TEXT,
          submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS qa_threads (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
          context_type qa_context NOT NULL,
          context_id UUID,
          title TEXT NOT NULL,
          last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          is_resolved BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS qa_threads_student_idx ON qa_threads(student_id);

        CREATE TABLE IF NOT EXISTS qa_messages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          thread_id UUID NOT NULL REFERENCES qa_threads(id) ON DELETE CASCADE,
          author_id UUID NOT NULL REFERENCES users(id),
          content TEXT NOT NULL,
          attachment_urls JSONB DEFAULT '[]',
          voice_note_url TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          read_at TIMESTAMPTZ
        );
        CREATE INDEX IF NOT EXISTS qa_messages_thread_idx ON qa_messages(thread_id);
      `);

      steps.push('Tables created successfully');

      // RLS helper function
      await sql.unsafe(`
        CREATE OR REPLACE FUNCTION auth.user_role() RETURNS text AS $$
          SELECT role::text FROM public.users WHERE id = auth.uid();
        $$ LANGUAGE sql STABLE;
      `);

      steps.push('RLS helper function created');

      // Seed math topics
      await sql.unsafe(`
        INSERT INTO math_topics (slug, name, category, exam_level, display_order) VALUES
        ('dzialania-na-liczbach', 'Działania na liczbach', 'arytmetyka', 'egzamin8', 1),
        ('ulamki-zwykle-i-dziesietne', 'Ułamki zwykłe i dziesiętne', 'arytmetyka', 'egzamin8', 2),
        ('potegi-i-pierwiastki', 'Potęgi i pierwiastki', 'arytmetyka', 'egzamin8', 3),
        ('procenty', 'Procenty', 'arytmetyka', 'egzamin8', 4),
        ('proporcje', 'Proporcje', 'arytmetyka', 'egzamin8', 5),
        ('wyrazenia-algebraiczne', 'Wyrażenia algebraiczne', 'algebra', 'egzamin8', 10),
        ('rownania-liniowe', 'Równania liniowe', 'algebra', 'egzamin8', 11),
        ('uklady-rownan', 'Układy równań', 'algebra', 'egzamin8', 12),
        ('nierownosci', 'Nierówności', 'algebra', 'egzamin8', 13),
        ('funkcja-liniowa', 'Funkcja liniowa', 'algebra', 'egzamin8', 14),
        ('funkcja-kwadratowa', 'Funkcja kwadratowa', 'algebra', 'matura_podstawowa', 20),
        ('wielomiany', 'Wielomiany', 'algebra', 'matura_podstawowa', 21),
        ('funkcja-wykladnicza', 'Funkcja wykładnicza', 'algebra', 'matura_podstawowa', 22),
        ('logarytmy', 'Logarytmy', 'algebra', 'matura_podstawowa', 23),
        ('ciagi-arytmetyczne', 'Ciągi arytmetyczne', 'algebra', 'matura_podstawowa', 24),
        ('ciagi-geometryczne', 'Ciągi geometryczne', 'algebra', 'matura_podstawowa', 25),
        ('funkcje-trygonometryczne', 'Funkcje trygonometryczne', 'algebra', 'matura_rozszerzona', 30),
        ('rownania-trygonometryczne', 'Równania trygonometryczne', 'algebra', 'matura_rozszerzona', 31),
        ('liczby-zespolone', 'Liczby zespolone', 'algebra', 'matura_rozszerzona', 32),
        ('indukcja-matematyczna', 'Indukcja matematyczna', 'algebra', 'matura_rozszerzona', 33),
        ('figury-plaskie', 'Figury płaskie', 'geometria', 'egzamin8', 40),
        ('pola-i-obwody', 'Pola i obwody', 'geometria', 'egzamin8', 41),
        ('twierdzenie-pitagorasa', 'Twierdzenie Pitagorasa', 'geometria', 'egzamin8', 42),
        ('symetrie-i-przeksztalcenia', 'Symetrie i przekształcenia', 'geometria', 'egzamin8', 43),
        ('trygonometria', 'Trygonometria', 'geometria', 'matura_podstawowa', 50),
        ('geometria-analityczna', 'Geometria analityczna', 'geometria', 'matura_podstawowa', 51),
        ('bryly', 'Bryły', 'geometria', 'matura_podstawowa', 52),
        ('pole-powierzchni-i-objetosc', 'Pole powierzchni i objętość', 'geometria', 'matura_podstawowa', 53),
        ('geometria-na-plaszczyznie', 'Geometria na płaszczyźnie (zaawansowana)', 'geometria', 'matura_rozszerzona', 60),
        ('geometria-przestrzenna', 'Geometria przestrzenna (zaawansowana)', 'geometria', 'matura_rozszerzona', 61),
        ('przekroje-bryl', 'Przekroje brył', 'geometria', 'matura_rozszerzona', 62),
        ('granice-ciągow', 'Granice ciągów', 'analiza', 'matura_podstawowa', 70),
        ('granice-funkcji', 'Granice funkcji', 'analiza', 'matura_rozszerzona', 80),
        ('pochodne', 'Pochodne', 'analiza', 'matura_rozszerzona', 81),
        ('calki', 'Całki', 'analiza', 'matura_rozszerzona', 82),
        ('zastosowania-pochodnych', 'Zastosowania pochodnych', 'analiza', 'matura_rozszerzona', 83),
        ('zastosowania-calek', 'Zastosowania całek', 'analiza', 'matura_rozszerzona', 84),
        ('kombinatoryka', 'Kombinatoryka', 'statystyka', 'matura_podstawowa', 90),
        ('prawdopodobienstwo', 'Prawdopodobieństwo', 'statystyka', 'matura_podstawowa', 91),
        ('statystyka-opisowa', 'Statystyka opisowa', 'statystyka', 'matura_podstawowa', 92),
        ('prawdopodobienstwo-warunkowe', 'Prawdopodobieństwo warunkowe', 'statystyka', 'matura_rozszerzona', 93)
        ON CONFLICT (slug) DO NOTHING;
      `);

      steps.push('Math topics seeded');
    } else {
      steps.push('Tables already exist');
    }

    // 3. Check if admin already exists in users table
    const existingAdmin = await sql`
      SELECT id FROM users WHERE role = 'admin' LIMIT 1
    `;

    if (existingAdmin.length > 0) {
      await sql.end();
      return NextResponse.json({
        message: 'Setup complete! Admin account already exists.',
        steps,
        login: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
      });
    }

    // 4. Create Supabase auth user
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl!, serviceKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Check if auth user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingAuthUser = existingUsers?.users?.find(
      (u) => u.email === ADMIN_EMAIL,
    );

    let authUserId: string;

    if (existingAuthUser) {
      authUserId = existingAuthUser.id;
      steps.push(`Auth user already exists (${authUserId})`);
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
        await sql.end();
        return NextResponse.json(
          { error: `Auth error: ${error.message}`, steps },
          { status: 500 },
        );
      }

      authUserId = data.user.id;
      steps.push(`Auth user created (${authUserId})`);
    }

    // 5. Insert into users table
    await sql`
      INSERT INTO users (id, email, role, first_name, last_name, phone, timezone)
      VALUES (
        ${authUserId},
        ${ADMIN_EMAIL},
        'admin',
        'Korepetytor',
        'Testowy',
        '+48123456789',
        'Europe/Warsaw'
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        role = 'admin',
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name
    `;

    steps.push('Users table row created');
    await sql.end();

    return NextResponse.json({
      message: 'Setup complete! Admin account ready.',
      steps,
      login: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      },
      note: 'You can now log in. Delete /api/setup after first use.',
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: `Setup failed: ${err instanceof Error ? err.message : String(err)}`,
        steps,
        help: 'Make sure DATABASE_URL points to your Supabase database (use port 5432 for direct connection, not 6543 pooler).',
      },
      { status: 500 },
    );
  }
}
