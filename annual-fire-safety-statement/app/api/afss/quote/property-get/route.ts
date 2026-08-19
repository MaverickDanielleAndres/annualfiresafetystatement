import { NextResponse } from 'next/server';
import { findSessionIdByCookie } from '@/lib/afss/quote-session';
import { getAdminSupabase } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/afss/quote/property-get
 * Returns the property record (if any) for the current cookie session.
 * Used by the building-confirmation step to fetch the formatted
 * address and Street View metadata.
 */
export async function GET() {
  const id = await findSessionIdByCookie();
  if (!id) return NextResponse.json({ ok: true, property: null });

  const sb = getAdminSupabase();
  const { data } = await sb
    .schema('afss')
    .from('properties')
    .select(
      'id, formatted_address, latitude, longitude, streetview_pano_id, address_line_1, suburb, state, postcode'
    )
    .eq('quote_session_id', id)
    .maybeSingle();

  return NextResponse.json({ ok: true, property: data });
}