/**
 * AFSS — repository helpers for quote_sessions.
 *
 * All callers go through `getAdminSupabase()` (service role). Browser
 * callers cannot reach here. Cookie token verification happens at the
 * edge of each route handler.
 */

import { getAdminSupabase } from '@/lib/supabase/admin';
import {
  generateQuoteReference,
} from '@/lib/afss/reference';
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
  const { rawToken, tokenHash } = (await import('@/lib/afss/session'))
    .generateSessionToken();
  const quote_reference = await generateQuoteReference();

  const sb = getAdminSupabase();
  const { data, error } = await sb
    .schema('afss')
    .from('quote_sessions')
    .insert({
      quote_reference,
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

  if (error || !data)
    throw new Error(`Failed to create quote session: ${error?.message}`);

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
  await sb
    .schema('afss')
    .from('activity_events')
    .insert({
      quote_session_id: quoteSessionId,
      event_type: eventType,
      metadata_json: metadata,
    });
}

export async function updateSession(
  id: string,
  patch: Record<string, unknown>
): Promise<void> {
  const sb = getAdminSupabase();
  await sb.schema('afss').from('quote_sessions').update(patch).eq('id', id);
}

export async function upsertProperty(
  quoteSessionId: string,
  property: Record<string, unknown>
): Promise<void> {
  const sb = getAdminSupabase();
  // Properties are 1:1 per session — UPSERT on quote_session_id.
  await sb
    .schema('afss')
    .from('properties')
    .upsert(
      { quote_session_id: quoteSessionId, ...property },
      { onConflict: 'quote_session_id' }
    );
}

export async function getSessionSummary(
  quoteSessionId: string
): Promise<QuoteSessionSummary | null> {
  const sb = getAdminSupabase();

  const { data: sess } = await sb
    .schema('afss')
    .from('quote_sessions')
    .select(
      'quote_reference, status, current_step, document_choice'
    )
    .eq('id', quoteSessionId)
    .maybeSingle();
  if (!sess) return null;

  // Latest quote (if any).
  const { data: quote } = await sb
    .schema('afss')
    .from('quotes')
    .select(
      'quote_number, status, total_amount, currency, requires_manual_review'
    )
    .eq('quote_session_id', quoteSessionId)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();

  // Most recent payment gate status (if any).
  const { data: pay } = await sb
    .schema('afss')
    .from('payments')
    .select('blocked_by_business_rule')
    .eq('quote_session_id', quoteSessionId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

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
  };
}