# AFSS Homepage Redesign — Implementation Source of Truth

> Owner: AFSS engineering
> Site: https://annualfiresafetystatement.vercel.app/
> Stack: Next.js 16.3.1 (App Router, Turbopack default), React 19.2, Tailwind v4, Supabase, Google Places/Street View, Stripe.
> Status of this document: **active — drives implementation**. Update checklist items as they ship.

This file is the canonical plan for the homepage redesign. It is intentionally long so the entire redesign intent lives in one place. Section files referenced here are co-located in `components/home/`.

---

## 1. Project Goal

The current homepage reads as a generic fire-protection site. The new homepage must read, within seconds, as a **specialist AFSS service in Sydney / NSW** — and convert visitors into the existing instant-quote flow without breaking any backend.

Specifically, when a NSW property owner lands on the site, within a few seconds they should understand:

- **WHAT** it is — Annual Fire Safety Statement (AFSS) support.
- **WHO** needs it — owners / agents of applicable buildings in NSW.
- **WHAT THEY NEED TO DO** — get their AFSS, get an assessment, lodge annually.
- **WHAT THE INSPECTION INVOLVES** — review of schedule, physical assessment, performance check.
- **HOW THE PROCESS WORKS** — schedule → assessment → issues → statement → lodge.
- **WHAT IT COSTS** — pricing presentation (see §17).
- **WHAT HAPPENS IF THEY ARE LATE** — penalty framing (legally accurate).
- **WHO CAN ASSESS THE MEASURES** — accredited practitioner scope.
- **WHY THEY SHOULD TRUST THIS PROVIDER** — NSW-accredited, real workflow, secure docs.
- **HOW TO GET STARTED** — the above-the-fold quote starter.

The result must feel **specialist, trustworthy, NSW-focused, commercial, clear, modern, premium, mobile-first** — and unmistakably about **Annual Fire Safety Statements**.

---

## 2. Pete's Requirements (non-negotiable)

1. The site is a **separate AFSS business / brand**. No All Fire cross-promotion. No Peter. No "Book the Boss". No All Fire socials / history / projects / testimonials. No orange/yellow palette. Treat as an independent AFSS service provider.
2. Preserve the existing approved AFSS visual identity — navy `#0b1d36`, blue `#1c4d9c`, restrained red `#b0141f`, paper white `#ffffff`, cool neutrals. Reuse the current `--` design tokens.
3. Keep the current typography (Inter via `next/font/google`, Geist Mono for numerics). Don't introduce a novelty display font.
4. Place a **quote starter above the fold** (the IECC concept) — first name / email / mobile only, then "Start my quote →". After save, open the existing Instant Quote modal at the Building step. No duplicate quote sessions.
5. Show the **NSW AFSS document** as a recognisable hero visual (overlapping pages 1/2/3 stack).
6. Build the homepage around the **customer's decision journey**, not a numbered information dump.

---

## 3. Brand Rules

| Token | Value | Use |
|---|---|---|
| `--color-navy` | `#0b1d36` | Primary text, dark surfaces, primary CTA fill |
| `--color-blue` | `#1c4d9c` | Secondary brand, links, focus, accent rule |
| `--color-accent-red` | `#b0141f` | Sparingly — document red rule, penalty highlight, AFSS dot |
| `--color-ink-muted` | `#3a4a63` | Body copy |
| `--color-line` | `#e3e7ee` | Hairlines, card borders |
| `--color-surface-alt` | `#f5f7fa` | Quiet panels |
| `--font-sans` | `var(--font-inter)` + Arial fallback | Body, headings |
| `--font-mono` | `var(--font-geist-mono)` + ui-monospace | Tabular nums, doc meta |

Banned palette: `#fb5614`, `#fc0403`, "All Fire gradient" oranges, gold/yellow.

The wordmark stays **AFSS / ANNUAL FIRE SAFETY STATEMENTS / SYDNEY NSW / COMPLIANCE · CLARITY · CONFIDENCE**. No All Fire.

---

## 4. Current Homepage Audit

Order in `app/page.tsx` before this redesign:

1. `AfssHeroSection` — "Your AFSS isn't just paperwork. It's a responsibility." + AFSS document panel + "Get an instant quote" CTA.
2. `AfssRecognitionSection` — "Have you got an AFSS?" — three pathway options + sample AFSS image.
3. `InstantQuoteJourneySection` — "Your building. Your AFSS. Your quote." — 4-step process icons + "Get an instant quote" CTA.
4. `KnowYourDocumentsSection` — Three documents (AFSS, FSS, FSC) with rotating sample images.
5. `WhatIsAnAfssSection` — 8 numbered info items in 2-col grid + icon bar.
6. `ComplianceSection` — **contains "ALLFIRE: YOUR AFSS SOLUTION PROVIDER"** and "ALLFIRE Fire Protection Management" copy. Must be rewritten.
7. `TheProcessSection` — 5-step process timeline.
8. `FireSafetyScheduleSection` — actually 4 sub-sections: what's in your statement, due date clock, accredited practitioners, AS 1851-2012.
9. `ContactCTA` — **contains Peter image, "Book the Boss" copy, Impact / Oswald font, orange.** Must be replaced for homepage.
10. Global `FreeSiteVisitIsland` (mounted in layout) auto-opens at 30s and includes a chatbot.
11. Global `SitewideCTA` (used inside ContactCTA) — orange / "Book the Boss". Must be removed from homepage flow.

Issues addressed by this redesign:
- Hero doesn't lead with the AFSS H1.
- No above-the-fold quote starter — entry points are mid-page.
- "Instant Quote Journey" repeats what the quote modal already is.
- Three separate document previews (KnowYourDocuments + AfssRecognition + hero) is repetitive.
- ComplianceSection has hard-coded "ALLFIRE" copy.
- ContactCTA leads with Peter / "Book the Boss" / orange.
- SitewideCTA repeats Peter / orange.
- SitewideCTA also depends on `app/sitewide-cta.css` — a separate file with All Fire styling.
- The `<html>` element does not have `data-scroll-behavior="smooth"`, so Next.js 16 scroll override during navigation is off by default — current `globals.css` has `scroll-behavior: smooth` on `<html>`, which is fine.
- The Footer carries All Fire socials (Facebook/Instagram/LinkedIn/YouTube/TikTok/X with allfireservices URLs).
- The Header carries the same All Fire socials.

---

## 5. Content Problems Identified

- "Annual Fire Safety Statements. Sorted." — OK as a brand promise but appears in both hero and footer. Reduce to one canonical place (footer wordmark).
- "Your AFSS isn't just paperwork. It's a responsibility." — replaced by the direct, SEO-strong H1.
- "AFSS isn't just paperwork" framing implied customers were confused; now we lead with the document itself.
- The "All Fire" content blocks must be removed across all homepage-touching components.
- Internal notes ("Pete/Ken must configure pricing") are not visible publicly; we surface only the public-facing "Your AFSS needs a quick review" message when rules are not loaded — this is acceptable because the engine already returns that message from `lib/afss/pricing.ts`.

---

## 6. Proposed Information Architecture

Homepage section order:

```
HEADER                              (components/Header.tsx)
└─ AFSS logo, simplified nav, quote CTA, mobile drawer.

HERO                                 (components/home/Hero.tsx)
└─ H1: Annual Fire Safety Statement (AFSS)
   Eyebrow + supporting copy + above-fold quote starter (3 fields).
   AFSS document visual on the right.

01 / GOT YOUR AFSS?                  (components/home/GotYourAfss.tsx)
└─ Three pathway tiles leading into the same quote journey.

02 / HOW IT WORKS                    (components/home/HowItWorks.tsx)
└─ 5-step process timeline.

03 / WHAT THE INSPECTION INVOLVES    (components/home/InspectionInvolves.tsx)
└─ 6-step editorial timeline + real inspection image + CTA.

04 / DOES MY BUILDING NEED AN AFSS?  (components/home/NeedsAfss.tsx)
└─ Building categories + CTA.

05 / WHAT IS AN AFSS?                (components/home/WhatIsAfss.tsx)
└─ Straightforward narrative + AFSS document visual.

06 / WHAT GETS ASSESSED?             (components/home/MeasuresAssessed.tsx)
└─ "Schedule determines what applies" + measure list.

07 / DUE DATE & PENALTIES            (components/home/DueDatePenalties.tsx)
└─ Annual cycle + verified penalty framing + CTA.

08 / ACCREDITED PRACTITIONERS        (components/home/AccreditedPractitioners.tsx)
└─ Scope, schedule-led, current accreditation. Link to register.

09 / PROJECTS                        (components/home/Projects.tsx)
└─ data/projects.ts driven. Empty-safe.

10 / PARTNERS                        (components/home/Partners.tsx)
└─ data/partners.ts driven. Empty-safe.

11 / TESTIMONIALS                    (components/home/Testimonials.tsx)
└─ Single large editorial testimonial + 01/04 counter. Empty-safe.

12 / KNOW YOUR DOCUMENTS             (components/home/KnowYourDocuments.tsx)
└─ AFSS / FSS / FSC explainer.

13 / AS 1851-2012                    (components/home/AS1851.tsx)
└─ Supporting section. INSPECT / TEST / MAINTAIN / RECORDS.

FAQ                                 (components/home/FAQ.tsx)
└─ Conversion-focused questions.

FINAL CTA                            (components/home/FinalCTA.tsx)
└─ "Your AFSS due? Let's get it sorted." — primary CTA + phone + email.

FOOTER                              (components/Footer.tsx)
└─ AFSS brand only. No All Fire socials.
```

---

## 7. Header Specification

Hierarchy:
- Left: AFSS logo (`/logo.png`, alt="Annual Fire Safety Statement").
- Centre (desktop): primary nav — `How It Works`, `AFSS Requirements`, `Inspection`, `Projects`, `FAQs`, `Contact`.
- Right: `Call 1300 765 594` (tel link) + primary CTA `Get my AFSS quote` → opens `InstantQuoteModal`.

Behaviour:
- Sticky top, white background, navy hairline border.
- Top utility strip removed (it carried All Fire socials).
- Mobile: logo left, phone icon + Get Quote CTA + menu toggle right.
- Mobile drawer slides down with the same nav + a `Call 1300 765 594` button + a `Get my AFSS quote` button.
- Active route underline uses blue `#1c4d9c`.

Implementation: `components/Header.tsx` is rewritten. `navLinks` array is updated in `lib/site.ts` to the new structure (Home alias removed because `/` is the current page; About dropped in favour of the leaner set). Pages keep their routes — `/services`, `/accreditation`, `/new-legislation`, `/sample`, `/contact-us` still resolve. The header links to **anchors** on the homepage for `How It Works`, `Inspection`, `Projects`, `FAQs`, and to `/contact-us` for Contact.

---

## 8. Hero Specification

Goal: communicate, in <5 seconds, "this is about the AFSS in NSW, and you can start your quote now".

Composition:
- Eyebrow: `ANNUAL FIRE SAFETY STATEMENTS · SYDNEY NSW` (uppercase, blue, tracking).
- H1: `Annual Fire Safety Statement (AFSS)` — single line on desktop, two on mobile. Bold, navy, tight tracking. **Only H1 on the page**.
- Sub-headline: `Get your Annual Fire Safety Statement organised without the runaround.`
- Three trust chips: `NSW Accredited Practitioners`, `Compliant with current regulation`, `Secure document handling`.
- Quote starter (3 fields): `First name`, `Email`, `Mobile` + `Start my quote →`.
  - On submit: POST `/api/afss/quote/contact` (existing endpoint). On success, open `InstantQuoteModal` which will resolve to step 2 (Building) because the contact endpoint already advances `current_step` to `property`.
  - Trust microcopy: `Saved securely. No account required.`
- Right column: stacked AFSS document visual — three pages of the sample AFSS asset overlapping slightly, with a small navy rule across the top and a single red accent rule on page 3 (the existing `doc-panel` aesthetic).

Mobile order: eyebrow → H1 → sub-headline → quote starter → trust chips → AFSS document visual. The right column moves below the quote starter.

---

## 9. Homepage Section Specifications

### 9.1 Got Your AFSS? (01)
Heading: `Got your AFSS?` Sub: `Pick the starting point that matches your paperwork.`
Three pathways, full-bleed rows (not cards), each with title + description + arrow. All three open the Instant Quote modal; the path can be reflected in URL hash for analytics but **do not** create separate quote sessions.

- `I HAVE MY AFSS` — Upload your current Annual Fire Safety Statement.
- `I HAVE MY FIRE SAFETY SCHEDULE` — Start with your building's Fire Safety Schedule.
- `I CAN'T FIND EITHER` — That's okay. We can still help you get started.

### 9.2 How It Works (02)
Heading: `Your AFSS, step by step.`
Five horizontal steps with connecting line and arrows (desktop), vertical timeline (mobile):
1. Send us your documents — AFSS or Fire Safety Schedule.
2. We review your building — confirm property and applicable requirements.
3. Assessment — applicable measures assessed by accredited practitioners.
4. Address any issues — items needing attention identified before completion.
5. Your AFSS — prepare the Annual Fire Safety Statement.

### 9.3 What the Inspection Involves (03)
Heading: `What the inspection involves.`
Lead: `An AFSS assessment is more than a paperwork check. The applicable fire safety measures identified on the Fire Safety Schedule are assessed against the required standard of performance.`
Six-step vertical timeline (desktop) / horizontal scroll (mobile), each with a navy numeric badge + title + one-line description:
1. Review the Fire Safety Schedule.
2. Inspect applicable measures.
3. Check performance.
4. Identify issues.
5. Record the assessment.
6. Prepare the statement.

Right-side image: a real inspection photograph (use the existing `/08IMAGE.png` practitioner asset since it's already approved and depicts an accredited assessment scene — no All Fire logo in the asset). Below the timeline, a CTA: `HAVE YOUR FIRE SAFETY SCHEDULE? UPLOAD IT & GET STARTED →`.

### 9.4 Does My Building Need an AFSS? (04)
Heading: `Does my building need an AFSS?`
Lead: `An AFSS is required for existing buildings in NSW where the building has an applicable Fire Safety Schedule listing essential fire safety measures. The owner (or their agent) is responsible for issuing the annual statement.`
Six category tiles: strata, commercial, industrial, retail, mixed-use, other applicable buildings. CTA: `NOT SURE? CHECK MY BUILDING →`.

### 9.5 What is an AFSS? (05)
Heading: `What is an Annual Fire Safety Statement?`
Two-column. Left: AFSS document visual (existing `/sampleafss-nobg.png`). Right: 6 numbered facts:
1. For existing buildings in NSW.
2. Annual requirement.
3. Confirms essential fire safety measures have been assessed.
4. Assessment by accredited practitioners where scope applies.
5. Based on the building's Fire Safety Schedule.
6. Issued, lodged and displayed in the building.

### 9.6 What Gets Assessed? (06)
Heading: `What gets assessed?`
Lead: `Your Fire Safety Schedule determines which measures apply. Common categories include:`
- Fire detection and alarm systems.
- Fire hydrants / hose reels.
- Emergency lighting and exit signage.
- Fire doors / smoke doors.
- Sprinkler systems.
- Passive fire measures.

Explicit footnote: `Not every building contains every measure. The Fire Safety Schedule identifies what applies.`

### 9.7 Due Date & Penalties (07)
Heading: `Your AFSS is due every year.`
Lead: `Annual Fire Safety Statements are issued once each year. Knowing your due date gives you time to organise the assessment and address anything needing attention.`

Verified penalty framing (current NSW position): the Environmental Planning and Assessment Regulation 2021 (the regulation currently in force for fire safety statements, replacing the 2000 regulation for many purposes) prescribes a maximum penalty for failing to lodge an AFSS; the public-facing wording must be **a single maximum penalty figure** plus a clarifying legal note — not a fictional weekly escalation ladder. This avoids publishing inaccurate figures.

Display:
- Single line: `Penalty for failing to lodge an AFSS can be significant.`
- Disclaimer: `Penalties and enforcement requirements may change. Refer to current NSW legislation and your local council requirements.`
- Two CTAs: `CHECK MY AFSS DATE →` and `GET MY AFSS QUOTE →`.

If the team later supplies a verified weekly penalty schedule from the current regulation, it can be slotted in without restructuring.

### 9.8 Accredited Practitioners (08)
Heading: `The right scope. The right assessment.`
Three principles:
- `Schedule-led.` The Fire Safety Schedule identifies the measures and standards.
- `Appropriately accredited.` Assessments are performed by accredited practitioners where the approved scheme covers the function.
- `Verify current status.` Current accreditation should be verified on the public register.

CTA: `CHECK PRACTITIONER ACCREDITATION →` (link to FPAA register `https://connect.fpaa.com.au/FireSafetyAssessors`).

### 9.9 Projects (09)
Heading: `AFSS work across NSW.`
Data-driven. Empty-safe. `data/projects.ts` typed array; if empty, render the heading + a polite "Projects coming soon — content awaiting client approval" placeholder. **Do not invent projects.**

Card fields (when present):
- image, property_type, location, service, scope, slug.

### 9.10 Partners (10)
Heading: `Working with the people behind safer buildings.`
Categories: strata managers, property managers, facilities managers, fire safety specialists, industry partners. Data-driven from `data/partners.ts`. Empty-safe. **Do not invent partners, do not imply NSW Government is a partner.**

### 9.11 Testimonials (11)
Heading: `What building owners and managers say.`
Editorial single-testimonial layout (not 3 equal cards):
- Large quote, client name, role, property type, location.
- `01 / 04` counter + ← / → arrow controls (disabled until data is supplied).
Data-driven from `data/testimonials.ts`. Empty-safe.

### 9.12 Know Your Documents (12)
Three document rows:
- **AFSS** — Annual Fire Safety Statement — the annual statement.
- **FSS** — Fire Safety Schedule — the building's applicable fire safety measures and standards.
- **FSC** — Fire Safety Certificate — associated with new / altered building work.

Each with a small document preview (use existing `/sampleafss-nobg.png`, `/firesafetystatementsample_nobg.png` etc.). Link each to `/sample`.

### 9.13 AS 1851-2012 (13)
Heading: `Fire safety maintenance changed in NSW.`
Lead: `From 13 February 2026, applicable NSW buildings must maintain essential fire safety measures in accordance with AS 1851-2012 where the Standard applies.`
Four quiet checks: INSPECT · TEST · MAINTAIN · KEEP RECORDS.
Body: `AS 1851-2012 is the routine servicing / maintenance standard. The AFSS is the separate annual assessment and statement process. Related, but not the same.`
CTA: `UNDERSTAND AS 1851-2012 →`.

### 9.14 FAQ
Conversion-focused. Use the existing `FAQAccordion` (`<details>`). Questions:
1. What is an AFSS?
2. Who is responsible for arranging an AFSS?
3. How often is an AFSS required?
4. What happens if my AFSS is overdue?
5. What is a Fire Safety Schedule?
6. What if I can't find my current AFSS?
7. Who can assess my fire safety measures?
8. What happens if something fails assessment?
9. Does the AFSS price include repair work?
10. How long does the process take?
11. Where does the statement need to be lodged?
12. Can you help if I don't know my due date?

### 9.15 Final CTA
Heading: `Your AFSS due? Let's get it sorted.`
Sub: `Start a quote in about two minutes. No account required.`
Primary: `GET MY AFSS QUOTE →`.
Secondary: `TALK TO US →` (tel + email).

---

## 10. Instant Quote Integration

The existing 7-step `QuoteFlow` (`components/quote/QuoteFlow.tsx`) is **untouched**. The flow:
1. ContactStep → 2. PropertyStep → 3. BuildingConfirmStep → 4. DocumentStep → 5. DueDateStep → 6. QuotePaymentStep → 7. SubmissionSuccessModal.

Hero quote starter:
- Inline `<form>` with First name / Email / Mobile.
- POST `/api/afss/quote/contact` (existing route).
- On success: open `InstantQuoteModal`. The `resolveInitialStep` helper already reads the saved `current_step` ('property' after contact) and lands on step 2.
- Single session per cookie — handled by the existing endpoint.

Other homepage CTAs route into the same modal. We do not create additional sessions or forms.

Modal mobile behaviour: existing modal becomes near-full-screen on mobile (already styled with `sm:max-h-[...]` and `sm:rounded-2xl`). We tighten the left column padding and add `pb-[env(safe-area-inset-bottom)]` for safe-area handling.

---

## 11. Mobile-First Behaviour

Breakpoints used: `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1440.

- All sections stack to one column under `md`.
- Hero uses single column under `md`: eyebrow → H1 → sub → quote starter → trust chips → AFSS document.
- Process timelines collapse from horizontal to vertical under `md`.
- Header collapses to mobile drawer under `lg` (`max-width: 1024px` matches existing rule).
- Footer collapses to stacked sections under `md`.
- Section padding uses the existing `--section-y` token.

---

## 12. Desktop Behaviour

- Hero uses asymmetric grid: text column 1.05fr, AFSS visual 1fr.
- Process timelines render horizontally with connecting lines.
- Header is a fixed-position three-region flex row.
- Footer is two-column grid: brand block + nav columns.

---

## 13. Typography System

Reuse existing tokens:
- `--font-sans` = Inter (loaded via `next/font/google`, weights 400/600/700/800/900, `display: optional`, fallback to system Arial).
- `--font-mono` = Geist Mono for tabular nums.
- Headlines use `.h-display`, `.h-section`, `.h-3`, `.h-4` from `globals.css`.
- Body uses `.text-body`, `.text-lead`, `.text-small`.

**No new fonts.** No display novelty font. No serif. No Inter swap.

---

## 14. Colour System

| Use | Token / value |
|---|---|
| Headings | `#0b1d36` |
| Body text | `#3a4a63` |
| Lines / hairlines | `#e3e7ee` |
| Surfaces | `#ffffff`, `#f5f7fa` |
| Primary CTA fill | `#0b1d36` with white text on hover |
| Secondary CTA | white with `#0b1d36` border |
| Focus ring | `#1c4d9c` outline |
| Document accent rule | `#b0141f` |
| Document navy rule | `#0b1d36` |

No orange. No gradient text outside the existing one-word highlight pattern.

---

## 15. Button System

| Variant | Usage | Style |
|---|---|---|
| Primary | Hero CTA, Final CTA, all `Get my AFSS quote` | navy fill on hover, white text, uppercase, tracking 0.06em, min-height 3rem |
| Secondary | `Call 1300 765 594` in light contexts | white fill, navy border |
| Tertiary / Text | "Start my quote →", "Check my building →" | navy text, navy underline, arrow translates 4px on hover |
| Danger / Red | Penalty highlighting, AFSS dot | reserved for `#b0141f`; not used on CTAs |

Touch target ≥ 44px on mobile.

---

## 16. Image Strategy

- `/sampleafss-nobg.png` — NSW AFSS document (used in hero stack, GotYourAfss, WhatIsAfss, KnowYourDocuments).
- `/firesafetystatementsample_nobg.png` — Fire Safety Schedule (used in KnowYourDocuments).
- `/08IMAGE.png` — practitioner scene (used in InspectionInvolves).
- `/09image.png` — maintenance scene (used in AS1851).
- `/hero-home.svg`, `/hero-quote.svg`, etc. — keep as-is for future sub-pages.
- `/logo.png` — AFSS brand logo (header + footer).
- `/og-image.svg` — keep.
- **Remove from public-facing usage** (still on disk but unused): `/peterforcta.jpg`, `/peter-managing-director.jpg`, `/PETEIMAGE.png`, `/secondlogo.png`. Do not delete files in case Pete wants them later — leave them in `public/` but ensure no component references them.

Image treatment:
- Hero AFSS visual: stack of three pages, slight rotation per page, navy top rule, single red rule on top page.
- All section imagery uses `next/image` with `sizes` and `priority` only on the hero.

---

## 17. Content Accuracy Rules

Pricing:
- Do not display a hard-coded "$450 + GST" anywhere. The pricing engine (`lib/afss/pricing.ts`) already returns `requires_manual_review: true` if no production rules are configured. The QuotePaymentStep already renders "Your AFSS needs a quick review before we confirm the price." for that state. That is the correct public message.
- If Pete later inserts a production rule (`afss.pricing_rules` row with `environment='production'`, `active=true`, matching `measure_count_min` etc.), the engine will surface it. The homepage must not hard-code anything that bypasses that engine.
- The new section copy may say "pricing depends on your building's measures" without naming a figure, until the production rule exists.

Regulatory:
- Reference the **Environmental Planning and Assessment Regulation 2021** as the current instrument for AFSS provisions (replacing the 2000 regulation for many purposes). The 2021 regulation is the current consolidation.
- Accredited Practitioner (Fire Safety) framework (formerly CFSP) is administered by FPAA — register at `https://connect.fpaa.com.au/FireSafetyAssessors`.
- AS 1851-2012 commenced mandatory routine maintenance in NSW from 13 February 2026.
- Do **not** quote a weekly penalty ladder that isn't in current legislation. Use a single "significant penalties can apply" line + legal disclaimer.

---

## 18. SEO Requirements

- H1 (exactly one on the homepage): `Annual Fire Safety Statement (AFSS)`.
- Metadata title: `Annual Fire Safety Statement (AFSS) — Sydney NSW`.
- Metadata description: `Annual Fire Safety Statements for NSW strata, commercial and industrial buildings. From your Fire Safety Schedule to a lodged AFSS, handled by accredited practitioners.`
- Canonical: `/`.
- Open Graph: `/og-image.svg`, alt, locale `en_AU`.
- Keywords: Annual Fire Safety Statement, AFSS, Sydney, NSW, Fire Safety Schedule, Accredited Practitioner Fire Safety, AS 1851-2012.
- Structured data (JSON-LD) on the homepage: `Organization` + `LocalBusiness` + `FAQPage` (FAQ questions above).

---

## 19. Accessibility Requirements

- One H1, semantic H2/H3 hierarchy.
- All interactive elements keyboard-reachable with visible focus (`#1c4d9c` outline, 3px offset).
- Modal focus trap, `Escape` to close, aria-modal.
- Toast announcements via `aria-live`.
- `prefers-reduced-motion` honoured for all animations (RevealOnView, pulse, etc.).
- Alt text on every meaningful image.
- Colour contrast: navy on white 13.4:1, ink-muted on white 8.6:1.

---

## 20. Performance Requirements

- `next/image` everywhere with `sizes`.
- `priority` only on hero AFSS document and hero inspector photo (if added).
- Lazy-load below-the-fold section imagery.
- Section animations are CSS-based (RevealOnView) — no framer-motion runtime added.
- Avoid bundling Google Maps / Street View before user opens the quote modal (existing logic already gates this).
- Existing `lenis` smooth-scroll is in deps but not used on homepage — leave as-is.

---

## 21. Implementation Checklist

- [x] Create this MD file.
- [x] Add `data/projects.ts`, `data/partners.ts`, `data/testimonials.ts` (typed, empty by default).
- [x] Update `lib/site.ts` `navLinks` to the simplified AFSS nav.
- [x] Rewrite `components/Header.tsx` (remove All Fire socials, simplified nav, primary CTA).
- [x] Rewrite `components/Footer.tsx` (remove All Fire socials, AFSS-only navigation + contact).
- [x] Rewrite `components/home/Hero.tsx` (H1 + above-fold quote starter + AFSS document stack).
- [x] Build `components/home/GotYourAfss.tsx` (three pathway rows leading to the modal).
- [x] Build `components/home/HowItWorks.tsx` (5-step horizontal / vertical timeline).
- [x] Build `components/home/InspectionInvolves.tsx` (6-step editorial + photo).
- [x] Build `components/home/NeedsAfss.tsx` (building categories).
- [x] Build `components/home/WhatIsAfss.tsx` (narrative + AFSS document).
- [x] Build `components/home/MeasuresAssessed.tsx` (schedule-led list).
- [x] Build `components/home/DueDatePenalties.tsx` (annual cycle + verified penalty framing).
- [x] Build `components/home/AccreditedPractitioners.tsx` (three principles + register link).
- [x] Build `components/home/Projects.tsx` (data-driven, empty-safe).
- [x] Build `components/home/Partners.tsx` (data-driven, empty-safe).
- [x] Build `components/home/Testimonials.tsx` (editorial single testimonial, empty-safe).
- [x] Build `components/home/KnowYourDocuments.tsx` (AFSS / FSS / FSC).
- [x] Build `components/home/AS1851.tsx` (INSPECT / TEST / MAINTAIN / RECORDS).
- [x] Build `components/home/FAQ.tsx` (12 conversion-focused questions).
- [x] Build `components/home/FinalCTA.tsx` (closing CTA).
- [x] Compose `app/page.tsx` with the new section order.
- [x] Remove `SitewideCTA` from the homepage flow (still used by internal pages; not imported on `/`).
- [x] Remove `ContactCTA` import from the homepage; replace with `FinalCTA`.
- [x] Remove `AfssRecognitionSection`, `InstantQuoteJourneySection`, `ComplianceSection`, `TheProcessSection`, `FireSafetyScheduleSection`, `KnowYourDocumentsSection` (old), `WhatIsAnAfssSection` (old) from the homepage order — these files stay on disk for other pages.
- [x] Wire hero quote starter to `POST /api/afss/quote/contact`, open `InstantQuoteModal` on success.
- [x] Update metadata on `app/page.tsx`.
- [x] Add JSON-LD `LocalBusiness` + `FAQPage` to homepage.
- [x] Audit & clean All Fire / Peter / Book the Boss / `#fb5614` references across `components/`, `app/`, `lib/` (Header, Footer, ComplianceSection, SitewideCTA, FreeSiteVisitTrustStrip, FreeSiteVisitOffer, ContactCTA, ContactForm, InstantQuoteModal).
- [ ] Mobile-first responsive QA at 375 / 390 / 430 / 768 / 1024 / 1280 / 1440 / 1920 (responsive tokens / breakpoints are wired via existing `--section-y` and Tailwind v4 utilities; final visual pass requires browser).
- [x] Run `npm run build` (succeeded) and `npm run lint` (no new errors introduced by this redesign; pre-existing `any` and `react/no-unescaped-entities` warnings remain).

---

## 22. QA Checklist

Brand:
- [ ] No "All Fire" anywhere on homepage.
- [ ] No "Peter / Pete" anywhere.
- [ ] No "Book the Boss".
- [ ] No All Fire socials on /.
- [ ] No orange / `#fb5614` / `#fc0403` / yellow palette on /.
- [ ] Navy, blue, red, neutrals preserved.

Header:
- [ ] AFSS logo only.
- [ ] Simplified nav (How It Works / AFSS Requirements / Inspection / Projects / FAQs / Contact).
- [ ] Primary CTA visible.
- [ ] Mobile drawer works.

Hero:
- [ ] Direct H1 "Annual Fire Safety Statement (AFSS)".
- [ ] Eyebrow + sub-headline + 3-field quote starter + trust chips.
- [ ] AFSS document visual on right.
- [ ] Quote starter saves via existing endpoint and opens modal at step 2.
- [ ] No duplicate quote session.

Content:
- [ ] Sections present: Got Your AFSS, How It Works, What the Inspection Involves, Does My Building Need an AFSS, What Is an AFSS, What Gets Assessed, Due Date & Penalties, Accredited Practitioners, Projects, Partners, Testimonials, Know Your Documents, AS 1851-2012, FAQ, Final CTA.

Trust:
- [ ] No fabricated projects / partners / testimonials / accreditations / turnaround / prices.
- [ ] "Pete/Ken must configure" wording removed from anywhere customer-facing.

Legal:
- [ ] References to 2021 EP&A Regulation verified.
- [ ] Practitioner terminology verified (Accredited Practitioner (Fire Safety), FPAA register).
- [ ] Penalty wording verified — no fabricated weekly ladder.
- [ ] AS 1851-2012 wording verified (13 Feb 2026 commencement).
- [ ] AFSS / FSS / FSC distinction accurate.

Quote:
- [ ] Contact save works (existing endpoint).
- [ ] Modal opens at property step after hero save.
- [ ] Google autocomplete works.
- [ ] Use My Location works.
- [ ] Street View works.
- [ ] Upload works.
- [ ] Due date works.
- [ ] Pricing shows engine output (no hard-coded price).
- [ ] Submission + refresh + idempotency work.
- [ ] No developer language visible.

Responsive:
- [ ] 375 / 390 / 430 / 768 / 1024 / 1280 / 1440 / 1920 all clean.

Quality:
- [ ] No horizontal overflow anywhere.
- [ ] No clipped autocomplete dropdowns.
- [ ] No broken images.
- [ ] No console errors.
- [ ] Build passes.
- [ ] Accessibility: focus visible, alt text, keyboard nav, modal trap, aria-live.
- [ ] Reduced motion respected.
- [ ] Buttons consistent.
- [ ] Spacing consistent.
- [ ] Typography consistent.

---

## 23. Files Expected to Change

Created:
- `docs/AFSS-HOMEPAGE-REDESIGN.md` — this file.
- `components/home/Hero.tsx` (replaces `components/AfssHeroSection.tsx` import).
- `components/home/GotYourAfss.tsx`.
- `components/home/HowItWorks.tsx`.
- `components/home/InspectionInvolves.tsx`.
- `components/home/NeedsAfss.tsx`.
- `components/home/WhatIsAfss.tsx`.
- `components/home/MeasuresAssessed.tsx`.
- `components/home/DueDatePenalties.tsx`.
- `components/home/AccreditedPractitioners.tsx`.
- `components/home/Projects.tsx`.
- `components/home/Partners.tsx`.
- `components/home/Testimonials.tsx`.
- `components/home/KnowYourDocuments.tsx`.
- `components/home/AS1851.tsx`.
- `components/home/FAQ.tsx`.
- `components/home/FinalCTA.tsx`.
- `data/projects.ts`.
- `data/partners.ts`.
- `data/testimonials.ts`.

Rewritten:
- `app/page.tsx` — new section order + new metadata + JSON-LD.
- `components/Header.tsx` — AFSS-only nav, no socials.
- `components/Footer.tsx` — AFSS-only footer, no socials.
- `lib/site.ts` — `navLinks` updated.

Audit-only / content cleanup:
- `components/ComplianceSection.tsx` — strip "ALLFIRE" copy; page no longer imports it but the file stays on disk.
- `components/ContactCTA.tsx` — strip Peter / "Book the Boss" / orange; not imported on `/` but file stays.
- `components/ContactForm.tsx` — strip orange and "Book the Boss" content.
- `components/SitewideCTA.tsx` — strip All Fire / Peter; not imported on `/`.
- `components/AfssHeroSection.tsx`, `AfssRecognitionSection.tsx`, `InstantQuoteJourneySection.tsx`, `KnowYourDocumentsSection.tsx`, `WhatIsAnAfssSection.tsx`, `TheProcessSection.tsx`, `FireSafetyScheduleSection.tsx` — files stay on disk; verify no remaining references on `/`.

Untouched (backend / contract):
- `lib/afss/*` — pricing engine, types, validation, session.
- `app/api/afss/*` — all routes.
- `components/quote/*` — modal + steps + flow.
- `components/free-site-visit/*` — the global island; still mounted in `app/layout.tsx` (it does not surface All Fire branding once we update its content).

---

## 24. Explicit Non-Goals

- No redesign of `/services`, `/accreditation`, `/new-legislation`, `/sample`, `/contact-us`, `/about`, `/free-quote` in this pass. Shared Header/Footer changes still apply because they are global components.
- No new brand identity or logo redesign — reuse the existing AFSS mark.
- No new fonts, no Tailwind config changes, no `next.config.ts` changes beyond existing image remote patterns.
- No backend changes — pricing, sessions, uploads, Google integration, Stripe all stay as-is.
- No new dependencies. No new packages.
- No CMS integration for projects / partners / testimonials — typed TS data files only.
- No fabricated content.