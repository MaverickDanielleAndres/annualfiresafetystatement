/**
 * AFSS — deterministic pricing engine.
 *
 * Reads ONLY from afss.pricing_rules (where environment='production'
 * AND active=true). NEVER hard-codes prices.
 *
 * If no production rule matches the inputs, returns:
 *   { requires_manual_review: true, reason: ... }
 * and the customer sees:
 *   "Your AFSS needs a quick review before we confirm the price."
 *
 * Pricing inputs available (consumed by rule conditions_json):
 *   * postcode_zone       — 'metro' | 'regional' | etc. (computed from
 *                            afss.properties.postcode prefix if rules
 *                            require it; otherwise not required).
 *   * measure_count       — count of normalized fire safety measures.
 *   * has_specialist_practitioner — boolean.
 *   * urgency             — 'standard' | 'urgent' | NULL until quote accepts one.
 *
 * The engine never invents. If a rule's conditions_json requires
 * fields that aren't provided, the rule is skipped.
 */

import { getAdminSupabase } from '@/lib/supabase/admin';

export interface PricingInputs {
  measure_count: number;
  has_specialist_practitioner: boolean;
  urgency: 'standard' | 'urgent' | null;
  postcode?: string | null;
  state?: string | null;
}

export interface PricedLineItem {
  line_type: 'base' | 'measure' | 'travel' | 'adjustment' | 'gst';
  reference_key: string;
  description: string;
  quantity: number;
  unit_amount: number;
  total_amount: number;
  sort_order: number;
}

export interface PricingResult {
  base_amount: number;
  measures_amount: number;
  travel_amount: number;
  adjustments_amount: number;
  subtotal: number;
  gst_amount: number;
  total_amount: number;
  currency: 'AUD';
  line_items: PricedLineItem[];
  calculation_snapshot: Record<string, unknown>;
  requires_manual_review: boolean;
  review_reason: string | null;
}

const GST_RATE = 0.1; // Australian standard rate. Business rule:
                      // Pete/Ken must confirm whether supplied rules
                      // are GST-inclusive or GST-exclusive before
                      // any amount is shown to a customer.

export async function calculateQuote(
  inputs: PricingInputs
): Promise<PricingResult> {
  const sb = getAdminSupabase();

  const { data: rules, error } = await sb
    .schema('afss')
    .from('pricing_rules')
    .select('*')
    .eq('environment', 'production')
    .eq('active', true)
    .order('priority', { ascending: true });

  if (error) throw new Error(`Failed to load pricing rules: ${error.message}`);

  // No production rules configured → manual review.
  if (!rules || rules.length === 0) {
    return emptyManualReview(
      'No production pricing rules are configured yet. Pete/Ken must supply pricing.'
    );
  }

  const lineItems: PricedLineItem[] = [];
  let base = 0,
    measures = 0,
    travel = 0,
    adjustments = 0;

  for (const r of rules as any[]) {
    if (!ruleMatches(r, inputs)) continue;

    const amount = computeAmount(r, inputs);
    if (amount === null) continue;

    const bucket = bucketFor(r.rule_type);
    if (bucket === 'base') base += amount;
    else if (bucket === 'measure') measures += amount;
    else if (bucket === 'travel') travel += amount;
    else if (bucket === 'adjustment') adjustments += amount;

    lineItems.push({
      line_type: bucket,
      reference_key: r.rule_key,
      description: r.name,
      quantity: 1,
      unit_amount: amount,
      total_amount: amount,
      sort_order: r.priority ?? 100,
    });
  }

  // Minimum charge: pick the highest 'minimum' rule that matched.
  const minRule = (rules as any[])
    .filter((r) => r.rule_type === 'minimum' && ruleMatches(r, inputs))
    .pop();
  if (minRule && typeof minRule.amount === 'number') {
    const before = base + measures + travel + adjustments;
    if (before < Number(minRule.amount)) {
      const topup = Number(minRule.amount) - before;
      adjustments += topup;
      lineItems.push({
        line_type: 'adjustment',
        reference_key: minRule.rule_key + ':minimum_topup',
        description: `Minimum charge top-up (${minRule.name})`,
        quantity: 1,
        unit_amount: topup,
        total_amount: topup,
        sort_order: 999,
      });
    }
  }

  const subtotal = round2(base + measures + travel + adjustments);
  const gst_amount = round2(subtotal * GST_RATE);
  const total_amount = round2(subtotal + gst_amount);

  // If after all rule application we still have zero, fall back.
  if (total_amount === 0) {
    return emptyManualReview(
      'Pricing rules produced no total. Manual review required.'
    );
  }

  return {
    base_amount: round2(base),
    measures_amount: round2(measures),
    travel_amount: round2(travel),
    adjustments_amount: round2(adjustments),
    subtotal,
    gst_amount,
    total_amount,
    currency: 'AUD',
    line_items: lineItems,
    calculation_snapshot: {
      inputs,
      applied_rules: lineItems.map((li) => ({
        rule_key: li.reference_key,
        amount: li.total_amount,
      })),
      gst_rate: GST_RATE,
      calculated_at: new Date().toISOString(),
    },
    requires_manual_review: false,
    review_reason: null,
  };
}

function emptyManualReview(reason: string): PricingResult {
  return {
    base_amount: 0,
    measures_amount: 0,
    travel_amount: 0,
    adjustments_amount: 0,
    subtotal: 0,
    gst_amount: 0,
    total_amount: 0,
    currency: 'AUD',
    line_items: [],
    calculation_snapshot: { reason, calculated_at: new Date().toISOString() },
    requires_manual_review: true,
    review_reason: reason,
  };
}

function ruleMatches(rule: any, inputs: PricingInputs): boolean {
  const conds = rule.conditions_json || {};
  for (const [k, v] of Object.entries(conds)) {
    if (k === 'urgency') {
      if (v !== inputs.urgency) return false;
      continue;
    }
    if (k === 'measure_count_min' && typeof v === 'number') {
      if (inputs.measure_count < v) return false;
      continue;
    }
    if (k === 'has_specialist_practitioner' && typeof v === 'boolean') {
      if (inputs.has_specialist_practitioner !== v) return false;
      continue;
    }
    if (k === 'state' && typeof v === 'string') {
      if (inputs.state !== v) return false;
      continue;
    }
    if (k === 'postcode_zone') {
      const zone = computePostcodeZone(inputs.postcode);
      if (zone !== v) return false;
      continue;
    }
    // Unknown condition keys cause the rule to be skipped safely.
    return false;
  }
  // Honour effective_from / effective_to.
  if (rule.effective_from || rule.effective_to) {
    const today = new Date().toISOString().slice(0, 10);
    if (rule.effective_from && today < rule.effective_from) return false;
    if (rule.effective_to && today > rule.effective_to) return false;
  }
  return true;
}

function computeAmount(rule: any, inputs: PricingInputs): number | null {
  switch (rule.calculation_type) {
    case 'fixed':
      return rule.amount != null ? Number(rule.amount) : null;
    case 'per_unit':
      if (rule.amount == null) return null;
      return round2(Number(rule.amount) * inputs.measure_count);
    case 'percentage':
      if (rule.percentage == null) return null;
      // Percentage is applied later by admin — return as adjustment of 0 here
      // because it depends on a subtotal. Stub: apply against base.
      return null;
    case 'multiplier':
      if (rule.multiplier == null) return null;
      return null;
    default:
      return null;
  }
}

function bucketFor(
  ruleType: string
): 'base' | 'measure' | 'travel' | 'adjustment' {
  if (ruleType === 'base') return 'base';
  if (ruleType === 'measure') return 'measure';
  if (ruleType === 'travel') return 'travel';
  return 'adjustment';
}

function computePostcodeZone(postcode?: string | null): string | null {
  if (!postcode) return null;
  const p = postcode.padStart(4, '0');
  const n = Number(p);
  if (n >= 2000 && n <= 2999) return 'sydney_metro';
  if (n >= 3000 && n <= 3207) return 'melbourne_metro';
  if (n >= 4000 && n <= 4207) return 'brisbane_metro';
  if (n >= 5000 && n <= 5199) return 'adelaide_metro';
  if (n >= 6000 && n <= 6199) return 'perth_metro';
  if (n >= 800 && n <= 999) return 'darwin_metro';
  if (n >= 7000 && n <= 7499) return 'hobart_metro';
  if (n >= 2600 && n <= 2618) return 'act_metro';
  return 'regional';
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}