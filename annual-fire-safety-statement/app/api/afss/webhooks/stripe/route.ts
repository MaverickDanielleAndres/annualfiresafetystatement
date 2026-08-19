import { NextRequest, NextResponse } from 'next/server';
import {
  markPaymentStatus,
  verifyStripeWebhook,
} from '@/lib/afss/payment';
import { getAdminSupabase } from '@/lib/supabase/admin';
import type Stripe from 'stripe';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/afss/webhooks/stripe
 * Stripe webhook receiver. Verifies signature, then idempotently
 * updates afss.payments.
 *
 * Idempotency:
 *   * We use (provider, provider_payment_id) UNIQUE on payments.
 *   * Status changes are explicit (no "always set to succeeded").
 */
export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signature = req.headers.get('stripe-signature');
  if (!signature)
    return NextResponse.json({ error: 'Missing signature.' }, { status: 400 });

  const event = verifyStripeWebhook(raw, signature);
  if (!event)
    return NextResponse.json(
      { error: 'Invalid signature.' },
      { status: 400 }
    );

  const sb = getAdminSupabase();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const s = event.data.object as Stripe.Checkout.Session;
        const piId = (s.payment_intent as string) ?? null;
        if (piId) await markPaymentStatus('stripe', piId, 'succeeded');
        if (s.metadata?.quote_id)
          await sb
            .schema('afss')
            .from('quotes')
            .update({ status: 'accepted' })
            .eq('id', s.metadata.quote_id);
        if (s.metadata?.quote_session_id)
          await sb
            .schema('afss')
            .from('quote_sessions')
            .update({ status: 'paid', completed_at: new Date().toISOString() })
            .eq('id', s.metadata.quote_session_id);
        break;
      }
      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent;
        await markPaymentStatus('stripe', pi.id, 'failed');
        break;
      }
      case 'payment_intent.canceled': {
        const pi = event.data.object as Stripe.PaymentIntent;
        await markPaymentStatus('stripe', pi.id, 'canceled');
        break;
      }
      case 'charge.refunded': {
        const ch = event.data.object as Stripe.Charge;
        const piId = (ch.payment_intent as string) ?? null;
        if (piId) await markPaymentStatus('stripe', piId, 'refunded');
        break;
      }
      default:
        // Unhandled event types are acknowledged with 200 so Stripe
        // doesn't retry. Persist nothing.
        break;
    }
    return NextResponse.json({ received: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? 'Webhook processing failed.' },
      { status: 500 }
    );
  }
}