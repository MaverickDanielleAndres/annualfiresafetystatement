import Image from "next/image";
import Link from "next/link";
import FreeSiteVisitButton from "@/components/free-site-visit/FreeSiteVisitButton";
import { ArrowRight, ShieldCheck, FileText, Clock, BadgeCheck } from "lucide-react";

/**
 * New homepage hero.
 *
 * Concept: a "statement sheet" — half editorial, half official document.
 * Split composition: copy on the left, a structured AFSS statement panel on the right
 * that mimics the official NSW form aesthetic (top navy rule, optional red rule,
 * ruled fields, prescribed-tone typography). The whole hero is on a clean white
 * background with a faint blue document grid behind the panel.
 *
 * The orange-heavy CTA palette is replaced with deep navy / royal blue and a
 * single red rule detail — every interaction still leads to the same instant quote
 * flow used elsewhere on the site.
 */
export default function AfssHeroSection() {
  return (
    <section
      className="relative w-full bg-white"
      aria-labelledby="afss-hero-title"
    >
      {/* Subtle document grid behind the content */}
      <div
        className="absolute inset-0 opacity-[0.4] pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(11, 29, 54, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(11, 29, 54, 0.04) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 70% 30%, #000 35%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 70% 30%, #000 35%, transparent 80%)",
        }}
      />

      <div className="container-inner relative pt-4 pb-12 lg:pt-4 lg:pb-20">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16">
          {/* LEFT — copy */}
          <div className="flex flex-col items-center text-center lg:sticky lg:top-32 self-start w-full">
            <div className="flex items-center justify-center w-full gap-3 mb-5">
              <span className="w-2.5 h-2.5 bg-[#b0141f]" aria-hidden="true" />
              <span className="text-xs font-bold tracking-[0.18em] uppercase text-[#1c4d9c]">
                Annual Fire Safety Statement · NSW
              </span>
            </div>

            <h1
              id="afss-hero-title"
              className="text-[clamp(2.5rem,5vw,4.6rem)] font-extrabold tracking-tight leading-[0.98] text-[#0b1d36] m-0 text-center mx-auto"
              style={{ textWrap: "balance" }}
            >
              Your AFSS isn&apos;t
              <br />
              just paperwork.
              <br />
              <span
                className="inline-block mt-1"
                style={{
                  background: "linear-gradient(90deg, #0b1d36 0%, #1c4d9c 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  color: "transparent",
                }}
              >
                It&apos;s responsibility.
              </span>
            </h1>

            <p className="mt-7 text-lg md:text-xl font-medium text-[#3a4a63] leading-relaxed max-w-[34rem] text-center mx-auto">
              From your Fire Safety Schedule to assessment and statement,
              we make the AFSS process clear and straightforward.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center w-full gap-4">
              <FreeSiteVisitButton
                source="hero"
                pulse
                label="GET AN INSTANT QUOTE"
                className="btn btn-primary px-8 py-4 text-[0.95rem] tracking-[0.06em] font-bold uppercase rounded-full group shadow-md"
                trailingIcon={<span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>}
              />
              <Link
                href="/sample"
                className="inline-flex items-center gap-2 whitespace-nowrap px-8 py-4 text-[0.95rem] font-bold uppercase tracking-[0.06em] rounded-full text-[#1c4d9c] bg-transparent hover:bg-[#f5f7fa] transition-colors"
              >
                VIEW SAMPLE AFSS
                <ArrowRight size={16} strokeWidth={2.4} />
              </Link>
            </div>

            {/* Trust strip — quiet, document-style */}
            <div className="mt-10 flex flex-wrap items-center justify-center w-full gap-x-7 gap-y-3 text-[#3a4a63]">
              <TrustItem icon={<BadgeCheck size={16} strokeWidth={2} />} label="NSW Accredited Practitioners" />
              <TrustItem icon={<ShieldCheck size={16} strokeWidth={2} />} label="Compliant with current regulation" />
              <TrustItem icon={<Clock size={16} strokeWidth={2} />} label="Annual assurance, year after year" />
            </div>
          </div>

          {/* RIGHT — "Statement sheet" document panel */}
          <div className="relative w-full">
            {/* Faint numeric watermark */}
            <div
              className="absolute -top-6 -right-2 lg:-right-6 text-[110px] lg:text-[160px] font-black text-[#0b1d36]/[0.04] tracking-tighter leading-none select-none pointer-events-none"
              aria-hidden="true"
            >
              AFSS&#8202;/&#8202;01
            </div>

            <div className="relative doc-panel doc-panel--red-rule">
              {/* Document header strip */}
              <div className="doc-panel__header">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-[#b0141f]" aria-hidden="true" />
                  <FileText size={14} className="text-[#0b1d36]" aria-hidden="true" />
                  <p className="doc-panel__title">Annual Fire Safety Statement</p>
                </div>
                <span className="doc-panel__meta">FORM 01A · NSW</span>
              </div>

              {/* Document body */}
              <div className="doc-panel__body">
                <div className="flex items-baseline justify-between gap-4 mb-4">
                  <div className="flex flex-col">
                    <span className="text-[0.7rem] font-bold tracking-[0.16em] uppercase text-[#5b6a82]">
                      Property
                    </span>
                    <span className="text-[1rem] font-bold text-[#0b1d36] mt-1">
                      1 Sample Street, Sydney NSW 2000
                    </span>
                  </div>
                  <span className="text-[0.7rem] font-bold tracking-[0.16em] uppercase text-[#1c4d9c]">
                    CLASS 5 · OFFICE
                  </span>
                </div>

                <div className="cool-rule my-1" />

                {/* Sample AFSS preview image — same asset already used sitewide */}
                <div className="relative my-4 mx-auto w-full max-w-[360px] aspect-[3/4] rounded-[0.125rem] overflow-hidden border border-[#e3e7ee] bg-white">
                  <Image
                    src="/sampleafss-nobg.png"
                    alt="Sample NSW Annual Fire Safety Statement"
                    fill
                    sizes="(max-width: 1024px) 100vw, 360px"
                    className="object-cover"
                    priority
                  />
                </div>

                <div className="cool-rule my-1" />

                {/* Field grid */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-0">
                  <FieldRow num="01" label="Statement Type" value="Annual" />
                  <FieldRow num="02" label="Schedule Reference" value="FSS-2024-0118" />
                  <FieldRow num="03" label="Issue Date" value="13 Feb 2026" />
                  <FieldRow num="04" label="Practitioner" value="Accredited (Fire Safety)" />
                </div>

                {/* Footer band of the document */}
                <div className="mt-4 pt-3 border-t border-[#e3e7ee] flex items-center justify-between gap-3">
                  <span className="text-[0.7rem] font-bold tracking-[0.16em] uppercase text-[#5b6a82]">
                    Total measures
                  </span>
                  <span className="font-mono text-[0.85rem] font-bold text-[#0b1d36]">
                    12 verified
                  </span>
                  <span className="doc-chip doc-chip--blue">Compliant</span>
                </div>
              </div>
            </div>

            {/* Floating compliance summary card */}
            <div className="hidden md:block absolute -bottom-6 -left-6 lg:-left-10 w-[18rem] bg-white border border-[#e3e7ee] rounded-[0.375rem] p-4 shadow-[0_18px_42px_rgba(11,29,54,0.16)]">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 bg-[#b0141f]" aria-hidden="true" />
                <span className="text-[0.7rem] font-bold tracking-[0.16em] uppercase text-[#0b1d36]">
                  Submission Checklist
                </span>
              </div>
              <ul className="flex flex-col gap-1.5 text-[0.82rem] text-[#3a4a63]">
                <ChecklistRow label="Owner or agent details" />
                <ChecklistRow label="Building classification" />
                <ChecklistRow label="Fire safety measures" />
                <ChecklistRow label="Schedule of measures" />
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-[0.85rem] font-semibold text-[#3a4a63]">
      <span className="text-[#1c4d9c]">{icon}</span>
      {label}
    </span>
  );
}

function FieldRow({
  num,
  label,
  value,
}: {
  num: string;
  label: string;
  value: string;
}) {
  return (
    <div className="doc-field">
      <span className="doc-field__num">{num}</span>
      <div className="flex flex-col gap-0.5">
        <span className="doc-field__label">{label}</span>
        <span className="text-[0.78rem] text-[#3a4a63]">{value}</span>
      </div>
    </div>
  );
}

function ChecklistRow({ label }: { label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#0b1d36] text-white"
        aria-hidden="true"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
      <span>{label}</span>
    </li>
  );
}
