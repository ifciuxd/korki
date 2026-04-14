import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  const isConfigured =
    url.length > 0 &&
    anonKey.length > 0 &&
    !url.includes('<PASTE_') &&
    !anonKey.includes('<PASTE_');
  return { url, anonKey, serviceKey, isConfigured };
}

export async function createClient() {
  const { url, anonKey, isConfigured } = getSupabaseEnv();

  if (!isConfigured) {
    // Return a stub that always reports no user
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithPassword: async () => ({
          data: { user: null, session: null },
          error: { message: 'Supabase is not configured' },
        }),
        signUp: async () => ({
          data: { user: null, session: null },
          error: { message: 'Supabase is not configured' },
        }),
        signOut: async () => ({ error: null }),
      },
    } as unknown as Awaited<ReturnType<typeof createConfiguredClient>>;
  }

  return createConfiguredClient(url, anonKey);
}

async function createConfiguredClient(url: string, anonKey: string) {
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // setAll is called from Server Components where cookies can't be set.
          // This can be ignored if middleware refreshes sessions.
        }
      },
    },
  });
}

export async function createServiceClient() {
  const { url, serviceKey, isConfigured } = getSupabaseEnv();
  if (!isConfigured || !serviceKey || serviceKey.includes('<PASTE_')) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY.',
    );
  }
  const { createClient: createSupabaseClient } = await import(
    '@supabase/supabase-js'
  );
  return createSupabaseClient(url, serviceKey);
}
