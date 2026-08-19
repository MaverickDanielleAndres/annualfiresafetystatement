"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

export type DocumentType = "afss" | "fire-safety-schedule" | "none" | null;

interface InstantQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: DocumentType;
}

export default function InstantQuoteModal({ isOpen, onClose, documentType }: InstantQuoteModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    setIsMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setStep(1); // Reset to step 1 on open
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isMounted || !isOpen) return null;

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 6) {
      setStep(step + 1);
    } else {
      alert("Quote requested! We'll be in touch.");
      onClose();
    }
  };

  const getStepTitle = () => {
    switch(step) {
      case 1: return <><span className="block">LET'S GET</span><span className="block">STARTED.</span></>;
      case 2: return "YOUR BUILDING.";
      case 3: return "CONFIRM PROPERTY.";
      case 4: return "UPLOAD DOCUMENT.";
      case 5: return "WHEN IS IT DUE?";
      case 6: return "ALL SET.";
      default: return "LET'S GET STARTED.";
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-opacity">
      <div 
        className="bg-white w-full max-w-[1000px] max-h-[95vh] md:max-h-[90vh] rounded-2xl shadow-2xl relative flex flex-col md:flex-row overflow-hidden animate-[fadeIn_0.4s_ease-out]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-modal-title"
      >
        {/* Left Side: Dynamic Form */}
        <div className="w-full md:w-[65%] p-6 md:p-10 flex flex-col bg-white relative z-10 overflow-y-auto md:overflow-visible">
          <div className="flex-1 flex flex-col h-full justify-center">
            
            {/* Header / Progress Area */}
            <div className="mb-4 lg:mb-6">
              <p className="font-bold tracking-[0.1em] uppercase text-[9px] lg:text-[10px] text-[#ff5614] mb-1.5 lg:mb-2">STEP {step} OF 6</p>
              <div className="w-full h-1 bg-gray-200 rounded-full mb-4 lg:mb-5 flex">
                 <div className="h-full bg-[#ff5614] rounded-full transition-all duration-300" style={{ width: `${(step / 6) * 100}%` }}></div>
              </div>
              <h2 id="quote-modal-title" className="text-3xl md:text-4xl lg:text-[2.5rem] font-black uppercase tracking-tight text-black leading-[0.9] mb-2 lg:mb-3">
                {getStepTitle()}
              </h2>
              {step === 1 && (
                <p className="text-gray-500 text-xs md:text-sm font-medium">Tell us a bit about yourself.</p>
              )}
              {step === 2 && (
                <p className="text-gray-500 text-xs md:text-sm font-medium">Enter the address to locate your property.</p>
              )}
              {step === 3 && (
                <p className="text-gray-500 text-xs md:text-sm font-medium mb-3">Is this your building?</p>
              )}
              {step === 4 && (
                <p className="text-gray-500 text-xs md:text-sm font-medium">Please provide your AFSS or Fire Safety Schedule.</p>
              )}
              {step === 5 && (
                <p className="text-gray-500 text-xs md:text-sm font-medium">Select the due date for your AFSS.</p>
              )}
              {step === 6 && (
                <p className="text-gray-500 text-xs md:text-sm font-medium">We're analysing your building details to prepare an accurate quote.</p>
              )}
            </div>
            
            {/* Form Area */}
            {step === 1 && (
              <form className="space-y-3 lg:space-y-4 flex-1 flex flex-col" onSubmit={nextStep}>
                <div>
                  <label className="block text-[9px] lg:text-[10px] font-bold mb-1 uppercase tracking-widest text-gray-800">First Name</label>
                  <input type="text" required className="w-full border border-gray-200 px-3 py-2 lg:px-4 lg:py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5614] focus:border-transparent transition-all shadow-sm" placeholder="e.g. Sam" />
                </div>
                <div>
                  <label className="block text-[9px] lg:text-[10px] font-bold mb-1 uppercase tracking-widest text-gray-800">Email</label>
                  <input type="email" required className="w-full border border-gray-200 px-3 py-2 lg:px-4 lg:py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5614] focus:border-transparent transition-all shadow-sm" placeholder="sam@example.com" />
                </div>
                <div>
                  <label className="block text-[9px] lg:text-[10px] font-bold mb-1 uppercase tracking-widest text-gray-800">Mobile</label>
                  <input type="tel" required className="w-full border border-gray-200 px-3 py-2 lg:px-4 lg:py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5614] focus:border-transparent transition-all shadow-sm" placeholder="0400 000 000" />
                </div>
                <div className="pt-6 lg:pt-8 pb-2 lg:pb-4 mt-auto flex flex-col items-center">
                  <button type="submit" style={{ background: "linear-gradient(135deg, #ff5614 0%, #ffad05 100%)" }} className="w-full max-w-[280px] text-white font-bold h-[50px] md:h-[60px] flex items-center justify-center gap-2 rounded-lg uppercase tracking-widest hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-xs md:text-sm">
                    NEXT →
                  </button>
                  <div className="flex items-center justify-center gap-1.5 mt-3 lg:mt-4 text-emerald-600">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <span className="text-[10px] lg:text-xs text-gray-500 font-medium">Your details are saved as you go</span>
                  </div>
                </div>
              </form>
            )}

            {step === 2 && (
              <form className="space-y-3 lg:space-y-4 flex-1 flex flex-col" onSubmit={nextStep}>
                <div>
                  <label className="block text-[9px] lg:text-[10px] font-bold mb-1 uppercase tracking-widest text-gray-800">Address</label>
                  <input type="text" required className="w-full border border-gray-200 px-3 py-2 lg:px-4 lg:py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5614] focus:border-transparent transition-all shadow-sm" placeholder="Start typing address..." />
                </div>
                <div className="pt-6 lg:pt-8 pb-2 mt-auto flex flex-col items-center">
                  <button type="submit" style={{ background: "linear-gradient(135deg, #ff5614 0%, #ffad05 100%)" }} className="w-full max-w-[280px] text-white font-bold h-[50px] md:h-[60px] flex items-center justify-center rounded-lg uppercase tracking-widest hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-xs md:text-sm">
                    FIND BUILDING →
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <div className="flex-1 flex flex-col">
                <div className="w-full h-24 lg:h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-4 border border-gray-200">
                  <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px] lg:text-[10px]">[Street View Image]</span>
                </div>
                <form className="space-y-2.5 lg:space-y-3 mt-auto flex flex-col items-center pt-4" onSubmit={nextStep}>
                  <button type="submit" style={{ background: "linear-gradient(135deg, #ff5614 0%, #ffad05 100%)" }} className="w-full max-w-[280px] text-white font-bold h-[50px] md:h-[60px] flex items-center justify-center rounded-lg uppercase tracking-widest hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-xs md:text-sm">
                    YES, THIS IS IT →
                  </button>
                  <button type="button" onClick={() => setStep(2)} className="w-full max-w-[280px] bg-gray-50 border border-gray-200 text-gray-600 font-bold h-[50px] md:h-[60px] flex items-center justify-center rounded-lg uppercase tracking-widest hover:bg-gray-100 transition-all duration-300 text-xs md:text-sm">
                    CHANGE ADDRESS
                  </button>
                </form>
              </div>
            )}

            {step === 4 && (
              <form className="space-y-3 lg:space-y-4 flex-1 flex flex-col" onSubmit={nextStep}>
                <div className="w-full flex-1 min-h-[100px] border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center hover:border-[#ff5614] hover:bg-orange-50/30 transition-colors cursor-pointer bg-gray-50 mb-3">
                  <span className="text-gray-500 font-bold uppercase tracking-widest text-[9px] lg:text-[10px]">Click to Upload</span>
                </div>
                <div className="pt-6 lg:pt-8 pb-2 mt-auto flex flex-col items-center">
                  <button type="submit" style={{ background: "linear-gradient(135deg, #ff5614 0%, #ffad05 100%)" }} className="w-full max-w-[280px] text-white font-bold h-[50px] md:h-[60px] flex items-center justify-center rounded-lg uppercase tracking-widest hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-xs md:text-sm">
                    NEXT →
                  </button>
                </div>
              </form>
            )}

            {step === 5 && (
              <form className="space-y-3 lg:space-y-4 flex-1 flex flex-col items-center" onSubmit={nextStep}>
                <div className="w-full">
                  <input type="date" required className="w-full border border-gray-200 px-3 py-2 lg:px-4 lg:py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5614] focus:border-transparent transition-all shadow-sm" />
                </div>
                <button type="button" onClick={nextStep} className="w-full max-w-[280px] bg-gray-50 border border-gray-200 text-gray-600 font-bold h-[50px] md:h-[60px] flex items-center justify-center rounded-lg uppercase tracking-widest hover:bg-gray-100 transition-all duration-300 text-xs md:text-sm mt-4">
                  I'M NOT SURE
                </button>
                <div className="pt-4 lg:pt-6 pb-2 mt-auto flex flex-col items-center w-full">
                  <button type="submit" style={{ background: "linear-gradient(135deg, #ff5614 0%, #ffad05 100%)" }} className="w-full max-w-[280px] text-white font-bold h-[50px] md:h-[60px] flex items-center justify-center rounded-lg uppercase tracking-widest hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-xs md:text-sm">
                    NEXT →
                  </button>
                </div>
              </form>
            )}

            {step === 6 && (
              <form className="space-y-3 lg:space-y-4 flex-1 flex flex-col" onSubmit={nextStep}>
                <div className="pt-6 lg:pt-8 pb-2 mt-auto flex flex-col items-center">
                  <button type="submit" style={{ background: "linear-gradient(135deg, #ff5614 0%, #ffad05 100%)" }} className="w-full max-w-[280px] text-white font-bold h-[50px] md:h-[60px] flex items-center justify-center rounded-lg uppercase tracking-widest hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-xs md:text-sm">
                    SUBMIT REQUEST →
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Side: Image and Copy */}
        <div className="hidden md:flex md:w-[35%] relative flex-col p-6 lg:p-10 text-white overflow-hidden bg-black">
          <div className="absolute inset-0 z-0">
            <Image 
              src="/modalbg.png" 
              fill 
              className="object-cover" 
              alt="Building background" 
            />
            {/* Darker overlay to match reference image */}
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent"></div>
          </div>
          
          <div className="relative z-10 h-full flex flex-col justify-between">
             {/* Close button on desktop */}
             <button onClick={onClose} className="absolute -top-2 -right-2 text-gray-400 hover:text-white bg-black/40 hover:bg-black/80 transition-colors p-2 rounded-full" aria-label="Close modal">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                 <line x1="18" y1="6" x2="6" y2="18"></line>
                 <line x1="6" y1="6" x2="18" y2="18"></line>
               </svg>
             </button>
             
             {/* Upper Text Area */}
             <div className="pt-6 lg:pt-10">
               <p className="text-[9px] lg:text-[10px] font-bold tracking-[0.1em] uppercase mb-2 bg-gradient-to-r from-[#ff5614] to-[#ffad05] bg-clip-text text-transparent w-fit">INSTANT AFSS QUOTE</p>
               <h2 className="text-2xl lg:text-3xl xl:text-4xl font-black uppercase leading-[0.95] tracking-tight mb-4 lg:mb-6">
                 YOUR BUILDING.<br/>
                 YOUR <span className="text-red-600">AFSS</span>.<br/>
                 <span className="bg-gradient-to-r from-[#ff5614] to-[#ffad05] bg-clip-text text-transparent">YOUR QUOTE.</span>
               </h2>
               <p className="text-sm lg:text-base text-white max-w-[240px] leading-snug">
                 Simple details. One document. We'll take it from there.
               </p>
             </div>
             
             {/* Lower Text Area */}
             <div className="mt-auto pb-2 lg:pb-4">
               <p className="text-[#ff5614] text-[8px] lg:text-[9px] font-bold tracking-[0.1em] uppercase mb-3 lg:mb-4">FAST. SIMPLE. STRAIGHTFORWARD.</p>
               <ul className="space-y-2.5 lg:space-y-3">
                 {[
                   'Your details are saved as you go', 
                   'Secure AFSS upload', 
                   'No long enquiry form'
                 ].map((text, i) => (
                   <li key={i} className="flex items-center gap-2">
                     <div className="w-[14px] h-[14px] lg:w-[16px] lg:h-[16px] rounded-full bg-[#ff5614] flex items-center justify-center flex-shrink-0">
                       <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                         <polyline points="20 6 9 17 4 12"></polyline>
                       </svg>
                     </div>
                     <span className="text-gray-100 text-[10px] lg:text-xs font-medium">{text}</span>
                   </li>
                 ))}
               </ul>
             </div>
          </div>
        </div>
        
        {/* Mobile close button */}
        <button onClick={onClose} className="md:hidden absolute top-4 right-4 text-gray-400 hover:text-black bg-white/80 backdrop-blur rounded-full p-2 z-20 shadow-sm border border-gray-100">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}} />
    </div>
  );
}
