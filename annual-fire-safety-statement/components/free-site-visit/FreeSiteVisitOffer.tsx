"use client";

/**
 * FreeSiteVisitOffer — contextual AFSS banner for the Contact page.
 * ──────────────────────────────────────────────────────────────────────────
 * A small, in-page banner that sits above the contact form on /contact,
 * /free-quote, etc. Independent AFSS branding — no individual person,
 * no parent-brand cross-promotion.
 */

import React from "react";
import { ShieldCheck } from "lucide-react";

import FreeSiteVisitButton from "@/components/free-site-visit/FreeSiteVisitButton";
import { type FreeSiteVisitSource } from "@/lib/free-site-visit/analytics";

export interface FreeSiteVisitOfferProps {
  source: FreeSiteVisitSource;
  service?: string;
  heading?: string;
  copy?: string;
}

export default function FreeSiteVisitOffer({
  source,
  service,
  heading = "Get your AFSS quote organised.",
  copy = "From your Fire Safety Schedule to a lodged statement — handled by accredited practitioners.",
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
          grid-template-columns: 64px minmax(0, 1fr);
          gap: clamp(1rem, 2.5vw, 1.5rem);
          align-items: center;
          padding: clamp(1rem, 2.5vw, 1.5rem);
          border-radius: 14px;
          background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 60%, #e7eef9 100%);
          border: 1px solid rgba(28, 77, 156, 0.18);
          box-shadow: 0 12px 30px rgba(11, 29, 54, 0.08);
          overflow: hidden;
        }
        .fsv-offer-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 0% 0%, rgba(28, 77, 156, 0.10), transparent 55%),
            radial-gradient(circle at 100% 100%, rgba(11, 29, 54, 0.06), transparent 50%);
          pointer-events: none;
        }
        .fsv-offer-badge {
          position: relative;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #0b1d36;
          color: #ffffff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 6px 18px rgba(11, 29, 54, 0.18);
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
          color: #1c4d9c;
        }
        .fsv-offer-title {
          font-size: clamp(1.2rem, 2.4vw, 1.55rem);
          font-weight: 800;
          line-height: 1.15;
          margin: 0;
          color: #0b1d36;
          letter-spacing: -0.01em;
        }
        .fsv-offer-copy {
          font-size: 0.95rem;
          line-height: 1.55;
          color: #3a4a63;
          margin: 0;
        }
        .fsv-offer-cta {
          margin-top: 0.5rem;
        }
      `}</style>
      <div className="fsv-offer-card">
        <div className="fsv-offer-badge" aria-hidden="true">
          <ShieldCheck size={26} strokeWidth={1.6} />
        </div>
        <div className="fsv-offer-content">
          <p className="fsv-offer-eyebrow">Annual Fire Safety Statement</p>
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
              label="Get my AFSS quote"
            />
          </div>
        </div>
      </div>
    </section>
  );
}