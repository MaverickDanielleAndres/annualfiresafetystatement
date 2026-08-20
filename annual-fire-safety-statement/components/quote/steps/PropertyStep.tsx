'use client';

/**
 * Step 2 — Australian building address.
 *
 *   ┌─────────────────────────────────────────────────────────────┐
 *   │  Google Places API (New) autocomplete        — browser-side  │
 *   │  Browser Geolocation + Google Geocoder       — "Use my loc"  │
 *   │  Save to existing POST /api/afss/quote/property             │
 *   └─────────────────────────────────────────────────────────────┘
 *
 * The browser holds the API key via NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
 * Google Cloud restrictions (HTTP referrer + enabled APIs) are the
 * security boundary. We never call any Geoapify / Mapillary
 * endpoint from the customer flow.
 */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Field, inputClass, primaryButton, secondaryButton, subtleLink } from '../common';
import { api } from '../api';
import { useToaster } from '../Toast';
import type { QuoteSessionSummary } from '@/lib/afss/types';
import type { NormalisedAddress } from '@/lib/google/places';
import {
  fetchAddressSuggestions,
  fetchPlaceDetails,
  resetSession,
} from '@/lib/google/places';
import { reverseGeocode } from '@/lib/google/geocoder';
import { isGoogleMapsConfigured } from '@/lib/google/maps-loader';

interface Props {
  onSaved: (s: QuoteSessionSummary | null) => void;
  onBack: () => void;
}

interface Suggestion {
  id: string;
  primaryText: string;
  secondaryText: string;
  fullText: string;
}

type LocationState =
  | 'idle'
  | 'requesting'
  | 'locating'
  | 'reverse_geocoding'
  | 'found'
  | 'permission_denied'
  | 'unavailable'
  | 'timeout'
  | 'low_accuracy'
  | 'error';

interface LocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
  accuracyLabel: 'good' | 'approximate' | 'low';
  address: NormalisedAddress;
}

interface DropdownPos {
  left: number;
  top: number;
  width: number;
}

const MIN_QUERY_LEN = 3;
const DEBOUNCE_MS = 280;

export default function PropertyStep({ onSaved, onBack }: Props) {
  const { push } = useToaster();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [highlighted, setHighlighted] = useState<number>(-1);
  const [resolvedAddress, setResolvedAddress] = useState<NormalisedAddress | null>(null);
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

  // "Use my location" state
  const [locationState, setLocationState] = useState<LocationState>('idle');
  const [locationResult, setLocationResult] = useState<LocationResult | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [refiningFromLocation, setRefiningFromLocation] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestSeq = useRef(0);
  const mapsConfigured = useMemo(() => isGoogleMapsConfigured(), []);

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
  }, [query]);

  async function fetchSuggestions(q: string) {
    const seq = ++requestSeq.current;
    setLoading(true);
    setError(null);
    try {
      const list = await fetchAddressSuggestions(q, {
        locationBias: locationResult
          ? { lat: locationResult.latitude, lng: locationResult.longitude }
          : null,
      });
      if (seq !== requestSeq.current) return;
      setLoading(false);
      const mapped: Suggestion[] = list.map((s) => ({
        id: s.providerId,
        primaryText: s.primaryText,
        secondaryText: s.secondaryText,
        fullText: s.fullText,
      }));
      setSuggestions(mapped);
      setShowDropdown(mapped.length > 0);
      setHighlighted(-1);
      if (mapped.length === 0) {
        // Not fatal — the input remains live, just no suggestions.
      }
    } catch (e: any) {
      if (seq !== requestSeq.current) return;
      setLoading(false);
      setSuggestions([]);
      setShowDropdown(false);
      push({
        kind: 'warning',
        title: 'Address lookup',
        text:
          e?.message ||
          "We couldn't load address suggestions. Please check your connection or try again.",
      });
    }
  }

  async function selectSuggestion(idx: number) {
    const s = suggestions[idx];
    if (!s) return;
    setError(null);
    setSuggestions([]);
    setShowDropdown(false);
    setQuery(s.fullText);
    setLoading(true);
    try {
      const resolved = await fetchPlaceDetails(s.id, {
        primaryText: s.primaryText,
        secondaryText: s.secondaryText,
        fullText: s.fullText,
      });
      setLoading(false);
      if (!resolved) {
        setError('We could not resolve that address. Please try again.');
        return;
      }
      setResolvedAddress(resolved);
      push({ kind: 'success', text: 'Address found.' });
    } catch (e: any) {
      setLoading(false);
      push({
        kind: 'error',
        title: 'Address lookup',
        text: e?.message ?? 'We could not resolve that address.',
      });
    }
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
        try {
          const addr = await reverseGeocode(lat, lng);
          if (!addr) {
            setLocationState('error');
            setLocationError('We found your coordinates but could not resolve an Australian address.');
            return;
          }
          setLocationResult({
            latitude: lat,
            longitude: lng,
            accuracy,
            accuracyLabel,
            address: addr,
          });
          setLocationState('found');
        } catch (e: any) {
          setLocationState('error');
          setLocationError(
            e?.message ?? 'We could not reverse-geocode your location.'
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
          google_place_id: null,
        }
      : resolvedAddress
        ? {
            address_provider: 'google',
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
            google_place_id: resolvedAddress.providerId,
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
          Powered by Google
        </li>
      </ul>
    );
  }, [showDropdown, pos, suggestions, highlighted, query, loading]);

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

      {!mapsConfigured && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          (Developer) Google Maps API key is not configured. Add
          <span className="mx-1 font-mono">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</span>
          to your environment.
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
                  disabled={!mapsConfigured}
                />
                {loading && (
                  <span className="mt-1 block text-xs text-gray-400">Searching…</span>
                )}
              </div>
            </Field>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={useMyLocationDisabled || !mapsConfigured}
                className={secondaryButton + ' inline-flex items-center justify-center gap-2'}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
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
              {refiningFromLocation && (
                <span className="text-xs text-gray-500">
                  Refine the address below.
                </span>
              )}
            </div>

            {locationState === 'requesting' && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                Asking your browser for your location…
              </div>
            )}
            {locationState === 'locating' && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                Locating…
              </div>
            )}
            {locationState === 'reverse_geocoding' && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                Resolving the nearest Australian address…
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
                  Approximate accuracy: <strong>{Math.round(locationResult.accuracy)} m</strong>
                  {locationResult.accuracyLabel === 'good' && ' — good'}
                  {locationResult.accuracyLabel === 'approximate' && ' — approximate'}
                  {locationResult.accuracyLabel === 'low' && ' — low accuracy'}
                </div>
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

        {!manualMode && !resolvedAddress && !locationResult && (
          <button
            type="button"
            onClick={() => setManualMode(true)}
            className={subtleLink + ' inline-block'}
          >
            Or enter address manually →
          </button>
        )}
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

        <div className="flex items-center justify-center gap-6 pt-4">
          <button type="button" onClick={onBack} className={subtleLink}>
            ← Back
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={primaryButton + ' !mx-0'}
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
