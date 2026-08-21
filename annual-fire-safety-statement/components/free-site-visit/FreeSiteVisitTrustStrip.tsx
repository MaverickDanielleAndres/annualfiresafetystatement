"use client";

/**
 * FreeSiteVisitTrustStrip — slim AFSS trust strip.
 * ──────────────────────────────────────────────────────────────────────────
 * A slim transition between sections that re-affirms the AFSS promise
 * without naming any individual person. Used only by internal pages
 * (contact, etc.); the homepage has its own FinalCTA.
 */

import React from "react";
import { ShieldCheck } from "lucide-react";

export default function FreeSiteVisitTrustStrip() {
  return (
    <section
      aria-label="Why an AFSS specialist"
      className="fsv-trust-strip"
      style={{
        background: "#ffffff",
        padding: "clamp(1rem, 2.5vw, 1.5rem) clamp(1rem, 4vw, 2rem)",
        borderTop: "1px solid rgba(17,17,17,0.06)",
        borderBottom: "1px solid rgba(17,17,17,0.06)",
        position: "relative",
        zIndex: 5,
      }}
    >
      <style>{`
        .fsv-trust-strip-inner {
          display: flex;
          align-items: center;
          gap: clamp(0.75rem, 2vw, 1.1rem);
          max-width: 64rem;
          margin: 0 auto;
          flex-wrap: wrap;
        }
        .fsv-trust-strip-badge {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #0b1d36;
          color: #ffffff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          border: 3px solid #ffffff;
          box-shadow: 0 4px 12px rgba(11, 29, 54, 0.18);
        }
        .fsv-trust-strip-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .fsv-trust-strip-name {
          font-size: clamp(0.95rem, 1.4vw, 1.05rem);
          font-weight: 800;
          color: #0b1d36;
          line-height: 1.2;
          margin: 0;
        }
        .fsv-trust-strip-role {
          font-size: 0.78rem;
          color: #5b6a82;
          line-height: 1.3;
          margin: 0;
        }
        .fsv-trust-strip-promise {
          margin: 0;
          font-size: clamp(0.85rem, 1.2vw, 0.95rem);
          color: #0b1d36;
          font-weight: 600;
          line-height: 1.4;
          flex: 1 1 auto;
          text-align: left;
        }
        .fsv-trust-strip-promise strong {
          color: #1c4d9c;
          font-weight: 800;
        }
        @media (max-width: 540px) {
          .fsv-trust-strip-promise {
            flex-basis: 100%;
          }
        }
      `}</style>
      <div className="fsv-trust-strip-inner">
        <div className="fsv-trust-strip-badge" aria-hidden="true">
          <ShieldCheck size={20} strokeWidth={1.8} />
        </div>
        <div className="fsv-trust-strip-text">
          <p className="fsv-trust-strip-name">NSW Accredited Practitioners</p>
          <p className="fsv-trust-strip-role">Independent AFSS specialists</p>
        </div>
        <p className="fsv-trust-strip-promise">
          <strong>Schedule-led assessments across Greater Sydney &amp; NSW.</strong>
        </p>
      </div>
    </section>
  );
}