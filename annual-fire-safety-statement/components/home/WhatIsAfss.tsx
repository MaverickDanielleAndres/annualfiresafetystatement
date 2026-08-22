"use client";

import Image from "next/image";
import RevealOnView from "@/components/RevealOnView";
import {
  Building2,
  Users,
  Calendar,
  ClipboardCheck,
  HardHat,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

/**
 * AFSS homepage — 06 / What is an AFSS?
 *
 * Left: Title, text, and 05image.png
 * Right: 6 numbered facts in a grid, followed by a full-width bottom card.
 */

const facts = [
  {
    num: "01",
    title: "For existing buildings",
    desc: "Annual Fire Safety Statements relate to applicable essential fire safety measures in existing buildings where a Fire Safety Schedule or other applicable fire safety requirements apply.",
    Icon: Building2,
  },
  {
    num: "02",
    title: "Who it applies to",
    desc: "The owner of the building to which the measures apply, or an authorised agent acting on the owner's behalf.",
    Icon: Users,
  },
  {
    num: "03",
    title: "How often",
    desc: "Generally every 12 months, for the current year. It must be submitted to council before the due date.",
    Icon: Calendar,
  },
  {
    num: "04",
    title: "Based on the Fire Safety Schedule",
    desc: "The Schedule identifies the measures and minimum standards of performance that apply to the building.",
    Icon: ClipboardCheck,
  },
  {
    num: "05",
    title: "Who performs the assessment",
    desc: "Where the relevant function is covered by an approved accreditation scheme, the assessment is performed by an appropriately accredited practitioner for that function.",
    Icon: HardHat,
  },
  {
    num: "06",
    title: "Who is responsible",
    desc: "The building owner is responsible for ensuring the required AFSS is issued and provided within the required timeframe.",
    Icon: ShieldCheck,
  },
];

export default function WhatIsAfss() {
  return (
    <section
      id="what-is-afss"
      className="bg-white section-y-tight w-full overflow-hidden"
    >
      <div className="container-inner">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">
          {/* LEFT COLUMN */}
          <div className="w-full lg:w-[38%] flex-shrink-0">
            <RevealOnView>
              {/* Badge & Subtitle */}
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#b0141f] text-white font-bold text-[0.85rem] px-2 py-0.5 rounded-[3px] leading-tight">
                  06
                </div>
                <span className="text-[#1c4d9c] font-bold text-[0.85rem] tracking-[0.15em] uppercase">
                  / WHAT IS AN AFSS?
                </span>
              </div>
              
              {/* Headline */}
              <h2 className="h-section">
                What is an Annual<br />Fire Safety <span className="text-[#b0141f]">Statement?</span>
              </h2>
              
              {/* Red Divider */}
              <div className="w-12 h-[3px] bg-[#b0141f] mt-8 mb-8" />
              
              {/* Paragraph */}
              <p className="text-[#3a4a63] text-[1.05rem] leading-[1.65] max-w-[28rem]">
                An Annual Fire Safety Statement (AFSS) is a statement issued by
                or on behalf of a building owner confirming that the applicable
                essential fire safety measures have been assessed and that the
                required inspection and assessment requirements have been completed.
              </p>
            </RevealOnView>

            <RevealOnView delay={120} className="mt-12 lg:mt-16 relative">
              {/* Image from public folder matching the prompt request */}
              <div 
                className="relative w-full aspect-[4/3]"
                style={{
                  maskImage: 'linear-gradient(to right, black 80%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to right, black 80%, transparent 100%)'
                }}
              >
                <Image
                  src="/05image.png"
                  alt="Sample NSW Annual Fire Safety Statement"
                  fill
                  sizes="(max-width: 1024px) 100vw, 500px"
                  className="object-contain object-left-top drop-shadow-xl"
                  priority
                />
              </div>
            </RevealOnView>
          </div>

          {/* RIGHT COLUMN */}
          <div className="w-full lg:w-[62%]">
            <RevealOnView delay={80}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                {facts.map((fact, index) => {
                  const Icon = fact.Icon;
                  // Add top border only for items beyond the first row (index 2+)
                  const borderClass = index >= 2 ? "pt-10 border-t border-[#e3e7ee]" : "";
                  
                  return (
                    <div key={fact.num} className={`flex gap-5 items-start ${borderClass}`}>
                      {/* Icon Container */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#f0f4f8] flex items-center justify-center text-[#b0141f]">
                        <Icon size={22} strokeWidth={1.8} />
                      </div>
                      
                      {/* Text Content */}
                      <div>
                        <div className="text-[#b0141f] text-[0.8rem] font-bold tracking-[0.1em] mb-1.5">
                          {fact.num}
                        </div>
                        <h3 className="text-[#0b1d36] text-[1.05rem] font-bold leading-tight mb-2">
                          {fact.title}
                        </h3>
                        <p className="text-[#5b6a82] text-[0.95rem] leading-[1.6]">
                          {fact.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}

              </div>
            </RevealOnView>
          </div>
        </div>

        {/* Bottom Card (Spans full width) */}
        <RevealOnView delay={160}>
          <div className="mt-12 lg:mt-20">
            <div className="bg-white border border-[#eef1f6] rounded-[1rem] shadow-[0_8px_30px_rgba(11,29,54,0.04)] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 transition-transform hover:-translate-y-1 duration-300">
              <div className="flex items-center gap-5">
                <div className="flex-shrink-0 w-14 h-14 rounded-full border-2 border-[#f0f4f8] bg-white flex items-center justify-center text-[#b0141f]">
                  <ShieldCheck size={26} strokeWidth={2} />
                </div>
                <div>
                  <h4 className="text-[#0b1d36] font-bold text-[1.1rem]">
                    AFSS keeps your building compliant and people safe.
                  </h4>
                  <p className="text-[#5b6a82] text-[0.95rem] mt-1.5">
                    Stay up to date, meet your obligations and maintain a safe environment for everyone.
                  </p>
                </div>
              </div>
              
              <a
                href="#"
                className="flex-shrink-0 flex items-center gap-2 text-[#b0141f] font-bold hover:text-[#8a0f18] transition-colors whitespace-nowrap"
              >
                Learn more <ArrowRight size={18} strokeWidth={2.5} />
              </a>
            </div>
          </div>
        </RevealOnView>
      </div>
    </section>
  );
}