export type TestimonialSource = "google" | "direct" | "other";

export interface TestimonialEntry {
  quote: string;
  name: string;
  role: string;
  propertyType: string;
  location: string;
  /** Optional 1-5 rating. Only rendered if explicitly supplied. */
  rating?: number;
  /** Optional image of the property */
  image?: string;
  /** Optional attribution source. Only "google" with a \sourceUrl\ shows a Google label. */
  source?: TestimonialSource;
  /** Optional public URL - required for a Google attribution label to render. */
  sourceUrl?: string;
  /** Marks an entry as a non-production placeholder. Demo-only flag. */
  isDemo?: boolean;
}

const testimonials: TestimonialEntry[] = [
  {
    quote: "AFSS provided a thorough, professional service with clear communication at every step. Their reports were easy to understand, well-structured and delivered on time, making compliance simple and stress-free.",
    name: "James Mitchell",
    role: "Facilities Manager",
    propertyType: "Commercial",
    location: "Riverside Strata Complex | Inner West, Sydney NSW",
    rating: 5,
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop",
    isDemo: true,
  },
  {
    quote: "Their team is knowledgeable, responsive and proactive in identifying risks before they become issues. I highly recommend them for any building compliance needs.",
    name: "Sarah Lee",
    role: "Building Manager",
    propertyType: "Corporate",
    location: "Sydney CBD Office Tower | Sydney CBD, NSW",
    rating: 5,
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop",
    isDemo: true,
  },
  {
    quote: "We have worked with AFSS for over 5 years. Their dedication to safety and their attention to detail gives us complete peace of mind.",
    name: "David Chen",
    role: "Operations Director",
    propertyType: "Industrial",
    location: "Western Logistics Hub | Parramatta, NSW",
    rating: 5,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000&auto=format&fit=crop",
    isDemo: true,
  },
];

export default testimonials;

export const hasTestimonials = testimonials.length > 0;
