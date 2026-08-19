import { NextRequest, NextResponse } from 'next/server';
import { GeoapifyAddressProvider } from '@/lib/afss/providers/address-provider';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/afss/quote/address-search?q=<text>
 *
 * Server-proxied Geoapify autocomplete.
 *
 * Returns a single, stable, normalised shape the browser can
 * render without re-parsing the raw Geoapify response:
 *
 *   {
 *     ok: true,
 *     suggestions: [
 *       {
 *         id: "<provider place_id>",
 *         formatted: "200 George Street, Concord West NSW 2138, Australia",
 *         addressLine1: "200 George Street",
 *         addressLine2: "Concord West NSW 2138, Australia",
 *         suburb: "Concord West",
 *         state: "NSW",
 *         postcode: "2138",
 *         country: "AU",
 *         latitude: -33.8482674,
 *         longitude: 151.0837602
 *       },
 *       ...
 *     ]
 *   }
 *
 * AU-only filtering is enforced server-side. The browser NEVER
 * receives the Geoapify API key and NEVER talks to Geoapify.
 *
 * Rate limit: 60 req/min/IP (best-effort, single-process).
 */

interface NormalisedSuggestion {
  id: string;
  formatted: string;
  addressLine1: string | null;
  addressLine2: string | null;
  suburb: string | null;
  state: string | null;
  postcode: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
}

export async function GET(req: NextRequest) {
  const ip =
    (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
    'unknown';
  if (!bucketAllows(ip + ':' + new Date().toISOString().slice(0, 16), 60)) {
    return NextResponse.json(
      { ok: false, error: 'Too many requests. Please slow down.' },
      { status: 429 }
    );
  }

  const url = new URL(req.url);
  const q = (url.searchParams.get('q') ?? '').trim();
  if (q.length < 3) {
    return NextResponse.json({ ok: true, suggestions: [] });
  }

  const provider = new GeoapifyAddressProvider(
    process.env.GEOAPIFY_API_KEY ?? ''
  );
  if (!provider.isConfigured()) {
    return NextResponse.json(
      { ok: false, error: 'Address provider not configured on the server.' },
      { status: 503 }
    );
  }

  try {
    const rawSuggestions = await provider.autocomplete(q, 6);
    const normalised: NormalisedSuggestion[] = rawSuggestions.map((s) => {
      const r = provider.resolveInline(s);
      return {
        id: r.providerId || s.providerId,
        formatted: r.formattedAddress || s.description,
        addressLine1: r.addressLine1,
        addressLine2: r.addressLine2,
        suburb: r.suburb,
        state: r.state,
        postcode: r.postcode,
        country: r.country || 'AU',
        latitude: r.latitude,
        longitude: r.longitude,
      };
    });

    return NextResponse.json({ ok: true, suggestions: normalised });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'Address lookup failed.' },
      { status: 502 }
    );
  }
}

// Naive per-process rate-limit bucket. Sufficient for the MVP.
const buckets = new Map<string, { count: number; resetAt: number }>();
function bucketAllows(key: string, limit: number): boolean {
  const now = Date.now();
  const cur = buckets.get(key);
  if (!cur || cur.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (cur.count >= limit) return false;
  cur.count++;
  return true;
}
