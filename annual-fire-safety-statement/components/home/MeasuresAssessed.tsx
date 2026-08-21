"use client";

import RevealOnView from "@/components/RevealOnView";
import Image from "next/image";

/**
 * AFSS homepage — 04 / What gets assessed?
 *
 * Common categories. Critical copy point: the Fire Safety Schedule
 * determines what applies to each building.
 */

const measures = [
  {
    number: "01",
    title: "Fire detection\nand alarm\nsystems",
    image: "/measure_01.jpg",
  },
  {
    number: "02",
    title: "Fire hydrants /\nhose reels",
    image: "/measure_02.jpg",
  },
  {
    number: "03",
    title: "Emergency\nlighting and\nexit signage",
    image: "/measure_03.jpg",
  },
  {
    number: "04",
    title: "Fire doors /\nsmoke doors",
    image: "/measure_04.jpg",
  },
  {
    number: "05",
    title: "Sprinkler\nsystems",
    image: "/measure_05.jpg",
  },
  {
    number: "06",
    title: "Passive\nfire measures",
    image: "/measure_06.jpg",
  },
];

export default function MeasuresAssessed() {
  return (
    <section className="bg-white section-y-tight w-full overflow-hidden">
      <div className="container-inner">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-16 gap-6">
          <div className="flex-1">
            <RevealOnView>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#b0141f] text-white font-bold text-[0.85rem] px-2 py-0.5 rounded-[3px] leading-tight">
                  06
                </div>
                <span className="text-[#1c4d9c] font-bold text-[0.85rem] tracking-[0.15em] uppercase">
                  / WHAT GETS ASSESSED?
                </span>
              </div>
              <h2 className="h-section">
                What gets <span className="text-[#b0141f]">assessed?</span>
              </h2>
            </RevealOnView>
          </div>
          <div className="flex-1 lg:max-w-md lg:text-right">
            <RevealOnView delay={80}>
              <p className="text-[#3b4b61] text-[1.05rem] leading-[1.6] lg:text-left">
                Your Fire Safety Schedule — or other applicable fire safety
                requirements — determines which measures apply to your
                building. Common categories include:
              </p>
            </RevealOnView>
          </div>
        </div>

        {/* Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 lg:gap-x-14 gap-y-12">
          {measures.map((m, i) => (
            <RevealOnView
              key={m.number}
              delay={i * 50}
              className="flex items-center gap-5 lg:gap-6 relative"
            >
              {/* lg divider (between col 1-2 and 2-3) */}
              {i % 3 !== 0 && (
                <div className="hidden lg:block absolute w-px bg-[#e3e7ee] top-0 bottom-0 -left-[28px]" />
              )}
              {/* md divider (between col 1-2) */}
              {i % 2 !== 0 && (
                <div className="hidden md:block lg:hidden absolute w-px bg-[#e3e7ee] top-0 bottom-0 -left-[20px]" />
              )}

              <div className="w-[120px] h-[120px] xl:w-[140px] xl:h-[140px] rounded-[1.25rem] overflow-hidden flex-shrink-0 bg-[#f4f7fb]">
                <Image
                  src={m.image}
                  alt={m.title.replace("\n", " ")}
                  width={140}
                  height={140}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-[#b0141f] font-bold text-xl mb-1.5">
                  {m.number}
                </span>
                <h3 className="text-[#0b1d36] font-extrabold text-[1.1rem] leading-[1.2] whitespace-pre-line">
                  {m.title}
                </h3>
              </div>
            </RevealOnView>
          ))}
        </div>

        {/* Info Box */}
        <RevealOnView delay={120}>
          <div className="mt-16 bg-white rounded-xl flex items-center p-6 lg:px-8 lg:py-7 relative overflow-hidden shadow-md">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#b0141f]"></div>
            
            <div className="flex-shrink-0 text-[#1c4d9c] mr-5 ml-2 hidden sm:block">
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </div>

            <p className="text-[#0b1d36] text-[0.95rem] leading-[1.6]">
              These are examples only — not every building has every measure.
              The applicable measures and standards for your building are
              identified in your Fire Safety Schedule or other applicable
              fire safety requirements.
            </p>
          </div>
        </RevealOnView>
      </div>
    </section>
  );
}