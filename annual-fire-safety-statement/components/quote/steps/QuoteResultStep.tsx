'use client';

import { useState } from 'react';
import { primaryButton } from './ContactStep';
import type { QuoteSessionSummary } from '@/lib/afss/types';

interface Props {
  summary: QuoteSessionSummary;
  onClose: () => void;
}

export default function QuoteResultStep({ summary, onClose }: Props) {
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  if (summary.requires_manual_review || summary.blocked_by_business_rule) {
    return (
      <div className="mx-auto max-w-md">
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#fb5614]">
          Result
        </p>
        <h2 className="mb-2 text-2xl font-black uppercase tracking-tight text-black sm:text-3xl">
          We&apos;ve got what we need.
        </h2>
        <p className="mb-6 text-sm text-gray-600">
          Your AFSS needs a quick review before we confirm your price.
          We&apos;ll be in touch with your quote shortly.
        </p>

        <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
          <div className="mb-1 text-xs uppercase tracking-widest text-gray-400">
            Quote reference
          </div>
          <div className="font-mono text-base font-semibold text-black">
            {summary.quote_reference}
          </div>
          {summary.quote_number && (
            <div className="mt-2 font-mono text-sm text-gray-700">
              {summary.quote_number}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className={primaryButton}
          style={{ background: "linear-gradient(to right, #ff5614, #ffad05)", color: "#ffffff" }}
        >
          Close
        </button>
      </div>
    );
  }

  async function pay() {
    setPaying(true);
    setPayError(null);
    try {
      const res = await fetch('/api/afss/quote/create-payment', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        setPayError(data.error ?? 'Could not start payment.');
        setPaying(false);
        return;
      }
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
        return;
      }
      setPayError(
        data.blocked_reason ??
          'Payment cannot be initiated yet. Your quote is held for review.'
      );
    } catch {
      setPayError('Something went wrong.');
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#fb5614]">
        Result
      </p>
      <h2 className="mb-2 text-2xl font-black uppercase tracking-tight text-black sm:text-3xl">
        Your AFSS quote
      </h2>
      <p className="mb-6 text-sm text-gray-600">
        Based on the information provided. Final pricing confirmed on review.
      </p>

      <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="mb-2 text-xs uppercase tracking-widest text-gray-400">
          Quote reference
        </div>
        <div className="font-mono text-base font-semibold text-black">
          {summary.quote_reference}
        </div>
        {summary.quote_number && (
          <div className="mt-1 font-mono text-sm text-gray-700">
            {summary.quote_number}
          </div>
        )}
      </div>

      <div className="mb-6 rounded-lg border-2 border-[#fb5614]/30 bg-[#fb5614]/5 p-6 text-center">
        <div className="text-xs uppercase tracking-widest text-gray-500">
          Estimated total
        </div>
        <div className="mt-1 text-3xl font-black text-black">
          {summary.currency}{' '}
          {summary.total_amount != null
            ? formatAUD(summary.total_amount)
            : '—'}
        </div>
        <div className="mt-1 text-xs text-gray-500">inc. GST</div>
      </div>

      {payError && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {payError}
        </div>
      )}

      <div className="mt-8 flex flex-col-reverse sm:flex-row items-center justify-center gap-4 sm:gap-6">
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-gray-500 hover:text-black hover:underline"
        >
          Close
        </button>
        <button
          type="button"
          disabled={paying}
          onClick={pay}
          className={primaryButton + ' !mx-0'}
          style={{ background: "linear-gradient(to right, #ff5614, #ffad05)", color: "#ffffff" }}
        >
          {paying ? 'Starting payment…' : 'Pay / Book →'}
        </button>
      </div>
    </div>
  );
}

function formatAUD(n: number): string {
  return n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}