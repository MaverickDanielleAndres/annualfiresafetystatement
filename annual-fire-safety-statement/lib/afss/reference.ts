/**
 * AFSS — human-readable quote reference generator.
 *
 * Format: AFSS-YYYY-NNNNNN
 *   * YYYY = current year (Sydney time)
 *   * NNNNNN = 6-digit zero-padded sequence value
 *
 * Concurrency-safe via the database sequence (afss.quote_reference_seq).
 * No COUNT(*) + 1. No race condition.
 */

import { getAdminSupabase } from '@/lib/supabase/admin';

export async function generateQuoteReference(): Promise<string> {
  const sb = getAdminSupabase();
  const { data, error } = await sb.rpc('nextval', {
    sequence_name: 'afss.quote_reference_seq',
  });

  if (error || data === null) {
    throw new Error(
      `[afss] Failed to allocate quote_reference_seq: ${error?.message ?? 'unknown'}`
    );
  }

  const year = new Date().getUTCFullYear();
  const padded = String(data).padStart(6, '0');
  return `AFSS-${year}-${padded}`;
}

export function isValidQuoteReference(ref: string): boolean {
  return /^AFSS-\d{4}-\d{6}$/.test(ref);
}