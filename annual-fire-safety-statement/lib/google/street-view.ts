/**
 * AFSS — Google Street View (browser-side) helpers.
 *
 * This is the ONLY piece of the customer flow that still talks to
 * Google. After the 2026 provider migration:
 *
 *   • Address autocomplete  → Geoapify (server-side proxy)
 *   • Reverse geocoding      → Geoapify (server-side proxy)
 *   • Building imagery       → Google Street View (this file)
 *
 *   * `findPanoramaNear(lat, lng)` — uses `StreetViewService.getPanorama`
 *     with progressive radii to find the closest outdoor panorama.
 *   * `createPanorama(container, options)` — instantiates a
 *     `StreetViewPanorama` in a container element with sensible
 *     initial heading/pitch/zoom.
 *   * `facePanoramaToTarget(panorama, target)` — uses
 *     `google.maps.geometry.spherical.computeHeading` so the camera
 *     naturally faces the customer's building.
 *
 * No Street View image bytes are fetched or cached by AFSS. The
 * standalone `StreetViewPanorama` widget renders Google's imagery
 * directly through the Google Maps JS API.
 */

import { getBrowserApiKey, importGoogleLibrary, loadGoogleMaps } from './maps-loader';

export const DEFAULT_SEARCH_RADII_M = [25, 50, 100, 250] as const;

export interface PanoramaSearchResult {
  status: 'ok' | 'no_coverage' | 'rate_limited' | 'configuration_error' | 'provider_unavailable' | 'invalid_response';
  panoId?: string;
  latitude?: number;
  longitude?: number;
  radiusM?: number;
  message?: string;
}

export interface PanoramaCreateOptions {
  panoId?: string;
  position?: { lat: number; lng: number };
  heading?: number;
  pitch?: number;
  zoom?: number;
  /** Disable the native close-link / map-link controls if you want a clean look. */
  disableDefaultUI?: boolean;
  addressControl?: boolean;
  showRoadLabels?: boolean;
}

/**
 * Looks up the closest Google Street View panorama near a lat/lng.
 * Tries progressively wider radii; returns the first OK answer.
 */
export async function findPanoramaNear(
  latitude: number,
  longitude: number,
  radii: number[] = Array.from(DEFAULT_SEARCH_RADII_M)
): Promise<PanoramaSearchResult> {
  if (
    typeof latitude !== 'number' ||
    typeof longitude !== 'number' ||
    isNaN(latitude) ||
    isNaN(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return { status: 'invalid_response', message: 'Coordinates missing or invalid.' };
  }

  const apiKey = getBrowserApiKey();
  if (!apiKey) {
    return { status: 'configuration_error', message: 'Google Maps API key not configured.' };
  }

  const google = await loadGoogleMaps({ apiKey });
  const streetView = await importGoogleLibrary(google, 'streetView');
  const StreetViewService = (streetView as any).StreetViewService;
  if (!StreetViewService) {
    return { status: 'configuration_error', message: 'StreetViewService unavailable.' };
  }

  const service = new StreetViewService();

  let lastCoverage: PanoramaSearchResult | null = null;
  for (const radius of radii) {
    try {
      const response: any = await service.getPanorama({
        location: { lat: latitude, lng: longitude },
        radius,
        preference: 'nearest',
        source: 'outdoor',
      });

      const status = response?.status ?? 'UNKNOWN';
      if (status === 'OK' && response?.data) {
        const pos = response.data.location?.latLng;
        const lat = pos && typeof pos.lat === 'function' ? pos.lat() : null;
        const lng = pos && typeof pos.lng === 'function' ? pos.lng() : null;
        return {
          status: 'ok',
          panoId: response.data.location?.pano ?? null,
          latitude: lat ?? undefined,
          longitude: lng ?? undefined,
          radiusM: radius,
        };
      }
      if (status === 'ZERO_RESULTS') {
        lastCoverage = {
          status: 'no_coverage',
          radiusM: radius,
          message: 'No panoramas within radius.',
        };
        continue;
      }
      if (status === 'OVER_QUERY_LIMIT' || status === 'OVER_DAILY_LIMIT') {
        return {
          status: 'rate_limited',
          radiusM: radius,
          message: `Street View quota (${status}).`,
        };
      }
      if (status === 'REQUEST_DENIED') {
        return {
          status: 'configuration_error',
          radiusM: radius,
          message: 'Street View request denied (key not authorised).',
        };
      }
      if (status === 'UNKNOWN_ERROR') {
        return {
          status: 'provider_unavailable',
          radiusM: radius,
          message: 'Street View unknown error.',
        };
      }
      lastCoverage = {
        status: 'no_coverage',
        radiusM: radius,
        message: `Street View status: ${status}`,
      };
    } catch (e: any) {
      return {
        status: 'provider_unavailable',
        radiusM: radius,
        message: e?.message ?? 'Street View network error.',
      };
    }
  }

  return lastCoverage ?? { status: 'no_coverage', message: 'No panoramas found.' };
}

/**
 * Creates a Google Street View panorama in a container element.
 * Returns the panorama instance so the caller can attach event
 * listeners. The panorama is set to immediate rendering mode
 * (no full Google Maps map around it).
 */
export async function createPanorama(
  container: HTMLElement,
  options: PanoramaCreateOptions = {}
): Promise<any> {
  const apiKey = getBrowserApiKey();
  if (!apiKey) {
    throw new Error('Google Maps API key not configured.');
  }

  const google = await loadGoogleMaps({ apiKey });
  const streetView = await importGoogleLibrary(google, 'streetView');
  const StreetViewPanorama = (streetView as any).StreetViewPanorama;
  if (!StreetViewPanorama) {
    throw new Error('StreetViewPanorama unavailable.');
  }

  const panorama = new StreetViewPanorama(container, {
    position: options.position,
    pano: options.panoId,
    heading: options.heading ?? 0,
    pitch: options.pitch ?? 0,
    zoom: options.zoom ?? 1,
    addressControl: options.addressControl ?? false,
    showRoadLabels: options.showRoadLabels ?? true,
    linksControl: true,
    panControl: true,
    enableCloseButton: false,
    fullscreenControl: false,
    motionTracking: false,
    visible: true,
  });

  return panorama;
}

/**
 * Sets the panorama's position and points its heading toward the
 * supplied target coordinates. Safe to call after instantiation.
 */
export async function facePanoramaToTarget(
  panorama: any,
  target: { lat: number; lng: number }
): Promise<void> {
  if (!panorama) return;

  const apiKey = getBrowserApiKey();
  if (!apiKey) return;
  const google = await loadGoogleMaps({ apiKey });
  const geometry = await importGoogleLibrary(google, 'geometry');

  const panoPos = panorama.getPosition?.();
  if (!panoPos) return;

  const lat = typeof panoPos.lat === 'function' ? panoPos.lat() : null;
  const lng = typeof panoPos.lng === 'function' ? panoPos.lng() : null;
  if (lat == null || lng == null) return;

  const heading = geometry.spherical.computeHeading(
    new google.LatLng(lat, lng),
    new google.LatLng(target.lat, target.lng)
  );
  panorama.setPov({ heading, pitch: 0, zoom: 1 });
}
