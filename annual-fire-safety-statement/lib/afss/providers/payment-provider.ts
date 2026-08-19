/**
 * AFSS — Payment provider abstraction.
 *
 * Today, the only configured implementation is a SIMULATED payment
 * provider. Real Stripe wiring is intentionally left disabled until
 * Pete/Ken confirm the payment model (full / deposit / booking fee
 * / assessment fee). The interface below is identical to what
 * Stripe will plug into later, so swapping providers does NOT
 * require any UI/DB changes.
 */

export type PaymentPreference = 'pay_now' | 'contact_first';
export type PaymentMode = 'real' | 'simulation';

export interface PaymentStartInput {
  quoteSessionId: string;
  quoteId: string;
  amount: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
}

export interface PaymentStartResult {
  provider: 'simulation' | 'stripe';
  providerPaymentId?: string | null;
  providerCheckoutId?: string | null;
  status: 'succeeded' | 'failed' | 'requires_action';
  simulated: boolean;
  message?: string;
}

export interface PaymentProvider {
  readonly name: string;
  readonly mode: PaymentMode;
  /**
   * Starts (or simulates) a payment. For the simulation impl this
   * is synchronous and always returns succeeded=true after a short
   * delay. For Stripe, this returns a checkout URL the browser
   * should be redirected to.
   */
  start(input: PaymentStartInput): Promise<PaymentStartResult>;
}

export class SimulatedPaymentProvider implements PaymentProvider {
  readonly name = 'simulation';
  readonly mode: PaymentMode = 'simulation';

  async start(input: PaymentStartInput): Promise<PaymentStartResult> {
    // Deliberately fake but explicit.
    void input;
    return {
      provider: 'simulation',
      providerPaymentId: `sim_${cryptoLike()}`,
      providerCheckoutId: `sim_co_${cryptoLike()}`,
      status: 'succeeded',
      simulated: true,
      message: 'Payment simulation only. No money was charged.',
    };
  }
}

export function createPaymentProvider(): PaymentProvider {
  // Always simulation for now. Stripe is fully wired behind the
  // PAYMENT_PROVIDER=enabled gate (to be added once Pete/Ken
  // confirms pricing + payment model).
  return new SimulatedPaymentProvider();
}

function cryptoLike(): string {
  // Not cryptographic — just visually unique for the audit row.
  return Math.random().toString(36).slice(2, 12);
}
