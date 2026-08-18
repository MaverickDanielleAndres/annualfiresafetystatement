/**
 * Free Site Visit — analytics
 * ──────────────────────────────────────────────────────────────────────────
 * Lightweight wrapper that emits non-PII conversion events through whatever
 * analytics provider is already loaded on the page. We never send names,
 * emails, phone numbers, addresses, message bodies, or uploaded documents.
 *
 * We respect the existing project pattern: events are forwarded to
 * `window.dataLayer` (GTM-style) and `window.gtag` (GA4) if either is
 * installed, and we expose a custom `freeSiteVisitEvent` event on the
 * document so any provider can subscribe.
 *
 * Resilient to missing analytics — never throws.
 */

export type FreeSiteVisitSource =
  | "header"
  | "hero"
  | "footer"
  | "floating"
  | "mobile_sticky"
  | "contact"
  | "home-services"
  | "service_page"
  | "strata"
  | "our_clients"
  | "our_team"
  | "why_all_fire"
  | "sitewide"
  | "our_story"
  | "auto_30s"
  | "other";

export type FreeSiteVisitEventName =
  | "free_site_visit_cta_click"
  | "free_site_visit_popup_open"
  | "free_site_visit_popup_close"
  | "free_site_visit_form_start"
  | "free_site_visit_submit"
  | "free_site_visit_success"
  | "free_site_visit_error"
  | "free_site_visit_file_attached";

export interface FreeSiteVisitAnalyticsPayload {
  source: FreeSiteVisitSource;
  /** Service id from lib/services.ts — never the service display name. */
  service?: string;
  /** True when the modal opened via the 30s auto-trigger. */
  auto?: boolean;
}

export interface FreeSiteVisitEventEnvelope {
  event: FreeSiteVisitEventName;
  payload: FreeSiteVisitAnalyticsPayload;
  ts: number;
}

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Emit a Free Site Visit conversion event. Always non-blocking, never
 * throws. Pages without analytics simply observe noop.
 */
export function trackFreeSiteVisitEvent(
  event: FreeSiteVisitEventName,
  payload: FreeSiteVisitAnalyticsPayload,
): void {
  if (typeof window === "undefined") return;
  const envelope: FreeSiteVisitEventEnvelope = {
    event,
    payload,
    ts: Date.now(),
  };

  // Custom DOM event for any installed provider to subscribe to.
  try {
    document.dispatchEvent(
      new CustomEvent<FreeSiteVisitEventEnvelope>("freeSiteVisitEvent", {
        detail: envelope,
      }),
    );
  } catch {
    /* old browsers — ignore */
  }

  // Google Tag Manager dataLayer (push-based).
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event,
      fsv_source: payload.source,
      fsv_service: payload.service ?? null,
      fsv_auto: payload.auto ? 1 : 0,
    });
  } catch {
    /* dataLayer unavailable — fine */
  }

  // GA4 gtag.
  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", event, {
        fsv_source: payload.source,
        fsv_service: payload.service ?? null,
        fsv_auto: payload.auto ? 1 : 0,
      });
    }
  } catch {
    /* gtag unavailable — fine */
  }

  // Verbose dev log so engineers can verify event flow locally.
  if (process.env.NODE_ENV !== "production") {
    console.debug("[FreeSiteVisit]", event, envelope.payload);
  }
}
