'use client';

import { useEffect, useState } from 'react';
import { primaryButton, secondaryButton, subtleLink } from '../common';
import { api } from '../api';
import { useToaster } from '../Toast';
import type { QuoteSessionSummary } from '@/lib/afss/types';

interface Props {
  summary: QuoteSessionSummary;
  onSubmitted: (s: { submission_reference: string }) => void;
  onBack?: () => void;
}

type Preference = 'pay_now_simulation' | 'contact_first';

function formatAUD(cents: number | null): string {
  if (cents == null || isNaN(cents)) return '—';
  return (
    'A$' +
    (cents / 100).toLocaleString('en-AU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

/**
 * Step 6 — Your quote / Payment option.
 *
 * Flow:
 *   1. Trigger the SIMULATION quote (one shot) via
 *      /api/afss/quote/simulation-quote.
 *      * If the simulation engine is configured (env), returns a
 *        total.
 *      * Otherwise returns review_required and we show the manual
 *        review state (NOT a fake price).
 *   2. Show "PAY NOW" vs "TALK TO US FIRST" radio.
 *   3. On submit → /api/afss/quote/finalize-submission with the
 *      preference. Persists afss.quote_submissions and (if
 *      applicable) afss.payments(mode='simulation'). Server is
 *      idempotent on duplicate submit.
 */
export default function QuotePaymentStep({ summary, onSubmitted, onBack }: Props) {
  const { push } = useToaster();
  const [quoteNumber, setQuoteNumber] = useState<string | null>(summary.quote_number ?? null);
  const [totalCents, setTotalCents] = useState<number | null>(
    summary.total_amount != null ? Math.round(summary.total_amount * 100) : null
  );
  const [reviewReason, setReviewReason] = useState<string | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [isSimulation, setIsSimulation] = useState(summary.quote_mode === 'simulation');
  const [preference, setPreference] = useState<Preference | null>(
    (summary.payment_preference as Preference) ?? null
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingQuote(true);
      const res = await api.post<{
        ok: boolean;
        quote_id: string;
        quote_number: string;
        total_amount: number;
        requires_manual_review: boolean;
        is_simulation: boolean;
        review_reason: string | null;
      }>('/api/afss/quote/simulation-quote');
      if (cancelled) return;
      setLoadingQuote(false);
      if (!res.ok) {
        setQuoteError(res.error);
        return;
      }
      setQuoteNumber(res.data.quote_number);
      setTotalCents(Math.round((res.data.total_amount ?? 0) * 100));
      setIsSimulation(res.data.is_simulation);
      setReviewReason(res.data.review_reason);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ready = !loadingQuote && quoteNumber != null;
  const blockedByReview =
    !ready || (totalCents ?? 0) <= 0 || !!reviewReason;

  async function submit() {
    if (!preference) {
      setSubmitError('Please choose how you would like to continue.');
      push({
        kind: 'warning',
        title: 'Pick a payment option',
        text: 'Choose either pay-now simulation or talk-to-us-first.',
      });
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    const res = await api.post<{
      ok: boolean;
      duplicate: boolean;
      submission: { submission_reference: string };
    }>('/api/afss/quote/finalize-submission', {
      payment_preference: preference,
    });
    setSubmitting(false);
    if (!res.ok) {
      setSubmitError(res.error);
      push({ kind: 'error', title: 'Submission failed', text: res.error });
      return;
    }
    push({
      kind: 'success',
      text:
        preference === 'pay_now_simulation'
          ? 'Payment simulation successful.'
          : 'Quote request submitted. We\'ll be in touch.',
    });
    onSubmitted({ submission_reference: res.data.submission.submission_reference });
  }

  return (
    <div className="mx-auto max-w-md">
      <h2 className="mb-2 text-2xl font-black uppercase tracking-tight text-black sm:text-3xl">
        Your quote
      </h2>
      <p className="mb-6 text-sm text-gray-600">
        Reference <span className="font-mono">{summary.quote_reference}</span>
      </p>

      {loadingQuote && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
          Calculating your quote…
        </div>
      )}

      {quoteError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {quoteError}
        </div>
      )}

      {!loadingQuote && blockedByReview && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
          <div className="text-xs font-bold uppercase tracking-widest text-amber-800">
            Manual review
          </div>
          <div className="mt-2 text-lg font-bold text-black">
            We&apos;ve got what we need
          </div>
          <p className="mt-2 text-sm text-amber-900">
            {reviewReason
              ?? 'Your AFSS needs a quick review before we confirm your price. We’ll be in touch shortly with your quote.'}
          </p>
          <p className="mt-3 text-xs text-amber-800">
            You can still submit your details now and our team will be in touch with a confirmed price.
          </p>
        </div>
      )}

      {!loadingQuote && !blockedByReview && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
          <div className="text-xs font-bold uppercase tracking-widest text-gray-500">
            Total (AUD)
          </div>
          <div className="mt-1 text-3xl font-black text-black">
            {formatAUD(totalCents)}
          </div>
          <div className="mt-1 text-xs text-gray-500">inc. GST (simulation)</div>
          {isSimulation && (
            <div className="mt-3 inline-block rounded-md bg-amber-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-800">
              Simulation
            </div>
          )}
        </div>
      )}

      {isSimulation && (
        <p className="mb-4 text-[11px] leading-snug text-gray-500">
          This quote is currently a simulation while final pricing rules are being configured by Pete &amp; Ken.
        </p>
      )}

      <div className="mb-4 divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
        <label
          className={
            'flex cursor-pointer items-start gap-3 px-4 py-4 transition-colors ' +
            (preference === 'pay_now_simulation' ? 'bg-[#1c4d9c]/5' : '')
          }
        >
          <input
            type="radio"
            name="payment-preference"
            checked={preference === 'pay_now_simulation'}
            onChange={() => setPreference('pay_now_simulation')}
            className="h-4 w-4 accent-[#1c4d9c] mt-0.5"
            disabled={blockedByReview}
          />
          <div>
            <div className="font-bold text-black">Pay now</div>
            <div className="mt-0.5 text-xs text-gray-500">
              {blockedByReview
                ? 'Available once pricing is confirmed.'
                : 'Simulate payment and continue.'}
            </div>
          </div>
        </label>
        <label
          className={
            'flex cursor-pointer items-start gap-3 px-4 py-4 transition-colors ' +
            (preference === 'contact_first' ? 'bg-[#1c4d9c]/5' : '')
          }
        >
          <input
            type="radio"
            name="payment-preference"
            checked={preference === 'contact_first'}
            onChange={() => setPreference('contact_first')}
            className="h-4 w-4 accent-[#1c4d9c] mt-0.5"
          />
          <div>
            <div className="font-bold text-black">Talk to us first</div>
            <div className="mt-0.5 text-xs text-gray-500">
              Submit your details and we&apos;ll contact you.
            </div>
          </div>
        </label>
      </div>

      {submitError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <div className="pt-4 flex w-full items-center gap-6">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className={subtleLink + ' flex-shrink-0'}
          >
            ← Back
          </button>
        )}

        <button
          type="button"
          disabled={!preference || submitting}
          onClick={submit}
          className={primaryButton + ' flex-1 !mx-0'}
          style={{ background: "linear-gradient(to right, #0b1d36, #1c4d9c)", color: "#ffffff" }}
        >
          {submitting ? 'Submitting…' : 'Submit →'}
        </button>
      </div>

      <p className="mt-4 text-center text-[11px] text-gray-400">
        By submitting, you agree to be contacted about your AFSS. No payment is taken in simulation mode.
      </p>
    </div>
  );
}
