import { NextRequest, NextResponse } from 'next/server';
import { findSessionIdByCookie, logActivity } from '@/lib/afss/quote-session';
import { getAdminSupabase } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/afss/quote/street-image
 *
 *   Server-side Google Street View Metadata lookup. The browser
 *   ALSO calls the Street View Service directly via the Maps JS
 *   API; this endpoint exists for audit / fallback persistence.
 *
 * POST /api/afss/quote/street-image
 *
 *   The Street View panorama widget POSTs the surfaced pano_id +
 *   radius whenever it finds / switches panorama so we persist an
 *   accurate audit trail server-side.
 */

async function getGoogleMapsKey(): Promise<string> {
  return (
    process.env.GOOGLE_MAPS_SERVER_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    ''
  );
}

interface MetadataResponse {
  status: string;
  pano_id?: string | null;
  location?: { lat: number; lng: number };
  copyright?: string;
  date?: string;
}

async function fetchMetadata(
  key: string,
  latitude: number,
  longitude: number,
  radius: number
): Promise<MetadataResponse | null> {
  const url = new URL('https://maps.googleapis.com/maps/api/streetview/metadata');
  url.searchParams.set('location', `${latitude},${longitude}`);
  url.searchParams.set('radius', String(radius));
  url.searchParams.set('source', 'outdoor');
  url.searchParams.set('key', key);
  try {
    const res = await fetch(url.toString(), {
      method: 'GET',
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as MetadataResponse;
  } catch {
    return null;
  }
}

export async function GET() {
  const id = await findSessionIdByCookie();
  if (!id)
    return NextResponse.json(
      { error: 'No active quote session.' },
      { status: 401 }
    );

  const sb = getAdminSupabase();
  const { data: prop } = await sb
    .schema('afss')
    .from('properties')
    .select('latitude, longitude')
    .eq('quote_session_id', id)
    .maybeSingle();

  const latitude = (prop as any)?.latitude;
  const longitude = (prop as any)?.longitude;
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return NextResponse.json(
      { error: 'No coordinates saved for the current session.' },
      { status: 400 }
    );
  }

  const key = await getGoogleMapsKey();
  if (!key) {
    return NextResponse.json(
      {
        status: 'configuration_error',
        reason: 'Google Maps API key not configured.',
      },
      { status: 503 }
    );
  }

  // Server-side fallback. The browser-side flow performs the same
  // lookup via the Maps JS API Street View Service. If the server
  // key lacks the Street View Static API permission, the browser
  // path still works.
  for (const radius of [25, 50, 100, 250]) {
    const data = await fetchMetadata(key, latitude, longitude, radius);
    if (!data) {
      return NextResponse.json({
        status: 'provider_unavailable',
        reason: 'Network error contacting Google Street View.',
        radius_m: radius,
      });
    }
    if (data.status === 'OK' && data.pano_id) {
      const panoLat =
        typeof data.location?.lat === 'number' ? data.location.lat : latitude;
      const panoLng =
        typeof data.location?.lng === 'number' ? data.location.lng : longitude;
      await persistPanorama({
        sb,
        sessionId: id,
        panoId: data.pano_id,
        latitude: panoLat,
        longitude: panoLng,
        radiusM: radius,
      });
      await logActivity(id, 'address_selected', {
        provider: 'google_street_view',
        result: 'ok',
        pano_id: data.pano_id,
        radius_m: radius,
      });
      return NextResponse.json({
        status: 'ok',
        pano_id: data.pano_id,
        latitude: panoLat,
        longitude: panoLng,
        radius_m: radius,
      });
    }
    if (data.status === 'OVER_QUERY_LIMIT' || data.status === 'OVER_DAILY_LIMIT') {
      return NextResponse.json({
        status: 'rate_limited',
        reason: `Street View quota (${data.status}).`,
        radius_m: radius,
      });
    }
    if (data.status === 'REQUEST_DENIED') {
      return NextResponse.json({
        status: 'configuration_error',
        reason: 'Street View request denied (server key not authorised).',
        radius_m: radius,
      });
    }
    if (data.status === 'UNKNOWN_ERROR') {
      return NextResponse.json({
        status: 'provider_unavailable',
        reason: 'Street View unknown error.',
        radius_m: radius,
      });
    }
    if (data.status === 'ZERO_RESULTS') continue;
  }

  await persistNoCoverage({ sb, sessionId: id, radiusM: 250 });
  await logActivity(id, 'building_preview_unavailable', {
    provider: 'google_street_view',
    result: 'no_coverage',
    radius_m: 250,
  });
  return NextResponse.json({
    status: 'no_coverage',
    radius_m: 250,
  });
}

interface PersistArgs {
  sb: ReturnType<typeof getAdminSupabase>;
  sessionId: string;
  panoId: string;
  latitude: number;
  longitude: number;
  radiusM: number;
}

async function persistPanorama({
  sb,
  sessionId,
  panoId,
  latitude,
  longitude,
  radiusM,
}: PersistArgs) {
  await sb
    .schema('afss')
    .from('properties')
    .update({
      street_image_provider: 'google_street_view',
      street_image_id: panoId,
      street_image_sequence_id: null,
      street_image_captured_at: null,
      street_image_thumb_url: null,
      street_image_search_radius_m: radiusM,
      street_image_json: {
        source: 'google_street_view',
        latitude,
        longitude,
        radius_m: radiusM,
      },
    })
    .eq('quote_session_id', sessionId);
}

async function persistNoCoverage({
  sb,
  sessionId,
  radiusM,
}: {
  sb: ReturnType<typeof getAdminSupabase>;
  sessionId: string;
  radiusM: number;
}) {
  await sb
    .schema('afss')
    .from('properties')
    .update({
      street_image_provider: null,
      street_image_id: null,
      street_image_sequence_id: null,
      street_image_captured_at: null,
      street_image_thumb_url: null,
      street_image_search_radius_m: radiusM,
      street_image_json: null,
    })
    .eq('quote_session_id', sessionId);
}

/**
 * POST /api/afss/quote/street-image
 *
 * The browser-side Street View widget POSTs the surfaced pano_id
 * and radius whenever it mounts or the customer navigates to a
 * neighbouring panorama. Idempotent.
 *
 * Body: { pano_id?: string, latitude?: number, longitude?: number,
 *         radius_m?: number }
 */
export async function POST(req: NextRequest) {
  const id = await findSessionIdByCookie();
  if (!id)
    return NextResponse.json(
      { error: 'No active quote session.' },
      { status: 401 }
    );

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const panoId =
    typeof body?.pano_id === 'string' && body.pano_id
      ? body.pano_id
      : null;
  const latitude = typeof body?.latitude === 'number' ? body.latitude : null;
  const longitude = typeof body?.longitude === 'number' ? body.longitude : null;
  const radiusM = typeof body?.radius_m === 'number' ? body.radius_m : null;

  const sb = getAdminSupabase();
  const update: Record<string, unknown> = {};
  if (panoId) {
    update.street_image_provider = 'google_street_view';
    update.street_image_id = panoId;
    update.street_image_thumb_url = null;
  }
  if (typeof radiusM === 'number') {
    update.street_image_search_radius_m = radiusM;
  }
  update.street_image_json = {
    source: 'google_street_view',
    ...(panoId ? { pano_id: panoId } : {}),
    ...(latitude != null ? { latitude } : {}),
    ...(longitude != null ? { longitude } : {}),
    ...(radiusM != null ? { radius_m: radiusM } : {}),
  };
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ ok: true });
  }
  try {
    await sb
      .schema('afss')
      .from('properties')
      .update(update)
      .eq('quote_session_id', id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? 'Failed to update Street View metadata.' },
      { status: 500 }
    );
  }
}
