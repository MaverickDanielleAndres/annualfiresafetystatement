"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, ShieldCheck, BadgeCheck, Clock } from "lucide-react";
import InstantQuoteModal from "@/components/quote/InstantQuoteModal";
import { onInstantQuoteOpen, type InstantQuoteSource } from "@/lib/quote/open";
import { api } from "@/components/quote/api";

/**
 * AFSS homepage — Hero.
 *
 * One H1: "Annual Fire Safety Statement (AFSS)".
 * Above-the-fold quote starter (First name / Email / Mobile) calls the
 * existing /api/afss/quote/contact endpoint. On success, the existing
 * Instant Quote modal opens — it will land on step 2 (Building) because
 * the contact endpoint already advances `current_step` to `property`.
 * No duplicate session is created.
 *
 * The right column shows the recognisable NSW AFSS document as three
 * overlapping pages. The same asset is used across the site for visual
 * continuity.
 *
 * The modal is mounted by the Hero so any caller across the page
 * (header, footer, sections) can open the same instance.
 */

type Status = "idle" | "saving" | "saved" | "error";

export default function Hero() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSource, setModalSource] = useState<InstantQuoteSource>("hero");

  useEffect(() => {
    return onInstantQuoteOpen(({ source }) => {
      setModalSource(source);
      setModalOpen(true);
    });
  }, []);

  return (
    <>
      <section
        className="relative w-full bg-white overflow-hidden"
        aria-labelledby="afss-hero-title"
      >
        {/* Quiet document grid */}
        <div
          className="absolute inset-0 opacity-[0.35] pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(11, 29, 54, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(11, 29, 54, 0.05) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage:
              "radial-gradient(ellipse 80% 70% at 75% 30%, #000 35%, transparent 80%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 70% at 75% 30%, #000 35%, transparent 80%)",
          }}
        />

        <div className="container-inner relative pt-2 pb-12 lg:pt-4 lg:pb-20">
          <div className="grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-start">
            {/* LEFT — copy + quote starter */}
            <div className="flex flex-col items-start text-left max-w-[36rem]">
              <div className="flex items-center gap-3 mb-5">
                <span
                  className="w-2.5 h-2.5 bg-[#b0141f]"
                  aria-hidden="true"
                />
                <span className="text-xs font-bold tracking-[0.18em] uppercase text-[#1c4d9c]">
                  Annual Fire Safety Statements · Sydney NSW
                </span>
              </div>

              <h1
                id="afss-hero-title"
                className="text-[clamp(2.1rem,4.6vw,3.85rem)] font-extrabold tracking-tight leading-[1.0] text-[#0b1d36] m-0"
                style={{ textWrap: "balance" }}
              >
                Annual Fire Safety
                <br />
                Statement <span className="text-[#b0141f]">(AFSS).</span>
              </h1>

              <p className="mt-5 text-[1.05rem] md:text-[1.18rem] font-medium text-[#3a4a63] leading-[1.55] max-w-[34rem]">
                Get your Annual Fire Safety Statement organised without the
                runaround. From reviewing your Fire Safety Schedule
                through assessment and statement preparation, we help make
                the AFSS process clear and straightforward.
              </p>

              {/* Quote starter */}
              <HeroQuoteStarter
                onSaved={() => {
                  setModalSource("hero");
                  setModalOpen(true);
                }}
              />

              {/* Trust strip */}
              <div className="mt-6 flex flex-col items-center w-full max-w-[34rem] gap-y-3 text-[#3a4a63]">
                <TrustItem
                  icon={<BadgeCheck size={16} strokeWidth={2} />}
                  label="Appropriately accredited practitioners for the relevant assessment functions"
                />
                <TrustItem
                  icon={<ShieldCheck size={16} strokeWidth={2} />}
                  label="NSW-focused — built around current NSW AFSS requirements"
                />
                <TrustItem
                  icon={<Clock size={16} strokeWidth={2} />}
                  label="Clear process — know what happens at every stage"
                />
              </div>
            </div>

            {/* RIGHT — AFSS document stack */}
            <div className="relative w-full lg:sticky lg:top-32 self-start min-w-0">
              <AfssDocumentStack />
            </div>
          </div>
        </div>
      </section>

      <InstantQuoteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}

function HeroQuoteStarter({ onSaved }: { onSaved: () => void }) {
  const formId = useId();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "saving") return;
    setError(null);

    if (firstName.trim().length < 2) {
      setError("Please enter your first name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (mobile.replace(/\D/g, "").length < 8) {
      setError("Please enter a valid mobile number.");
      return;
    }

    setStatus("saving");
    const res = await api.post<{ ok: true }>("/api/afss/quote/contact", {
      first_name: firstName.trim(),
      email: email.trim(),
      mobile: mobile.trim(),
      utm: readUtm(),
      landing_path:
        typeof window !== "undefined" ? window.location.pathname : null,
      source: "hero_quote_starter",
    });
    if (!res.ok) {
      setStatus("error");
      setError(res.error);
      return;
    }
    setStatus("saved");
    onSaved();
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="mt-7 w-full max-w-[34rem] rounded-[0.25rem] border border-[#e3e7ee] bg-white shadow-[0_8px_24px_rgba(11,29,54,0.08)]"
      aria-labelledby={`${formId}-title`}
    >
      <div className="px-4 pt-4 pb-2 border-b border-[#eef1f6] flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-[#b0141f]" aria-hidden="true" />
        <span
          id={`${formId}-title`}
          className="text-[0.7rem] font-bold tracking-[0.18em] uppercase text-[#0b1d36]"
        >
          Get your AFSS quote
        </span>
        <span className="ml-auto text-[0.7rem] text-[#5b6a82] font-semibold">
          Takes about 2 minutes
        </span>
      </div>

      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-[0.78rem] font-bold text-[#0b1d36] tracking-wide">
            First name
          </span>
          <input
            type="text"
            required
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={status === "saving"}
            placeholder="e.g. Sam"
            className="w-full min-h-[2.75rem] px-3 py-2 rounded-[0.25rem] border border-[#d8dde6] bg-white text-[#0b1d36] text-[0.95rem] focus:outline-none focus:border-[#1c4d9c] focus:ring-2 focus:ring-[rgba(28,77,156,0.18)] disabled:opacity-60"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[0.78rem] font-bold text-[#0b1d36] tracking-wide">
            Email
          </span>
          <input
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "saving"}
            placeholder="name@example.com"
            className="w-full min-h-[2.75rem] px-3 py-2 rounded-[0.25rem] border border-[#d8dde6] bg-white text-[#0b1d36] text-[0.95rem] focus:outline-none focus:border-[#1c4d9c] focus:ring-2 focus:ring-[rgba(28,77,156,0.18)] disabled:opacity-60"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[0.78rem] font-bold text-[#0b1d36] tracking-wide">
            Mobile
          </span>
          <input
            type="tel"
            required
            autoComplete="tel"
            inputMode="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            disabled={status === "saving"}
            placeholder="0400 000 000"
            className="w-full min-h-[2.75rem] px-3 py-2 rounded-[0.25rem] border border-[#d8dde6] bg-white text-[#0b1d36] text-[0.95rem] focus:outline-none focus:border-[#1c4d9c] focus:ring-2 focus:ring-[rgba(28,77,156,0.18)] disabled:opacity-60"
          />
        </label>
      </div>

      <div className="px-4 pb-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <button
          type="submit"
          disabled={status === "saving"}
          className="btn btn-dark rounded-full w-full sm:w-auto sm:flex-none"
          style={{ minWidth: "12rem" }}
        >
          {status === "saving" ? "Saving…" : "Start my quote"}
          <ArrowRight
            size={14}
            strokeWidth={2.4}
            aria-hidden="true"
            className="ml-1"
          />
        </button>
        <p className="m-0 text-[0.78rem] text-[#5b6a82] font-medium">
          Saved securely. No account required.
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="px-4 pb-3 text-[0.82rem] text-[#b0141f] font-semibold"
        >
          {error}
        </p>
      )}
    </form>
  );
}

function TrustItem({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 text-[0.85rem] font-semibold text-[#3a4a63]">
      <span className="text-[#1c4d9c]">{icon}</span>
      {label}
    </span>
  );
}

function AfssDocumentStack() {
  // Three overlapping AFSS document pages. Real AFSS asset already in
  // public/; we stack them with rotation and depth.
  return (
    <div
      className="relative w-full max-w-[600px] mx-auto aspect-[5/6]"
      role="img"
      aria-label="Sample NSW Annual Fire Safety Statement — pages 1, 2 and 3"
    >
      {/* Page 3 (back) */}
      <div
        className="absolute left-[6%] top-[3%] w-[78%] aspect-[3/4] rotate-[-7deg] bg-white border border-[#e3e7ee] shadow-[0_24px_50px_rgba(11,29,54,0.18)] rounded-[0.125rem] overflow-hidden"
        aria-hidden="true"
      >
        <Image
          src="/sampleafss-nobg.png"
          alt=""
          fill
          sizes="(max-width: 1024px) 70vw, 500px"
          className="object-cover"
        />
      </div>

      {/* Page 2 (middle) */}
      <div
        className="absolute left-[10%] top-[6%] w-[78%] aspect-[3/4] rotate-[-2deg] bg-white border border-[#e3e7ee] shadow-[0_28px_60px_rgba(11,29,54,0.22)] rounded-[0.125rem] overflow-hidden"
        aria-hidden="true"
      >
        <Image
          src="/sampleafss-nobg.png"
          alt=""
          fill
          sizes="(max-width: 1024px) 70vw, 500px"
          className="object-cover"
        />
      </div>

      {/* Page 1 (front, with navy + red rule) */}
      <div
        className="absolute left-[14%] top-[8%] w-[78%] aspect-[3/4] bg-white border border-[#e3e7ee] shadow-[0_32px_70px_rgba(11,29,54,0.28)] rounded-[0.125rem] overflow-hidden"
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            height: "4px",
            background:
              "linear-gradient(to right, #0b1d36 0%, #0b1d36 78%, #b0141f 78%, #b0141f 100%)",
          }}
        />
        <div className="absolute inset-0">
          <Image
            src="/sampleafss-nobg.png"
            alt="NSW Annual Fire Safety Statement — page 1"
            fill
            sizes="(max-width: 1024px) 70vw, 500px"
            className="object-cover"
            priority
          />
        </div>
      </div>
    </div>
  );
}

function readUtm(): Record<string, string | null> {
  if (typeof window === "undefined") return {};
  const sp = new URLSearchParams(window.location.search);
  return {
    source: sp.get("utm_source"),
    medium: sp.get("utm_medium"),
    campaign: sp.get("utm_campaign"),
    term: sp.get("utm_term"),
    content: sp.get("utm_content"),
  };
}