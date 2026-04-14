import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/register'];

// Role-based route prefixes
const ROLE_ROUTES: Record<string, string> = {
  '/admin': 'admin',
  '/parent': 'parent',
  '/student': 'student',
};

export async function proxy(request: NextRequest) {
  const { user, supabaseResponse } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // DEV bypass — skip all auth checks
  if (process.env.AUTH_BYPASS === 'true') {
    return supabaseResponse;
  }

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname === route)) {
    return supabaseResponse;
  }

  // Allow API routes and static files
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/')) {
    return supabaseResponse;
  }

  // Redirect unauthenticated users to login
  if (!user) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check role-based access
  // The actual role check is done in the layout via requireRole(),
  // but we do a lightweight check in proxy using the user metadata
  // that Supabase stores (set during registration).
  // Full DB-backed check happens in the server component layouts.
  for (const [prefix, requiredRole] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(prefix)) {
      const userRole = user.user_metadata?.role as string | undefined;
      if (userRole && userRole !== requiredRole) {
        // Redirect to their own dashboard
        const dashboardUrl = new URL(
          `/${userRole}/dashboard`,
          request.url,
        );
        return NextResponse.redirect(dashboardUrl);
      }
      break;
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
