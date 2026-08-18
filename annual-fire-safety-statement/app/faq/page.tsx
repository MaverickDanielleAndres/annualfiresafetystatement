import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import PageHero from "@/components/PageHero";
import CTASection from "@/components/CTASection";
import RevealOnView from "@/components/RevealOnView";
import FAQAccordion from "@/components/FAQAccordion";
import { createPageMetadata } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Frequently Asked Questions about AFSS",
  description:
    "Answers to common questions about Annual Fire Safety Statements in NSW — what an AFSS is, when it's required, who can assess it, and what changed with AS 1851-2012.",
  path: "/faq",
  keywords: ["AFSS FAQ", "AFSS questions", "NSW fire safety FAQ"],
});

const faqs = [
  {
    question: "What is an Annual Fire Safety Statement?",
    answer:
      "An Annual Fire Safety Statement (AFSS) is the annual document an NSW building owner is required to lodge, confirming that each essential fire safety measure listed on the building's Fire Safety Schedule has been assessed against the required performance standard by an Accredited Practitioner (Fire Safety).",
  },
  {
    question: "Does my building need an AFSS?",
    answer:
      "If your building has a Fire Safety Schedule — which is most buildings the Council or a private certifier has identified as needing one — an AFSS is required each year. The Schedule itself is the best confirmation; if you are unsure, we can help you locate it.",
  },
  {
    question: "How often is an AFSS required?",
    answer:
      "Once a year. The renewal date is typically 12 months from the previous AFSS, and the document is due on the same date each year. Missing the date can mean council correspondence, so most owners plan a couple of months ahead.",
  },
  {
    question: "What is a Fire Safety Schedule?",
    answer:
      "A Fire Safety Schedule is the source document that lists the essential fire safety measures installed in your building and the standard each one is required to meet. It is the basis for every AFSS. The Schedule is usually held by the owner, the strata manager, or the Council.",
  },
  {
    question: "Who can assess my fire safety measures?",
    answer:
      "An Accredited Practitioner (Fire Safety) — APFS — assesses and signs the AFSS. Their accreditation is category-specific, so the right practitioner depends on the measures on your Schedule. We coordinate the right practitioner for each measure.",
  },
  {
    question: "Can one practitioner assess everything?",
    answer:
      "Not always. The practitioner's accreditation determines the scope of measures they can assess. For a building with a long or diverse Schedule, the AFSS may be signed by more than one practitioner — but it arrives as a single document.",
  },
  {
    question: "Where is the AFSS lodged?",
    answer:
      "AFSS lodgement depends on the building. Typically the AFSS is displayed in the building and a copy is lodged with the Council and/or the fire authority. For strata buildings, the original is held by the Owners Corporation. We support the lodgement process as part of the assessment.",
  },
  {
    question: "What changed with AS 1851-2012?",
    answer:
      "From 13 February 2026, AS 1851-2012 is the standard for routine fire safety maintenance in NSW. It does not replace your AFSS — it sets the schedule and records for routine service. Routine service under AS 1851-2012 keeps the measures in working order; the AFSS is the annual assessment that signs them off.",
  },
  {
    question: "Is servicing the same as an AFSS assessment?",
    answer:
      "No. Servicing is the routine maintenance carried out by a competent technician, producing a service report. An AFSS assessment is the annual assessment of each measure against its required standard, carried out and signed by an Accredited Practitioner (Fire Safety).",
  },
  {
    question: "What if I can't find my Fire Safety Schedule?",
    answer:
      "We can help. The Schedule is usually lodged with the Council when the building was approved or last modified. We can also work from the certifying engineer's records or the original building approval. Send us what you have and we'll trace the rest.",
  },
];

export default function FAQPage() {
  return (
    <>
      <PageHero
        eyebrow="Frequently asked"
        titleLines={["AFSS,", "demystified."]}
        description="Quick answers to the questions we hear most about Annual Fire Safety Statements in NSW. Can't find what you're looking for? Call us."
        imageSrc="/hero-contact.svg"
        imageAlt="AFSS frequently asked questions"
        imagePosition="center"
        primaryCta={{ label: "Call 1300 765 594", href: "tel:1300765594" }}
        secondaryCta={{ label: "Get a free quote", href: "/free-quote" }}
      />

      <section className="container-inner section-y-tight">
        <RevealOnView>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16">
            <div>
              <p className="h-eyebrow">Questions</p>
              <h2 className="h-section--sm mt-3">Common questions about AFSS.</h2>
              <p className="text-body mt-6 max-w-prose">
                The most common questions we get from building owners, strata
                managers and facility teams. If your question isn&apos;t here,
                call us — we&apos;ll answer it.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/contact-us" className="btn btn-secondary">
                  Ask a question <ArrowUpRight size={16} strokeWidth={2.4} />
                </Link>
              </div>
            </div>
            <div>
              <FAQAccordion items={faqs} />
            </div>
          </div>
        </RevealOnView>
      </section>

      <CTASection
        title="Still have a question?"
        body="If the answer isn't here, give us a call. We respond to enquiries within one business day."
        primaryCta={{ label: "Get a free quote", href: "/free-quote" }}
        secondaryCta={{ label: "Call 1300 765 594", href: "tel:1300765594" }}
      />
    </>
  );
}
