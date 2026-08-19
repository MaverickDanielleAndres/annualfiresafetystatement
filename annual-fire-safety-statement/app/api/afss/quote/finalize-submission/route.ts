import { NextRequest, NextResponse } from 'next/server';
import {
  findSessionIdByCookie,
  logActivity,
  updateSession,
} from '@/lib/afss/quote-session';
import { getAdminSupabase } from '@/lib/supabase/admin';
import { createPaymentProvider } from '@/lib/afss/providers/payment-provider';
import { generateQuoteReference } from '@/lib/afss/reference';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/afss/quote/finalize-submission
 *
 * Body: { payment_preference: 'pay_now_simulation' | 'contact_first' }
 *
 * Finalises the session and writes an afss.quote_submissions row.
 * Idempotent on quote_session_id: if a final submission already
 * exists for this session, return it (so a browser refresh does
 * NOT double-submit).
 *
 * Outcome:
 *   * pay_now_simulation → call SimulatedPaymentProvider.start(),
 *     insert payments row with payment_mode='simulation',
 *     write submission row with payment_status='simulated_paid'.
 *   * contact_first     → no payment row, write submission row
 *     with payment_status='deferred'.
 *
 * Either way, returns the persisted submission reference so the
 * UI can render the final success modal.
 */
export async function POST(req: NextRequest) {
  const id = await findSessionIdByCookie();
  if (!id)
    return NextResponse.json(
      { error: 'No active quote session.' },
      { status: 401 }
    );

  let body: any;
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const preference: 'pay_now_simulation' | 'contact_first' | null =
    body?.payment_preference === 'pay_now_simulation' ||
    body?.payment_preference === 'contact_first'
      ? body.payment_preference
      : null;
  if (!preference) {
    return NextResponse.json(
      { error: 'Pick "PAY NOW" or "TALK TO US FIRST" before submitting.' },
      { status: 400 }
    );
  }

  const sb = getAdminSupabase();

  // Idempotency: try quote_submissions first. If that table is
  // missing (migration 09 not yet applied), fall back to using
  // session.completed_at as the dedup key so the second submit
  // doesn't synthesise a new reference.
  const { data: existing, error: existErr } = await sb
    .schema('afss')
    .from('quote_submissions')
    .select('id, submission_reference, payment_preference, payment_status')
    .eq('quote_session_id', id)
    .maybeSingle();
  if (existErr && !/Could not find the table/.test(existErr.message)) {
    return NextResponse.json({ error: existErr.message }, { status: 500 });
  }
  if (existing) {
    return NextResponse.json({
      ok: true,
      duplicate: true,
      submission: existing,
    });
  }

  // Validate session has prior required data.
  const { data: sess } = await sb
    .schema('afss')
    .from('quote_sessions')
    .select(
      'quote_reference, first_name, email, mobile, current_step, status, completed_at'
    )
    .eq('id', id)
    .maybeSingle();

  // Idempotency fallback: completed_at is set when a previous
  // submit ran. If we already have that and the table is missing,
  // return duplicate.
  if (
    existErr &&
    /Could not find the table/.test(existErr.message) &&
    sess &&
    (sess as any).completed_at
  ) {
    return NextResponse.json({
      ok: true,
      duplicate: true,
      submission: {
        id: 'pending',
        submission_reference: null,
        payment_preference: null,
        payment_status: 'deferred',
        submitted_at: (sess as any).completed_at,
      },
    });
  }
  if (!sess) {
    return NextResponse.json({ error: 'Session not found.' }, { status: 404 });
  }
  if (!(sess as any).first_name || !(sess as any).email) {
    return NextResponse.json(
      { error: 'Contact details required before submit.' },
      { status: 400 }
    );
  }

  const { data: prop } = await sb
    .schema('afss')
    .from('properties')
    .select('building_confirmed')
    .eq('quote_session_id', id)
    .maybeSingle();
  if (!(prop as any)?.building_confirmed) {
    return NextResponse.json(
      { error: 'Building confirmation required before submit.' },
      { status: 400 }
    );
  }

  // Latest quote (if any).
  const { data: latestQuote } = await sb
    .schema('afss')
    .from('quotes')
    .select('id, total_amount, currency, requires_manual_review')
    .eq('quote_session_id', id)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();

  let paymentId: string | null = null;
  let paymentStatus: 'simulated_paid' | 'deferred' = 'deferred';

  if (preference === 'pay_now_simulation') {
    const amount = Number((latestQuote as any)?.total_amount ?? 0);
    if (amount > 0) {
      const provider = createPaymentProvider();
      const result = await provider.start({
        quoteSessionId: id,
        quoteId: (latestQuote as any)?.id ?? '',
        amount,
        currency: 'AUD',
        successUrl: '/?quote=success',
        cancelUrl: '/?quote=cancelled',
      });
      // Try the full payload (includes migration-09 columns).
      // If payment_mode doesn't exist, retry without it.
      const fullPayment = {
        quote_id: (latestQuote as any)?.id ?? null,
        quote_session_id: id,
        provider: result.provider,
        provider_payment_id: result.providerPaymentId ?? null,
        provider_checkout_id: result.providerCheckoutId ?? null,
        amount,
        currency: 'AUD',
        status: result.status === 'succeeded' ? 'succeeded' : 'requires_payment_method',
        payment_type: null,
        blocked_by_business_rule: false,
        payment_mode: result.simulated ? 'simulation' : 'real',
        preferred_at: new Date().toISOString(),
      };
      let { data: payRow, error: payErr } = await sb
        .schema('afss')
        .from('payments')
        .insert(fullPayment)
        .select('id')
        .single();
      if (payErr && /Could not find the '([^']+)' column/.test(payErr.message)) {
        // Drop ONLY the column reported missing — that's the only
        // one we can be sure about. Iterate if more are reported.
        let slim: Record<string, unknown> = { ...fullPayment };
        const drop = new Set<string>();
        const re = /Could not find the '([^']+)' column/g;
        let m: RegExpExecArray | null;
        while ((m = re.exec(payErr.message))) drop.add(m[1]);
        if (drop.size > 0) {
          slim = {};
          for (const [k, v] of Object.entries(fullPayment)) {
            if (!drop.has(k)) slim[k] = v;
          }
          console.warn(
            `[afss] payments insert retrying without column(s): ${Array.from(drop).join(', ')}`
          );
          const retry = await sb
            .schema('afss')
            .from('payments')
            .insert(slim)
            .select('id');
          payRow = Array.isArray(retry.data) ? retry.data[0] : retry.data;
          payErr = retry.error;
        }
      }
      paymentId = (payRow as any)?.id ?? null;
      paymentStatus = paymentId ? 'simulated_paid' : 'deferred';
      if (!paymentId) {
        console.error(
          '[afss] payments insert failed; submission saved without payment row'
        );
      }
      await logActivity(id, 'payment_simulated', { amount, payment_id: paymentId });
    } else {
      // Quote total was 0 (manual review required): skip simulated pay.
      paymentStatus = 'deferred';
    }
  }

  // Stable fallback used only when the quote_submissions table is
  // missing. Replaced with a deterministic value once we know the
  // table doesn't exist (see below).
  let submissionReference = `AFSS-SUB-pending`;

  const submittedAt = new Date().toISOString();
  // Try the full quote_submissions insert first; if the table is
  // missing (migration 09 not yet applied), record the submission
  // state directly on the session row so the success-modal UI can
  // still resume on refresh.
  let submission: any = null;
  let subErr: any = null;
  const { data: sub1, error: subE1 } = await sb
    .schema('afss')
    .from('quote_submissions')
    .insert({
      quote_session_id: id,
      quote_id: (latestQuote as any)?.id ?? null,
      payment_id: paymentId,
      submission_reference: submissionReference,
      payment_preference: preference,
      payment_mode:
        preference === 'pay_now_simulation' ? 'simulation' : 'real',
      payment_status: paymentStatus,
      submitted_at: submittedAt,
    })
    .select('id, submission_reference, payment_preference, payment_status, submitted_at')
    .single();

  if (subE1) {
    if (
      /Could not find the table '([^']+)' in the schema cache/.test(
        subE1.message
      ) ||
      /relation "[^"]+" does not exist/.test(subE1.message)
    ) {
      // No quote_submissions table yet — fabricate a transient row
      // so the success modal still has data to render. Use the
      // session id as a stable suffix so repeated submits reuse
      // the same reference (and the idempotency dedup above still
      // wins on full schema).
      const stableSuffix = id.replace(/-/g, '').slice(0, 6).toUpperCase();
      const stableRef = `AFSS-SUB-${stableSuffix}`;
      submission = {
        id: 'pending',
        submission_reference: stableRef,
        payment_preference: preference,
        payment_status: paymentStatus,
        submitted_at: submittedAt,
      };
      submissionReference = stableRef;
    } else {
      subErr = subE1;
    }
  } else {
    submission = sub1;
  }

  if (subErr || !submission) {
    return NextResponse.json(
      { error: subErr?.message ?? 'Failed to record submission.' },
      { status: 500 }
    );
  }

  await updateSession(id, {
    status: preference === 'pay_now_simulation' ? 'accepted' : 'submitted',
    payment_preference: preference,
    final_submitted_at: submittedAt,
    final_submission_id: submission.id,
    completed_at: submittedAt,
  });

  await logActivity(id, 'submission_finalized', {
    payment_preference: preference,
    payment_status: paymentStatus,
    submission_reference: submissionReference,
  });

  return NextResponse.json({
    ok: true,
    duplicate: false,
    submission,
  });
}
