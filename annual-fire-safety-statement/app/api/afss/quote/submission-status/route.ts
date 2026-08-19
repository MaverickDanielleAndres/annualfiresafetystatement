import { NextRequest, NextResponse } from 'next/server';
import { findSessionIdByCookie } from '@/lib/afss/quote-session';
import { getAdminSupabase } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/afss/quote/submission-status
 *
 * Returns the final submission record (if any) for the current
 * cookie session. Used to drive the success modal AFTER refresh,
 * and to ensure we never re-show "PAY NOW" if the customer has
 * already submitted.
 */
export async function GET() {
  const id = await findSessionIdByCookie();
  if (!id) return NextResponse.json({ ok: true, submission: null });

  const sb = getAdminSupabase();
  const { data: sub } = await sb
    .schema('afss')
    .from('quote_submissions')
    .select(
      'id, submission_reference, payment_preference, payment_mode, payment_status, submitted_at, quote_id'
    )
    .eq('quote_session_id', id)
    .maybeSingle();

  const { data: quote } = sub
    ? await sb
        .schema('afss')
        .from('quotes')
        .select('quote_number, total_amount, currency, is_simulation')
        .eq('id', (sub as any).quote_id)
        .maybeSingle()
    : { data: null };

  return NextResponse.json({
    ok: true,
    submission: sub
      ? {
          ...(sub as any),
          quote_number: (quote as any)?.quote_number ?? null,
          total_amount:
            (quote as any)?.total_amount != null
              ? Number((quote as any).total_amount)
              : null,
          currency: (quote as any)?.currency ?? 'AUD',
          is_simulation: (quote as any)?.is_simulation ?? false,
        }
      : null,
  });
}
