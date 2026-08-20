/**
 * AFSS — Address provider abstraction (DEPRECATED).
 *
 * The active customer-facing flow now uses Google Places API (New)
 * in the browser (see lib/google/places.ts). This file is kept as
 * deprecated code for any future audit, but no customer-facing
 * route imports it.
 *
 * The original Geoapify implementation is preserved below for
 * reference. It is NOT wired into the instant quote request flow.
 */

export interface AddressSuggestion {
  providerId: string;
  description: string;
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
  resolveInline(suggestion: AddressSuggestion): ResolvedAddress;
  resolve(providerId: string): Promise<ResolvedAddress | null>;
}

/**
 * DEPRECATED — Geoapify implementation retained for reference only.
 * Hard-codes `countrycode:au`. NOT used by the customer flow.
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
        next: { revalidate: 60 },
      });
      if (!res.ok) return [];
      const data = (await res.json()) as { results?: any[] };
      return (data.results ?? []).map((r) => this.toSuggestion(r));
    } catch {
      return [];
    }
  }

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
    return null;
  }

  private toSuggestion(r: any): AddressSuggestion {
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
 * DEPRECATED — returns null so any caller-side wiring that imports
 * this getter gracefully no-ops.
 */
export function createAddressProvider(): AddressProvider | null {
  return null;
}
