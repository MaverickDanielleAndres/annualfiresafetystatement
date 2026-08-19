'use client';

import { useState } from 'react';
import {
  Field,
  inputClass,
  primaryButton,
} from './ContactStep';
import type { QuoteSessionSummary } from '@/lib/afss/types';

interface Props {
  onSaved: (s: QuoteSessionSummary | null) => void;
  onBack: () => void;
}

export default function DueDateStep({ onSaved, onBack }: Props) {
  const [date, setDate] = useState('');
  const [unsure, setUnsure] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(payload: { due_date: string | null }) {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/afss/quote/due-date', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed.');
        setSubmitting(false);
        return;
      }
      const status = await fetch('/api/afss/quote/status').then((r) => r.json());
      onSaved(status.session);
    } catch {
      setError('Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  async function onSubmitDate(e: React.FormEvent) {
    e.preventDefault();
    await submit({ due_date: date || null });
  }

  async function onSubmitUnsure() {
    setUnsure(true);
    await submit({ due_date: null });
  }

  return (
    <div className="mx-auto max-w-md">
      <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#fb5614]">
        Step 5 of 6
      </p>
      <h2 className="mb-2 text-2xl font-black uppercase tracking-tight text-black sm:text-3xl">
        When is your AFSS due?
      </h2>
      <p className="mb-6 text-sm text-gray-600">
        Don&apos;t worry if you&apos;re not sure — pick a date or skip.
      </p>

      <form className="space-y-5" onSubmit={onSubmitDate}>
        <Field label="Due date">
          <input
            type="date"
            value={unsure ? '' : date}
            disabled={unsure}
            onChange={(e) => {
              setUnsure(false);
              setDate(e.target.value);
            }}
            className={inputClass + ' ' + (unsure ? 'opacity-50' : '')}
          />
        </Field>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || unsure || !date}
          className={primaryButton}
        >
          {submitting ? 'Saving…' : 'Next →'}
        </button>

        <button
          type="button"
          disabled={submitting}
          onClick={onSubmitUnsure}
          className="w-full text-sm text-gray-500 hover:text-black"
        >
          I&apos;m not sure →
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full text-xs uppercase tracking-widest text-gray-400 hover:text-black"
        >
          ← Back
        </button>
      </form>
    </div>
  );
}