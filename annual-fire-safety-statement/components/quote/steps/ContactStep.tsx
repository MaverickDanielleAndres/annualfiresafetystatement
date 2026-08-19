'use client';

import { useState } from 'react';
import type { QuoteSessionSummary } from '@/lib/afss/types';

interface Props {
  initialSummary: QuoteSessionSummary | null;
  onSaved: (s: QuoteSessionSummary | null) => void;
}

export default function ContactStep({ initialSummary, onSaved }: Props) {
  const [firstName, setFirstName] = useState(initialSummary?.quote_reference ? '' : '');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/afss/quote/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          email,
          mobile,
          utm: readUtm(),
          landing_path:
            typeof window !== 'undefined' ? window.location.pathname : null,
          source: 'instant_quote_modal',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Please check your details.');
        setSubmitting(false);
        return;
      }
      // Pull current summary.
      const status = await fetch('/api/afss/quote/status').then((r) => r.json());
      onSaved(status.session);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#fb5614]">
        Step 1 of 6
      </p>
      <h2 className="mb-2 text-2xl font-black uppercase tracking-tight text-black sm:text-3xl">
        Let&apos;s start with you.
      </h2>
      <p className="mb-6 text-sm text-gray-600">
        We&apos;ll save your details straight away — you can come back any time.
      </p>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <Field label="First name">
          <input
            type="text"
            required
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={inputClass}
            placeholder="e.g. Sam"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="sam@example.com"
          />
        </Field>
        <Field label="Mobile">
          <input
            type="tel"
            required
            autoComplete="tel"
            inputMode="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className={inputClass}
            placeholder="0400 000 000"
          />
        </Field>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className={primaryButton}
        >
          {submitting ? 'Saving…' : 'Next →'}
        </button>
      </form>
    </div>
  );
}

export const inputClass =
  'w-full rounded-lg border border-gray-300 px-4 py-3 text-base text-black placeholder-gray-400 focus:border-[#fb5614] focus:outline-none focus:ring-2 focus:ring-[#fb5614]/40';

export const primaryButton =
  'w-full rounded-lg bg-gradient-to-r from-[#ff5614] to-[#ffad05] px-4 py-4 text-base font-bold uppercase tracking-widest text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60';

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-700">
        {label}
      </span>
      {children}
    </label>
  );
}

function readUtm(): Record<string, string | null> {
  if (typeof window === 'undefined') return {};
  const sp = new URLSearchParams(window.location.search);
  return {
    source: sp.get('utm_source'),
    medium: sp.get('utm_medium'),
    campaign: sp.get('utm_campaign'),
    term: sp.get('utm_term'),
    content: sp.get('utm_content'),
  };
}