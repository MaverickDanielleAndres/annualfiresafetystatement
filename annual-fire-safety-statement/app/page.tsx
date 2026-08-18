import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowUpRight, FileText, ShieldCheck, ClipboardList } from "lucide-react";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import CTASection from "@/components/CTASection";
import RevealOnView from "@/components/RevealOnView";
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

const processSteps = [
  {
    n: "01",
    title: "Review",
    body: "Your Fire Safety Schedule and building specifics.",
  },
  {
    n: "02",
    title: "Assess",
    body: "Each essential measure against its required performance standard.",
  },
  {
    n: "03",
    title: "Report",
    body: "Clear findings — pass, defect, or follow-up.",
  },
  {
    n: "04",
    title: "Statement",
    body: "AFSS draft prepared by an Accredited Practitioner.",
  },
  {
    n: "05",
    title: "Lodge",
    body: "Council or strata lodgement support, all wrapped up.",
  },
];

const buildingTypes = [
  {
    label: "Strata",
    body: "Residential and mixed-use. Owner corporations, strata managers, building managers.",
    image: "/img-building-strata.svg",
  },
  {
    label: "Commercial",
    body: "Office towers, retail, hospitality. From small fit-outs to multi-storey assets.",
    image: "/img-building-commercial.svg",
  },
  {
    label: "Industrial",
    body: "Warehouses, manufacturing, logistics. Specialised measures and high-risk services.",
    image: "/img-building-industrial.svg",
  },
  {
    label: "Institutional",
    body: "Schools, healthcare, public buildings. Strict compliance and audit-grade reporting.",
    image: "/img-building-institutional.svg",
  },
];

export default function HomePage() {
  return (
    <>
      <PageHero
        eyebrow="ACCREDITED PRACTITIONERS (FIRE SAFETY) • NSW"
        titleLines={["YOUR AFSS ISN'T", "JUST PAPERWORK.", "IT'S RESPONSIBILITY."]}
        description="From your Fire Safety Schedule to the annual assessment and statement, we help make the AFSS process clear, thorough and straightforward."
        imageSrc="/herosection.avif"
        imageAlt="Accredited practitioner inspecting building equipment on site"
        imagePosition="center"
        primaryCta={{ label: "BOOK THE BOSS", href: "/free-quote" }}
        secondaryCta={{ label: "EXPLORE OUR SERVICES →", href: "/services" }}
      />

      {/* Trust strip — three short promises. Asymmetric, no big cards. */}
      <section className="container-inner py-12 sm:py-16">
        <RevealOnView className="grid gap-8 sm:grid-cols-3">
          <div className="flex items-start gap-4">
            <div className="afss-card__index" aria-hidden="true">
              <ShieldCheck size={18} strokeWidth={2.6} />
            </div>
            <div className="min-w-0">
              <h3 className="h-4 mb-1">APFS only</h3>
              <p className="text-small">
                Each assessment is signed by an Accredited Practitioner (Fire Safety).
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="afss-card__index" aria-hidden="true">
              <ClipboardList size={18} strokeWidth={2.6} />
            </div>
            <div className="min-w-0">
              <h3 className="h-4 mb-1">Schedule-driven</h3>
              <p className="text-small">
                Every assessment reads from your Fire Safety Schedule — nothing assumed.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="afss-card__index" aria-hidden="true">
              <FileText size={18} strokeWidth={2.6} />
            </div>
            <div className="min-w-0">
              <h3 className="h-4 mb-1">Lodgement-ready</h3>
              <p className="text-small">
                We prepare the AFSS and support council or strata lodgement.
              </p>
            </div>
          </div>
        </RevealOnView>
      </section>

      {/* Section: From Schedule to Statement */}
      <section className="container-inner section-y">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
          <RevealOnView>
            <SectionHeading
              kicker="WHAT WE DO"
              title={
                <>
                  Our Fire Protection
                  <br />
                  <span className="text-[#fb5614]">Services</span>
                </>
              }
              body="Everything you need to keep your property protected, compliant, and ready."
            />
            <div className="flex flex-wrap gap-3">
              <Link href="/services" className="btn btn-secondary">
                How we work <ArrowUpRight size={16} strokeWidth={2.4} />
              </Link>
              <Link href="/free-quote" className="btn-link">
                Or request a quote
              </Link>
            </div>
          </RevealOnView>

          <RevealOnView>
            <div className="relative overflow-hidden rounded-2xl bg-[#faf9f7] shadow-card">
              <div className="absolute inset-0 bg-gradient-to-br from-[#fff7f3] via-transparent to-transparent" />
              <Image
                src="/schedule.svg"
                alt="Fire Safety Schedule document"
                width={1200}
                height={1500}
                className="relative h-auto w-full"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </RevealOnView>
        </div>
      </section>

      {/* Section: The 5-step process — large numbers, no boxed cards */}
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
            body="Five steps. One clear deliverable. Measure-by-measure against your Schedule."
          />

          <RevealOnView>
            <ol className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
              {processSteps.map((step) => (
                <li key={step.n} className="flex flex-col gap-3">
                  <span
                    className="font-mono text-[#d64114] text-[0.85rem] font-bold tracking-[0.18em]"
                    aria-hidden="true"
                  >
                    {step.n}
                  </span>
                  <h3 className="h-3">{step.title}</h3>
                  <p className="text-small">{step.body}</p>
                </li>
              ))}
            </ol>
          </RevealOnView>

          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Link href="/services" className="btn btn-primary btn-lg">
              See full services
            </Link>
            <Link href="/free-quote" className="btn-link">
              Start with a quote
            </Link>
          </div>
        </div>
      </section>

      {/* Section: 12 months — typography moment */}
      <section className="afss-section--dark">
        <div className="container-inner section-y">
          <RevealOnView>
            <div className="grid gap-8 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] sm:items-center">
              <div>
                <p className="h-eyebrow h-eyebrow--light">03 / The clock</p>
                <p
                  className="h-section--light text-[clamp(5rem,18vw,11rem)] leading-[0.88] font-extrabold tracking-[-0.04em] m-0"
                  style={{ color: "#ffffff" }}
                >
                  12
                  <br />
                  <span style={{ color: "#fb5614" }}>months.</span>
                </p>
              </div>
              <div>
                <h2 className="h-section text-white m-0">
                  Don&apos;t let your AFSS date sneak up.
                </h2>
                <p className="text-lead text-white/80 mt-6 max-w-prose">
                  AFSS renewals come around every twelve months. Building owners
                  who plan ahead avoid the late rush — and the council
                  correspondence. Send us your Schedule and we&apos;ll handle the
                  timing from there.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/free-quote" className="btn btn-primary btn-lg">
                    Send us your Schedule
                  </Link>
                </div>
              </div>
            </div>
          </RevealOnView>
        </div>
      </section>

      {/* Section: Building types — large photography, no tiny icon boxes */}
      <section className="container-inner section-y">
        <SectionHeading
          kicker="04 / Building types"
          title={
            <>
              Different buildings.
              <br />
              Same responsibility.
            </>
          }
          body="The AFSS framework applies to every building with a Fire Safety Schedule. The measures, the practitioners and the risk profile vary — the duty doesn't."
        />

        <RevealOnView>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {buildingTypes.map((b) => (
              <article key={b.label} className="afss-card">
                <div className="afss-card__media" style={{ aspectRatio: "4 / 5" }}>
                  <Image
                    src={b.image}
                    alt={`${b.label} building`}
                    fill
                    sizes="(max-width: 640px) 100vw, 25vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="afss-card__body">
                  <h3 className="afss-card__title">{b.label}</h3>
                  <p className="afss-card__text">{b.body}</p>
                </div>
              </article>
            ))}
          </div>
        </RevealOnView>
      </section>

      {/* Final CTA */}
      <CTASection
        kicker="Ready when you are"
        title="AFSS coming up?"
        body="Send us your Fire Safety Schedule and we'll take it from there. We respond within one business day."
        primaryCta={{ label: "Get a free quote", href: "/free-quote" }}
        secondaryCta={{ label: "Call 1300 765 594", href: "tel:1300765594" }}
      />
    </>
  );
}
