import Image from "next/image";
import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import ContactCTA from "@/components/ContactCTA";
import RevealOnView from "@/components/RevealOnView";
import { createPageMetadata } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Sample AFSS — What You're Signing Off On",
  description:
    "The Annual Fire Safety Statement is the document your building owner signs each year. See what's in it, what it certifies, and what it doesn't.",
  path: "/sample",
  keywords: ["AFSS sample", "sample AFSS", "Annual Fire Safety Statement template"],
});

const callouts = [
  {
    label: "Building details",
    body: "Address, use, owner, and the version of the Schedule being assessed against.",
  },
  {
    label: "Fire Safety Schedule",
    body: "The list of essential fire safety measures installed in the building.",
  },
  {
    label: "Essential measures",
    body: "Each measure's assessment, the standard it was assessed against, and the result.",
  },
  {
    label: "Practitioner details",
    body: "The Accredited Practitioner (Fire Safety) who signed the assessment, with scope.",
  },
  {
    label: "Owner declaration",
    body: "Acknowledgement of the assessment and the owner &apos; s responsibilities.",
  },
];

export default function SamplePage() {
  return (
    <>
      <PageHero
        eyebrow="Sample Annual Fire Safety Statement"
        titleLines={["This is what", "you're signing", "off on."]}
        description="The AFSS is the document your building owner signs each year. See what it contains, what it certifies, and where the boundaries sit."
        imageSrc="/hero-sample.svg"
        imageAlt="Sample AFSS document"
        imagePosition="center"
        primaryCta={{ label: "Get a free quote", href: "/free-quote" }}
        secondaryCta={{ label: "Read FAQ", href: "/faq" }}
      />

      {/* Section 01 — Document preview with callouts */}
      <section className="container-inner section-y">
        <RevealOnView>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
            <div className="relative overflow-hidden rounded-2xl shadow-card bg-[#faf9f7]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#fff7f3] via-transparent to-transparent" />
              <Image
                src="/afss-doc.svg"
                alt="Sample AFSS document"
                width={1200}
                height={1500}
                className="relative h-auto w-full"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
            </div>
            <div>
              <p className="h-eyebrow">01 / What&apos;s in the document</p>
              <h2 className="h-section--sm mt-3">
                Five sections.
                <br />
                One signed statement.
              </h2>
              <ul className="mt-8 flex flex-col gap-5">
                {callouts.map((c, i) => (
                  <li key={c.label} className="flex items-start gap-4">
                    <span className="font-mono text-[0.85rem] font-bold tracking-[0.18em] text-[#d64114] mt-1">
                      0{i + 1}
                    </span>
                    <div className="min-w-0">
                      <h3 className="h-4 mb-1">{c.label}</h3>
                      <p className="text-small">{c.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </RevealOnView>
      </section>

      {/* Section 02 — What AFSS certifies vs not */}
      <section className="bg-[#faf9f7]">
        <div className="container-inner section-y">
          <SectionHeading
            kicker="02 / The signature"
            title={
              <>
                What the AFSS
                <br />
                certifies.
              </>
            }
            body="An AFSS isn't a clearance certificate, a maintenance log, or a building approval. It's a specific, defined annual assessment."
          />

          <RevealOnView>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl bg-white border border-[#ececec] p-6 sm:p-8">
                <p className="h-eyebrow mb-2">AFSS certifies</p>
                <ul className="flex flex-col gap-3 mt-4">
                  {[
                    "Each measure on the Schedule has been assessed.",
                    "Each measure has been assessed against its required standard.",
                    "The assessment is signed by an Accredited Practitioner (Fire Safety).",
                    "The owner has acknowledged the assessment.",
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#16a34a] flex-none" />
                      <span className="text-body">{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl bg-white border border-[#ececec] p-6 sm:p-8">
                <p className="h-eyebrow mb-2">AFSS does not certify</p>
                <ul className="flex flex-col gap-3 mt-4">
                  {[
                    "That a building has no defects (defects are noted).",
                    "That routine service has been carried out (that's AS 1851-2012).",
                    "That a building was built to current standards (that's the original approval).",
                    "That the building is safe for any specific future event.",
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#777777] flex-none" />
                      <span className="text-body">{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </RevealOnView>
        </div>
      </section>

      {/* Final CTA */}
      <ContactCTA />
    </>
  );
}
