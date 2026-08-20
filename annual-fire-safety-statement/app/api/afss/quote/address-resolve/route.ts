import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/afss/quote/address-resolve
 *
 * DEPRECATED — replaced by Google Places API (New) browser-side.
 * The customer-facing instant quote no longer calls Geoapify.
 */
export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      deprecated: true,
      error:
        'Address resolve is now provided by Google Places API (New) in the browser. ' +
        'This endpoint is no longer used.',
    },
    { status: 410 }
  );
}
