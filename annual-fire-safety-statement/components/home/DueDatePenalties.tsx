"use client";

import Image from "next/image";
import { ArrowRight, Bell, Calendar, FileText, Info } from "lucide-react";
import RevealOnView from "@/components/RevealOnView";
import { openInstantQuote } from "@/lib/quote/open";

export default function DueDatePenalties() {
  return (
    <section className="bg-white py-16 lg:py-24 w-full overflow-hidden">
      <div className="container-inner">
        {/* Adjusted grid to give the right card more width */}
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-start">
          
          {/* LEFT COLUMN */}
          <div className="flex flex-col">
            <RevealOnView>
              {/* Overline */}
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#b0141f] text-white font-bold text-[0.85rem] px-2 py-0.5 rounded-[3px] leading-tight">
                  07
                </div>
                <span className="text-[#1c4d9c] font-bold text-[0.85rem] tracking-[0.15em] uppercase">
                  / DUE DATE & PENALTIES
                </span>
              </div>
              
              {/* Heading */}
              <h2 className="h-section">
                Your AFSS is<br />due every <span className="text-[#b0141f]">year.</span>
              </h2>
              
              {/* Red Divider */}
              <div className="w-[60px] h-[3px] bg-[#d9232d] mt-7 mb-7" />
              
              {/* Paragraph */}
              <p className="text-[1.05rem] text-[#4a5568] leading-[1.65] max-w-[34rem]">
                Annual Fire Safety Statements are generally required every 12 months.
                Knowing your due date gives you time to organise assessments and
                address any issues before the statement is due.
              </p>
            </RevealOnView>

            {/* Buttons - Using global CSS classes to guarantee render */}
            <RevealOnView delay={120}>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => openInstantQuote({ source: "section" })}
                  className="btn btn-dark !rounded-md w-full sm:w-auto"
                  style={{ paddingLeft: "1.5rem", paddingRight: "1.5rem" }}
                >
                  <Calendar size={18} strokeWidth={2.5} />
                  <span className="tracking-widest">CHECK MY AFSS DATE</span>
                  <ArrowRight size={18} strokeWidth={2.5} />
                </button>
                
                <button
                  type="button"
                  onClick={() => openInstantQuote({ source: "section" })}
                  className="btn btn-secondary !rounded-md w-full sm:w-auto shadow-sm"
                  style={{ paddingLeft: "1.5rem", paddingRight: "1.5rem" }}
                >
                  <FileText size={18} strokeWidth={2.5} />
                  <span className="tracking-widest">GET MY AFSS QUOTE</span>
                  <ArrowRight size={18} strokeWidth={2.5} />
                </button>
              </div>
            </RevealOnView>
            
            {/* Calendar Image - Made bigger */}
            <RevealOnView delay={140}>
              <div className="mt-16 relative w-full max-w-[550px]">
                <Image 
                  src="/calendar.png" 
                  alt="Calendar" 
                  width={600}
                  height={500}
                  className="w-full h-auto object-contain drop-shadow-xl"
                  priority
                />
              </div>
            </RevealOnView>
          </div>

          {/* RIGHT COLUMN - Card */}
          <RevealOnView delay={160}>
            <div className="bg-white border border-[#e2e8f0] rounded-[0.6rem] p-8 lg:p-12 shadow-[0_8px_30px_rgba(0,0,0,0.04)] w-full">
              {/* Card Header */}
              <div className="flex items-center gap-4 mb-7">
                <div className="w-11 h-11 rounded-full border-[1.5px] border-[#d9232d] flex items-center justify-center text-[#d9232d] shrink-0">
                  <Bell size={20} strokeWidth={2} />
                </div>
                <h3 className="text-[0.85rem] font-bold text-[#d9232d] uppercase tracking-[0.15em] m-0">
                  LATE OR MISSING AFSS
                </h3>
              </div>

              {/* Card Main Bold Text */}
              <p className="text-[1.1rem] text-[#0b1d36] font-bold leading-[1.65] mb-5">
                Failing to provide an Annual Fire Safety Statement
                within the required timeframe can result in escalating
                penalties. Each week of continuing non-compliance
                may constitute a further offence under the legislation
                provisions.
              </p>

              {/* Card Intro Text */}
              <p className="text-[0.95rem] text-[#4a5568] leading-[1.65] mb-8">
                Penalty units for a Fire Safety offence may vary for a failure to give an
                Annual Fire Safety Statement to the local council:
              </p>

              {/* Penalties Table */}
              <div className="flex flex-col mb-8 border-t border-[#f1f5f9]">
                <div className="flex items-center py-4 border-b border-[#f1f5f9]">
                  <span className="w-[55%] text-[#1c4d9c] font-bold text-[0.8rem] uppercase tracking-wider">
                    FIRST WEEK
                  </span>
                  <span className="w-[45%] text-[#0b1d36] font-bold text-[0.95rem]">
                    $1,100
                  </span>
                </div>
                <div className="flex items-center py-4 border-b border-[#f1f5f9]">
                  <span className="w-[55%] text-[#1c4d9c] font-bold text-[0.8rem] uppercase tracking-wider">
                    SECOND WEEK
                  </span>
                  <span className="w-[45%] text-[#0b1d36] font-bold text-[0.95rem]">
                    $2,200
                  </span>
                </div>
                <div className="flex items-center py-4 border-b border-[#f1f5f9]">
                  <span className="w-[55%] text-[#1c4d9c] font-bold text-[0.8rem] uppercase tracking-wider">
                    THIRD WEEK
                  </span>
                  <span className="w-[45%] text-[#0b1d36] font-bold text-[0.95rem]">
                    $3,300
                  </span>
                </div>
                <div className="flex items-center py-4 border-b border-[#f1f5f9]">
                  <span className="w-[55%] text-[#1c4d9c] font-bold text-[0.8rem] uppercase tracking-wider">
                    FOURTH &amp; EACH<br/>SUBSEQUENT WEEK
                  </span>
                  <span className="w-[45%] text-[#0b1d36] font-bold text-[0.95rem]">
                    $4,400
                  </span>
                </div>
              </div>

              {/* Small Legal Text */}
              <p className="text-[0.8rem] text-[#718096] leading-[1.6] mb-8">
                Penalty amounts are current as at 1 July. Amounts may change. Rule is current
                to NSW legislation and your local council requirements for the position that
                applies to your building.
              </p>

              <hr className="border-[#e2e8f0] mb-6" />

              {/* Info Row */}
              <div className="flex items-center gap-3">
                <Info size={18} className="text-[#1c4d9c]" strokeWidth={2} shrink-0 />
                <span className="text-[0.85rem] text-[#4a5568]">
                  Use your council area when you start your quote.
                </span>
              </div>
            </div>
          </RevealOnView>

        </div>
      </div>
    </section>
  );
}