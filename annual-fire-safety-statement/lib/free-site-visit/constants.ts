/**
 * Free Site Visit — shared constants
 * ──────────────────────────────────────────────────────────────────────────
 * The service selection list is the single source of truth for the offer
 * dropdown. It is derived from `lib/services.ts` so the labels stay in sync
 * with the homepage, the Our Services dropdown, the footer and the service
 * detail pages. We expose the data in the priority order the client asked
 * for (Frequently requested services first).
 *
 * NOTE: This is a *temporary* order pending business sign-off. The dropdown
 * stays in sync with the approved service names whichever order is used.
 */

const services: any[] = [];

/**
 * The approved public-facing service names in the requested CTA priority
 * order. The list intentionally promotes services that are commonly
 * enquired about (Annual Fire Safety Statement, Fire Extinguishers, etc.)
 * toward the top of the dropdown so visitors can find them quickly.
 *
 * The "Other" option is always appended at the end so it never displaces a
 * real service.
 */
export const FREE_SITE_VISIT_SERVICE_OPTIONS: ReadonlyArray<string> = [
  // AFSS first — most common enquiry type for strata + commercial property.
  "Annual Fire Safety Statement",
  // Next-highest enquiries from the business — extinguishers + emergency
  // lights + smoke detectors are the most frequently requested one-off
  // jobs.
  "Fire Extinguishers",
  "Emergency Lights",
  "Smoke Detectors",
  "Fire Doors",
  "Fire Hose Reels",
  "Fire Panels & Alarms",
  "Diesel / Hydrant / Sprinkler",
  "Fire Penetration",
  "Flow Testing",
  "Air & Mechanical Services",
  "Zone Block / Evacuation / Hydrant Plans",
  "Other",
];

/**
 * Quick lookup from approved service id (lib/services.ts) to the public
 * label used in the dropdown. Returns the id if the id is unknown so a
 * typo surfaces loudly rather than silently rendering an empty string.
 */
export function freeSiteVisitLabelForServiceId(id: string | undefined | null): string {
  if (!id) return "";
  const match = services.find((s) => s.id === id);
  return match?.name ?? id;
}

/**
 * Reverse lookup — given the dropdown label, return the matching service id
 * where one exists. Used when the form is submitted with a service label
 * so we can record a structured id alongside the human-friendly label.
 */
export function freeSiteVisitIdForServiceLabel(label: string | undefined | null): string | undefined {
  if (!label) return undefined;
  const match = services.find((s) => s.name === label);
  return match?.id;
}
