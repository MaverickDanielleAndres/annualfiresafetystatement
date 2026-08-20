'use client';

import { useEffect, useState } from 'react';
import { Field, inputClass, primaryButton, subtleLink } from '../common';
import { api } from '../api';
import { useToaster } from '../Toast';
import type { QuoteSessionSummary } from '@/lib/afss/types';

interface Props {
  onSaved: (s: QuoteSessionSummary | null) => void;
  onBack: () => void;
}

/**
 * Step 5 — When is your AFSS due?
 *
 * UX:
 *   - Three explicit DD inputs (day / month / year) that auto-
 *     format on blur (DD/MM/YYYY).
 *   - Native date picker retained as a fallback for users on
 *     desktop who prefer it.
 *   - "I'm not sure" preserved (sends due_date_known=false).
 *
 * The form submits YYYY-MM-DD (the server canonical format) so
 * the existing validation & DB code keep working.
 */
export default function DueDateStep({ onSaved, onBack }: Props) {
  const { push } = useToaster();
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [iso, setIso] = useState(''); // canonical YYYY-MM-DD
  const [unsure, setUnsure] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [usePicker, setUsePicker] = useState(false);

  useEffect(() => {
    if (!day && !month && !year) return;
    const d = Number(day);
    const m = Number(month);
    const y = Number(year);
    if (!d || !m || !y) {
      setIso('');
      return;
    }
    if (y < 2020 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) {
      setIso('');
      return;
    }
    const mm = String(m).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    const candidate = `${y}-${mm}-${dd}`;
    const test = new Date(candidate + 'T00:00:00');
    if (isNaN(test.getTime())) {
      setIso('');
      return;
    }
    setIso(candidate);
  }, [day, month, year]);

  async function submit(payload: { due_date: string | null }) {
    setError(null);
    setSubmitting(true);
    const res = await api.post<{ ok: boolean }>('/api/afss/quote/due-date', payload);
    if (!res.ok) {
      setSubmitting(false);
      setError(res.error);
      push({ kind: 'error', title: 'Could not save', text: res.error });
      return;
    }
    push({ kind: 'success', text: 'Due date saved.' });
    const status = await api.get<{ session: QuoteSessionSummary | null }>(
      '/api/afss/quote/status'
    );
    onSaved(status.ok ? (status.data.session as any) : null);
  }

  async function onSubmitDate(e: React.FormEvent) {
    e.preventDefault();
    if (!iso) {
      setError('Please enter a valid date.');
      return;
    }
    await submit({ due_date: iso });
  }

  async function onSubmitUnsure() {
    setUnsure(true);
    setDay('');
    setMonth('');
    setYear('');
    setIso('');
    await submit({ due_date: null });
  }

  const humanDate = (() => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  })();

  return (
    <div className="mx-auto max-w-md">
      <h2 className="mb-2 text-2xl font-black uppercase tracking-tight text-black sm:text-3xl">
        When is your AFSS due?
      </h2>
      <p className="mb-6 text-sm text-gray-600">
        Don&apos;t worry if you&apos;re not sure — pick a date or skip.
      </p>

      <form className="space-y-5" onSubmit={onSubmitDate}>
        {!usePicker ? (
          <div>
            <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-700">
              Due date
            </span>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={2}
                placeholder="DD"
                aria-label="Day"
                value={day}
                onChange={(e) => {
                  setUnsure(false);
                  const v = e.target.value.replace(/\D/g, '').slice(0, 2);
                  setDay(v);
                  if (v.length === 2 && month.length === 0) {
                    document.getElementById('afss-month')?.focus();
                  }
                }}
                className={inputClass}
                disabled={unsure}
                id="afss-day"
              />
              <input
                type="text"
                id="afss-month"
                inputMode="numeric"
                maxLength={2}
                placeholder="MM"
                aria-label="Month"
                value={month}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 2);
                  setMonth(v);
                  if (v.length === 2 && year.length === 0) {
                    document.getElementById('afss-year')?.focus();
                  }
                }}
                className={inputClass}
                disabled={unsure}
              />
              <input
                type="text"
                id="afss-year"
                inputMode="numeric"
                maxLength={4}
                placeholder="YYYY"
                aria-label="Year"
                value={year}
                onChange={(e) =>
                  setYear(e.target.value.replace(/\D/g, '').slice(0, 4))
                }
                className={inputClass}
                disabled={unsure}
              />
            </div>
            {iso && (
              <div className="mt-2 text-xs text-gray-500">
                Reads as <strong className="text-black">{humanDate}</strong>
              </div>
            )}
            <button
              type="button"
              onClick={() => setUsePicker(true)}
              className={subtleLink + ' mt-2 inline-block'}
            >
              Or pick via calendar →
            </button>
          </div>
        ) : (
          <Field label="Due date">
            <input
              type="date"
              value={unsure ? '' : iso}
              disabled={unsure}
              onChange={(e) => {
                setUnsure(false);
                setIso(e.target.value);
              }}
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => setUsePicker(false)}
              className={subtleLink + ' mt-2 inline-block'}
            >
              ← Type manually (DD / MM / YYYY)
            </button>
          </Field>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="pt-4 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={onBack}
            className={subtleLink}
          >
            ← Back
          </button>

          <button
            type="submit"
            disabled={submitting || unsure || !iso}
            className={primaryButton + ' !mx-0'}
            style={{ background: "linear-gradient(to right, #0b1d36, #1c4d9c)", color: "#ffffff" }}
          >
            {submitting ? 'Saving…' : 'Next →'}
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={onSubmitUnsure}
            className={subtleLink}
          >
            I&apos;m not sure →
          </button>
        </div>
      </form>
    </div>
  );
}
