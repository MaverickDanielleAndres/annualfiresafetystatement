import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/afss/quote/address-search
 *
 * DEPRECATED — replaced by Google Places API (New) browser-side.
 * The customer-facing instant quote no longer calls Geoapify.
 *
 * This stub is kept for legacy callers and returns a clear
 * "no longer available" response so any orphaned link in the
 * codebase is visible in QA.
 */
export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      deprecated: true,
      error:
        'Address search is now provided by Google Places API (New) in the browser. ' +
        'This endpoint is no longer used.',
    },
    { status: 410 }
  );
}
