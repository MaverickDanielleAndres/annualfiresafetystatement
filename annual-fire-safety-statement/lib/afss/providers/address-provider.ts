/**
 * AFSS — Address provider abstraction + Geoapify implementation.
 *
 * Architecture: BROWSER → /api/afss/quote/address-search → server
 * (this file) → Geoapify. The browser NEVER sees the API key.
 *
 * The data exposed to the browser is normalised in this file:
 *
 *   AddressSuggestion → AddressResolvedAddress
 *
 * ...both of which match the client-side Suggestion / ResolvedAddress
 * types in components/quote/steps/PropertyStep.tsx.
 */

export interface AddressSuggestion {
  providerId: string;
  description: string;
  // extra fields surfaced to the client; populated by
  // resolveInline() so the browser does NOT need a second round-trip
  // to /address-resolve just to get lat/lng/postcode.
  addressLine1?: string | null;
  addressLine2?: string | null;
  suburb?: string | null;
  state?: string | null;
  postcode?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface ResolvedAddress {
  providerId: string;
  formattedAddress: string;
  addressLine1: string | null;
  addressLine2: string | null;
  suburb: string | null;
  state: string | null;
  postcode: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  providerJson?: Record<string, unknown>;
}

export interface AddressProvider {
  readonly name: string;
  readonly isConfigured: () => boolean;
  autocomplete(q: string, limit?: number): Promise<AddressSuggestion[]>;
  /**
   * Returns a fully populated ResolvedAddress from a previously-
   * fetched suggestion. Implementations should prefer the data
   * already present in the suggestion (avoid an extra provider
   * round-trip) since Geoapify's autocomplete payload already
   * includes lat/lng/postcode/etc.
   */
  resolveInline(suggestion: AddressSuggestion): ResolvedAddress;
  /** Optional: explicit place_id lookup (rarely needed). */
  resolve(providerId: string): Promise<ResolvedAddress | null>;
}

/**
 * Geoapify. Hard-codes `countrycode:au`. Falls back gracefully if
 * the API key is missing.
 */
export class GeoapifyAddressProvider implements AddressProvider {
  readonly name = 'geoapify';

  constructor(
    private readonly apiKey: string,
    private readonly endpoint = 'https://api.geoapify.com/v1/geocode/autocomplete'
  ) {}

  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.length >= 8;
  }

  async autocomplete(q: string, limit = 6): Promise<AddressSuggestion[]> {
    const trimmed = q.trim();
    if (trimmed.length < 3) return [];
    if (!this.isConfigured()) return [];

    const params = new URLSearchParams({
      text: trimmed,
      filter: 'countrycode:au',
      format: 'json',
      limit: String(limit),
      bias: 'countrycode:au',
      lang: 'en',
      apiKey: this.apiKey,
    });

    try {
      const res = await fetch(`${this.endpoint}?${params.toString()}`, {
        method: 'GET',
        // Per-keyword cache so two identical keystrokes within
        // 60 seconds reuse the response. Real downstream rate
        // limits are handled in the API route's bucket.
        next: { revalidate: 60 },
      });
      if (!res.ok) return [];
      const data = (await res.json()) as { results?: any[] };
      return (data.results ?? []).map((r) => this.toSuggestion(r));
    } catch {
      return [];
    }
  }

  /**
   * Convert a suggestion (already populated from the autocomplete
   * response) into a ResolvedAddress. No extra round-trip; the
   * autocomplete payload already has every field the UI needs.
   */
  resolveInline(suggestion: AddressSuggestion): ResolvedAddress {
    return {
      providerId: suggestion.providerId,
      formattedAddress: suggestion.description,
      addressLine1: suggestion.addressLine1 ?? null,
      addressLine2: suggestion.addressLine2 ?? null,
      suburb: suggestion.suburb ?? null,
      state: suggestion.state ?? null,
      postcode: suggestion.postcode ?? null,
      country: suggestion.country ?? 'AU',
      latitude: suggestion.latitude ?? null,
      longitude: suggestion.longitude ?? null,
    };
  }

  async resolve(providerId: string): Promise<ResolvedAddress | null> {
    if (!providerId || !this.isConfigured()) return null;
    // Geoapify has no /autocomplete?id=... endpoint; we fall back to
    // a text-search by the place_id is impossible. We make a
    // supplementary /geocode/search?text= that matches the closest
    // feature. Practically unused — the inline path above is the
    // primary.
    return null;
  }

  private toSuggestion(r: any): AddressSuggestion {
    // Geoapify /geocode/autocomplete returns the FLAT shape:
    //   { properties: { formatted, address_line1, lat, lon, … }, id }
    // even when `format=json`.
    const p = (r?.properties ?? r) || {};
    return {
      providerId: String(p?.place_id ?? p?.feature_id ?? ''),
      description: String(p?.formatted ?? ''),
      addressLine1: p?.address_line1 ? String(p.address_line1) : null,
      addressLine2: p?.address_line2 ? String(p.address_line2) : null,
      suburb: p?.suburb ? String(p.suburb) : p?.city ?? p?.town ?? null,
      state: p?.state_code
        ? String(p.state_code).toUpperCase()
        : p?.state
          ? String(p.state).toUpperCase()
          : null,
      postcode: p?.postcode ? String(p.postcode) : null,
      country: String(p?.country_code ?? 'AU').toUpperCase(),
      latitude: typeof p?.lat === 'number' ? p.lat : null,
      longitude: typeof p?.lon === 'number' ? p.lon : null,
    };
  }
}

/**
 * Provider selection. Today there is exactly one wired
 * implementation (Geoapify). Wiring a new one means adding a new
 * class above plus a new branch here.
 */
export function createAddressProvider(): AddressProvider | null {
  return new GeoapifyAddressProvider(process.env.GEOAPIFY_API_KEY ?? '');
}
