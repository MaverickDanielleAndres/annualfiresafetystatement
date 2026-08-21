"use client";

import { ArrowRight, FileText, ClipboardList, HelpCircle } from "lucide-react";
import RevealOnView from "@/components/RevealOnView";
import { openInstantQuote } from "@/lib/quote/open";

/**
 * AFSS homepage — 01 / Got Your AFSS?
 *
 * Three pathway rows (cards). All three open the same Instant Quote
 * modal; the choice is passed in `source` for analytics. The same quote
 * session is resumed if it already exists.
 */

type Pathway = "afss" | "fss" | "none";

const pathways: { id: Pathway; title: string; desc: string; icon: React.ReactNode }[] = [
  {
    id: "afss",
    title: "I HAVE MY AFSS",
    desc: "Upload your current Annual Fire Safety Statement.",
    icon: <FileText size={20} strokeWidth={2} />,
  },
  {
    id: "fss",
    title: "I HAVE MY FIRE SAFETY SCHEDULE",
    desc: "Start with your building's current Fire Safety Schedule.",
    icon: <ClipboardList size={20} strokeWidth={2} />,
  },
  {
    id: "none",
    title: "I CAN'T FIND EITHER",
    desc: "That's okay. We can still help you get started.",
    icon: <HelpCircle size={20} strokeWidth={2} />,
  },
];

export default function GotYourAfss() {
  return (
    <section
      id="afss-requirements"
      className="bg-white section-y-tight w-full overflow-hidden"
    >
      <div className="container-inner">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-stretch">
          <div className="w-full lg:w-[45%] flex flex-col justify-center">
            <RevealOnView>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#b0141f] text-white font-bold text-[0.85rem] px-2 py-0.5 rounded-[3px] leading-tight">
                  01
                </div>
                <span className="text-[#1c4d9c] font-bold text-[0.85rem] tracking-[0.15em] uppercase">
                  / GOT YOUR AFSS?
                </span>
              </div>
              <h2 className="h-section">
                Pick the starting
                <br />
                point that matches
                <br />
                your <span className="text-[#b0141f]">paperwork.</span>
              </h2>
              <div className="w-12 h-[3px] bg-[#b0141f] mt-6 mb-6" />
              <p className="text-[1.05rem] text-[#5b6a82] font-medium leading-[1.6] max-w-[28rem]">
                Wherever you are in the process, you&apos;ll land on the
                same guided quote. Choose what fits today, you can
                always come back later.
              </p>
            </RevealOnView>
          </div>

          <div className="w-full lg:w-[55%]">
            <ul className="flex flex-col gap-4 h-full">
              {pathways.map((p, i) => (
                <RevealOnView key={p.id} delay={i * 80} as="li" className="flex-1 flex flex-col">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      openInstantQuote({
                        source: "section",
                      })
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openInstantQuote({ source: "section" });
                      }
                    }}
                    className="flex-1 group flex w-full items-center gap-5 !p-5 sm:!p-6 bg-white !border-2 !border-solid !border-[#d3dce8] !rounded-xl text-left transition-all hover:!border-[#1c4d9c] hover:!bg-[#f5f8fc] hover:shadow-[0_8px_24px_rgba(28,77,156,0.06)] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#1c4d9c]"
                  >
                    {/* Left Icon */}
                    <div className="flex-none flex items-center justify-center w-12 h-12 rounded-full bg-[#f0f4fa] text-[#1c4d9c] transition-colors group-hover:bg-white group-hover:shadow-sm">
                      {p.icon}
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 min-w-0 pr-4">
                      <span className="block text-[1rem] sm:text-[1.05rem] font-extrabold tracking-wide uppercase text-[#0b1d36] transition-colors">
                        {p.title}
                      </span>
                      <span className="mt-1 block text-[0.9rem] text-[#5b6a82] font-medium">
                        {p.desc}
                      </span>
                    </div>

                    {/* Right Arrow */}
                    <span
                      aria-hidden="true"
                      className="flex-none flex h-9 w-9 items-center justify-center rounded-full border border-[#d8dde6] text-[#1c4d9c] bg-white transition-all group-hover:bg-[#1c4d9c] group-hover:text-white group-hover:border-[#1c4d9c] group-hover:translate-x-1"
                    >
                      <ArrowRight size={16} strokeWidth={2.4} />
                    </span>
                  </div>
                </RevealOnView>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}