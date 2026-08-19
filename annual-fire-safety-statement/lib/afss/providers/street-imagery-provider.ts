/**
 * AFSS — Street-level imagery provider interface and Mapillary impl.
 *
 * Mapillary Graph API v4. The library returns the thumbnail URL
 * directly via the `thumb_256_url` / `thumb_1024_url` / etc.
 * fields. We use the URLs returned by Mapillary and never
 * construct image URLs ourselves.
 *
 * Request fields:
 *   id
 *   sequence
 *   captured_at
 *   geometry
 *   computed_compass_angle
 *   thumb_256_url
 *   thumb_1024_url
 *   thumb_2048_url
 *   thumb_original_url
 *
 * Five distinct outcomes so engineering can audit the exact
 * condition and the customer sees the same fallback in every case:
 *   ok                       : usable image returned
 *   no_coverage              : 200 + zero usable images
 *   rate_limited             : HTTP 429
 *   configuration_error      : HTTP 401/403 (bad/missing token)
 *   provider_unavailable     : HTTP 5xx or network/DNS failure
 *   invalid_response         : 200 with malformed body
 */

export type StreetImageryResultStatus =
  | 'ok'
  | 'no_coverage'
  | 'rate_limited'
  | 'provider_unavailable'
  | 'configuration_error'
  | 'invalid_response';

export interface StreetImageResult {
  providerId: string;
  sequenceId?: string | null;
  capturedAt?: string | null;
  thumbUrl?: string | null;
  thumb256Url?: string | null;
  thumb1024Url?: string | null;
  thumb2048Url?: string | null;
  thumbOriginalUrl?: string | null;
  latitude: number;
  longitude: number;
  bearing?: number | null;
  rawJson?: Record<string, unknown>;
}

export interface StreetImageryLookupInput {
  latitude: number;
  longitude: number;
  radiusM?: number;
}

export type StreetImageryOutcome =
  | { status: 'ok'; image: StreetImageResult; radius_m: number }
  | {
      status: Exclude<StreetImageryResultStatus, 'ok'>;
      message: string;
      radius_m?: number;
      http_status?: number;
    };

export interface StreetImageryProvider {
  readonly name: string;
  findNearest(
    input: StreetImageryLookupInput
  ): Promise<StreetImageryOutcome>;
}

export const DEFAULT_SEARCH_RADII_M = [50, 100, 250] as const;

export class MapillaryStreetImageryProvider implements StreetImageryProvider {
  readonly name = 'mapillary';

  constructor(
    private readonly accessToken: string,
    private readonly apiBase = 'https://graph.mapillary.com'
  ) {}

  isConfigured(): boolean {
    return !!this.accessToken && this.accessToken.length >= 8;
  }

  async findNearest(
    input: StreetImageryLookupInput
  ): Promise<StreetImageryOutcome> {
    const { latitude, longitude } = input;
    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      isNaN(latitude) ||
      isNaN(longitude)
    ) {
      return {
        status: 'invalid_response',
        message: 'Coordinates missing or invalid.',
        http_status: 0,
      };
    }
    if (!this.isConfigured()) {
      return {
        status: 'configuration_error',
        message: 'Mapillary access token not configured.',
        http_status: 0,
      };
    }

    const fields = [
      'id',
      'sequence',
      'captured_at',
      'geometry',
      'computed_compass_angle',
      'thumb_256_url',
      'thumb_1024_url',
      'thumb_2048_url',
      'thumb_original_url',
    ];

    const radii = input.radiusM ? [input.radiusM] : [...DEFAULT_SEARCH_RADII_M];
    let lastCoverage: { radius: number; message: string } | null = null;

    for (const radius of radii) {
      const bbox = metersToBbox(latitude, longitude, radius);
      const search = new URLSearchParams({
        access_token: this.accessToken,
        fields: fields.join(','),
        bbox,
        limit: '10',
      });

      let listRes: Response;
      try {
        listRes = await fetch(`${this.apiBase}/images?${search.toString()}`, {
          method: 'GET',
          cache: 'no-store',
        });
      } catch (e: any) {
        return {
          status: 'provider_unavailable',
          message: `Network error: ${e?.message ?? 'unknown'}`,
          http_status: 0,
          radius_m: radius,
        };
      }

      // Distinguish rate-limit vs auth vs server error vs quota.
      if (listRes.status === 429) {
        return {
          status: 'rate_limited',
          message: 'Mapillary rate limit (HTTP 429).',
          http_status: 429,
          radius_m: radius,
        };
      }
      if (listRes.status === 401 || listRes.status === 403) {
        return {
          status: 'configuration_error',
          message: `Mapillary auth failure (HTTP ${listRes.status}).`,
          http_status: listRes.status,
          radius_m: radius,
        };
      }
      if (listRes.status >= 500) {
        return {
          status: 'provider_unavailable',
          message: `Mapillary server error (HTTP ${listRes.status}).`,
          http_status: listRes.status,
          radius_m: radius,
        };
      }
      if (!listRes.ok) {
        return {
          status: listRes.status === 0
            ? 'provider_unavailable'
            : 'invalid_response',
          message: `Mapillary returned HTTP ${listRes.status}.`,
          http_status: listRes.status,
          radius_m: radius,
        };
      }

      let list: { data?: any[] } | null = null;
      let rawBody = '';
      try {
        rawBody = await listRes.text();
        list = rawBody ? JSON.parse(rawBody) : null;
      } catch {
        return {
          status: 'invalid_response',
          message: 'Mapillary returned non-JSON body.',
          http_status: listRes.status,
          radius_m: radius,
        };
      }
      if (!list || !Array.isArray(list.data)) {
        // Mapillary's "reduce the amount of data" error comes back as
        // a 500 with a typed error body — distinguish that here.
        const raw: any = list;
        if (raw?.error) {
          return {
            status: 'provider_unavailable',
            message: `Mapillary error ${raw.error.code ?? ''} (HTTP ${listRes.status}): ${raw.error.message ?? ''}`,
            http_status: listRes.status,
            radius_m: radius,
          };
        }
        return {
          status: 'invalid_response',
          message: 'Mapillary response shape unexpected.',
          http_status: listRes.status,
          radius_m: radius,
        };
      }

      if (list.data.length === 0) {
        lastCoverage = { radius, message: 'Zero images in bbox.' };
        continue;
      }

      // Pick the closest.
      let best: { d: number; im: any } | null = null;
      for (const im of list.data) {
        const coords = im?.geometry?.coordinates;
        if (!Array.isArray(coords) || coords.length < 2) continue;
        const [lng, lat] = coords;
        if (typeof lat !== 'number' || typeof lng !== 'number') continue;
        const d = haversine(latitude, longitude, lat, lng);
        if (best === null || d < best.d) best = { d, im };
      }
      if (!best) {
        lastCoverage = {
          radius,
          message: 'No georeferenced images in bbox.',
        };
        continue;
      }

      const im = best.im;
      const coords = im.geometry?.coordinates ?? [];
      const image: StreetImageResult = {
        providerId: String(im.id ?? ''),
        sequenceId: im.sequence ?? null,
        capturedAt: im.captured_at ?? null,
        // These are the URL fields MAPILLARY returned. We use them
        // verbatim — NEVER construct image URLs ourselves.
        thumbUrl: im.thumb_1024_url ?? im.thumb_256_url ?? null,
        thumb256Url: im.thumb_256_url ?? null,
        thumb1024Url: im.thumb_1024_url ?? null,
        thumb2048Url: im.thumb_2048_url ?? null,
        thumbOriginalUrl: im.thumb_original_url ?? null,
        latitude: typeof coords[1] === 'number' ? coords[1] : latitude,
        longitude: typeof coords[0] === 'number' ? coords[0] : longitude,
        bearing:
          typeof im.computed_compass_angle === 'number'
            ? im.computed_compass_angle
            : null,
        rawJson: { distance_m: best.d, query_radius_m: radius },
      };
      return { status: 'ok', image, radius_m: radius };
    }

    return {
      status: 'no_coverage',
      message: lastCoverage?.message ?? 'No images within search radii.',
      radius_m: lastCoverage?.radius,
    };
  }
}

export function createStreetImageryProvider(): StreetImageryProvider | null {
  const token =
    process.env.MAPILLARY_ACCESS_TOKEN ||
    process.env.NEXT_PUBLIC_MAPILLARY_ACCESS_TOKEN ||
    '';
  if (!token || token.length < 8) return null;
  return new MapillaryStreetImageryProvider(token);
}

function haversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function metersToBbox(lat: number, lng: number, meters: number): string {
  // Approximate bounding box of `meters` metres around (lat, lng).
  const dLat = meters / 111_320;
  const dLng = meters / (111_320 * Math.max(Math.cos((lat * Math.PI) / 180), 0.01));
  const minLat = lat - dLat;
  const maxLat = lat + dLat;
  const minLng = lng - dLng;
  const maxLng = lng + dLng;
  return `${minLng},${minLat},${maxLng},${maxLat}`;
}
