# AFSS Instant Quote — Handoff Document

> **Purpose:** This document is the complete state of the project at the end of the previous session. The next Claude should read this file FIRST, then receive the user's new prompt, then act on it.

---

## 1. Project Identity

- **Client:** Annual Fire Safety Statement (AFSS) website — NSW, Australia
- **Working directory:** `c:\Users\S-300V5A\Downloads\annualfiresafetystatement`
- **Inner Next.js project:** `annual-fire-safety-statement/`
- **Supabase project:** `https://snvmpjgutnsphgwmbcjs.supabase.co`
- **Tech stack:** Next.js 16.3.1, React 19, Tailwind 4, TypeScript 5, @supabase/supabase-js, @supabase/ssr, Stripe Node SDK
- **CRITICAL:** This is Next.js 16 — conventions differ from older versions. Read `node_modules/next/dist/docs/` before writing app code. React 19 only.

---

## 2. What Has Been Built

### Database (Supabase, project `snvmpjgutnsphgwmbcjs`)

**Strategy:** Dedicated PostgreSQL schema `afss` — fully isolated from other websites sharing this Supabase project. PostgREST exposes only `public`, so `afss` is invisible to other apps. All AFSS access is server-side via service role key.

**Schema:** `afss`

**10 tables** (all RLS enabled + forced, all revoked from anon/authenticated, service_role has full CRUD):

| Table | Phase | Purpose |
|---|---|---|
| `quote_sessions` | 1 | Central session record |
| `properties` | 1 | Building + Google references |
| `documents` | 1 | File metadata |
| `activity_events` | 1 | Audit log |
| `document_extractions` | 3 | OCR output (provider-agnostic) |
| `fire_safety_measures` | 3 | Normalized measure rows |
| `pricing_rules` | 4 | Pricing inputs (production/test) |
| `quotes` | 4 | Versioned quote records |
| `quote_line_items` | 4 | Explainable breakdown |
| `payments` | 5 | Payment records + audit |

**Sequence:** `afss.quote_reference_seq` (monotonic, format `AFSS-YYYY-NNNNNN`)

**Storage bucket:** `afss-private` (private, 50 MiB, PDF/JPG/PNG/TIFF only)

**Migrations applied** (also saved as numbered local files in `migrations/`):

| # | Version | File name |
|---|---|---|
| 01 | `20260819075744` | `01-afss-schema-foundation.sql` |
| 02 | `20260819075817` | `02-afss-private-storage-bucket.sql` |
| 03 | `20260819081410` | `03-afss-grants-for-service-role.sql` |
| 04 | `20260819082913` | `04-afss-last-activity-trigger.sql` |
| 05 | `20260819083255` | `05-afss-phase3-4-5-tables.sql` |
| 06 | `20260819084959` | `06-afss-relax-payment-amount-when-blocked.sql` |

### Code (Next.js)

**API route handlers** (`app/api/afss/`):

```
app/api/afss/
├── quote/
│   ├── contact/route.ts           # Step 1 save
│   ├── property/route.ts          # Step 2 save (POST)
│   ├── property-get/route.ts      # Step 2 read (GET)
│   ├── confirm-building/route.ts  # Step 2 YES/CHANGE
│   ├── document-upload/route.ts   # Step 3 file upload
│   ├── document-fallback/route.ts # Step 3 "I can't find"
│   ├── due-date/route.ts          # Step 4 save
│   ├── trigger-extraction/route.ts # Step 5 doc → measures
│   ├── generate-quote/route.ts    # Step 5 measures → quote
│   ├── create-payment/route.ts    # Pay/Book (BLOCKED)
│   └── status/route.ts            # Current session summary
└── webhooks/
    └── stripe/route.ts            # Stripe webhook handler
```

**Library files** (`lib/afss/` and `lib/supabase/`):

```
lib/supabase/
├── admin.ts          # Service role client (server only)
└── server.ts          # Public client (browser, unused)

lib/afss/
├── session.ts         # Cookie + token utilities (SHA-256 hashing)
├── validation.ts      # Server-side input validation
├── reference.ts       # Quote reference generator
├── types.ts           # Shared TypeScript types
├── quote-session.ts   # Repository helpers (CRUD via cookies)
├── document-processor.ts       # Abstract DocumentProcessor interface
├── google-document-ai-processor.ts # Google Document AI implementation
├── google-places.ts   # Server-side Places + Street View helpers
├── pricing.ts         # Deterministic pricing engine (no fake prices)
└── payment.ts         # Stripe payment architecture (BLOCKED_BY_BUSINESS_RULE)
```

**UI components** (`components/quote/`):

```
components/quote/
├── InstantQuoteModal.tsx       # Responsive modal shell
├── QuoteFlow.tsx               # Step orchestrator
├── QuoteProgress.tsx           # Progress bar
├── GetInstantQuoteButton.tsx   # Drop-in launcher
└── steps/
    ├── ContactStep.tsx
    ├── PropertyStep.tsx        # Google Places autocomplete
    ├── BuildingConfirmStep.tsx  # Street View + YES/CHANGE
    ├── DocumentStep.tsx        # File upload + "I can't find"
    ├── DueDateStep.tsx
    ├── ProcessingStep.tsx      # Triggers extraction + pricing
    └── QuoteResultStep.tsx     # Manual review OR automatic quote
```

**Environment files** (created at project root):
- `annual-fire-safety-statement/.env.local` (gitignored, real secrets)
- `annual-fire-safety-statement/.env.example` (template, committed)

---

## 3. What Is Configured vs Missing

### ✅ Configured
- Supabase URL
- Supabase secret key (`sb_secret_C…`)
- Supabase publishable key (for browser, currently unused)
- All database tables, indexes, RLS, triggers
- All API routes wired up
- All UI components built
- Pricing engine built — empty `afss.pricing_rules` table → returns manual_review_required
- Stripe SDK installed and code wired — but `resolvePaymentType()` hardcoded to return `null` → all payments blocked

### ❌ Missing (needed for full functionality)

| What's missing | What it does | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY` | Address autocomplete + Street View panorama in browser | Google Cloud Console → APIs & Services → Credentials |
| `GOOGLE_MAPS_SERVER_KEY` | Server-side Place Details + Street View metadata | Google Cloud Console → server-restricted key |
| `GOOGLE_DOC_AI_PROJECT_ID` | Document AI project | Google Cloud → Document AI → Create processor |
| `GOOGLE_DOC_AI_LOCATION` | `australia-southeast1` (Sydney) | — |
| `GOOGLE_DOC_AI_PROCESSOR_ID` | The Custom Extractor / Form Parser processor | After creating processor |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to service-account JSON | Google Cloud → IAM → Service Accounts |
| `STRIPE_SECRET_KEY` | Live Stripe payments | Stripe Dashboard |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe.js browser | Stripe Dashboard |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification | Stripe Dashboard → Webhooks |
| **Pricing rules data** | Any actual prices | Pete/Ken must supply |
| **Payment model decision** | full / deposit / booking_fee / assessment_fee | Pete/Ken must confirm |

### Code-level decisions still BLOCKED

In [lib/afss/payment.ts](annual-fire-safety-statement/lib/afss/payment.ts):
```typescript
function resolvePaymentType(): 'full' | 'deposit' | 'booking_fee' | 'assessment_fee' | null {
  // Until Pete/Ken explicitly configures one of these, return null.
  return null;
}
```

This is intentional — until the user (or Pete/Ken) provides the answer, the `createPaymentIntent` function always returns `blocked_by_business_rule: true` and the UI shows the "manual review" screen.

---

## 4. Customer Flow (Working Today)

The flow is fully wired up and works end-to-end at the database/UI level. The only thing missing is the upstream Google APIs for the actual address/street view rendering.

### Step-by-step what happens when a customer opens the modal

1. **Step 1 — Contact** (works without any external API)
   - User enters first name, email, mobile
   - POSTs to `/api/afss/quote/contact`
   - Server validates, creates `quote_sessions` row, generates `AFSS-YYYY-NNNNNN` reference, generates random SHA-256 token, writes HttpOnly cookie, logs `contact_saved` event
   - User sees "Step 2 of 6"

2. **Step 2 — Address** (needs Google Maps browser key for autocomplete)
   - User types an Australian address
   - **WITH Google key:** JS AutocompleteSuggestion API returns AU-only suggestions, user selects one, browser hits `PlacesService.getDetails` to get full place info, sends to server
   - **WITHOUT Google key:** manual entry fallback
   - POSTs to `/api/afss/quote/property`
   - Server upserts `properties` (one-per-session), advances session to `building_confirmation`
   - User sees "Step 3 of 6"

3. **Step 2 confirmation** (needs Google Maps browser key for Street View)
   - User sees Street View panorama at the saved lat/lng
   - **WITH Google key:** real panorama renders
   - **WITHOUT Google key:** "preview unavailable" state
   - "YES, THAT'S IT →" or "CHANGE ADDRESS" → POSTs to `/api/afss/quote/confirm-building`
   - Server sets `building_confirmed=true`, advances to `document`

4. **Step 3 — Document upload** (works today, no external API needed for upload itself)
   - User drops PDF/JPG/PNG/TIFF (max 50 MB)
   - POSTs as multipart to `/api/afss/quote/document-upload`
   - Server validates MIME (rejects .exe etc.), uploads to private bucket, creates `documents` row, creates pending `document_extractions` row
   - "I CAN'T FIND MY AFSS →" → POSTs to `/api/afss/quote/document-fallback`, sets `document_choice='cannot_find'`, preserves lead
   - User sees "Step 5 of 6"

5. **Step 4 — Due date** (works today)
   - User picks date OR clicks "I'm not sure"
   - POSTs to `/api/afss/quote/due-date`
   - Server sets `afss_due_date` + `due_date_known`
   - User sees "Step 6 of 6"

6. **Step 5 — Processing** (needs Document AI for real extraction; pricing is always BLOCKED)
   - UI triggers `/api/afss/quote/trigger-extraction` then `/api/afss/quote/generate-quote`
   - **No Document AI configured:** extraction returns `needs_review`, 0 measures detected
   - **No pricing rules:** quote is `manual_review_required` with reason "Pricing rules have not been supplied by Pete/Ken yet."
   - User sees the "We've got what we need. Your AFSS needs a quick review before we confirm your price." screen

### Failure recovery
- Google Places error → manual entry fallback
- Street View unavailable → graceful empty state
- Document upload failure → error message, retry, lead preserved
- OCR failure → status=`needs_review`, lead preserved
- No pricing rules → `manual_review_required`, lead preserved
- Payment blocked → audit-only `payments` row, no charge

---

## 5. Security Model

- **anon role:** zero privileges on `afss` schema + all 10 tables
- **authenticated role:** zero privileges
- **service_role:** full CRUD via BYPASSRLS — used by Next.js server only
- **SESSION_TOKEN:** random 32-byte hex, only SHA-256 hash stored in DB, raw token in HttpOnly Secure SameSite=Lax cookie
- **Storage bucket:** private, no public policies, only service_role can access
- **No NEXT_PUBLIC_ secret keys** — browser has no Supabase credentials
- **Cascade behavior:** child records of a session CASCADE-delete with the session (properties, documents, events). Quotes → session is RESTRICT (financial records). Payments → session is RESTRICT.

---

## 6. Decisions Log

| Decision | Choice | Why |
|---|---|---|
| Schema strategy | Dedicated `afss` schema | Shared Supabase DB with other future sites; clean isolation |
| Session identity | UUID + separate human `quote_reference` + cookie-hash for browser | URLs never expose UUIDs; cookie hash not raw token |
| File upload | Server-side via service role | Browser never sees Supabase keys |
| Quote references | PostgreSQL sequence | Race-condition-free vs COUNT(*)+1 |
| Document AI | Google Document AI (preferred) | Best for structured forms; AU region (`australia-southeast1`) keeps data in Australia |
| Pricing | Read from `afss.pricing_rules` only | No hidden prices in code; LLM never decides prices |
| Payment provider | Stripe | AUD, hosted Checkout, PCI handled, mature refunds |
| Payment gating | `resolvePaymentType()` returns null until Pete/Ken confirms | Enforced (not TODO) gate |
| RLS | Enabled + forced on all tables, no policies for anon/authenticated | Defense in depth; service role bypasses |
| Storage | Private bucket, no policies | Server-only access via signed URLs |

---

## 7. Outstanding Questions for Pete/Ken

1. **Pricing rules** — base fee, per-measure cost, travel/postcode zones, urgency multipliers, minimum charges, GST treatment (inclusive vs exclusive)
2. **Payment model** — full / deposit / booking fee / assessment fee, and which dollar amount
3. **Quote validity period** — how many days until a quote expires
4. **AFSS due-date reminder cadence** — informs future cron
5. **Data retention schedule** — currently nothing is auto-deleted
6. **Google API budget cap** — per-month ceiling?
7. **Document AI choice** — Google Document AI confirmed, or evaluate Mistral OCR / Azure DI?
8. **AFSS measure taxonomy** — canonical `normalized_measure_key` values
9. **Cancellation / refund policy** — informs Stripe webhook flows
10. **Staff authentication location** — same Supabase project or separate?

---

## 8. Things the User May Want to Do Next

The user may ask for any of the following (in priority order the user has shown interest in):

1. **Wire up free APIs** (no API key or free tier) so the flow works without paying:
   - Replace Google Places with **Photon** (free, no key) or **Mapbox** (100k free/month)
   - Replace Google Street View with static map + customer photo upload
   - Replace Google Document AI with **Tesseract.js** (browser, free) or **Mistral OCR** (free tier)

2. **Add the Google Cloud keys** to `.env.local` so the full Google-based experience works

3. **Add Stripe keys** (requires Pete/Ken to confirm payment model first)

4. **Add pricing rules** to the database (requires Pete/Ken to supply actual prices)

5. **Build a staff/admin dashboard** for reviewing `needs_review` quotes

6. **Add email notifications** (Resend / SendGrid) when quotes go to manual review

7. **Wire up abandoned-session cleanup** (a cron job that marks sessions abandoned after N days)

---

## 9. Known Gotchas for Next Claude

- **MCP `execute_sql` does NOT keep transactions open across calls.** Use single statements or `BEGIN; ... COMMIT;` in one call. If a `BEGIN` block returns without explicit `COMMIT`, the connection closes and rolls back.
- **MCP `apply_migration` runs SQL server-side** — it can do `CREATE EXTENSION`, `INSERT INTO storage.buckets`, etc. Sequencestaxes are not transactional.
- **MCP `supabase` server may be intermittently rate-limited** — if a call fails, retry.
- **The existing `InstantQuoteJourneySection.tsx` in `components/` is the OLD cosmetic version** — do NOT touch it. The new flow is in `components/quote/`. The new `GetInstantQuoteButton` is the launcher.
- **The Next.js 16 cookies API is async** — `await cookies()`, not `cookies()`.
- **The browser never sees `SUPABASE_SECRET_KEY`** — only `NEXT_PUBLIC_*` publishable keys, which are currently unused.
- **The Document AI stub intentionally returns `needs_review`** — this is correct behavior until credentials are added. Do NOT fake extraction results.
- **The pricing engine returns `manual_review_required`** when no rules exist — this is correct behavior until Pete/Ken supplies rules. Do NOT invent prices.
- **The `payment.ts` `resolvePaymentType()` is intentionally returning `null`** — this is the enforced BLOCKED_BY_BUSINESS_RULE gate. Do NOT change it without Pete/Ken's explicit confirmation.

---

## 10. How to Use This Handoff

The next Claude should:

1. **Read this file in full** (especially sections 1, 3, 4, 9)
2. **Skim the existing code** to confirm current state matches sections 2 and 5
3. **Read the user's new prompt** (which will follow this handoff)
4. **Combine them** — the new prompt will likely build on existing functionality

The handoff ends. The user's new prompt follows.
