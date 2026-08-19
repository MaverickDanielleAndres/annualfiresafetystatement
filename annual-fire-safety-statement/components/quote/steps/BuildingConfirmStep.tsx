'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Field,
  inputClass,
  primaryButton,
} from './ContactStep';

interface Props {
  onConfirmed: () => void;
  onChange: () => void;
}

export default function BuildingConfirmStep({ onConfirmed, onChange }: Props) {
  const [address, setAddress] = useState<string | null>(null);
  const [panoId, setPanoId] = useState<string | null>(null);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY;
  const mapDivRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/afss/quote/property', {
          method: 'GET',
        });
        // The property endpoint is POST-only — fetch the status instead.
        const status = await fetch('/api/afss/quote/status').then((r) => r.json());
        // We don't get property from status; fall through to property GET
        // (we'll add one if needed). For now, fetch from a dedicated GET.
        const propRes = await fetch('/api/afss/quote/property-get').then((r) => r.json()).catch(() => null);
        if (cancelled) return;
        setAddress(propRes?.property?.formatted_address ?? null);
        setLat(propRes?.property?.latitude ?? null);
        setLng(propRes?.property?.longitude ?? null);
        setPanoId(propRes?.property?.streetview_pano_id ?? null);
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Lazy-load Maps JS for Street View.
  useEffect(() => {
    if (!apiKey) return;
    if (typeof window === 'undefined') return;
    if (window.google?.maps) return;
    const existing = document.getElementById('google-maps-js');
    if (existing) return;
    const s = document.createElement('script');
    s.id = 'google-maps-js';
    s.async = true;
    s.defer = true;
    s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
    document.head.appendChild(s);
  }, [apiKey]);

  useEffect(() => {
    if (!apiKey || !lat || !lng || !mapDivRef.current) return;
    if (!window.google?.maps) return;
    // @ts-ignore
    const sv = new window.google.maps.StreetViewPanorama(mapDivRef.current, {
      position: { lat, lng },
      pov: { heading: 0, pitch: 0 },
      visible: true,
      addressControl: false,
      motionTracking: false,
    });
    // @ts-ignore
    const map = new window.google.maps.Map(document.createElement('div'), {
      center: { lat, lng },
      zoom: 18,
      streetView: sv,
      disableDefaultUI: true,
    });
    return () => {
      // @ts-ignore
      sv.setVisible(false);
    };
  }, [apiKey, lat, lng]);

  async function post(confirmed: boolean) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/afss/quote/confirm-building', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ confirmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed.');
        setSubmitting(false);
        return;
      }
      if (confirmed) onConfirmed();
      else onChange();
    } catch {
      setError('Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#fb5614]">
        Step 3 of 6
      </p>
      <h2 className="mb-2 text-2xl font-black uppercase tracking-tight text-black sm:text-3xl">
        Is this your building?
      </h2>
      <p className="mb-4 text-sm text-gray-600">{address}</p>

      <div className="mb-4 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
        {apiKey && lat && lng ? (
          <div
            ref={mapDivRef}
            className="h-56 w-full"
            aria-label="Street View of the building"
          />
        ) : (
          <div className="flex h-56 w-full items-center justify-center px-6 text-center text-sm text-gray-500">
            {apiKey
              ? 'Loading Street View…'
              : 'Street View preview is unavailable in this environment.'}
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <button
          type="button"
          disabled={submitting}
          onClick={() => post(true)}
          className={primaryButton}
        >
          {submitting ? 'Saving…' : 'Yes, that\'s it →'}
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={() => post(false)}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base font-bold uppercase tracking-widest text-gray-700 transition-all hover:bg-gray-50"
        >
          Change address
        </button>
      </div>
    </div>
  );
}