"use client";

import { ArrowRight, Phone, Mail } from "lucide-react";
import RevealOnView from "@/components/RevealOnView";
import { openInstantQuote } from "@/lib/quote/open";
import { SITE_PHONE, SITE_EMAIL, SITE_PHONE_TEL } from "@/lib/site";

/**
 * AFSS homepage — Final CTA.
 *
 * Closing section. "Your AFSS due? Let's get it sorted." Primary CTA
 * opens the Instant Quote modal; secondary offers call / email contact.
 */

export default function FinalCTA() {
  const phoneTel = SITE_PHONE_TEL?.replace(/[^+\d]/g, "") ?? "1300765594";

  return (
    <section className="relative bg-[#0b1d36] text-white section-y-tight w-full overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.18] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse 60% 70% at 50% 50%, #000 35%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 70% at 50% 50%, #000 35%, transparent 80%)",
        }}
      />
      <div className="container-inner relative">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-center">
          <RevealOnView>
            <div className="flex items-center gap-3 mb-5">
              <span
                className="w-2 h-2 bg-[#b0141f]"
                aria-hidden="true"
              />
              <span className="text-xs font-bold tracking-[0.18em] uppercase text-[#7aa6e6]">
                Your AFSS due?
              </span>
            </div>
            <h2 className="h-section h-section--light">
              Your AFSS due?
              <br />
              <span
                style={{
                  background:
                    "linear-gradient(90deg, #ffffff 0%, #7aa6e6 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  color: "transparent",
                  display: "inline-block",
                }}
              >
                Let's get it{" "}
              </span>
              <span className="text-[#b0141f]">sorted.</span>
            </h2>
            <p className="mt-5 text-[1.05rem] text-white/80 max-w-[36rem] leading-[1.55]">
              Start your AFSS quote online, or talk to us if you&rsquo;d
              prefer some help first.
            </p>
          </RevealOnView>

          <RevealOnView delay={120}>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => openInstantQuote({ source: "final_cta" })}
                className="btn rounded-full w-full"
                style={{
                  background: "#ffffff",
                  color: "#0b1d36",
                  borderColor: "#ffffff",
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  padding: "1rem 1.5rem",
                  fontSize: "1rem",
                  minHeight: "3.5rem",
                }}
              >
                Get my AFSS quote
                <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
              </button>
              <a
                href={`tel:${phoneTel}`}
                className="btn rounded-full w-full"
                style={{
                  background: "transparent",
                  color: "#ffffff",
                  borderColor: "rgba(255,255,255,0.4)",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  padding: "0.9rem 1.4rem",
                  fontSize: "0.95rem",
                  minHeight: "3.25rem",
                }}
              >
                <Phone size={14} strokeWidth={2.2} aria-hidden="true" />
                Talk to us — {SITE_PHONE}
              </a>
              <a
                href={`mailto:${SITE_EMAIL}`}
                className="btn rounded-full w-full"
                style={{
                  background: "transparent",
                  color: "#ffffff",
                  borderColor: "rgba(255,255,255,0.2)",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  padding: "0.9rem 1.4rem",
                  fontSize: "0.95rem",
                  minHeight: "3.25rem",
                }}
              >
                <Mail size={14} strokeWidth={2.2} aria-hidden="true" />
                {SITE_EMAIL}
              </a>
            </div>
          </RevealOnView>
        </div>
      </div>
    </section>
  );
}