/**
 * AFSS — repository helpers for quote_sessions.
 *
 * All callers go through `getAdminSupabase()` (service role). Browser
 * callers cannot reach here. Cookie token verification happens at the
 * edge of each route handler.
 */

import { getAdminSupabase } from '@/lib/supabase/admin';
import { generateQuoteReference } from '@/lib/afss/reference';
import {
  hashSessionToken,
  readSessionCookie,
  writeSessionCookie,
} from '@/lib/afss/session';
import type {
  QuoteSessionSummary,
  QuoteStatus,
  QuoteStep,
} from '@/lib/afss/types';

export async function findSessionIdByCookie(): Promise<string | null> {
  const raw = await readSessionCookie();
  if (!raw) return null;
  const tokenHash = hashSessionToken(raw);
  const sb = getAdminSupabase();
  const { data } = await sb
    .schema('afss')
    .from('quote_sessions')
    .select('id')
    .eq('session_token_hash', tokenHash)
    .maybeSingle();
  return data?.id ?? null;
}

/**
 * Returns the session for the current cookie. Null if no cookie
 * OR cookie doesn't match any row.
 */
export async function getCurrentSession(): Promise<{
  id: string;
  quote_reference: string;
  status: QuoteStatus;
  current_step: QuoteStep;
} | null> {
  const id = await findSessionIdByCookie();
  if (!id) return null;
  const sb = getAdminSupabase();
  const { data } = await sb
    .schema('afss')
    .from('quote_sessions')
    .select('id, quote_reference, status, current_step')
    .eq('id', id)
    .maybeSingle();
  return data as any;
}

export interface CreateSessionInput {
  first_name: string;
  email: string;
  email_normalized: string;
  mobile: string;
  mobile_normalized: string;
  source?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
  referrer_url?: string | null;
  landing_path?: string | null;
}

/**
 * Starts a new quote session. Returns the new session's UUID.
 *
 * Idempotent: if the cookie already maps to a session, returns it.
 *
 * Quote reference strategy:
 *   First attempt: INSERT without quote_reference so the
 *   trg_quote_sessions_set_reference trigger (migration 09) allocates
 *   a fresh AFSS-YYYY-NNNNNN reference server-side. The
 *   RETURNING clause then exposes that reference to the
 *   application. This is the canonical path.
 *
 *   Fallback: if the INSERT is rejected because the trigger is
 *   missing, retry with a JS-generated reference.
 */
export async function startOrResumeSession(
  input: CreateSessionInput
): Promise<{ id: string; quote_reference: string; isNew: boolean }> {
  // Try cookie first.
  const existingId = await findSessionIdByCookie();
  if (existingId) {
    const sb = getAdminSupabase();
    const { data } = await sb
      .schema('afss')
      .from('quote_sessions')
      .select('id, quote_reference')
      .eq('id', existingId)
      .maybeSingle();
    if (data)
      return {
        id: data.id as string,
        quote_reference: data.quote_reference as string,
        isNew: false,
      };
  }

  // Create new.
  const { rawToken, tokenHash } = await import('@/lib/afss/session').then(m =>
    m.generateSessionToken()
  );

  const sb = getAdminSupabase();

  // Attempt 1: let the DB trigger allocate the reference.
  let { data, error } = await sb
    .schema('afss')
    .from('quote_sessions')
    .insert({
      // quote_reference intentionally omitted — trigger fills it.
      session_token_hash: tokenHash,
      status: 'contact_saved',
      current_step: 'contact',
      first_name: input.first_name,
      email: input.email,
      email_normalized: input.email_normalized,
      mobile: input.mobile,
      mobile_normalized: input.mobile_normalized,
      source: input.source ?? null,
      utm_source: input.utm_source ?? null,
      utm_medium: input.utm_medium ?? null,
      utm_campaign: input.utm_campaign ?? null,
      utm_term: input.utm_term ?? null,
      utm_content: input.utm_content ?? null,
      referrer_url: input.referrer_url ?? null,
      landing_path: input.landing_path ?? null,
    })
    .select('id, quote_reference')
    .single();

  if (error || !data) {
    // Attempt 2: defensive fallback — pre-generate a reference.
    const fallbackRef = await generateQuoteReference();
    const retry = await sb
      .schema('afss')
      .from('quote_sessions')
      .insert({
        quote_reference: fallbackRef,
        session_token_hash: tokenHash,
        status: 'contact_saved',
        current_step: 'contact',
        first_name: input.first_name,
        email: input.email,
        email_normalized: input.email_normalized,
        mobile: input.mobile,
        mobile_normalized: input.mobile_normalized,
        source: input.source ?? null,
        utm_source: input.utm_source ?? null,
        utm_medium: input.utm_medium ?? null,
        utm_campaign: input.utm_campaign ?? null,
        utm_term: input.utm_term ?? null,
        utm_content: input.utm_content ?? null,
        referrer_url: input.referrer_url ?? null,
        landing_path: input.landing_path ?? null,
      })
      .select('id, quote_reference')
      .single();
    if (retry.error || !retry.data) {
      throw new Error(
        `Failed to create quote session: ${(error ?? retry.error)?.message}`
      );
    }
    data = retry.data;
    error = null;
    console.warn(
      '[afss] startOrResumeSession used JS-side reference (trigger missing?)'
    );
  }

  await writeSessionCookie(rawToken);
  await logActivity(data.id as string, 'contact_saved', {
    first_name: input.first_name,
  });

  return {
    id: data.id as string,
    quote_reference: data.quote_reference as string,
    isNew: true,
  };
}

export async function logActivity(
  quoteSessionId: string,
  eventType: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  const sb = getAdminSupabase();
  let payload: { quote_session_id: string; event_type: string; metadata_json: Record<string, unknown> } = {
    quote_session_id: quoteSessionId,
    event_type: eventType,
    metadata_json: metadata,
  };
  let { error } = await sb
    .schema('afss')
    .from('activity_events')
    .insert(payload);
  if (
    error &&
    /activity_events_type_valid/.test(error.message) ||
    (error && /check constraint/.test(error.message))
  ) {
    // Migration 09 isn't applied yet. Fall back to an existing
    // allowed event type and embed the original one in metadata so
    // the audit signal is still preserved.
    const fallback = 'session_resumed';
    payload = {
      quote_session_id: quoteSessionId,
      event_type: fallback,
      metadata_json: { ...metadata, _intended_event_type: eventType },
    };
    const retry = await sb
      .schema('afss')
      .from('activity_events')
      .insert(payload);
    error = retry.error;
    if (!error) {
      console.warn(
        '[afss] logActivity fell back to',
        fallback,
        'for',
        eventType
      );
    }
  }
  if (error) {
    console.error('[afss] logActivity failed:', eventType, error.message);
  }
}

export async function updateSession(
  id: string,
  patch: Record<string, unknown>
): Promise<void> {
  const sb = getAdminSupabase();
  // Migration-09-only columns. Stripped wholesale if any is missing
  // in the live schema.
  const OPTIONAL_NEW = new Set<string>([
    'quote_mode',
    'payment_preference',
    'final_submitted_at',
    'final_submission_id',
  ]);
  let { error } = await sb
    .schema('afss')
    .from('quote_sessions')
    .update(patch)
    .eq('id', id);
  if (
    error &&
    /Could not find the '([^']+)' column/.test(error.message)
  ) {
    const slim: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(patch)) {
      if (!OPTIONAL_NEW.has(k)) slim[k] = v;
    }
    if (Object.keys(slim).length < Object.keys(patch).length) {
      console.warn(
        '[afss] updateSession dropped migration-09-only columns:',
        Object.keys(patch)
          .filter((k) => OPTIONAL_NEW.has(k))
          .join(', ')
      );
    }
    const retry = await sb
      .schema('afss')
      .from('quote_sessions')
      .update(slim)
      .eq('id', id);
    error = retry.error;
  }
  if (error) throw new Error(`updateSession: ${error.message}`);
}

export async function upsertProperty(
  quoteSessionId: string,
  property: Record<string, unknown>
): Promise<void> {
  const sb = getAdminSupabase();
  // Columns introduced by migration 09 — dropped wholesale if any
  // is missing in the live schema. This lets the app keep working
  // in environments where migration 09 has not been applied yet.
  const OPTIONAL_NEW = new Set<string>([
    'address_provider',
    'address_provider_id',
    'address_provider_json',
    'street_image_provider',
    'street_image_id',
    'street_image_sequence_id',
    'street_image_captured_at',
    'street_image_thumb_url',
    'street_image_json',
    'street_image_search_radius_m',
  ]);
  const fullPayload = { quote_session_id: quoteSessionId, ...property };
  let result = await sb
    .schema('afss')
    .from('properties')
    .upsert(fullPayload, { onConflict: 'quote_session_id' });
  if (
    result.error &&
    /Could not find the '([^']+)' column/.test(result.error.message)
  ) {
    // Drop all OPTIONAL_NEW columns at once and retry, since
    // PostgREST reports only the first missing column per error.
    const slim: Record<string, unknown> = { quote_session_id: quoteSessionId };
    for (const [k, v] of Object.entries(fullPayload)) {
      if (!OPTIONAL_NEW.has(k)) slim[k] = v;
    }
    if (Object.keys(slim).length < Object.keys(fullPayload).length) {
      console.warn(
        '[afss] upsertProperty dropped migration-09-only columns:',
        Object.keys(fullPayload)
          .filter((k) => OPTIONAL_NEW.has(k))
          .join(', ')
      );
    }
    result = await sb
      .schema('afss')
      .from('properties')
      .upsert(slim, { onConflict: 'quote_session_id' });
  }
  if (result.error) throw new Error(`upsertProperty: ${result.error.message}`);
}

export async function insertDocument(
  row: Record<string, unknown>
): Promise<{ id: string }> {
  const sb = getAdminSupabase();
  const { data, error } = await sb
    .schema('afss')
    .from('documents')
    .insert(row)
    .select('id')
    .single();
  if (error) throw new Error(`insertDocument: ${error.message}`);
  return { id: (data as any).id as string };
}

/**
 * Full session summary the UI needs to render any step + the
 * success modal. Includes the new mode/payment_preference/
 * final_submitted_at fields and a `resume_step` hint.
 */
export async function getSessionSummary(
  quoteSessionId: string
): Promise<QuoteSessionSummary | null> {
  const sb = getAdminSupabase();

  const { data: sess } = await sb
    .schema('afss')
    .from('quote_sessions')
    .select(
      `quote_reference, status, current_step, document_choice,
       quote_mode, payment_preference, final_submitted_at`
    )
    .eq('id', quoteSessionId)
    .maybeSingle();
  if (!sess) return null;

  const { data: quote } = await sb
    .schema('afss')
    .from('quotes')
    .select(
      `quote_number, status, total_amount, currency, requires_manual_review, is_simulation`
    )
    .eq('quote_session_id', quoteSessionId)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: pay } = await sb
    .schema('afss')
    .from('payments')
    .select('blocked_by_business_rule, payment_mode')
    .eq('quote_session_id', quoteSessionId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: submission } = await sb
    .schema('afss')
    .from('quote_submissions')
    .select('id')
    .eq('quote_session_id', quoteSessionId)
    .maybeSingle();

  const hasSubmission = !!submission;

  return {
    quote_reference: (sess as any).quote_reference,
    status: (sess as any).status,
    current_step: (sess as any).current_step,
    document_choice: (sess as any).document_choice,
    requires_manual_review: (quote as any)?.requires_manual_review ?? false,
    quote_number: (quote as any)?.quote_number ?? null,
    quote_status: (quote as any)?.status ?? null,
    total_amount:
      (quote as any)?.total_amount != null
        ? Number((quote as any).total_amount)
        : null,
    currency: (quote as any)?.currency ?? 'AUD',
    blocked_by_business_rule: (pay as any)?.blocked_by_business_rule ?? true,
    quote_mode: (sess as any).quote_mode ?? ((quote as any)?.is_simulation ? 'simulation' : 'real'),
    payment_preference: (sess as any).payment_preference ?? null,
    final_submitted_at: (sess as any).final_submitted_at ?? null,
    is_submitted: hasSubmission,
  };
}
