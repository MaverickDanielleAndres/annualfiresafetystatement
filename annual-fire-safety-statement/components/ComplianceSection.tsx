"use client";

import React from "react";
import Link from "next/link";
import RevealOnView from "./RevealOnView";
import { Gavel, User, Users, Landmark, Building2, Award, ShieldCheck, AlertTriangle, ArrowRight } from "lucide-react";

export default function ComplianceSection() {
  return (
    <section className="bg-white py-10 lg:py-16 w-full">
      <div className="container-inner max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-12 gap-8">
          <div className="flex-1">
            <RevealOnView>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[#1c4d9c] font-bold text-sm tracking-widest border-b-2 border-[#b0141f] pb-1">05</span>
                <span className="text-[#0b1d36] font-bold text-sm tracking-widest pb-1">/ COMPLIANCE</span>
              </div>
              <h2 className="text-[clamp(2.2rem,3.5vw,3rem)] font-extrabold tracking-tight leading-[1.05] text-[#0b1d36] max-w-[600px]">
                Penalties, practitioners
                <br />
                and why compliance matters.
              </h2>
            </RevealOnView>
          </div>
          <div className="flex-1 lg:max-w-[420px] lg:border-l-2 lg:border-[#b0141f] lg:pl-8 lg:mt-4">
            <RevealOnView delay={100}>
              <p className="text-[1.1rem] text-[#3a4a63] font-medium leading-[1.6]">
                A clear read on what the regulation requires, who can endorse it, and what it means for your building.
              </p>
            </RevealOnView>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          
          {/* Card A: Penalties */}
          <RevealOnView delay={100} className="h-full">
            <div className="flex flex-col h-full bg-white border border-[#e3e7ee] rounded-[0.25rem] overflow-hidden shadow-sm">
              <div className="p-6 pb-0">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-[52px] h-[52px] rounded-full bg-[#fae8e8] text-[#b0141f] flex items-center justify-center shrink-0">
                    <Gavel size={24} strokeWidth={1.8} />
                  </div>
                  <div className="flex flex-col flex-1 pt-1">
                    <span className="text-[0.75rem] font-bold tracking-[0.08em] text-[#b0141f] uppercase leading-[1.3]">
                      A. PENALTIES FOR<br/>NON-COMPLIANCE
                    </span>
                    <div className="w-full h-[1px] bg-[#b0141f]/20 mt-2"></div>
                  </div>
                </div>
                
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-[2.2rem] font-extrabold text-[#0b1d36] tracking-tight leading-none">
                    $1,000
                  </span>
                  <span className="text-[0.65rem] font-bold tracking-[0.1em] text-[#5b6a82] uppercase">
                    PER WEEK
                  </span>
                </div>
                
                <p className="text-[0.85rem] text-[#3a4a63] leading-[1.6] mb-3">
                  Failure to submit an AFSS on time can result in significant penalties. Fines increase weekly, starting at $1,000 for the first week and escalating by an additional $1,000 each subsequent week.
                </p>
                <p className="text-[0.85rem] text-[#3a4a63] leading-[1.6] mb-8">
                  Continuous non-compliance can lead to substantial financial penalties.
                </p>
              </div>
              <div className="mt-auto bg-[#faf4f4] p-4 border-t border-[#f0d8d8] flex items-center gap-3">
                <AlertTriangle size={18} strokeWidth={2} className="text-[#b0141f]" />
                <span className="text-[0.7rem] font-bold tracking-[0.08em] text-[#b0141f] uppercase leading-tight">
                  REVIEWED UNDER<br/>EP&amp;A REGULATION
                </span>
              </div>
            </div>
          </RevealOnView>

          {/* Card B: Who can endorse */}
          <RevealOnView delay={150} className="h-full">
            <div className="flex flex-col h-full bg-white border border-[#e3e7ee] rounded-[0.25rem] overflow-hidden shadow-sm">
              <div className="p-6 pb-0">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-[52px] h-[52px] rounded-full bg-[#0b1d36] text-white flex items-center justify-center shrink-0">
                    <User size={24} strokeWidth={1.8} />
                  </div>
                  <div className="flex flex-col flex-1 pt-1">
                    <span className="text-[0.75rem] font-bold tracking-[0.08em] text-[#0b1d36] uppercase leading-[1.3]">
                      B. WHO CAN ENDORSE IT?<br/>
                      <span className="text-[#5b6a82] font-semibold tracking-normal text-[0.7rem] normal-case">(Clause 175(b))</span>
                    </span>
                    <div className="w-full h-[1px] bg-[#e3e7ee] mt-2"></div>
                  </div>
                </div>
                
                <p className="text-[0.85rem] text-[#3a4a63] leading-[1.6] mb-3">
                  Fire safety measures must be inspected by an accredited practitioner (fire safety) in accordance with clause 175(b) of the Environmental Planning &amp; Assessment Regulation.
                </p>
                <p className="text-[0.85rem] text-[#3a4a63] leading-[1.6] mb-8">
                  Practitioners are listed on the Fire Protection Association (FPA) register. It is the building owner&apos;s responsibility to ensure the practitioner they engage has full accreditation.
                </p>
              </div>
              <div className="mt-auto bg-[#f5f7fa] p-4 border-t border-[#e3e7ee] flex items-center justify-between group cursor-pointer transition-colors hover:bg-[#ebf0f7]">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={18} strokeWidth={2} className="text-[#1c4d9c]" />
                  <span className="text-[0.7rem] font-bold tracking-[0.08em] text-[#1c4d9c] uppercase leading-tight">
                    CHECK CURRENT<br/>REGISTRATION
                  </span>
                </div>
                <ArrowRight size={16} className="text-[#1c4d9c] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </RevealOnView>

          {/* Card C: Why it matters */}
          <RevealOnView delay={200} className="h-full">
            <div className="flex flex-col h-full bg-white border border-[#e3e7ee] rounded-[0.25rem] overflow-hidden shadow-sm">
              <div className="p-6 pb-0">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-[52px] h-[52px] rounded-full bg-[#0b1d36] text-white flex items-center justify-center shrink-0">
                    <Users size={24} strokeWidth={1.8} />
                  </div>
                  <div className="flex flex-col flex-1 pt-1">
                    <span className="text-[0.75rem] font-bold tracking-[0.08em] text-[#0b1d36] uppercase leading-[1.3]">
                      C. WHY IT MATTERS
                    </span>
                    <div className="w-full h-[1px] bg-[#e3e7ee] mt-2"></div>
                  </div>
                </div>
                
                <p className="text-[0.85rem] text-[#3a4a63] leading-[1.6] mb-3">
                  Ensuring fire safety is a critical responsibility for building owners.
                </p>
                <p className="text-[0.85rem] text-[#3a4a63] leading-[1.6] mb-3">
                  The AFSS serves as a vital tool in maintaining high standards of fire safety, protecting both property and lives.
                </p>
                <p className="text-[0.85rem] text-[#3a4a63] leading-[1.6] mb-8">
                  By adhering to Australian authority guidelines and regularly updating fire safety measures, building owners significantly reduce the risk of fire-related incidents.
                </p>
              </div>
              <div className="mt-auto bg-[#f5f7fa] p-4 border-t border-[#e3e7ee] flex items-center gap-3">
                <ShieldCheck size={18} strokeWidth={2} className="text-[#1c4d9c]" />
                <span className="text-[0.7rem] font-bold tracking-[0.08em] text-[#1c4d9c] uppercase leading-tight">
                  PROTECTING PROPERTY<br/>AND LIVES
                </span>
              </div>
            </div>
          </RevealOnView>

          {/* Card D: ALLFIRE Solution */}
          <RevealOnView delay={250} className="h-full">
            <div className="flex flex-col h-full bg-[#0b1d36] text-white rounded-[0.25rem] overflow-hidden shadow-[0_12px_24px_rgba(11,29,54,0.15)] relative">
              <div className="p-6 pb-0 relative z-10">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-[52px] h-[52px] rounded-full border border-white/20 text-white flex items-center justify-center shrink-0">
                    <Landmark size={24} strokeWidth={1.2} />
                  </div>
                  <div className="flex flex-col flex-1 pt-1">
                    <span className="text-[0.75rem] font-bold tracking-[0.08em] text-white uppercase leading-[1.3]">
                      D. ALLFIRE:<br/>
                      YOUR AFSS SOLUTION<br/>
                      PROVIDER
                    </span>
                    <div className="w-full h-[1px] bg-white/20 mt-2"></div>
                  </div>
                </div>
                
                <p className="text-[0.85rem] text-white/80 leading-[1.6] mb-3">
                  ALLFIRE Fire Protection Management is a NSW fire protection provider. With offices in Sydney, Newcastle and the NSW Central Coast, we bring hundreds of years of combined experience in fire protection.
                </p>
                <p className="text-[0.85rem] text-white/80 leading-[1.6] mb-8">
                  Our experts offer a free walk-around to ensure your building is compliant and not at risk. Severe financial penalties apply for non-compliance.
                </p>
              </div>
              <div className="mt-auto p-6 pt-0 z-10">
                <Link
                  href="/contact"
                  className="w-full bg-white text-[#0b1d36] hover:bg-[#f5f7fa] py-3.5 px-4 rounded-[0.25rem] flex items-center justify-between text-[0.8rem] font-bold tracking-[0.08em] transition-colors group uppercase"
                >
                  CONTACT US TODAY
                  <ArrowRight size={16} strokeWidth={2.4} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </RevealOnView>
          
        </div>
      </div>


    </section>
  );
}

function StatCard({ delay, icon, value, label, footnote }: { delay: number; icon: React.ReactNode; value: string; label: string; footnote: string }) {
  return (
    <RevealOnView delay={delay} className="flex flex-col items-center text-center">
      <div className="w-[52px] h-[52px] rounded-full border border-white/20 flex items-center justify-center text-white mb-5 shrink-0">
        {React.cloneElement(icon as React.ReactElement<any>, { size: 22, strokeWidth: 1.5 })}
      </div>
      <div className="text-[1.6rem] font-extrabold text-white leading-none mb-2 tracking-tight">
        {value}
      </div>
      <div className="text-[0.65rem] font-bold tracking-[0.1em] text-white uppercase mb-2">
        {label}
      </div>
      <div className="text-[0.75rem] text-white/50 leading-[1.4] max-w-[120px]">
        {footnote}
      </div>
    </RevealOnView>
  );
}
