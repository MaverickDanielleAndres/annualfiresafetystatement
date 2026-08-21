/**
 * AFSS — Projects data.
 *
 * Real, client-supplied project case only. Each card surfaces one piece of
 * proof that the business understands real NSW buildings. Do not
 * invent projects. If the array is empty, the homepage Projects section
 * renders a polite placeholder.
 */

export type ProjectType =
  | "Strata / Residential"
  | "Commercial"
  | "Industrial"
  | "Retail"
  | "Mixed-use"
  | "Institutional";

export interface ProjectEntry {
  slug: string;
  propertyType: ProjectType;
  location: string;
  service: string;
  scope: string;
  outcome?: string;
  /** Path to a public/ asset (used with next/image). */
  image?: string;
  /** Required when image is provided. */
  imageAlt?: string;
}

const projects: ProjectEntry[] = [
  // Example (commented to preserve shape — uncomment + populate with
  // real client-approved content once supplied):
  // {
  //   slug: "sydney-cbd-commercial-tower",
  //   propertyType: "Commercial",
  //   location: "Sydney CBD, NSW",
  //   service: "Annual Fire Safety Statement",
  //   scope: "12-storey commercial tower — assessment and statement across all applicable measures.",
  //   outcome: "AFSS issued and lodged.",
  //   image: "/sampleafss-nobg.png",
  //   imageAlt: "Sample AFSS document",
  // },
];

export default projects;

export const hasProjects = projects.length > 0;