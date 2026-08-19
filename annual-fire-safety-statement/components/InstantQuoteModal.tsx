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

  useEffect(() => {
    setIsMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isMounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-white p-8 md:p-10 max-w-md w-full rounded-2xl shadow-2xl relative animate-[fadeIn_0.3s_ease-out]"
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
        
        <div className="mb-6">
          <p className="font-bold tracking-widest uppercase mb-2 text-xs text-[#ff5614]">INSTANT QUOTE</p>
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
        
        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); alert('Information saved! Next step would go here.'); onClose(); }}>
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
            <button type="submit" className="w-full bg-gradient-to-r from-[#ff5614] to-[#ffad05] text-white font-bold py-4 rounded-lg uppercase tracking-widest hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              Continue →
            </button>
          </div>
        </form>
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
