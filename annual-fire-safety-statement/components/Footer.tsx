import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SITE_PHONE, SITE_EMAIL, navLinks } from "@/lib/site";

export default function Footer() {
  return (
    <footer
      id="afss-footer"
      className="w-full border-t border-[#ececec] bg-white text-[#111111]"
    >
      <div className="container-shell pt-12 pb-8 sm:pt-14 lg:pt-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(18rem,0.55fr)_minmax(0,1fr)] lg:gap-12">
          <div className="min-w-0 max-w-xl">
            <h2
              className="m-0"
              style={{
                fontSize: "clamp(1.5rem, 3.2vw, 2.5rem)",
                fontWeight: 800,
                letterSpacing: "-0.04em",
                lineHeight: 0.96,
                textTransform: "uppercase",
              }}
            >
              <span style={{ color: "#111111" }}>Annual Fire Safety</span>
              <br />
              <span className="gradient-text">Statements. Sorted.</span>
            </h2>

            <div className="mt-4 grid max-w-xl grid-cols-1 gap-2 sm:grid-cols-2 sm:mt-5">
              <Link
                href="/free-quote"
                className="btn btn-primary"
                style={{ borderRadius: 999, color: "#ffffff" }}
              >
                Get a free quote
              </Link>
              <a
                href={`tel:${SITE_PHONE.replace(/\s/g, "")}`}
                className="btn btn-secondary"
                style={{ borderRadius: 999 }}
              >
                <span className="whitespace-nowrap">Call {SITE_PHONE}</span>
                <ArrowUpRight size={16} strokeWidth={2.4} aria-hidden="true" />
              </a>
            </div>

            <address className="mt-5 flex max-w-xl flex-col gap-3 border-t border-[rgba(17,17,17,0.12)] pt-4 text-[0.9rem] font-medium leading-relaxed not-italic">
              <a
                href={`mailto:${SITE_EMAIL}`}
                className="transition-colors hover:text-[#d64114]"
                style={{ textDecoration: "none" }}
              >
                {SITE_EMAIL}
              </a>
              <p className="m-0 text-[#4a4a46]">
                Servicing Greater Sydney &amp; NSW
              </p>
              <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:gap-x-4">
                <p className="m-0 text-[#4a4a46]">Mon-Fri: 7:00am to 6:30pm</p>
                <a
                  href={`tel:${SITE_PHONE.replace(/\s/g, "")}`}
                  className="transition-colors hover:text-[#d64114]"
                  style={{ textDecoration: "none" }}
                >
                  After hours: {SITE_PHONE}
                </a>
              </div>
            </address>
          </div>

          <div className="min-w-0">
            <div className="flex flex-row gap-6 sm:gap-8 lg:gap-12">
              <nav aria-label="Quick links" className="flex-1 sm:flex-none sm:w-50">
                <h2
                  className="m-0 mb-6"
                  style={{
                    fontSize: "clamp(1rem, 1.4vw, 1.2rem)",
                    fontWeight: 800,
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                  }}
                >
                  Quicklinks
                </h2>
                <ul className="flex flex-col gap-3 text-[0.9rem] font-medium leading-snug">
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="transition-colors hover:text-[#d64114]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <nav aria-label="Compliance" className="flex-1">
                <h2
                  className="m-0 mb-6"
                  style={{
                    fontSize: "clamp(1rem, 1.4vw, 1.2rem)",
                    fontWeight: 800,
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                  }}
                >
                  Compliance
                </h2>
                <ul className="grid grid-cols-1 gap-3 text-[0.9rem] font-medium leading-snug sm:grid-cols-2">
                  <li>
                    <Link
                      href="/services"
                      className="text-[#555555] transition-colors hover:text-[#d64114]"
                    >
                      Annual Fire Safety Statement
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/services"
                      className="text-[#555555] transition-colors hover:text-[#d64114]"
                    >
                      Fire Safety Schedule
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/accreditation"
                      className="text-[#555555] transition-colors hover:text-[#d64114]"
                    >
                      Accredited Practitioner
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/new-legislation"
                      className="text-[#555555] transition-colors hover:text-[#d64114]"
                    >
                      AS 1851-2012
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/sample"
                      className="text-[#555555] transition-colors hover:text-[#d64114]"
                    >
                      Sample AFSS
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq"
                      className="text-[#555555] transition-colors hover:text-[#d64114]"
                    >
                      Frequently asked
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>



      <div className="container-shell">
        <div className="mt-4 flex flex-col gap-3 border-t border-[rgba(17,17,17,0.12)] pb-6 pt-4 text-[12px] font-medium text-[#4a4a46] sm:flex-row sm:items-center sm:justify-between">
          <p className="m-0">
            &copy; {new Date().getFullYear()} Annual Fire Safety Statement. All
            rights reserved.
          </p>
          <p className="m-0 text-[#777777]">
            Specialist AFSS support for NSW.
          </p>
        </div>
      </div>
    </footer>
  );
}
