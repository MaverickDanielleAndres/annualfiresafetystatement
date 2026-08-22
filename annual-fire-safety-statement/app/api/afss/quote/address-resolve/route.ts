import { NextRequest, NextResponse } from 'next/server';
import {
  createAddressProvider,
  isAddressProviderConfigured,
} from '@/lib/afss/providers/address-provider';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/afss/quote/address-resolve?lat=<lat>&lng=<lng>
 *
 * Server-side Geoapify reverse-geocoding proxy.
 *
 * The browser obtains device coordinates via `navigator.geolocation`
 * and POSTs them here. We turn `(lat, lng)` into a single
 * `NormalizedAddress` using Geoapify's `/v1/geocode/reverse`
 * endpoint, again with `filter=countrycode:au`.
 *
 * The address is NOT persisted from this route — the wizard does
 * that only after the customer explicitly confirms the result.
 */
export async function GET(req: NextRequest) {
  const latRaw = req.nextUrl.searchParams.get('lat');
  const lngRaw = req.nextUrl.searchParams.get('lng');
  const lat = latRaw == null ? NaN : Number(latRaw);
  const lng = lngRaw == null ? NaN : Number(lngRaw);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return NextResponse.json(
      { ok: false, error: 'Invalid coordinates.' },
      { status: 400 }
    );
  }

  if (!isAddressProviderConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'Reverse geocoding is temporarily unavailable. Please type your address manually.',
      },
      { status: 503 }
    );
  }

  const provider = createAddressProvider();
  if (!provider) {
    return NextResponse.json(
      { ok: false, error: 'Address provider unavailable.' },
      { status: 503 }
    );
  }

  let address = null;
  try {
    address = await provider.reverseGeocode({ lat, lng });
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error:
          e?.message ??
          'We could not reverse-geocode that location. Please type your address.',
      },
      { status: 502 }
    );
  }

  if (!address) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'No Australian address found for that location. Please type your address.',
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    provider: 'geoapify',
    address,
  });
}