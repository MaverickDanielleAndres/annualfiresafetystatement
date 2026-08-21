"use client";

import RevealOnView from "@/components/RevealOnView";
import partners, { hasPartners } from "@/data/partners";

/**
 * AFSS homepage — 10 / Partners.
 *
 * Data-driven from data/partners.ts. Empty-safe. Never claim NSW
 * Government is a partner; never display industry logos merely
 * because we refer to their guidance or register.
 */

export default function Partners() {
  // Hide the section entirely until approved partner data exists.
  if (!hasPartners) return null;

  return (
    <section className="bg-white section-y-tight w-full overflow-hidden">
      <div className="container-inner">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 lg:mb-10 gap-6">
          <div className="flex-1">
            <RevealOnView>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#b0141f] text-white font-bold text-[0.85rem] px-2 py-0.5 rounded-[3px] leading-tight">
                  10
                </div>
                <span className="text-[#1c4d9c] font-bold text-[0.85rem] tracking-[0.15em] uppercase">
                  / WHO WE WORK WITH
                </span>
              </div>
              <h2 className="h-section">Who we work <span className="text-[#b0141f]">with.</span></h2>
            </RevealOnView>
          </div>
          <div className="flex-1 lg:max-w-md">
            <RevealOnView delay={80}>
              <p className="text-body">
                The AFSS process often involves building owners, strata
                managers, property managers, facilities teams and fire
                safety practitioners.
              </p>
              <p className="text-body mt-3">
                Approved partner information will be added here once
                confirmed.
              </p>
            </RevealOnView>
          </div>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-2 lg:gap-y-0">
          {partners.map((p, i) => (
            <RevealOnView
              key={`${p.name}-${i}`}
              delay={i * 50}
              as="li"
              className="py-5 lg:py-7 border-t border-[#eef1f6]"
            >
              <span className="text-[0.7rem] font-mono font-bold tracking-[0.06em] text-[#1c4d9c] uppercase">
                {p.category}
              </span>
              <h3 className="mt-1.5 text-[1.05rem] font-extrabold text-[#0b1d36] leading-tight">
                {p.name}
              </h3>
              {p.relationship && (
                <p className="mt-1 text-[0.88rem] text-[#3a4a63] leading-[1.55]">
                  {p.relationship}
                </p>
              )}
            </RevealOnView>
          ))}
        </ul>
      </div>
    </section>
  );
}