import { NextRequest, NextResponse } from 'next/server';
import {
  findSessionIdByCookie,
  logActivity,
  updateSession,
  getCurrentSession,
} from '@/lib/afss/quote-session';
import { getAdminSupabase } from '@/lib/supabase/admin';
import { createQuoteEngine } from '@/lib/afss/providers/quote-engine';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/afss/quote/simulation-quote
 *
 * Generates (or refreshes) a SIMULATION quote for the current
 * session, persists it as afss.quotes(is_simulation=true), and
 * returns the total. Created exactly once per session unless the
 * session is reset by Ops.
 *
 * If the simulation total is not configured (env var missing),
 * the returned quote has total=0 with a clear reason.
 */
export async function POST(_req: NextRequest) {
  const id = await findSessionIdByCookie();
  if (!id)
    return NextResponse.json(
      { error: 'No active quote session.' },
      { status: 401 }
    );

  const sb = getAdminSupabase();
  const { data: sess } = await sb
    .schema('afss')
    .from('quote_sessions')
    .select('quote_reference')
    .eq('id', id)
    .maybeSingle();
  if (!sess)
    return NextResponse.json({ error: 'Session not found.' }, { status: 404 });

  // Validate prior required steps.
  const { data: prop } = await sb
    .schema('afss')
    .from('properties')
    .select('postcode, state, building_confirmed')
    .eq('quote_session_id', id)
    .maybeSingle();
  if (!(prop as any)?.building_confirmed) {
    return NextResponse.json(
      { error: 'Building confirmation is required before quoting.' },
      { status: 400 }
    );
  }

  const engine = createQuoteEngine();
  const calculated = await engine.calculate({
    quoteSessionId: id,
    postcode: (prop as any)?.postcode ?? null,
    state: (prop as any)?.state ?? null,
  });

  // Supersede any prior quotes for this session.
  await sb
    .schema('afss')
    .from('quotes')
    .update({ status: 'superseded' })
    .eq('quote_session_id', id)
    .in('status', ['draft', 'automatic', 'manual_review_required', 'sent']);

  const nextVersion = await nextVersionFor(sb, id);
  const quoteNumber = `${(sess as any).quote_reference}-V${nextVersion}`;

  const requiresManualReview =
    calculated.totalAmount <= 0 || !!calculated.reviewReason;

  const { data: newQuote, error: qErr } = await sb
    .schema('afss')
    .from('quotes')
    .insert({
      quote_session_id: id,
      quote_number: quoteNumber,
      version: nextVersion,
      status: requiresManualReview ? 'manual_review_required' : 'automatic',
      base_amount: calculated.totalAmount,
      measures_amount: 0,
      travel_amount: 0,
      adjustments_amount: 0,
      subtotal: calculated.totalAmount,
      gst_amount: 0,
      total_amount: calculated.totalAmount,
      currency: 'AUD',
      calculation_snapshot_json: {
        engine_mode: engine.mode,
        reason: calculated.reviewReason,
        line_items: calculated.lineItems,
        calculated_at: new Date().toISOString(),
      },
      requires_manual_review: requiresManualReview,
      review_reason: calculated.reviewReason,
      is_simulation: engine.mode === 'simulation',
      quote_mode: engine.mode,
      calculated_at: new Date().toISOString(),
    })
    .select('id, quote_number, total_amount, requires_manual_review')
    .single();

  // If migration 09 hasn't added is_simulation / quote_mode, retry
  // with the legacy payload.
  let inserted = newQuote;
  let insertErr = qErr;
  if (qErr && /Could not find the '([^']+)' column/.test(qErr.message)) {
    const legacyPayload = {
      quote_session_id: id,
      quote_number: quoteNumber,
      version: nextVersion,
      status: requiresManualReview ? 'manual_review_required' : 'automatic',
      base_amount: calculated.totalAmount,
      measures_amount: 0,
      travel_amount: 0,
      adjustments_amount: 0,
      subtotal: calculated.totalAmount,
      gst_amount: 0,
      total_amount: calculated.totalAmount,
      currency: 'AUD',
      calculation_snapshot_json: {
        engine_mode: engine.mode,
        reason: calculated.reviewReason,
        line_items: calculated.lineItems,
        calculated_at: new Date().toISOString(),
      },
      requires_manual_review: requiresManualReview,
      review_reason: calculated.reviewReason,
      calculated_at: new Date().toISOString(),
    };
    console.warn(
      '[afss] simulation-quote retrying without migration-09 columns'
    );
    const retry = await sb
      .schema('afss')
      .from('quotes')
      .insert(legacyPayload)
      .select('id, quote_number, total_amount, requires_manual_review')
      .single();
    inserted = retry.data;
    insertErr = retry.error;
  }

  if (insertErr || !inserted)
    return NextResponse.json(
      { error: insertErr?.message ?? 'Failed to create simulation quote.' },
      { status: 500 }
    );

  // Insert line items.
  if (calculated.lineItems.length > 0) {
    await sb.schema('afss').from('quote_line_items').insert(
      calculated.lineItems.map((li, idx) => ({
        quote_id: (inserted as any).id,
        line_type: 'base',
        reference_key: `simulation:${idx}`,
        description: li.description,
        quantity: 1,
        unit_amount: li.amount,
        total_amount: li.amount,
        sort_order: 100 + idx,
      }))
    );
  }

  await updateSession(id, {
  status: requiresManualReview ? 'needs_review' : 'quoted',
  current_step: 'quote',
  quote_mode: engine.mode,
});

  await logActivity(id, 'quote_generated', {
    quote_id: (inserted as any).id,
    total: calculated.totalAmount,
    engine_mode: engine.mode,
    manual_review: requiresManualReview,
  });

  // Refresh latest summary.
  const refreshed = await getCurrentSession();

  return NextResponse.json({
    ok: true,
    quote_id: (inserted as any).id,
    quote_number: (inserted as any).quote_number,
    total_amount: Number((inserted as any).total_amount),
    requires_manual_review: requiresManualReview,
    currency: 'AUD',
    is_simulation: engine.mode === 'simulation',
    review_reason: calculated.reviewReason,
    session: refreshed,
  });
}

async function nextVersionFor(sb: any, sessionId: string): Promise<number> {
  const { data: latest } = await sb
    .schema('afss')
    .from('quotes')
    .select('version')
    .eq('quote_session_id', sessionId)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();
  return ((latest as any)?.version ?? 0) + 1;
}
