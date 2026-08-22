import { NextRequest, NextResponse } from 'next/server';
import {
  createAddressProvider,
  isAddressProviderConfigured,
  toSuggestion,
  type AddressSuggestion,
} from '@/lib/afss/providers/address-provider';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/afss/quote/address-search?q=<text>
 *
 * Server-side Geoapify autocomplete proxy.
 *
 * The browser never holds a Geoapify key. Every request from
 * `components/quote/steps/PropertyStep.tsx` is funnelled through this
 * route, which:
 *   • reads `GEOAPIFY_API_KEY` from the server env (never bundled);
 *   • hard-codes `filter=countrycode:au` and `bias=countrycode:au`;
 *   • returns the canonical `NormalizedAddress` + dropdown-shaped
 *     `AddressSuggestion` rows.
 *
 * No Supabase access here. The session cookie is intentionally NOT
 * read — the autocomplete suggestion is unrelated to quote state.
 */
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') ?? '').trim();
  if (q.length < 3) {
    return NextResponse.json(
      { ok: false, error: 'Type at least 3 characters to search.' },
      { status: 400 }
    );
  }
  if (q.length > 200) {
    return NextResponse.json(
      { ok: false, error: 'Search query is too long.' },
      { status: 400 }
    );
  }

  if (!isAddressProviderConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'Address search is temporarily unavailable. Please type your address manually.',
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

  let addresses;
  try {
    addresses = await provider.autocomplete(q, { limit: 5 });
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error:
          e?.message ?? 'We could not look up addresses right now.',
      },
      { status: 502 }
    );
  }

  const suggestions: AddressSuggestion[] = addresses.map(toSuggestion);
  return NextResponse.json({
    ok: true,
    provider: 'geoapify',
    suggestions,
  });
}