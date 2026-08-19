'use client';

import { useEffect, useState } from 'react';
import { primaryButton, secondaryButton, subtleLink } from '../common';
import { api } from '../api';
import { useToaster } from '../Toast';

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
}

interface StreetImageResult {
  providerId: string;
  latitude: number;
  longitude: number;
  sequenceId?: string | null;
  capturedAt?: string | null;
  /** The URL Mapillary returned verbatim for this image. */
  thumbUrl?: string | null;
  thumb256Url?: string | null;
  thumb1024Url?: string | null;
  thumb2048Url?: string | null;
  thumbOriginalUrl?: string | null;
  bearing?: number | null;
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

/**
 * Step 3 — "Is this your building?"
 *
 * Flow:
 *   1. Fetch current session's saved property (formatted address
 *      + coordinates).
 *   2. Call /api/afss/quote/street-image (server-side Mapillary).
 *      * If an image is returned → render it.
 *      * If not → show a clear "preview unavailable" fallback,
 *        still letting the customer confirm the address.
 *   3. On confirm, POST /api/afss/quote/confirm-building=true.
 */
export default function BuildingConfirmStep({ onConfirmed, onChange }: Props) {
  const { push } = useToaster();
  const [property, setProperty] = useState<PropertySummary | null>(null);
  const [image, setImage] = useState<StreetImageResult | null>(null);
  const [state, setState] = useState<State>('loading_property');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          setError('We could not find the building details you saved. Please re-enter your address.');
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
        setState('loading_image');
        const imgRes = await api.get<{
          status?:
            | 'ok'
            | 'no_coverage'
            | 'rate_limited'
            | 'provider_unavailable'
            | 'configuration_error'
            | 'invalid_response';
          image?: StreetImageResult | null;
          reason?: string;
        }>('/api/afss/quote/street-image');
        if (cancelled) return;
        if (!imgRes.ok || !imgRes.data.status) {
          setState('error');
          setError('We could not load street imagery for this address.');
          return;
        }
        const status = imgRes.data.status;
        if (status === 'ok' && imgRes.data.image) {
          setImage(imgRes.data.image);
          setState('ready');
          return;
        }
        if (status === 'no_coverage') setState('no_coverage');
        else if (status === 'rate_limited') setState('rate_limited');
        else if (status === 'provider_unavailable') setState('provider_unavailable');
        else if (status === 'configuration_error') setState('configuration_error');
        else if (status === 'invalid_response') setState('invalid_response');
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

  return (
    <div className="mx-auto max-w-md">
      <h2 className="mb-2 text-2xl font-black uppercase tracking-tight text-black sm:text-3xl">
        Is this your building?
      </h2>
      <p className="mb-4 text-sm text-gray-600">
        {property?.formatted_address ?? 'Loading address…'}
      </p>

      <div className="mb-4 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
        {state === 'loading_property' || state === 'loading_image' ? (
          <div className="flex h-56 w-full items-center justify-center text-sm text-gray-500">
            <span>Finding street imagery…</span>
          </div>
        ) : state === 'ready' && (image?.thumb1024Url || image?.thumbUrl || image?.thumb256Url || image?.thumbOriginalUrl) ? (
          // The image element uses the EXACT URL Mapillary returned.
          // We never construct an image URL ourselves.
          <img
            src={
              image.thumb1024Url ||
              image.thumbUrl ||
              image.thumb256Url ||
              image.thumbOriginalUrl ||
              ''
            }
            alt="Nearest street-level image of your building"
            className="h-56 w-full object-cover"
            loading="lazy"
            onError={() => {
              // Fallback: show the building-preview-unavailable
              // state cleanly if the CDN image fails to load.
              setImage(null);
              setState('provider_unavailable');
            }}
          />
        ) : state === 'ready' && image ? (
          <div className="flex h-56 w-full flex-col items-center justify-center gap-1 px-6 text-center text-sm text-gray-500">
            <strong className="text-base text-gray-700">
              Image rendered from ID only
            </strong>
            <span className="text-xs">
              Mapillary returned an image but no thumb URL.
            </span>
          </div>
        ) : (
          <div className="flex h-56 w-full flex-col items-center justify-center gap-1 px-6 text-center text-sm text-gray-500">
            <strong className="text-base text-gray-700">
              Building preview unavailable
            </strong>
            <span>
              We found your address
              {state === 'no_coverage'
                ? ', but street imagery isn’t available here.'
                : state === 'rate_limited'
                  ? ', but the imagery service is rate-limited. You can still continue.'
                  : state === 'provider_unavailable'
                    ? ', but the imagery service is unavailable. You can still continue.'
                    : state === 'configuration_error'
                      ? ', but the imagery service is misconfigured. You can still continue.'
                      : ' right now. You can still continue.'}
            </span>
          </div>
        )}
      </div>

      {(state === 'no_coverage' ||
        state === 'rate_limited' ||
        state === 'provider_unavailable' ||
        state === 'configuration_error' ||
        state === 'invalid_response') && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
          Street image unavailable. You can still continue.
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="pt-4 flex items-center justify-center gap-6">
        <button
          type="button"
          disabled={submitting}
          onClick={() => post(false)}
          className={subtleLink}
        >
          ← Back
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={() => post(true)}
          className={primaryButton + ' !mx-0'}
          style={{ background: "linear-gradient(to right, #ff5614, #ffad05)", color: "#ffffff" }}
        >
          {state === 'no_coverage' ||
          state === 'rate_limited' ||
          state === 'provider_unavailable' ||
          state === 'configuration_error' ||
          state === 'invalid_response'
            ? 'Yes, this is the correct address →'
            : "Yes, that's it →"}
        </button>
      </div>
    </div>
  );
}
