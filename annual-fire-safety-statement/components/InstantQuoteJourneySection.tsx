"use client";

import React, { useState } from "react";
import InstantQuoteModal from "./quote/InstantQuoteModal";
import RevealOnView from "./RevealOnView";
import { User, Building2, FileUp, FileCheck, CheckCircle2 } from "lucide-react";

export default function InstantQuoteJourneySection() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section className="bg-white py-10 lg:py-16 w-full overflow-hidden relative">
      <div className="container-inner w-full max-w-[1280px] mx-auto relative z-10 px-4 sm:px-6 lg:px-8">

        {/* Top eyebrow rule */}
        <div className="flex items-center gap-3 mb-5">
          <span className="w-2 h-2 bg-[#b0141f]" aria-hidden="true" />
          <span className="text-xs font-bold tracking-[0.18em] uppercase text-[#1c4d9c]">
            02 / Instant Quote
          </span>

        </div>

        {/* Desktop Layout: Left 35-40%, Right 60-65% */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">

          {/* Left Column */}
          <div className="w-full lg:w-[35%] flex flex-col items-start">
            <RevealOnView>
              <h2 className="text-[clamp(2.5rem,4vw,3.5rem)] font-extrabold tracking-tight leading-[1.04] mb-6 text-[#0b1d36]">
                Your building.
                <br />
                Your <span className="text-[#1c4d9c]">AFSS.</span>
                <br />
                <span
                  style={{
                    background: "linear-gradient(90deg, #0b1d36 0%, #1c4d9c 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    color: "transparent",
                  }}
                >
                  Your quote.
                </span>
              </h2>

              <p className="text-[1.05rem] text-[#3a4a63] mb-10 lg:mb-0 max-w-[400px] leading-relaxed font-medium">
                A few simple steps give us what we need to understand your building and start preparing your AFSS quote.
              </p>
            </RevealOnView>
          </div>

          {/* Right Column: Journey Steps */}
          <div className="w-full lg:w-[65%] flex flex-col md:flex-row items-center md:items-start justify-between relative mt-8 lg:mt-0 pt-2 gap-10 md:gap-2">

            <JourneyStep
              delay={100}
              number="01"
              icon={<User size={32} strokeWidth={1.5} />}
              title="YOUR DETAILS"
              desc="Name, email and mobile."
              hasArrow={true}
            />
            <JourneyStep
              delay={200}
              number="02"
              icon={<Building2 size={32} strokeWidth={1.5} />}
              title="YOUR BUILDING"
              desc="Enter the address and confirm the property."
              hasArrow={true}
            />
            <JourneyStep
              delay={300}
              number="03"
              icon={<FileUp size={32} strokeWidth={1.5} />}
              title="YOUR AFSS"
              desc="Upload your statement and add the due date."
              hasArrow={true}
            />
            <JourneyStep
              delay={400}
              number="04"
              icon={<FileCheck size={32} strokeWidth={1.5} />}
              title="YOUR QUOTE"
              desc="We use the information to determine what your building needs."
              hasArrow={false}
            />
          </div>
        </div>
      </div>

      {/* Bottom Features Bar */}
      <div className="w-full bg-white py-6 lg:py-8 relative z-10 mt-10 lg:mt-12">
        <div className="container-inner max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnView delay={200} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 lg:gap-4">
            <FeatureItem title="Fast and simple" desc="Get started in minutes." />
            <FeatureItem title="Secure and private" desc="Your information is safe." />
            <FeatureItem title="AFSS specialists" desc="We know AFSS inside out." />
            <FeatureItem title="NSW compliant" desc="Aligned with current regulations." />
          </RevealOnView>
        </div>
      </div>

      {/* Bottom CTA Block */}
      <div className="w-full flex flex-col items-center justify-center pt-8 pb-4 lg:pt-10 lg:pb-6 bg-white">
        <RevealOnView delay={300} className="flex flex-col items-center w-full px-4">
          <button
            onClick={() => setModalOpen(true)}
            className="btn btn-primary animate-pump px-8 py-4 text-[0.95rem] tracking-[0.06em] font-bold uppercase shadow-[0_8px_24px_rgba(11,29,54,0.18)] rounded-full hover:scale-100 w-full sm:w-auto group"
            style={{
              fontSize: "clamp(0.95rem, 1.1vw, 1.05rem)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            GET AN INSTANT QUOTE
            <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
          </button>

          <p className="mt-5 text-[0.95rem] font-medium text-[#0b1d36] text-center w-full">
            Have your AFSS ready? <button onClick={() => setModalOpen(true)} className="text-[#1c4d9c] hover:underline font-bold uppercase tracking-wide ml-1 transition-colors">START NOW →</button>
          </p>
        </RevealOnView>
      </div>

      <InstantQuoteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </section>
  );
}

function JourneyStep({ delay, number, icon, title, desc, hasArrow }: { delay: number, number: string, icon: React.ReactNode, title: string, desc: string, hasArrow: boolean }) {
  return (
    <RevealOnView delay={delay} className="flex flex-col items-center text-center relative flex-1 w-full px-2 group">
      {/* Desktop connecting arrow */}
      {hasArrow && (
        <div className="absolute top-[24px] -translate-y-1/2 left-[65%] right-[-35%] flex items-center -z-10 hidden lg:flex">
          <div className="h-[1px] border-t-[1.5px] border-dashed border-[#c8d2e0] w-full" />
          <div className="text-[#93a0b4] -ml-[2px] mt-[1px]">
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </div>
        </div>
      )}

      {/* Number badge */}
      <div className="w-[48px] h-[48px] rounded-full bg-[#e7eef9] text-[#1c4d9c] font-bold text-xl flex items-center justify-center mb-6">
        {number}
      </div>

      {/* Icon circle */}
      <div className="w-[88px] h-[88px] rounded-full bg-[#0b1d36] text-white flex items-center justify-center mb-5 transition-transform group-hover:scale-[1.03] duration-300">
        {React.cloneElement(icon as React.ReactElement<any>, { size: 36, strokeWidth: 1.5 })}
      </div>

      {/* Title */}
      <h3 className="font-bold text-[#0b1d36] uppercase tracking-[0.06em] text-[0.8rem] md:text-[0.85rem] mb-3">
        {title}
      </h3>

      {/* Divider */}
      <div className="w-6 h-[2px] bg-[#1c4d9c] mb-3 transition-all duration-300 group-hover:w-8"></div>

      {/* Description */}
      <p className="text-[#3a4a63] text-[0.9rem] font-medium leading-[1.6] max-w-[160px] mx-auto">
        {desc}
      </p>
    </RevealOnView>
  );
}

function FeatureItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex items-start lg:items-center lg:justify-center gap-4 border-l-0 lg:border-l lg:border-[#e3e7ee] lg:first:border-l-0 h-full w-full">
      <div className="text-[#1c4d9c] flex-shrink-0 mt-1 lg:mt-0 bg-white rounded-full">
        <CheckCircle2 size={28} strokeWidth={1.5} />
      </div>
      <div className="flex flex-col text-left">
        <span className="font-bold text-[0.95rem] text-[#0b1d36] leading-snug">{title}</span>
        <span className="text-[0.9rem] text-[#5b6a82] leading-snug mt-1">{desc}</span>
      </div>
    </div>
  );
}
