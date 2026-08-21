"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, ArrowUpRight } from "lucide-react";
import { SITE_PHONE, SITE_EMAIL, SITE_PHONE_TEL, navLinks } from "@/lib/site";
import { openInstantQuote } from "@/lib/quote/open";

/**
 * AFSS — global footer.
 *
 * Independent AFSS identity. No All Fire socials, no parent-brand
 * cross-promotion. Wordmark + brand promise + navigation + contact +
 * approved AFSS resources.
 */

export default function Footer() {
  const phoneTel = SITE_PHONE_TEL?.replace(/[^+\d]/g, "") ?? "1300765594";

  return (
    <footer
      id="afss-footer"
      className="w-full border-t border-[#e3e7ee] bg-white text-[#0b1d36]"
    >
      {/* Wordmark band */}
      <div className="bg-[#0b1d36] text-white">
        <div className="container-shell py-10 sm:py-14 lg:py-16">
          <p
            className="m-0 uppercase font-black tracking-tight leading-[0.9] text-center"
            style={{ fontSize: "clamp(2.25rem, 9vw, 9rem)" }}
          >
            Annual Fire Safety
            <br />
            <span
              style={{
                background: "linear-gradient(90deg, #ffffff 0%, #7aa6e6 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
                display: "inline-block",
              }}
            >
              Statements. Sorted.
            </span>
          </p>
        </div>
      </div>

      <div className="container-shell pt-12 pb-8 sm:pt-14 lg:pt-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(18rem,0.55fr)_minmax(0,1fr)] lg:gap-12">
          <div className="min-w-0 max-w-xl">
            <Image
              src="/logo.png"
              alt="Annual Fire Safety Statement"
              width={300}
              height={60}
              style={{ height: "44px", width: "auto" }}
            />
            <p
              className="mt-5 m-0 text-[#3a4a63]"
              style={{ fontSize: "1rem", lineHeight: 1.55 }}
            >
              Specialist Annual Fire Safety Statement support for NSW
              buildings. From your Fire Safety Schedule through
              assessment and AFSS preparation.
            </p>

            <div className="mt-5 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2 sm:mt-6">
              <button
                type="button"
                className="btn btn-dark rounded-full"
                onClick={() => openInstantQuote({ source: "footer" })}
              >
                Get my AFSS quote
              </button>
              <a
                href={`tel:${phoneTel}`}
                className="btn btn-secondary whitespace-nowrap"
                style={{ borderRadius: 999 }}
              >
                <Phone size={14} strokeWidth={2.2} aria-hidden="true" />
                Call {SITE_PHONE}
                <ArrowUpRight size={14} strokeWidth={2.4} aria-hidden="true" />
              </a>
            </div>

            <address className="mt-5 flex max-w-xl flex-col gap-3 border-t border-[rgba(11,29,54,0.12)] pt-4 text-[0.9rem] font-medium leading-relaxed not-italic">
              <a
                href={`mailto:${SITE_EMAIL}`}
                className="transition-colors hover:text-[#1c4d9c]"
                style={{ textDecoration: "none" }}
              >
                <Mail
                  size={14}
                  strokeWidth={2.2}
                  aria-hidden="true"
                  className="inline-block align-[-2px] mr-2"
                />
                {SITE_EMAIL}
              </a>
              <p className="m-0 text-[#3a4a63]">
                Servicing Greater Sydney &amp; NSW
              </p>
              <div className="flex flex-col gap-1">
                <a
                  href={`tel:${phoneTel}`}
                  className="transition-colors hover:text-[#1c4d9c]"
                  style={{ textDecoration: "none" }}
                >
                  Call us: {SITE_PHONE}
                </a>
                <a
                  href={`mailto:${SITE_EMAIL}`}
                  className="transition-colors hover:text-[#1c4d9c]"
                  style={{ textDecoration: "none" }}
                >
                  Email us: {SITE_EMAIL}
                </a>
              </div>
            </address>
          </div>

          <div className="min-w-0">
            <div className="flex flex-row gap-6 sm:gap-8 lg:gap-12">
              <nav aria-label="Site links" className="flex-1 sm:flex-none sm:w-50">
                <h2
                  className="m-0 mb-5"
                  style={{
                    fontSize: "clamp(0.95rem, 1.3vw, 1.1rem)",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                  }}
                >
                  AFSS site
                </h2>
                <ul className="flex flex-col gap-2.5 text-[0.92rem] font-medium leading-snug">
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="transition-colors hover:text-[#1c4d9c]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <nav aria-label="AFSS resources" className="flex-1">
                <h2
                  className="m-0 mb-5"
                  style={{
                    fontSize: "clamp(0.95rem, 1.3vw, 1.1rem)",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                  }}
                >
                  AFSS resources
                </h2>
                <ul className="grid grid-cols-1 gap-2.5 text-[0.9rem] font-medium leading-snug sm:grid-cols-2">
                  <li>
                    <Link
                      href="/sample"
                      className="text-[#3a4a63] transition-colors hover:text-[#1c4d9c]"
                    >
                      Sample AFSS
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/services"
                      className="text-[#3a4a63] transition-colors hover:text-[#1c4d9c]"
                    >
                      Services
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/accreditation"
                      className="text-[#3a4a63] transition-colors hover:text-[#1c4d9c]"
                    >
                      Accredited Practitioner (Fire Safety)
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/new-legislation"
                      className="text-[#3a4a63] transition-colors hover:text-[#1c4d9c]"
                    >
                      AS 1851-2012
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact-us"
                      className="text-[#3a4a63] transition-colors hover:text-[#1c4d9c]"
                    >
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/about"
                      className="text-[#3a4a63] transition-colors hover:text-[#1c4d9c]"
                    >
                      About
                    </Link>
                  </li>
                </ul>

                <div className="mt-7 pt-5 border-t border-[rgba(11,29,54,0.08)]">
                  <h3
                    className="m-0 mb-3"
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 800,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Official NSW references
                  </h3>
                  <ul className="flex flex-col gap-2 text-[0.86rem] font-medium">
                    <li>
                      <a
                        href="https://www.planning.nsw.gov.au/the-planning-system/buildings/fire-safety-in-buildings/fire-safety-certification"
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-[#3a4a63] transition-colors hover:text-[#1c4d9c]"
                      >
                        NSW Planning — fire safety certification
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.nsw.gov.au/housing-and-construction/compliance-and-regulation/fire-safety-practitioners"
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-[#3a4a63] transition-colors hover:text-[#1c4d9c]"
                      >
                        NSW Government — fire safety practitioners
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://connect.fpaa.com.au/FireSafetyAssessors"
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-[#3a4a63] transition-colors hover:text-[#1c4d9c]"
                      >
                        FPAA — public register
                      </a>
                    </li>
                  </ul>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <div className="container-shell">
        <div className="mt-4 flex flex-col gap-3 border-t border-[rgba(11,29,54,0.12)] pb-6 pt-4 text-[12px] font-medium text-[#3a4a63] sm:flex-row sm:items-center sm:justify-between">
          <p className="m-0">
            &copy; {new Date().getFullYear()} Annual Fire Safety Statement. All
            rights reserved.
          </p>
          <p className="m-0 text-[#5b6a82]">
            Specialist AFSS support for NSW. Compliance · Clarity · Confidence.
          </p>
        </div>
      </div>
    </footer>
  );
}