"use client";

/**
 * FreeSiteVisitMobileSticky — persistent slim CTA at the bottom of mobile.
 * ──────────────────────────────────────────────────────────────────────────
 * Only renders below the tablet breakpoint. The button is intentionally
 * slim and left-aligned so it does not collide with the Ask ALLFIRE
 * chatbot, which occupies the bottom-right corner.
 *
 * The CTA opens the same Free Site Visit modal as every other CTA on the
 * site — there is no separate mobile form.
 *
 * The strip is hidden when the modal is open so it never sits on top of
 * the modal scrim.
 */

import React, { useEffect, useState } from "react";

import FreeSiteVisitButton from "@/components/free-site-visit/FreeSiteVisitButton";
import { useFreeSiteVisitState } from "@/lib/free-site-visit/FreeSiteVisitStore";

export default function FreeSiteVisitMobileSticky() {
  const visit = useFreeSiteVisitState();
  const [visible, setVisible] = useState(false);

  // Reveal the bar after a short scroll so it doesn't compete with the
  // hero CTA on initial load. The "after a short scroll" rule is also
  // what the brief asked for: "subtle pulse only" + "easy thumb reach".
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof window.matchMedia === "function") {
      const mql = window.matchMedia("(min-width: 1025px)");
      if (mql.matches) {
        return;
      }
    }

    let mounted = true;
    let raf = 0;
    const onScroll = () => {
      if (!mounted) return;
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        if (!mounted) return;
        const w = window as Window & { __lenis?: { scroll?: number } };
        const y = w.__lenis?.scroll ?? window.scrollY;
        // Reveal once the visitor has scrolled past the hero (~70vh or 480px).
        const next = y > Math.min(window.innerHeight * 0.7, 480);
        setVisible((prev) => (prev === next ? prev : next));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      mounted = false;
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  // Hide everything when the modal is open — the modal is the entire
  // page's focus while it's open.
  if (visit.isOpen) return null;

  return (
    <>
      <style>{`
        .fsv-mobile-sticky {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 950;
          display: flex;
          justify-content: center;
          padding: 0.55rem 0.75rem calc(0.55rem + env(safe-area-inset-bottom, 0px));
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-top: 1px solid rgba(17, 17, 17, 0.08);
          box-shadow: 0 -10px 28px rgba(0, 0, 0, 0.08);
          transform: translateY(110%);
          opacity: 0;
          transition: transform 280ms cubic-bezier(0.16, 1, 0.3, 1), opacity 240ms ease;
          pointer-events: none;
        }
        .fsv-mobile-sticky.is-visible {
          transform: translateY(0);
          opacity: 1;
          pointer-events: auto;
        }
        /* Reserve space so the page content is not occluded by the bar. */
        body.has-fsv-mobile-sticky {
          padding-bottom: 76px;
        }
        @media (min-width: 1025px) {
          .fsv-mobile-sticky { display: none !important; }
          body.has-fsv-mobile-sticky { padding-bottom: 0 !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .fsv-mobile-sticky { transition: none; }
        }
      `}</style>
      <div
        className={`fsv-mobile-sticky ${visible ? "is-visible" : ""}`}
        aria-hidden={!visible}
      >
        <div style={{ width: "100%" }}>
          <FreeSiteVisitButton
            source="mobile_sticky"
            pulse
            style={{
              width: "100%",
              padding: "0.85rem 1rem",
              fontSize: "1rem",
              minHeight: 48,
              // Avoid double-stacked ripples with the header pill.
              boxShadow: "0 8px 18px rgba(255, 42, 0, 0.28)",
            }}
          />
        </div>
      </div>
    </>
  );
}
