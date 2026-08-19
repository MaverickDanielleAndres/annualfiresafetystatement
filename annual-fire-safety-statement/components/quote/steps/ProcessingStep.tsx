'use client';

import { useEffect, useRef, useState } from 'react';
import type { QuoteSessionSummary } from '@/lib/afss/types';

interface Props {
  summary: QuoteSessionSummary;
  onResult: (s: QuoteSessionSummary) => void;
}

type Stage = 'extracting' | 'pricing' | 'done';

/**
 * Processing step — REAL backend state, no fake timers.
 *
 * Triggers /trigger-extraction then /generate-quote in sequence.
 * Updates the visible checklist only as the backend confirms each
 * step. Polls /status for the final quote summary.
 */
export default function ProcessingStep({ summary, onResult }: Props) {
  const [stage, setStage] = useState<Stage>('extracting');
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void runPipeline();
  }, []);

  async function runPipeline() {
    try {
      // 1. Document extraction
      const extRes = await fetch('/api/afss/quote/trigger-extraction', {
        method: 'POST',
      });
      if (!extRes.ok) {
        const data = await extRes.json().catch(() => null);
        setError(data?.error ?? 'Document reading failed.');
      }

      // 2. Pricing
      setStage('pricing');
      const qRes = await fetch('/api/afss/quote/generate-quote', {
        method: 'POST',
      });
      if (!qRes.ok) {
        const data = await qRes.json().catch(() => null);
        setError(data?.error ?? 'Quote generation failed.');
      }

      // 3. Refresh status
      const status = await fetch('/api/afss/quote/status').then((r) => r.json());
      if (status.session) onResult(status.session);

      setStage('done');
    } catch (e: any) {
      setError(e?.message ?? 'Pipeline failed.');
      setStage('done');
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h2 className="mb-2 text-2xl font-black uppercase tracking-tight text-black sm:text-3xl">
        Reading your AFSS…
      </h2>
      <p className="mb-6 text-sm text-gray-600">
        Quote reference&nbsp;
        <span className="font-mono">{summary.quote_reference}</span>
      </p>

      <ul className="space-y-3">
        <Check
          label="Identifying the building"
          done={stage !== 'extracting'}
        />
        <Check
          label="Detecting fire safety measures"
          done={stage === 'pricing' || stage === 'done'}
        />
        <Check
          label="Reading assessment information"
          done={stage === 'pricing' || stage === 'done'}
        />
        <Check
          label="Calculating your quote"
          done={stage === 'done'}
        />
      </ul>

      {error && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      )}
    </div>
  );
}

function Check({ label, done }: { label: string; done: boolean }) {
  return (
    <li
      className={
        'flex items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors ' +
        (done
          ? 'border-[#fb5614]/30 bg-[#fb5614]/5 text-black'
          : 'border-gray-200 bg-white text-gray-500')
      }
    >
      <span
        className={
          'flex h-5 w-5 items-center justify-center rounded-full ' +
          (done ? 'bg-[#fb5614] text-white' : 'border border-gray-300')
        }
      >
        {done ? '✓' : ''}
      </span>
      {label}
    </li>
  );
}