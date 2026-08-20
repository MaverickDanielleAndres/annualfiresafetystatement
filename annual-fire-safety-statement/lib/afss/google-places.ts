/**
 * AFSS — Server-side Google Places / Street View helpers (DEPRECATED).
 *
 * The active customer-facing flow uses Google Maps JS API in the
 * browser (see `lib/google/places.ts` and `lib/google/street-view.ts`).
 * This file is kept as an optional server-side fallback for any
 * non-browser consumers (e.g. background jobs, admin tools).
 *
 * The customer instant quote does NOT call into this module.
 */

export interface ResolvedPlace {
  google_place_id: string;
  formatted_address: string;
  address_line_1: string | null;
  address_line_2: string | null;
  suburb: string | null;
  state: string | null;
  postcode: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
}

const REQUIRED_FIELDS = [
  'formatted_address',
  'address_component',
  'geometry/location',
  'place_id',
].join(',');

export async function resolvePlaceFromId(
  placeId: string
): Promise<ResolvedPlace | null> {
  const key =
    process.env.GOOGLE_MAPS_SERVER_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    '';
  if (!key) return null;

  const url = new URL(
    'https://maps.googleapis.com/maps/api/place/details/json'
  );
  url.searchParams.set('place_id', placeId);
  url.searchParams.set('fields', REQUIRED_FIELDS);
  url.searchParams.set('key', key);

  try {
    const res = await fetch(url.toString(), { method: 'GET', cache: 'no-store' });
    if (!res.ok) return null;
    const data: any = await res.json();
    if (data.status !== 'OK' || !data.result) return null;
    return mapPlaceResult(data.result);
  } catch {
    return null;
  }
}

function mapPlaceResult(r: any): ResolvedPlace {
  const components: any[] = r.address_components || [];
  const streetNumber = getComponent(components, 'street_number');
  const route = getComponent(components, 'route');
  const addressLine1 =
    [streetNumber, route].filter(Boolean).join(' ').trim() || null;

  return {
    google_place_id: r.place_id,
    formatted_address: r.formatted_address || '',
    address_line_1: addressLine1,
    address_line_2: null,
    suburb:
      getComponent(components, 'locality') ||
      getComponent(components, 'postal_town'),
    state: getComponent(components, 'administrative_area_level_1'),
    postcode: getComponent(components, 'postal_code'),
    country: getComponent(components, 'country') || 'AU',
    latitude: r.geometry?.location?.lat ?? null,
    longitude: r.geometry?.location?.lng ?? null,
  };
}

function getComponent(components: any[], type: string): string | null {
  const c = components.find((x: any) => x?.types?.includes(type));
  return c?.long_name ?? c?.short_name ?? null;
}

/**
 * Returns the closest Street View panorama metadata for a lat/lng.
 * Implemented via the official Street View Metadata endpoint. We do
 * NOT cache or store imagery. The browser then renders the panorama
 * using NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
 *
 * The actually active customer-facing storefront calls
 * /api/afss/quote/street-image (which uses this helper internally).
 */
export async function fetchStreetViewMetadata(
  lat: number,
  lng: number
): Promise<{ pano_id: string | null; status: string } | null> {
  const key =
    process.env.GOOGLE_MAPS_SERVER_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    '';
  if (!key) return null;

  const url = new URL(
    'https://maps.googleapis.com/maps/api/streetview/metadata'
  );
  url.searchParams.set('location', `${lat},${lng}`);
  url.searchParams.set('key', key);

  try {
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) return null;
    const data: any = await res.json();
    return { pano_id: data.pano_id ?? null, status: data.status ?? 'UNKNOWN' };
  } catch {
    return null;
  }
}
