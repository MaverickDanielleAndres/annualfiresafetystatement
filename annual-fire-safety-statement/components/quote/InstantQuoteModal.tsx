'use client';

/**
 * AFSS — Instant Quote modal shell.
 *
 * Renders the QuoteFlow inside a responsive overlay:
 *   * Mobile: full-screen sheet
 *   * Desktop: centred card
 *
 * Mounts only on the client. Body scroll is locked while open.
 */

import { useEffect, useState } from 'react';
import QuoteFlow from './QuoteFlow';
import type { QuoteSessionSummary } from '@/lib/afss/types';

interface InstantQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InstantQuoteModal({ isOpen, onClose }: InstantQuoteModalProps) {
  const [mounted, setMounted] = useState(false);
  const [initialSummary, setInitialSummary] = useState<QuoteSessionSummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    setLoading(true);
    fetch('/api/afss/quote/status')
      .then((r) => r.json())
      .then((d) => setInitialSummary(d.session ?? null))
      .finally(() => setLoading(false));
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="afss-quote-title"
      className="fixed inset-0 z-[100] flex items-stretch justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
    >
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[90vh] sm:max-w-xl sm:rounded-2xl">
        <button
          onClick={onClose}
          aria-label="Close quote wizard"
          className="absolute right-3 top-3 z-10 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-black"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <h1 id="afss-quote-title" className="sr-only">
          AFSS Instant Quote
        </h1>
        {loading ? (
          <div className="flex flex-1 items-center justify-center p-12 text-sm text-gray-400">
            Loading…
          </div>
        ) : (
          <QuoteFlow onClose={onClose} initialSummary={initialSummary} />
        )}
      </div>
    </div>
  );
}