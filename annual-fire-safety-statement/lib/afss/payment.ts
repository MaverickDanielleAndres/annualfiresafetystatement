/**
 * AFSS — payment architecture.
 *
 * Choice of provider: Stripe.
 *   * Native AUD support, AU-compatible payment methods.
 *   * PCI burden carried by Stripe (we never touch card numbers).
 *   * Hosted / embedded Checkout reduces integration surface.
 *   * Strong webhook model for server-side confirmation.
 *   * Mature refunds + dispute flow.
 *   * Excellent Next.js / Node SDK + current docs.
 *
 * Live charging is BLOCKED_BY_BUSINESS_RULE until Pete/Ken confirms
 * whether the customer pays:
 *   - full
 *   - deposit
 *   - booking fee
 *   - assessment fee
 *
 * Until then, createPaymentIntent ALWAYS refuses to charge and
 * returns blocked_by_business_rule = true. The UI uses this flag to
 * display "WE'VE GOT WHAT WE NEED. Your AFSS needs a quick review
 * before we confirm your price." instead of any checkout button.
 *
 * Webhook handling:
 *   * The /api/afss/webhooks/stripe route verifies the Stripe
 *     signature using STRIPE_WEBHOOK_SECRET.
 *   * Updates afss.payments based on event type.
 *   * Idempotent: relies on provider_payment_id uniqueness + status
 *     check before mutating.
 */

import Stripe from 'stripe';
import { getAdminSupabase } from '@/lib/supabase/admin';

let _stripe: Stripe | null = null;
function getStripe(): Stripe | null {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  _stripe = new Stripe(key, { apiVersion: '2026-07-29.dahlia' });
  return _stripe;
}

export interface CreatePaymentInput {
  quoteId: string;
  quoteSessionId: string;
  amount: number;
  currency: 'AUD';
  successUrl: string;
  cancelUrl: string;
}

export interface CreatePaymentResult {
  ok: boolean;
  blocked_by_business_rule: boolean;
  blocked_reason?: string;
  checkout_url?: string;
  payment_id?: string;
  provider_payment_id?: string;
  provider_checkout_id?: string;
}

/**
 * Determines the payment_type based on what Pete/Ken has confirmed.
 * Returns null while blocked.
 */
function resolvePaymentType(): 'full' | 'deposit' | 'booking_fee' | 'assessment_fee' | null {
  // Until Pete/Ken explicitly configures one of these, return null.
  // The single source of truth for the business rule lives in env:
  //   AFSS_PAYMENT_TYPE = 'full' | 'deposit' | 'booking_fee' | 'assessment_fee'
  return null;
  // Once configured:
  // const v = process.env.AFSS_PAYMENT_TYPE;
  // if (v === 'full' || v === 'deposit' || v === 'booking_fee' || v === 'assessment_fee')
  //   return v;
  // return null;
}

export async function createPaymentIntent(
  input: CreatePaymentInput
): Promise<CreatePaymentResult> {
  // ALWAYS check the business-rule gate first.
  const paymentType = resolvePaymentType();
  if (!paymentType) {
    // Persist a blocked record so the audit trail shows we tried.
    const sb = getAdminSupabase();
    const { data } = await sb
      .schema('afss')
      .from('payments')
      .insert({
        quote_id: input.quoteId,
        quote_session_id: input.quoteSessionId,
        provider: 'stripe',
        amount: input.amount,
        currency: input.currency,
        status: 'requires_payment_method',
        payment_type: null,
        blocked_by_business_rule: true,
        blocked_reason:
          'BLOCKED_BY_BUSINESS_RULE: Pete/Ken must confirm whether the customer pays full / deposit / booking fee / assessment fee.',
      })
      .select('id')
      .single();
    return {
      ok: false,
      blocked_by_business_rule: true,
      blocked_reason:
        'Pete/Ken has not confirmed the payment model yet. Quote held for manual review.',
      payment_id: (data as any)?.id,
    };
  }

  // Stripe not configured (e.g. local dev) → still record a blocked intent.
  const stripe = getStripe();
  if (!stripe) {
    const sb = getAdminSupabase();
    const { data } = await sb
      .schema('afss')
      .from('payments')
      .insert({
        quote_id: input.quoteId,
        quote_session_id: input.quoteSessionId,
        provider: 'stripe',
        amount: input.amount,
        currency: input.currency,
        status: 'requires_payment_method',
        payment_type: paymentType,
        blocked_by_business_rule: true,
        blocked_reason:
          'STRIPE_SECRET_KEY not configured. Will activate once Stripe credentials are supplied.',
      })
      .select('id')
      .single();
    return {
      ok: false,
      blocked_by_business_rule: true,
      blocked_reason:
        'Stripe is not configured in this environment yet.',
      payment_id: (data as any)?.id,
    };
  }

  // Real Stripe call (skeleton — won't execute until payment_type resolves).
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: input.currency.toLowerCase(),
            unit_amount: Math.round(input.amount * 100),
            product_data: {
              name: `AFSS Quote ${input.quoteId.slice(0, 8)}`,
            },
          },
        },
      ],
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      metadata: {
        quote_id: input.quoteId,
        quote_session_id: input.quoteSessionId,
        payment_type: paymentType,
      },
    });

    const sb = getAdminSupabase();
    const { data } = await sb
      .schema('afss')
      .from('payments')
      .insert({
        quote_id: input.quoteId,
        quote_session_id: input.quoteSessionId,
        provider: 'stripe',
        provider_payment_id: (session.payment_intent as string) ?? null,
        provider_checkout_id: session.id,
        amount: input.amount,
        currency: input.currency,
        status: 'requires_payment_method',
        payment_type: paymentType,
        blocked_by_business_rule: false,
      })
      .select('id')
      .single();

    return {
      ok: true,
      blocked_by_business_rule: false,
      checkout_url: session.url ?? undefined,
      payment_id: (data as any)?.id,
      provider_payment_id: (session.payment_intent as string) ?? undefined,
      provider_checkout_id: session.id,
    };
  } catch (e: any) {
    return {
      ok: false,
      blocked_by_business_rule: false,
      blocked_reason: `Stripe error: ${e?.message ?? 'unknown'}`,
    };
  }
}

export async function markPaymentStatus(
  provider: 'stripe',
  providerPaymentId: string,
  status: string
): Promise<void> {
  const sb = getAdminSupabase();
  const patch: Record<string, unknown> = { status };
  if (status === 'succeeded') patch.paid_at = new Date().toISOString();
  if (status === 'failed') patch.failed_at = new Date().toISOString();
  if (status === 'refunded') patch.refunded_at = new Date().toISOString();

  await sb
    .schema('afss')
    .from('payments')
    .update(patch)
    .eq('provider', provider)
    .eq('provider_payment_id', providerPaymentId);
}

export function verifyStripeWebhook(
  rawBody: string,
  signature: string
): Stripe.Event | null {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return null;
  try {
    return stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch {
    return null;
  }
}