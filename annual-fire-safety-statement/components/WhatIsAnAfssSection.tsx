"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Building2, HardHat, ShieldCheck, CalendarCheck, FileText } from 'lucide-react';
import RevealOnView from './RevealOnView';

export default function WhatIsAnAfssSection() {
  return (
    <section className="bg-white pt-2 lg:pt-4 pb-8 lg:pb-12 w-full overflow-hidden">
      <div className="container-inner max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-20">
          
          {/* LEFT COLUMN: Header & Image */}
          <div className="w-full lg:w-[40%] flex flex-col relative z-10">
            <RevealOnView>
              <p className="font-bold tracking-widest uppercase mb-4 text-xs md:text-sm flex items-center gap-3">
                <span className="w-2 h-2 bg-[#fb5614]" aria-hidden="true" />
                <span className="text-[#fb5614]">04 / WHAT IS AN AFSS?</span>
              </p>
              
              <h2 className="text-[clamp(2.25rem,3.1vw,3.25rem)] font-black tracking-tight leading-[1.05] text-[#111111] mb-6">
                <span className="whitespace-nowrap">What is an AFSS <span className="text-[#fb5614]">and</span></span><br/>
                <span className="bg-gradient-to-r from-[#fb5614] to-[#ffad05] bg-clip-text text-transparent whitespace-nowrap">why does it matter?</span>
              </h2>
              
              <p className="text-gray-700 leading-relaxed font-medium">
                An Annual Fire Safety Statement (AFSS) is a document issued by or on behalf of the owner of an existing building. It confirms that the essential fire safety measures applying to the building have been assessed, inspected and verified against the required standards by an accredited practitioner (fire safety).
              </p>
            </RevealOnView>

            {/* AFSS Image with faint background text */}
            <RevealOnView delay={200} className="relative w-full aspect-[3/4] mt-4 lg:mt-6">
              {/* Faint Background Text */}
              <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-[140px] md:text-[180px] font-black text-[#fff0e6] leading-none z-0 tracking-tighter select-none pointer-events-none">
                AFSS
              </div>
              
              {/* Tilted Document Image */}
              <div className="relative w-[85%] mx-auto h-full z-10 transform rotate-6 hover:rotate-0 transition-transform duration-500 shadow-2xl bg-white border border-gray-100 p-2 rounded-sm">
                <div className="relative w-full h-full border border-gray-100">
                  <Image 
                    src="/sampleafss-nobg.png" 
                    alt="Annual Fire Safety Statement sample" 
                    fill 
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                </div>
              </div>
            </RevealOnView>
          </div>

          {/* RIGHT COLUMN: Info Grid */}
          <div className="w-full lg:w-[60%] flex flex-col relative z-20">
            <RevealOnView delay={100} className="w-full">
              
              {/* Row 1 */}
              <div className="border-t border-gray-200 py-8 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                <InfoItem 
                  number="01" 
                  title="Issued for existing buildings" 
                  desc="AFSS applies to existing buildings and records the annual confirmation of the applicable fire safety measures." 
                />
                <InfoItem 
                  number="02" 
                  title="Issued each year" 
                  desc="Annual fire safety statements must be issued every year and include all essential fire safety measures that apply to the building." 
                />
              </div>

              {/* Row 2 */}
              <div className="border-t border-gray-200 py-8 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                <InfoItem 
                  number="03" 
                  title="Two statement types" 
                  desc="Annual fire safety statements cover essential fire safety measures. Supplementary fire safety statements are issued more regularly for any critical fire safety measures specified in the Fire Safety Schedule." 
                />
                <InfoItem 
                  number="04" 
                  title="Measures assessed and verified" 
                  desc="An accredited practitioner (fire safety) assesses, inspects and verifies the performance of each applicable fire safety measure." 
                />
              </div>

              {/* Row 3 */}
              <div className="border-t border-gray-200 py-8 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                <InfoItem 
                  number="05" 
                  title="Exit systems checked" 
                  desc="For an annual statement, the building's exit systems are also inspected and confirmed in accordance with the Regulation." 
                />
                <InfoItem 
                  number="06" 
                  title="Based on the Fire Safety Schedule" 
                  desc="The Fire Safety Schedule identifies the fire safety measures applying to the building and the minimum performance standards they must meet." 
                />
              </div>

              {/* Row 4 */}
              <div className="border-t border-gray-200 py-8 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                <InfoItem 
                  number="07" 
                  title="Standard NSW form" 
                  desc="Fire safety statements must use the prescribed NSW fire safety statement template." 
                />
                <InfoItem 
                  number="08" 
                  title="Lodge and display" 
                  desc="After issue, a copy is given to Fire and Rescue NSW and the current statement and Fire Safety Schedule must be prominently displayed in the building." 
                />
              </div>

              {/* Bottom Icon Bar */}
              <div className="border-t border-gray-200 pt-8 pb-4">
                <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-6 mb-6">
                  <IconBadge icon={<Building2 size={24} strokeWidth={1.5} />} label={["Existing", "building"]} />
                  <IconBadge icon={<HardHat size={24} strokeWidth={1.5} />} label={["Accredited", "practitioner"]} />
                  <IconBadge icon={<ShieldCheck size={24} strokeWidth={1.5} />} label={["Essential", "measures"]} />
                  <IconBadge icon={<CalendarCheck size={24} strokeWidth={1.5} />} label={["Annual", "requirement"]} />
                  <IconBadge icon={<FileText size={24} strokeWidth={1.5} />} label={["Display", "+ records"]} />
                </div>
                
                {/* CTA */}
                <div className="flex justify-center lg:justify-center w-full mt-10">
                  <Link 
                    href="/free-quote"
                    className="btn animate-pump !px-8 !py-4 !text-lg border-none shadow-[0_8px_20px_rgba(251,86,20,0.25)] hover:shadow-[0_8px_25px_rgba(251,86,20,0.4)] hover:scale-105 transition-all w-full sm:w-auto group rounded-full"
                    style={{ 
                      background: "linear-gradient(to right, #ff5614, #ffad05)",
                      color: "#ffffff",
                      fontSize: "clamp(0.95rem, 1.1vw, 1.05rem)", 
                      textDecoration: 'none', 
                      display: 'inline-flex',
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}
                  >
                    GET AN INSTANT QUOTE
                    <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </Link>
                </div>
              </div>

            </RevealOnView>
          </div>

        </div>

      </div>
    </section>
  );
}

function InfoItem({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="text-[48px] lg:text-[56px] font-black text-[#fff0e6] leading-[0.8] select-none pointer-events-none mt-1 flex-shrink-0 whitespace-nowrap">
        {number}
      </div>
      <div className="flex flex-col">
        <h3 className="font-bold text-[#111111] mb-2 text-[0.95rem] lg:text-[1.05rem] leading-tight">
          {title}
        </h3>
        <p className="text-gray-600 text-[0.85rem] leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}

function IconBadge({ icon, label }: { icon: React.ReactNode, label: string | string[] }) {
  const words = Array.isArray(label) ? label : label.split(' ');
  
  return (
    <div className="flex items-center gap-2 xl:gap-3 flex-shrink-0">
      <div className="text-[#fb5614] bg-white border border-gray-100 shadow-sm w-12 h-12 flex items-center justify-center rounded-lg group-hover:scale-105 transition-transform flex-shrink-0">
        {icon}
      </div>
      <div className="flex flex-col text-[10px] xl:text-[11px] font-bold text-[#111111] uppercase tracking-wide leading-tight">
        {words.map((word, i) => (
          <span key={i} className="whitespace-nowrap">{word}</span>
        ))}
      </div>
    </div>
  );
}
