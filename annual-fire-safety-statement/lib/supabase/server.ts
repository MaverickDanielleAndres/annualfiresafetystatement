/**
 * AFSS — public Supabase client (for the browser, if ever needed).
 *
 * The Instant Quote modal does NOT need this client because all DB
 * writes go through server actions / route handlers. This client is
 * reserved for future use (e.g. realtime quote status if added later).
 *
 * Exposing the publishable key is safe; never expose SUPABASE_SECRET_KEY.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

export function getPublicSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;

  if (_client) return _client;
  _client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}