"use client";

/**
 * FreeSiteVisitOffer — contextual banner for the Contact page.
 * ──────────────────────────────────────────────────────────────────────────
 * A small, in-page banner that sits above the contact form on /contact, on
 * the Our Story page, and on the Strata / Our Clients pages. It is
 * intentionally lighter than the SitewideCTA so we can embed it next to
 * other content without crowding.
 *
 * Re-uses the global FreeSiteVisitClientShell context so the same modal
 * opens whether the visitor clicks the header CTA, the hero button, or
 * this banner.
 */

import React from "react";
import Image from "next/image";

import FreeSiteVisitButton from "@/components/free-site-visit/FreeSiteVisitButton";
import { type FreeSiteVisitSource } from "@/lib/free-site-visit/analytics";

export interface FreeSiteVisitOfferProps {
  source: FreeSiteVisitSource;
  /** Service id (lib/services.ts) to pre-select. */
  service?: string;
  /** Optional custom heading. Defaults to the standard offer copy. */
  heading?: string;
  /** Optional supporting copy. Defaults to the standard offer copy. */
  copy?: string;
}

export default function FreeSiteVisitOffer({
  source,
  service,
  heading = "Peter will personally come to your property.",
  copy = "Book the Boss — a free site visit with Peter at your property.",
}: FreeSiteVisitOfferProps) {
  return (
    <section
      className="fsv-offer"
      aria-labelledby="fsv-offer-title"
      style={{
        margin: "0 0 clamp(2rem, 4vw, 3rem)",
      }}
    >
      <style>{`
        .fsv-offer-card {
          position: relative;
          display: grid;
          grid-template-columns: 110px minmax(0, 1fr);
          gap: clamp(1rem, 2.5vw, 1.5rem);
          align-items: center;
          padding: clamp(1rem, 2.5vw, 1.5rem);
          border-radius: 14px;
          background: linear-gradient(135deg, #fff7f2 0%, #fff 60%, #fff5ec 100%);
          border: 1px solid rgba(255, 87, 34, 0.18);
          box-shadow: 0 12px 30px rgba(17, 17, 17, 0.08);
          overflow: hidden;
        }
        .fsv-offer-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 0% 0%, rgba(255, 87, 34, 0.16), transparent 55%),
            radial-gradient(circle at 100% 100%, rgba(255, 183, 0, 0.12), transparent 50%);
          pointer-events: none;
        }
        .fsv-offer-portrait {
          position: relative;
          width: 110px;
          height: 110px;
          border-radius: 50%;
          overflow: hidden;
          border: 4px solid #ffffff;
          box-shadow: 0 6px 18px rgba(17, 17, 17, 0.2);
          flex-shrink: 0;
        }
        .fsv-offer-portrait img {
          object-fit: cover;
          object-position: center 20%;
        }
        .fsv-offer-content {
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
          min-width: 0;
        }
        .fsv-offer-eyebrow {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #d64012;
        }
        .fsv-offer-title {
          font-size: clamp(1.2rem, 2.4vw, 1.55rem);
          font-weight: 800;
          line-height: 1.15;
          margin: 0;
          color: #111111;
          letter-spacing: -0.01em;
        }
        .fsv-offer-copy {
          font-size: 0.95rem;
          line-height: 1.55;
          color: #1f1f1f;
          margin: 0;
        }
        .fsv-offer-cta {
          margin-top: 0.5rem;
        }

        @media (max-width: 600px) {
          .fsv-offer-card {
            grid-template-columns: 80px minmax(0, 1fr);
            gap: 0.85rem;
          }
          .fsv-offer-portrait {
            width: 80px;
            height: 80px;
          }
        }
      `}</style>
      <div className="fsv-offer-card">
        <div className="fsv-offer-portrait" aria-hidden="true">
          <Image
            src="/Peter - Managing Director.jpg"
            alt=""
            fill
            sizes="120px"
          />
        </div>
        <div className="fsv-offer-content">
          <p className="fsv-offer-eyebrow">Free Site Visit</p>
          <h2 id="fsv-offer-title" className="fsv-offer-title">
            {heading}
          </h2>
          {copy ? <p className="fsv-offer-copy">{copy}</p> : null}
          <div className="fsv-offer-cta">
            <FreeSiteVisitButton
              source={source}
              service={service}
              variant="compact"
              pulse
              label="Book the Boss"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
