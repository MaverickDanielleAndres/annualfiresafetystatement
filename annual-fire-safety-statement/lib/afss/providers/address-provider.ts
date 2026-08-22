/**
 * AFSS — Address provider abstraction (ACTIVE).
 *
 * The customer-facing instant quote flow now sources its Australian
 * addresses from **Geoapify** via two server-side proxies:
 *
 *   • GET /api/afss/quote/address-search  → Geoapify autocomplete
 *   • GET /api/afss/quote/address-resolve → Geoapify reverse geocoding
 *
 * The browser never holds a Geoapify key. Only `GEOAPIFY_API_KEY` (server)
 * is required; it is read by this module.
 *
 * IMPORTANT: This file is server-only. It is imported only by the two
 * Next.js API route handlers above, both of which declare
 * `runtime = 'nodejs'`. Client code MUST NOT import from this file —
 * doing so would leak `process.env.GEOAPIFY_API_KEY` into the browser
 * bundle.
 */

const DEFAULT_AUTOCOMPLETE_ENDPOINT =
  'https://api.geoapify.com/v1/geocode/autocomplete';
const DEFAULT_REVERSE_ENDPOINT =
  'https://api.geoapify.com/v1/geocode/reverse';

/**
 * The canonical address shape used by every AFSS wizard surface.
 * Always produced from a raw provider response by a `normalize…()`
 * function so that React components never see provider-specific
 * fields.
 */
export interface NormalizedAddress {
  /** Provider identity (always 'geoapify' in the active flow). */
  provider: 'geoapify';
  /** Provider's stable id for this place (place_id from Geoapify). */
  providerId?: string;
  /** Human-readable address as the provider returns it. */
  formattedAddress: string;
  addressLine1?: string | null;
  addressLine2?: string | null;
  street?: string | null;
  houseNumber?: string | null;
  suburb?: string | null;
  city?: string | null;
  state?: string | null;
  postcode?: string | null;
  country?: string | null;
  countryCode?: string | null;
  latitude: number;
  longitude: number;
  /** Raw provider payload for audit. Do not rely on shape. */
  raw?: unknown;
}

/**
 * UI-shaped suggestion (the dropdown rows). Built from a
 * NormalizedAddress; the autocomplete endpoint always returns enough
 * information to populate these without a follow-up round-trip.
 */
export interface AddressSuggestion {
  providerId: string;
  primaryText: string;
  secondaryText: string;
  fullText: string;
  address: NormalizedAddress;
}

/**
 * The contract every address provider must implement. The wizard
 * only ever talks to this interface — never to a concrete provider
 * directly.
 */
export interface AddressProvider {
  readonly name: 'geoapify';
  isConfigured(): boolean;
  autocomplete(
    query: string,
    opts?: { limit?: number; signal?: AbortSignal }
  ): Promise<NormalizedAddress[]>;
  reverseGeocode(input: {
    lat: number;
    lng: number;
    signal?: AbortSignal;
  }): Promise<NormalizedAddress | null>;
}

function readApiKey(): string {
  return (
    process.env.GEOAPIFY_API_KEY ||
    process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY ||
    ''
  );
}

/**
 * The active Geoapify implementation. The hard-coded
 * `countrycode:au` filter + bias keeps every customer result
 * Australian. The API key is read once per call (cheap) so a
 * hot-reloaded env change is picked up without restarting the
 * server.
 */
export class GeoapifyAddressProvider implements AddressProvider {
  readonly name = 'geoapify' as const;

  constructor(
    private readonly apiKey: string,
    private readonly autocompleteEndpoint = DEFAULT_AUTOCOMPLETE_ENDPOINT,
    private readonly reverseEndpoint = DEFAULT_REVERSE_ENDPOINT
  ) {}

  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.length >= 8;
  }

  async autocomplete(
    query: string,
    opts: { limit?: number; signal?: AbortSignal } = {}
  ): Promise<NormalizedAddress[]> {
    const trimmed = query.trim();
    if (trimmed.length < 3) return [];
    if (!this.isConfigured()) return [];

    const limit = Math.min(Math.max(opts.limit ?? 5, 1), 10);

    const url = new URL(this.autocompleteEndpoint);
    url.searchParams.set('text', trimmed);
    url.searchParams.set('filter', 'countrycode:au');
    url.searchParams.set('bias', 'countrycode:au');
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('lang', 'en');
    url.searchParams.set('apiKey', this.apiKey);

    try {
      const res = await fetch(url.toString(), {
        method: 'GET',
        cache: 'no-store',
        signal: opts.signal,
      });
      if (!res.ok) return [];
      const data = (await res.json()) as { results?: unknown[] };
      const results = Array.isArray(data.results) ? data.results : [];
      const out: NormalizedAddress[] = [];
      for (const r of results) {
        const norm = normalizeGeoapifyFeature(r);
        if (norm) out.push(norm);
      }
      return out;
    } catch (e) {
      if (isAbortError(e)) return [];
      return [];
    }
  }

  async reverseGeocode(input: {
    lat: number;
    lng: number;
    signal?: AbortSignal;
  }): Promise<NormalizedAddress | null> {
    if (!this.isConfigured()) return null;
    const { lat, lng, signal } = input;
    if (
      typeof lat !== 'number' ||
      typeof lng !== 'number' ||
      isNaN(lat) ||
      isNaN(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return null;
    }

    const url = new URL(this.reverseEndpoint);
    url.searchParams.set('lat', String(lat));
    url.searchParams.set('lon', String(lng));
    url.searchParams.set('format', 'json');
    url.searchParams.set('filter', 'countrycode:au');
    url.searchParams.set('lang', 'en');
    url.searchParams.set('limit', '1');
    url.searchParams.set('apiKey', this.apiKey);

    try {
      const res = await fetch(url.toString(), {
        method: 'GET',
        cache: 'no-store',
        signal,
      });
      if (!res.ok) return null;
      const data: unknown = await res.json().catch(() => null);
      const list: unknown[] = Array.isArray(data)
        ? (data as unknown[])
        : isObject(data) && Array.isArray((data as { results?: unknown[] }).results)
          ? (data as { results: unknown[] }).results
          : [];
      const first = list[0];
      return normalizeGeoapifyFeature(first) ?? null;
    } catch (e) {
      if (isAbortError(e)) return null;
      return null;
    }
  }
}

function isAbortError(e: unknown): boolean {
  return (
    !!e &&
    typeof e === 'object' &&
    (e as { name?: unknown }).name === 'AbortError'
  );
}

function isObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object';
}

/**
 * Normalises a single Geoapify feature (autocomplete or reverse
 * response) into the canonical `NormalizedAddress` shape.
 *
 * Geoapify's autocomplete and reverse endpoints share the same
 * per-result shape under `properties` (lat, lon, formatted,
 * address_line1, address_line2, suburb, city, state, state_code,
 * postcode, country, country_code, street, housenumber, place_id).
 *
 * If `properties` is missing entirely, we still try `geometry.coordinates`
 * (a GeoJSON-style [lon, lat] tuple) as a fallback for lat/lng.
 */
export function normalizeGeoapifyFeature(raw: unknown): NormalizedAddress | null {
  if (!isObject(raw)) return null;
  const r = raw;
  const p: Record<string, unknown> =
    isObject(r.properties) ? (r.properties as Record<string, unknown>) : r;

  const lat = typeof p.lat === 'number' ? p.lat : null;
  const lon = typeof p.lon === 'number' ? p.lon : null;

  let finalLat = lat;
  let finalLon = lon;
  if (
    (finalLat == null || finalLon == null) &&
    isObject(r.geometry) &&
    Array.isArray((r.geometry as { coordinates?: unknown }).coordinates)
  ) {
    const [maybeLon, maybeLat] = (r.geometry as { coordinates: unknown[] })
      .coordinates;
    if (typeof maybeLon === 'number' && typeof maybeLat === 'number') {
      finalLon = finalLon ?? maybeLon;
      finalLat = finalLat ?? maybeLat;
    }
  }

  if (finalLat == null || finalLon == null) return null;

  const formatted =
    typeof p.formatted === 'string' && p.formatted.trim()
      ? p.formatted.trim()
      : [
          [p.housenumber, p.street].filter(Boolean).join(' '),
          p.suburb ?? p.city ?? p.district,
          [p.state_code ?? p.state, p.postcode].filter(Boolean).join(' '),
          p.country,
        ]
          .filter(Boolean)
          .join(', ');

  const countryCode =
    typeof p.country_code === 'string' && p.country_code.trim()
      ? p.country_code.trim().toUpperCase()
      : 'AU';
  // Prefer the short ISO 3166-1 alpha-2 code (`AU`) over the long
  // name (`Australia`/`AUSTRALIA`). The DB CHECK requires
  // `country` to be exactly 2 characters.
  const country = countryCode;

  return {
    provider: 'geoapify',
    providerId:
      typeof p.place_id === 'string' && p.place_id
        ? p.place_id
        : undefined,
    formattedAddress: formatted,
    addressLine1:
      typeof p.address_line1 === 'string' && p.address_line1
        ? p.address_line1
        : typeof p.address_line2 === 'string' && p.address_line2
          ? p.address_line2
          : [p.housenumber, p.street].filter(Boolean).join(' ') || null,
    addressLine2:
      typeof p.address_line2 === 'string' && p.address_line2
        ? p.address_line2
        : null,
    street: typeof p.street === 'string' ? p.street : null,
    houseNumber: typeof p.housenumber === 'string' ? p.housenumber : null,
    suburb: typeof p.suburb === 'string' ? p.suburb : null,
    city: typeof p.city === 'string' ? p.city : null,
    state:
      typeof p.state_code === 'string'
        ? String(p.state_code).toUpperCase()
        : typeof p.state === 'string'
          ? String(p.state).toUpperCase()
          : null,
    postcode: typeof p.postcode === 'string' ? p.postcode : null,
    country,
    countryCode,
    latitude: finalLat,
    longitude: finalLon,
    raw,
  };
}

/**
 * Maps a `NormalizedAddress` to the dropdown's `AddressSuggestion`
 * shape (primary text + secondary text + full text + the underlying
 * normalized address).
 */
export function toSuggestion(a: NormalizedAddress): AddressSuggestion {
  const line1 =
    a.addressLine1 ||
    (a.houseNumber && a.street
      ? `${a.houseNumber} ${a.street}`.trim()
      : a.street || '');
  const suburbStatePostcode = [a.suburb || a.city, a.state, a.postcode]
    .filter(Boolean)
    .join(', ');
  return {
    providerId: a.providerId ?? '',
    primaryText: line1 || a.formattedAddress,
    secondaryText: suburbStatePostcode,
    fullText: a.formattedAddress,
    address: a,
  };
}

let cached: AddressProvider | null = null;

/**
 * Returns a process-wide singleton of the Geoapify address provider
 * if `GEOAPIFY_API_KEY` is configured. Returns `null` otherwise so
 * callers can decide how to surface the missing-config state.
 */
export function createAddressProvider(): AddressProvider | null {
  if (cached) return cached;
  const apiKey = readApiKey();
  if (!apiKey) return null;
  cached = new GeoapifyAddressProvider(apiKey);
  return cached;
}

/**
 * True iff `GEOAPIFY_API_KEY` (or the public variant) is configured.
 * Safe to call in any environment.
 */
export function isAddressProviderConfigured(): boolean {
  return readApiKey().length >= 8;
}