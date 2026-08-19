import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
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
 * session and persists it as afss.quotes(is_simulation=true).
 *
 * Race / replay safety:
 *   The route is naturally race-prone because two rapid submits
 *   (e.g. double-click, HMR replay) both compute the same
 *   sequential quote_number and the second INSERT violates the
 *   unique constraint. We therefore:
 *     1) supersede prior non-final quotes for this session,
 *     2) build a STABLE, DETERMINISTIC quote_number for the
 *        session (one row per session, replacing the old one),
 *     3) UPSERT on the `quote_number` so concurrent retries
 *        merge instead of failing on duplicate.
 *   Result: the route is idempotent and HMR-safe.
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

  const requiresManualReview =
    calculated.totalAmount <= 0 || !!calculated.reviewReason;

  // Stable, session-unique quote_number. One per session;
  // re-running this route upserts the existing row.
  const quoteNumber = `SIM-${id}-${(sess as any).quote_reference}`;

  // Supersede any prior non-final quotes for this session EXCEPT
  // the one we're about to upsert (matched by quote_number). This
  // keeps history clean while not deleting the row we want to
  // update in place.
  await sb
    .schema('afss')
    .from('quotes')
    .update({ status: 'superseded' })
    .eq('quote_session_id', id)
    .in('status', ['draft', 'automatic', 'manual_review_required', 'sent'])
    .neq('quote_number', quoteNumber);

  // UPSERT on quote_number so concurrent retries merge instead of
  // colliding on the unique constraint. version stays at 1.
  const basePayload = {
    quote_session_id: id,
    quote_number: quoteNumber,
    version: 1,
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
  };

  let upserted: any = null;
  let upErr: any = null;
  let usedPayload = basePayload;
  try {
    const r = await sb
      .schema('afss')
      .from('quotes')
      .upsert(basePayload, { onConflict: 'quote_number' })
      .select('id, quote_number, total_amount, requires_manual_review')
      .single();
    upserted = r.data;
    upErr = r.error;
  } catch (e: any) {
    upErr = { message: e?.message ?? 'upsert failed' };
  }

  // If the columns added by migration 09 are still missing in this
  // environment, retry WITHOUT them (drop only what was reported).
  if (
    upErr &&
    /Could not find the '([^']+)' column/.test(upErr.message ?? '')
  ) {
    const re = /Could not find the '([^']+)' column/g;
    const drop = new Set<string>();
    let m: RegExpExecArray | null;
    while ((m = re.exec(upErr.message))) drop.add(m[1]);
    if (drop.size > 0) {
      const slim: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(basePayload)) {
        if (!drop.has(k)) slim[k] = v;
      }
      usedPayload = slim as any;
      try {
        const r = await sb
          .schema('afss')
          .from('quotes')
          .upsert(usedPayload, { onConflict: 'quote_number' })
          .select('id, quote_number, total_amount, requires_manual_review')
          .single();
        upserted = r.data;
        upErr = r.error;
      } catch (e: any) {
        upErr = { message: e?.message ?? 'fallback upsert failed' };
      }
    }
  }

  if (upErr || !upserted) {
    return NextResponse.json(
      { error: upErr?.message ?? 'Failed to create simulation quote.' },
      { status: 500 }
    );
  }

  // Replace existing line items for this quote. Delete-and-insert
  // is cheap and race-safe; quote_line_items has no unique
  // constraint that matters here.
  await sb
    .schema('afss')
    .from('quote_line_items')
    .delete()
    .eq('quote_id', (upserted as any).id);

  if (calculated.lineItems.length > 0) {
    await sb.schema('afss').from('quote_line_items').insert(
      calculated.lineItems.map((li, idx) => ({
        quote_id: (upserted as any).id,
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
    quote_id: (upserted as any).id,
    total: calculated.totalAmount,
    engine_mode: engine.mode,
    manual_review: requiresManualReview,
  });

  const refreshed = await getCurrentSession();

  return NextResponse.json({
    ok: true,
    quote_id: (upserted as any).id,
    quote_number: (upserted as any).quote_number,
    total_amount: Number((upserted as any).total_amount),
    requires_manual_review: requiresManualReview,
    currency: 'AUD',
    is_simulation: engine.mode === 'simulation',
    review_reason: calculated.reviewReason,
    session: refreshed,
  });
}

// Suppress unused import warning in some bundlers.
void randomUUID;

