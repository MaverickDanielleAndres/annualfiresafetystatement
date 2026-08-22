"use client";

import { FileText, Search, AlertTriangle, FileCheck, Send } from "lucide-react";
import RevealOnView from "@/components/RevealOnView";

/**
 * AFSS homepage — 02 / How It Works.
 *
 * Five-step process timeline. Horizontal on desktop, vertical on
 * mobile. Connecting line sits behind the numeric badges.
 */

const steps = [
  {
    num: "01",
    icon: FileText,
    title: "Send us your documents",
    desc: "Start with your AFSS or Fire Safety Schedule.",
  },
  {
    num: "02",
    icon: Search,
    title: "Confirm your building",
    desc: "Tell us which property the statement relates to.",
  },
  {
    num: "03",
    icon: AlertTriangle,
    title: "Assess the applicable measures",
    desc: "Relevant fire safety measures are assessed against the standards that apply to the building.",
  },
  {
    num: "04",
    icon: FileCheck,
    title: "Address any issues",
    desc: "Items that do not meet the required standard may need to be rectified before the AFSS can be completed.",
  },
  {
    num: "05",
    icon: Send,
    title: "Prepare\nthe AFSS",
    desc: "Once applicable requirements are satisfied, the assessment information can be used to prepare the Annual Fire Safety Statement.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-white section-y-tight w-full overflow-hidden"
    >
      <div className="container-inner">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 lg:mb-10 gap-8">
          <div className="flex-1">
            <RevealOnView>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#b0141f] text-white font-bold text-[0.85rem] px-2 py-0.5 rounded-[3px] leading-tight">
                  02
                </div>
                <span className="text-[#1c4d9c] font-bold text-[0.85rem] tracking-[0.15em] uppercase">
                  / HOW IT WORKS
                </span>
              </div>
              <h2 className="h-section">
                Your AFSS,<br/>step by <span className="text-[#b0141f]">step.</span>
              </h2>
            </RevealOnView>
          </div>
          <div className="flex-1 lg:max-w-md lg:pt-8">
            <RevealOnView delay={80}>
              <p className="text-lg lg:text-xl text-[#0b1d36] font-medium leading-snug">
                A simple, transparent path from your Fire Safety Schedule
                through assessment and statement preparation.
              </p>
            </RevealOnView>
          </div>
        </div>

        <RevealOnView delay={120}>
          <ol className="relative grid grid-cols-1 md:grid-cols-5 gap-12 md:gap-3 lg:gap-4 mt-8">
            {/* Connecting line — desktop only */}
            <span
              aria-hidden="true"
              className="hidden md:block absolute left-[10%] right-[10%] top-[28px] h-px bg-[#b0141f]/40"
            />
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <li
                  key={s.num}
                  className="relative flex flex-col items-center text-center z-10"
                >
                  <span
                    aria-hidden="true"
                    className="flex-none w-14 h-14 rounded-full bg-white border-[1.5px] border-[#b0141f] text-[#b0141f] flex items-center justify-center z-20 mx-auto"
                  >
                    <Icon size={24} strokeWidth={1.5} />
                  </span>
                  
                  <div className="relative w-full flex flex-col items-center md:mt-2">
                    <span className="absolute top-[-0.5rem] md:top-[-1.5rem] left-1/2 -translate-x-1/2 text-[6rem] lg:text-[7.5rem] font-black text-[#e8eff8] leading-none select-none z-[-1] tracking-tighter whitespace-nowrap">
                      {s.num}
                    </span>
                    
                    <div className="mt-16 md:mt-20 z-10 px-2">
                      <h3 className={`${s.num === '03' ? 'text-base lg:text-lg' : 'text-lg lg:text-xl'} font-black uppercase tracking-[0.03em] text-[#0b1d36] leading-tight whitespace-pre-line`}>
                        {s.title}
                      </h3>
                      <p className="mt-3 text-[0.85rem] text-[#4a5870] leading-[1.6] max-w-[14rem] mx-auto font-medium">
                        {s.desc}
                      </p>
                    </div>
                  </div>

                  {/* Connecting line — mobile only */}
                  {i < steps.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="md:hidden absolute left-1/2 top-14 bottom-[-3rem] w-px bg-[#b0141f]/30 -translate-x-1/2 z-0"
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </RevealOnView>
      </div>
    </section>
  );
}