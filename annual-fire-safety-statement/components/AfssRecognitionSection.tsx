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
    <section className="bg-white py-10 lg:py-16 w-full overflow-hidden relative">
      <style>{`
        .afss-option {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-align: left;
          padding: 1.4rem 0;
          border-bottom: 1px solid #e3e7ee;
          background-color: transparent;
          transition: all 0.25s ease;
          cursor: pointer;
        }
        .afss-option:first-child {
          border-top: 1px solid #e3e7ee;
        }
        .afss-option:hover {
          border-bottom-color: #1c4d9c;
        }
        .afss-option-text {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        .afss-option-title {
          font-weight: 800;
          color: #0b1d36;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          transition: color 0.25s ease;
          font-size: 0.95rem;
        }
        .afss-option:hover .afss-option-title {
          color: #1c4d9c;
        }
        .afss-option-desc {
          font-size: 0.875rem;
          color: #5b6a82;
          font-weight: 500;
        }
        .afss-option-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #93a0b4;
          transition: all 0.25s ease;
          flex-shrink: 0;
          margin-left: 1rem;
        }
        .afss-option:hover .afss-option-arrow {
          color: #1c4d9c;
          transform: translateX(4px);
        }
      `}</style>
      <div className="container-inner w-full max-w-[1280px] mx-auto relative z-10 px-4 sm:px-6 lg:px-8">

        {/* Mobile order: Title -> Image -> Choices -> CTA */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* Left Column (Text & Choices) */}
          <div className="w-full lg:w-[45%] flex flex-col items-center text-center order-1 lg:order-1">
            <RevealOnView className="flex flex-col items-center w-full">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-2 h-2 bg-[#b0141f]" aria-hidden="true" />
                <span className="text-xs font-bold tracking-[0.18em] uppercase text-[#1c4d9c]">
                  01 / Your AFSS
                </span>
              </div>

              <h2 className="text-[clamp(2.5rem,4vw,3.5rem)] font-extrabold tracking-tight leading-[1.04] mb-5 text-[#0b1d36]">
                Have you <span className="text-[#1c4d9c]">got</span>
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
                  an AFSS?
                </span>
              </h2>

              <p className="text-lg md:text-xl font-medium text-[#3a4a63] mb-6 max-w-[480px] leading-relaxed">
                If you have an AFSS or Fire Safety Schedule, you&apos;re ready to get started.
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
                    <span className="afss-option-desc">Start with your building&apos;s current Schedule.</span>
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
                    <span className="afss-option-title">I CAN&apos;T FIND EITHER</span>
                    <span className="afss-option-desc">That&apos;s okay. We can still get you started.</span>
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
                  className="btn btn-primary animate-pump px-8 py-4 text-[0.95rem] tracking-[0.06em] font-bold uppercase shadow-[0_8px_24px_rgba(11,29,54,0.18)] rounded-full w-full sm:w-auto group"
                  style={{
                    fontSize: "clamp(0.95rem, 1.2vw, 1.05rem)",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
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
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[120px] md:text-[200px] lg:text-[280px] font-black tracking-tighter pointer-events-none select-none text-[#0b1d36]/[0.03] whitespace-nowrap"
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
                style={{ objectFit: "contain" }}
                className="drop-shadow-[0_18px_38px_rgba(11,29,54,0.18)] z-10"
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
