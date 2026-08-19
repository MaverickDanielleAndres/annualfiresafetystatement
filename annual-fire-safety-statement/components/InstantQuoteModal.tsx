"use client";

import React, { useEffect, useState } from "react";

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

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-white p-6 md:p-10 max-w-md w-full max-h-[95vh] overflow-y-auto rounded-2xl shadow-2xl relative animate-[fadeIn_0.3s_ease-out]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-modal-title"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors p-2 rounded-full hover:bg-gray-100"
          aria-label="Close modal"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        {step === 1 && (
          <>
            <div className="mb-6">
              <p className="font-bold tracking-widest uppercase mb-2 text-xs text-[#ff5614]">STEP 1 OF 6</p>
              <h2 id="quote-modal-title" className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black mb-2">
                Let's get started.
              </h2>
              <p className="text-gray-600">
                Tell us a bit about yourself.
                {documentType === "afss" && " We'll use your AFSS to prepare the quote."}
                {documentType === "fire-safety-schedule" && " We'll use your Fire Safety Schedule to prepare the quote."}
                {documentType === "none" && " We can still help you get sorted."}
              </p>
            </div>
            
            <form className="space-y-5" onSubmit={nextStep}>
              <div>
                <label className="block text-xs font-bold mb-1 uppercase tracking-wider text-gray-700">First Name</label>
                <input type="text" required className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5614] focus:border-transparent transition-all" placeholder="e.g. Sam" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 uppercase tracking-wider text-gray-700">Email</label>
                <input type="email" required className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5614] focus:border-transparent transition-all" placeholder="sam@example.com" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 uppercase tracking-wider text-gray-700">Mobile</label>
                <input type="tel" required className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5614] focus:border-transparent transition-all" placeholder="0400 000 000" />
              </div>
              <div className="pt-2">
                <button type="submit" style={{ background: "linear-gradient(135deg, #ff5614 0%, #ffad05 100%)" }} className="w-full text-white font-bold min-h-[60px] flex items-center justify-center rounded-lg uppercase tracking-widest hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                  Continue →
                </button>
              </div>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <div className="mb-6">
              <p className="font-bold tracking-widest uppercase mb-2 text-xs text-[#ff5614]">STEP 2 OF 6</p>
              <h2 id="quote-modal-title" className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black mb-2">
                Your Building.
              </h2>
              <p className="text-gray-600">Enter the address to locate your property.</p>
            </div>
            <form className="space-y-5" onSubmit={nextStep}>
              <div>
                <label className="block text-xs font-bold mb-1 uppercase tracking-wider text-gray-700">Address</label>
                <input type="text" required className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5614] focus:border-transparent transition-all" placeholder="Start typing address..." />
              </div>
              <div className="pt-2">
                <button type="submit" style={{ background: "linear-gradient(135deg, #ff5614 0%, #ffad05 100%)" }} className="w-full text-white font-bold min-h-[60px] flex items-center justify-center rounded-lg uppercase tracking-widest hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                  Find Building →
                </button>
              </div>
            </form>
          </>
        )}

        {step === 3 && (
          <>
            <div className="mb-6">
              <p className="font-bold tracking-widest uppercase mb-2 text-xs text-[#ff5614]">STEP 3 OF 6</p>
              <h2 id="quote-modal-title" className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black mb-2">
                Confirm Property.
              </h2>
              <p className="text-gray-600 mb-4">Is this your building?</p>
              <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center mb-2">
                <span className="text-gray-400 font-bold uppercase tracking-widest text-sm">[Street View Image]</span>
              </div>
            </div>
            <form className="space-y-3" onSubmit={nextStep}>
              <button type="submit" style={{ background: "linear-gradient(135deg, #ff5614 0%, #ffad05 100%)" }} className="w-full text-white font-bold min-h-[60px] flex items-center justify-center rounded-lg uppercase tracking-widest hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                YES, THIS IS IT →
              </button>
              <button type="button" onClick={() => setStep(2)} className="w-full bg-gray-100 text-gray-700 font-bold py-4 rounded-lg uppercase tracking-widest hover:bg-gray-200 transition-all duration-300">
                CHANGE ADDRESS
              </button>
            </form>
          </>
        )}

        {step === 4 && (
          <>
            <div className="mb-6">
              <p className="font-bold tracking-widest uppercase mb-2 text-xs text-[#ff5614]">STEP 4 OF 6</p>
              <h2 id="quote-modal-title" className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black mb-2">
                Upload Document.
              </h2>
              <p className="text-gray-600">Please provide your AFSS or Fire Safety Schedule.</p>
            </div>
            <form className="space-y-5" onSubmit={nextStep}>
              <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-[#ff5614] transition-colors cursor-pointer bg-gray-50">
                <span className="text-gray-500 font-bold uppercase tracking-widest text-sm">Click to Upload</span>
              </div>
              <div className="pt-2">
                <button type="submit" style={{ background: "linear-gradient(135deg, #ff5614 0%, #ffad05 100%)" }} className="w-full text-white font-bold min-h-[60px] flex items-center justify-center rounded-lg uppercase tracking-widest hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                  Continue →
                </button>
              </div>
            </form>
          </>
        )}

        {step === 5 && (
          <>
            <div className="mb-6">
              <p className="font-bold tracking-widest uppercase mb-2 text-xs text-[#ff5614]">STEP 5 OF 6</p>
              <h2 id="quote-modal-title" className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black mb-2">
                When is it due?
              </h2>
              <p className="text-gray-600">Select the due date for your AFSS.</p>
            </div>
            <form className="space-y-5" onSubmit={nextStep}>
              <div>
                <input type="date" required className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5614] focus:border-transparent transition-all" />
              </div>
              <button type="button" onClick={nextStep} className="w-full bg-gray-100 text-gray-700 font-bold py-4 rounded-lg uppercase tracking-widest hover:bg-gray-200 transition-all duration-300">
                I'M NOT SURE
              </button>
              <div className="pt-2">
                <button type="submit" style={{ background: "linear-gradient(135deg, #ff5614 0%, #ffad05 100%)" }} className="w-full text-white font-bold min-h-[60px] flex items-center justify-center rounded-lg uppercase tracking-widest hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                  Continue →
                </button>
              </div>
            </form>
          </>
        )}

        {step === 6 && (
          <>
            <div className="mb-6">
              <p className="font-bold tracking-widest uppercase mb-2 text-xs text-[#ff5614]">STEP 6 OF 6</p>
              <h2 id="quote-modal-title" className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black mb-2">
                All set.
              </h2>
              <p className="text-gray-600">We're analysing your building details to prepare an accurate quote.</p>
            </div>
            <form className="space-y-5" onSubmit={nextStep}>
              <div className="pt-2">
                <button type="submit" style={{ background: "linear-gradient(135deg, #ff5614 0%, #ffad05 100%)" }} className="w-full text-white font-bold min-h-[60px] flex items-center justify-center rounded-lg uppercase tracking-widest hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                  Submit Request →
                </button>
              </div>
            </form>
          </>
        )}

      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}} />
    </div>
  );
}
