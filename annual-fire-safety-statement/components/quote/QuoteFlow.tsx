'use client';

/**
 * AFSS — Quote flow controller (client component).
 *
 * Orchestrates the 6 wizard steps + final success modal.
 *
 * Step ladder:
 *   1 contact
 *   2 property
 *   3 building_confirmation
 *   4 document
 *   5 due_date
 *   6 quote + payment
 *   7 final success (separate, replaces the whole flow)
 *
 * Important:
 *   * Each step receives onSaved/onConfirmed; only advances the
 *     UI after the backend returns ok.
 *   * Progress is saved server-side per step. If the customer
 *     closes the modal and resumes, the wizard restarts at the
 *     right place (resolveInitialStep).
 */

import { useEffect, useState } from 'react';
import ContactStep from './steps/ContactStep';
import PropertyStep from './steps/PropertyStep';
import BuildingConfirmStep from './steps/BuildingConfirmStep';
import DocumentStep from './steps/DocumentStep';
import DueDateStep from './steps/DueDateStep';
import QuotePaymentStep from './steps/QuotePaymentStep';
import SubmissionSuccessModal from './SubmissionSuccessModal';
import QuoteProgress from './QuoteProgress';
import { api } from './api';
import { ToasterProvider, useToaster } from './Toast';
import type {
  QuoteSessionSummary,
  QuoteSubmissionSummary,
} from '@/lib/afss/types';

type StepIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface QuoteFlowProps {
  onClose: () => void;
  initialSummary: QuoteSessionSummary | null;
}

function QuoteFlowInner({ onClose, initialSummary }: QuoteFlowProps) {
  const [step, setStep] = useState<StepIndex>(resolveInitialStep(initialSummary));
  const [summary, setSummary] = useState<QuoteSessionSummary | null>(initialSummary);
  const [submission, setSubmission] = useState<QuoteSubmissionSummary | null>(null);
  useToaster();

  useEffect(() => {
    if (!summary) return;
    setStep(resolveInitialStep(summary));
  }, [summary?.current_step, summary?.status, summary?.is_submitted]);

  useEffect(() => {
    // On mount: if there's already a submission for the cookie
    // session, jump straight to the success modal. (Browser
    // refreshed, was previously submitted.)
    (async () => {
      const r = await api.get<{
        ok: boolean;
        submission: QuoteSubmissionSummary | null;
      }>('/api/afss/quote/submission-status');
      if (r.ok && r.data.submission) {
        setSubmission(r.data.submission);
        setStep(7);
      }
    })();
  }, []);

  if (step === 7 && submission) {
    return (
      <div className="flex w-full flex-col">
        <div className="flex-1 px-5 py-6 sm:px-8 md:px-10 md:py-10">
          <SubmissionSuccessModal
            submission={submission}
            onClose={onClose}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col">
      <QuoteProgress current={Math.min(step, 6) as 1 | 2 | 3 | 4 | 5 | 6} />
      <div className="flex-1 px-5 pb-6 sm:px-8 md:px-10 md:pb-10">
        {step === 1 && (
          <ContactStep
            initialSummary={summary}
            onSaved={(s) => {
              setSummary(s);
              setStep(2);
            }}
          />
        )}
        {step === 2 && (
          <PropertyStep
            onSaved={(s) => {
              setSummary(s);
              setStep(3);
            }}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <BuildingConfirmStep
            onConfirmed={() => setStep(4)}
            onChange={() => setStep(2)}
          />
        )}
        {step === 4 && (
          <DocumentStep
            onUploaded={() => setStep(5)}
            onFallback={() => setStep(5)}
          />
        )}
        {step === 5 && (
          <DueDateStep
            onSaved={(s) => {
              setSummary(s);
              setStep(6);
            }}
            onBack={() => setStep(4)}
          />
        )}
        {step === 6 && summary && (
          <QuotePaymentStep
            summary={summary}
            onSubmitted={(s) => {
              setStep(7);
              // Refresh submission details.
              void api
                .get<{
                  ok: boolean;
                  submission: QuoteSubmissionSummary | null;
                }>('/api/afss/quote/submission-status')
                .then((r) => {
                  if (r.ok && r.data.submission) setSubmission(r.data.submission);
                  else
                    setSubmission({
                      id: 'pending',
                      submission_reference: s.submission_reference,
                      payment_preference: (summary.payment_preference as any) ?? 'contact_first',
                      payment_mode: 'simulation',
                      payment_status: 'simulated_paid',
                      submitted_at: new Date().toISOString(),
                      quote_number: summary.quote_number,
                      total_amount: summary.total_amount,
                      currency: 'AUD',
                      is_simulation: true,
                    });
                });
            }}
          />
        )}
        {step === 6 && !summary && (
          <div className="text-center text-gray-500">Loading…</div>
        )}
      </div>

    </div>
  );
}

function resolveInitialStep(s: QuoteSessionSummary | null): StepIndex {
  if (!s) return 1;
  if (s.is_submitted) return 7;
  switch (s.current_step) {
    case 'contact':
      return 1;
    case 'property':
      return 2;
    case 'building_confirmation':
      return 3;
    case 'document':
      return 4;
    case 'due_date':
      return 5;
    case 'processing':
    case 'quote':
    case 'complete':
    case 'submitted':
    default:
      return 6;
  }
}

export default function QuoteFlow(props: QuoteFlowProps) {
  return (
    <ToasterProvider>
      <QuoteFlowInner {...props} />
    </ToasterProvider>
  );
}
