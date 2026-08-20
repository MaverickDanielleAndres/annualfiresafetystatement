/**
 * AFSS — Street-level imagery provider (DEPRECATED).
 *
 * The active customer-facing flow now uses Google Street View
 * directly in the browser (see lib/google/street-view.ts). Server-
 * side call to Google Street View Metadata API is performed in
 * /api/afss/quote/street-image/route.ts.
 *
 * The original Mapillary implementation is preserved below for
 * reference. It is NOT wired into the customer flow.
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

/**
 * DEPRECATED — Mapillary implementation retained for reference only.
 * NOT used by the customer flow.
 */
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
    return {
      status: 'provider_unavailable',
      message: 'Mapillary is no longer used by the AFSS instant quote.',
      http_status: 0,
    };
  }
}

/**
 * DEPRECATED — returns null so any caller-side wiring that imports
 * this getter gracefully no-ops.
 */
export function createStreetImageryProvider(): StreetImageryProvider | null {
  return null;
}
