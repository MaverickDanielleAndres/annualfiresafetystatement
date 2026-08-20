import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/site";

import AfssHeroSection from "@/components/AfssHeroSection";
import AfssRecognitionSection from "@/components/AfssRecognitionSection";
import InstantQuoteJourneySection from "@/components/InstantQuoteJourneySection";
import KnowYourDocumentsSection from "@/components/KnowYourDocumentsSection";
import WhatIsAnAfssSection from "@/components/WhatIsAnAfssSection";
import ComplianceSection from "@/components/ComplianceSection";
import TheProcessSection from "@/components/TheProcessSection";
import FireSafetyScheduleSection from "@/components/FireSafetyScheduleSection";
import ContactCTA from "@/components/ContactCTA";

export const metadata: Metadata = createPageMetadata({
  title: "NSW AFSS Specialists — Annual Fire Safety Statements",
  description:
    "Annual Fire Safety Statement (AFSS) assessments for NSW strata, commercial and industrial buildings. From your Fire Safety Schedule to a lodged AFSS, handled by accredited practitioners.",
  path: "/",
  keywords: [
    "AFSS",
    "Annual Fire Safety Statement NSW",
    "Fire Safety Schedule",
    "AFSS assessment",
    "NSW fire compliance",
  ],
});

export default function HomePage() {
  return (
    <>
      {/* Hero — new document-panel composition */}
      <AfssHeroSection />

      {/* 01 / Your AFSS */}
      <AfssRecognitionSection />

      {/* 02 / Instant Quote */}
      <InstantQuoteJourneySection />

      {/* 03 / Know Your Documents */}
      <KnowYourDocumentsSection />

      {/* 04 / What is an AFSS? */}
      <WhatIsAnAfssSection />

      {/* 05 / Penalties, practitioners, why compliance matters (NEW) */}
      <ComplianceSection />

      {/* 06 / The Process */}
      <TheProcessSection />

      {/* 07 — 10 / Your Fire Safety Statement, Due Date, Accredited Practitioners, AS 1851 */}
      <FireSafetyScheduleSection />

      {/* Final CTA */}
      <ContactCTA />
    </>
  );
}
