"use client";

/**
 * FreeSiteVisitTrustStrip — compact Peter trust strip.
 * ──────────────────────────────────────────────────────────────────────────
 * A slim, premium transition between the hero and the rest of the page
 * that answers the implicit "Why is the Free Site Visit different?" with
 * a real photo of Peter, his name, his role, and a one-line promise:
 * "Personally attends every Free Site Visit."
 *
 * The strip is intentionally small — it's a transition, not a new section.
 */

import React from "react";
import Image from "next/image";

export default function FreeSiteVisitTrustStrip() {
  return (
    <section
      aria-label="Why the Free Site Visit is personal"
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
        .fsv-trust-strip-portrait {
          position: relative;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid #ffffff;
          box-shadow: 0 4px 12px rgba(17, 17, 17, 0.15);
          flex: 0 0 auto;
          background: #f1f1f1;
        }
        .fsv-trust-strip-portrait img {
          object-fit: cover;
          object-position: center 20%;
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
          color: #111111;
          line-height: 1.2;
          margin: 0;
        }
        .fsv-trust-strip-role {
          font-size: 0.78rem;
          color: #5b5b5b;
          line-height: 1.3;
          margin: 0;
        }
        .fsv-trust-strip-promise {
          margin: 0;
          font-size: clamp(0.85rem, 1.2vw, 0.95rem);
          color: #1f1f1f;
          font-weight: 600;
          line-height: 1.4;
          flex: 1 1 auto;
          text-align: left;
        }
        .fsv-trust-strip-promise strong {
          color: #d64012;
          font-weight: 800;
        }
        @media (max-width: 540px) {
          .fsv-trust-strip-promise {
            flex-basis: 100%;
          }
        }
      `}</style>
      <div className="fsv-trust-strip-inner">
        <div className="fsv-trust-strip-portrait" aria-hidden="true">
          <Image
            src="/peter-managing-director.jpg"
            alt=""
            fill
            sizes="56px"
          />
        </div>
        <div className="fsv-trust-strip-text">
          <p className="fsv-trust-strip-name">Peter Tricklebank</p>
          <p className="fsv-trust-strip-role">Managing Director</p>
        </div>
        <p className="fsv-trust-strip-promise">
          <strong>Personally attends every Free Site Visit.</strong>
        </p>
      </div>
    </section>
  );
}
