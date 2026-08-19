import { NextRequest, NextResponse } from 'next/server';
import {
  findSessionIdByCookie,
  upsertProperty,
  updateSession,
  logActivity,
} from '@/lib/afss/quote-session';
import {
  validateAddress,
  validateAuState,
  validateAuPostcode,
} from '@/lib/afss/validation';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/afss/quote/property
 * Step 2 — save property address. Updates the same quote session.
 * Body shape is the validated AddressInput from validation.ts.
 */
export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const id = await findSessionIdByCookie();
  if (!id)
    return NextResponse.json(
      { error: 'No active quote session. Please start from Step 1.' },
      { status: 401 }
    );

  const ar = validateAddress(body);
  if (!ar.ok) return NextResponse.json({ error: ar.error }, { status: 400 });

  // Optional streetview fields.
  const streetview: Record<string, unknown> = {};
  if (typeof body?.streetview_pano_id === 'string')
    streetview.streetview_pano_id = body.streetview_pano_id;
  if (typeof body?.streetview_heading === 'number')
    streetview.streetview_heading = body.streetview_heading;
  if (typeof body?.streetview_pitch === 'number')
    streetview.streetview_pitch = body.streetview_pitch;

  try {
    await upsertProperty(id, {
      address_line_1: ar.value.address_line_1,
      address_line_2: ar.value.address_line_2,
      suburb: ar.value.suburb,
      state: ar.value.state,
      postcode: ar.value.postcode,
      country: 'AU',
      formatted_address: ar.value.formatted_address,
      google_place_id: ar.value.google_place_id,
      latitude: ar.value.latitude,
      longitude: ar.value.longitude,
      ...streetview,
    });

    await updateSession(id, {
      status: 'property_saved',
      current_step: 'building_confirmation',
    });
    await logActivity(id, 'address_selected', {
      has_place_id: !!ar.value.google_place_id,
      has_pano: !!streetview.streetview_pano_id,
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? 'Failed to save property.' },
      { status: 500 }
    );
  }
}