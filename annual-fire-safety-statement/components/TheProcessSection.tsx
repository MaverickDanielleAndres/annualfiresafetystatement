"use client";

import React from 'react';
import { FileText, Search, TriangleAlert, FileCheck, Send } from 'lucide-react';
import RevealOnView from './RevealOnView';

export default function TheProcessSection() {
  return (
    <section className="bg-white py-8 lg:py-12 w-full overflow-hidden">
      <div className="container-inner max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 lg:mb-10 gap-8">
          <div className="flex-1">
            <RevealOnView>
              <p className="font-bold tracking-widest uppercase mb-4 text-xs md:text-sm flex items-center gap-3">
                <span className="text-[#fb5614]">05 / THE PROCESS</span>
              </p>
              
              <h2 className="text-[clamp(2.5rem,4vw,3.5rem)] font-black tracking-tight leading-[1.05] text-[#111111]">
                From schedule.<br/>
                <span className="bg-gradient-to-r from-[#fb5614] to-[#ffad05] bg-clip-text text-transparent">To your statement.</span>
              </h2>
            </RevealOnView>
          </div>
          <div className="flex-1 lg:max-w-md">
            <RevealOnView delay={100}>
              <p className="text-lg text-gray-700 font-medium leading-relaxed">
                A simple path from your Fire Safety Schedule to the Annual Fire Safety Statement.
              </p>
            </RevealOnView>
          </div>
        </div>

        {/* Process Steps Timeline */}
        <RevealOnView delay={200} className="w-full relative">
          <div className="w-full pt-2 lg:pt-4 pb-4">
            <div className="flex flex-col lg:flex-row items-start justify-between relative max-w-[1100px] mx-auto">
              
              {/* Desktop Connecting Line */}
              <div className="hidden lg:block absolute top-[32px] left-[10%] right-[10%] h-[1px] bg-[#fb5614] z-0"></div>

              {/* Step 1 */}
              <ProcessStep 
                number="01"
                icon={<FileText size={28} strokeWidth={1.5} />}
                title="REVIEW"
                subtitle="Fire Safety Schedule"
                desc="Identify the measures and standards that apply."
              />

              {/* Step 2 */}
              <ProcessStep 
                number="02"
                icon={<Search size={28} strokeWidth={1.5} />}
                title="ASSESS"
                subtitle="Applicable measures"
                desc="Check the required fire safety measures."
              />

              {/* Step 3 */}
              <ProcessStep 
                number="03"
                icon={<TriangleAlert size={28} strokeWidth={1.5} />}
                title="ADDRESS"
                subtitle="Issues identified"
                desc="Resolve items that need attention."
              />

              {/* Step 4 */}
              <ProcessStep 
                number="04"
                icon={<FileCheck size={28} strokeWidth={1.5} />}
                title="STATEMENT"
                subtitle="Annual Fire Safety Statement"
                desc="Prepare the AFSS using the assessment results."
              />

              {/* Step 5 */}
              <ProcessStep 
                number="05"
                icon={<Send size={28} strokeWidth={1.5} />}
                title="LODGE"
                subtitle="Council + FRNSW"
                desc="Provide the completed statement where required."
              />

            </div>
          </div>
        </RevealOnView>

      </div>
    </section>
  );
}

function ProcessStep({ number, icon, title, subtitle, desc }: any) {
  return (
    <div className="relative flex flex-col items-center text-center flex-1 w-full px-2 mb-16 lg:mb-0 group">
      
      {/* Faint Background Number */}
      <div className="absolute top-[20px] left-1/2 -translate-x-1/2 text-[120px] xl:text-[140px] font-black text-[#f9f9f9] leading-none z-0 select-none pointer-events-none whitespace-nowrap">
        {number}
      </div>

      {/* Icon */}
      <div className="relative z-20 w-[64px] h-[64px] rounded-full border-[1.5px] border-[#fb5614] bg-white flex items-center justify-center text-[#fb5614] mb-8 lg:mb-10 group-hover:scale-110 group-hover:bg-[#fff5ef] transition-all duration-300">
        {icon}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full">
        <h3 className="text-[1.05rem] font-black text-[#111111] uppercase tracking-wide mb-2">
          {title}
        </h3>
        <p className="text-[#fb5614] font-semibold text-[0.85rem] xl:text-[0.9rem] mb-3">
          {subtitle}
        </p>
        <p className="text-gray-500 font-medium text-[0.85rem] leading-[1.6] max-w-[200px]">
          {desc}
        </p>
      </div>

    </div>
  );
}
