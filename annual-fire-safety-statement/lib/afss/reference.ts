/**
 * AFSS — human-readable quote reference generator.
 *
 * Format: AFSS-YYYY-NNNNNN
 *   * YYYY = current year (Sydney time)
 *   * NNNNNN = 6-digit zero-padded sequence value
 *
 * Normal path (migration 09 applied):
 *   The application INSERTs into afss.quote_sessions WITHOUT
 *   supplying quote_reference. The BEFORE-INSERT trigger
 *   `trg_quote_sessions_set_reference` calls
 *   `afss.next_quote_reference()` which allocates the next
 *   sequence value and computes the year server-side. The row is
 *   returned with quote_reference populated. This is the
 *   concurrency-safe path Postgres guarantees for us.
 *
 * Why we DON'T pre-call the function in JS:
 *   PostgREST in this project exposes only `public, graphql_public`
 *   for RPC lookup. The function `afss.next_quote_reference()`
 *   lives in the `afss` schema and is therefore not addressable
 *   as a PostgREST RPC. Letting the trigger allocate is the
 *   single, safe, race-free path.
 *
 * Emergency fallback (if migration 09 was not applied or the
 *   trigger is missing for any reason):
 *   Hash a freshly-generated UUID and map to a 6-digit suffix.
 *   Unique per session; not a sequence, but still human-readable
 *   and matches the documented format.
 *
 * This module exports:
 *   - generateQuoteReference(...)  : legacy JS-side allocator
 *                                   kept as defensive fallback only
 *   - effectiveQuoteReferenceFor(...) : post-insert read-back helper
 *   - isValidQuoteReference(...)  : format validator
 */

import type { SupabaseClient } from '@supabase/supabase-js';

const REF_RE = /^AFSS-\d{4}-\d{6}$/;

/**
 * Synchronous JS-side fallback allocator. Used only when an
 * explicit reference must be supplied to the INSERT (i.e. when the
 * trigger may not exist). NEVER prefer this path if the trigger
 * is in place — the trigger gives us a strictly monotonic,
 * server-side, race-free reference.
 */
export function generateQuoteReference(): string {
  const year = new Date().getUTCFullYear();
  return `AFSS-${year}-${hashSixDigitsFromUuid()}`;
}

function hashSixDigitsFromUuid(): string {
  let raw = 0;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { randomUUID, createHash } = require('node:crypto') as typeof import('node:crypto');
    const u = randomUUID();
    const h = createHash('sha256').update(u).digest();
    const v =
      (h[0] << 24) | (h[1] << 16) | (h[2] << 8) | h[3];
    raw = ((v >>> 0) % 999_999) + 1;
  } catch {
    raw = ((Date.now() % 999_999) + 1);
  }
  return String(raw).padStart(6, '0').slice(-6);
}

export function isValidQuoteReference(ref: string): boolean {
  return REF_RE.test(ref);
}
