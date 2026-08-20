'use client';

import { primaryButton, secondaryButton } from './common';
import type { QuoteSubmissionSummary } from '@/lib/afss/types';

interface Props {
  submission: QuoteSubmissionSummary;
  onClose: () => void;
}

function formatAUD(amount: number | null): string {
  if (amount == null || isNaN(amount)) return '—';
  return (
    'A$' +
    amount.toLocaleString('en-AU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

/**
 * Final success modal — replaces the entire quote flow after a
 * successful submission. NOT counted as a wizard step.
 *
 * Three states:
 *   * simulated payment  → "Payment simulation completed."
 *   * contact-first      → "We've received your quote request."
 *   * review-required    → "Our team will be in touch with a confirmed price."
 *
 * Displays the persisted submission_reference (which is server-
 * stable across refreshes because the backend row is idempotent).
 */
export default function SubmissionSuccessModal({ submission, onClose }: Props) {
  const title =
    submission.payment_preference === 'pay_now_simulation'
      ? 'Payment simulation completed.'
      : 'We’ll be in touch.';

  const subtitle =
    submission.payment_preference === 'pay_now_simulation'
      ? submission.payment_status === 'simulated_paid'
        ? "We've received your details and AFSS information. The payment above is a simulation only — no money was charged."
        : "We've received your details and AFSS information."
      : "We've received your quote request. Our team will review everything and contact you shortly.";

  return (
    <div className="mx-auto max-w-md py-2 text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#1c4d9c]/15">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#1c4d9c"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#1c4d9c]">
        Quote request received
      </p>
      <h2 className="mb-2 text-2xl font-black uppercase tracking-tight text-black sm:text-3xl">
        {title}
      </h2>
      <p className="mb-6 text-sm text-gray-600">{subtitle}</p>

      <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-left">
        <div className="mb-1 text-xs font-bold uppercase tracking-widest text-gray-400">
          Quote reference
        </div>
        <div className="font-mono text-base font-bold text-black">
          {submission.submission_reference}
        </div>

        {submission.total_amount != null && (
          <>
            <div className="mt-3 mb-1 text-xs font-bold uppercase tracking-widest text-gray-400">
              {submission.is_simulation ? 'Simulated total' : 'Estimated total'}
            </div>
            <div className="font-mono text-base font-bold text-black">
              {formatAUD(submission.total_amount)}
            </div>
          </>
        )}

        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-gray-500">Submitted</span>
          <time className="text-gray-700">
            {new Date(submission.submitted_at).toLocaleString('en-AU')}
          </time>
        </div>

        <div className="mt-1 flex items-center justify-between text-xs">
          <span className="text-gray-500">Next step</span>
          <span className="text-gray-700">
            {submission.payment_status === 'simulated_paid'
              ? 'Review → Contact'
              : 'Our team will reach out'}
          </span>
        </div>
      </div>

      <a
        href="tel:1300765594"
        className={secondaryButton + ' mb-3 flex items-center justify-center gap-2 !text-lg sm:!text-xl !py-4'}
        aria-label="Call us on 1300 765 594"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
        Call 1300 765 594
      </a>

      <button
        type="button"
        onClick={onClose}
        className={primaryButton}
      >
        Done
      </button>
    </div>
  );
}
