/**
 * AFSS — Quote engine abstraction.
 *
 * The "real" deterministic pricing engine is already implemented
 * in [lib/afss/pricing.ts]. It pulls from `afss.pricing_rules`
 * (Postgres), returns total = 0 + manual_review_required when
 * no rules exist.
 *
 * For the customer flow we ALSO support a SIMULATION engine that
 * returns a fixed configured amount. The chosen engine is selected
 * by the AFSS_QUOTE_ENGINE env var (default = simulation).
 *
 * Both engines produce the same shape so the UI never has to know
 * which one fired.
 */

export interface QuoteEngineInput {
  quoteSessionId: string;
  postcode?: string | null;
  state?: string | null;
}

export interface QuoteEngineResult {
  totalAmount: number;
  currency: 'AUD';
  isSimulation: boolean;
  reviewReason: string | null;
  lineItems: Array<{
    description: string;
    amount: number;
  }>;
}

export interface QuoteEngine {
  readonly mode: 'simulation' | 'real';
  calculate(input: QuoteEngineInput): Promise<QuoteEngineResult>;
}

/**
 * Simulation engine. Returns a fixed total from
 * AFSS_SIMULATION_TOTAL_CENTS — NEVER from code, ALWAYS from env.
 * If the env var is missing, it falls back to 0 + a clear
 * review_reason so the UI knows to surface the manual-review
 * screen.
 */
export class SimulationQuoteEngine implements QuoteEngine {
  readonly mode = 'simulation' as const;

  async calculate(input: QuoteEngineInput): Promise<QuoteEngineResult> {
    const cents = Number(process.env.AFSS_SIMULATION_TOTAL_CENTS ?? '0');
    if (!cents || isNaN(cents) || cents <= 0) {
      return {
        totalAmount: 0,
        currency: 'AUD',
        isSimulation: true,
        reviewReason:
          'Simulation total not configured. Set AFSS_SIMULATION_TOTAL_CENTS in the environment.',
        lineItems: [],
      };
    }
    const total = cents / 100;
    const gstAmount = round2(total / 11); // assume displayed total includes GST
    const subtotal = round2(total - gstAmount);

    return {
      totalAmount: total,
      currency: 'AUD',
      isSimulation: true,
      reviewReason: null,
      lineItems: [
        {
          description: 'AFSS base assessment (simulation)',
          amount: subtotal,
        },
        {
          description: 'GST (10%, simulation)',
          amount: gstAmount,
        },
      ],
    };
  }
}

export function createQuoteEngine(): QuoteEngine {
  // Until real production pricing rules are populated, the simulation
  // engine is the customer-visible one. Toggle this later by setting
  // AFSS_QUOTE_ENGINE=real.
  const configured = (process.env.AFSS_QUOTE_ENGINE || 'simulation').toLowerCase();
  if (configured === 'real') {
    // Lazy import to keep the price rules table required only when
    // explicitly opted into.
    return new RealPricingEngineAdapter();
  }
  return new SimulationQuoteEngine();
}

class RealPricingEngineAdapter implements QuoteEngine {
  readonly mode = 'real' as const;

  async calculate(input: QuoteEngineInput): Promise<QuoteEngineResult> {
    const { calculateQuote } = await import('@/lib/afss/pricing');
    const result = await calculateQuote({
      measure_count: 0,
      has_specialist_practitioner: false,
      urgency: 'standard',
      postcode: input.postcode ?? null,
      state: input.state ?? null,
    });
    return {
      totalAmount: result.total_amount,
      currency: 'AUD',
      isSimulation: false,
      reviewReason: result.review_reason,
      lineItems: result.line_items.map((li) => ({
        description: li.description,
        amount: li.total_amount,
      })),
    };
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
