"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Phone } from "lucide-react";
import { SITE_PHONE, SITE_PHONE_TEL, navLinks } from "@/lib/site";
import { FacebookIcon, InstagramIcon, LinkedinIcon, YoutubeIcon, TikTokIcon, XIcon } from "./SocialIcons";

export default function Header() {
  return (
    <>
      <HeaderShell />
      <div className="navbar-spacer" aria-hidden="true" />
    </>
  );
}

function HeaderShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const toggleButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("mobile-menu-open");
    } else {
      document.body.style.overflow = "";
      document.body.classList.remove("mobile-menu-open");
    }
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("mobile-menu-open");
    };
  }, [mobileOpen]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        toggleButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  // Close the mobile menu on route change.
  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const closeMenus = () => setMobileOpen(false);

  return (
    <header id="afss-header" className="navbar-shell">
      <div className={`navbar-topbar bg-[#111111] text-white ${isScrolled ? "is-scrolled" : ""}`}>
        <div className="navbar-topbar-left">
          <a href={`tel:${SITE_PHONE_TEL?.replace(/[^+\d]/g, "") ?? "1300765594"}`}>
            <Phone size={14} /> {SITE_PHONE}
          </a>
          <a href="mailto:admin@annualfiresafetystatement.com.au">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            admin@annualfiresafetystatement.com.au
          </a>
        </div>
        <div className="navbar-topbar-right flex items-center gap-4">
          <span className="navbar-topbar-tag hidden sm:inline-block mr-2">NSW ACCREDITED PRACTITIONERS</span>
          <a href="https://www.facebook.com/profile.php?id=61566630403365" target="_blank" rel="noreferrer" aria-label="Facebook" className="hover:text-[#d64114] transition-colors"><FacebookIcon size={14} /></a>
          <a href="https://www.instagram.com/_allfireservices_/" target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-[#d64114] transition-colors"><InstagramIcon size={14} /></a>
          <a href="https://au.linkedin.com/in/allfire-services-sydney-92690516" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="hover:text-[#d64114] transition-colors"><LinkedinIcon size={14} /></a>
          <a href="https://www.youtube.com/@allfireservices" target="_blank" rel="noreferrer" aria-label="YouTube" className="hover:text-[#d64114] transition-colors"><YoutubeIcon size={14} /></a>
          <a href="https://tiktok.com/@allfireservices" target="_blank" rel="noreferrer" aria-label="TikTok" className="hover:text-[#d64114] transition-colors"><TikTokIcon size={13} /></a>
          <a href="https://x.com/Allfiresydney" target="_blank" rel="noreferrer" aria-label="X (Twitter)" className="hover:text-[#d64114] transition-colors"><XIcon size={13} /></a>
        </div>
      </div>

      <div className="navbar-inner">
        <Link href="/" className="navbar-brand" onClick={closeMenus}>
          <Image 
            src="/logo.png" 
            alt="Annual Fire Safety Statement" 
            width={300} 
            height={60} 
            style={{ height: "55px", width: "auto" }} 
            priority
          />
        </Link>

        <ul className="navbar-nav">
          {navLinks.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`navbar-link ${isActive(item.href) ? "is-active" : ""}`}
                onClick={closeMenus}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="navbar-actions">
          <Link
            href="/free-quote"
            className="btn animate-pump navbar-cta bg-gradient-to-r from-[#ff5614] to-[#ffad05] !text-white border-none shadow-sm hover:scale-105 transition-transform"
            onClick={closeMenus}
          >
            BOOK THE BOSS
          </Link>
        </div>

        <button
          ref={toggleButtonRef}
          className="navbar-mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
          aria-controls="navbar-mobile-panel"
        >
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      <div
        id="navbar-mobile-panel"
        className={`navbar-mobile-panel ${mobileOpen ? "is-open" : ""}`}
        aria-hidden={!mobileOpen}
      >
        {navLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="navbar-mobile-link"
            onClick={closeMenus}
          >
            {item.label}
          </Link>
        ))}
        <div className="navbar-mobile-cta-wrap">
          <a
            href={`tel:${SITE_PHONE_TEL?.replace(/[^+\d]/g, "") ?? "1300765594"}`}
            className="btn btn-secondary"
            style={{ borderRadius: 999, flex: 1 }}
          >
            Call {SITE_PHONE}
          </a>
          <Link
            href="/free-quote"
            className="btn bg-gradient-to-r from-[#ff5614] to-[#ffad05] !text-white border-none"
            style={{ borderRadius: 999, flex: 1 }}
            onClick={closeMenus}
          >
            Get a free quote
          </Link>
        </div>
      </div>
    </header>
  );
}
