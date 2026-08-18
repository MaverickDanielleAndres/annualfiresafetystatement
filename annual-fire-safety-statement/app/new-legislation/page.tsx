import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import CTASection from "@/components/CTASection";
import RevealOnView from "@/components/RevealOnView";
import { createPageMetadata } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "AS 1851-2012 in NSW — What Changed for Fire Safety Maintenance",
  description:
    "From 13 February 2026, AS 1851-2012 is the standard for routine fire safety maintenance in NSW. What it means for your AFSS, your Fire Safety Schedule, and your records.",
  path: "/new-legislation",
  keywords: ["AS 1851-2012", "NSW maintenance", "13 February 2026", "fire safety"],
});

export default function AS1851Page() {
  return (
    <>
      <PageHero
        eyebrow="AS 1851-2012 · NSW"
        titleLines={["Fire safety", "maintenance", "changed in NSW."]}
        description="A new standard, a new schedule, and a clearer line between servicing and AFSS assessment. Here's what it means for your building."
        imageSrc="/hero-as1851.svg"
        imageAlt="AS 1851-2012 — 13 February 2026 NSW fire safety maintenance"
        imagePosition="center"
        primaryCta={{ label: "Get a free quote", href: "/free-quote" }}
        secondaryCta={{ label: "Read FAQ", href: "/faq" }}
      />

      {/* Section 01 — 13 FEB 2026 visual moment */}
      <section className="afss-section--dark">
        <div className="container-inner section-y">
          <RevealOnView>
            <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-16">
              <div>
                <p className="h-eyebrow h-eyebrow--light">01 / The date</p>
                <p
                  className="text-[clamp(5rem,16vw,12rem)] leading-[0.85] font-extrabold tracking-[-0.04em] m-0"
                  style={{ color: "#fde047" }}
                >
                  13
                  <br />
                  <span className="text-[#fb5614]">FEB</span>
                  <br />
                  2026
                </p>
              </div>
              <div>
                <h2 className="h-section text-white m-0">
                  Fire safety maintenance
                  <br />
                  changed in NSW.
                </h2>
                <p className="text-lead text-white/80 mt-6 max-w-prose">
                  From 13 February 2026, AS 1851-2012 is the standard for
                  routine fire safety maintenance in NSW. The new standard
                  brings a clearer servicing schedule, clearer records, and a
                  clearer line between maintenance and AFSS assessment.
                </p>
              </div>
            </div>
          </RevealOnView>
        </div>
      </section>

      {/* Section 02 — Inspect / Test / Maintain / Record */}
      <section className="container-inner section-y">
        <RevealOnView>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-center lg:gap-16">
            <div>
              <p className="h-eyebrow">02 / What AS 1851-2012 requires</p>
              <h2 className="h-section--sm mt-3 leading-[0.95]">
                <span className="block">Inspect.</span>
                <span className="block">Test.</span>
                <span className="block">Maintain.</span>
                <span className="block" style={{ color: "#fb5614" }}>
                  Record.
                </span>
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[#ececec] p-6">
                <p className="h-eyebrow mb-2">Routine</p>
                <p className="text-body">
                  Inspection, testing and preventive maintenance on the
                  schedule the standard sets — for each measure on your
                  Schedule.
                </p>
              </div>
              <div className="rounded-xl border border-[#ececec] p-6">
                <p className="h-eyebrow mb-2">Records</p>
                <p className="text-body">
                  Maintenance records that show what was done, when, and by
                  whom — the foundation of any future AFSS assessment.
                </p>
              </div>
              <div className="rounded-xl border border-[#ececec] p-6">
                <p className="h-eyebrow mb-2">Defects</p>
                <p className="text-body">
                  Defects identified during servicing that need to be tracked,
                  addressed, and reflected in the next AFSS.
                </p>
              </div>
              <div className="rounded-xl border border-[#ececec] p-6">
                <p className="h-eyebrow mb-2">Outcomes</p>
                <p className="text-body">
                  A clear trail from routine service to the building&apos;s
                  annual fire safety compliance story.
                </p>
              </div>
            </div>
          </div>
        </RevealOnView>
      </section>

      {/* Section 03 — AS 1851 vs AFSS */}
      <section className="bg-[#faf9f7]">
        <div className="container-inner section-y">
          <RevealOnView>
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-12">
              <div>
                <p className="h-eyebrow">03 / The distinction</p>
                <h2 className="h-section mt-3">
                  AS 1851
                  <br />
                  isn&apos;t your AFSS.
                </h2>
                <p className="text-body mt-6 max-w-prose">
                  Routine servicing under AS 1851-2012 keeps your fire
                  safety systems in working order. Your Annual Fire Safety
                  Statement is the annual assessment that confirms the
                  measures on your Schedule meet the required performance
                  standards.
                </p>
                <p className="text-body mt-4 max-w-prose">
                  They work together. They are not the same thing.
                </p>
              </div>
              <div className="grid gap-4">
                <div className="rounded-xl bg-white border border-[#ececec] p-6">
                  <p className="h-eyebrow mb-2">AS 1851-2012</p>
                  <h3 className="h-4 mb-2">Routine servicing + maintenance</h3>
                  <p className="text-small">
                    On the schedule the standard sets, by a competent
                    technician. Produces a service report.
                  </p>
                </div>
                <div className="rounded-xl bg-[#111111] text-white p-6">
                  <p className="h-eyebrow h-eyebrow--light mb-2">AFSS</p>
                  <h3 className="h-4 mb-2 text-white">Annual assessment + statement</h3>
                  <p className="text-small text-white/70">
                    By an Accredited Practitioner (Fire Safety). Produces a
                    signed AFSS for the owner and council.
                  </p>
                </div>
              </div>
            </div>
          </RevealOnView>
        </div>
      </section>

      {/* Section 04 — Fire Safety Schedule still matters */}
      <section className="container-inner section-y">
        <RevealOnView>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
            <div>
              <p className="h-eyebrow">04 / The Schedule</p>
              <h2 className="h-section--sm mt-3 leading-[0.98]">
                Your Fire Safety
                <br />
                Schedule still matters.
              </h2>
              <p className="text-body mt-6 max-w-prose">
                AS 1851-2012 doesn&apos;t replace your Fire Safety Schedule —
                it sits alongside it. The Schedule tells us which measures to
                assess. AS 1851-2012 tells us how the maintenance of those
                measures should be carried out.
              </p>
              <p className="text-body mt-4 max-w-prose">
                Bring both, and the AFSS becomes straightforward.
              </p>
            </div>
            <div className="rounded-xl border border-[#ececec] bg-[#faf9f7] p-6 sm:p-8">
              <p className="h-eyebrow mb-2">A simple taxonomy</p>
              <ul className="flex flex-col gap-3 mt-4">
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#fb5614] flex-none" />
                  <span className="text-body">
                    <strong className="text-[#111111]">Fire Safety Schedule</strong> — lists
                    the measures in your building.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#fb5614] flex-none" />
                  <span className="text-body">
                    <strong className="text-[#111111]">AS 1851-2012</strong> — how each
                    measure is maintained.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#fb5614] flex-none" />
                  <span className="text-body">
                    <strong className="text-[#111111]">AFSS</strong> — the annual
                    assessment and signed statement.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </RevealOnView>
      </section>

      {/* Section 05 — Owner responsibility */}
      <section className="afss-section--dark">
        <div className="container-inner section-y">
          <RevealOnView>
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
              <div>
                <p className="h-eyebrow h-eyebrow--light">05 / The owner</p>
                <h2 className="h-section text-white mt-3 leading-[0.98]">
                  Own the building?
                  <br />
                  Own the responsibility.
                </h2>
              </div>
              <ul className="grid gap-3">
                {[
                  "Maintain the measures.",
                  "Keep the records.",
                  "Stay on top of defects.",
                  "Lodge the AFSS on time.",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#fb5614] flex-none" />
                    <span className="text-large text-white font-semibold">
                      {line}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </RevealOnView>
        </div>
      </section>

      {/* Final CTA */}
      <CTASection
        title="AFSS coming up?"
        body="Send us your Fire Safety Schedule and we'll handle the AFSS — and flag any AS 1851-2012 maintenance items we've seen on your servicing records."
        primaryCta={{ label: "Get a free quote", href: "/free-quote" }}
        secondaryCta={{ label: "Call 1300 765 594", href: "tel:1300765594" }}
      />
    </>
  );
}
