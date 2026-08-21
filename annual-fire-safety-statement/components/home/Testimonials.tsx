"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import RevealOnView from "@/components/RevealOnView";
import testimonials, { hasTestimonials } from "@/data/testimonials";

/**
 * AFSS homepage — 11 / Testimonials.
 *
 * Editorial single testimonial. Navigation is gated when the data array
 * is empty. No fabricated quotes — the empty state is honest.
 */

export default function Testimonials() {
  // Hide the section entirely until approved testimonial data exists.
  if (!hasTestimonials) return null;

  const [index, setIndex] = useState(0);
  const list = testimonials;
  const total = list.length;

  // Read-time clamp avoids the need for a setState-in-effect guard.
  const safeIndex = total > 0 ? Math.min(index, total - 1) : 0;

  const next = () => {
    if (total <= 1) return;
    setIndex((i) => (i + 1) % total);
  };
  const prev = () => {
    if (total <= 1) return;
    setIndex((i) => (i - 1 + total) % total);
  };

  return (
    <section className="bg-white section-y-tight w-full overflow-hidden">
      <div className="container-inner">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 lg:mb-10 gap-6">
          <div className="flex-1">
            <RevealOnView>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#b0141f] text-white font-bold text-[0.85rem] px-2 py-0.5 rounded-[3px] leading-tight">
                  11
                </div>
                <span className="text-[#1c4d9c] font-bold text-[0.85rem] tracking-[0.15em] uppercase">
                  / TESTIMONIALS
                </span>
              </div>
              <h2 className="h-section">What our clients <span className="text-[#b0141f]">say.</span></h2>
            </RevealOnView>
          </div>
        </div>

        <RevealOnView>
          <figure className="relative bg-[#0b1d36] text-white rounded-[0.25rem] p-6 sm:p-10 lg:p-14 overflow-hidden">
            <span
              aria-hidden="true"
              className="absolute left-0 top-0 h-1 w-12 bg-[#b0141f]"
            />
            <blockquote
              className="text-[clamp(1.4rem,2.4vw,2.1rem)] font-extrabold tracking-[-0.01em] leading-[1.18] text-white max-w-[44rem]"
              style={{ textWrap: "balance" }}
            >
              &ldquo;{list[safeIndex].quote}&rdquo;
            </blockquote>
            <figcaption className="mt-7 flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="m-0 text-[1rem] font-extrabold text-white">
                  {list[safeIndex].name}
                </p>
                <p className="mt-1 text-[0.85rem] text-white/70 leading-snug">
                  {list[safeIndex].role} &middot; {list[safeIndex].propertyType} &middot;{" "}
                  {list[safeIndex].location}
                </p>
              </div>

              <div className="flex items-center gap-4 text-white/80">
                <span className="font-mono text-[0.85rem]">
                  {String(safeIndex + 1).padStart(2, "0")} /{" "}
                  {String(total).padStart(2, "0")}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={prev}
                    disabled={total <= 1}
                    aria-label="Previous testimonial"
                    className="w-9 h-9 rounded-full border border-white/30 text-white flex items-center justify-center transition-colors hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft size={14} strokeWidth={2.4} />
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    disabled={total <= 1}
                    aria-label="Next testimonial"
                    className="w-9 h-9 rounded-full border border-white/30 text-white flex items-center justify-center transition-colors hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ArrowRight size={14} strokeWidth={2.4} />
                  </button>
                </div>
              </div>
            </figcaption>
          </figure>
        </RevealOnView>
      </div>
    </section>
  );
}