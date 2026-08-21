"use client";

import Image from "next/image";
import { Upload } from "lucide-react";
import RevealOnView from "@/components/RevealOnView";
import { openInstantQuote } from "@/lib/quote/open";

/**
 * AFSS homepage — 03 / What the Inspection Involves.
 *
 * Six-step grid on the left, real inspection imagery on
 * the right. No generic icon cards — uses a numbered grid.
 */

const steps = [
  {
    num: "01",
    title: "Review the Fire Safety Schedule",
    desc: "Identify the essential fire safety measures and minimum standards of performance that apply to the building.",
  },
  {
    num: "02",
    title: "Inspect applicable measures",
    desc: "Relevant fire safety measures are inspected and assessed by appropriately accredited practitioners where the relevant accreditation scheme applies.",
  },
  {
    num: "03",
    title: "Check performance",
    desc: "Each applicable measure is assessed against the required standard identified for the building.",
  },
  {
    num: "04",
    title: "Identify issues",
    desc: "Any measure that does not meet the required standard is identified for attention.",
  },
  {
    num: "05",
    title: "Record the assessment",
    desc: "Assessment dates, practitioner details and relevant results are recorded for the AFSS process.",
  },
  {
    num: "06",
    title: "Prepare the statement",
    desc: "Once the applicable assessment requirements are satisfied, the information can support preparation of the Annual Fire Safety Statement.",
  },
];

export default function InspectionInvolves() {
  return (
    <section
      id="inspection"
      className="bg-white section-y-tight w-full overflow-hidden relative"
    >
      <div className="container-inner relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-stretch">
          {/* LEFT — timeline */}
          <div className="w-full lg:w-[58%] pb-8 lg:pb-0">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#b0141f] text-white font-bold text-[0.85rem] px-2 py-0.5 rounded-[3px] leading-tight">
                  03
                </div>
                <span className="text-[#1c4d9c] font-bold text-[0.85rem] tracking-[0.15em] uppercase">
                  / WHAT THE INSPECTION INVOLVES
                </span>
              </div>
            <h2 className="h-section">More than a paperwork <span className="text-[#b0141f]">check.</span></h2>
            <div className="w-12 h-[3px] bg-[#b0141f] mt-6 mb-6" />
            <p className="text-body max-w-[40rem]">
              An AFSS assessment is more than a paperwork check. The
              applicable fire safety measures identified on the Fire
              Safety Schedule need to be assessed against the required
              standard of performance for your building.
            </p>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 relative">
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-[#e3e7ee] transform -translate-x-1/2" />
              {steps.map((s, i) => {
                const itemClasses = [
                  "border-b border-[#e3e7ee] md:pr-8 py-6 md:py-8", // 0
                  "border-b border-[#e3e7ee] md:pl-8 py-6 md:py-8", // 1
                  "border-b border-[#e3e7ee] md:pr-8 py-6 md:py-8", // 2
                  "border-b border-[#e3e7ee] md:pl-8 py-6 md:py-8", // 3
                  "border-b md:border-b-0 border-[#e3e7ee] md:pr-8 py-6 md:py-8", // 4
                  "md:pl-8 py-6 md:py-8", // 5
                ];
                
                return (
                  <RevealOnView
                    key={s.num}
                    delay={i * 70}
                    as="div"
                    className={`relative flex gap-5 ${itemClasses[i]}`}
                  >
                    <span className="flex-none w-[2.75rem] h-[2.75rem] rounded-full bg-white border border-[#e3e7ee] text-[#b0141f] flex items-center justify-center font-mono font-bold text-[0.95rem] z-10 shadow-sm">
                      {s.num}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-[1.05rem] font-extrabold text-[#0b1d36] leading-tight">
                        {s.title}
                      </h3>
                      <p className="mt-2 text-[0.9rem] text-[#3a4a63] leading-[1.6]">
                        {s.desc}
                      </p>
                    </div>
                  </RevealOnView>
                );
              })}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-5">
              <button
                type="button"
                className="btn btn-dark !rounded-md px-6 py-3.5 flex items-center gap-3 font-semibold text-[0.95rem] shadow-sm"
                onClick={() => openInstantQuote({ source: "section" })}
              >
                <Upload size={18} strokeWidth={2.2} aria-hidden="true" />
                Have your Fire Safety Schedule?
              </button>
              <span className="text-[0.95rem] text-[#3a4a63]">
                <button onClick={() => openInstantQuote({ source: "section" })} className="underline decoration-1 underline-offset-[3px] font-semibold text-[#0b1d36] hover:text-[#1c4d9c] transition-colors">Upload</button> it and get started.
              </span>
            </div>
          </div>

          {/* RIGHT — image (Mobile) */}
          <div className="w-full lg:hidden relative min-h-[400px] flex items-center justify-center">
            <RevealOnView className="relative w-full max-w-[600px]">
              <div className="relative w-full aspect-[4/3] sm:aspect-[1.1/1]">
                <Image
                  src="/03image.png"
                  alt="Hand writing on Fire Safety Statement form"
                  fill
                  sizes="100vw"
                  className="object-cover object-left-top image-fade-left"
                />
              </div>
            </RevealOnView>
          </div>
          
          {/* RIGHT — image (Desktop) */}
          <div className="hidden lg:block w-[42%] relative min-h-0 pointer-events-none">
            {/* 
              top-12 bottom-12: lessens the height. 
              left-16: pushes it further right to add more space in between.
              w-[160%]: ensures the container reaches further to the right edge of the screen, revealing more width of the image before fading.
              image-fade-left: masks the container so the fade is visible on screen. 
            */}
            <RevealOnView className="absolute top-12 bottom-12 left-16 w-[160%] image-fade-left">
              <img
                src="/03image.png"
                alt="Hand writing on Fire Safety Statement form"
                className="h-full w-auto max-w-none object-left"
              />
            </RevealOnView>
          </div>
        </div>
      </div>
    </section>
  );
}