'use client';

/**
 * Step 2 — Australian building address.
 *
 *   ┌─────────────────────────────────────────────────────────────┐
 *   │  Geoapify autocomplete         — /api/afss/quote/address-search
 *   │  Browser Geolocation + Geoapify reverse geocode
 *   │                                 — /api/afss/quote/address-resolve
 *   │  Save to existing POST /api/afss/quote/property
 *   └─────────────────────────────────────────────────────────────┘
 *
 * The browser NEVER holds a Geoapify key. Every provider call is
 * routed through the two server-side proxies which read
 * `GEOAPIFY_API_KEY` from the server env.
 *
 * Google is no longer used by this step. The only place the Google
 * Maps JS API is still loaded is Step 3 (BuildingConfirmStep) for
 * the Street View panorama widget.
 */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Field, inputClass, primaryButton, secondaryButton, subtleLink } from '../common';
import { api } from '../api';
import { useToaster } from '../Toast';
import type { QuoteSessionSummary } from '@/lib/afss/types';
import type {
  AddressSuggestion,
  NormalizedAddress,
} from '@/lib/afss/providers/address-provider';

interface Props {
  onSaved: (s: QuoteSessionSummary | null) => void;
  onBack: () => void;
}

interface LocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
  accuracyLabel: 'good' | 'approximate' | 'low';
  address: NormalizedAddress;
}

interface DropdownPos {
  left: number;
  top: number;
  width: number;
}

const MIN_QUERY_LEN = 3;
const DEBOUNCE_MS = 280;

type LocationState =
  | 'idle'
  | 'requesting'
  | 'reverse_geocoding'
  | 'found'
  | 'permission_denied'
  | 'unavailable'
  | 'timeout'
  | 'low_accuracy'
  | 'error';

export default function PropertyStep({ onSaved, onBack }: Props) {
  const { push } = useToaster();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [highlighted, setHighlighted] = useState<number>(-1);
  const [resolvedAddress, setResolvedAddress] = useState<NormalizedAddress | null>(null);
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
  const [providerUnavailable, setProviderUnavailable] = useState(false);

  // "Use my location" state
  const [locationState, setLocationState] = useState<LocationState>('idle');
  const [locationResult, setLocationResult] = useState<LocationResult | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [refiningFromLocation, setRefiningFromLocation] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const reverseAbortRef = useRef<AbortController | null>(null);
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
    if (providerUnavailable) return;
    if (query.trim().length < MIN_QUERY_LEN) {
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
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, providerUnavailable]);

  async function fetchSuggestions(q: string) {
    const seq = ++requestSeq.current;
    // Cancel any in-flight request from the previous keystroke.
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/afss/quote/address-search?q=${encodeURIComponent(q)}`,
        { credentials: 'include', signal: ctrl.signal }
      );
      const data = (await res.json().catch(() => null)) as
        | { ok: true; provider: 'geoapify'; suggestions: AddressSuggestion[] }
        | { ok: false; error: string }
        | null;

      if (seq !== requestSeq.current) return;

      if (!res.ok || !data || !('ok' in data) || data.ok === false) {
        if (res.status === 503) {
          setProviderUnavailable(true);
          setSuggestions([]);
          setShowDropdown(false);
          setLoading(false);
          return;
        }
        throw new Error(
          (data && 'error' in data && data.error) ||
            "We couldn't load address suggestions. Please check your connection or try again."
        );
      }

      setLoading(false);
      setSuggestions(data.suggestions ?? []);
      setShowDropdown((data.suggestions ?? []).length > 0);
      setHighlighted(-1);
    } catch (e) {
      if (
        (e instanceof Error && e.name === 'AbortError') ||
        seq !== requestSeq.current
      ) {
        return;
      }
      setLoading(false);
      setSuggestions([]);
      setShowDropdown(false);
      push({
        kind: 'warning',
        title: 'Address lookup',
        text:
          (e instanceof Error && e.message) ||
          "We couldn't load address suggestions. Please check your connection or try again.",
      });
    }
  }

  function selectSuggestion(idx: number) {
    const s = suggestions[idx];
    if (!s) return;
    setError(null);
    setSuggestions([]);
    setShowDropdown(false);
    setQuery(s.fullText);
    // Geoapify returns the full normalised address in the autocomplete
    // response — there is no follow-up round-trip needed (unlike the
    // legacy Google Places flow which required a second fetchPlaceDetails).
    setResolvedAddress(s.address);
    push({ kind: 'success', text: 'Address found.' });
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
      if (highlighted >= 0) selectSuggestion(highlighted);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowDropdown(false);
    }
  }

  async function handleUseMyLocation() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationState('unavailable');
      setLocationError("Your browser doesn't support geolocation.");
      return;
    }
    setLocationState('requesting');
    setLocationError(null);
    setLocationResult(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = pos.coords.accuracy;
        const accuracyLabel: 'good' | 'approximate' | 'low' =
          accuracy <= 50 ? 'good' : accuracy <= 150 ? 'approximate' : 'low';
        setLocationState('reverse_geocoding');

        // Cancel any in-flight reverse-geocode from a prior click.
        if (reverseAbortRef.current) reverseAbortRef.current.abort();
        const ctrl = new AbortController();
        reverseAbortRef.current = ctrl;

        try {
          const res = await fetch(
            `/api/afss/quote/address-resolve?lat=${encodeURIComponent(
              lat
            )}&lng=${encodeURIComponent(lng)}`,
            { credentials: 'include', signal: ctrl.signal }
          );
          const data = (await res.json().catch(() => null)) as
            | { ok: true; provider: 'geoapify'; address: NormalizedAddress }
            | { ok: false; error: string }
            | null;
          if (!res.ok || !data || !('ok' in data) || data.ok === false) {
            if (res.status === 503) {
              setProviderUnavailable(true);
              setLocationState('unavailable');
              setLocationError(
                "Address lookup is temporarily unavailable. Please type your address below."
              );
              return;
            }
            throw new Error(
              (data && 'error' in data && data.error) ||
                'We could not resolve an Australian address.'
            );
          }
          setLocationResult({
            latitude: lat,
            longitude: lng,
            accuracy,
            accuracyLabel,
            address: data.address,
          });
          setLocationState('found');
        } catch (e) {
          if (e instanceof Error && e.name === 'AbortError') return;
          setLocationState('error');
          setLocationError(
            e instanceof Error
              ? e.message
              : 'We could not reverse-geocode your location.'
          );
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setLocationState('permission_denied');
          setLocationError('Location access blocked.');
        } else if (err.code === err.TIMEOUT) {
          setLocationState('timeout');
          setLocationError('Location is taking too long.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setLocationState('unavailable');
          setLocationError("We couldn't detect your location.");
        } else {
          setLocationState('error');
          setLocationError(err.message ?? 'Location error.');
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10_000,
      }
    );
  }

  function acceptLocationResult() {
    if (!locationResult) return;
    setResolvedAddress(locationResult.address);
    setQuery(locationResult.address.formattedAddress);
    setLocationResult(null);
    setLocationState('idle');
    setLocationError(null);
    push({ kind: 'success', text: 'Address found.' });
  }

  function refineAddressFromLocation() {
    if (!locationResult) return;
    // Populate the main input with the reverse-geocoded result and
    // focus so the customer can type a more specific address.
    setQuery(locationResult.address.formattedAddress);
    setResolvedAddress(null);
    setRefiningFromLocation(true);
    setLocationResult(null);
    setLocationState('idle');
    setLocationError(null);
    setTimeout(() => inputRef.current?.focus(), 50);
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
    const payload: Record<string, unknown> | null = manualMode
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
          google_place_id: null,
        }
      : resolvedAddress
        ? {
            address_provider: 'geoapify',
            address_provider_id: resolvedAddress.providerId ?? null,
            address_line_1: resolvedAddress.addressLine1 ?? null,
            address_line_2: resolvedAddress.addressLine2 ?? null,
            suburb: resolvedAddress.suburb ?? null,
            city: resolvedAddress.city ?? null,
            state: resolvedAddress.state ?? null,
            postcode: resolvedAddress.postcode ?? null,
            country: resolvedAddress.country ?? 'AU',
            formatted_address: resolvedAddress.formattedAddress,
            latitude: resolvedAddress.latitude,
            longitude: resolvedAddress.longitude,
            google_place_id: null,
          }
        : null;
    if (!payload) return;
    const res = await api.post<{ ok: boolean }>('/api/afss/quote/property', payload);
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
    setSubmitting(false);
    onSaved(status.ok ? status.data.session : null);
  }

  const dropdown = useMemo(() => {
    if (!showDropdown || !pos) return null;
    if (suggestions.length === 0) {
      if (loading || query.trim().length < MIN_QUERY_LEN) return null;
      return (
        <div
          role="status"
          className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500 shadow-xl"
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            width: pos.width,
            zIndex: 2_147_483_600,
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
          zIndex: 2_147_483_600,
        }}
      >
        {suggestions.map((s, i) => (
          <li
            key={s.providerId || `${s.fullText}-${i}`}
            role="option"
            aria-selected={i === highlighted}
            onMouseDown={(e) => {
              e.preventDefault();
              selectSuggestion(i);
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              selectSuggestion(i);
            }}
            onMouseEnter={() => setHighlighted(i)}
            className={
              'flex cursor-pointer flex-col gap-0.5 px-4 py-2.5 text-sm ' +
              (i === highlighted
                ? 'bg-[#1c4d9c]/10 text-black'
                : 'text-gray-800 hover:bg-gray-50')
            }
          >
            <span className="font-medium">{s.primaryText}</span>
            {s.secondaryText && (
              <span className="text-xs text-gray-500">{s.secondaryText}</span>
            )}
          </li>
        ))}
        <li
          aria-hidden
          className="border-t border-gray-100 px-4 py-2 text-[10px] uppercase tracking-wider text-gray-400"
        >
          Powered by Geoapify
        </li>
      </ul>
    );
  }, [showDropdown, pos, suggestions, highlighted, query, loading, selectSuggestion]);

  const useMyLocationDisabled =
    typeof navigator === 'undefined' || !navigator.geolocation;

  return (
    <div className="mx-auto max-w-md">
      <h2 className="mb-2 text-2xl font-black uppercase tracking-tight text-black sm:text-3xl">
        Your building address
      </h2>
      <p className="mb-6 text-sm text-gray-600">
        Start typing — pick an Australian address from the list, or use your current location.
      </p>

      {providerUnavailable && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          (Developer) Address search is temporarily unavailable. Check that
          <span className="mx-1 font-mono">GEOAPIFY_API_KEY</span>
          is configured on the server.
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        {!manualMode ? (
          <>
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
                    setRefiningFromLocation(false);
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
                  disabled={providerUnavailable}
                />
                {loading && (
                  <span className="mt-1 block text-xs text-gray-400">Searching addresses…</span>
                )}
              </div>
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={useMyLocationDisabled || providerUnavailable}
                className="flex items-center justify-start gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-gray-700 transition hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <circle cx="12" cy="12" r="9" />
                  <line x1="12" y1="3" x2="12" y2="6" />
                  <line x1="12" y1="18" x2="12" y2="21" />
                  <line x1="3" y1="12" x2="6" y2="12" />
                  <line x1="18" y1="12" x2="21" y2="12" />
                  <circle cx="12" cy="12" r="3" fill="currentColor" />
                </svg>
                Use my location
              </button>
              {!manualMode && !resolvedAddress && !locationResult && (
                <button
                  type="button"
                  onClick={() => setManualMode(true)}
                  className="flex items-center justify-start gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-gray-700 transition hover:bg-gray-50 hover:border-gray-400 text-left leading-tight"
                >
                  Or enter address manually →
                </button>
              )}
              {refiningFromLocation && (
                <div className="flex items-center justify-start">
                  <span className="text-xs text-gray-500">
                    Refine the address below.
                  </span>
                </div>
              )}
            </div>

            {locationState === 'requesting' && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                Asking your browser for your location…
              </div>
            )}
            {locationState === 'reverse_geocoding' && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                Finding your address…
              </div>
            )}
            {locationState === 'low_accuracy' && locationError && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Low accuracy: {locationError}
              </div>
            )}
            {locationState === 'permission_denied' && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <strong>Location access blocked.</strong> You can still enter your building address manually.
              </div>
            )}
            {locationState === 'unavailable' && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                We couldn&apos;t detect your location. Please type your address instead.
              </div>
            )}
            {locationState === 'timeout' && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <strong>Location is taking too long.</strong>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void handleUseMyLocation()}
                    className={secondaryButton + ' !w-auto !py-2 !px-3 text-xs'}
                  >
                    Try again
                  </button>
                  <button
                    type="button"
                    onClick={() => inputRef.current?.focus()}
                    className={subtleLink}
                  >
                    Enter address manually
                  </button>
                </div>
              </div>
            )}
            {locationState === 'error' && locationError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {locationError}
              </div>
            )}

            {locationResult && (
              <div className="rounded-lg border border-[#1c4d9c]/30 bg-[#1c4d9c]/5 p-4 text-sm">
                <div className="text-xs font-bold uppercase tracking-widest text-[#1c4d9c]">
                  We found this address
                </div>
                <div className="mt-1 text-base font-medium text-black">
                  {locationResult.address.formattedAddress}
                </div>
                <div className="mt-1 text-xs text-gray-600">
                  Accuracy: approximately{' '}
                  <strong>{Math.round(locationResult.accuracy)} m</strong>
                  {locationResult.accuracyLabel === 'good' && ' — good'}
                  {locationResult.accuracyLabel === 'approximate' && ' — approximate'}
                  {locationResult.accuracyLabel === 'low' && ' — low accuracy'}
                </div>
                {locationResult.accuracyLabel === 'low' && (
                  <div className="mt-2 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    Your location may not be precise enough to identify the exact building.
                    Please confirm the address.
                  </div>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={acceptLocationResult}
                    className={primaryButton + ' !mx-0 !w-auto !py-2 !px-4 text-xs'}
                    style={{
                      background: 'linear-gradient(to right, #0b1d36, #1c4d9c)',
                      color: '#ffffff',
                    }}
                  >
                    Use this address →
                  </button>
                  <button
                    type="button"
                    onClick={refineAddressFromLocation}
                    className={secondaryButton + ' !w-auto !py-2 !px-4 text-xs'}
                  >
                    Refine address
                  </button>
                  <button
                    type="button"
                    onClick={() => inputRef.current?.focus()}
                    className={subtleLink}
                  >
                    Type a different address
                  </button>
                </div>
              </div>
            )}
          </>
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
                  {['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
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

        {/* old manual button location removed */}
        {manualMode && (
          <button
            type="button"
            onClick={() => setManualMode(false)}
            className={subtleLink + ' inline-block'}
          >
            ← Use address search
          </button>
        )}

        {resolvedAddress && !manualMode && (
          <div className="rounded-lg border border-[#1c4d9c]/30 bg-[#1c4d9c]/5 p-3 text-sm">
            <div className="text-xs font-bold uppercase tracking-wide text-[#1c4d9c]">
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

        <div className="flex w-full items-center gap-6 pt-4">
          <button type="button" onClick={onBack} className={subtleLink + " flex-shrink-0"}>
            ← Back
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={primaryButton + ' flex-1 !mx-0'}
            style={{ 
              background: "linear-gradient(to right, #0b1d36, #1c4d9c)",
              color: "#ffffff"
            }}
          >
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