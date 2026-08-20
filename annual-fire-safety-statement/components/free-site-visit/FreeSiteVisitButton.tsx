"use client";

/**
 * FreeSiteVisitButton — primary CTA button with tasteful pulse.
 * ──────────────────────────────────────────────────────────────────────────
 * A single visual primitive for the "Free Site Visit" CTA. Renders an
 * accessible <button> that opens the modal via the global store. The
 * subtle pulse respects `prefers-reduced-motion` and only animates on
 * the persistent primary button a caller wires up via the `pulse` prop
 * — we never animate every CTA on the page.
 *
 * The button is intentionally built without the existing `SitewideCTA`
 * button styles so the primary conversion stays visually distinct from
 * the secondary "Get in touch" / "Call" buttons that surround it.
 */

import React, { forwardRef, useCallback } from "react";

import { openFreeSiteVisit } from "@/lib/free-site-visit/FreeSiteVisitStore";
import { trackFreeSiteVisitEvent, type FreeSiteVisitSource } from "@/lib/free-site-visit/analytics";

export type FreeSiteVisitButtonVariant = "primary" | "ghost" | "compact";

export interface FreeSiteVisitButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /**
   * Where the button appears in the site. Used for analytics funnel
   * reporting — never for personalisation.
   */
  source: FreeSiteVisitSource;
  /** Service id (from lib/services.ts) to pre-select when the modal opens. */
  service?: string;
  /** Visual variant. Defaults to "primary". */
  variant?: FreeSiteVisitButtonVariant;
  /** Show the labeling required for the main persistent CTA. */
  pulse?: boolean;
  /** Optional explicit label. Defaults to "GET AN INSTANT QUOTE". */
  label?: string;
  /** Optional trailing icon element. */
  trailingIcon?: React.ReactNode;
  /** Optional leading icon element. */
  leadingIcon?: React.ReactNode;
}

const FreeSiteVisitButton = forwardRef<HTMLButtonElement, FreeSiteVisitButtonProps>(
  function FreeSiteVisitButton(
    {
      source,
      service,
      variant = "primary",
      pulse = false,
      label = "GET AN INSTANT QUOTE",
      trailingIcon,
      leadingIcon,
      onClick,
      style,
      className,
      ...rest
    },
    ref,
  ) {
    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        trackFreeSiteVisitEvent("free_site_visit_cta_click", {
          source,
          service,
        });
        openFreeSiteVisit({ source, service });
      },
      [onClick, source, service],
    );

    return (
      <>
        <style>{`
          .fsv-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            border-radius: 999px;
            font-weight: 700;
            font-family: inherit;
            cursor: pointer;
            text-decoration: none;
            white-space: nowrap;
            border: 1px solid transparent;
            transition: background-color 200ms ease, transform 200ms ease,
              box-shadow 200ms ease, color 200ms ease, border-color 200ms ease;
            -webkit-tap-highlight-color: transparent;
            text-transform: uppercase;
          }
          .fsv-btn:focus-visible {
            outline: 2px solid #1c4d9c;
            outline-offset: 3px;
          }
          .fsv-btn:disabled {
            cursor: not-allowed;
            opacity: 0.6;
          }
          .fsv-btn--primary {
            background: transparent;
            color: #0b1d36;
            padding: 0.6rem 1.15rem;
            font-size: 0.9rem;
            box-shadow: 0 4px 12px rgba(11, 29, 54, 0.08);
            border-color: #0b1d36;
          }
          .fsv-btn--primary:hover {
            transform: translateY(-2px);
            background: #0b1d36;
            color: #ffffff;
            box-shadow: 0 14px 28px rgba(11, 29, 54, 0.22),
              0 1px 0 rgba(255, 255, 255, 0.1) inset;
          }
          .fsv-btn--primary:active {
            transform: translateY(0);
          }
          .fsv-btn--ghost {
            background: rgba(255, 255, 255, 0.08);
            color: #ffffff;
            padding: 0.55rem 1rem;
            font-size: 0.875rem;
            border-color: rgba(255, 255, 255, 0.4);
          }
          .fsv-btn--ghost:hover {
            background: rgba(255, 255, 255, 0.18);
          }
          .fsv-btn--compact {
            background: transparent;
            color: #0b1d36;
            padding: 0.5rem 1rem;
            font-size: 0.8125rem;
            box-shadow: 0 4px 10px rgba(11, 29, 54, 0.06);
            border-color: #0b1d36;
          }
          .fsv-btn--compact:hover {
            transform: translateY(-1px);
            background: #0b1d36;
            color: #ffffff;
            box-shadow: 0 8px 18px rgba(11, 29, 54, 0.2);
          }

          /* The pulse — only on the primary CTA when *pulse* is true.
             A noticeable "beating" pulse that changes color slightly and expands.
               More distinct scale, color shift (brightness/saturation), and glow. */
          .fsv-btn--pulse {
            animation: fsv-pulse 3s ease-in-out infinite;
          }
          @keyframes fsv-pulse {
            0% {
              transform: scale(1);
              filter: brightness(1) saturate(1);
              box-shadow: 0 4px 12px rgba(11, 29, 54, 0.08),
                0 0 0 0 rgba(28, 77, 156, 0.45),
                0 1px 0 rgba(255, 255, 255, 0.08) inset;
            }
            25% {
              transform: scale(1.05);
              filter: brightness(1.05) saturate(1.05);
              box-shadow: 0 12px 28px rgba(28, 77, 156, 0.32),
                0 0 0 16px rgba(28, 77, 156, 0),
                0 1px 0 rgba(255, 255, 255, 0.1) inset;
            }
            50% {
              transform: scale(1);
              filter: brightness(1) saturate(1);
              box-shadow: 0 4px 12px rgba(11, 29, 54, 0.08),
                0 0 0 0 rgba(28, 77, 156, 0),
                0 1px 0 rgba(255, 255, 255, 0.08) inset;
            }
            100% {
              transform: scale(1);
              filter: brightness(1) saturate(1);
              box-shadow: 0 4px 12px rgba(11, 29, 54, 0.08),
                0 0 0 0 rgba(28, 77, 156, 0),
                0 1px 0 rgba(255, 255, 255, 0.08) inset;
            }
          }
          /* Pause the perpetual pulse on hover/focus/active so the button
             trades the breathing motion for a deliberate interaction state. */
          .fsv-btn--pulse:hover,
          .fsv-btn--pulse:focus-visible,
          .fsv-btn--pulse:active {
            animation: none;
          }
          @media (prefers-reduced-motion: reduce) {
            .fsv-btn--pulse {
              animation: none;
            }
            .fsv-btn {
              transition: none;
            }
            .fsv-btn--primary:hover,
            .fsv-btn--compact:hover {
              transform: none;
            }
          }
          @media (max-width: 768px) {
            .fsv-btn {
              font-size: 1rem;
            }
          }
        `}</style>
        <button
          ref={ref}
          type="button"
          onClick={handleClick}
          className={[
            "fsv-btn",
            variantClass[variant],
            pulse ? "fsv-btn--pulse" : "",
            className ?? "",
          ]
            .filter(Boolean)
            .join(" ")}
          data-fsv-source={source}
          data-fsv-pulse={pulse ? "true" : undefined}
          style={style}
          {...rest}
        >
          {leadingIcon ? <span aria-hidden="true">{leadingIcon}</span> : null}
          <span>{label}</span>
          {trailingIcon ? <span aria-hidden="true">{trailingIcon}</span> : null}
        </button>
      </>
    );
  },
);

export default FreeSiteVisitButton;

const variantClass: Record<FreeSiteVisitButtonVariant, string> = {
  primary: "fsv-btn--primary",
  ghost: "fsv-btn--ghost",
  compact: "fsv-btn--compact",
};
