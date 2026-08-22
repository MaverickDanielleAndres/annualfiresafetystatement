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
import Image from 'next/image';
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
          {/* Background image */}
          <Image
            src="/sampleafss-nobg.png"
            alt="Sample AFSS"
            fill
            className="object-cover"
          />
          {/* Dark overlay gradient like before */}
          <div
            className="absolute inset-0 opacity-90"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 0%, rgba(28,77,156,0.6), transparent 60%), ' +
                'radial-gradient(circle at 90% 90%, rgba(11,29,54,0.6), transparent 60%), ' +
                'linear-gradient(180deg, rgba(26,26,26,0.85) 0%, rgba(10,10,10,0.95) 100%)',
            }}
          />

          <div className="relative flex items-center gap-2">
            <div className="h-8 w-1.5 rounded-full bg-red-600" />
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-white">
              AFSS Instant Quote
            </span>
          </div>

          <div className="relative space-y-6">
            <h1 id="afss-quote-title" className="text-3xl font-black uppercase leading-tight tracking-tight md:text-4xl text-white">
              Your building.
              <br />
              Your AFSS.
              <br />
              Your quote.
            </h1>
            <p className="max-w-sm text-base text-white">
              Simple details. One document. We&apos;ll take it from there.
            </p>
            <ul className="space-y-2 text-sm text-white">
              {[
                "1 — Your details",
                "2 — Building address",
                "3 — Assessment + AFSS",
              ].map((t, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-600" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative text-base font-bold text-white">
            <a href="tel:1300765594" className="hover:text-white transition-colors">
              Call 1300 765 594
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
