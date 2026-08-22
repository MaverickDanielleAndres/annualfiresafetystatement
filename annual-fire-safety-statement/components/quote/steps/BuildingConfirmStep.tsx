'use client';

/**
 * Step 3 — "Is this your building?"
 *
 *   1. Read the saved property from /api/afss/quote/property-get.
 *   2. Use the browser-side Google Maps Street View Service to find
 *      the closest outdoor panorama to the property's lat/lng.
 *   3. Render an interactive StreetViewPanorama in a container,
 *      initialised with the panorama ID and pointed roughly at the
 *      building.
 *   4. POST the surfaced pano_id back to /api/afss/quote/street-image
 *      so the database records the metadata.
 *   5. On error / no coverage, fall back to a clean "building
 *      preview unavailable" state. The customer can still confirm.
 *   6. On "YES, THAT'S IT" → POST /api/afss/quote/confirm-building.
 *
 * This step is the only place in the customer flow that still calls
 * the Google Maps JS API. Address autocomplete and reverse geocoding
 * are handled by the Geoapify server-side proxies.
 */

import { useEffect, useRef, useState } from 'react';
import { primaryButton, subtleLink } from '../common';
import { api } from '../api';
import { useToaster } from '../Toast';
import {
  createPanorama,
  facePanoramaToTarget,
  findPanoramaNear,
  type PanoramaSearchResult,
} from '@/lib/google/street-view';
import { isGoogleMapsConfigured } from '@/lib/google/maps-loader';

interface Props {
  onConfirmed: () => void;
  onChange: () => void;
}

interface PropertySummary {
  formatted_address: string | null;
  address_line_1: string | null;
  suburb: string | null;
  state: string | null;
  postcode: string | null;
  latitude: number | null;
  longitude: number | null;
  street_image_provider?: string | null;
  street_image_id?: string | null;
  street_image_thumb_url?: string | null;
  building_confirmed?: boolean | null;
}

type State =
  | 'loading_property'
  | 'loading_image'
  | 'ready'
  | 'no_coverage'
  | 'rate_limited'
  | 'provider_unavailable'
  | 'configuration_error'
  | 'invalid_response'
  | 'error';

export default function BuildingConfirmStep({ onConfirmed, onChange }: Props) {
  const { push } = useToaster();
  const [property, setProperty] = useState<PropertySummary | null>(null);
  const [panoramaResult, setPanoramaResult] = useState<PanoramaSearchResult | null>(null);
  const [state, setState] = useState<State>('loading_property');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const panoramaRef = useRef<any>(null);
  const linksListenerRef = useRef<any>(null);
  const panoChangedListenerRef = useRef<any>(null);
  const positionChangedListenerRef = useRef<any>(null);
  const panoChangeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPersistedPanoRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const propRes = await api.get<{ property: PropertySummary | null }>(
          '/api/afss/quote/property-get'
        );
        if (cancelled) return;
        if (!propRes.ok || !propRes.data.property) {
          setState('error');
          setError(
            'We could not find the building details you saved. Please re-enter your address.'
          );
          return;
        }
        setProperty(propRes.data.property);
        if (
          !propRes.data.property.latitude ||
          !propRes.data.property.longitude
        ) {
          setState('no_coverage');
          return;
        }
        if (!isGoogleMapsConfigured()) {
          setState('configuration_error');
          return;
        }
        setState('loading_image');
        const result = await findPanoramaNear(
          propRes.data.property.latitude,
          propRes.data.property.longitude
        );
        if (cancelled) return;
        setPanoramaResult(result);
        if (result.status === 'ok') {
          setState('ready');
          // Persist the metadata server-side as soon as we know it.
          try {
            await api.post('/api/afss/quote/street-image', {
              pano_id: result.panoId,
              latitude: result.latitude,
              longitude: result.longitude,
              radius_m: result.radiusM,
            });
            lastPersistedPanoRef.current = result.panoId ?? null;
          } catch {
            // Non-fatal — the panorama still renders.
          }
          return;
        }
        if (result.status === 'no_coverage') setState('no_coverage');
        else if (result.status === 'rate_limited') setState('rate_limited');
        else if (result.status === 'provider_unavailable') setState('provider_unavailable');
        else if (result.status === 'configuration_error') setState('configuration_error');
        else if (result.status === 'invalid_response') setState('invalid_response');
        else setState('no_coverage');
      } catch {
        if (cancelled) return;
        setState('error');
        setError('Something went wrong while loading this step.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Mount the Street View panorama once the metadata is available
  // and the container is rendered.
  useEffect(() => {
    if (state !== 'ready') return;
    if (
      !panoramaResult ||
      panoramaResult.status !== 'ok' ||
      !panoramaResult.panoId
    ) {
      return;
    }
    if (!containerRef.current) return;
    if (!property?.latitude || !property?.longitude) return;

    let cancelled = false;
    (async () => {
      try {
        const panorama = await createPanorama(containerRef.current!, {
          panoId: panoramaResult.panoId,
          position: panoramaResult.latitude && panoramaResult.longitude
            ? {
                lat: panoramaResult.latitude,
                lng: panoramaResult.longitude,
              }
            : {
                lat: property.latitude!,
                lng: property.longitude!,
              },
          heading: 0,
          pitch: 0,
          zoom: 1,
        });
        if (cancelled) {
          try {
            panorama.setVisible?.(false);
          } catch {}
          return;
        }
        panoramaRef.current = panorama;

        // Aim the camera at the building.
        try {
          await facePanoramaToTarget(panorama, {
            lat: property.latitude!,
            lng: property.longitude!,
          });
        } catch {
          // Non-fatal — the panorama still renders.
        }

        // When the customer navigates to a neighbouring panorama,
        // persist the new pano_id so the audit trail is accurate.
        panoChangedListenerRef.current = panorama.addListener?.('pano_changed', () => {
          if (panoChangeTimeoutRef.current) clearTimeout(panoChangeTimeoutRef.current);
          panoChangeTimeoutRef.current = setTimeout(() => {
            const newPano = panorama.getPano?.();
            if (newPano && newPano !== lastPersistedPanoRef.current) {
              lastPersistedPanoRef.current = newPano;
              void api.post('/api/afss/quote/street-image', {
                pano_id: newPano,
                radius_m: panoramaResult.radiusM ?? null,
              });
            }
          }, 600);
        });
        positionChangedListenerRef.current = panorama.addListener?.(
          'position_changed',
          () => {
            const newPos = panorama.getPosition?.();
            if (!newPos) return;
            const lat = typeof newPos.lat === 'function' ? newPos.lat() : null;
            const lng = typeof newPos.lng === 'function' ? newPos.lng() : null;
            if (lat == null || lng == null) return;
            const currentPano = panorama.getPano?.();
            if (currentPano && currentPano !== lastPersistedPanoRef.current) {
              lastPersistedPanoRef.current = currentPano;
            }
            void api.post('/api/afss/quote/street-image', {
              pano_id: currentPano,
              latitude: lat,
              longitude: lng,
              radius_m: panoramaResult.radiusM ?? null,
            });
          }
        );
        linksListenerRef.current = panorama.addListener?.('links_changed', () => {
          // No-op placeholder — links are handled by the widget.
        });
      } catch (e: any) {
        if (cancelled) return;
        setState('provider_unavailable');
        push({
          kind: 'error',
          text: 'We could not load Street View.',
        });
      }
    })();

    return () => {
      cancelled = true;
      if (panoChangeTimeoutRef.current) {
        clearTimeout(panoChangeTimeoutRef.current);
        panoChangeTimeoutRef.current = null;
      }
      try {
        panoChangedListenerRef.current?.remove?.();
      } catch {}
      try {
        positionChangedListenerRef.current?.remove?.();
      } catch {}
      try {
        linksListenerRef.current?.remove?.();
      } catch {}
      panoChangedListenerRef.current = null;
      positionChangedListenerRef.current = null;
      linksListenerRef.current = null;
      if (panoramaRef.current) {
        try {
          panoramaRef.current.setVisible?.(false);
        } catch {}
        panoramaRef.current = null;
      }
    };
  }, [state, panoramaResult, property, push]);

  async function post(confirmed: boolean) {
    setSubmitting(true);
    setError(null);
    const res = await api.post<{ ok: boolean }>(
      '/api/afss/quote/confirm-building',
      { confirmed }
    );
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error);
      push({
        kind: 'error',
        title: 'Could not save',
        text: res.error,
      });
      return;
    }
    if (confirmed) {
      push({ kind: 'success', text: 'Building confirmed.' });
      onConfirmed();
    } else {
      onChange();
    }
  }

  const isFallback = state !== 'ready' && state !== 'loading_image' && state !== 'loading_property';

  return (
    <div className="mx-auto max-w-md">
      <h2 className="mb-2 text-2xl font-black uppercase tracking-tight text-black sm:text-3xl">
        Is this your building?
      </h2>
      <p className="mb-4 text-sm text-gray-600">
        {property?.formatted_address ?? 'Loading address…'}
      </p>

      <div className="relative mb-4 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
        {state === 'loading_property' || state === 'loading_image' ? (
          <div className="flex h-56 w-full items-center justify-center text-sm text-gray-500">
            <span>Loading Street View…</span>
          </div>
        ) : state === 'ready' ? (
          <div
            ref={containerRef}
            className="h-56 w-full sm:h-72"
            aria-label="Interactive Street View of your building"
            role="img"
          />
        ) : (
          <div className="flex h-56 w-full flex-col items-center justify-center gap-1 px-6 text-center text-sm text-gray-500">
            <strong className="text-base text-gray-700">
              Building preview unavailable
            </strong>
            <span>
              We found your address
              {state === 'no_coverage'
                ? ", but Google Street View isn't available for this location."
                : state === 'rate_limited'
                  ? ', but the imagery service is rate-limited. You can still continue.'
                  : state === 'provider_unavailable'
                    ? ', but the imagery service is unavailable. You can still continue.'
                    : state === 'configuration_error'
                      ? ", but the imagery service isn't configured. You can still continue."
                      : ' right now. You can still continue.'}
            </span>
            {property?.formatted_address && (
              <span className="mt-2 max-w-xs text-xs font-medium text-gray-700">
                {property.formatted_address}
              </span>
            )}
          </div>
        )}
      </div>

      {isFallback && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
          Street image unavailable. You can still continue.
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex w-full items-center gap-6 pt-4">
        <button
          type="button"
          disabled={submitting}
          onClick={() => post(false)}
          className={subtleLink + " flex-shrink-0"}
        >
          ← Change address
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={() => post(true)}
          className={primaryButton + ' flex-1 !mx-0 !text-[11px] leading-tight whitespace-nowrap'}
          style={{
            background: 'linear-gradient(to right, #0b1d36, #1c4d9c)',
            color: '#ffffff',
          }}
        >
          {isFallback
            ? 'Yes, this is the correct address →'
            : "Yes, that's it →"}
        </button>
      </div>
    </div>
  );
}
