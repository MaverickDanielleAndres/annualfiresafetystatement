'use client';

/**
 * Step 2 — Australian address autocomplete.
 *
 * Architecture:
 *   BROWSER  →  /api/afss/quote/address-search  →
 *   server (uses GEOAPIFY_API_KEY from process.env)  →
 *   Geoapify with countrycode:au filter  →  normalised JSON.
 *
 * The browser NEVER calls Geoapify. NEXT_PUBLIC_GEOAPIFY_API_KEY is
 * not consulted on the client.
 *
 * Implementation notes — the dropdown is rendered into a React
 * Portal so the modal's `overflow-hidden` and the scrollable
 * `overflow-y-auto` container do not clip the suggestions list.
 */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Field, inputClass, primaryButton, subtleLink } from '../common';
import { api } from '../api';
import { useToaster } from '../Toast';
import type { QuoteSessionSummary } from '@/lib/afss/types';

interface Props {
  onSaved: (s: QuoteSessionSummary | null) => void;
  onBack: () => void;
}

interface Suggestion {
  id: string;
  formatted: string;
  addressLine1: string | null;
  addressLine2: string | null;
  suburb: string | null;
  state: string | null;
  postcode: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface ResolvedAddress {
  providerId: string;
  formattedAddress: string;
  addressLine1: string | null;
  addressLine2: string | null;
  suburb: string | null;
  state: string | null;
  postcode: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
}

interface DropdownPos {
  left: number;
  top: number;
  width: number;
}

export default function PropertyStep({ onSaved, onBack }: Props) {
  const { push } = useToaster();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [highlighted, setHighlighted] = useState<number>(-1);
  const [resolvedAddress, setResolvedAddress] = useState<ResolvedAddress | null>(
    null
  );
  const [manualMode, setManualMode] = useState(false);
  const [manualAddressLine1, setManualAddressLine1] = useState('');
  const [manualSuburb, setManualSuburb] = useState('');
  const [manualState, setManualState] = useState('NSW');
  const [manualPostcode, setManualPostcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<DropdownPos | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestSeq = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!showDropdown) return;
    function recompute() {
      const el = inputRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setPos({
        left: rect.left,
        top: rect.bottom + 4,
        width: rect.width,
      });
    }
    recompute();
    window.addEventListener('resize', recompute);
    window.addEventListener('scroll', recompute, true);
    return () => {
      window.removeEventListener('resize', recompute);
      window.removeEventListener('scroll', recompute, true);
    };
  }, [showDropdown, query]);

  useEffect(() => {
    if (query.trim().length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      setLoading(false);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void fetchSuggestions(query);
    }, 280);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  async function fetchSuggestions(q: string) {
    const seq = ++requestSeq.current;
    setLoading(true);
    setError(null);
    const r = await api.get<{
      ok: boolean;
      suggestions?: Suggestion[];
      error?: string;
    }>(
      `/api/afss/quote/address-search?q=${encodeURIComponent(q.trim())}`
    );
    if (seq !== requestSeq.current) return;
    setLoading(false);
    if (!r.ok) {
      setSuggestions([]);
      setShowDropdown(false);
      push({
        kind: 'warning',
        title: 'Address lookup',
        text: r.error || 'Address service is not reachable.',
      });
      return;
    }
    if (!r.data.ok) {
      setSuggestions([]);
      setShowDropdown(false);
      push({
        kind: 'warning',
        title: 'Address lookup',
        text: r.data.error || 'Address service is not reachable.',
      });
      return;
    }
    const list = Array.isArray(r.data.suggestions)
      ? r.data.suggestions.filter((s) => s && s.id)
      : [];
    setSuggestions(list);
    setShowDropdown(list.length > 0);
    setHighlighted(-1);
  }

  async function selectSuggestion(idx: number) {
    const s = suggestions[idx];
    if (!s) return;
    setError(null);
    setSuggestions([]);
    setShowDropdown(false);
    setQuery(s.formatted);
    const resolved: ResolvedAddress = {
      providerId: s.id,
      formattedAddress: s.formatted,
      addressLine1: s.addressLine1,
      addressLine2: s.addressLine2,
      suburb: s.suburb,
      state: s.state,
      postcode: s.postcode,
      country: s.country ?? 'AU',
      latitude: s.latitude,
      longitude: s.longitude,
    };
    setResolvedAddress(resolved);
    setLoading(false);
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown || suggestions.length === 0) {
      if (e.key === 'Escape') setShowDropdown(false);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlighted >= 0) void selectSuggestion(highlighted);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowDropdown(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (manualMode) {
      if (!manualAddressLine1.trim()) {
        setError('Please type at least the first line of the address.');
        return;
      }
    } else if (!resolvedAddress) {
      setError('Please pick an Australian address from the suggestions.');
      return;
    }
    setSubmitting(true);
    const payload: any = manualMode
      ? {
          address_provider: 'manual',
          address_provider_id: null,
          formatted_address: `${manualAddressLine1}, ${manualSuburb} ${manualState} ${manualPostcode}`
            .replace(/\s+/g, ' ')
            .trim(),
          address_line_1: manualAddressLine1,
          address_line_2: null,
          suburb: manualSuburb || null,
          state: manualState,
          postcode: manualPostcode,
          country: 'AU',
          latitude: null,
          longitude: null,
        }
      : resolvedAddress
        ? {
            address_provider: 'geoapify',
            address_provider_id: resolvedAddress.providerId,
            address_line_1: resolvedAddress.addressLine1,
            address_line_2: resolvedAddress.addressLine2,
            suburb: resolvedAddress.suburb,
            state: resolvedAddress.state,
            postcode: resolvedAddress.postcode,
            country: resolvedAddress.country,
            formatted_address: resolvedAddress.formattedAddress,
            latitude: resolvedAddress.latitude,
            longitude: resolvedAddress.longitude,
            google_place_id: null,
          }
        : null;
    if (!payload) return;
    const res = await api.post<{ ok: boolean }>(
      '/api/afss/quote/property',
      payload
    );
    if (!res.ok) {
      setSubmitting(false);
      setError(res.error);
      push({ kind: 'error', title: 'Address not saved', text: res.error });
      return;
    }
    push({ kind: 'success', text: 'Address saved.' });
    const status = await api.get<{
      ok: boolean;
      session: QuoteSessionSummary | null;
    }>('/api/afss/quote/status');
    onSaved(status.ok ? status.data.session : null);
  }

  const dropdown = useMemo(() => {
    if (!showDropdown || !pos) return null;
    if (suggestions.length === 0) {
      if (loading || query.trim().length < 3) return null;
      return (
        <div
          role="status"
          className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500 shadow-xl"
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            width: pos.width,
            zIndex: 2147483600,
          }}
        >
          No addresses found.
        </div>
      );
    }
    return (
      <ul
        role="listbox"
        className="max-h-72 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl"
        style={{
          position: 'fixed',
          top: pos.top,
          left: pos.left,
          width: pos.width,
          zIndex: 2147483600,
        }}
      >
        {suggestions.map((s, i) => (
          <li
            key={s.id}
            role="option"
            aria-selected={i === highlighted}
            onMouseDown={(e) => {
              e.preventDefault();
              void selectSuggestion(i);
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              void selectSuggestion(i);
            }}
            onMouseEnter={() => setHighlighted(i)}
            className={
              'flex cursor-pointer flex-col gap-0.5 px-4 py-2.5 text-sm ' +
              (i === highlighted
                ? 'bg-[#fb5614]/10 text-black'
                : 'text-gray-800 hover:bg-gray-50')
            }
          >
            <span className="font-medium">{s.addressLine1 || s.formatted}</span>
            {(s.suburb || s.state || s.postcode) && (
              <span className="text-xs text-gray-500">
                {[s.suburb, s.state, s.postcode].filter(Boolean).join(', ')}
              </span>
            )}
          </li>
        ))}
      </ul>
    );
  }, [showDropdown, pos, suggestions, highlighted, query, loading]);

  return (
    <div className="mx-auto max-w-md">
      <h2 className="mb-2 text-2xl font-black uppercase tracking-tight text-black sm:text-3xl">
        Your building address
      </h2>
      <p className="mb-6 text-sm text-gray-600">
        Start typing — pick an Australian address from the list.
      </p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {!manualMode ? (
          <Field label="Address" hint="Start typing your address…">
            <div>
              <input
                ref={inputRef}
                type="text"
                autoComplete="off"
                spellCheck={false}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setResolvedAddress(null);
                }}
                onFocus={() => {
                  if (suggestions.length > 0) setShowDropdown(true);
                }}
                onBlur={() => {
                  window.setTimeout(() => setShowDropdown(false), 180);
                }}
                onKeyDown={handleKey}
                className={inputClass}
                placeholder="200 George Street, Sydney NSW 2000"
                aria-label="Building address"
                aria-autocomplete="list"
                aria-expanded={showDropdown}
                aria-controls="afss-address-listbox"
              />
              {loading && (
                <span className="mt-1 block text-xs text-gray-400">
                  Searching…
                </span>
              )}
            </div>
          </Field>
        ) : (
          <div className="space-y-3">
            <Field label="Street address">
              <input
                type="text"
                value={manualAddressLine1}
                onChange={(e) => setManualAddressLine1(e.target.value)}
                className={inputClass}
                placeholder="200 George Street"
                aria-label="Street address"
              />
            </Field>
            <Field label="Suburb">
              <input
                type="text"
                value={manualSuburb}
                onChange={(e) => setManualSuburb(e.target.value)}
                className={inputClass}
                placeholder="Sydney"
                aria-label="Suburb"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="State">
                <select
                  value={manualState}
                  onChange={(e) => setManualState(e.target.value)}
                  className={inputClass}
                  aria-label="State"
                >
                  {['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'].map(
                    (s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    )
                  )}
                </select>
              </Field>
              <Field label="Postcode">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  pattern="[0-9]{4}"
                  value={manualPostcode}
                  onChange={(e) =>
                    setManualPostcode(
                      e.target.value.replace(/\D/g, '').slice(0, 4)
                    )
                  }
                  className={inputClass}
                  placeholder="2000"
                  aria-label="Postcode"
                />
              </Field>
            </div>
          </div>
        )}

        {!manualMode && (
          <button
            type="button"
            onClick={() => setManualMode(true)}
            className={subtleLink + ' mt-2 inline-block'}
          >
            Or enter address manually →
          </button>
        )}
        {manualMode && (
          <button
            type="button"
            onClick={() => setManualMode(false)}
            className={subtleLink + ' mt-2 inline-block'}
          >
            ← Use address search
          </button>
        )}

        {resolvedAddress && !manualMode && (
          <div className="rounded-lg border border-[#fb5614]/30 bg-[#fb5614]/5 p-3 text-sm">
            <div className="text-xs font-bold uppercase tracking-widest text-[#fb5614]">
              Selected
            </div>
            <div className="text-black">{resolvedAddress.formattedAddress}</div>
          </div>
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
          
          <button type="submit" disabled={submitting} className={primaryButton + ' !mx-0'}>
            {submitting ? 'Saving…' : 'Next →'}
          </button>
        </div>
      </form>

      {mounted && dropdown && typeof document !== 'undefined'
        ? createPortal(dropdown, document.body)
        : null}
    </div>
  );
}
