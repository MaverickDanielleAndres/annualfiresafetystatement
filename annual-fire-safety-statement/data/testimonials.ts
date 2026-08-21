/**
 * AFSS — Testimonials data.
 *
 * Real, client-supplied testimonials only. Do not fabricate quotes.
 * The homepage Testimonials section shows one large editorial
 * testimonial at a time with a counter; if the array has fewer than
 * the counter implies, navigation is gated.
 *
 * `body` is one paragraph; `name`, `role`, `propertyType`, `location`
 * identify the source.
 */

export interface TestimonialEntry {
  quote: string;
  name: string;
  role: string;
  propertyType: string;
  location: string;
}

const testimonials: TestimonialEntry[] = [
  // Example (commented to preserve shape — uncomment + populate with
  // real client-approved content once supplied):
  // {
  //   quote: "Clear, responsive and straightforward from the first conversation through to the AFSS.",
  //   name: "Alex M.",
  //   role: "Building Manager",
  //   propertyType: "Mixed-use",
  //   location: "Sydney CBD, NSW",
  // },
];

export default testimonials;

export const hasTestimonials = testimonials.length > 0;