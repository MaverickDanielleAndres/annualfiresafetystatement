import { NextRequest, NextResponse } from 'next/server';
import { findSessionIdByCookie, logActivity } from '@/lib/afss/quote-session';
import {
  createStreetImageryProvider,
  type StreetImageryResultStatus,
} from '@/lib/afss/providers/street-imagery-provider';
import { getAdminSupabase } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/afss/quote/street-image
 *
 * Server-side Mapillary lookup. Reads the lat/lng from the current
 * session's saved property, asks Mapillary for the nearest image,
 * and returns one of:
 *   * { status: 'ok', image: {...} }            — usable image
 *   * { status: 'no_coverage', reason: '...' }  — Mapillary returned zero
 *   * { status: 'rate_limited', reason: '...' } — quota / 429
 *   * { status: 'provider_unavailable', ... }
 *   * { status: 'configuration_error', ... }
 *   * { status: 'invalid_response', ... }
 *
 * Front-end always renders the customer-friendly copy. Internal
 * reason is logged to activity_events for engineering-only audit.
 *
 * Side effect: persists image reference (or null) into
 * afss.properties.street_image_* and logs the attempt.
 */
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

  const provider = createStreetImageryProvider();
  if (!provider) {
    return NextResponse.json(
      { status: 'configuration_error', reason: 'Street imagery provider not configured.' },
      { status: 503 }
    );
  }

  const outcome = await provider.findNearest({ latitude, longitude });

  if (outcome.status === 'ok') {
    const im = outcome.image;
    await sb
      .schema('afss')
      .from('properties')
      .update({
        street_image_provider: 'mapillary',
        street_image_id: im.providerId,
        street_image_sequence_id: im.sequenceId ?? null,
        street_image_captured_at: im.capturedAt ?? null,
        street_image_thumb_url: im.thumb1024Url ?? im.thumbUrl ?? null,
        street_image_search_radius_m: outcome.radius_m,
        street_image_json: im.rawJson ?? null,
      })
      .eq('quote_session_id', id);
    await logActivity(id, 'address_selected', {
      provider: 'mapillary',
      result: 'ok',
      image_id: im.providerId,
      radius_m: outcome.radius_m,
    });
    return NextResponse.json({ status: 'ok', image: im, radius_m: outcome.radius_m });
  }

  // Non-ok: persist a clear "no image" marker and log the audit reason.
  await sb
    .schema('afss')
    .from('properties')
    .update({
      street_image_provider: outcome.status === 'rate_limited' ? 'mapillary' : null,
      street_image_id: null,
      street_image_sequence_id: null,
      street_image_captured_at: null,
      street_image_thumb_url: null,
      street_image_search_radius_m: outcome.radius_m ?? 250,
      street_image_json: null,
    })
    .eq('quote_session_id', id);

  await logActivity(id, 'building_preview_unavailable', {
    provider: 'mapillary',
    result: outcome.status,
    message: outcome.message,
    radius_m: outcome.radius_m,
  });

  return NextResponse.json({
    status: outcome.status as StreetImageryResultStatus,
    reason: outcome.message,
    radius_m: outcome.radius_m,
    image: null,
  });
}
