import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import ContactCTA from "@/components/ContactCTA";
import { createPageMetadata } from "@/lib/site";

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





import AfssRecognitionSection from "@/components/AfssRecognitionSection";
import InstantQuoteJourneySection from "@/components/InstantQuoteJourneySection";
import KnowYourDocumentsSection from "@/components/KnowYourDocumentsSection";
import TheProcessSection from "@/components/TheProcessSection";
import WhatIsAnAfssSection from "@/components/WhatIsAnAfssSection";
import FireSafetyScheduleSection from "@/components/FireSafetyScheduleSection";

export default function HomePage() {
  return (
    <>
      <PageHero
        layout="primary"
        eyebrow="ANNUAL FIRE SAFETY STATEMENTS • NSW"
        titleLines={["YOUR AFSS ISN'T", "JUST PAPERWORK.", "IT'S RESPONSIBILITY."]}
        description={
          <>
            From your Fire Safety Schedule to assessment and statement,<br />
            we make the AFSS process clear and straightforward.
          </>
        }
        imageSrc="/herosection.avif"
        imageAlt="Accredited practitioner inspecting building equipment on site"
        imagePosition="center"
        foregroundImageSrc="/annualstatementsample-nobg.png"
        foregroundImageAlt="Annual Fire Safety Statement sample document"
        hideWatermark={true}
        primaryCta={{ label: "GET AN INSTANT QUOTE", href: "/free-quote", isBookTheBoss: true }}
        secondaryCta={{ label: "VIEW SAMPLE AFSS →", href: "/sample" }}
      />

      <AfssRecognitionSection />
      <InstantQuoteJourneySection />
      <KnowYourDocumentsSection />
      <WhatIsAnAfssSection />
      <TheProcessSection />
      <FireSafetyScheduleSection />
      {/* Final CTA */}
      <ContactCTA />
    </>
  );
}
