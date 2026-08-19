'use client';

// Legacy re-exports so existing step components that import from
// './ContactStep' keep working without churn.
export { Field, inputClass, primaryButton, secondaryButton } from '../common';

import { useState } from 'react';
import { Field, inputClass, primaryButton } from '../common';
import { api } from '../api';
import { useToaster } from '../Toast';
import type { QuoteSessionSummary } from '@/lib/afss/types';

interface Props {
  initialSummary: QuoteSessionSummary | null;
  onSaved: (s: QuoteSessionSummary | null) => void;
}

export default function ContactStep({ initialSummary, onSaved }: Props) {
  const { push } = useToaster();
  const [firstName, setFirstName] = useState(
    initialSummary?.quote_reference ? (initialSummary as any).first_name ?? '' : ''
  );
  const [email, setEmail] = useState(
    initialSummary?.quote_reference ? (initialSummary as any).email ?? '' : ''
  );
  const [mobile, setMobile] = useState(
    initialSummary?.quote_reference ? (initialSummary as any).mobile ?? '' : ''
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await api.post<{
      ok: true;
      session_id: string;
      quote_reference: string;
    }>('/api/afss/quote/contact', {
      first_name: firstName,
      email,
      mobile,
      utm: readUtm(),
      landing_path:
        typeof window !== 'undefined' ? window.location.pathname : null,
      source: 'instant_quote_modal',
    });
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error);
      push({ kind: 'error', title: 'Save failed', text: res.error });
      return;
    }
    push({ kind: 'success', text: 'Details saved.' });
    // Fetch updated summary so the wizard can advance correctly.
    const status = await api.get<{ ok: true; session: QuoteSessionSummary | null }>(
      '/api/afss/quote/status'
    );
    if (status.ok) onSaved(status.data.session);
  }

  return (
    <div className="mx-auto max-w-md">
      <h2 className="mb-2 text-2xl font-black uppercase tracking-tight text-black sm:text-3xl">
        Your details
      </h2>
      <p className="mb-6 text-sm text-gray-600">
        We&apos;ll save this straight away — you can come back any time.
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
            aria-label="First name"
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
            aria-label="Email"
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
            aria-label="Mobile"
          />
        </Field>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="pt-4 text-center">
          <button
            type="submit"
            disabled={submitting}
            className={primaryButton}
            style={{ 
              background: "linear-gradient(to right, #ff5614, #ffad05)",
              color: "#ffffff"
            }}
          >
            {submitting ? 'Saving…' : 'Next →'}
          </button>
        </div>
      </form>
    </div>
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
