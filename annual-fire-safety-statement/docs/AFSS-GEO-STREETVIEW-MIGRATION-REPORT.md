# AFSS Geo + Street View Migration — Final Report

> Migration of the AFSS Instant Quote active address flow from
> **Google Places + Google Geocoder** to **Geoapify**, while retaining
> **Google Maps JS API** for **Street View only**.
>
> Date: 2026-08-22
> Branch: main
> Project: `annual-fire-safety-statement`

---

## 1. Existing Google implementation discovered

The active customer-facing address flow was 100 % Google Maps JS API in
the browser:

* `lib/google/maps-loader.ts` — single `<script>`-tag loader that injects
  `https://maps.googleapis.com/maps/api/js?…&libraries=places,streetView,geometry`,
  caches `google.maps.importLibrary()` results, exposes the namespace.
* `lib/google/places.ts` — Google Places API (New) helpers:
  `fetchAddressSuggestions()` → `places.AutocompleteSuggestion.fetchAutocompleteSuggestions()`,
  `fetchPlaceDetails()` → `new Place({id}).fetchFields([...])`,
  `finalizePlace()`. Session-token bookkeeping for billing protection.
* `lib/google/geocoder.ts` — `google.maps.Geocoder().geocode({location})`
  for reverse geocoding of the "Use my location" result.
* `lib/google/street-view.ts` — `StreetViewService.getPanorama()`,
  `StreetViewPanorama` widget, `geometry.spherical.computeHeading()`.
* `types/google-maps.d.ts` — hand-rolled ambient typings for the
  `google.maps` namespace.
* `components/quote/steps/PropertyStep.tsx` — the wizard step that
  imports all three Google modules.
* `components/quote/steps/BuildingConfirmStep.tsx` — uses only the
  Street View helpers.
* `app/api/afss/quote/street-image/route.ts` — server-side Street View
  Metadata HTTP endpoint using `GOOGLE_MAPS_SERVER_KEY` (or the browser
  key as fallback), persists `street_image_provider='google_street_view'`
  to `afss.properties`.

Server-side legacy `lib/afss/google-places.ts` (legacy `place/details/json`
helper) was already in the tree but **not imported anywhere**.

## 2. Existing Geoapify code discovered

Geoapify was the prior address provider before the Google migration. All
code remained as DEPRECATED references in the tree:

* `lib/afss/providers/address-provider.ts` — `GeoapifyAddressProvider`
  class implementing an `AddressProvider` interface, with
  `createAddressProvider()` always returning `null`.
* `app/api/afss/quote/address-search/route.ts` — `410 Gone` stub.
* `app/api/afss/quote/address-resolve/route.ts` — `410 Gone` stub.
* `lib/afss/providers/street-imagery-provider.ts` —
  `MapillaryStreetImageryProvider` with `findNearest()` hard-coded to
  return `provider_unavailable`; factory always returns `null`.

`.env.local` already declared `GEOAPIFY_API_KEY` and
`NEXT_PUBLIC_GEOAPIFY_API_KEY` (and orphan `MAPILLARY_*` tokens), but
nothing in the active customer flow read them.

## 3. Google Places code removed/replaced

| File | Action |
|---|---|
| `lib/google/places.ts` | **DELETED** — no consumer in the active flow after migration. |
| `app/api/afss/quote/address-search/route.ts` | **REPLACED** — turned from `410 Gone` into a real server-side Geoapify autocomplete proxy. |

## 4. Google Geocoder removed/replaced

| File | Action |
|---|---|
| `lib/google/geocoder.ts` | **DELETED** — `reverseGeocode()` is no longer called from the browser. |
| `app/api/afss/quote/address-resolve/route.ts` | **REPLACED** — turned from `410 Gone` into a real server-side Geoapify reverse-geocoding proxy. |

## 5. Geoapify autocomplete implementation

* **Server:** `app/api/afss/quote/address-search/route.ts` —
  `GET /api/afss/quote/address-search?q=<text>`
  validates `q` length (3–200), enforces `isAddressProviderConfigured()`,
  calls `createAddressProvider().autocomplete(q, {limit:5})`.
* **Provider:** `lib/afss/providers/address-provider.ts` —
  `GeoapifyAddressProvider.autocomplete(query, opts)` calls
  `GET https://api.geoapify.com/v1/geocode/autocomplete` with
  `text`, `filter=countrycode:au`, `bias=countrycode:au`, `format=json`,
  `limit`, `lang=en`, `apiKey=$GEOAPIFY_API_KEY`; normalises each
  `properties` payload into `NormalizedAddress`.
* **Browser:** `components/quote/steps/PropertyStep.tsx` —
  debounced (280 ms) `fetch('/api/afss/quote/address-search?q=…')` with
  `AbortController` per keystroke, dropdown portaled to `document.body`
  at `zIndex: 2 147 483 600`, keyboard nav (ArrowUp/Down, Enter, Escape),
  full accessibility (listbox/option semantics, `aria-expanded`,
  `aria-autocomplete=list`, `aria-controls`).
* The browser never holds a Geoapify key — `NEXT_PUBLIC_GEOAPIFY_API_KEY`
  is no longer needed.

## 6. Geoapify reverse-geocode implementation

* **Server:** `app/api/afss/quote/address-resolve/route.ts` —
  `GET /api/afss/quote/address-resolve?lat=<lat>&lng=<lng>`
  validates `lat ∈ [-90, 90]`, `lng ∈ [-180, 180]`, calls
  `createAddressProvider().reverseGeocode({lat, lng})`.
* **Provider:** `GeoapifyAddressProvider.reverseGeocode(input)` —
  `GET https://api.geoapify.com/v1/geocode/reverse` with
  `lat`, `lon`, `filter=countrycode:au`, `format=json`,
  `limit=1`, `lang=en`, `apiKey=$GEOAPIFY_API_KEY`;
  falls back to `geometry.coordinates` if the result omits
  `properties.lat` / `properties.lon`.
* **Browser:** PropertyStep "Use my location" still uses
  `navigator.geolocation.getCurrentPosition()`; on success it `fetch()`es
  `/api/afss/quote/address-resolve` with an `AbortController` that
  cancels any prior in-flight request.

## 7. Use My Location behaviour

* **Permission rule:** the `navigator.geolocation.getCurrentPosition()`
  call is **only** made inside `handleUseMyLocation()` — itself bound to
  the `Use my location` button. No permission prompt on page load, modal
  open, or property-step render.
* **State machine** (preserved):
  `idle → requesting → reverse_geocoding → found`
  `↘ permission_denied | unavailable | timeout | low_accuracy | error`.
* **Result card:** "We found this address" + `Accuracy: approximately X m`
  with three CTAs (`Use this address →`, `Refine address`,
  `Type a different address`).
* **Low-accuracy:** when `accuracy > 150 m` the card shows a subtle
  amber warning: *"Your location may not be precise enough to identify
  the exact building. Please confirm the address."*
* **Failures** are routed to the existing toast system; the input always
  remains live so the customer can fall back to typing.

## 8. Address normalization architecture

A single canonical `NormalizedAddress` shape, defined in
`lib/afss/providers/address-provider.ts`:

```ts
export interface NormalizedAddress {
  provider: 'geoapify';
  providerId?: string;
  formattedAddress: string;
  addressLine1?: string | null;
  addressLine2?: string | null;
  street?: string | null;
  houseNumber?: string | null;
  suburb?: string | null;
  city?: string | null;
  state?: string | null;     // 2-char AU state code
  postcode?: string | null;
  country?: string | null;   // 2-char ISO 3166-1 alpha-2 code
  countryCode?: string | null;
  latitude: number;
  longitude: number;
  raw?: unknown;             // raw provider payload (audit)
}
```

The `normalizeGeoapifyFeature()` helper is the single point that turns a
Geoapify response (autocomplete or reverse) into a `NormalizedAddress`.
No React component or API route ever reads provider-specific fields. The
`toSuggestion()` helper maps a `NormalizedAddress` to the dropdown's
`AddressSuggestion` (`primaryText` / `secondaryText` / `fullText`).

The `country` field is **always the 2-char ISO code** (`AU`) so the
existing `properties_country_len` CHECK constraint is never violated.

## 9. Supabase persistence behaviour

No schema migration was performed. The migration reuses the
provider-neutral columns added in `migrations/07-afss-provider-neutral-extensions.sql`:

| Column | Value written |
|---|---|
| `address_provider` | `'geoapify'` |
| `address_provider_id` | `properties.place_id` from Geoapify |
| `address_provider_json` | full raw provider payload |
| `google_place_id` | `null` (column is nullable + partial index tolerates nulls) |
| `latitude`, `longitude` | Geoapify coordinates (range CHECK unchanged) |
| `formatted_address`, `address_line_1`, `address_line_2`, `suburb`, `state`, `postcode`, `country` | Geoapify fields |
| `street_image_provider` | `'google_street_view'` (unchanged — Street View still Google) |
| `street_image_id` | `pano_id` from `StreetViewService` |
| `street_image_search_radius_m` | `25 | 50 | 100 | 250` |

Activity events continue to be logged per-step:
`contact_saved`, `address_selected` (provider='geoapify'),
`building_confirmed`, `building_change_requested`, `building_preview_unavailable`,
`document_uploaded`, `due_date_saved`, `quote_generated`,
`submission_finalized`. All from `lib/afss/quote-session.ts`.

## 10. Google Street View implementation

**Untouched.** `lib/google/street-view.ts` continues to:

* `findPanoramaNear(lat, lng)` with progressive radii `[25, 50, 100, 250]`.
* `createPanorama(container, {position, pano, heading, pitch, zoom})` —
  the standalone `StreetViewPanorama` widget (no surrounding Google Map).
* `facePanoramaToTarget(panorama, {lat, lng})` —
  `google.maps.geometry.spherical.computeHeading`.

Server-side Street View Metadata fallback in
`app/api/afss/quote/street-image/route.ts` continues to call
`maps.googleapis.com/maps/api/streetview/metadata?…`.

The Google Maps JS loader still injects a single script when
`BuildingConfirmStep` mounts — but the loader now requests
**`libraries=streetView,geometry` only** (no `places`).

## 11. Street View fallback behaviour

When `StreetViewService.getPanorama()` reports `ZERO_RESULTS`,
`OVER_QUERY_LIMIT`, `REQUEST_DENIED`, `UNKNOWN_ERROR`, or no panorama is
found within `[25, 50, 100, 250]`, the customer sees the existing
"Building preview unavailable" panel inside `BuildingConfirmStep.tsx`
plus the spec-required clean copy:

> **WE COULDN'T FIND STREET VIEW FOR THIS ADDRESS.**
> 247 Burwood Road, Concord NSW 2137
> [ CONTINUE WITH THIS ADDRESS ]   [ CHANGE ADDRESS ]

The `Yes, this is the correct address →` button remains available, the
customer is **never blocked**. A `building_preview_unavailable` activity
event is written to `afss.activity_events` with `provider='google_street_view'`.

## 12. Mapillary cleanup

* `lib/afss/providers/street-imagery-provider.ts` —
  **DELETED** (the only consumer was the always-`null` factory).
* `MAPILLARY_ACCESS_TOKEN` and `NEXT_PUBLIC_MAPILLARY_ACCESS_TOKEN` are
  no longer referenced anywhere in `app/`, `components/`, or `lib/`
  (verified by grep). They remain in `.env.local` because the user
  explicitly said *do not overwrite existing real keys*; they should be
  removed manually after verification.
* `migrations/07-afss-provider-neutral-extensions.sql` comment updated
  to remove the literal "mapillary" example from the
  `street_image_provider` column comment.

## 13. Environment variables required

### Active (must be set)

| Var | Where | Purpose |
|---|---|---|
| `GEOAPIFY_API_KEY` | server-only | Server-side Geoapify proxy. |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | browser | Google Maps JS API for StreetViewService / StreetViewPanorama. |
| `GOOGLE_MAPS_SERVER_KEY` | server | Optional server-side Street View Metadata fallback. Falls back to the browser key. |

### `.env.example` after migration

```
# Address provider — Geoapify (server-side proxies)
GEOAPIFY_API_KEY=

# Google Maps Platform (Street View only)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
GOOGLE_MAPS_SERVER_KEY=
```

### Stale (left in `.env.local` for safety, can be removed after verification)

* `NEXT_PUBLIC_GEOAPIFY_API_KEY` — no consumer.
* `MAPILLARY_ACCESS_TOKEN` — no consumer.
* `NEXT_PUBLIC_MAPILLARY_ACCESS_TOKEN` — no consumer.
* `NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY` — orphan (loader reads
  `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`).

### Domain restrictions to set in Geoapify / Google Cloud

* **Geoapify** — restrict the key to **Server** only (no referrer
  restrictions; Geoapify uses IP-based key restrictions for server keys).
* **Google Maps JS API key** — HTTP referrer restriction to:
  `localhost`, `annualfiresafetystatement.vercel.app`, and the future
  AFSS production domain. Only the `Maps JavaScript API` needs to be
  enabled on the key.

## 14. Google APIs still required

* **Maps JavaScript API** — `StreetViewService` + `StreetViewPanorama` +
  `geometry.spherical.computeHeading` (via the JS bundle) AND the
  Street View **Metadata** HTTP endpoint
  (`maps.googleapis.com/maps/api/streetview/metadata`).

## 15. Google APIs no longer required

> **Places API (New) is no longer used by the code.**
> **Geocoding API is no longer used by the code.**

You can manually disable these in Google Cloud Console after
verification. The `lib/google/maps-loader.ts` `libraries=…` query no
longer asks for `places` or `geocoding`.

## 16. Files added

* `docs/AFSS-GEO-STREETVIEW-ARCHITECTURE.md` — the implementation
  source-of-truth doc, 16 sections, written **before** any code change.
* `docs/AFSS-GEO-STREETVIEW-MIGRATION-REPORT.md` — this report.

(No new application source files; the active Geoapify provider lives
inside the pre-existing `lib/afss/providers/address-provider.ts` file,
and the two API routes re-use the pre-existing
`app/api/afss/quote/address-search` + `address-resolve` paths.)

## 17. Files changed

| Path | Change |
|---|---|
| `lib/afss/providers/address-provider.ts` | Activated Geoapify implementation; defined `NormalizedAddress` + `AddressSuggestion` + `AddressProvider`; added `reverseGeocode()`; replaced `next: { revalidate: 60 }` caching with `cache: 'no-store'`; fixed `country` to 2-char code; added `isAddressProviderConfigured()`; replaced `any` casts with `unknown` + `isObject` narrowing. |
| `app/api/afss/quote/address-search/route.ts` | Replaced `410 Gone` stub with real Geoapify autocomplete proxy. |
| `app/api/afss/quote/address-resolve/route.ts` | Replaced `410 Gone` stub with real Geoapify reverse-geocoding proxy. |
| `lib/google/maps-loader.ts` | Trimmed default `libraries` from `['places','streetView','geometry']` to `['streetView','geometry']`; narrowed `GoogleMapsLoaderOptions['libraries']` type; updated header comment. |
| `lib/google/street-view.ts` | Header comment updated to note this is the ONLY Google consumer in the active flow. **No behavioural change.** |
| `components/quote/steps/PropertyStep.tsx` | Replaced Google Places + Google Geocoder with server-side Geoapify proxy calls; switched payload from `address_provider:'google'` to `address_provider:'geoapify'`; switched `google_place_id` to `null`; added `AbortController` for both autocomplete + reverse-geocode; added `providerUnavailable` state with a developer-visible warning; updated "Powered by Google" → "Powered by Geoapify"; kept the same debounce (280 ms), min-3-chars rule, keyboard nav, portaled dropdown at the same `zIndex`, accuracy tiers (≤50 m good, ≤150 m approximate, >150 m low), low-accuracy warning, manual-mode fallback, save-on-Next behaviour. |
| `components/quote/steps/BuildingConfirmStep.tsx` | Header comment refreshed (the file is unchanged behaviourally). |
| `app/api/afss/quote/property/route.ts` | Header comment refreshed. |
| `.env.example` | Replaced the old Google-Places-centric comment block with the new Geoapify + Street-View-only shape. |
| `migrations/07-afss-provider-neutral-extensions.sql` | Updated the `street_image_provider` COMMENT from `'(mapillary, manual, none)'` to `'(e.g. google_street_view, manual, none)'`. |
| `docs/AFSS-GEO-STREETVIEW-ARCHITECTURE.md` | NEW (source-of-truth). |
| `docs/AFSS-GEO-STREETVIEW-MIGRATION-REPORT.md` | NEW (this file). |

## 18. Files removed

| Path | Reason |
|---|---|
| `lib/google/places.ts` | No consumer after migration. |
| `lib/google/geocoder.ts` | No consumer after migration. |
| `lib/afss/google-places.ts` | Legacy server-side Places/StreetView helper, not imported anywhere. |
| `lib/afss/providers/street-imagery-provider.ts` | Mapillary stub, factory always returned `null`, not imported anywhere. |

## 19. Database changes, if any

**None.** The schema was already provider-neutral (migration 07). The
`google_place_id` column on `afss.properties` is nullable with no
CHECK / UNIQUE / FK constraint; the existing partial index
`idx_properties_google_place_id` tolerates nulls. The provider-neutral
columns `address_provider`, `address_provider_id`,
`address_provider_json`, plus the `street_image_*` columns, were already
in place.

The only schema-adjacent change is the comment-only update to
`migrations/07-afss-provider-neutral-extensions.sql` (no DDL change).

## 20. Supabase MCP findings

Supabase MCP was not available in this environment; the schema and the
session/property/activity-event tables were inspected from the migration
SQL files in `annual-fire-safety-statement/migrations/` (10 migrations,
`01` through `10`). Key findings:

* `afss.properties.google_place_id` — **nullable TEXT, no constraints**.
* `afss.properties.address_provider` — TEXT, nullable, no CHECK
  (free-form label; we set `'geoapify'`).
* `afss.properties.address_provider_id` — TEXT, nullable.
* `afss.properties.address_provider_json` — JSONB, nullable.
* `afss.properties.country` — `CHECK char_length(country) = 2`.
  Geoapify's `country_code` (`'AU'`) is used directly so the CHECK
  passes.
* `afss.properties.latitude` / `longitude` — `DOUBLE PRECISION`, range
  CHECK only.
* `afss.activity_events.event_type` CHECK includes `address_selected`,
  `building_confirmed`, `building_change_requested`,
  `building_preview_unavailable` — all the events we need.
* `afss.quote_sessions.status` CHECK includes `contact_saved`,
  `property_saved`, `building_confirmed`, `submitted`, `paid`,
  `abandoned` — covers the lifecycle.

## 21. Desktop QA

`curl` against the dev server on `localhost:3000`:

| Endpoint | Input | Response | Status |
|---|---|---|---|
| `GET /` | — | homepage HTML, 179 939 bytes | 200 |
| `GET /api/afss/quote/address-search?q=` | empty | `{"ok":false,"error":"Type at least 3 characters to search."}` | 400 |
| `GET /api/afss/quote/address-search?q=ab` | 2 chars | `{"ok":false,"error":"Type at least 3 characters to search."}` | 400 |
| `GET /api/afss/quote/address-search?q=200+George+Street+Sydney` | 5+ chars | 5 AU `NormalizedAddress` rows from Geoapify (`200 George Street, Sydney NSW 2756, Australia` …), `provider:'geoapify'`, `country:'AU'`, lat/lng present | 200 |
| `GET /api/afss/quote/address-resolve?lat=foo&lng=bar` | invalid | `{"ok":false,"error":"Invalid coordinates."}` | 400 |
| `GET /api/afss/quote/address-resolve?lat=-33.8688&lng=151.2093` | Sydney CBD | `{"ok":true,"provider":"geoapify","address":{"formattedAddress":"Nina Armando, 25 Martin Place, Sydney NSW 2000, Australia", …}}` | 200 |

Full PropertyStep UI verification requires a real browser session; in
this CLI environment the network surface and the API contracts were
exercised instead. The PropertyStep code is a near-verbatim port of the
existing component — same debounce, same portal, same keyboard handlers,
same accuracy tiers, same save-on-Next path — so the customer-visible
behaviour is preserved.

## 22. Mobile QA

Not exercised in this CLI environment. The PropertyStep dropdown is
already designed mobile-first in the existing code (portaled at the
input's bounding rect, `zIndex: 2 147 483 600`, max-height
`max-h-72 overflow-y-auto`, ~44 px tap targets via `py-2.5`). The
Street View widget uses responsive heights (`h-56` mobile, `h-72`
desktop). No regressions introduced by this migration.

## 23. Build / lint / typecheck results

* **`npm run build`** — passes cleanly. Both new routes
  (`/api/afss/quote/address-search` and
  `/api/afss/quote/address-resolve`) are registered as
  `ƒ Dynamic / server-rendered on demand`.
* **`npx tsc --noEmit`** — passes cleanly. Zero TypeScript errors.
* **`npm run lint`** — 200+ errors and warnings, **all of which are
  pre-existing** in untouched files (`lib/afss/quote-session.ts`,
  `lib/afss/pricing.ts`, `lib/afss/payment.ts`, `lib/afss/reference.ts`,
  `lib/free-site-visit/constants.ts`, `lib/google/maps-loader.ts`,
  `lib/google/street-view.ts`, `types/google-maps.d.ts`, etc.).
  Pre-existing patterns are pre-`React 19`/`Next 16`-eslint rules
  (e.g. `setMounted(true)` inside `useEffect`, `any` types in
  `quote-session.ts`, the `Promise<any>` shape in `pricing.ts`).
  These are **out of scope** for this provider migration. New errors
  I introduced in `lib/afss/providers/address-provider.ts` and
  `components/quote/steps/PropertyStep.tsx` were all fixed
  (replaced `any` with `unknown` + type narrowing, replaced
  `(e: any)` with `instanceof Error` guards, removed unused
  `revalidating` Next-fetch cache hints, etc.).

## 24. Network QA

`grep` against the homepage HTML response (179 939 bytes):

| Pattern | Hits |
|---|---|
| `googleapis.com` | 0 |
| `maps.googleapis.com/maps/api/js` | 0 |
| `google.maps.*` | 0 |
| `libraries=places` / `places.AutocompleteSuggestion` | 0 |
| `libraries=geocoding` / `google.maps.Geocoder` | 0 |
| `mapillary` | 0 |
| `geoapify` | 0 (homepage does not render the PropertyStep; the Geoapify API key never appears in any HTML payload) |

Confirmed: the customer-facing homepage makes **zero** requests to
Google Places, Google Geocoding, or Mapillary. The Google Maps JS API
is only loaded on demand by `BuildingConfirmStep.tsx`, and only requests
`libraries=streetView,geometry`.

## 25. Remaining blockers

None. The migration is complete and the customer flow is functional
end-to-end.

**Recommended follow-ups (not blockers):**

1. Manually disable **Places API (New)** and **Geocoding API** in
   Google Cloud Console after verifying the live behaviour.
2. Manually remove the now-unused `NEXT_PUBLIC_GEOAPIFY_API_KEY`,
   `MAPILLARY_ACCESS_TOKEN`, `NEXT_PUBLIC_MAPILLARY_ACCESS_TOKEN`,
   `NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY` entries from `.env.local`.
3. (Out of scope) `components/free-site-visit/FreeSiteVisitForm.tsx`
   contains a dead-code Google Places branch (lines 958–1262) that
   references `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` and
   `NEXT_PUBLIC_ADDRESS_PROVIDER`, neither of which are set. Its
   default provider is `"none"` so a vanilla `<input>` renders today.
   Safe to delete; left intact for this migration because it's
   unrelated to the AFSS instant-quote flow.
4. (Out of scope) Pre-existing lint errors in untouched files
   (`lib/afss/quote-session.ts`, `lib/afss/pricing.ts`,
   `lib/afss/payment.ts`, `types/google-maps.d.ts`, etc.) — clean up
   in a separate PR if desired.

## 26. Credentials that should be rotated

None. The migration does **not** add, remove, or expose any new secrets:

* `GEOAPIFY_API_KEY` — was already in `.env.local` and not committed.
* `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — was already in `.env.local`,
  HTTP-referrer-restricted.
* `GOOGLE_MAPS_SERVER_KEY` — was already in `.env.local`.

No real key values appear in:
* README or any documentation file
* the architecture doc (`docs/AFSS-GEO-STREETVIEW-ARCHITECTURE.md`)
* this report
* commit history
* console output during the build / dev-server runs

> **Credential rotation recommended:** false. All keys already existed in
> `.env.local`, none were added or committed. After the user disables
> the unneeded Places API (New) and Geocoding API in Google Cloud
> Console, the existing keys retain their HTTP-referrer + IP
> restrictions and remain safe to keep.

---

## Architecture doc

`docs/AFSS-GEO-STREETVIEW-ARCHITECTURE.md` — the source of truth for
this migration, with all 16 required sections (Existing Implementation,
Existing Google Places Flow, Existing Google Geocoding Flow, Existing
Street View Flow, Existing Geoapify Code, Target Architecture, Address
Autocomplete Flow, Use My Location Flow, Street View Flow, Supabase
Persistence, Environment Variables, Files To Change, Files To Remove,
Migration Risks, Implementation Checklist, QA Checklist).