import { NextRequest, NextResponse } from 'next/server';
import {
  findSessionIdByCookie,
  logActivity,
} from '@/lib/afss/quote-session';
import { createPaymentIntent } from '@/lib/afss/payment';
import { getAdminSupabase } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/afss/quote/create-payment
 * Initiates a payment for the current session's most recent quote.
 *
 * BLOCKED_BY_BUSINESS_RULE until Pete/Ken confirms the payment
 * model. Always records the attempt in afss.payments so the audit
 * trail is complete, but never charges a customer.
 */
export async function POST(req: NextRequest) {
  const id = await findSessionIdByCookie();
  if (!id)
    return NextResponse.json(
      { error: 'No active quote session.' },
      { status: 401 }
    );

  const sb = getAdminSupabase();
  const { data: quote } = await sb
    .schema('afss')
    .from('quotes')
    .select('id, total_amount, currency, requires_manual_review, status')
    .eq('quote_session_id', id)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!quote)
    return NextResponse.json(
      { error: 'No quote exists yet.' },
      { status: 400 }
    );

  if ((quote as any).requires_manual_review)
    return NextResponse.json(
      {
        error:
          'This quote requires manual review before payment can be initiated.',
        requires_manual_review: true,
      },
      { status: 400 }
    );

  if ((quote as any).status === 'accepted')
    return NextResponse.json(
      { error: 'Quote already accepted.' },
      { status: 400 }
    );

  const origin = req.headers.get('origin') ?? '';
  const baseUrl = origin || process.env.NEXT_PUBLIC_SITE_URL || '';

  const r = await createPaymentIntent({
    quoteId: (quote as any).id,
    quoteSessionId: id,
    amount: Number((quote as any).total_amount),
    currency: 'AUD',
    successUrl: `${baseUrl}/?quote_paid=1`,
    cancelUrl: `${baseUrl}/?quote_cancelled=1`,
  });

  await logActivity(id, r.blocked_by_business_rule ? 'payment_started' : 'payment_started', {
    payment_id: r.payment_id,
    blocked: r.blocked_by_business_rule,
  });

  return NextResponse.json(r);
}