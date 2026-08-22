/**
 * AFSS — Partners data.
 *
 * ─── DEMO ENTRIES ACTIVE ──────────────────────────────────────────────────
 * The entries below are DEMO placeholders so the homepage Partners section
 * renders for design review. They are clearly labelled "[Demo]" and contain
 * no real organisational names, logos, or URLs.
 *
 * BEFORE GO-LIVE: Pete must replace these with real, approved partner
 * relationships (real organisation, real logo, real URL). Delete this
 * block and supply real entries, or set the array back to [] to hide the
 * section again. The section will auto-hide when `partners.length === 0`.
 *
 * Important rule: never add NSW Government, Fire and Rescue NSW, FPAA, or
 * Building Commission NSW as partners merely because the site references
 * their guidance or register. They are referenced for compliance, not
 * partnered with.
 * ──────────────────────────────────────────────────────────────────────────
 */

export type PartnerCategory =
  | "Strata management"
  | "Property management"
  | "Facilities management"
  | "Fire safety specialist"
  | "Industry partner";

export interface PartnerEntry {
  name: string;
  category: PartnerCategory;
  /** Optional logo path (public/). SVG preferred. */
  logo?: string;
  /** Required when logo is provided. */
  logoAlt?: string;
  /** Optional relationship description (one line, kept factual). */
  relationship?: string;
  /** Optional public URL. Only link to the organisation's actual site. */
  url?: string;
  /** Marks an entry as a non-production placeholder. Demo-only flag. */
  isDemo?: boolean;
}

const partners: PartnerEntry[] = [
  {
    name: "[Demo] Strata Management Co",
    category: "Strata management",
    relationship: "Demo placeholder — replace with a real strata management partner.",
    isDemo: true,
  },
  {
    name: "[Demo] Property Management Co",
    category: "Property management",
    relationship: "Demo placeholder — replace with a real property management partner.",
    isDemo: true,
  },
  {
    name: "[Demo] Facilities Management Co",
    category: "Facilities management",
    relationship: "Demo placeholder — replace with a real facilities management partner.",
    isDemo: true,
  },
  {
    name: "[Demo] Fire Safety Specialist",
    category: "Fire safety specialist",
    relationship: "Demo placeholder — replace with a real fire safety specialist.",
    isDemo: true,
  },
  {
    name: "[Demo] Industry Partner",
    category: "Industry partner",
    relationship: "Demo placeholder — replace with a real industry partner.",
    isDemo: true,
  },
  {
    name: "[Demo] Strata Group 2",
    category: "Strata management",
    relationship: "Demo placeholder — second example entry.",
    isDemo: true,
  },
];

export default partners;

export const hasPartners = partners.length > 0;
