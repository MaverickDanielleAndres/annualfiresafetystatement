"use client";

import { ArrowRight, Building2, Briefcase, Factory, ShoppingCart, Building, Home } from "lucide-react";
import { openInstantQuote } from "@/lib/quote/open";
import RevealOnView from "@/components/RevealOnView";

const categories = [
  {
    title: "Strata / apartment buildings",
    desc: "Residential buildings where essential fire safety measures apply.",
    icon: Building2,
  },
  {
    title: "Commercial buildings",
    desc: "Offices, business premises and corporate properties, depending on the building's approvals and applicable fire safety measures.",
    icon: Briefcase,
  },
  {
    title: "Industrial properties",
    desc: "Warehouses, factories and industrial sites where applicable measures are identified.",
    icon: Factory,
  },
  {
    title: "Retail properties",
    desc: "Shops, supermarkets and shopping centres, subject to applicable fire safety requirements.",
    icon: ShoppingCart,
  },
  {
    title: "Mixed-use developments",
    desc: "Buildings combining residential, retail or commercial uses, each assessed against its applicable measures.",
    icon: Building,
  },
  {
    title: "Other applicable buildings",
    desc: "Any existing building in NSW with applicable essential fire safety measures.",
    icon: Home,
  },
];

export default function NeedsAfss() {
  const getGridClasses = (i: number) => {
    let classes = "flex gap-5 py-10 border-[#e8edf5] border-b last:border-b-0 ";
    
    // Tablet (MD - 2 cols):
    if (i >= 4) classes += "md:border-b-0 ";
    else classes += "md:border-b ";
    
    if (i % 2 === 0) classes += "md:border-r md:pr-8 ";
    else classes += "md:border-r-0 md:pl-8 ";
    
    // Desktop (LG - 3 cols):
    if (i >= 3) classes += "lg:border-b-0 ";
    else classes += "lg:border-b ";
    
    if (i % 3 !== 2) classes += "lg:border-r ";
    else classes += "lg:border-r-0 ";
    
    // Desktop padding overrides
    if (i % 3 === 0) classes += "lg:pr-10 lg:pl-0 ";
    else if (i % 3 === 1) classes += "lg:px-10 ";
    else classes += "lg:pl-10 lg:pr-0 ";
    
    return classes;
  };

  return (
    <section className="relative bg-white py-24 lg:py-32 w-full overflow-hidden">


      <div className="container-inner relative z-10 max-w-[1200px] mx-auto px-6">
        {/* Header Area */}
        <div className="flex flex-col lg:flex-row lg:justify-between mb-8 lg:mb-12 gap-10">
          <div className="flex-1">
            <RevealOnView>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#b0141f] text-white font-bold text-[0.85rem] px-2 py-0.5 rounded-[3px] leading-tight">
                  04
                </div>
                <span className="text-[#1c4d9c] font-bold text-[0.85rem] tracking-[0.15em] uppercase">
                  / DOES MY BUILDING NEED AN AFSS?
                </span>
              </div>
              <h2 className="h-section">
                <span className="text-[#0b1d36]">Does my building</span><br />
                <span className="text-[#0b1d36]">need an </span>
                <span className="text-[#b0141f]">AFSS?</span>
              </h2>
            </RevealOnView>
          </div>
          
          <div className="flex-1 lg:max-w-lg lg:pt-16">
            <RevealOnView delay={100}>
              <p className="text-[1.1rem] text-[#374151] leading-[1.6]">
                An Annual Fire Safety Statement (AFSS) is generally required for NSW buildings where essential fire safety measures apply.
              </p>
              <p className="text-[1.1rem] text-[#374151] leading-[1.6] mt-6">
                The Fire Safety Schedule usually identifies the measures and minimum standards that apply to the building.
              </p>
            </RevealOnView>
          </div>
        </div>

        {/* Grid Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => {
            const Icon = c.icon;
            return (
              <RevealOnView key={c.title} delay={150 + i * 50} className={getGridClasses(i)}>
                <div className="w-[3.5rem] h-[3.5rem] rounded-full bg-[#f4f7fb] border border-[#e8edf5] flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-[#b0141f]" strokeWidth={1.5} />
                </div>
                <div className="pt-1">
                  <h3 className="text-[1.15rem] font-bold text-[#0b1d36] leading-tight">
                    {c.title}
                  </h3>
                  <p className="mt-3 text-[0.95rem] text-[#4b5563] leading-[1.6]">
                    {c.desc}
                  </p>
                </div>
              </RevealOnView>
            );
          })}
        </div>

        {/* Footer CTA Area */}
        <RevealOnView delay={300}>
          <div className="mt-12 lg:mt-16 flex flex-wrap items-center justify-center gap-5">
            <button
              type="button"
              className="btn btn-dark !rounded-md px-6 py-3.5 flex items-center gap-3 font-semibold text-[0.95rem] shadow-sm tracking-wide"
              onClick={() => openInstantQuote({ source: "section" })}
            >
              <ArrowRight size={18} strokeWidth={2.2} aria-hidden="true" />
              NOT SURE? CHECK MY BUILDING
            </button>
            <span className="text-[0.95rem] text-[#3a4a63]">
              <button onClick={() => openInstantQuote({ source: "section" })} className="underline decoration-1 underline-offset-[3px] font-semibold text-[#0b1d36] hover:text-[#1c4d9c] transition-colors">Start</button> the same quote journey.
            </span>
          </div>
        </RevealOnView>
      </div>
    </section>
  );
}