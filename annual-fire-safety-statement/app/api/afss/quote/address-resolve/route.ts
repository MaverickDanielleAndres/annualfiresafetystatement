import { NextRequest, NextResponse } from 'next/server';
import { GeoapifyAddressProvider } from '@/lib/afss/providers/address-provider';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/afss/quote/address-resolve?text=<formatted address>
 *
 * Server-side enrichment of an already-selected address so we get
 * the canonical lat/lng + state + postcode fields. Geoapify
 * /geocode/search with bias=countrycode:au returns these fields
 * on the first hit.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const text = (url.searchParams.get('text') ?? '').trim();
  if (!text) {
    return NextResponse.json({ ok: false, error: 'Missing text.' }, { status: 400 });
  }
  const apiKey = process.env.GEOAPIFY_API_KEY || process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || '';
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: 'Geoapify server key not configured.' },
      { status: 503 }
    );
  }
  const params = new URLSearchParams({
    text,
    filter: 'countrycode:au',
    format: 'json',
    bias: 'countrycode:au',
    limit: '1',
    apiKey,
  });
  try {
    const res = await fetch(
      `https://api.geoapify.com/v1/geocode/search?${params.toString()}`,
      { cache: 'no-store' }
    );
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: 'Geoapify search failed.' },
        { status: 502 }
      );
    }
    const data = await res.json();
    const r = (data?.results ?? [])[0];
    if (!r)
      return NextResponse.json(
        { ok: false, error: 'No match returned by Geoapify.' },
        { status: 502 }
      );
    const p = r.properties ?? r;
    return NextResponse.json({
      ok: true,
      provider: 'geoapify',
      resolved: {
        providerId: String(p?.place_id ?? p?.feature_id ?? ''),
        formattedAddress: String(p?.formatted ?? p?.address_line1 ?? text),
        addressLine1: p?.address_line1 ?? null,
        addressLine2: p?.address_line2 ?? null,
        suburb: p?.suburb ?? p?.city ?? p?.town ?? null,
        state: p?.state_code
          ? String(p.state_code).toUpperCase()
          : p?.state
            ? String(p.state).toUpperCase()
            : null,
        postcode: p?.postcode ?? null,
        country: String(p?.country_code ?? 'AU').toUpperCase(),
        latitude: typeof p?.lat === 'number' ? p.lat : null,
        longitude: typeof p?.lon === 'number' ? p.lon : null,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'Geoapify search failed.' },
      { status: 502 }
    );
  }
}
