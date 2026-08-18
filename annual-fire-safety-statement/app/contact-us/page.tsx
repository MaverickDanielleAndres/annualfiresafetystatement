import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import ContactCTA from "@/components/ContactCTA";
import RevealOnView from "@/components/RevealOnView";
import ContactForm from "@/components/ContactForm";
import { createPageMetadata, SITE_PHONE, SITE_EMAIL } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Contact — Talk Fire Safety with a Human",
  description:
    "Talk fire safety with a human. Call 1300 765 594, send a message, or request a quote. We respond within one business day.",
  path: "/contact-us",
  keywords: ["AFSS contact", "fire safety contact NSW"],
});

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        titleLines={["Talk fire safety", "with a human."]}
        description="No call centre, no chatbot. A real specialist who knows what an AFSS actually requires. Phone, email, or a request — we respond within one business day."
        imageSrc="/hero-contact.svg"
        imageAlt="Phone showing AFSS contact number"
        imagePosition="center"
        primaryCta={{ label: "Call 1300 765 594", href: "tel:1300765594" }}
        secondaryCta={{ label: "Request a quote", href: "/free-quote" }}
      />

      <section className="container-inner section-y-tight">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-16">
          {/* Left: contact details */}
          <RevealOnView>
            <div className="flex flex-col gap-8">
              <div>
                <p className="h-eyebrow">Phone</p>
                <a
                  href="tel:1300765594"
                  className="block mt-2 text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold tracking-[-0.02em] text-[#111111] hover:text-[#fb5614] transition-colors"
                >
                  {SITE_PHONE}
                </a>
                <p className="text-small mt-2">
                  Mon-Fri: 7:00am to 6:30pm. After hours: same number.
                </p>
              </div>

              <div>
                <p className="h-eyebrow">Email</p>
                <a
                  href={`mailto:${SITE_EMAIL}`}
                  className="block mt-2 text-[clamp(1.1rem,1.8vw,1.3rem)] font-bold text-[#111111] hover:text-[#fb5614] transition-colors"
                >
                  {SITE_EMAIL}
                </a>
                <p className="text-small mt-2">
                  We respond within one business day.
                </p>
              </div>

              <div>
                <p className="h-eyebrow">Service area</p>
                <p className="mt-2 text-large font-semibold text-[#111111]">
                  Greater Sydney &amp; NSW
                </p>
                <p className="text-small mt-2">
                  Strata, commercial and industrial buildings with a Fire
                  Safety Schedule.
                </p>
              </div>
            </div>
          </RevealOnView>

          {/* Right: form */}
          <RevealOnView>
            <div className="rounded-2xl border border-[#ececec] bg-white p-6 sm:p-8 shadow-card">
              <h2 className="h-3 mb-2">Send a message</h2>
              <p className="text-body mb-6">
                Tell us a little about your building and your AFSS timing.
                We&apos;ll get back to you within one business day.
              </p>
              <ContactForm />
            </div>
          </RevealOnView>
        </div>
      </section>

      <ContactCTA />
    </>
  );
}
