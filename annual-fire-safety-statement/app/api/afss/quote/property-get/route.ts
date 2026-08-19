import { NextResponse } from 'next/server';
import { findSessionIdByCookie } from '@/lib/afss/quote-session';
import { getAdminSupabase } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/afss/quote/property-get
 *
 * Returns the saved property for the current cookie session,
 * including provider-neutral fields for the building-confirmation
 * step (street_image_provider, etc.).
 */
export async function GET() {
  const id = await findSessionIdByCookie();
  if (!id) return NextResponse.json({ ok: true, property: null });

  const sb = getAdminSupabase();
  const { data } = await sb
    .schema('afss')
    .from('properties')
    .select(
      `id, formatted_address, address_line_1, address_line_2, suburb, state, postcode, country,
       latitude, longitude, address_provider, address_provider_id,
       street_image_provider, street_image_id, street_image_sequence_id,
       street_image_captured_at, street_image_thumb_url, building_confirmed`
    )
    .eq('quote_session_id', id)
    .maybeSingle();

  return NextResponse.json({ ok: true, property: data });
}
