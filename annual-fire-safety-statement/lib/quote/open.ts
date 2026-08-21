/**
 * AFSS — global Instant Quote opener.
 *
 * Tiny module-singleton pattern (mirrors the FreeSiteVisit store) so any
 * page or component can open the Instant Quote modal without being
 * inside a React context. The Instant Quote modal mounts itself into a
 * portal-style root via the page that hosts it.
 *
 * To use: import { openInstantQuote } and call it on click. The hosting
 * page is responsible for mounting the modal listener; on the homepage
 * the modal is rendered by `components/home/Hero.tsx` so any caller
 * across the page opens the same modal at the same instance.
 */

export type InstantQuoteSource =
  | "hero"
  | "header"
  | "header_mobile"
  | "footer"
  | "section"
  | "final_cta";

type Listener = (payload: { source: InstantQuoteSource }) => void;

let listener: Listener | null = null;

export function onInstantQuoteOpen(fn: Listener) {
  listener = fn;
}

export function openInstantQuote(payload: { source: InstantQuoteSource }) {
  if (typeof window === "undefined") return;
  listener?.(payload);
}