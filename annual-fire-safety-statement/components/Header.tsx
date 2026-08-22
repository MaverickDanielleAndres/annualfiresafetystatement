"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, ArrowRight } from "lucide-react";
import { SITE_PHONE, SITE_PHONE_TEL, navLinks } from "@/lib/site";
import { openInstantQuote } from "@/lib/quote/open";
import { hasProjects } from "@/data/projects";

/**
 * AFSS — global header.
 *
 * Lean, AFSS-only navigation. No socials, no parent-brand cross-promotion.
 * Anchored to the homepage section anchors; the same anchor links work
 * site-wide because Next.js navigates to "/" + scrolls.
 */

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
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null);
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

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Track the current URL hash in state so the active-link styling
  // matches on the server (where window is undefined) and on the first
  // client render. We deliberately avoid reading window.location.hash
  // during render — that caused a hydration mismatch when navigating
  // directly to `/#how-it-works`.
  const [currentHash, setCurrentHash] = useState("");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => setCurrentHash(window.location.hash);
    update();
    window.addEventListener("hashchange", update);

    // Scroll spy to update active link based on current section
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCurrentHash(`#${entry.target.id}`);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );

    // Give DOM time to mount all sections
    setTimeout(() => {
      navLinks.forEach((link) => {
        if (link.anchor) {
          const id = link.href.split("#")[1];
          if (id) {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
          }
        }
      });
    }, 100);

    return () => {
      window.removeEventListener("hashchange", update);
      observer.disconnect();
    };
  }, []);

  const closeMenus = () => setMobileOpen(false);

  const isActive = (item: (typeof navLinks)[number]) => {
    if (!item.anchor) {
      if (item.href === "/") return pathname === "/";
      return pathname === item.href || pathname.startsWith(`${item.href}/`);
    }
    // Anchor links only "active" on /. Hash is read from state, which is
    // always "" on the first render (server + client) so the initial
    // hydration matches.
    if (pathname !== "/") return false;
    const hash = item.href.split("#")[1] ?? "";
    return currentHash === `#${hash}`;
  };

  // Hide nav items whose target section is currently not rendered.
  // Projects only renders when approved project data exists. When Pete
  // supplies data/projects.ts entries, the link returns automatically.
  const visibleNavLinks = navLinks.filter((item) => {
    if (item.href === "/#projects" && !hasProjects) return false;
    return true;
  });

  return (
    <header id="afss-header" className="navbar-shell">
      <div className="navbar-inner">
        <Link href="/" className="navbar-brand" onClick={closeMenus}>
          <Image
            src="/logo.png"
            alt="Annual Fire Safety Statement"
            width={300}
            height={60}
            style={{ height: "44px", width: "auto" }}
            priority
          />
        </Link>

        <ul className="navbar-nav">
          {visibleNavLinks.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`navbar-link ${isActive(item) ? "is-active" : ""}`}
                onClick={closeMenus}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="navbar-actions">
          <a
            href={`tel:${SITE_PHONE_TEL?.replace(/[^+\d]/g, "") ?? "1300765594"}`}
            className="navbar-phone hidden xl:inline-flex"
            aria-label={`Call ${SITE_PHONE}`}
          >
            <Phone size={14} strokeWidth={2.2} aria-hidden="true" />
            <span>{SITE_PHONE}</span>
          </a>
          <button
            type="button"
            className="navbar-cta"
            onClick={() => {
              closeMenus();
              openInstantQuote({ source: "header" });
            }}
          >
            <span>Get my AFSS quote</span>
            <ArrowRight size={14} strokeWidth={2.4} aria-hidden="true" />
          </button>
        </div>

        <button
          ref={toggleButtonRef}
          className="navbar-mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
          aria-controls="navbar-mobile-panel"
        >
          {mobileOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      <div
        id="navbar-mobile-panel"
        className={`navbar-mobile-panel ${mobileOpen ? "is-open" : ""}`}
        aria-hidden={!mobileOpen}
      >
        <nav aria-label="Primary">
          {visibleNavLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="navbar-mobile-link"
              onClick={closeMenus}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="navbar-mobile-cta-wrap">
          <a
            href={`tel:${SITE_PHONE_TEL?.replace(/[^+\d]/g, "") ?? "1300765594"}`}
            className="btn btn-secondary"
            style={{ borderRadius: 999, flex: 1 }}
          >
            Call {SITE_PHONE}
          </a>
          <button
            type="button"
            className="btn btn-dark"
            style={{ borderRadius: 999, flex: 1 }}
            onClick={() => {
              closeMenus();
              openInstantQuote({ source: "header_mobile" });
            }}
          >
            Get my AFSS quote
          </button>
        </div>
      </div>
    </header>
  );
}