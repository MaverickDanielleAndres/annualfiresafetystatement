"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Star, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import testimonials, { hasTestimonials, type TestimonialEntry } from "@/data/testimonials";

const HEADING_ID = "testimonials-heading";
const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export default function Testimonials() {
  if (!hasTestimonials) return null;

  return (
    <section
      id="testimonials"
      aria-labelledby={HEADING_ID}
      className="section-y-tight w-full overflow-hidden bg-white"
    >
      <div className="container-inner">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#b0141f] text-white font-bold text-[0.85rem] px-2 py-0.5 rounded-[3px] leading-tight">
                14
              </div>
              <span className="text-[#1c4d9c] font-bold text-[0.85rem] tracking-[0.15em] uppercase">
                / TESTIMONIALS
              </span>
            </div>
            <h2
              id={HEADING_ID}
              className="text-[#0b1d36] font-extrabold text-[clamp(1.75rem,3vw,2.75rem)] tracking-[-0.02em] leading-[1.1]"
            >
              What our clients <span className="text-[#b0141f]">say.</span>
            </h2>
          </div>
          <div className="md:max-w-[22rem] lg:max-w-md">
            <p className="text-[#3b4b61] text-[0.95rem] md:text-[1rem] leading-[1.6]">
              Approved reviews from building owners and managers we have
              worked with.
            </p>
          </div>
        </div>

        <TestimonialCarousel />
      </div>
    </section>
  );
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
    position: 'relative' as const,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    position: 'relative' as const,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
    position: 'absolute' as const,
    top: 0,
    left: 0,
  }),
};

function TestimonialCarousel() {
  const [[page, direction], setPage] = useState([0, 0]);
  const total = testimonials.length;
  
  // Need a stable positive index
  const imageIndex = ((page % total) + total) % total;

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  const activeItem = testimonials[imageIndex];
  const nextItem = testimonials[(imageIndex + 1) % total];

  return (
    <div className="relative w-full overflow-visible">
      {/* Container for the absolute positioning of exiting slides */}
      <div className="relative w-full">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={page}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);
              if (swipe < -swipeConfidenceThreshold) {
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1);
              }
            }}
            className="w-full flex gap-6 md:gap-8 items-stretch cursor-grab active:cursor-grabbing"
          >
            {/* Active Card */}
            <div className="w-full lg:w-[calc(100%-24rem)] shrink-0 h-full select-none">
              <ActiveCard 
                item={activeItem} 
                index={imageIndex} 
                total={total} 
                onNext={() => paginate(1)} 
                onPrev={() => paginate(-1)} 
              />
            </div>

            {/* Peeking Next Card */}
            <div className="hidden lg:block w-[22rem] shrink-0 opacity-70 pointer-events-none select-none">
              <InactiveCard item={nextItem} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating overlap button (visible on large screens where peeking card is visible) */}
      <button
        onClick={() => paginate(1)}
        className="hidden lg:flex absolute top-1/2 -translate-y-1/2 right-[21rem] w-11 h-11 bg-white border border-gray-200 text-[#0b1d36] rounded-full items-center justify-center shadow-xl hover:scale-105 transition-transform z-50 focus-visible:outline-2 focus-visible:outline-[#1c4d9c] focus-visible:outline-offset-2"
        aria-label="Next testimonial"
      >
        <ArrowRight size={18} strokeWidth={2.5} />
      </button>
    </div>
  );
}

function ActiveCard({ item, index, total, onNext, onPrev }: { item: TestimonialEntry, index: number, total: number, onNext: () => void, onPrev: () => void }) {
  return (
    <div className="bg-[#0b1d36] rounded-2xl flex flex-col md:flex-row overflow-hidden h-full shadow-xl">
      {/* Content */}
      <div className="flex-1 p-6 md:p-8 lg:p-10 flex flex-col relative">
        <span
          className="absolute top-4 left-6 md:top-6 md:left-8 font-serif select-none leading-none pointer-events-none"
          style={{
            fontSize: "clamp(4rem,6vw,6rem)",
            color: "rgba(255,255,255,0.15)",
            fontFamily: "Georgia, 'Times New Roman', serif",
          }}
        >
          &ldquo;
        </span>
        
        <blockquote className="mt-4 md:mt-6 relative z-10 text-white font-bold text-[clamp(1.1rem,1.5vw,1.35rem)] leading-[1.45] tracking-[-0.01em] text-balance">
          {item.quote}
        </blockquote>

        <div className="w-10 h-[2px] bg-[#b0141f] my-5 md:my-6 shrink-0" />

        <div className="mt-auto">
          {typeof item.rating === "number" && (
            <div className="mb-4">
              <RatingStars value={item.rating} />
            </div>
          )}
          <div>
            <div className="text-white font-bold text-lg md:text-[1.1rem] leading-tight tracking-[-0.01em]">{item.name}</div>
            <div className="text-[#a0abbc] text-[0.9rem] mt-0.5">{item.role}</div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[#a0abbc] text-[0.85rem]">
            <MapPin size={16} className="text-[#1c4d9c] shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>
        </div>

        {/* Footer controls */}
        <div className="mt-8 md:mt-10 flex items-center justify-between">
          <div className="flex items-center gap-4 text-white font-mono text-sm">
            <span>
              {String(index + 1).padStart(2, "0")} <span className="opacity-50">/ {String(total).padStart(2, "0")}</span>
            </span>
            <div className="flex gap-1 w-20 md:w-24">
              {Array.from({ length: total }).map((_, i) => (
                <div key={i} className={`h-[2px] flex-1 ${i === index ? 'bg-[#b0141f]' : 'bg-white/20'}`} />
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
               onClick={(e) => { e.stopPropagation(); onPrev(); }} 
               className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white transition-all duration-200 hover:bg-white/10 hover:border-white/60 active:scale-95 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
               aria-label="Previous"
             >
               <ArrowLeft size={16} strokeWidth={2.5} />
             </button>
             <button 
               onClick={(e) => { e.stopPropagation(); onNext(); }} 
               className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#0b1d36] transition-all duration-200 hover:bg-gray-200 active:scale-95 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
               aria-label="Next"
             >
               <ArrowRight size={16} strokeWidth={2.5} />
             </button>
          </div>
        </div>
      </div>
      
      {/* Image Side */}
      {item.image && (
        <div className="w-full md:w-[45%] shrink-0 p-4 md:p-5 md:pl-0 flex flex-col pointer-events-none">
          <div className="relative w-full h-56 md:h-full min-h-[260px] md:min-h-0 rounded-[0.75rem] overflow-hidden bg-[#102b4f]">
             <Image 
               src={item.image} 
               alt={item.name} 
               fill 
               className="object-cover" 
               sizes="(max-width: 768px) 100vw, 45vw"
             />
          </div>
        </div>
      )}
    </div>
  );
}

function InactiveCard({ item }: { item: TestimonialEntry }) {
  return (
    <div className="bg-white rounded-2xl p-6 lg:p-8 h-full shadow-[0_8px_30px_rgba(11,29,54,0.12)] border border-[#e3e7ee] flex flex-col relative overflow-hidden">
      <span
        className="absolute top-4 left-6 font-serif select-none leading-none pointer-events-none"
        style={{
          fontSize: "5rem",
          color: "rgba(28, 77, 156, 0.15)",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        &ldquo;
      </span>
      
      <p className="mt-6 text-[#0b1d36] font-medium text-[0.9rem] leading-[1.6] flex-1 relative z-10 text-balance">
        {item.quote.length > 140 ? item.quote.substring(0, 140) + '...' : item.quote}
      </p>
      
      <div className="mt-8">
        {typeof item.rating === "number" && (
          <div className="mb-4">
            <RatingStars value={item.rating} />
          </div>
        )}
        <div>
          <div className="text-[#0b1d36] font-bold text-[0.95rem] tracking-tight">{item.name}</div>
          <div className="text-[#5b6a82] text-[0.8rem] mt-0.5">{item.role}</div>
        </div>
        <div className="mt-4 text-[#0b1d36] font-bold text-[0.7rem] tracking-[0.08em] uppercase">
          {item.location.split('|')[0].trim()}
        </div>
        <div className="text-[#5b6a82] text-[0.7rem] mt-0.5 tracking-[0.04em] uppercase">
          {item.location.split('|')[1]?.trim() || "NSW"}
        </div>
      </div>
    </div>
  );
}

function RatingStars({ value }: { value: number }) {
  return (
    <div
      role="img"
      aria-label={`${value} out of 5 stars`}
      className="inline-flex items-center gap-[2px] text-[#b0141f]"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={16}
          strokeWidth={2}
          aria-hidden="true"
          fill={i < value ? "#b0141f" : "transparent"}
          className={i < value ? "text-[#b0141f]" : "text-gray-300"}
        />
      ))}
    </div>
  );
}
