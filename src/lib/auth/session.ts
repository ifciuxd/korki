import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { UserRole } from '@/lib/constants';

export interface Session {
  userId: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

// DEV bypass — set AUTH_BYPASS=true to skip auth and act as admin
const AUTH_BYPASS = process.env.AUTH_BYPASS === 'true';

const MOCK_SESSION: Session = {
  userId: '00000000-0000-0000-0000-000000000000',
  email: 'admin@korki.pl',
  role: 'admin',
  firstName: 'Korepetytor',
  lastName: 'Testowy',
};

/**
 * Gets the current session. Returns null if not authenticated.
 */
export async function getSession(): Promise<Session | null> {
  if (AUTH_BYPASS) return MOCK_SESSION;

  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) return null;

    const [dbUser] = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(users)
      .where(eq(users.id, authUser.id))
      .limit(1);

    if (!dbUser) return null;

    return {
      userId: dbUser.id,
      email: dbUser.email,
      role: dbUser.role as UserRole,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
    };
  } catch {
    // If Supabase/DB is not configured or unreachable, treat as unauthenticated
    return null;
  }
}

/**
 * Requires authentication. Redirects to login if not authenticated.
 */
export async function requireAuth(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    redirect('/auth/login');
  }
  return session;
}

/**
 * Requires a specific role. Redirects to appropriate dashboard if wrong role.
 */
export async function requireRole(role: UserRole): Promise<Session> {
  if (AUTH_BYPASS) return { ...MOCK_SESSION, role };

  const session = await requireAuth();
  if (session.role !== role) {
    redirect(getDashboardPath(session.role));
  }
  return session;
}

/**
 * Returns the dashboard path for a given role.
 */
export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'parent':
      return '/parent/dashboard';
    case 'student':
      return '/student/dashboard';
  }
}
