import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";
import { SITE_PHONE, SITE_EMAIL, navLinks } from "@/lib/site";
import { FacebookIcon, InstagramIcon, LinkedinIcon, YoutubeIcon, TikTokIcon, XIcon } from "./SocialIcons";
import FreeSiteVisitButton from "./free-site-visit/FreeSiteVisitButton";

export default function Footer() {
  return (
    <footer
      id="afss-footer"
      className="w-full border-t border-[#e3e7ee] bg-white text-[#0b1d36]"
    >
      <div className="container-shell pt-12 pb-8 sm:pt-14 lg:pt-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(18rem,0.55fr)_minmax(0,1fr)] lg:gap-12">
          <div className="min-w-0 max-w-xl">
            <h2
              className="m-0"
              style={{
                fontSize: "clamp(1.5rem, 3.2vw, 2.5rem)",
                fontWeight: 800,
                letterSpacing: "-0.035em",
                lineHeight: 0.96,
                textTransform: "uppercase",
              }}
            >
              <span style={{ color: "#0b1d36" }}>Annual Fire Safety</span>
              <br />
              <span
                style={{
                  background: "linear-gradient(90deg, #0b1d36 0%, #1c4d9c 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  color: "transparent",
                }}
              >
                Statements. Sorted.
              </span>
            </h2>

            <div className="mt-4 grid max-w-xl grid-cols-1 gap-2 sm:grid-cols-2 sm:mt-5">
              <FreeSiteVisitButton
                source="footer"
                className="btn btn-primary text-white py-3 px-6 uppercase font-bold tracking-[0.06em] text-sm rounded-full shadow-[0_8px_20px_rgba(11,29,54,0.18)] hover:scale-100"
              />
              <a
                href={`tel:${SITE_PHONE.replace(/\s/g, "")}`}
                className="btn btn-secondary whitespace-nowrap"
                style={{ borderRadius: "0.375rem" }}
              >
                Call {SITE_PHONE}
                <ArrowUpRight size={16} strokeWidth={2.4} aria-hidden="true" />
              </a>
            </div>

            <address className="mt-5 flex max-w-xl flex-col gap-3 border-t border-[rgba(11,29,54,0.12)] pt-4 text-[0.9rem] font-medium leading-relaxed not-italic">
              <a
                href={`mailto:${SITE_EMAIL}`}
                className="transition-colors hover:text-[#1c4d9c]"
                style={{ textDecoration: "none" }}
              >
                {SITE_EMAIL}
              </a>
              <p className="m-0 text-[#3a4a63]">
                Servicing Greater Sydney &amp; NSW
              </p>
              <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:gap-x-4">
                <p className="m-0 text-[#3a4a63]">Mon-Fri: 7:00am to 6:30pm</p>
                <a
                  href={`tel:${SITE_PHONE.replace(/\s/g, "")}`}
                  className="transition-colors hover:text-[#1c4d9c]"
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
                    letterSpacing: "-0.03em",
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
                        className="transition-colors hover:text-[#1c4d9c]"
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
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                  }}
                >
                  Compliance
                </h2>
                <ul className="grid grid-cols-1 gap-3 text-[0.9rem] font-medium leading-snug sm:grid-cols-2">
                  <li>
                    <Link
                      href="/services"
                      className="text-[#3a4a63] transition-colors hover:text-[#1c4d9c]"
                    >
                      Annual Fire Safety Statement
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/services"
                      className="text-[#3a4a63] transition-colors hover:text-[#1c4d9c]"
                    >
                      Fire Safety Schedule
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/accreditation"
                      className="text-[#3a4a63] transition-colors hover:text-[#1c4d9c]"
                    >
                      Accredited Practitioner
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
                      href="/sample"
                      className="text-[#3a4a63] transition-colors hover:text-[#1c4d9c]"
                    >
                      Sample AFSS
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/about"
                      className="text-[#3a4a63] transition-colors hover:text-[#1c4d9c]"
                    >
                      About Us
                    </Link>
                  </li>
                </ul>

                <div className="mt-8 pt-6 border-t border-[rgba(11,29,54,0.05)]">
                  <h3 className="text-[1rem] font-extrabold text-[#0b1d36] mb-4">Socials</h3>
                  <div className="flex items-center gap-5 sm:gap-6 text-[#0b1d36]">
                    <a href="https://www.facebook.com/profile.php?id=61566630403365" target="_blank" rel="noreferrer" aria-label="Facebook" className="hover:text-[#1c4d9c] transition-colors"><FacebookIcon size={16} /></a>
                    <a href="https://www.youtube.com/@allfireservices" target="_blank" rel="noreferrer" aria-label="YouTube" className="hover:text-[#1c4d9c] transition-colors"><YoutubeIcon size={18} /></a>
                    <a href="https://au.linkedin.com/allfire-services-sydney-92690516" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="hover:text-[#1c4d9c] transition-colors"><LinkedinIcon size={16} /></a>
                    <a href="https://www.instagram.com/_allfireservices_/" target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-[#1c4d9c] transition-colors"><InstagramIcon size={16} /></a>
                    <a href="https://tiktok.com/@allfireservices" target="_blank" rel="noreferrer" aria-label="TikTok" className="hover:text-[#1c4d9c] transition-colors"><TikTokIcon size={16} /></a>
                    <a href="https://x.com/Allfiresydney" target="_blank" rel="noreferrer" aria-label="X (Twitter)" className="hover:text-[#1c4d9c] transition-colors"><XIcon size={14} /></a>
                    <a href={`mailto:${SITE_EMAIL}`} aria-label="Email" className="hover:text-[#1c4d9c] transition-colors"><Mail size={18} strokeWidth={2.5} /></a>
                  </div>
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
            Specialist AFSS support for NSW.
          </p>
        </div>
      </div>
    </footer>
  );
}
