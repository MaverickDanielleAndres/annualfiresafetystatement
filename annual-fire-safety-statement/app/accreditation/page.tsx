import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import ContactCTA from "@/components/ContactCTA";
import RevealOnView from "@/components/RevealOnView";
import { createPageMetadata } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Accredited Practitioners (Fire Safety)",
  description:
    "Not every practitioner assesses everything. AFSS assessments are signed by Accredited Practitioners (Fire Safety) — for the measures they're accredited to assess.",
  path: "/accreditation",
  keywords: ["APFS", "Accredited Practitioner Fire Safety", "AFSS accreditation"],
});

export default function AccreditationPage() {
  return (
    <>
      <PageHero
        eyebrow="Accredited Practitioners (Fire Safety)"
        titleLines={["Not every", "practitioner", "assesses everything."]}
        description="An Annual Fire Safety Statement can only be signed by an Accredited Practitioner (Fire Safety) — and their scope is specific. Knowing who is accredited to assess what matters."
        imageSrc="/hero-accreditation.svg"
        imageAlt="Accredited Practitioner (Fire Safety) on site with a clipboard"
        imagePosition="center"
        primaryCta={{ label: "Get a free quote", href: "/free-quote" }}
        secondaryCta={{ label: "About AFSS", href: "/about" }}
      />

      {/* Section 01 — APFS visual moment */}
      <section className="afss-section--dark">
        <div className="container-inner section-y">
          <RevealOnView>
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-center lg:gap-16">
              <div>
                <p className="h-eyebrow h-eyebrow--light">01 / What is an APFS</p>
                <p
                  className="text-[clamp(7rem,22vw,16rem)] leading-[0.78] font-extrabold tracking-[-0.06em] m-0"
                  style={{ color: "#fb5614" }}
                >
                  APFS
                </p>
              </div>
              <div>
                <h2 className="h-section text-white m-0">
                  Accredited Practitioner
                  <br />
                  <span className="text-[#fb5614]">(Fire Safety)</span>
                </h2>
                <p className="text-lead text-white/80 mt-6 max-w-prose">
                  An APFS is a practitioner accredited under the NSW
                  Building &amp; Development Certifiers regulation to assess
                  and certify fire safety measures on a Fire Safety Schedule.
                </p>
                <p className="text-body text-white/70 mt-6 max-w-prose">
                  Accreditation is category-specific. The practitioner who
                  signs your AFSS is accredited to assess the measures on
                  your Schedule — and only those measures.
                </p>
              </div>
            </div>
          </RevealOnView>
        </div>
      </section>

      {/* Section 02 — Serviced vs assessed */}
      <section className="container-inner section-y">
        <RevealOnView>
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
            <article className="flex flex-col gap-5">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                <Image
                  src="/img-servicing.svg"
                  alt="Technician performing routine fire system servicing"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <p className="h-eyebrow">Routine service</p>
              <h3 className="h-3">Maintenance · Testing · Repairs</h3>
              <p className="text-body">
                Carried out under AS 1851-2012 (in NSW), on the
                schedule the standard requires. A service report confirms
                the system was checked — it does not certify it for AFSS
                purposes.
              </p>
            </article>
            <article className="flex flex-col gap-5">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                <Image
                  src="/img-assessment.svg"
                  alt="Accredited Practitioner assessing fire safety measures"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <p className="h-eyebrow">AFSS assessment</p>
              <h3 className="h-3">Performance · Standards · Sign-off</h3>
              <p className="text-body">
                An APFS assesses each measure against the performance
                standard listed on the Fire Safety Schedule — and signs
                the AFSS confirming the result.
              </p>
            </article>
          </div>
        </RevealOnView>

        <div className="mt-12 text-center">
          <h2 className="h-section max-w-2xl mx-auto">
            Serviced
            <br />
            doesn&apos;t always mean
            <br />
            <span className="gradient-text">assessed.</span>
          </h2>
        </div>
      </section>

      {/* Section 03 — Multiple measures */}
      <section className="bg-[#faf9f7]">
        <div className="container-inner section-y">
          <RevealOnView>
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
              <div>
                <p className="h-eyebrow">02 / One building, many practitioners</p>
                <h2 className="h-section mt-3">
                  One building.
                  <br />
                  Multiple measures.
                </h2>
                <p className="text-body mt-6 max-w-prose">
                  Most buildings list more than one essential fire safety
                  measure on their Schedule. The right practitioner depends
                  on what&apos;s listed — and may not be the same person for
                  every measure.
                </p>
                <p className="text-body mt-4 max-w-prose">
                  We coordinate the practitioners so the AFSS arrives as a
                  single, signed document.
                </p>
              </div>
              <div className="grid gap-4">
                {[
                  { n: "01", label: "Active fire", body: "Detection, sprinklers, hydrants, hoses, extinguishers." },
                  { n: "02", label: "Passive fire", body: "Fire doors, penetration seals, smoke barriers." },
                  { n: "03", label: "Evacuation", body: "Exit signs, emergency lighting, pressurisation." },
                  { n: "04", label: "Mechanical", body: "Smoke hazard management, ventilation." },
                ].map((item) => (
                  <div
                    key={item.n}
                    className="rounded-xl border border-[#ececec] bg-white p-5"
                  >
                    <div className="flex items-start gap-4">
                      <span className="font-mono text-[0.85rem] font-bold tracking-[0.18em] text-[#d64114]">
                        {item.n}
                      </span>
                      <div className="min-w-0">
                        <h3 className="h-4 mb-1">{item.label}</h3>
                        <p className="text-small">{item.body}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </RevealOnView>

          <div className="mt-12 flex flex-wrap justify-center gap-3">
            <Link href="/free-quote" className="btn btn-primary btn-lg">
              Send us your Fire Safety Schedule
            </Link>
          </div>
        </div>
      </section>

      {/* Section 04 — Practitioners */}
      <section className="container-inner section-y">
        <SectionHeading
          kicker="03 / Practitioners"
          title={
            <>
              Our accredited
              <br />
              practitioners.
            </>
          }
          body="Each practitioner is selected by the measures on your Schedule. Names, accreditation numbers and assessed measures are confirmed and listed on the AFSS we'll prepare for you."
        />

        <RevealOnView>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Practitioner",
                role: "Accredited Practitioner (Fire Safety)",
                scope: "Scope of assessment listed on the AFSS",
                note: "Accreditation number verified and recorded on the issued AFSS.",
              },
              {
                name: "Practitioner",
                role: "Accredited Practitioner (Fire Safety)",
                scope: "Scope of assessment listed on the AFSS",
                note: "Accreditation number verified and recorded on the issued AFSS.",
              },
              {
                name: "Practitioner",
                role: "Accredited Practitioner (Fire Safety)",
                scope: "Scope of assessment listed on the AFSS",
                note: "Accreditation number verified and recorded on the issued AFSS.",
              },
            ].map((p, i) => (
              <article key={i} className="afss-card">
                <div className="afss-card__media" style={{ aspectRatio: "1.25" }}>
                  <Image
                    src="/img-practitioner.svg"
                    alt="Accredited Practitioner (Fire Safety) on site"
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="afss-card__body">
                  <h3 className="afss-card__title">{p.name}</h3>
                  <p className="text-small font-bold m-0 text-[#111111]">
                    {p.role}
                  </p>
                  <p className="text-small text-[#4a4a46] m-0">{p.scope}</p>
                  <p className="text-small text-[#777777] m-0 mt-2 italic">
                    {p.note}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </RevealOnView>

        <p className="text-small text-[#777777] mt-8 max-w-prose">
          Names, accreditation numbers and assessed measures are recorded on
          the issued AFSS. Where the practitioner&apos;s scope is yet to be
          confirmed, we coordinate with the right APFS for your Schedule
          before any assessment begins.
        </p>
      </section>

      {/* Final CTA */}
      <ContactCTA />
    </>
  );
}
