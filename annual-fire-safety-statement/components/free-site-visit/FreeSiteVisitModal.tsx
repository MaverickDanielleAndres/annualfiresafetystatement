"use client";

/**
 * FreeSiteVisitModal — the single, reusable Free Site Visit modal.
 * ──────────────────────────────────────────────────────────────────────────
 * One modal implementation for every CTA on the site. Uses the existing
 * createPortal + body-scroll-lock pattern that's already used elsewhere
 * on the site (see components/ui/LightboxImage.tsx).
 *
 * Layout (matches the supplied CTA reference):
 *   • Desktop — split layout. Left: full-height Peter portrait with a
 *     dark overlay, the eyebrow + headline + supporting copy overlaid on
 *     the upper portion, and the Peter badge at the bottom. Right:
 *     form block with all required fields.
 *   • Tablet  (≤ 1024px) — single column. Peter image becomes a slim
 *     banner at the top, form fills the rest of the modal.
 *   • Mobile  (< 768px) — single column. Compact banner at the top,
 *     form below, modal fits viewport with calc(100% - 24px) width and
 *     scrolls internally on overflow.
 *
 * Accessibility:
 *   • role="dialog" + aria-modal="true"
 *   • ESC closes the modal
 *   • Focus trap inside the modal while open
 *   • First interactive element (close button) is focused on open
 *   • Focus returns to the trigger element that opened it on close
 *   • Background body scroll is locked (Lenis-aware)
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, Check } from "lucide-react";

import {
  useFreeSiteVisitState,
  closeFreeSiteVisit,
} from "@/lib/free-site-visit/FreeSiteVisitStore";
import FreeSiteVisitForm from "@/components/free-site-visit/FreeSiteVisitForm";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function FreeSiteVisitModal() {
  const visit = useFreeSiteVisitState();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  const close = useCallback(() => closeFreeSiteVisit(), []);

  // Lock body scroll while the modal is open. We use the iOS-safe
  // `position: fixed; top: -scrollY` pattern instead of `overflow:
// hidden` — Safari on iOS refuses to scroll child overflow containers
  // (even with `touch-action: pan-y`) when an ancestor has
  // `overflow: hidden`, which is the most common reason a modal "can't
  // be swiped" on a phone. Freezing the body in place with
  // `position: fixed` still prevents the background from scrolling
  // while leaving all child scroll surfaces free.
  useEffect(() => {
    if (!visit.isOpen) return;
    if (typeof document === "undefined") return;
    const body = document.body;
    const scrollY = window.scrollY;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    // NOTE: deliberately NOT setting `overflow: hidden` here.
    // Safari on iOS refuses to scroll any descendant overflow container
    // — even with `touch-action: pan-y` — whenever an ancestor has
    // `overflow: hidden`, which is the most common reason a modal
    // "can't be swiped" on a phone. Freezing the body in place with
    // `position: fixed` already prevents the background from scrolling,
    // so we keep overflow free for the modal itself.
    // Stop any active smooth-scroll instance from competing.
    try {
      const w = window as Window & { __lenis?: { stop?: () => void; start?: () => void } };
      w.__lenis?.stop?.();
    } catch {
      /* ignored */
    }
    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.width = prev.width;
      body.style.overflow = prev.overflow;
      // Restore the page to wherever the visitor was before the modal
      // opened — otherwise the body would jump to the top on close.
      const restoreY =
        typeof prev.top === "string" && prev.top.startsWith("-")
          ? parseInt(prev.top, 10) * -1
          : scrollY;
      window.scrollTo(0, Number.isFinite(restoreY) ? restoreY : 0);
      try {
        const w = window as Window & { __lenis?: { start?: () => void } };
        w.__lenis?.start?.();
      } catch {
        /* ignored */
      }
    };
  }, [visit.isOpen]);

  // Track the element that had focus before the modal opened so we can
  // restore it on close.
  useEffect(() => {
    if (!visit.isOpen) return;
    lastFocusedRef.current = (document.activeElement as HTMLElement) ?? null;
    const t = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(t);
  }, [visit.isOpen]);

  // Restore focus to the trigger element on close.
  useEffect(() => {
    if (visit.isOpen) return;
    if (!lastFocusedRef.current) return;
    const stillThere = document.body.contains(lastFocusedRef.current);
    if (stillThere) {
      try {
        lastFocusedRef.current.focus({ preventScroll: true });
      } catch {
        /* ignored */
      }
    }
    lastFocusedRef.current = null;
  }, [visit.isOpen]);

  // Keyboard handling: ESC closes, Tab is trapped inside the dialog.
  useEffect(() => {
    if (!visit.isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const root = dialogRef.current;
      if (!root) return;
      const focusables = Array.from(
        root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => !el.hasAttribute("aria-hidden"));
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (event.shiftKey) {
        if (active === first || !root.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else {
        if (active === last || !root.contains(active)) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [visit.isOpen, close]);

  // No scale-to-fit. The CSS handles layout via `max-height: 100dvh`
  // and internal scrolling. The previous `transform: scale()` loop
  // caused visible jitter on small laptop screens because the
  // `ResizeObserver` refired on every scroll/size tick and the
  // scaled element kept re-measuring.
  // (Code removed in favour of pure-CSS sizing.)

  const handleBackdrop = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        close();
      }
    },
    [close],
  );

  if (!visit.isOpen) return null;
  if (typeof document === "undefined") return null;

  const modal = (
    <div
      className="fsv-modal-root"
      onClick={handleBackdrop}
      role="presentation"
      data-lenis-prevent="true"
      style={{
        position: "fixed",
        inset: 0,
        // Modal layering — must sit above the chat widget (zIndex 9999),
        // the page header, floating buttons, social icons, and any other
        // fixed element on the site. 2147483000 is the safe maximum.
        zIndex: 2147483000,
        background: "rgba(8, 8, 10, 0.78)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "clamp(0.5rem, 2vw, 1.5rem)",
        overflowX: "hidden",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        // Tell the browser this container is the vertical pan zone —
        // combined with the iOS-safe body lock above, this is what lets
        // touch scrolling work inside the modal on a phone.
        touchAction: "pan-y",
        overscrollBehavior: "contain",
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="fsv-modal-title"
        aria-describedby="fsv-modal-subtitle"
        className="fsv-modal-card"
        data-lenis-prevent="true"
        style={{
          background: "#ffffff",
          borderRadius: 16,
          boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
          maxWidth: 880,
          width: "100%",
          margin: "0 auto",
          position: "relative",
          flexShrink: 0,
        }}
      >
        <style>{`
          .fsv-modal-root {
            animation: fsv-fade-in 220ms ease-out;
          }
          @keyframes fsv-fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .fsv-modal-root::before,
          .fsv-modal-root::after {
            content: "";
            margin: auto;
          }
          .fsv-modal-card {
            display: grid;
            grid-template-columns: minmax(0, 0.78fr) minmax(0, 1.22fr);
            animation: fsv-card-in 320ms cubic-bezier(0.16, 1, 0.3, 1);
            /* Cap the card to the viewport on every screen — short laptop
               screens included — and let the form column scroll its own
               contents. The portrait column stays fixed-height so it can't
               push the whole card off-screen. */
            max-height: calc(100dvh - clamp(1rem, 4vw, 3rem));
            min-height: 0;
          }
          .fsv-modal-portrait {
            border-top-left-radius: 16px;
            border-bottom-left-radius: 16px;
            min-height: 0;
          }
          .fsv-modal-form-wrap {
            min-height: 0;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }

          /* Shorter desktop screens (e.g. 13" laptops at 768–900px tall)
             further tighten the portrait column and let the form column
             take the majority of the width so the form fields stay
             readable without resizing. */
          @media (max-height: 820px) and (min-width: 1025px) {
            .fsv-modal-card {
              grid-template-columns: minmax(0, 0.65fr) minmax(0, 1.35fr) !important;
            }
            .fsv-modal-portrait {
              min-height: 360px !important;
            }
            .fsv-modal-form-wrap {
              padding: 1.1rem 1.4rem 0.85rem !important;
              gap: 0.3rem !important;
            }
            .fsv-banner-eyebrow { font-size: 0.6rem !important; letter-spacing: 0.2em !important; margin-bottom: 0.5rem !important; }
            .fsv-banner-headline { font-size: 2.1rem !important; }
            .fsv-banner-subhead { font-size: 1.05rem !important; }
            .fsv-banner-body { font-size: 0.78rem !important; }
          }
          @keyframes fsv-card-in {
            from { opacity: 0; transform: translateY(20px) scale(0.97); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @media (prefers-reduced-motion: reduce) {
            .fsv-modal-root, .fsv-modal-card { animation: none !important; }
          }

          /* Close button — always on top of the modal content and never
             overlapping form fields. */
          .fsv-close {
            position: absolute;
            top: 12px;
            right: 12px;
            z-index: 50;
          }

          /* ── Tablet & mobile (≤ 1024px) ───────────────────────────────
             Stack the portrait banner above the form. On these screens
             the card itself becomes the scroll container so the
             visitor can always reach the Book the Boss submit button
             via swipe, regardless of viewport height — there is no
             dependence on backdrop scroll, which can stall on iOS. */
          @media (max-width: 1024px) {
            .fsv-modal-card {
              display: flex !important;
              flex-direction: column !important;
              grid-template-columns: unset !important;
              max-width: min(720px, 92vw) !important;
              width: 100% !important;
              max-height: calc(100dvh - 24px) !important;
              overflow-y: auto !important;
              -webkit-overflow-scrolling: touch !important;
            }
            .fsv-modal-portrait {
              width: 100% !important;
              min-height: 340px !important;
              height: 340px !important;
              max-height: 340px !important;
              flex: 0 0 auto !important;
              border-top-left-radius: 16px !important;
              border-top-right-radius: 16px !important;
              border-bottom-left-radius: 0 !important;
            }
            .fsv-modal-form-wrap {
              width: 100% !important;
              min-width: 0 !important;
              padding: 1.1rem 1.4rem 1.1rem !important;
              flex: 0 0 auto !important;
              min-height: auto !important;
              overflow: visible !important;
            }
            .fsv-close {
              top: 10px;
              right: 10px;
            }
          }

          /* ── Mobile (< 768px) ──────────────────────────────────────────
             Single column, banner on top, form below. The card itself
             is the scroll container with a max-height tied to the
             viewport so the Book the Boss button is always reachable
             via swipe, regardless of viewport height. The "THE BOSS"
             identity block is hidden here so it never overlaps the
             banner copy or eats vertical space. */
          @media (max-width: 767px) {
            .fsv-modal-root {
              padding: 12px !important;
            }
            .fsv-modal-card {
              display: flex !important;
              flex-direction: column !important;
              grid-template-columns: unset !important;
              width: 100% !important;
              max-width: 100% !important;
              max-height: calc(100dvh - 24px) !important;
              overflow-y: auto !important;
              -webkit-overflow-scrolling: touch !important;
              border-radius: 14px !important;
            }
            .fsv-modal-portrait {
              width: 100% !important;
              min-height: 280px !important;
              height: 280px !important;
              max-height: 280px !important;
              flex: 0 0 auto !important;
              border-top-left-radius: 14px !important;
              border-top-right-radius: 14px !important;
              border-bottom-left-radius: 0 !important;
            }
            .fsv-banner-identity {
              /* Hide "THE BOSS" + "Personally attends every site
                 visit." on phones — the visitor's eye is already on
                 the BOOK THE BOSS headline above the form. */
              display: none !important;
            }
            .fsv-modal-form-wrap {
              width: 100% !important;
              min-width: 0 !important;
              padding: 0.9rem 1rem 0.85rem !important;
              gap: 0.45rem !important;
              flex: 0 0 auto !important;
              min-height: auto !important;
              overflow: visible !important;
            }
            .fsv-close {
              width: 40px !important;
              height: 40px !important;
              top: 8px;
              right: 8px;
              background: rgba(255,255,255,0.98) !important;
              box-shadow: 0 4px 14px rgba(0,0,0,0.22) !important;
            }
          }

          /* Very narrow phones (≤ 380px) — only tighten the banner copy
             so long headlines wrap cleanly. Everything else stays at its
             designed size. */
          @media (max-width: 380px) {
            .fsv-modal-portrait {
              min-height: 240px !important;
              height: 240px !important;
              max-height: 240px !important;
              flex: 0 0 240px !important;
            }
            .fsv-banner-eyebrow { font-size: 0.62rem !important; letter-spacing: 0.18em !important; }
            .fsv-banner-headline { font-size: 2.1rem !important; }
            .fsv-banner-subhead { font-size: 0.95rem !important; }
            .fsv-banner-body { font-size: 0.7rem !important; }
          }

          .fsv-boss-gradient {
            background: linear-gradient(to right, #ff2a00, #ffb700);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            color: transparent;
            display: inline-block;
          }
        `}</style>

        {/* Left — Peter portrait with text overlay on the dark image.
            On tablet/mobile this becomes the top banner. */}
        <div
          aria-hidden="true"
          className="fsv-modal-portrait"
          style={{
            position: "relative",
            minHeight: 360,
            background: "#1a1a1a",
            overflow: "hidden",
          }}
        >
          <Image
            src="/Peter - Managing Director.jpg"
            alt="Peter, the Boss of All Fire Services"
            fill
            sizes="(max-width: 767px) 100vw, (max-width: 1024px) 100vw, 360px"
            style={{ objectFit: "cover", objectPosition: "center 35%" }}
            priority
          />
          {/* Dark overlay across the upper portion so the eyebrow,
             headline, and supporting copy read cleanly against any frame
             of the photo. The overlay fades to transparent at the bottom
             so the badge and Peter himself remain naturally lit. */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "75%",
              background:
                "linear-gradient(180deg, rgba(8,8,10,0.85) 0%, rgba(8,8,10,0.7) 45%, rgba(8,8,10,0.1) 92%, rgba(8,8,10,0) 100%)",
            }}
          />

          {/* Copy overlaid on the dark image — simplified hierarchy. */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              padding: "1.3rem 1.4rem 1.2rem",
              zIndex: 2,
              maxWidth: "100%",
            }}
          >
            <p
              className="fsv-banner-eyebrow"
              style={{
                margin: "0 0 0.7rem 0",
                fontSize: "0.7rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: "#ffb700",
              }}
            >
              Free Site Visit
            </p>
            <h2
              aria-hidden="true"
              className="fsv-banner-headline"
              style={{
                margin: 0,
                fontSize: "clamp(2.1rem, 5.6vw, 3.1rem)",
                fontFamily: "Impact, 'Oswald', 'Arial Narrow Bold', sans-serif",
                fontWeight: 900,
                lineHeight: 0.9,
                textTransform: "uppercase",
                color: "#ffffff",
                letterSpacing: "0.01em",
                whiteSpace: "nowrap",
                transform: "scaleY(1.1)",
                transformOrigin: "left bottom",
              }}
            >
              Book the <span className="fsv-boss-gradient">Boss</span>
            </h2>
            <h2
              id="fsv-modal-title"
              className="fsv-banner-subhead"
              style={{
                margin: "0.35rem 0 0",
                fontSize: "clamp(1.1rem, 2.2vw, 1.4rem)",
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: "-0.01em",
                maxWidth: "20ch",
              }}
            >
              <span style={{ color: "#ffffff" }}>Peter will personally</span><br />
              <span className="fsv-boss-gradient">
                come to your property.
              </span>
            </h2>
          </div>

          {/* Identity block (bottom-left) — simplified to just "THE BOSS"
              as the visual anchor with the "personally attends" trust
              line below it. No more "Peter Tricklebank" badge.
              Hidden on mobile (< 768px) so the banner stays compact and
              the form gets more vertical room above its submit button. */}
          <div
            className="fsv-banner-identity"
            style={{
              position: "absolute",
              left: 16,
              right: 16,
              bottom: 18,
              color: "#ffffff",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              zIndex: 2,
            }}
          >
            <p
              style={{
                margin: 0,
                fontWeight: 900,
                fontSize: "clamp(1.5rem, 2.2vw, 1.95rem)",
                lineHeight: 0.95,
                color: "#ffffff",
                fontFamily:
                  "Impact, 'Oswald', 'Arial Narrow Bold', sans-serif",
                textTransform: "uppercase",
                letterSpacing: "0.02em",
                textShadow: "0 2px 8px rgba(0,0,0,0.6)",
              }}
            >
              The Boss
            </p>
            <p
              id="fsv-modal-subtitle"
              style={{
                margin: 0,
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "#ffffff",
                lineHeight: 1.4,
                textShadow: "0 1px 3px rgba(0,0,0,0.55)",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#ea580c",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
                  flexShrink: 0,
                }}
              >
                <Check
                  size={12}
                  color="#ffffff"
                  strokeWidth={3}
                  aria-hidden="true"
                />
              </span>
              Personally attends every site visit.
            </p>
          </div>
        </div>

        {/* Right — form block. No internal scroll — the entire modal
           fits in the viewport on a typical desktop. */}
        <div
          className="fsv-modal-form-wrap"
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "2.2rem 1.5rem 0.85rem",
            gap: "0.4rem",
            position: "relative",
            minHeight: 0,
          }}
        >


          <FreeSiteVisitForm
            source={visit.source}
            preselectedService={visit.preselectedService}
          />
        </div>

        {/* Close button — sibling of the banner + form so it can stay
            fixed in the top-right of the dialog regardless of which
            column it is in. */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={() => close()}
          aria-label="Close Free Site Visit dialog"
          className="fsv-close"
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            border: "none",
            background: "rgba(255,255,255,0.96)",
            color: "#111111",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
          }}
        >
          <X size={18} strokeWidth={2.4} aria-hidden="true" />
        </button>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
