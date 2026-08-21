import type { Metadata } from "next";
import { createPageMetadata, SITE_URL } from "@/lib/site";

import Hero from "@/components/home/Hero";
import GotYourAfss from "@/components/home/GotYourAfss";
import HowItWorks from "@/components/home/HowItWorks";
import InspectionInvolves from "@/components/home/InspectionInvolves";
import NeedsAfss from "@/components/home/NeedsAfss";
import WhatIsAfss from "@/components/home/WhatIsAfss";
import MeasuresAssessed from "@/components/home/MeasuresAssessed";
import DueDatePenalties from "@/components/home/DueDatePenalties";
import AccreditedPractitioners from "@/components/home/AccreditedPractitioners";
import Projects from "@/components/home/Projects";
import Partners from "@/components/home/Partners";
import Testimonials from "@/components/home/Testimonials";
import KnowYourDocuments from "@/components/home/KnowYourDocuments";
import AS1851 from "@/components/home/AS1851";
import FAQ from "@/components/home/FAQ";
import FinalCTA from "@/components/home/FinalCTA";

export const metadata: Metadata = createPageMetadata({
  title: "Annual Fire Safety Statement (AFSS) — Sydney NSW",
  description:
    "Annual Fire Safety Statements (AFSS) for NSW strata, commercial and industrial buildings. From your Fire Safety Schedule through assessment and AFSS preparation.",
  path: "/",
  keywords: [
    "AFSS",
    "Annual Fire Safety Statement",
    "AFSS NSW",
    "Annual Fire Safety Statement NSW",
    "Sydney AFSS",
    "Fire Safety Schedule",
    "Accredited Practitioner Fire Safety",
    "APFS",
    "AS 1851-2012",
    "NSW fire compliance",
    "strata fire safety",
    "Sydney fire safety",
  ],
});

// ─── JSON-LD ───────────────────────────────────────────────────────────────
// Two structured-data blocks: LocalBusiness + FAQPage. They sit inline
// (not via next/script) so the homepage ships with a single HTML payload
// and search engines can read them without JS. Keep them factual.

const businessLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE_URL.toString()}#business`,
  name: "Annual Fire Safety Statement",
  url: SITE_URL.toString(),
  telephone: "+61-1300-765-594",
  email: "admin@annualfiresafetystatement.com.au",
  areaServed: {
    "@type": "State",
    name: "New South Wales",
  },
  address: {
    "@type": "PostalAddress",
    addressRegion: "NSW",
    addressCountry: "AU",
  },
  description:
    "Annual Fire Safety Statements (AFSS) for NSW strata, commercial and industrial buildings, handled by accredited practitioners.",
  priceRange: "$$",
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${SITE_URL.toString()}#faq`,
  mainEntity: [
    {
      "@type": "Question",
      name: "What is an AFSS?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "An Annual Fire Safety Statement is the annual document issued by or for the owner of an existing NSW building with an applicable Fire Safety Schedule. It confirms the essential fire safety measures have been assessed, inspected and verified against the required standards by appropriately accredited practitioners.",
      },
    },
    {
      "@type": "Question",
      name: "Who is responsible for arranging an AFSS?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The building owner is responsible for ensuring the required AFSS is issued and provided within the required timeframe. An authorised agent may assist with the process.",
      },
    },
    {
      "@type": "Question",
      name: "How often is an AFSS required?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "An AFSS is required once every year. The statement must be issued and a copy provided to Fire and Rescue NSW, and the current statement must be prominently displayed in the building along with the Fire Safety Schedule.",
      },
    },
    {
      "@type": "Question",
      name: "What happens if my AFSS is overdue?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Penalties for failing to lodge an AFSS can be significant under current NSW regulation. Council may issue notices or escalate to enforcement action, and late lodgement can also affect insurance and sale due diligence.",
      },
    },
    {
      "@type": "Question",
      name: "What is a Fire Safety Schedule?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A Fire Safety Schedule (FSS) lists the essential fire safety measures that apply to a building and the minimum standards of performance each measure must meet.",
      },
    },
    {
      "@type": "Question",
      name: "Who can assess my fire safety measures?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Where an approved accreditation scheme covers the relevant function, the assessment must be performed by an appropriately accredited practitioner. Current accreditation status can be verified on the public register.",
      },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      {/* Structured data — kept inline so search crawlers read it without JS. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      {/* Hero — H1 + above-fold quote starter + AFSS document visual */}
      <Hero />

      {/* 01 / Got your AFSS? — three pathway rows */}
      <GotYourAfss />

      {/* 02 / How it works */}
      <HowItWorks />

      {/* 03 / What the inspection involves */}
      <InspectionInvolves />

      {/* 04 / Does my building need an AFSS? */}
      <NeedsAfss />

      {/* 05 / What is an AFSS? */}
      <WhatIsAfss />

      {/* 06 / What gets assessed? */}
      <MeasuresAssessed />

      {/* 07 / Due date & penalties */}
      <DueDatePenalties />

      {/* 08 / Accredited Practitioners */}
      <AccreditedPractitioners />

      {/* 09 / Projects — currently hidden (data empty, see data/projects.ts) */}
      <Projects />

      {/* 10 / Partners — currently hidden (data empty, see data/partners.ts) */}
      <Partners />

      {/* 11 / Testimonials — currently hidden (data empty, see data/testimonials.ts) */}
      <Testimonials />

      {/* When the above three return, the visible labels below shift to
          12 / Know your documents and 13 / AS 1851-2012 respectively. */}
      {/* 09 / Know your documents (visible while Projects/Partners/Testimonials are hidden) */}
      <KnowYourDocuments />

      {/* 10 / AS 1851-2012 (visible while Projects/Partners/Testimonials are hidden) */}
      <AS1851 />

      {/* FAQ */}
      <FAQ />

      {/* Final CTA */}
      <FinalCTA />
    </>
  );
}