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
 *
 * Saves the customer-selected address to afss.properties.
 * Provider-neutral. Accepts either the old Google-style payload
 * (google_place_id) or the new Geoapify-style payload
 * (address_provider / address_provider_id).
 *
 * After save we advance the session to building_confirmation.
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

  // Reuse the existing validateAddress; it doesn't pin a provider.
  const ar = validateAddress(body);
  if (!ar.ok) return NextResponse.json({ error: ar.error }, { status: 400 });

  // Provider-neutral normalization.
  const providerName =
    typeof body?.address_provider === 'string'
      ? String(body.address_provider).toLowerCase()
      : ar.value.google_place_id
        ? 'google'
        : 'manual';
  const providerId =
    typeof body?.address_provider_id === 'string'
      ? String(body.address_provider_id)
      : ar.value.google_place_id || null;

  try {
    await upsertProperty(id, {
      address_line_1: ar.value.address_line_1,
      address_line_2: ar.value.address_line_2,
      suburb: ar.value.suburb,
      state: ar.value.state,
      postcode: ar.value.postcode,
      country: 'AU',
      formatted_address: ar.value.formatted_address,
      google_place_id: ar.value.google_place_id, // legacy column still populated
      latitude: ar.value.latitude,
      longitude: ar.value.longitude,
      address_provider: providerName,
      address_provider_id: providerId,
      address_provider_json: body ?? null,
    });

    await updateSession(id, {
      status: 'property_saved',
      current_step: 'building_confirmation',
    });
    await logActivity(id, 'address_selected', {
      provider: providerName,
      has_provider_id: !!providerId,
    });

    return NextResponse.json({ ok: true, provider: providerName });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? 'Failed to save property.' },
      { status: 500 }
    );
  }
}
