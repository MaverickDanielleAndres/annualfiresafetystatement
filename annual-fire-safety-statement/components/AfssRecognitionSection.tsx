"use client";

import React, { useState } from "react";
import Image from "next/image";
import InstantQuoteModal from "./quote/InstantQuoteModal";
import RevealOnView from "./RevealOnView";

export default function AfssRecognitionSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<'afss' | 'fire-safety-schedule' | 'none' | null>(null);

  const handleOpenQuote = (docType: 'afss' | 'fire-safety-schedule' | 'none' | null) => {
    setSelectedDoc(docType);
    setModalOpen(true);
  };

  return (
    <section className="bg-white pt-8 pb-10 md:pt-12 md:pb-16 lg:pt-16 lg:pb-16 w-full overflow-hidden relative">
      <style>{`
        .afss-option {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-align: left;
          padding: 1.5rem 0;
          border-bottom: 1px solid #e5e7eb;
          background-color: transparent;
          transition: all 0.25s ease;
          cursor: pointer;
        }
        .afss-option:first-child {
          border-top: 1px solid #e5e7eb;
        }
        .afss-option:hover {
          border-bottom-color: #ff5614;
        }
        .afss-option-text {
          display: flex;
          flex-direction: column;
        }
        .afss-option-title {
          font-weight: 800;
          color: #111111;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: color 0.25s ease;
        }
        .afss-option:hover .afss-option-title {
          color: #ff5614;
        }
        .afss-option-desc {
          font-size: 0.875rem;
          color: #6b7280;
          margin-top: 0.25rem;
          font-weight: 500;
        }
        .afss-option-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #d1d5db;
          transition: all 0.25s ease;
          flex-shrink: 0;
          margin-left: 1rem;
        }
        .afss-option:hover .afss-option-arrow {
          color: #ff5614;
          transform: translateX(4px);
        }
      `}</style>
      <div className="container-inner w-full max-w-[1280px] mx-auto relative z-10 px-4 sm:px-6 lg:px-8">
        
        {/* Mobile order: Title -> Image -> Choices -> CTA */}
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          
          {/* Left Column (Text & Choices) */}
          <div className="w-full lg:w-[45%] flex flex-col items-center text-center order-1 lg:order-1">
            <RevealOnView className="flex flex-col items-center w-full">
              <p className="font-bold tracking-widest uppercase mb-2 text-xs md:text-sm flex items-center justify-center gap-3">
                <span className="w-2 h-2 bg-[#fb5614]" aria-hidden="true" />
                <span className="bg-gradient-to-r from-[#ff5614] to-[#ffad05] bg-clip-text text-transparent">01 / YOUR AFSS</span>
              </p>
              
              <h2 className="text-[clamp(2.5rem,4vw,3.5rem)] font-black tracking-tight leading-[1.05] mb-4 text-[#111111]">
                Have you <span className="text-[#ff5614]">got</span><br/>
                <span className="bg-gradient-to-r from-[#ff5614] to-[#ffad05] bg-clip-text text-transparent">an AFSS?</span>
              </h2>
              
              <p className="text-lg md:text-xl font-medium text-gray-700 mb-6 max-w-[480px] leading-relaxed">
                If you have an AFSS or Fire Safety Schedule, you're ready to get started.
              </p>
            </RevealOnView>

            {/* In mobile, this is pushed below the image via ordering */}
            <div className="w-full max-w-[500px] flex flex-col mb-8 order-3 lg:order-none mt-6 lg:mt-0">
              <RevealOnView delay={100}>
                <button 
                  onClick={() => handleOpenQuote("afss")}
                  className="afss-option"
                >
                  <div className="afss-option-text">
                    <span className="afss-option-title">YES, I HAVE MY AFSS</span>
                    <span className="afss-option-desc">Upload your current Annual Fire Safety Statement.</span>
                  </div>
                  <div className="afss-option-arrow">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </div>
                </button>
              </RevealOnView>

              <RevealOnView delay={200}>
                <button 
                  onClick={() => handleOpenQuote("fire-safety-schedule")}
                  className="afss-option"
                >
                  <div className="afss-option-text">
                    <span className="afss-option-title">I HAVE MY FIRE SAFETY SCHEDULE</span>
                    <span className="afss-option-desc">Start with your building's current Schedule.</span>
                  </div>
                  <div className="afss-option-arrow">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </div>
                </button>
              </RevealOnView>

              <RevealOnView delay={300}>
                <button 
                  onClick={() => handleOpenQuote("none")}
                  className="afss-option"
                >
                  <div className="afss-option-text">
                    <span className="afss-option-title">I CAN'T FIND EITHER</span>
                    <span className="afss-option-desc">That's okay. We can still get you started.</span>
                  </div>
                  <div className="afss-option-arrow">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </div>
                </button>
              </RevealOnView>
            </div>

            <div className="w-full order-4 lg:order-none">
              <RevealOnView delay={400}>
                <button 
                  onClick={() => handleOpenQuote(null)}
                  className="btn animate-pump !px-8 !py-4 !text-lg border-none shadow-md hover:scale-105 transition-transform w-full sm:w-auto group"
                  style={{ 
                    background: "linear-gradient(135deg, #ff2a00 0%, #ffb700 100%)",
                    color: "#ffffff",
                    fontSize: "clamp(0.95rem, 1.2vw, 1.05rem)", 
                    textDecoration: 'none', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}
                >
                  GET AN INSTANT QUOTE
                  <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                </button>
              </RevealOnView>
            </div>
          </div>

          {/* Right Column (Image) */}
          <div className="w-full lg:w-[55%] relative flex justify-center lg:justify-end items-center order-2 lg:order-2 px-4 lg:px-0">
            {/* Subtle background text */}
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[120px] md:text-[200px] lg:text-[280px] font-black tracking-tighter pointer-events-none select-none text-black/[0.03] whitespace-nowrap"
              aria-hidden="true"
            >
              AFSS
            </div>
            
            <RevealOnView delay={200} className="relative w-full max-w-[450px] lg:max-w-[700px] aspect-[1/1.2] flex items-center justify-center">
              <Image 
                src="/sampleafss-nobg.png"
                alt="Sample NSW Annual Fire Safety Statement"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                style={{ objectFit: 'contain' }}
                className="drop-shadow-2xl z-10"
                priority
              />
            </RevealOnView>
          </div>
        </div>
      </div>

      <InstantQuoteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </section>
  );
}
