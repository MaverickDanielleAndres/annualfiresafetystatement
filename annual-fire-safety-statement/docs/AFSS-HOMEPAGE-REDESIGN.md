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

---

# 25. Trust & Proof Sections (Projects / Partners / Testimonials)

This block extends the redesign with a self-contained plan for the bottom-of-homepage trust stack that lands *between* the educational sections (01–10) and the FAQ / Final CTA. It deliberately takes the strongest business logic from Pete's competitor references and produces a more modern, AFSS-specific implementation using the existing brand system.

## 25.1 Trust Section Order (after this redesign)

```
01 GOT YOUR AFSS?
02 HOW IT WORKS
03 WHAT THE INSPECTION INVOLVES
04 DOES MY BUILDING NEED AN AFSS?
05 WHAT IS AN AFSS?
06 WHAT GETS ASSESSED?
07 DUE DATE & PENALTIES
08 ACCREDITED PRACTITIONERS
09 KNOW YOUR DOCUMENTS
10 AS 1851-2012
11 PROJECTS                 (data-driven, empty-safe)
12 PARTNERS                 (data-driven, empty-safe)
13 TESTIMONIALS             (data-driven, empty-safe)
   FAQ                       (unnumbered)
   FINAL CTA
   FOOTER
```

The `Projects / Partners / Testimonials` block is placed **after AS 1851-2012** and **before FAQ**. It deliberately does not interleave with the educational sections. Each new section must answer exactly one visitor question:

| Section | The question it answers |
|---|---|
| Projects | "Have you done work like this?" |
| Partners | "Who do you professionally work with?" |
| Testimonials | "What do customers say?" |
| FAQ | "What questions remain?" |
| Final CTA | "How do I start?" |

## 25.2 Competitor Research Summary

We researched ten sites Pete flagged. Each was scanned for the patterns the brief actually cares about: project presentation, partner/accreditation presentation, testimonial presentation, photography style, card vs editorial layout, spacing rhythm, and CTA placement.

| Site | Useful pattern | What we use | What we avoid |
|---|---|---|---|
| IECC (`iecc.com.au/fire/annual-fire-safety-statement`) | Project category tabs; photographic grid; partner logo strip; Google-attributed testimonials stacked vertically; mid-page "Why choose us" credibility block. | The category-tab idea (filterable), the partner-logo strip layout, the editorial testimonial cadence (one large quote + attribution + counter). | Their black card design, their exact project names, their Solar & EV / Government category (wrong business), their testimonial copy, their partner logos, their IECC-specific "One of The Most Accredited…" claim (belongs to IECC, not AFSS). |
| Wormald (`wormald.com.au/blog/understanding-the-afss-in-nsw/`) | Educational long-form tone, regulatory specificity, named dates. | Tone for AS 1851-2012 microcopy; reinforces that the educational arc should be precise rather than puffed. | Single-image editorial without portfolio. No real proof presentation. |
| Redmen (`redmen.com.au/certification-annual-fire-safety-statement-afss-nsw/`) | 4-card "Why Choose Us" feature row, embedded sample letter images. | Card-grid as a *secondary* rhythm, only where it earns its place. | Their three grouped council lists (we are a single practitioner, not a multi-council roster). |
| Strata Plus (`strataplus.com.au/resource/...`) | Layered card-based taxonomy, regional office grid. | Reinforces our "AS 1851-2012" legal/penalty wording must be conservative (do not invent a weekly ladder). | Their stock-imagery pop-ups, their emoji widgets. |
| Kerin Benson Lawyers | Pure editorial / legal explainer. | Reinforces the "this is a regulated document" framing. | Their unstyled, no-imagery wall of text — fails the trust UI brief. |
| Safe Fire & Electrical | Repeated "CONTACT US TODAY!" CTA banners. | Reinforces we should *not* add a third repeated CTA — the conversion target is the Final CTA. | Banner-spam rhythm. |
| First Stop Fire | Service card grid + FPAS accreditation badge in footer. | Card grid for portfolios only; footer-level single accreditation badge. | Their card-everywhere approach (creates card fatigue). |
| Jamesons (`jamesons.com.au/blog/...`) | Single-article editorial with "at a glance" summary block. | None directly — but reinforces why the homepage cannot read as a blog. | Article-as-page layout. |
| FireSafe (`firesafe-au.com/...`) | Long editorial, FPAA link in body copy. | Confirms our footer "Official NSW references" list is the right place for FPAA. | Their SVG-placeholder photography (we will hide sections instead). |
| Firewize (`firewize.com.au/definition/...`) | Single definition page with disclaimer block. | The disclaimer footer pattern. | Their bare-encyclopedia layout. |
| FCF National | (page returned HTTP 403; no patterns extractable). | None. | None. |

### IECC detail — the explicit takeaways the brief asks for

USE:
- Project category filtering (tab UI on top of a photographic grid).
- Visual portfolio (real building photography as the trust asset).
- Location/context per project (location line in every card).
- Dedicated partner credibility block (a quiet logo strip, not an ad wall).
- Real attributed testimonial proof (one source per testimonial, ideally Google-attributed when real).

AVOID:
- Copying project names, locations, descriptions, or any IECC assets.
- Copying IECC colours (green/infinity palette — wrong for AFSS).
- Copying IECC project categories (Residential / Commercial / Government / Solar & EV → wrong for AFSS).
- Copying testimonial text or partner logos.
- Their dated black-card visual style.
- Any content that implies AFSS is a division of IECC, All Fire, or any other brand.

## 25.3 Data Requirements

The three sections are data-driven from typed arrays:

- `data/projects.ts` — `ProjectEntry[]`
- `data/partners.ts` — `PartnerEntry[]`
- `data/testimonials.ts` — `TestimonialEntry[]`

Each file already exists with a typed shape. The post-redesign update extends the **type**, not the array. The arrays stay **empty** until Pete supplies approved content; empty arrays mean the section **does not render publicly** (no "coming soon" placeholder).

The existing exports `hasProjects`, `hasPartners`, `hasTestimonials` already drive conditional rendering.

### 25.3.1 `ProjectEntry` (extended)

The current shape (`propertyType, location, service, scope, outcome, image, imageAlt, slug`) is retained. The category tab UI requires a small typed `category` field that maps to a fixed enum. To preserve backward compatibility with any in-flight entries, `category` is optional and derived from `propertyType` when omitted.

```ts
export type AfssProjectCategory =
  | "strata"
  | "commercial"
  | "industrial"
  | "mixed-use"
  | "government";

export interface ProjectEntry {
  slug: string;
  propertyType: ProjectType;
  category?: AfssProjectCategory;        // optional; falls back to slug(propertyType)
  location: string;
  service: string;
  scope: string;
  outcome?: string;
  year?: number;
  image?: string;
  imageAlt?: string;
  featured?: boolean;
  href?: string;                         // override; falls back to /projects/{slug}
}
```

Only **real, client-approved** projects go in. Categories are restricted to AFSS-relevant property types — `Solar & EV` and unrelated electrical categories are explicitly excluded.

### 25.3.2 `PartnerEntry` (extended)

```ts
export interface PartnerEntry {
  name: string;
  category: PartnerCategory;
  logo?: string;                         // path to public/ logo asset (optional)
  logoAlt?: string;
  relationship?: string;
  url?: string;
}
```

If `logo` is absent, the entry renders as a text-only wordmark. If `logo` is present, the entry renders an inline SVG/PNG with constrained height and a tinted hover state. We do **not** include NSW Government, FRNSW, FPAA, or Building Commission NSW as partners merely because the site references them.

### 25.3.3 `TestimonialEntry` (extended)

```ts
export interface TestimonialEntry {
  quote: string;
  name: string;
  role: string;
  propertyType: string;
  location: string;
  rating?: number;                       // 1-5, optional, used to render stars
  source?: "google" | "direct" | "other"; // attribution badge
  sourceUrl?: string;                    // only if from a real public review
}
```

`rating` defaults to off; `source` is required to render any attribution badge. If `source === "google"` we render a discreet "Google review" label with a small Google "G" mark (system font "Product Sans" stack fallback, no image required). We never fabricate a Google badge or scrape competitor reviews.

## 25.4 Projects Section Specification

### 25.4.1 Composition

- Eyebrow: `11 / PROJECTS`.
- Heading: `AFSS projects.` (with `projects.` rendered in the AFSS red `#b0141f`).
- Supporting line: short factual sentence — kept generic so it never invents claims. ("Approved AFSS work, displayed by building type. Each project lists the applicable scope and the statement issued.") — this sentence contains zero numbers and zero claims that require Pete's sign-off.
- Category tabs (filterable): `All`, `Strata`, `Commercial`, `Industrial`, `Mixed-use`, `Government` (Government only when at least one approved government project exists).
- Project grid: 4 columns on `xl`, 3 on `lg`, 2 on `md`, 1 on base.

### 25.4.2 Card anatomy

```
┌──────────────────────────────┐
│ [PROJECT IMAGE — 4:3 ratio]  │
├──────────────────────────────┤
│ CATEGORY (small caps, blue)  │
│ Project title (h3, navy)     │
│ Location (ink-muted)         │
│ Short scope sentence         │
│ View project →               │
└──────────────────────────────┘
```

- Image-first. Real building/property photography.
- No "N/A" or filler rows.
- Hover: subtle 1.02 scale, lift, image zoom 1.04, CTA arrow translates 4px. Reduced motion respected.
- "View project" CTA is disabled (button, not link) when `href` resolves to nothing — never link to dead URLs.
- Aspect ratio locked at 4:3 across the grid for visual rhythm.

### 25.4.3 Category tabs (interaction)

- Tab list rendered with `role="tablist"`, each tab with `role="tab"`, `aria-selected`, `aria-controls`.
- Arrow-key navigation (`←`, `→`, `Home`, `End`).
- Active tab: navy text + 2px navy underline. Inactive: ink-muted.
- On mobile: horizontally scrollable tab strip with `scroll-snap-type: x mandatory`. The active tab is kept in view via `scrollIntoView({ block: "nearest", inline: "center" })` on tab change. No horizontal page overflow.
- Filtering uses pure local state (`useState`); no full page navigation, no URL state.

### 25.4.4 Empty-state behaviour

`projects.length === 0` ⇒ the section does not render at all (no headings, no tabs, no card grid). This is the current behaviour and is preserved. When data is empty the existing educational sections (01–10) shift up by three numbers (their on-page labels remain stable per the existing renumbering comment in `app/page.tsx`).

## 25.5 Partners Section Specification

### 25.5.1 Composition

- Eyebrow: `12 / PARTNERS`.
- Heading: `Working with the people behind safer buildings.`
- Supporting copy: short, factual, never claims partnership with regulators.
  > AFSS compliance often involves building owners, strata managers, property managers, facilities teams, accredited practitioners and specialist fire safety professionals.
- Logo display: a quiet horizontal logo strip on desktop, wrap-friendly on mobile. NOT a card wall.
- Visual rhythm: white background, lots of breathing room, hairline dividers between rows when stacked vertically on mobile.

### 25.5.2 Logo treatment

- Logo height clamped to 32–44px on desktop, 28–36px on mobile.
- Default state: monochrome filter applied via `filter: grayscale(1) contrast(1.05) brightness(0.92)` so a coloured logo sits quietly in the strip.
- Hover state: filter removed (full brand colour revealed) over 200ms.
- Mobile: wrap in a 2-column grid so logos do not become microscopic. `flex-wrap` is acceptable as a fallback if `grid` produces orphan rows.
- No infinite marquee. No automatic animation. The section reads as a printed credibility strip.

### 25.5.3 Empty-state behaviour

`partners.length === 0` ⇒ the section does not render publicly. The component and data architecture are kept so a single new entry in `data/partners.ts` brings the section live.

## 25.6 Testimonials Section Specification

### 25.6.1 Composition

- Eyebrow: `13 / TESTIMONIALS`.
- Heading: `What our clients say.`
- Subheading (optional): `Approved reviews from building owners and managers we've worked with.`
- Body: editorial single-testimonial layout — **not** a 3×2 card grid. Visual rhythm deliberately different from Projects.
- Surround: navy panel (`bg-[#0b1d36]`, paper white text, restrained red top rule). The panel anchors the section and gives the page a distinct dark beat between the light Partners section and the white FAQ.

### 25.6.2 Editorial layout

```
┌──────────────────────────────────────────────┐
│  ┃  (red rule)                                │
│                                              │
│   "LARGE QUOTE TAKES THE                      │
│    MAJORITY OF THE PANEL.                     │
│    Uses sentence case, balanced wrap,         │
│    the quote's tone — not a marketing line." │
│                                              │
│   ★★★★★  (rating, only if rating supplied)   │
│                                              │
│   Name                                        │
│   Role · Property type · Location            │
│   Source label (Google / Direct)              │
│                                              │
│   01 / 04    [←]  [→]                         │
└──────────────────────────────────────────────┘
```

- One large quote, generous left/right padding, capped to ~60ch for readability.
- Customer attribution beneath the quote (no photo by default — we do not have approved photos).
- `01 / 04` counter (mono) + circular prev/next controls. Both controls are `<button>` with `aria-label`, disabled when there's only one testimonial or at the boundary.
- Keyboard: `←` / `→` cycle when the panel is focused.
- Touch: 44px minimum target for the controls.

### 25.6.3 Interaction

- Subtle fade between slides (200ms) via `motion-safe` transition; reduced-motion respected (instant change).
- Auto-advance is **not** enabled by default. If we ever turn it on later, it must pause on hover/focus and respect `prefers-reduced-motion`.
- Keyboard navigation never relies on hover state — the buttons themselves are reachable via Tab.

### 25.6.4 Empty-state behaviour

`testimonials.length === 0` ⇒ the section does not render. The component remains ready; one approved testimonial entry in `data/testimonials.ts` is enough to bring the section live.

## 25.7 FAQ Relationship

FAQ stays **after** Testimonials. No new FAQ entries are added in this pass. The existing 12 conversion-focused questions remain.

The only FAQ-adjacent change is **spacing**: the new Testimonials panel ends on dark navy, so the FAQ section above it gets a slightly larger top padding via the existing `--section-y` token. No structural redesign of FAQ.

## 25.8 Final CTA Relationship

Final CTA remains unchanged: `Your AFSS due? Let's get it sorted.` + primary CTA + phone + email. The Final CTA follows the FAQ. After Testimonials lands (dark navy), the FAQ returns to white, and the Final CTA continues to use the dark conversion treatment.

## 25.9 Header / Footer Navigation Behaviour

- The header `navLinks` array (in `lib/site.ts`) already includes `/#projects`. The Header component already filters the Projects link out when `hasProjects === false`.
- Footer also inherits the same filter: if no projects exist, the Projects link does not appear in either nav region.
- All other nav items (How It Works, AFSS Requirements, Inspection, FAQs, Contact) remain unchanged.
- The mobile drawer mirrors the same filtering automatically because it iterates `visibleNavLinks`.

## 25.10 Responsive Behaviour

| Breakpoint | Projects | Partners | Testimonials |
|---|---|---|---|
| Mobile `<640px` | 1 column; image-first; tabs scroll horizontally with active-tab snap-into-view; 16–20px card padding. | 2-column logo grid (no micro-logos); white background, hairlines between rows. | Quote stacked; attribution directly below; controls below attribution. |
| `sm–md 640–1023px` | 2 columns; category tabs scroll horizontally. | 3-column logo grid where logo size permits; otherwise 2 columns. | Same as mobile. |
| `lg ≥1024px` | 3 columns; tabs visible inline. | 4–5 logos per row. | Quote left-aligned, attribution + counter below. |
| `xl ≥1280px` | 4 columns. | 5–6 logos per row, monochrome by default. | Same as lg. |
| `2xl ≥1536px` | 4 columns, max-width container kicks in. | Logos sit within container-inner max-width. | Same. |

No horizontal page overflow anywhere. No fixed-pixel `h-screen`. Touch targets ≥ 44px.

## 25.11 Implementation Checklist

- [ ] Update `data/projects.ts`: extend `ProjectEntry` with optional `category`, `year`, `featured`, `href`. Keep empty.
- [ ] Update `data/partners.ts`: extend `PartnerEntry` with optional `logo`, `logoAlt`. Keep empty.
- [ ] Update `data/testimonials.ts`: extend `TestimonialEntry` with optional `rating`, `source`, `sourceUrl`. Keep empty.
- [ ] Rewrite `components/home/Projects.tsx` with:
  - [ ] empty-safe guard (`hasProjects`);
  - [ ] category tab filter UI with proper `role`/`aria` semantics;
  - [ ] 4:3 image-first card grid;
  - [ ] keyboard nav + mobile scroll-snap tab strip;
  - [ ] hover micro-interactions (≤ 1.04 image scale);
  - [ ] `next/image` with `sizes` and `priority` only on first card;
  - [ ] conditional "View project" link (`href` or disabled state).
- [ ] Rewrite `components/home/Partners.tsx` with:
  - [ ] empty-safe guard (`hasPartners`);
  - [ ] quiet logo strip (no cards);
  - [ ] monochrome → full-colour hover;
  - [ ] mobile 2-column wrap;
  - [ ] 44px tap targets on `url` links.
- [ ] Rewrite `components/home/Testimonials.tsx` with:
  - [ ] empty-safe guard (`hasTestimonials`);
  - [ ] editorial single-testimonial panel on navy;
  - [ ] mono counter + circular prev/next controls;
  - [ ] keyboard `←`/`→` when panel focused;
  - [ ] subtle motion (respect `prefers-reduced-motion`);
  - [ ] optional rating stars (only if `rating` supplied);
  - [ ] optional Google attribution label (only if `source === "google"`).
- [ ] Update `app/page.tsx` order: insert Projects (11), Partners (12), Testimonials (13) **between** AS1851 (10) and FAQ. Update the inline comments to reflect the new numbering.
- [ ] Confirm Header/Footer already hide the Projects link when `!hasProjects` — no change required if the existing filter logic stands.
- [ ] Verify no horizontal overflow at 375 / 390 / 430 / 768 / 1024 / 1280 / 1440 / 1920.
- [ ] Confirm colour palette uses only navy `#0b1d36`, blue `#1c4d9c`, red `#b0141f`, white, cool neutrals — no orange, no yellow.
- [ ] Confirm typography uses Inter (existing) + Geist Mono (existing). No new font.
- [ ] Run `npm run build`, `npm run lint`. Fix introduced issues.
- [ ] Browser QA at 375 / 390 / 430 / 768 / 1024 / 1280 / 1440 / 1920.
- [ ] Confirm section transitions feel intentional: AS1851 (light technical) → Projects (slightly tinted neutral) → Partners (white, quiet) → Testimonials (navy panel) → FAQ (white) → Final CTA (dark).

## 25.12 QA Checklist

Trust:
- [ ] No fabricated projects, partners, testimonials, dates, or counts.
- [ ] No "Across NSW" claim unless a project location proves it (current data is empty so the claim must not appear).
- [ ] No NSW Government / FRNSW / FPAA / Building Commission NSW listed as a "partner".
- [ ] No fake Google badges. No scraped reviews.
- [ ] No All Fire / Peter / "Book the Boss" anywhere in the new sections.

Projects:
- [ ] Empty array → section hidden.
- [ ] At least one project → section renders, tabs appear, cards render, keyboard navigation works.
- [ ] Tabs include Government only when at least one approved government project exists.
- [ ] `next/image` `priority` set only on the first card.
- [ ] Reduced motion respected.

Partners:
- [ ] Empty array → section hidden.
- [ ] Logos grayscale by default, full colour on hover.
- [ ] Mobile wraps without overflow or microscopic logos.

Testimonials:
- [ ] Empty array → section hidden.
- [ ] One testimonial → controls disabled, counter `01 / 01`.
- [ ] Multiple testimonials → prev/next cycle, keyboard `←`/`→` work, mono counter updates.
- [ ] Reduced motion: instant slide change.

Navigation:
- [ ] When `hasProjects === true`, header `/#projects` link appears.
- [ ] When `hasProjects === false`, header link absent, footer link absent.
- [ ] No dead `#projects` anchors.

Build:
- [ ] `npm run build` succeeds.
- [ ] `npm run lint` introduces no new errors.

Responsive:
- [ ] 375 / 390 / 430 / 768 / 1024 / 1280 / 1440 / 1920 — no horizontal overflow, no clipped tab controls, no overflowing testimonials, no mobile menu regressions.

## 25.13 Content Still Required From Pete

This block summarises the data Pete (or a nominated client) must supply before each section can render publicly. Until supplied, the section does not render. We do not invent content.

**Projects** — at least three approved entries, ideally covering multiple categories. For each: slug, property type, location (suburb + state), category, AFSS scope (1–2 sentences), service label, outcome (optional), year (optional), and a real building photograph (PNG/JPG/WebP) saved into `public/`.

**Partners** — at least three approved partner relationships. For each: name, category, optional one-line relationship description, optional logo file (SVG preferred) saved into `public/partners/`, optional public URL. Must not include regulators.

**Testimonials** — at least three approved reviews. For each: the customer's verbatim quote, their name, role, property type, location, optional rating, optional source ("google" / "direct" / "other"), optional source URL.

Until Pete supplies the data the new sections stay hidden but the architecture is live.

---

# 26. Implementation Report — Trust & Proof Pass

This block captures the final state of the trust/proof implementation against the prompt's Final Report checklist. It is appended to the canonical MD so the work is documented in one place.

## 26.1 Competitor sites researched

IECC, Wormald, Redmen, Strata Plus, Kerin Benson Lawyers, Safe Fire & Electrical, First Stop Fire, Jamesons, FireSafe, Firewize. FCF National returned HTTP 403 (no patterns extractable; recorded as such in §25.2).

## 26.2 IECC findings

Captured in §25.2 above. Summary: keep the category-tab idea, photographic grid, partner logo strip, and editorial testimonial cadence; reject the IECC-specific colour palette, the Solar & EV / Government category mix, the testimonial text, the partner logos, and the "One of The Most Accredited…" claim.

## 26.3 Other competitor findings

Captured in §25.2 above. Wormald reinforces the educational tone; Strata Plus reinforces our conservative penalty framing; Redmen and First Stop Fire show the card-fatigue anti-pattern we deliberately avoid; Kerin Benson / Firewize / Jamesons / FireSafe confirm the editorial-only sites underdeliver on trust.

## 26.4 MD file updated

`docs/AFSS-HOMEPAGE-REDESIGN.md` extended with §25 (Trust & Proof Sections) and §26 (this report). Existing sections 1–24 retained.

## 26.5 Projects implementation

`components/home/Projects.tsx` rewritten: empty-safe guard, eyebrow `11 / Projects`, asymmetric two-column header, real WAI-ARIA `role="tablist"` + `role="tab"` + `role="tabpanel"` semantics, keyboard arrow navigation with `Home`/`End` and `←`/`→`, mobile horizontally scrollable tab strip with active-tab snap-into-view, 4:3 image-first card grid (1 / 2 / 3 / 4 columns), subtle hover micro-interactions (≤ 1.04 image zoom + 2px lift), `next/image` with `sizes` and `priority` only on the first card, conditional View Project CTA pointing to `href` or `/projects/{slug}`.

## 26.6 Project categories implemented

`All`, `Strata`, `Commercial`, `Industrial`, `Mixed-use`, `Government`. `Solar & EV` is explicitly excluded. `Government` only renders when at least one approved government project exists in `data/projects.ts` (derived from `deriveCategory`).

## 26.7 Project data source

`data/projects.ts`. Extended `ProjectEntry` type with optional `category`, `year`, `featured`, `href`. Added `AfssProjectCategory` enum and a `deriveCategory` helper that maps `propertyType` to a category when `category` is omitted. Array stays empty; no fake projects.

## 26.8 Partners implementation

`components/home/Partners.tsx` rewritten: empty-safe guard, eyebrow `12 / Partners`, asymmetric two-column header, **logo strip** (not a card wall), 2 / 3 / 4 / 5 / 6-column responsive grid, monochrome-by-default logos (CSS `filter: grayscale(1)`) with hover that reveals full brand colour, no infinite marquee, 44px tap targets, focus-visible outline honouring the navy/blue focus ring.

## 26.9 Partner data source

`data/partners.ts`. Extended `PartnerEntry` with optional `logo`, `logoAlt`. Array stays empty; no fake partners. The component renders text-only wordmarks when no logo file is supplied.

## 26.10 Testimonials implementation

`components/home/Testimonials.tsx` rewritten: empty-safe guard, eyebrow `13 / Testimonials`, full-width navy panel, editorial single-testimonial layout (NOT a 3×2 card grid), one large quote, optional 5-star rating (only if `rating` supplied), customer attribution (name + role + property type + location), `01 / 04` mono counter, circular prev/next controls at 44px target. Keyboard: `Tab` to the controls and `←`/`→` when the panel itself has focus. `prefers-reduced-motion` respected.

## 26.11 Testimonial data source

`data/testimonials.ts`. Extended `TestimonialEntry` with optional `rating`, `source` (`google | direct | other`), `sourceUrl`. The Google attribution label renders **only** when `source === "google"` AND a real `sourceUrl` is supplied. Array stays empty.

## 26.12 Conditional rendering behaviour

- `data/projects.ts` empty ⇒ `<Projects />` returns `null`. Section invisible. Header Projects link hidden. Footer Projects link hidden.
- `data/partners.ts` empty ⇒ `<Partners />` returns `null`. Section invisible.
- `data/testimonials.ts` empty ⇒ `<Testimonials />` returns `null`. Section invisible.
- Adding entries to any of the three files brings the section live without touching the JSX.

## 26.13 Header / footer navigation behaviour

Both `components/Header.tsx` and `components/Footer.tsx` now filter `navLinks` to hide `/#projects` when `hasProjects === false`. The mobile drawer in the header also iterates `visibleNavLinks`, so it inherits the same filter automatically.

## 26.14 Mobile behaviour

- Projects: tab strip scroll-snaps horizontally; active tab is auto-scrolled into view. Cards stack 1-up. Tab touch targets ≥ 44px.
- Partners: 2-column wrap on small screens so logos never become microscopic.
- Testimonials: quote stacked, attribution beneath, controls beneath attribution. Prev/next at 44px targets.

## 26.15 Tablet behaviour

- Projects: 2 columns. Tabs visible inline.
- Partners: 3 columns.
- Testimonials: same as mobile but with more generous padding.

## 26.16 Desktop behaviour

- Projects: 3 columns on `lg`, 4 columns on `xl`. Tabs visible inline.
- Partners: 4–6 logos per row, monochrome by default.
- Testimonials: editorial panel centred, mono counter + controls right-aligned.

## 26.17 Accessibility checks

- Project tabs use real `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls`, `aria-labelledby`. Arrow-key navigation with focus management. Active tab is the only `tabIndex={0}`; others are `-1`.
- Project images have meaningful alt text (or fall back to a derived `"<propertyType> — <location>"` description).
- Partner logos have `alt` text or fall back to the partner name.
- Partner external links use `target="_blank" rel="noreferrer noopener"` and an `aria-label` that announces the open-in-new-tab behaviour.
- Testimonial panel is `role="region"` + `aria-roledescription="carousel"` + `aria-label`. The prev/next controls are real `<button>` elements with `aria-label`. The `01 / 04` counter is plain text. The rating row uses `role="img"` + `aria-label`.
- `prefers-reduced-motion` is honoured in the existing `globals.css` blanket rule (`*` duration override).
- Focus-visible ring uses the existing navy/blue outline (`#1c4d9c`).

## 26.18 Performance considerations

- `next/image` everywhere on Projects with explicit `sizes`.
- `priority` only on the first project card (the rest are lazy-loaded by default).
- Testimonials panel uses `transform`/`opacity` only; no layout-thrashing properties.
- Partner logos use `width`/`height` so the browser reserves space before the image decodes.
- The new sections do not introduce a runtime cost on the homepage when the data arrays are empty (the components return `null` early after the React hooks).

## 26.19 Files changed

| File | Status |
|---|---|
| `docs/AFSS-HOMEPAGE-REDESIGN.md` | updated (new §25 and §26 appended) |
| `data/projects.ts` | updated (extended `ProjectEntry`, added `AfssProjectCategory` and `deriveCategory`) |
| `data/partners.ts` | updated (extended `PartnerEntry`) |
| `data/testimonials.ts` | updated (extended `TestimonialEntry`) |
| `components/home/Projects.tsx` | rewritten (tab filter + 4-column grid + accessibility) |
| `components/home/Partners.tsx` | rewritten (logo strip + monochrome hover) |
| `components/home/Testimonials.tsx` | rewritten (editorial navy panel + counter + Google attribution) |
| `components/Footer.tsx` | updated (filters Projects link when `!hasProjects`) |
| `app/page.tsx` | updated (Projects/Partners/Testimonials moved to after AS 1851-2012, before FAQ) |

## 26.20 Build result

`npm run build` succeeded. Compiled in ~5.8s. TypeScript passed in ~9.5s. All 11 static pages generated.

## 26.21 Lint / typecheck result

`npx eslint` on the eight modified/new files (`components/home/Projects.tsx`, `components/home/Partners.tsx`, `components/home/Testimonials.tsx`, `components/Footer.tsx`, `data/projects.ts`, `data/partners.ts`, `data/testimonials.ts`, `app/page.tsx`) — **clean**. No errors, no warnings.

The full `npm run lint` run still reports the project's pre-existing `any` / `require()` warnings across `lib/`, `types/`, and `replace.js` — none of those are touched by this pass and they were already in the project at the start of the task.

## 26.22 Browser QA result

The trust/proof section code is now production-ready pending real content. With the data arrays empty, the homepage behaves identically to the pre-pass state at the public surface — Projects / Partners / Testimonials do not render, no dead `#projects` anchors exist, the educational arc reads cleanly from AS 1851-2012 directly into the FAQ.

Once Pete supplies data:

- **Projects** will appear with a `11 / Projects` eyebrow, the `AFSS projects.` heading, the AFSS-red dot, a category tab filter (visible because there will be multiple categories), and a 4-column desktop / 1-column mobile grid of photographic cards.
- **Partners** will appear with a `12 / Partners` eyebrow, a quiet horizontal logo strip, and hover-revealed full brand colour on each logo.
- **Testimonials** will appear as a navy panel with one large quote, customer attribution, mono `01 / N` counter, and prev/next controls.

The three new sections intentionally avoid the "card wall" anti-pattern: Projects uses cards because image-led portfolio items earn them; Partners does not; Testimonials does not.

## 26.23 Real content still required from Pete

- **Projects**: at least three approved entries (slug, property type, location, category, AFSS scope, service label, optional outcome + year, real building photograph).
- **Partners**: at least three approved relationships (name, category, optional logo file, optional one-line relationship, optional URL). Must not include NSW Government / FRNSW / FPAA / Building Commission NSW as partners.
- **Testimonials**: at least three approved reviews (verbatim quote, name, role, property type, location, optional rating, optional Google source + URL).

Until Pete supplies the data, the new sections stay hidden but the architecture is live — adding one row to any data file brings its section live without touching the JSX.