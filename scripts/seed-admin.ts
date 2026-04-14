/**
 * Seed script: creates a test admin user.
 *
 * Usage:
 *   npx tsx scripts/seed-admin.ts
 *
 * Prerequisites:
 *   - .env.local with NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL
 *   - Database migrations already applied
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import postgres from 'postgres';

const ADMIN_EMAIL = 'admin@korki.pl';
const ADMIN_PASSWORD = 'Test1234!';
const ADMIN_FIRST_NAME = 'Korepetytor';
const ADMIN_LAST_NAME = 'Testowy';

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const databaseUrl = process.env.DATABASE_URL;

  if (!supabaseUrl || !serviceRoleKey || !databaseUrl) {
    console.error('Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL');
    process.exit(1);
  }

  // Create Supabase admin client
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find((u) => u.email === ADMIN_EMAIL);

  let authUserId: string;

  if (existing) {
    console.log(`Auth user ${ADMIN_EMAIL} already exists (${existing.id})`);
    authUserId = existing.id;
  } else {
    // Create auth user
    const { data, error } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        firstName: ADMIN_FIRST_NAME,
        lastName: ADMIN_LAST_NAME,
      },
    });

    if (error) {
      console.error('Failed to create auth user:', error.message);
      process.exit(1);
    }

    authUserId = data.user.id;
    console.log(`Created auth user: ${ADMIN_EMAIL} (${authUserId})`);
  }

  // Insert into users table
  const sql = postgres(databaseUrl, { prepare: false });

  try {
    await sql`
      INSERT INTO users (id, email, role, first_name, last_name, phone, timezone)
      VALUES (
        ${authUserId},
        ${ADMIN_EMAIL},
        'admin',
        ${ADMIN_FIRST_NAME},
        ${ADMIN_LAST_NAME},
        '+48123456789',
        'Europe/Warsaw'
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        role = 'admin',
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name
    `;
    console.log('Inserted/updated users table row');
  } catch (err) {
    console.error('Failed to insert into users table:', err);
  }

  await sql.end();

  console.log('\n--- Test Account ---');
  console.log(`Email:    ${ADMIN_EMAIL}`);
  console.log(`Password: ${ADMIN_PASSWORD}`);
  console.log(`Role:     admin`);
  console.log('--------------------');
}

main().catch(console.error);
