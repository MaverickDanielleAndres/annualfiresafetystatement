"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ShieldCheck, ClipboardList, FileText, ZoomIn, X } from "lucide-react";

/**
 * AFSS homepage — 04 / Sample AFSS.
 */

const TOTAL_PAGES = 5;

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Verified by accredited practitioners",
    desc: "Completed by NSW Fire Safety Assessors in accordance with AS 1851-2012.",
  },
  {
    icon: ClipboardList,
    title: "Detailed and transparent",
    desc: "Each statement lists all essential fire safety measures and their compliance status.",
  },
  {
    icon: FileText,
    title: "For building owners and council",
    desc: "Accepted by councils and Fire and Rescue NSW as part of your annual compliance.",
  },
];

const DURATION = 0.45;
const EASE = [0.22, 1, 0.36, 1] as const;

const reducedVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0 },
};

export default function SampleAfss() {
  const [[current, direction], setPage] = useState([0, 0]);
  const [[modalPage, modalDir], setModalPage] = useState([0, 0]);
  const [modalOpen, setModalOpen] = useState(false);
  const prefersReduced = useReducedMotion();

  const pageIndex = ((current % TOTAL_PAGES) + TOTAL_PAGES) % TOTAL_PAGES;
  const modalPageIndex = ((modalPage % TOTAL_PAGES) + TOTAL_PAGES) % TOTAL_PAGES;

  const paginate = (dir: number) => setPage(([prev]) => [prev + dir, dir]);
  const goTo = (index: number) => setPage([index, index > pageIndex ? 1 : -1]);
  const modalPaginate = (dir: number) => setModalPage(([prev]) => [prev + dir, dir]);

  const openModal = () => {
    setModalPage([current, 0]);
    setModalOpen(true);
  };
  const closeModal = useCallback(() => setModalOpen(false), []);

  useEffect(() => {
    if (!modalOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowRight") modalPaginate(1);
      if (e.key === "ArrowLeft") modalPaginate(-1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [modalOpen, closeModal]);

  useEffect(() => {
    document.body.style.overflow = modalOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modalOpen]);

  // Carousel layout calculation
  const getCarouselStyle = (index: number) => {
    const diff = (index - pageIndex + TOTAL_PAGES) % TOTAL_PAGES;
    
    // Active item
    if (diff === 0) {
      return { x: "0%", scale: 1, zIndex: 20, opacity: 1, rotateY: 0 };
    }
    // Next item (right)
    if (diff === 1) {
      return { x: "45%", scale: 0.85, zIndex: 10, opacity: 0.8, rotateY: -15 };
    }
    // Previous item (left)
    if (diff === TOTAL_PAGES - 1) {
      return { x: "-45%", scale: 0.85, zIndex: 10, opacity: 0.8, rotateY: 15 };
    }
    // Hidden items
    return { x: "0%", scale: 0.6, zIndex: 1, opacity: 0, rotateY: 0 };
  };

  const modalSlideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? "20%" : "-20%", opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: DURATION, ease: EASE } },
    exit: (dir: number) => ({
      x: dir < 0 ? "20%" : "-20%",
      opacity: 0,
      transition: { duration: DURATION * 0.75, ease: EASE },
    }),
  };

  return (
    <>
      {/* ── SECTION ── */}
      <section id="sample-afss" className="bg-white section-y-tight w-full overflow-hidden">
        <div className="container-inner">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">

            {/* LEFT */}
            <div className="w-full lg:w-[42%] flex-shrink-0 flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#b0141f] text-white font-bold text-[0.85rem] px-2 py-0.5 rounded-[3px] leading-tight">04</div>
                <span className="text-[#1c4d9c] font-bold text-[0.85rem] tracking-[0.15em] uppercase">/ SAMPLE AFSS</span>
              </div>

              <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold text-[#0b1d36] leading-[1.05] tracking-[-0.02em]">
                See what a real<br />AFSS looks like.
              </h2>

              <p className="mt-5 text-[0.95rem] text-[#4a5568] leading-[1.65] max-w-[30rem]">
                Every Annual Fire Safety Statement we issue follows the strict requirements
                of the Environmental Planning and Assessment (Development Certification and
                Fire Safety) Regulation 2021.
              </p>

              <ul className="mt-8 flex flex-col gap-6">
                {FEATURES.map((f) => {
                  const Icon = f.icon;
                  return (
                    <li key={f.title} className="flex items-start gap-4">
                      <span className="flex-none w-9 h-9 rounded-full border border-[#e3e7ee] bg-white flex items-center justify-center text-[#b0141f] shadow-sm">
                        <Icon size={17} strokeWidth={1.7} aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-[0.95rem] font-bold text-[#0b1d36] leading-snug">{f.title}</p>
                        <p className="mt-1 text-[0.85rem] text-[#4a5568] leading-[1.55]">{f.desc}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>

            </div>

            {/* RIGHT — Floating Carousel */}
            <div className="w-full lg:w-[58%] flex flex-col items-center">
              {/* 3D Carousel area */}
              <div 
                className="relative w-full overflow-hidden" 
                style={{ height: 400, perspective: "1400px" }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  {Array.from({ length: TOTAL_PAGES }).map((_, i) => {
                    const style = getCarouselStyle(i);
                    const isCenter = style.x === "0%" && style.scale === 1;
                    
                    return (
                      <motion.div
                        key={i}
                        initial={false}
                        animate={style}
                        transition={{ duration: DURATION, ease: EASE }}
                        className={`absolute w-[70%] h-[90%] ${isCenter ? "cursor-zoom-in group" : "cursor-pointer"}`}
                        style={{ transformStyle: "preserve-3d" }}
                        onClick={() => {
                          if (isCenter) openModal();
                          else {
                            if (style.x === "-45%") paginate(-1);
                            else if (style.x === "45%") paginate(1);
                          }
                        }}
                      >
                        <div className="relative w-full h-full flex items-center justify-center">
                          <Image
                            src="/sampleafss-nobg.png"
                            alt={`Annual Fire Safety Statement — page ${i + 1} of ${TOTAL_PAGES}`}
                            fill
                            sizes="(max-width: 1024px) 100vw, 58vw"
                            className="object-contain "
                            priority={i === 0 || i === 1 || i === TOTAL_PAGES - 1}
                          />
                          {isCenter && (
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                              <span className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[#1c4d9c] shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300">
                                <ZoomIn size={20} strokeWidth={2} aria-hidden="true" />
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Floating Controls */}
              <div className="flex flex-col items-center mt-2 z-10">
                <div className="flex items-center gap-6 mb-5">
                  <button type="button" onClick={() => paginate(-1)} aria-label="Previous page" className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-[#0b1d36] shadow-[0_4px_15px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)] hover:text-[#1c4d9c] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-[#1c4d9c]">
                    <ArrowLeft size={18} strokeWidth={2.5} aria-hidden="true" />
                  </button>
                  <span className="text-[1rem] font-medium text-[#0b1d36]">
                    Page {pageIndex + 1} of {TOTAL_PAGES}
                  </span>
                  <button type="button" onClick={() => paginate(1)} aria-label="Next page" className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-[#0b1d36] shadow-[0_4px_15px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)] hover:text-[#1c4d9c] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-[#1c4d9c]">
                    <ArrowRight size={18} strokeWidth={2.5} aria-hidden="true" />
                  </button>
                </div>

                <div className="flex items-center justify-center gap-3" role="tablist" aria-label="Document pages">
                  {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      role="tab"
                      aria-selected={i === pageIndex}
                      aria-label={"Go to page " + (i + 1)}
                      onClick={() => goTo(i)}
                      className="transition-all duration-200 focus-visible:outline-2 focus-visible:outline-[#1c4d9c] rounded-full"
                      style={{
                        width: i === pageIndex ? "0.75rem" : "0.625rem",
                        height: i === pageIndex ? "0.75rem" : "0.625rem",
                        borderRadius: "50%",
                        backgroundColor: i === pageIndex ? "#1c4d9c" : "#c8d4e8",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── LIGHT THEME MODAL ── */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9000] bg-[#eef1f6]/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
            role="dialog"
            aria-modal="true"
            aria-label={"Sample AFSS — page " + (modalPageIndex + 1) + " of " + TOTAL_PAGES}
            onClick={closeModal}
          >
            {/* 
              By using flex row and forcing the image container to an exact aspect ratio
              with max constraints, the buttons will stay physically close to the image 
              instead of floating at the far edges of a max-w-4xl container.
            */}
            <div 
              className="relative flex flex-row items-center justify-center gap-4 md:gap-8 w-full max-w-[100vw] h-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left arrow */}
              <button
                type="button"
                onClick={() => modalPaginate(-1)}
                aria-label="Previous page"
                className="flex-none flex items-center justify-center w-12 h-12 rounded-full bg-white text-[#0b1d36] shadow-[0_8px_30px_rgba(11,29,54,0.1)] hover:text-[#1c4d9c] hover:shadow-[0_8px_30px_rgba(11,29,54,0.15)] hover:scale-105 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c4d9c]"
              >
                <ArrowLeft size={22} strokeWidth={2.5} aria-hidden="true" />
              </button>

              {/* Image container strictly constrained by aspect ratio so flex gap keeps buttons tight */}
              <div className="relative h-[75vh] md:h-[88vh] aspect-[1/1.414] shrink-0">
                <AnimatePresence initial={false} custom={modalDir} mode="wait">
                  <motion.div
                    key={modalPageIndex}
                    custom={modalDir}
                    variants={prefersReduced ? reducedVariants : modalSlideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0"
                  >
                    <Image
                      src="/sampleafss-nobg.png"
                      alt={"Annual Fire Safety Statement — page " + (modalPageIndex + 1) + " of " + TOTAL_PAGES}
                      fill
                      sizes="(max-width: 768px) 85vw, 70vw"
                      className="object-contain "
                      priority
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Right arrow */}
              <button
                type="button"
                onClick={() => modalPaginate(1)}
                aria-label="Next page"
                className="flex-none flex items-center justify-center w-12 h-12 rounded-full bg-white text-[#0b1d36] shadow-[0_8px_30px_rgba(11,29,54,0.1)] hover:text-[#1c4d9c] hover:shadow-[0_8px_30px_rgba(11,29,54,0.15)] hover:scale-105 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c4d9c]"
              >
                <ArrowRight size={22} strokeWidth={2.5} aria-hidden="true" />
              </button>
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={closeModal}
              aria-label="Close"
              className="absolute top-4 right-4 md:top-6 md:right-6 z-[9010] w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#5b6a82] shadow-md hover:text-[#b0141f] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c4d9c]"
            >
              <X size={24} strokeWidth={2.5} aria-hidden="true" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


