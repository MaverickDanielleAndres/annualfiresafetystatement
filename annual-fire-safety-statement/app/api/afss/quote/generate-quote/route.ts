import { NextRequest, NextResponse } from 'next/server';
import {
  findSessionIdByCookie,
  logActivity,
  updateSession,
} from '@/lib/afss/quote-session';
import { calculateQuote } from '@/lib/afss/pricing';
import { getAdminSupabase } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/afss/quote/generate-quote
 * Calculates a quote for the current session using afss.pricing_rules.
 *
 * Always creates a NEW quote row (with version=latest+1). Never
 * silently recalculates an accepted historical quote — pricing
 * rules change but accepted quotes are immutable.
 *
 * If no production rules apply, creates a manual_review_required
 * quote with total_amount=0 and review_reason explaining why.
 */
export async function POST(_req: NextRequest) {
  const id = await findSessionIdByCookie();
  if (!id)
    return NextResponse.json(
      { error: 'No active quote session.' },
      { status: 401 }
    );

  const sb = getAdminSupabase();

  // Gather inputs from session + property + measures.
  const { data: sess } = await sb
    .schema('afss')
    .from('quote_sessions')
    .select('id, quote_reference')
    .eq('id', id)
    .maybeSingle();
  if (!sess) return NextResponse.json({ error: 'Session not found.' }, { status: 404 });

  const { data: prop } = await sb
    .schema('afss')
    .from('properties')
    .select('postcode, state')
    .eq('quote_session_id', id)
    .maybeSingle();

  const { count: measureCount } = await sb
    .schema('afss')
    .from('fire_safety_measures')
    .select('*', { count: 'exact', head: true })
    .eq('quote_session_id', id);

  const hasSpecialist = await checkSpecialist(sb, id);

  const result = await calculateQuote({
    measure_count: measureCount ?? 0,
    has_specialist_practitioner: hasSpecialist,
    urgency: 'standard',
    postcode: (prop as any)?.postcode ?? null,
    state: (prop as any)?.state ?? null,
  });

  // Determine version.
  const { data: latest } = await sb
    .schema('afss')
    .from('quotes')
    .select('version')
    .eq('quote_session_id', id)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextVersion = ((latest as any)?.version ?? 0) + 1;

  // Quote number = quote_reference + version suffix.
  const quoteNumber = `${(sess as any).quote_reference}-V${nextVersion}`;

  // Supersede any previous draft quote (not accepted).
  await sb
    .schema('afss')
    .from('quotes')
    .update({ status: 'superseded' })
    .eq('quote_session_id', id)
    .in('status', ['draft', 'automatic', 'manual_review_required', 'sent']);

  const { data: newQuote, error: qErr } = await sb
    .schema('afss')
    .from('quotes')
    .insert({
      quote_session_id: id,
      quote_number: quoteNumber,
      version: nextVersion,
      status: result.requires_manual_review
        ? 'manual_review_required'
        : 'automatic',
      base_amount: result.base_amount,
      measures_amount: result.measures_amount,
      travel_amount: result.travel_amount,
      adjustments_amount: result.adjustments_amount,
      subtotal: result.subtotal,
      gst_amount: result.gst_amount,
      total_amount: result.total_amount,
      currency: 'AUD',
      calculation_snapshot_json: result.calculation_snapshot,
      requires_manual_review: result.requires_manual_review,
      review_reason: result.review_reason,
      calculated_at: new Date().toISOString(),
    })
    .select('id, quote_number, total_amount, requires_manual_review')
    .single();

  if (qErr || !newQuote)
    return NextResponse.json(
      { error: qErr?.message ?? 'Failed to create quote.' },
      { status: 500 }
    );

  // Insert line items.
  if (result.line_items.length > 0) {
    await sb.schema('afss').from('quote_line_items').insert(
      result.line_items.map((li) => ({
        quote_id: (newQuote as any).id,
        line_type: li.line_type,
        reference_key: li.reference_key,
        description: li.description,
        quantity: li.quantity,
        unit_amount: li.unit_amount,
        total_amount: li.total_amount,
        sort_order: li.sort_order,
      }))
    );
  }

  await updateSession(id, {
    status: result.requires_manual_review ? 'needs_review' : 'quoted',
    current_step: 'quote',
    completed_at: new Date().toISOString(),
  });
  await logActivity(id, 'quote_generated', {
    quote_id: (newQuote as any).id,
    total: result.total_amount,
    manual_review: result.requires_manual_review,
  });
  if (result.requires_manual_review)
    await logActivity(id, 'quote_review_required', {
      reason: result.review_reason,
    });

  return NextResponse.json({
    ok: true,
    quote_id: (newQuote as any).id,
    quote_number: (newQuote as any).quote_number,
    total_amount: Number((newQuote as any).total_amount),
    requires_manual_review: (newQuote as any).requires_manual_review,
  });
}

async function checkSpecialist(sb: any, sessionId: string): Promise<boolean> {
  const { data } = await sb
    .schema('afss')
    .from('fire_safety_measures')
    .select('normalized_measure_key')
    .eq('quote_session_id', sessionId)
    .not('normalized_measure_key', 'is', null);
  // Heuristic: any measure whose key indicates a specialist discipline.
  const specialist = (data ?? []).some((r: any) =>
    /specialist|fire_engineer|fire_safety_engineer/.test(
      String(r.normalized_measure_key ?? '')
    )
  );
  return specialist;
}