'use client';

/**
 * AFSS — Instant Quote flow controller (client component).
 *
 * Orchestrates the 6 wizard steps. Each step has its own component.
 * State is held client-side; persistence happens server-side via the
 * API route handlers. The cookie token (set by the server after
 * Step 1) identifies the same quote session across requests.
 *
 * Steps:
 *   1 contact
 *   2 property
 *   2b building_confirmation
 *   3 document
 *   4 due_date
 *   5 processing (auto-trigger extraction + pricing)
 *   6 quote result (manual review OR automatic)
 */

import { useEffect, useState } from 'react';
import ContactStep from './steps/ContactStep';
import PropertyStep from './steps/PropertyStep';
import BuildingConfirmStep from './steps/BuildingConfirmStep';
import DocumentStep from './steps/DocumentStep';
import DueDateStep from './steps/DueDateStep';
import ProcessingStep from './steps/ProcessingStep';
import QuoteResultStep from './steps/QuoteResultStep';
import QuoteProgress from './QuoteProgress';
import type { QuoteSessionSummary, QuoteStep as Step } from '@/lib/afss/types';

type StepIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface QuoteFlowProps {
  onClose: () => void;
  initialSummary: QuoteSessionSummary | null;
}

export default function QuoteFlow({ onClose, initialSummary }: QuoteFlowProps) {
  const [step, setStep] = useState<StepIndex>(resolveInitialStep(initialSummary));
  const [summary, setSummary] = useState<QuoteSessionSummary | null>(initialSummary);

  useEffect(() => {
    if (!summary) return;
    setStep(resolveInitialStep(summary));
  }, [summary?.current_step, summary?.status]);

  return (
    <div className="flex h-full w-full flex-col">
      <QuoteProgress current={step} />

      <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8 md:px-10 md:py-10">
        {step === 1 && (
          <ContactStep
            onSaved={(s) => {
              setSummary(s);
              setStep(2);
            }}
            initialSummary={summary}
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
          <ProcessingStep
            summary={summary}
            onResult={(s) => setSummary(s)}
          />
        )}
        {step === 6 && !summary && (
          <div className="text-center text-gray-500">Loading…</div>
        )}
        {step >= 7 && summary && (
          <QuoteResultStep summary={summary} onClose={onClose} />
        )}
      </div>

      <div className="border-t border-gray-100 px-5 py-3 text-center text-xs text-gray-400 sm:px-8">
        <button
          onClick={onClose}
          className="uppercase tracking-widest hover:text-black transition-colors"
          aria-label="Close quote wizard"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function resolveInitialStep(s: QuoteSessionSummary | null): StepIndex {
  if (!s) return 1;
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
      return 6;
    case 'quote':
    case 'complete':
      return 7;
    default:
      return 1;
  }
}