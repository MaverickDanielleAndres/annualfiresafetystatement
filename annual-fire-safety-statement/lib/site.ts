// Site-wide configuration for the Annual Fire Safety Statement website.
// Inherits the structure of All Fire Services (lib/seo.ts) but is its own
// distinct specialist identity focused on AFSS in NSW.

export const SITE_NAME = "Annual Fire Safety Statement";
export const SITE_SHORT_NAME = "AFSS";
export const SITE_LONG_NAME = "Annual Fire Safety Statement Australia";
export const SITE_LEGAL_NAME = "Annual Fire Safety Statement Pty Ltd";

export const SITE_URL = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.annualfiresafetystatement.com.au",
);

export const SITE_PHONE = "1300 765 594";
export const SITE_PHONE_TEL = "+61-1300-765-594";
export const SITE_EMAIL = "admin@annualfiresafetystatement.com.au";

export const SITE_REGION = "Greater Sydney, New South Wales";

export const DEFAULT_DESCRIPTION =
  "Annual Fire Safety Statements (AFSS) for NSW strata, commercial and industrial buildings. Accredited Practitioner (Fire Safety) assessments, lodgement support, and AS 1851-2012 maintenance guidance.";

export const DEFAULT_OG_IMAGE = "/og-image.svg";

// ─── Navigation ────────────────────────────────────────────────────────────
// Single source of truth for header, footer and any in-page nav.

export type NavLink = {
  label: string;
  href: string;
};

export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Accreditation", href: "/accreditation" },
  { label: "AS 1851-2012", href: "/new-legislation" },
  { label: "Sample AFSS", href: "/sample" },
  { label: "Contact", href: "/contact-us" },
];

// ─── Page metadata factory ────────────────────────────────────────────────

export type PagePath = `/${string}` | "/";

export interface PageMetadataOptions {
  title: string;
  description: string;
  path: PagePath;
  canonicalPath?: PagePath;
  noIndex?: boolean;
  ogImage?: string;
  keywords?: string[];
}

export function createPageMetadata({
  title,
  description,
  path,
  canonicalPath = path,
  noIndex = false,
  ogImage = DEFAULT_OG_IMAGE,
  keywords,
}: PageMetadataOptions) {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const canonicalUrl = new URL(canonicalPath, SITE_URL).toString();
  const pageUrl = new URL(path, SITE_URL).toString();
  const ogImageUrl = ogImage.startsWith("http")
    ? ogImage
    : new URL(ogImage, SITE_URL).toString();

  return {
    title: fullTitle,
    description,
    keywords,
    alternates: { canonical: canonicalUrl },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          noarchive: true,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large" as const,
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      type: "website" as const,
      locale: "en_AU",
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      url: pageUrl,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} — AFSS specialists in NSW`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: fullTitle,
      description,
      images: [ogImageUrl],
    },
  };
}

export function canonicalUrlFor(path: PagePath): string {
  return new URL(path, SITE_URL).toString();
}
