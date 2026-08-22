"use client";

import { ArrowRight, Target, CalendarCheck, ShieldCheck } from "lucide-react";
import RevealOnView from "@/components/RevealOnView";

/**
 * AFSS homepage — 09 / Accredited Practitioners.
 *
 * Three principles. Link to the FPAA public register for verification.
 * The previous design used an image with a practitioner figure; here we
 * keep the section text-first, no All Fire imagery.
 */

const principles = [
  {
    icon: Target,
    title: "The right scope.",
    desc: "The Fire Safety Schedule identifies which measures apply to your building and the standard they must meet.",
  },
  {
    icon: ShieldCheck,
    title: "The right accreditation.",
    desc: "Where the assessment function is covered by an approved accreditation scheme, the work must be performed by an appropriately accredited practitioner for that function.",
  },
  {
    icon: CalendarCheck,
    title: "The right status.",
    desc: "Verify a practitioner&rsquo;s current accreditation on the public register before engaging them.",
  },
];

export default function AccreditedPractitioners() {
  return (
    <section className="bg-white section-y-tight w-full overflow-hidden">
      <div className="container-inner">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-start">
          <div>
            <RevealOnView>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#b0141f] text-white font-bold text-[0.85rem] px-2 py-0.5 rounded-[3px] leading-tight">
                  09
                </div>
                <span className="text-[#1c4d9c] font-bold text-[0.85rem] tracking-[0.15em] uppercase">
                  / ACCREDITED PRACTITIONERS
                </span>
              </div>
              <h2 className="h-section">
                The right scope.
                <br />
                The right <span className="text-[#b0141f]">assessment.</span>
              </h2>
              <div className="w-12 h-[3px] bg-[#b0141f] mt-6 mb-6" />
              <p className="text-body max-w-[36rem]">
                The applicable fire safety measures identified on your
                Fire Safety Schedule must be assessed by appropriately
                accredited practitioners where an approved accreditation
                scheme covers the relevant assessment function. The
                practitioner&rsquo;s accreditation should cover the
                function relevant to the measure being assessed.
              </p>
            </RevealOnView>

            <RevealOnView delay={120}>
              <a
                href="https://connect.fpaa.com.au/FireSafetyAssessors"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 btn btn-dark rounded-full inline-flex"
              >
                Check practitioner accreditation
                <ArrowRight size={14} strokeWidth={2.4} aria-hidden="true" />
              </a>
            </RevealOnView>
          </div>

          <RevealOnView delay={140}>
            <ul className="flex flex-col">
              {principles.map((p, i) => {
                const Icon = p.icon;
                return (
                  <li
                    key={p.title}
                    className={`py-7 border-t border-[#e3e7ee] ${
                      i === principles.length - 1 ? "border-b" : ""
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span className="flex-none w-12 h-12 rounded-full bg-[#e7eef9] text-[#b0141f] flex items-center justify-center">
                        <Icon size={20} strokeWidth={1.6} />
                      </span>
                      <div>
                        <h3 className="text-[1.05rem] font-extrabold text-[#0b1d36] leading-tight">
                          {p.title}
                        </h3>
                        <p className="mt-1.5 text-[0.92rem] text-[#3a4a63] leading-[1.55] max-w-[34rem]">
                          {p.desc}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </RevealOnView>
        </div>
      </div>
    </section>
  );
}