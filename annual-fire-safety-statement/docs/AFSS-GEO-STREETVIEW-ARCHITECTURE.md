# AFSS Geo + Street View Architecture

> Source of truth for the AFSS instant-quote provider migration.
> This document is the implementation contract for moving the active customer
> flow from **Google Places / Google Geocoder** to **Geoapify**, while keeping
> **Google Maps JS API** for **Street View only**. Everything below has been
> derived from a complete read-through of the existing code, the migrations,
> and the schema.

---

## 1. Existing Implementation

The AFSS Instant Quote is a Next.js 16 (App Router, React 19.2) wizard mounted
inside a single `<InstantQuoteModal />` instance reachable from the Hero,
Header and Footer CTAs via a module-singleton (`lib/quote/open.ts`).

Six customer-facing steps:

```
1 contact → 2 property → 3 building_confirmation → 4 document → 5 due_date → 6 quote/payment → 7 success
```

The wizard calls **service-role Supabase** exclusively through
`lib/afss/quote-session.ts`. All session state is server-authoritative; the
`afss_session` HttpOnly cookie carries the token; `quote_sessions.session_token_hash`
is the lookup key. Abandoned leads are captured by writing `last_activity_at`
on every step via a Postgres trigger and by emitting `activity_events` rows
for every save.

The full DB layer lives under the dedicated Postgres schema `afss`:

* `afss.quote_sessions` — cookie-bound session + lifecycle (`current_step`,
  `status`, contact details, due date, payment preference).
* `afss.properties` — one row per session; `properties_one_per_session
  UNIQUE (quote_session_id)`. `google_place_id` is **optional**.
  `address_provider`, `address_provider_id`, `address_provider_json` are
  provider-neutral and **already exist** (added in migration 07).
* `afss.documents` — uploaded AFSS files in the private `afss-private` bucket.
* `afss.activity_events` — append-only audit + abandoned-lead capture.

`RULE: nothing in this migration may add new customer-facing routes or
disrupt the cookie / hashing / save-on-next behaviour.`

---

## 2. Existing Google Places Flow (active)

**Browser-side. Single client SDK call. Lives in two files only:**

* `lib/google/maps-loader.ts` — custom `<script>`-tag loader; injects
  `https://maps.googleapis.com/maps/api/js?key=…&loading=async&libraries=places,streetView,geometry`,
  caches via `google.maps.importLibrary()`.
* `lib/google/places.ts` — `fetchAddressSuggestions(query, {locationBias})` →
  `places.AutocompleteSuggestion.fetchAutocompleteSuggestions(...)` with
  `includedRegionCodes:['au']`, `language:'en-AU'`, `region:'AU'`,
  `AutocompleteSessionToken`; `fetchPlaceDetails(placeId)` →
  `new Place({id}).fetchFields(['id','formattedAddress','addressComponents',
  'location','displayName'])`.

Consumed by:

* `components/quote/steps/PropertyStep.tsx` — debounced 280 ms, min 3 chars,
  portaled `<ul>` with `zIndex: 2147483600`, full keyboard nav.

Persistence: the selected suggestion is fetched as `Place`, normalised into
`NormalisedAddress`, then POSTed to `/api/afss/quote/property` with
`address_provider:'google'`, `address_provider_id: <placeId>` and
`google_place_id:<placeId>` (legacy column still populated).

Server-side fallback (unused): `lib/afss/google-places.ts` (legacy
`place/details/json` helper). It is **not imported anywhere** and must be
deleted as part of this migration.

---

## 3. Existing Google Geocoding Flow (active)

`lib/google/geocoder.ts` — `reverseGeocode(lat, lng)` →
`new google.maps.Geocoder().geocode({location:{lat,lng}})`, picks the first
AU result.

Called only from `components/quote/steps/PropertyStep.tsx`
`handleUseMyLocation()` after `navigator.geolocation.getCurrentPosition`
succeeds. The state machine is:

```
idle → requesting → reverse_geocoding → found
                  ↘ permission_denied
                    unavailable
                    timeout
                    low_accuracy
                    error
```

UI shows "We found this address" with accuracy in metres
(≤ 50 m good, ≤ 150 m approximate, > 150 m low) and three buttons
(`Use this address`, `Refine address`, `Type a different address`).

This Google path **must be removed** and replaced with a Geoapify reverse
geocode call. The browser still owns `navigator.geolocation`; only the
server that turns `(lat,lng)` into an address changes.

---

## 4. Existing Street View Flow (active — keep)

Two layers, both already correct for the target architecture:

### 4.1 Client (`lib/google/street-view.ts`)

* `findPanoramaNear(lat, lng, radii?)` — `StreetViewService.getPanorama(
  {location, radius, preference:'nearest', source:'outdoor'})` with
  progressive radii `[25, 50, 100, 250]`.
* `createPanorama(container, options)` — `new google.maps.StreetViewPanorama(
  container, {position, pano, heading, pitch, zoom, addressControl:false,
  showRoadLabels:true, linksControl:true, panControl:true,
  enableCloseButton:false, fullscreenControl:false, motionTracking:false,
  visible:true})`.
* `facePanoramaToTarget(panorama, target)` — uses
  `google.maps.geometry.spherical.computeHeading(from,to)` to face the
  camera at the target building.

### 4.2 Server (`app/api/afss/quote/street-image/route.ts`)

`GET` — server-side Street View **Metadata** HTTP call (`…/maps/api/streetview/metadata?…`)
using `GOOGLE_MAPS_SERVER_KEY ?? NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`,
progressive radii `[25, 50, 100, 250]`, persists
`street_image_provider='google_street_view'`, `street_image_id=panoId`,
`street_image_search_radius_m`, `street_image_json` to `afss.properties`.
Logs `address_selected` (with `provider:'google_street_view'`) or
`building_preview_unavailable`.

`POST` — receives the surfaced `pano_id`/lat/lng/radius from the in-browser
widget and persists it (`pano_changed`/`position_changed`, debounced 600 ms
on the client).

Both stay. `lib/google/street-view.ts` and `types/google-maps.d.ts` are
**required** and must not be removed.

---

## 5. Existing Geoapify Code

Geoapify was previously the active address provider, then was migrated away
from and replaced with Google Places. The original implementation is still
in the tree as **deprecated reference code**:

* `lib/afss/providers/address-provider.ts` — header reads
  *"DEPRECATED. The active customer-facing flow now uses Google Places API
  (New) in the browser..."*. Contains a `GeoapifyAddressProvider` class and
  a `createAddressProvider()` factory that **always returns `null`** so
  callers no-op.
  * Endpoint: `https://api.geoapify.com/v1/geocode/autocomplete`
  * Params: `text`, `filter: countrycode:au`, `format: json`, `limit`,
    `bias: countrycode:au`, `lang: en`, `apiKey`
  * `autocomplete(q, limit)` uses `fetch(url, {next:{revalidate:60}})`
    (server-side fetch).
  * `resolveInline(suggestion)` is a pure copy into `ResolvedAddress` —
    **no API call** (because the suggestion already contains everything
    we need).
* `app/api/afss/quote/address-search/route.ts` — `410 Gone` stub.
* `app/api/afss/quote/address-resolve/route.ts` — `410 Gone` stub.

`.env.local` already declares both `GEOAPIFY_API_KEY` (server) and
`NEXT_PUBLIC_GEOAPIFY_API_KEY` (browser). The current code reads **neither**
of them. `package.json` has **no Geoapify SDK** — pure REST.

The migration **re-activates** the Geoapify provider, fills in the missing
methods, and turns the two 410 stubs into the production server-side proxy.

---

## 6. Target Architecture

```
                   AFSS QUOTE
                       │
                       ▼
             CUSTOMER DETAILS (ContactStep)
                       │
                       ▼
                SUPABASE SAVE (afss.quote_sessions)
                       │
                       ▼
              BUILDING ADDRESS (PropertyStep)
                       │
                       ▼
              GEOAPIFY AUTOCOMPLETE
              GET /api/afss/quote/address-search?q=…&sessionId=…
                  ↓
                  lib/afss/providers/address-provider.ts (GeoapifyAddressProvider)
                  ↓ server-side fetch with GEOAPIFY_API_KEY
                  https://api.geoapify.com/v1/geocode/autocomplete
                       │
                       ▼
               NORMALIZED ADDRESS
                  + LAT / LNG
                       │
                       ▼
                SUPABASE SAVE (POST /api/afss/quote/property)
                       │
                       ▼
            GOOGLE STREET VIEW (BuildingConfirmStep)
              StreetViewService.findPanoramaNear(lat,lng)
                       │
                       ▼
             StreetViewPanorama (interactive 360°)
                       │
                       ▼
              CONFIRM BUILDING → POST /api/afss/quote/confirm-building
                       │
                       ▼
                SUPABASE SAVE
                       │
                       ▼
                  AFSS UPLOAD → DUE DATE → QUOTE → SUBMISSION
```

USE MY LOCATION PATH:

```
USE MY LOCATION  (only after explicit click)
      │
      ▼
navigator.geolocation.getCurrentPosition
      │
      ▼
LAT / LNG / accuracy
      │
      ▼
GET /api/afss/quote/address-resolve?lat=…&lng=…&sessionId=…
      │
      ▼
GEOAPIFY REVERSE GEOCODING (server-side, GEOAPIFY_API_KEY)
      │
      ▼
CUSTOMER CONFIRMS ADDRESS
      │
      ▼
GOOGLE STREET VIEW
```

Boundary contract:

| Concern | Owner |
|---|---|
| Address autocomplete | **Geoapify** (browser ↔ Next.js API route ↔ Geoapify) |
| Reverse geocoding | **Geoapify** (browser ↔ Next.js API route ↔ Geoapify) |
| Forward/reverse `lat,lng` resolution for `afss.properties` | **Geoapify** |
| "Use my location" device coordinates | **Browser** (`navigator.geolocation`) |
| Building imagery (360° panorama) | **Google Maps JS API** (Street View only) |
| Server-side Street View metadata fallback | **Google Maps HTTP API** |
| Quote session, property persistence, abandoned lead capture | **Supabase** (`afss` schema, service-role) |

The browser **never** calls Geoapify or Google directly for **address** data;
the browser only calls Google directly for the **Street View widget**.
`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` stays only for that Street View widget.

---

## 7. Address Autocomplete Flow (Geoapify)

### 7.1 Client (`components/quote/steps/PropertyStep.tsx`)

* Debounce **280 ms** (matches the existing UX).
* Minimum query length **3** characters.
* `AbortController` per request — keystroke / backspace cancels the prior
  request before it can mutate the dropdown.
* Keyboard: ArrowUp / ArrowDown / Enter / Escape / click.
* Dropdown is portaled to `document.body` via `createPortal`; positioned
  with `useLayoutEffect` reading the input's bounding rect; `zIndex:
  2147483600` (matches the existing UX).
* AU restriction: server enforces `filter=countrycode:au`,
  `bias=countrycode:au`; UI shows up to **5** suggestions.

### 7.2 Server (`app/api/afss/quote/address-search/route.ts`)

* `GET` handler. Reads `q` from the query string, validates length and
  basic shape, calls Geoapify:

  ```
  GET https://api.geoapify.com/v1/geocode/autocomplete
      ?text=<q>
      &filter=countrycode:au
      &bias=countrycode:au
      &format=json
      &limit=5
      &lang=en
      &apiKey=<GEOAPIFY_API_KEY>
  ```

* Returns a JSON envelope:

  ```ts
  {
    ok: true,
    provider: "geoapify",
    suggestions: [
      {
        providerId: string,
        formatted: string,
        addressLine1: string | null,
        addressLine2: string | null,
        street: string | null,
        houseNumber: string | null,
        suburb: string | null,
        city: string | null,
        state: string | null,
        postcode: string | null,
        country: string,
        countryCode: string,
        latitude: number,
        longitude: number,
        raw: <geoapify properties>
      }
    ]
  }
  ```

* Hard-errors return `{ok:false, error:"…"}` with appropriate HTTP status.
* No cookies; no Supabase reads; rate-limit-friendly (no API key in URL on
  the public side).

### 7.3 Provider (`lib/afss/providers/address-provider.ts`)

Single shared interface; the server route imports the implementation.

```ts
export interface AddressProvider {
  readonly name: "geoapify";
  autocomplete(query: string, opts?: { limit?: number; signal?: AbortSignal })
    : Promise<NormalizedAddress[]>;
  reverseGeocode(input: { lat: number; lng: number; signal?: AbortSignal })
    : Promise<NormalizedAddress | null>;
}
```

`GeoapifyAddressProvider` implements it. `createAddressProvider()` returns
a process-wide singleton of the real implementation.

`NormalizedAddress` is the canonical shape used by both `PropertyStep`
and the server route — components never see raw Geoapify fields.

### 7.4 Selecting an address

When the user picks a suggestion:

1. Populate the visible input with `formatted`.
2. Store the `NormalizedAddress` locally (`resolvedAddress`).
3. Capture `lat` / `lng`.
4. POST to `/api/afss/quote/property` with `address_provider:'geoapify'`,
   `address_provider_id:<providerId>`, full address components, lat/lng.
5. Enable the `Continue` button.

No Google Place ID is required. `google_place_id` is sent as `null`.

---

## 8. Use My Location Flow

### 8.1 Permission rule (hard)

* **No** `navigator.geolocation` call on page load.
* **No** location prompt on modal open.
* **No** location prompt when the property step first renders.
* Permission is requested **only after** the explicit click on
  `USE MY LOCATION`.

### 8.2 State machine (matches the existing one)

```
idle → requesting → reverse_geocoding → found
                  ↘ permission_denied
                    unavailable
                    timeout
                    low_accuracy
                    error
```

### 8.3 Steps

1. Click → `navigator.geolocation.getCurrentPosition(
   { enableHighAccuracy:true, maximumAge:0, timeout:10_000 })`.
2. `lat`, `lng`, `accuracy` (metres) flow into the UI card.
3. `GET /api/afss/quote/address-resolve?lat=…&lng=…` →
   `GeoapifyAddressProvider.reverseGeocode(...)` →
   server-side `GET https://api.geoapify.com/v1/geocode/reverse
       ?lat=…&lng=…
       &format=json
       &filter=countrycode:au
       &lang=en
       &apiKey=<GEOAPIFY_API_KEY>`.
4. Card shows `formatted`, `accuracy`, with three CTAs:
   * `Use this address` → continues with the normalised result.
   * `Refine address` → puts `formatted` back in the input + refocusses.
   * `Type a different address` → leaves the card and re-shows the input.
5. If accuracy is poor, a subtle warning is appended:
   *"Your location may not be precise enough to identify the exact
   building. Please confirm the address."*

### 8.4 Failures (must not dead-end the quote)

| Failure | Surface |
|---|---|
| `permission_denied` | Toast: "Location access was blocked. You can still type your address below." |
| `POSITION_UNAVAILABLE` | Toast: "Your device couldn't determine a location. You can still type your address below." |
| `TIMEOUT` | Toast: "Location lookup took too long. You can still type your address below." |
| `low_accuracy` (accuracy > 150 m) | Show the result with the soft warning above. |
| `reverse_geocode` HTTP error | Toast: "We couldn't look up that location. Please type your address." |
| Empty reverse-geocode result | Toast: "No Australian address found for that location. Please type your address." |

Every failure path leaves the user at the autocomplete input. The quote is
never blocked.

---

## 9. Street View Flow

### 9.1 Trigger

Loaded **only after** PropertyStep has successfully POSTed to
`/api/afss/quote/property` AND the user has reached BuildingConfirmStep.
The Google Maps loader does not run on the homepage and does not run when
the quote modal opens — it runs when Step 3 actually mounts.

### 9.2 Process

1. BuildingConfirmStep calls `/api/afss/quote/property-get` to read the
   persisted `lat` / `lng`.
2. `findPanoramaNear(lat, lng)` (progressive radii `[25, 50, 100, 250]`)
   — already implemented, **kept as-is**.
3. On success → `createPanorama(container, …)` →
   `facePanoramaToTarget(panorama, {lat, lng})`.
4. `pano_changed` / `position_changed` listeners POST to
   `/api/afss/quote/street-image` (debounced 600 ms).
5. UI: "IS THIS YOUR BUILDING?" + `YES, THAT'S IT` + `CHANGE ADDRESS`.

### 9.3 Fallback (no coverage / rate limit / server key error)

UI shows the **clean fallback** the spec requires:

```
WE COULDN'T FIND STREET VIEW FOR THIS ADDRESS.
<formatted address>
[ CONTINUE WITH THIS ADDRESS ]
[ CHANGE ADDRESS ]
```

`building_preview_unavailable` activity event is logged with the same
metadata shape used today.

### 9.4 Things the Street View step MUST NOT do

* Render a normal Google Map.
* Persist any Google imagery to Supabase / Storage.
* Cache / screenshot panoramas.

The `street_image_*` columns on `afss.properties` are filled with metadata
only (`pano_id`, radius, provider='google_street_view', `street_image_json`).

---

## 10. Supabase Persistence

### 10.1 Property step (`POST /api/afss/quote/property`)

Already provider-neutral. After this migration:

* `address_provider` = `'geoapify'`
* `address_provider_id` = Geoapify's `properties.place_id` (or `properties.osm_id` if `place_id` is missing).
* `address_provider_json` = raw Geoapify feature.
* `google_place_id` = **null** (column is already nullable; partial index
  tolerates nulls).
* `latitude`, `longitude`, `formatted_address`, `address_line_1`,
  `address_line_2`, `suburb`, `state`, `postcode`, `country='AU'` — same as
  before.
* `quote_sessions.current_step` advanced to `'building_confirmation'`,
  `status` advanced to `'property_saved'`. Activity event `address_selected`
  with metadata `{provider:'geoapify', provider_id}`.

### 10.2 Building confirmation

* `properties.building_confirmed = true`,
  `building_confirmed_at = now()`.
* `street_image_provider = 'google_street_view'`,
  `street_image_id = <pano_id>`,
  `street_image_search_radius_m = <radius>`,
  `street_image_json = {pano_id, latitude, longitude, …}`.
* `quote_sessions.current_step = 'document'`,
  `status = 'building_confirmed'`.
* Activity event `building_confirmed`.

### 10.3 "Change address"

* `properties.building_confirmed = false`.
* Activity event `building_change_requested`.
* User returns to PropertyStep with the previously typed text re-populated.

### 10.4 Save timing (already correct)

Each step saves immediately, before the next one renders. Abandoned leads
are captured via `last_activity_at` and per-step `activity_events`. **No
changes required to the save timing.**

### 10.5 No schema migration required

`google_place_id` is nullable with no CHECK / UNIQUE / FK. The existing
partial index `idx_properties_google_place_id … WHERE google_place_id IS
NOT NULL` tolerates nulls. The provider-neutral columns already exist
from migration 07.

---

## 11. Environment Variables

### 11.1 Final set (in `.env.local`)

```
# Geoapify — server-side only
GEOAPIFY_API_KEY=…

# Google Maps JS — used by StreetViewService / StreetViewPanorama
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=…

# Google Maps — server-side Street View metadata fallback
GOOGLE_MAPS_SERVER_KEY=…
```

`NEXT_PUBLIC_GEOAPIFY_API_KEY` is **no longer required** by the active
flow (the server proxy hides the secret). It can remain in `.env.local`
for future local debugging but is removed from `.env.example`.

`MAPILLARY_ACCESS_TOKEN` and `NEXT_PUBLIC_MAPILLARY_ACCESS_TOKEN` are
**removed** from `.env.local` and `.env.example`. Mapillary has no active
consumer.

`NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY` (orphan) is removed from
`.env.local` and `.env.example`. It was never read by the loader.

### 11.2 Browser exposure

* `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — exposed. Restrict via Google Cloud
  console HTTP referrer to:
  * `localhost`
  * `annualfiresafetystatement.vercel.app`
  * the future production domain (TBD).
* `GEOAPIFY_API_KEY` — **server only**. Geoapify account should have API
  key restrictions set to `Server` only, with no `localhost` allowance for
  the server key.

### 11.3 `.env.example`

```
# Geoapify (server-side proxy for address autocomplete + reverse geocoding)
GEOAPIFY_API_KEY=

# Google Maps JS — Street View only
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
GOOGLE_MAPS_SERVER_KEY=
```

No real values. No Mapillary. No `NEXT_PUBLIC_GEOAPIFY_API_KEY` (kept off
the example unless the client-side path is ever re-enabled).

---

## 12. Files To Change

| Path | Change |
|---|---|
| `lib/afss/providers/address-provider.ts` | Activate `GeoapifyAddressProvider`. Add `reverseGeocode()`. Make `createAddressProvider()` return the real singleton. Define `NormalizedAddress`. Export `AddressProvider` interface. |
| `lib/google/maps-loader.ts` | Drop `places` from the `libraries=…` query. Keep `streetView` and `geometry`. Still required. |
| `app/api/afss/quote/address-search/route.ts` | Replace 410 stub with real Geoapify autocomplete proxy. |
| `app/api/afss/quote/address-resolve/route.ts` | Replace 410 stub with real Geoapify reverse-geocode proxy. |
| `components/quote/steps/PropertyStep.tsx` | Replace Google Places + Google Geocoder calls with the server-side Geoapify proxy. Same UX, same debounce, same keyboard nav, same portal, same AU restriction. |
| `lib/afss/validation.ts` | Verify it accepts the Geoapify payload without `google_place_id`. (Already does.) |
| `app/api/afss/quote/property/route.ts` | No structural change. Provider label is `'geoapify'` now. Optional doc-comment update. |
| `app/globals.css` | No structural change. |
| `.env.example` | Replace Geoapify / Mapillary / orphan browser-key entries with the final three vars above. |
| `migrations/07-afss-provider-neutral-extensions.sql` | Update the stale comment on `street_image_provider` ("…mapillary, manual, none…") to remove the Mapillary reference. |
| `components/quote/steps/PropertyStep.tsx` (file header) | Update the file-level deprecation note that still says "We never call any Geoapify / Mapillary endpoint". |
| `components/quote/steps/BuildingConfirmStep.tsx` (file header) | Update the file-level note that says "No Geoapify or Mapillary requests are made" — keep it accurate. |
| `docs/AFSS-HOMEPAGE-CONTENT-AUDIT.md` | Update the one QA-scan row that references Geoapify / Mapillary in customer copy. |
| `docs/AFSS-HOMEPAGE-REDESIGN.md` | Update the stack prose from "Google Places/Street View" to "Geoapify + Google Street View". |

---

## 13. Files To Remove

| Path | Reason |
|---|---|
| `lib/google/places.ts` | No longer used; the only consumer was `PropertyStep`, which now hits the Geoapify proxy. |
| `lib/google/geocoder.ts` | No longer used; reverse geocoding goes through Geoapify. |
| `lib/afss/google-places.ts` | Server-side legacy Places helper — already unused. |
| `lib/afss/providers/street-imagery-provider.ts` | Mapillary stub; `createStreetImageryProvider()` already returns null. Nothing imports it. |
| `components/_DEPRECATED_legacy_instant_quote_modal.tsx` | Out of scope, but already prefixed `_DEPRECATED_`. **Keep** for now — not touched by this migration. |

`components/free-site-visit/FreeSiteVisitForm.tsx` contains a dead-code
Google Places branch (lines 958–1262) and reads `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY`
+ `NEXT_PUBLIC_ADDRESS_PROVIDER`, neither of which exist in any env file.
Its default provider is `"none"` and the vanilla input fallback is what
actually renders. **Keep the file as-is** for this migration — its Google
branch is unreachable and removing it is out of scope. (Documented here so
the user is aware.)

---

## 14. Migration Risks

| Risk | Mitigation |
|---|---|
| Geoapify autocomplete latency feels slower than Google Places' in-browser SDK. | Server proxy + 280 ms debounce keeps the UX tight. Show "Searching addresses…" while in flight. |
| Stale autocomplete responses race the latest keystroke. | `AbortController` on every request; ignore responses whose `signal` is aborted. |
| Geoapify rate limit. | Server route short-circuits on missing `GEOAPIFY_API_KEY` with a clean toast. Limit is not currently a problem for AU consumer traffic. |
| Google Street View suddenly unavailable for a property. | Already handled by the documented fallback panel + `building_preview_unavailable` event. |
| `maps-loader.ts` accidentally re-loads `places`. | Trim `libraries=…` to `streetView,geometry`. Add a comment so a future PR doesn't re-add `places`. |
| Browser hot-loads Google Maps on every page load. | Don't load Google Maps in `app/layout.tsx`. Keep the loader invocation inside `BuildingConfirmStep` only. (Current behaviour — verified.) |
| A future feature accidentally re-introduces Google Places. | Remove `lib/google/places.ts`. Remove `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` references from `FreeSiteVisitForm.tsx` (out of scope this round, but flagged). |
| `google_place_id` accidentally set to a fake ID. | Always send `null` for Geoapify addresses; rely on `address_provider` / `address_provider_id`. |
| Stale SQL comment on `street_image_provider` mentioning "mapillary". | Trivial update in migration 07 (no DDL change — comment-only). |

---

## 15. Implementation Checklist

```
[ ] 1. Read all files listed in §12 + §13.
[ ] 2. Activate lib/afss/providers/address-provider.ts:
        [ ] NormalizedAddress shape
        [ ] AddressProvider interface
        [ ] GeoapifyAddressProvider.autocomplete() (server-side fetch)
        [ ] GeoapifyAddressProvider.reverseGeocode() (server-side fetch)
        [ ] createAddressProvider() returns the real singleton
[ ] 3. app/api/afss/quote/address-search/route.ts
        [ ] GET handler
        [ ] Validates q (length, type)
        [ ] Returns {ok, provider, suggestions[]} envelope
[ ] 4. app/api/afss/quote/address-resolve/route.ts
        [ ] GET handler
        [ ] Validates lat/lng
        [ ] Returns {ok, address} envelope
[ ] 5. lib/google/maps-loader.ts
        [ ] libraries=streetView,geometry (drop places)
        [ ] Add comment that places is intentionally absent
[ ] 6. components/quote/steps/PropertyStep.tsx
        [ ] Replace fetchAddressSuggestions / fetchPlaceDetails
        [ ] Replace reverseGeocode
        [ ] Same debounce, keyboard nav, portal, AU restriction
        [ ] Send address_provider:'geoapify' to /property
        [ ] Update file header
[ ] 7. components/quote/steps/BuildingConfirmStep.tsx
        [ ] No code change expected
        [ ] Update file header (remove the now-incorrect "No Geoapify or Mapillary" line)
[ ] 8. Delete:
        [ ] lib/google/places.ts
        [ ] lib/google/geocoder.ts
        [ ] lib/afss/google-places.ts
        [ ] lib/afss/providers/street-imagery-provider.ts
[ ] 9. Verify:
        [ ] lib/afss/validation.ts accepts payload without google_place_id
        [ ] app/api/afss/quote/property/route.ts logs address_selected
        [ ] app/api/afss/quote/street-image/route.ts still calls Google metadata
        [ ] app/globals.css untouched
[ ] 10. Docs:
        [ ] .env.example updated
        [ ] migrations/07-afss-provider-neutral-extensions.sql comment fixed
        [ ] docs/AFSS-HOMEPAGE-CONTENT-AUDIT.md row updated
        [ ] docs/AFSS-HOMEPAGE-REDESIGN.md stack prose updated
        [ ] THIS document committed
[ ] 11. Build / lint / typecheck
[ ] 12. Browser QA (Desktop + Mobile)
```

---

## 16. QA Checklist

Run all 12 cases from the spec:

```
[ ] 1. Type "200 George Street Sydney" → Geoapify suggestions.
        Select → address + lat/lng save. Street View attempts to load.
[ ] 2. Type an incomplete Australian address → relevant AU suggestions only.
[ ] 3. Use my location → permission prompt only after click.
        Coordinates retrieved → reverse geocode → user confirms → Street View.
[ ] 4. Deny geolocation permission → friendly message. Autocomplete still works.
[ ] 5. Street View unavailable → fallback panel. Customer can continue.
[ ] 6. Change address → return to address step. Confirmation cleared.
[ ] 7. Refresh after address save → session/property resume as before.
[ ] 8. Mobile autocomplete → no clipping, correct z-index, ~44px tap targets.
[ ] 9. Mobile Street View → touch gestures work, no horizontal overflow.
[ ] 10. Network: zero Google Places autocomplete requests.
[ ] 11. Network: zero Google Geocoding requests.
[ ] 12. Network: zero Mapillary requests.
```

Network inspection must show:

* `GET /api/afss/quote/address-search?q=…` → 200 → `api.geoapify.com/v1/geocode/autocomplete?…`
* `GET /api/afss/quote/address-resolve?lat=…&lng=…` → 200 → `api.geoapify.com/v1/geocode/reverse?…`
* `GET https://maps.googleapis.com/maps/api/js?…&libraries=streetView,geometry` → 200 (only after reaching BuildingConfirmStep)
* `GET https://maps.googleapis.com/maps/api/streetview/metadata?…` → 200 (server-side fallback)
* No requests to `maps.googleapis.com/maps/api/place/…`.
* No requests to `maps.googleapis.com/maps/api/geocode/…` (browser-side).
* No requests to `graph.mapillary.com/…`.

---

## Final report contract

After implementation, the migration must produce a final report covering
the 26 sections listed at the bottom of the user's brief. In particular:

* "Maps JavaScript API: STILL REQUIRED" (Street View only).
* "Places API (New): NO LONGER REQUIRED BY THIS APP".
* "Geocoding API: NO LONGER REQUIRED BY THIS APP".

The user will then disable the no-longer-required APIs in Google Cloud
manually after verifying the report.