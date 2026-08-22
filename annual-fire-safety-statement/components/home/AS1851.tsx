"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, CalendarCheck } from "lucide-react";
import RevealOnView from "@/components/RevealOnView";

/**
 * AFSS homepage — 11 / AS 1851-2012.
 *
 * Supporting section. Distinguishes AS 1851-2012 (routine servicing /
 * maintenance) from the AFSS (annual assessment + statement).
 */

const checks = [
  "INSPECT",
  "TEST",
  "MAINTAIN",
  "KEEP RECORDS",
];

export default function AS1851() {
  return (
    <section className="bg-white section-y-tight w-full overflow-hidden">
      <div className="container-inner">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 lg:items-stretch items-center">
          {/* LEFT — image + date card */}
          <RevealOnView className="relative w-full lg:h-full">
            <div className="relative w-full h-full min-h-[300px] lg:min-h-0 aspect-[5/4] lg:aspect-auto rounded-[0.25rem] overflow-hidden border border-[#e3e7ee] shadow-[0_18px_44px_rgba(11,29,54,0.18)]">
              <Image
                src="/09image.png"
                alt="Fire safety maintenance — routine inspection of NSW building systems"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 bg-white/95 backdrop-blur-md rounded-[0.25rem] shadow-xl border border-[#e3e7ee] p-4 sm:p-5 flex flex-col items-start max-w-[260px]">
                <CalendarCheck
                  className="text-[#0b1d36] mb-2"
                  size={22}
                  strokeWidth={1.6}
                />
                <span className="text-[1.4rem] font-extrabold text-[#1c4d9c] leading-none tracking-tight">
                  13 Feb 2026
                </span>
                <div className="w-full h-px bg-[#e3e7ee] my-2" />
                <p className="text-[0.78rem] font-semibold text-[#0b1d36] leading-[1.4]">
                  Mandatory maintenance requirements commenced in NSW.
                </p>
              </div>
            </div>
          </RevealOnView>

          {/* RIGHT — copy */}
          <div className="pl-0 lg:pl-2">
            <RevealOnView>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#b0141f] text-white font-bold text-[0.85rem] px-2 py-0.5 rounded-[3px] leading-tight">
                  11
                </div>
                <span className="text-[#1c4d9c] font-bold text-[0.85rem] tracking-[0.15em] uppercase">
                  / AS 1851-2012
                </span>
              </div>
              <h2 className="h-section">
                Fire safety maintenance
                <br />
                changed in <span className="text-[#b0141f]">NSW.</span>
              </h2>
              <div className="w-12 h-[3px] bg-[#b0141f] mt-6 mb-6" />
              <p className="text-body">
                From 13 February 2026, applicable NSW buildings must
                maintain essential fire safety measures in accordance
                with AS 1851-2012 where the Standard applies to the
                building.
              </p>
            </RevealOnView>

            <RevealOnView delay={120}>
              <ul className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {checks.map((c) => (
                  <li
                    key={c}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-[0.25rem] border border-[#e3e7ee] bg-white"
                  >
                    <span
                      aria-hidden="true"
                      className="w-5 h-5 rounded-full bg-[#0b1d36] text-white flex items-center justify-center flex-none"
                    >
                      <Check size={11} strokeWidth={3} />
                    </span>
                    <span className="text-[0.78rem] font-extrabold tracking-[0.04em] uppercase text-[#0b1d36]">
                      {c}
                    </span>
                  </li>
                ))}
              </ul>
            </RevealOnView>

            <RevealOnView delay={160}>
              <div className="mt-7 p-4 rounded-[0.25rem] bg-[#f5f7fa] border border-[#e3e7ee]">
                <p className="m-0 text-[0.92rem] font-semibold text-[#0b1d36] leading-snug">
                  AS 1851-2012 and your AFSS are related, but they are
                  different requirements.
                </p>
                <p className="mt-1 text-[0.85rem] text-[#3a4a63] leading-[1.55]">
                  AS 1851-2012 covers routine servicing and maintenance of
                  applicable systems throughout the year. The AFSS is a
                  separate annual assessment and statement process.
                </p>
              </div>
            </RevealOnView>

            <RevealOnView delay={200}>
              <Link
                href="/new-legislation"
                className="mt-6 btn btn-secondary rounded-full inline-flex"
              >
                Understand AS 1851-2012
                <ArrowRight size={14} strokeWidth={2.4} aria-hidden="true" />
              </Link>
            </RevealOnView>
          </div>
        </div>
      </div>
    </section>
  );
}