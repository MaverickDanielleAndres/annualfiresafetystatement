// Import the styles specific to this component so they ship in the
// SitewideCTA's chunk, not the global stylesheet.
import "../app/sitewide-cta.css";

/**
 * SitewideCTA — sitewide AFSS offer card.
 * ──────────────────────────────────────────────────────────────────────────
 * The persistent, sitewide CTA hero card. Independent specialist
 * identity — no parent-brand cross-promotion, no "Book the Boss", no
 * individual person.
 *
 * Composition:
 *   • AFSS wordmark, anchored top-left.
 *   • "Annual Fire Safety Statement" eyebrow in brand blue.
 *   • Two-line heading — "From your Fire" then the payoff "Safety
 *     Schedule." wrapped in the signature navy/blue gradient.
 *   • Primary CTA "Get my AFSS quote" + secondary "Call 1300 765 594".
 *
 * Right region is the NSW AFSS document sample, blended into the navy
 * card surface via a CSS mask-image gradient so there is no visible
 * seam — no gradient line to read, no overlay colour to match, just one
 * continuous navy surface with the document in it.
 *
 * Not used on the homepage (the homepage uses components/home/Hero.tsx
 * and components/home/FinalCTA.tsx instead).
 */

import Image from "next/image";
import FreeSiteVisitButton from "@/components/free-site-visit/FreeSiteVisitButton";

export default function SitewideCTA() {
  return (
    <section
      className="pre-faq-cta"
      aria-labelledby="sitewide-cta-title"
      style={{
        marginBottom: 0,
        marginTop: 0,
      }}
    >
      <div className="pre-faq-cta-card">
        <div className="pre-faq-cta-content">
          <div className="pre-faq-cta-logos" aria-label="Annual Fire Safety Statement credentials">
            <div className="pre-faq-cta-logo-block">
              <Image
                className="pre-faq-cta-logo"
                src="/logo.png"
                alt="Annual Fire Safety Statement — Sydney NSW"
                width={527}
                height={257}
                sizes="(max-width: 640px) 11rem, 15rem"
              />
            </div>
          </div>

          <p className="pre-faq-cta-eyebrow">Annual Fire Safety Statement</p>

          <h2 className="pre-faq-cta-title" id="sitewide-cta-title">
            From your Fire<br />
            <span className="pre-faq-cta-title-line-2">Safety Schedule.</span>
          </h2>

          <div className="pre-faq-cta-actions">
            <FreeSiteVisitButton
              source="sitewide"
              className="pre-faq-cta-button is-primary animate-pump"
              label="GET MY AFSS QUOTE"
              trailingIcon={
                <svg
                  className="fsv-btn__arrow"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="13 6 19 12 13 18" />
                </svg>
              }
              style={{
                borderRadius: 999,
                padding: "0.85rem 1.5rem",
                minHeight: "2.95rem",
                fontSize: "0.95rem",
                letterSpacing: "0.06em",
                fontWeight: 800,
              }}
            />
            <a className="pre-faq-cta-button is-secondary" href="tel:1300765594">
              Call 1300 765 594
            </a>
          </div>
        </div>

        {/* Right region — half-card cover with the NSW AFSS document */}
        <div className="pre-faq-cta-art" aria-hidden="true">
          <Image
            className="pre-faq-cta-portrait"
            src="/sampleafss-nobg.png"
            alt=""
            width={2048}
            height={1536}
            sizes="(min-width: 900px) 35vw, 0px"
          />
        </div>
      </div>
    </section>
  );
}