/**
 * AFSS — Partners data.
 *
 * Real relationships only. Categories reflect types of organisations
 * the business works with — never claim NSW Government affiliation,
 * and never display industry logos merely because we reference their
 * legislation or resources.
 *
 * If empty, the homepage Partners section renders a polite
 * placeholder; no fake partners.
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
  /** Optional relationship description (one line, kept factual). */
  relationship?: string;
  /** Optional public URL. Only link to the organisation's actual site. */
  url?: string;
}

const partners: PartnerEntry[] = [
  // Populate with real partner entries supplied by the client.
];

export default partners;

export const hasPartners = partners.length > 0;