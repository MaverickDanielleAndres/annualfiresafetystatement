import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import ContactCTA from "@/components/ContactCTA";
import RevealOnView from "@/components/RevealOnView";
import { createPageMetadata } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "AFSS Services — From Schedule to Statement",
  description:
    "End-to-end AFSS services for NSW buildings: schedule review, measure-by-measure assessment, AFSS draft, and council lodgement support.",
  path: "/services",
  keywords: ["AFSS services", "Fire Safety Schedule", "AFSS assessment"],
});

const measures = [
  {
    n: "01",
    title: "Fire detection & alarm",
    body: "AS 1670.1 systems, occupant warning and occupant address systems.",
  },
  {
    n: "02",
    title: "Sprinklers",
    body: "AS 2118.1 and AS 2118.4 systems, valves, blocks, and alarm panels.",
  },
  {
    n: "03",
    title: "Hydrants",
    body: "AS 2419.1 — booster assemblies, hydrant valves, FRNSW connections.",
  },
  {
    n: "04",
    title: "Hose reels",
    body: "AS 2441 — installation, pressure, and rewind checks.",
  },
  {
    n: "05",
    title: "Portable extinguishers",
    body: "AS 2444 — selection, placement, signage, and access.",
  },
  {
    n: "06",
    title: "Fire doors",
    body: "AS 1905.1 — self-closing, sealing, signage, and integrity.",
  },
  {
    n: "07",
    title: "Emergency lighting",
    body: "AS 2293.1 / .3 — sustained illumination and exit signage.",
  },
  {
    n: "08",
    title: "Exit systems",
    body: "Paths of travel, hardware, and pressurisation where applicable.",
  },
  {
    n: "09",
    title: "Passive fire",
    body: "Penetration seals, fire-rated construction, and smoke barriers.",
  },
];

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Annual Fire Safety Statement services"
        titleLines={["From schedule", "to statement."]}
        description="End-to-end AFSS work for NSW strata, commercial and industrial buildings. From the Schedule on your wall to the statement in the council's hands."
        imageSrc="/hero-services.svg"
        imageAlt="Fire safety equipment: exit sign, fire door, extinguisher cabinet, sprinkler, emergency lighting"
        imagePosition="center"
        primaryCta={{ label: "Get a free quote", href: "/free-quote" }}
        secondaryCta={{ label: "View sample AFSS", href: "/sample" }}
      />

      {/* Section 01 — Fire Safety Schedule */}
      <section className="container-inner section-y">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-16">
          <RevealOnView>
            <div className="relative overflow-hidden rounded-2xl shadow-card">
              <Image
                src="/schedule.svg"
                alt="Fire Safety Schedule document"
                width={1200}
                height={1500}
                className="h-auto w-full"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </RevealOnView>
          <RevealOnView>
            <p className="h-eyebrow">01 / Your Fire Safety Schedule</p>
            <h2 className="h-section mt-3">
              Every building
              <br />
              starts here.
            </h2>
            <p className="text-body mt-6 max-w-prose">
              The Fire Safety Schedule is the source document for every AFSS.
              It lists the essential fire safety measures installed in your
              building and the standard each one must meet. Without it, an
              assessment isn&apos;t really an assessment — it&apos;s a guess.
            </p>
            <p className="text-body mt-4 max-w-prose">
              Don&apos;t have a copy, or never seen one? We can help locate it
              through council, the original building approval, or the certifying
              engineer.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/free-quote" className="btn btn-primary btn-lg">
                Send your Schedule
              </Link>
              <Link href="/contact-us" className="btn-link">
                Ask a question
              </Link>
            </div>
          </RevealOnView>
        </div>
      </section>

      {/* Section 02 — The 5-step process */}
      <section className="bg-[#faf9f7]">
        <div className="container-inner section-y">
          <SectionHeading
            kicker="02 / The process"
            title={
              <>
                How an AFSS
                <br />
                assessment works.
              </>
            }
            body="Linear, scoped, and built around your Fire Safety Schedule. No surprises, no scope creep."
          />

          <RevealOnView>
            <ol className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
              {[
                { n: "01", title: "Review", body: "Fire Safety Schedule review and building specifics." },
                { n: "02", title: "Assess", body: "Each essential measure against its required standard." },
                { n: "03", title: "Report", body: "Clear findings — pass, defect, follow-up." },
                { n: "04", title: "Statement", body: "AFSS draft prepared by an Accredited Practitioner." },
                { n: "05", title: "Lodge", body: "Council or strata lodgement support, end to end." },
              ].map((s) => (
                <li key={s.n} className="flex flex-col gap-3">
                  <span className="font-mono text-[#d64114] text-[0.85rem] font-bold tracking-[0.18em]">{s.n}</span>
                  <h3 className="h-3">{s.title}</h3>
                  <p className="text-small">{s.body}</p>
                </li>
              ))}
            </ol>
          </RevealOnView>
        </div>
      </section>

      {/* Section 03 — Essential measures on your schedule */}
      <section className="container-inner section-y">
        <SectionHeading
          kicker="03 / What's on your Schedule"
          title={
            <>
              What&apos;s on your
              <br />
              schedule?
            </>
          }
          body="Common essential fire safety measures listed on NSW Fire Safety Schedules. The exact list depends on your building."
        />

        <RevealOnView>
          <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {measures.map((m) => (
              <li key={m.n} className="flex items-start gap-4">
                <span
                  className="font-mono text-[0.78rem] font-bold tracking-[0.18em] text-[#d64114] mt-1"
                  aria-hidden="true"
                >
                  {m.n}
                </span>
                <div className="min-w-0">
                  <h3 className="h-4 mb-1">{m.title}</h3>
                  <p className="text-small">{m.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </RevealOnView>

        <div className="mt-12 rounded-xl border border-[#ececec] bg-[#faf9f7] p-6 sm:p-8">
          <p className="h-eyebrow mb-2">A note on scope</p>
          <p className="text-body max-w-prose">
            We assess the measures that accredited practitioners are qualified
            to assess. Where your Schedule lists measures outside our
            accreditation, we coordinate with the appropriate practitioners
            so they all sign off through one AFSS.
          </p>
        </div>
      </section>

      {/* Section 04 — Building types */}
      <section className="afss-section--dark">
        <div className="container-inner section-y">
          <RevealOnView>
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
              <div>
                <p className="h-eyebrow h-eyebrow--light">04 / Building types</p>
                <h2 className="h-section text-white mt-3">
                  Different buildings.
                  <br />
                  Same responsibility.
                </h2>
                <p className="text-lead text-white/80 mt-6 max-w-prose">
                  The AFSS framework applies to every building with a Fire
                  Safety Schedule. The measures, the practitioners and the risk
                  profile vary — the duty doesn&apos;t.
                </p>
              </div>
              <ul className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: "Strata", body: "Residential, mixed-use, OC's." },
                  { label: "Commercial", body: "Office, retail, hospitality." },
                  { label: "Industrial", body: "Warehouses, manufacturing." },
                  { label: "Institutional", body: "Schools, healthcare, public." },
                ].map((b) => (
                  <li
                    key={b.label}
                    className="rounded-xl border border-white/15 bg-white/5 p-5"
                  >
                    <h3 className="h-4 text-white mb-1">{b.label}</h3>
                    <p className="text-small text-white/70">{b.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          </RevealOnView>
        </div>
      </section>

      {/* Section 05 — 12 months typography moment */}
      <section className="container-inner section-y">
        <RevealOnView>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
            <p
              className="text-[clamp(5rem,18vw,11rem)] leading-[0.88] font-extrabold tracking-[-0.04em] m-0"
              style={{ color: "#111111" }}
            >
              12
              <br />
              <span style={{ color: "#fb5614" }}>months.</span>
            </p>
            <div>
              <p className="h-eyebrow">05 / The cycle</p>
              <h2 className="h-section mt-3">
                Don&apos;t let your AFSS date sneak up.
              </h2>
              <p className="text-body mt-6 max-w-prose">
                Every Annual Fire Safety Statement sits on a 12-month cycle.
                Building owners who plan early avoid the late rush, the
                certification scramble, and the council correspondence that
                comes with it.
              </p>
            </div>
          </div>
        </RevealOnView>
      </section>

      {/* Final CTA */}
      <ContactCTA />
    </>
  );
}
