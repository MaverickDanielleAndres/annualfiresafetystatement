/**
 * AFSS — Projects data.
 */

export type ProjectType =
  | "Residential"
  | "Commercial"
  | "Industrial"
  | "Shops"
  | "Mixed-Use"
  | "Government";

export type AfssProjectCategory =
  | "residential"
  | "commercial"
  | "industrial"
  | "shops"
  | "mixed-use"
  | "government";

export interface ProjectEntry {
  slug: string;
  propertyType: ProjectType;
  /**
   * Optional category for the homepage tab filter.
   * When omitted, the section derives it from `propertyType`.
   */
  category?: AfssProjectCategory;
  title: string;
  location: string;
  service: string;
  scope: string;
  outcome?: string;
  /** Optional completion year (used only for display when supplied). */
  year?: number;
  /** Path to a public/ asset (used with next/image). */
  image?: string;
  /** Required when image is provided. */
  imageAlt?: string;
  /** Optional explicit link target; falls back to /projects/{slug}. */
  href?: string;
  /** Optional featured flag (currently unused but reserved for ordering). */
  featured?: boolean;
  /** Marks an entry as a non-production placeholder. Demo-only flag. */
  isDemo?: boolean;
}

const projects: ProjectEntry[] = [
  {
    slug: "riverside-strata-complex",
    propertyType: "Residential",
    category: "residential",
    title: "Riverside Strata Complex",
    location: "Inner West, Sydney NSW",
    service: "Annual Fire Safety Statement",
    scope: "Multi-storey residential building — assessment of applicable essential fire safety measures and statement preparation.",
    year: 2024,
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
    imageAlt: "Riverside Strata Complex",
  },
  {
    slug: "sydney-cbd-office-tower",
    propertyType: "Commercial",
    category: "commercial",
    title: "Sydney CBD Office Tower",
    location: "Sydney CBD, NSW",
    service: "Annual Fire Safety Statement",
    scope: "Multi-storey commercial office tower — assessment across all applicable measures identified on the Fire Safety Schedule.",
    year: 2024,
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
    imageAlt: "Sydney CBD Office Tower",
  },
  {
    slug: "western-sydney-facility",
    propertyType: "Industrial",
    category: "industrial",
    title: "Western Sydney Facility",
    location: "Western Sydney, NSW",
    service: "Annual Fire Safety Statement",
    scope: "Industrial facility with warehouse and office components — assessment of applicable measures and statement preparation.",
    year: 2025,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80",
    imageAlt: "Western Sydney Facility",
  },
  {
    slug: "parramatta-retail-precinct",
    propertyType: "Shops",
    category: "shops",
    title: "Parramatta Retail Precinct",
    location: "Parramatta, NSW",
    service: "Annual Fire Safety Statement",
    scope: "Retail complex with multiple tenancies — assessment of applicable essential fire safety measures and documentation.",
    year: 2024,
    image: "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?w=800&q=80",
    imageAlt: "Parramatta Retail Precinct",
  },
  {
    slug: "st-leonards-mixed-use",
    propertyType: "Mixed-Use",
    category: "mixed-use",
    title: "St Leonards Mixed-Use",
    location: "St Leonards, NSW",
    service: "Annual Fire Safety Statement",
    scope: "Mixed-use building with residential apartments and ground retail — assessment of applicable measures and preparation.",
    year: 2024,
    image: "https://images.unsplash.com/photo-1448630360428-65456885c650?w=800&q=80",
    imageAlt: "St Leonards Mixed-Use",
  },
  {
    slug: "nsw-government-building",
    propertyType: "Government",
    category: "government",
    title: "NSW Government Building",
    location: "Sydney, NSW",
    service: "Annual Fire Safety Statement",
    scope: "Government office building — assessment of applicable essential fire safety measures and statement preparation.",
    year: 2025,
    image: "https://images.unsplash.com/photo-1523730205978-59fd1b2965e3?w=800&q=80",
    imageAlt: "NSW Government Building",
  },
  {
    slug: "industrial-estate-warehouse",
    propertyType: "Industrial",
    category: "industrial",
    title: "Industrial Estate Warehouse",
    location: "South West Sydney, NSW",
    service: "Annual Fire Safety Statement",
    scope: "Large warehouse and distribution facility — assessment of applicable fire safety measures including high roof systems.",
    year: 2024,
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80",
    imageAlt: "Industrial Estate Warehouse",
  },
  {
    slug: "north-sydney-apartments",
    propertyType: "Residential",
    category: "residential",
    title: "North Sydney Apartments",
    location: "North Sydney, NSW",
    service: "Annual Fire Safety Statement",
    scope: "Residential apartment building — assessment of applicable essential fire safety measures and statement preparation.",
    year: 2024,
    image: "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800&q=80",
    imageAlt: "North Sydney Apartments",
  },
];

export default projects;

export const hasProjects = projects.length > 0;

/** Helper used by the Projects component to map a propertyType → category. */
export function deriveCategory(entry: ProjectEntry): AfssProjectCategory {
  if (entry.category) return entry.category;
  const pt = entry.propertyType.toLowerCase();
  if (pt.includes("residential")) return "residential";
  if (pt.includes("commercial")) return "commercial";
  if (pt.includes("industrial")) return "industrial";
  if (pt.includes("shops")) return "shops";
  if (pt.includes("mixed-use")) return "mixed-use";
  if (pt.includes("government")) return "government";
  return "commercial";
}
