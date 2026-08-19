/**
 * AFSS — privileged Supabase client (service role).
 *
 * Used server-side for ALL database operations on AFSS tables.
 * Bypasses RLS. NEVER expose to the browser.
 *
 * Initialised lazily so missing env vars fail loudly on first call,
 * not on import.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _admin: SupabaseClient | null = null;

export function getAdminSupabase(): SupabaseClient {
  if (_admin) return _admin;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    throw new Error(
      '[afss] SUPABASE_URL and SUPABASE_SECRET_KEY must be set. ' +
        'These are server-only credentials.'
    );
  }

  _admin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'X-Client-Info': 'afss-next-server' } },
  });

  return _admin;
}