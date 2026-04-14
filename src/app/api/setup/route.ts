import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

const ADMIN_EMAIL = 'admin@korki.pl';
const ADMIN_PASSWORD = 'Test1234!';

/**
 * GET /api/setup
 *
 * One-time setup endpoint that creates a test admin user.
 * Only works when no admin user exists yet (first-run guard).
 */
export async function GET() {
  try {
    // Check if any admin already exists
    const [existingAdmin] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.role, 'admin'))
      .limit(1);

    if (existingAdmin) {
      return NextResponse.json({
        message: 'Admin account already exists. Setup skipped.',
      });
    }

    // Create Supabase auth user
    const supabase = await createServiceClient();
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
        { error: `Auth error: ${error.message}` },
        { status: 500 },
      );
    }

    // Insert into users table
    await db.insert(users).values({
      id: data.user.id,
      email: ADMIN_EMAIL,
      role: 'admin',
      firstName: 'Korepetytor',
      lastName: 'Testowy',
      phone: '+48123456789',
      timezone: 'Europe/Warsaw',
    });

    return NextResponse.json({
      message: 'Admin account created!',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      note: 'Delete this endpoint (/api/setup) after first use.',
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Setup failed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 },
    );
  }
}
