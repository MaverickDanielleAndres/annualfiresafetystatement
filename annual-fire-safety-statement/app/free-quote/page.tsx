import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import RevealOnView from "@/components/RevealOnView";
import QuoteForm from "@/components/QuoteForm";
import { createPageMetadata } from "@/lib/site";


export const metadata: Metadata = createPageMetadata({
  title: "Free Quote — Tell Us About Your Building",
  description:
    "Request a free quote for your Annual Fire Safety Statement assessment. Send your Fire Safety Schedule, previous AFSS, or council correspondence and we'll get back to you within one business day.",
  path: "/free-quote",
  keywords: ["AFSS quote", "free quote AFSS", "NSW AFSS quote"],
});

export default function FreeQuotePage() {
  return (
    <>
      <PageHero
        eyebrow="Free quote"
        titleLines={["Tell us about", "your building."]}
        description="A short form, a clear scope. Send your Fire Safety Schedule, your previous AFSS, or any council correspondence — we'll come back to you within one business day."
        imageSrc="/hero-quote.svg"
        imageAlt="AFSS quote request — clipboard with form fields"
        imagePosition="center"
        primaryCta={{ label: "Call 1300 765 594", href: "tel:1300765594" }}
        secondaryCta={{ label: "View sample AFSS", href: "/sample" }}
      />

      <section className="container-inner section-y-tight">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16">
          {/* Left: what to expect */}
          <RevealOnView>
            <div className="flex flex-col gap-6">
              <div>
                <p className="h-eyebrow">What happens next</p>
                <h2 className="h-section--sm mt-3">
                  One business day.
                  <br />
                  No obligation.
                </h2>
              </div>

              <ol className="flex flex-col gap-5 mt-2">
                <li className="flex items-start gap-4">
                  <span className="font-mono text-[0.85rem] font-bold tracking-[0.18em] text-[#d64114] mt-1">
                    01
                  </span>
                  <div>
                    <h3 className="h-4 mb-1">We review</h3>
                    <p className="text-small">
                      Your building details and the Fire Safety Schedule you
                      share with us.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="font-mono text-[0.85rem] font-bold tracking-[0.18em] text-[#d64114] mt-1">
                    02
                  </span>
                  <div>
                    <h3 className="h-4 mb-1">We scope</h3>
                    <p className="text-small">
                      Which measures fall under which practitioner accreditations.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="font-mono text-[0.85rem] font-bold tracking-[0.18em] text-[#d64114] mt-1">
                    03
                  </span>
                  <div>
                    <h3 className="h-4 mb-1">We quote</h3>
                    <p className="text-small">
                      A clear, line-by-line quote. No surprises and no scope
                      creep.
                    </p>
                  </div>
                </li>
              </ol>

              <div className="rounded-xl border border-[#ececec] bg-[#faf9f7] p-5 mt-2">
                <p className="h-eyebrow mb-2">Already have these?</p>
                <ul className="flex flex-col gap-2">
                  <li className="text-small">Fire Safety Schedule</li>
                  <li className="text-small">Previous AFSS</li>
                  <li className="text-small">Council correspondence</li>
                  <li className="text-small">Service records (AS 1851-2012)</li>
                </ul>
                <p className="text-small text-[#777777] mt-3">
                  Attach them to the form and we&apos;ll review before we
                  respond.
                </p>
              </div>
            </div>
          </RevealOnView>

          {/* Right: form */}
          <RevealOnView>
            <div className="rounded-2xl border border-[#ececec] bg-white p-6 sm:p-8 shadow-card">
              <h2 className="h-3 mb-2">Request a quote</h2>
              <p className="text-body mb-6">
                Fields marked required are essential. Anything else is helpful.
              </p>
              <QuoteForm />
            </div>
          </RevealOnView>
        </div>
      </section>
    </>
  );
}
