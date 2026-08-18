import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FreeSiteVisitIsland from "@/components/free-site-visit/FreeSiteVisitIsland";
import { SITE_NAME, SITE_URL, DEFAULT_DESCRIPTION } from "@/lib/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  // Trimmed to the weights All Fire Services actually uses.
  weight: ["400", "600", "700", "800", "900"],
  style: ["normal"],
  // "optional" — if Inter isn't cached by the time we paint, the browser
  // keeps the system fallback and avoids layout shift. CLS win on mobile.
  display: "optional",
  preload: true,
  fallback: ["system-ui", "Helvetica", "Arial", "sans-serif"],
  adjustFontFallback: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "optional",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: {
    default: `${SITE_NAME} — AFSS Specialists NSW`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  category: "Fire safety compliance",
  keywords: [
    "Annual Fire Safety Statement",
    "AFSS",
    "AFSS NSW",
    "Accredited Practitioner Fire Safety",
    "APFS",
    "Fire Safety Schedule",
    "AS 1851-2012",
    "NSW fire compliance",
    "strata fire safety",
    "Sydney fire safety",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL.toString() }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: "/",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — AFSS Specialists NSW`,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — AFSS specialists in NSW`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — AFSS Specialists NSW`,
    description: DEFAULT_DESCRIPTION,
    images: ["/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-AU" className={`${inter.variable} ${geistMono.variable} antialiased`}>
      <body
        className="min-h-screen flex flex-col bg-white text-ink"
        style={{ scrollbarGutter: "stable" }}
      >
        <Header />
        <main className="flex-1">{children}</main>
        <FreeSiteVisitIsland />
        <Footer />
      </body>
    </html>
  );
}
