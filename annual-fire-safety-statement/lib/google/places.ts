/**
 * AFSS — Google Places API (New) browser helpers.
 *
 * Architecture: the browser talks to Google directly. The website
 * never sees the API key — it lives in NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
 * and is restricted by Google Cloud (HTTP referrer + APIs).
 *
 * Billing protection:
 *   * one in-flight request per query cycle (caller-driven)
 *   * hard AU-only restriction (includedRegionCodes)
 *   * minimum 3 characters before fetch
 *   * session tokens (one per autocomplete journey)
 *   * fetchFields with the minimal required field set
 *   * once the customer selects a place, the session is concluded
 *     (the NEXT fetch of autocomplete requests a fresh token)
 *
 * Normalised shape returned to the wizard is intentionally close to
 * the older PropertyStep `Suggestion` / `ResolvedAddress` types so
 * the rest of the flow (database, toasts, validation) does not care
 * which provider produced the address.
 */

import {
  getBrowserApiKey,
  importGoogleLibrary,
  loadGoogleMaps,
} from './maps-loader';

export interface NormalisedAddress {
  /** Stable Google Place ID. */
  providerId: string;
  /** Human-readable address as Google returns it. */
  formattedAddress: string;
  addressLine1: string | null;
  addressLine2: string | null;
  suburb: string | null;
  state: string | null;
  postcode: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  /** Raw displayName text (e.g. "456 Kent Street"). */
  primaryText: string;
  /** Raw secondary text (suburb/state). */
  secondaryText: string;
}

export interface AddressSuggestion {
  /** Stable Google Place ID. */
  providerId: string;
  primaryText: string;
  secondaryText: string;
  fullText: string;
}

interface SessionState {
  token: google.maps.places.AutocompleteSessionToken;
  /** Whether the session has been concluded (place fetched). */
  concluded: boolean;
}

let session: SessionState | null = null;

function getSession(): SessionState {
  if (!session || session.concluded) {
    session = null;
  }
  if (!session) {
    // We construct the token lazily inside the library-import step.
    session = null as any;
  }
  return session as SessionState;
}

/**
 * Resets the session token. Called after a place selection completes
 * (the Place.fetchFields call concludes the session per Google docs).
 */
export function resetSession() {
  session = null;
}

/**
 * Returns Google Places predictions for a query, AU-only.
 * Uses one session token per autocomplete journey.
 */
export async function fetchAddressSuggestions(
  query: string,
  opts: { locationBias?: { lat: number; lng: number } | null } = {}
): Promise<AddressSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  const apiKey = getBrowserApiKey();
  if (!apiKey) return [];

  const google = await loadGoogleMaps({ apiKey });
  const places = await importGoogleLibrary(google, 'places');

  // (Re)create a session token if none is active.
  if (!session) {
    session = { token: new places.AutocompleteSessionToken(), concluded: false };
  }

  const request: google.maps.places.AutocompleteRequest = {
    input: trimmed,
    sessionToken: session.token,
    includedRegionCodes: ['au'],
    // Prefer actual street addresses and buildings. We avoid any
    // primary-type list so the API can return whatever matches the
    // typed string — addresses are usually street_address /
    // premise / establishment.
    language: 'en-AU',
    region: 'AU',
  };

  // Soft location bias only when the customer has shared their
  // current location. The hard restriction is already AU.
  if (opts.locationBias) {
    request.locationBias = { lat: opts.locationBias.lat, lng: opts.locationBias.lng };
  }

  const { suggestions } = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

  const out: AddressSuggestion[] = [];
  for (const s of suggestions ?? []) {
    const prediction = s.placePrediction;
    if (!prediction) continue;
    const placeId = prediction.placeId;
    if (!placeId) continue;
    const text = prediction.text?.toString() ?? '';
    const main = prediction.mainText?.toString() ?? text;
    const secondary = prediction.secondaryText?.toString() ?? '';
    if (!text) continue;
    out.push({
      providerId: placeId,
      primaryText: main || text,
      secondaryText: secondary,
      fullText: text,
    });
  }
  return out.slice(0, 5);
}

/**
 * Fetches a place by its Google Place ID and returns a fully
 * normalised address. Also concludes the current session token.
 */
export async function fetchPlaceDetails(
  placeId: string,
  skeleton?: { primaryText?: string; secondaryText?: string; fullText?: string }
): Promise<NormalisedAddress | null> {
  if (!placeId) return null;
  const apiKey = getBrowserApiKey();
  if (!apiKey) return null;

  const google = await loadGoogleMaps({ apiKey });
  const places = await importGoogleLibrary(google, 'places');
  const Place = (places as any).Place;
  if (!Place) {
    // Older builds may not expose Place under the namespace.
    return null;
  }

  const place = new Place({ id: placeId });

  // ONLY the fields we need. No reviews/ratings/photos/opening hours.
  await place.fetchFields({
    fields: [
      'id',
      'formattedAddress',
      'addressComponents',
      'location',
      'displayName',
    ],
  });

  if (session) session.concluded = true;

  return normalisePlace(place, skeleton);
}

function normalisePlace(
  place: any,
  skeleton?: { primaryText?: string; secondaryText?: string; fullText?: string }
): NormalisedAddress {
  const components: any[] = place.addressComponents ?? [];
  const get = (type: string): string | null => {
    const c = components.find((x: any) =>
      Array.isArray(x?.types) && x.types.includes(type)
    );
    if (!c) return null;
    return c.longText ?? c.long_name ?? c.shortText ?? c.short_name ?? null;
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

  const loc = place.location;
  let latitude: number | null = null;
  let longitude: number | null = null;
  if (loc) {
    // google.maps.LatLng exposes .lat() and .lng() as functions.
    if (typeof loc.lat === 'function') {
      latitude = (loc.lat() as number) ?? null;
      longitude = (loc.lng() as number) ?? null;
    } else if (typeof loc.lat === 'number') {
      latitude = loc.lat;
      longitude = loc.lng;
    }
  }

  const formattedAddress =
    place.formattedAddress ||
    [addressLine1, suburb, state, postcode].filter(Boolean).join(', ');

  const primaryText =
    skeleton?.primaryText || addressLine1 || formattedAddress;
  const secondaryText =
    skeleton?.secondaryText || [suburb, state, postcode].filter(Boolean).join(', ');

  return {
    providerId: place.id ?? '',
    formattedAddress,
    addressLine1,
    addressLine2,
    suburb,
    state,
    postcode,
    country,
    latitude,
    longitude,
    primaryText,
    secondaryText,
  };
}

/**
 * Same as fetchPlaceDetails but takes a Google Place object directly.
 * Useful when the caller already has the Place instance from
 * placePrediction.toPlace().
 */
export async function finalizePlace(
  place: any,
  skeleton?: { primaryText?: string; secondaryText?: string; fullText?: string }
): Promise<NormalisedAddress | null> {
  if (!place) return null;
  const apiKey = getBrowserApiKey();
  if (!apiKey) return null;

  const google = await loadGoogleMaps({ apiKey });
  const places = await importGoogleLibrary(google, 'places');
  const Place = (places as any).Place;
  if (!Place) return null;
  // The argument may already be a Place instance.
  const placeObj =
    place instanceof Place
      ? place
      : new Place({ id: place.placeId ?? place.id });
  await placeObj.fetchFields({
    fields: [
      'id',
      'formattedAddress',
      'addressComponents',
      'location',
      'displayName',
    ],
  });
  if (session) session.concluded = true;
  return normalisePlace(placeObj, skeleton);
}
