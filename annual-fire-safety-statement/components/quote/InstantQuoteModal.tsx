'use client';

/**
 * AFSS — Instant Quote modal shell.
 *
 * Two-column layout:
 *   LEFT  — the QuoteFlow (forms / steps / success state).
 *   RIGHT — fixed brand panel with overlay + headline. Hides on
 *           mobile (sm: only).
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
    document.body.classList.add('quote-modal-open');
    setLoading(true);
    fetch('/api/afss/quote/status', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setInitialSummary(d.session ?? null))
      .finally(() => setLoading(false));
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('quote-modal-open');
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="afss-quote-title"
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6"
    >
      <div className="relative flex w-full max-h-[calc(100dvh-2rem)] flex-col overflow-hidden bg-white shadow-2xl sm:max-h-[min(900px,calc(100dvh-3rem))] sm:max-w-5xl sm:rounded-2xl md:flex-row">
        {/* CLOSE — top right of left column */}
        <button
          onClick={onClose}
          aria-label="Close quote wizard"
          className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 text-gray-500 hover:bg-white hover:text-black"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* LEFT — flow */}
        <div className="relative flex w-full flex-col overflow-y-auto bg-white md:w-3/5 md:min-w-[420px]">
          {loading ? (
            <div className="flex flex-1 items-center justify-center p-12 text-sm text-gray-400">
              Loading…
            </div>
          ) : (
            <QuoteFlow onClose={onClose} initialSummary={initialSummary} />
          )}
        </div>

        {/* RIGHT — brand panel (hidden on mobile) */}
        <aside
          className="relative hidden w-2/5 overflow-hidden bg-black text-white md:flex md:flex-col md:justify-between md:p-10"
          aria-hidden
        >
          {/* Background image gradient (no random stock — pure CSS). */}
          <div
            className="absolute inset-0 opacity-90"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 0%, rgba(28,77,156,0.45), transparent 60%), ' +
                'radial-gradient(circle at 90% 90%, rgba(11,29,54,0.35), transparent 60%), ' +
                'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)',
            }}
          />
          {/* Decorative fire safety pattern (low opacity). */}
          <div className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><circle cx='30' cy='30' r='1' fill='%23ffffff'/></svg>\")",
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative flex items-center gap-2">
            <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-[#0b1d36] to-[#1c4d9c]" />
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-white">
              AFSS Instant Quote
            </span>
          </div>

          <div className="relative space-y-6">
            <h1 id="afss-quote-title" className="text-3xl font-black uppercase leading-tight tracking-tight md:text-4xl">
              Your building.
              <br />
              Your AFSS.
              <br />
              <span className="bg-gradient-to-r from-[#0b1d36] to-[#1c4d9c] bg-clip-text text-transparent">
                Your quote.
              </span>
            </h1>
            <p className="max-w-sm text-base text-white">
              Simple details. One document. We&apos;ll take it from there.
            </p>
            <ul className="space-y-2 text-sm text-white">
              {['Next → Next → Next', 'Quote', "We'll be in touch"].map((t, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#1c4d9c]" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative text-xl font-bold text-white">
            <a href="tel:1300765594" className="hover:text-white transition-colors">
              Call 1300 765 594
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
