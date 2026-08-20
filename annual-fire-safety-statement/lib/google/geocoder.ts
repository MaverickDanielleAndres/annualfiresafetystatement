/**
 * AFSS — Google Maps Geocoder (browser-side).
 *
 * Reverse geocoding for the "Use my location" flow.
 * The browser calls Google directly; the API key is restricted by
 * Google Cloud (HTTP referrer + Geocoding API).
 *
 * The returned address is normalised into the SAME shape produced
 * by Google Places autocomplete (`NormalisedAddress`), so the rest
 * of the wizard does not care which path the customer used.
 */

import { getBrowserApiKey, importGoogleLibrary, loadGoogleMaps } from './maps-loader';
import type { NormalisedAddress } from './places';

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<NormalisedAddress | null> {
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
    return null;
  }
  const apiKey = getBrowserApiKey();
  if (!apiKey) return null;

  const google = await loadGoogleMaps({ apiKey });
  const geocoding = await importGoogleLibrary(google, 'geocoding');
  const Geocoder = (geocoding as any).Geocoder;
  if (!Geocoder) return null;

  const geocoder = new Geocoder();
  const response: any = await geocoder.geocode({ location: { lat: latitude, lng: longitude } });
  if (!response || response.status !== 'OK' || !Array.isArray(response.results)) {
    return null;
  }

  // Pick the most specific AU result for an Australian address.
  const auResult =
    response.results.find((r: any) =>
      Array.isArray(r.address_components) &&
      r.address_components.some(
        (c: any) =>
          Array.isArray(c.types) && c.types.includes('country') && c.short_name === 'AU'
      )
    ) ?? response.results[0];

  if (!auResult) return null;

  return normaliseGeocodeResult(auResult, latitude, longitude);
}

function normaliseGeocodeResult(r: any, latitude: number, longitude: number): NormalisedAddress {
  const components: any[] = r.address_components ?? [];
  const get = (type: string): string | null => {
    const c = components.find((x: any) =>
      Array.isArray(x?.types) && x.types.includes(type)
    );
    if (!c) return null;
    return c.long_name ?? c.short_name ?? null;
  };

  const streetNumber = get('street_number');
  const route = get('route');
  const addressLine1 =
    [streetNumber, route].filter(Boolean).join(' ').trim() || null;

  const premise = get('premise');
  const subpremise = get('subpremise');
  const addressLine2 =
    [subpremise, premise].filter(Boolean).join(' ').trim() || null;

  const suburb = get('locality') || get('postal_town') || get('sublocality');
  const state = get('administrative_area_level_1');
  const postcode = get('postal_code');
  const country = (get('country') || 'AU').toUpperCase();

  const formattedAddress = r.formatted_address || '';

  const placeId = typeof r.place_id === 'string' ? r.place_id : '';

  return {
    providerId: placeId,
    formattedAddress,
    addressLine1,
    addressLine2,
    suburb,
    state,
    postcode,
    country,
    latitude,
    longitude,
    primaryText: addressLine1 || formattedAddress,
    secondaryText: [suburb, state, postcode].filter(Boolean).join(', '),
  };
}
