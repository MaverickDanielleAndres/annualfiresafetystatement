// Import the styles specific to this component so they ship in the
// SitewideCTA's chunk, not the global stylesheet.
import "../app/sitewide-cta.css";

/**
 * SitewideCTA — "Book the Boss" offer card.
 * ─────────────────────────────────────────────────────────────────────────
 * The persistent, sitewide CTA hero card. Simplified for Phase 1 of the
 * latest client changes — the homepage global CTA now reads:
 *
 *   FREE SITE VISIT   ← eyebrow / supporting context
 *   BOOK THE BOSS     ← primary action
 *   Peter will personally come to your property.
 *   [ Book the Boss → ]   ← primary button
 *
 * Composition (top → bottom):
 *   • All Fire Services + FPA Australia Bronze Member wordmarks, with a
 *     hairline divider between them, anchored top-left.
 *   • "Free Site Visit" eyebrow in brand orange.
 *   • Two-line heading — "Peter will personally" then the payoff
 *     "come to your property." wrapped in the signature gradient.
 *   • Orange primary CTA "Book the Boss →" (with header-style breathing
 *     pulse) + black "Call 1300 765 594".
 *
 * Right-hand region is the Peter portrait, blended into the card surface
 * via a CSS mask-image gradient so there is no visible seam — no gradient
 * line to read, no overlay colour to match, just one continuous warm
 * surface with Peter in it.
 *
 * Design tokens come from `BRANDING_AND_LAYOUT_PRINCIPLES.md` §3, §4,
 * §7 and §8. The rectangular CTA shape and the half-card cover image
 * are intentional local exceptions — they are not promoted into any
 * global rule and remain scoped to this CTA card.
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
      {/* Styles extracted to app/sitewide-cta.css so they ship in the prerendered HTML. */}

      <div className="pre-faq-cta-card">
        <div className="pre-faq-cta-content">
          <div className="pre-faq-cta-logos" aria-label="All Fire Services credentials">
            <div className="pre-faq-cta-logo-block">
              <Image
                className="pre-faq-cta-logo"
                src="/logo.png"
                alt="All Fire Services Sydney — Protecting People, Protecting Property"
                width={527}
                height={257}
                sizes="(max-width: 640px) 11rem, 15rem"
              />
              <span className="pre-faq-cta-logo-divider" aria-hidden="true" />
              <Image
                className="pre-faq-cta-logo"
                src="/secondlogo.png"
                alt="FPA Australia Bronze Member — Fire Protection Association Australia"
                width={302}
                height={144}
                sizes="(max-width: 640px) 9rem, 12rem"
              />
            </div>
          </div>

          <p className="pre-faq-cta-eyebrow">Free Site Visit</p>

          <h2 className="pre-faq-cta-title" id="sitewide-cta-title">
            Peter will personally<br />
            <span className="pre-faq-cta-title-line-2">come to your property.</span>
          </h2>

          <div className="pre-faq-cta-actions">
            <FreeSiteVisitButton
              source="sitewide"
              className="pre-faq-cta-button is-primary animate-pump"
              label="GET AN INSTANT QUOTE"
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
                borderRadius: "0.55rem",
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

        {/* Right region — half-card cover image of Peter (Managing
            Director). Decorative; the heading names Peter for screen
            readers. */}
        <div className="pre-faq-cta-art" aria-hidden="true">
          <Image
            className="pre-faq-cta-portrait"
            src="/peterforcta.jpg"
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
