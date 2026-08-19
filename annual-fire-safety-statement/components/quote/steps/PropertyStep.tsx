'use client';

import { useEffect, useRef, useState } from 'react';
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

interface PlaceSuggestion {
  place_id: string;
  description: string;
  structured_formatting?: { main_text?: string; secondary_text?: string };
}

interface ResolvedPlace {
  google_place_id: string;
  formatted_address: string;
  address_line_1: string | null;
  suburb: string | null;
  state: string | null;
  postcode: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
}

declare global {
  interface Window {
      google?: any;
  }
}

export default function PropertyStep({ onSaved, onBack }: Props) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [selected, setSelected] = useState<ResolvedPlace | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY;
  const autocompleteSessionRef = useRef<any>(null);

  useEffect(() => {
    if (!apiKey) return; // No browser key → user types manually.
    // Lazy-load the Maps JS library once.
    if (typeof window === 'undefined') return;
    if (window.google?.maps?.places) return;
    const existing = document.getElementById('google-maps-js');
    if (existing) return;
    const s = document.createElement('script');
    s.id = 'google-maps-js';
    s.async = true;
    s.defer = true;
    s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
    document.head.appendChild(s);
  }, [apiKey]);

  async function fetchSuggestions(q: string) {
    if (!apiKey || !window.google?.maps?.places) return;
    if (!autocompleteSessionRef.current) {
      // @ts-ignore
      autocompleteSessionRef.current =
        new window.google.maps.places.AutocompleteSessionToken();
    }
    // @ts-ignore
    const { suggestions: results } =
      await window.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(
        {
          input: q,
          sessionToken: autocompleteSessionRef.current,
          includedRegionCodes: ['AU'],
        }
      );
    setSuggestions(
      (results ?? []).map((r: any) => ({
        place_id: r.placePrediction.placeId,
        description: r.placePrediction.text?.text ?? '',
        structured_formatting: {
          main_text: r.placePrediction.mainText?.text,
          secondary_text: r.placePrediction.secondaryText?.text,
        },
      }))
    );
  }

  async function resolvePlace(placeId: string) {
    if (!window.google?.maps?.places) return null;
    // @ts-ignore
    const { places } = await window.google.maps.places.PlacesService;
    // Fallback approach via PlacesService (or use a temporary div):
    const div = document.createElement('div');
    // @ts-ignore
    const svc = new window.google.maps.places.PlacesService(div);
    return new Promise<ResolvedPlace | null>((resolve) => {
      svc.getDetails(
        {
          placeId,
          fields: [
            'place_id',
            'formatted_address',
            'address_component',
            'geometry',
          ],
          sessionToken: autocompleteSessionRef.current,
        },
        (place: any, status: any) => {
          if (status !== 'OK' || !place) return resolve(null);
          const comps = place.address_components ?? [];
          const streetNumber = comps.find((c: any) => c.types.includes('street_number'))?.long_name;
          const route = comps.find((c: any) => c.types.includes('route'))?.long_name;
          resolve({
            google_place_id: place.place_id,
            formatted_address: place.formatted_address ?? '',
            address_line_1: [streetNumber, route].filter(Boolean).join(' ') || null,
            suburb:
              comps.find((c: any) => c.types.includes('locality'))?.long_name ??
              comps.find((c: any) => c.types.includes('postal_town'))?.long_name ??
              null,
            state:
              comps.find((c: any) =>
                c.types.includes('administrative_area_level_1')
              )?.short_name ?? null,
            postcode:
              comps.find((c: any) => c.types.includes('postal_code'))?.long_name ??
              null,
            country:
              comps.find((c: any) => c.types.includes('country'))?.short_name ??
              'AU',
            latitude: place.geometry?.location?.lat() ?? null,
            longitude: place.geometry?.location?.lng() ?? null,
          });
        }
      );
    });
  }

  async function handleSelect(s: PlaceSuggestion) {
    setError(null);
    setSuggestions([]);
    setQuery(s.description);

    if (!apiKey) {
      // Without a Google key, fall back to manual entry.
      setSelected({
        google_place_id: '',
        formatted_address: s.description,
        address_line_1: s.description,
        suburb: null,
        state: null,
        postcode: null,
        country: 'AU',
        latitude: null,
        longitude: null,
      });
      return;
    }

    const place = await resolvePlace(s.place_id);
    if (!place) {
      setError('Could not retrieve that address. Please type it manually.');
      return;
    }
    setSelected(place);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!selected && !query.trim()) {
      setError('Please select an address from the suggestions.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/afss/quote/property', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(
          selected ?? {
            formatted_address: query,
            google_place_id: null,
          }
        ),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Please check the address.');
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

  return (
    <div className="mx-auto max-w-md">
      <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#fb5614]">
        Step 2 of 6
      </p>
      <h2 className="mb-2 text-2xl font-black uppercase tracking-tight text-black sm:text-3xl">
        Where&apos;s the building?
      </h2>
      <p className="mb-6 text-sm text-gray-600">
        Start typing — pick an Australian address from the list.
      </p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Field label="Address">
          <input
            type="text"
            autoComplete="off"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (apiKey) void fetchSuggestions(e.target.value);
            }}
            className={inputClass}
            placeholder="Start typing your address…"
          />
          {!apiKey && (
            <p className="mt-1 text-xs text-gray-400">
              Address autocomplete is unavailable in this environment. You can
              still type the address manually.
            </p>
          )}
          {suggestions.length > 0 && (
            <ul className="mt-2 max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-sm">
              {suggestions.map((s) => (
                <li key={s.place_id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(s)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    {s.description}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Field>

        {selected && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
            <div className="font-semibold">Selected</div>
            <div>{selected.formatted_address}</div>
          </div>
        )}

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