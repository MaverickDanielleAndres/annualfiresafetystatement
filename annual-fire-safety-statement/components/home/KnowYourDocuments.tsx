"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, ClipboardList, ShieldCheck, ArrowRight } from "lucide-react";
import RevealOnView from "@/components/RevealOnView";

/**
 * AFSS homepage — 12 / Know Your Documents.
 *
 * Three documents: AFSS, FSS, FSC. Each uses an editorial split
 * (number, icon, title, subtitle, description, link) — no boxed cards
 * of equal height.
 */

const docs = [
  {
    num: "01",
    icon: Calendar,
    title: "Annual Fire Safety Statement (AFSS)",
    subtitle: "The annual statement.",
    desc: "Annual document confirming the applicable essential fire safety measures in your building have been assessed, inspected and verified for the current year.",
    image: "/sampleafss-nobg.png",
    href: "/sample",
    alt: "Sample NSW Annual Fire Safety Statement",
  },
  {
    num: "02",
    icon: ClipboardList,
    title: "Fire Safety Schedule (FSS)",
    subtitle: "The requirements for your building.",
    desc: "Lists the essential fire safety measures that apply to your building and the minimum standards of performance each measure must meet.",
    image: "/sampleafss-nobg.png",
    href: "/sample",
    alt: "Sample NSW Fire Safety Schedule",
  },
  {
    num: "03",
    icon: ShieldCheck,
    title: "Fire Safety Certificate (FSC)",
    subtitle: "For relevant new or altered building work.",
    desc: "Issued for relevant new or altered building work. It confirms that the applicable fire safety measures have been installed and checked against the requirements of the Fire Safety Schedule.",
    image: "/sampleafss-nobg.png",
    href: "/sample",
    alt: "Fire Safety Certificate — for new or altered building work",
  },
];

export default function KnowYourDocuments() {
  return (
    <section className="bg-white section-y-tight w-full overflow-hidden">
      <div className="container-inner">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 lg:mb-14 gap-6">
          <div className="flex-1">
            <RevealOnView>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#b0141f] text-white font-bold text-[0.85rem] px-2 py-0.5 rounded-[3px] leading-tight">
                  09
                </div>
                <span className="text-[#1c4d9c] font-bold text-[0.85rem] tracking-[0.15em] uppercase">
                  / KNOW YOUR DOCUMENTS
                </span>
              </div>
              <h2 className="h-section">
                Three documents.
                <br />
                Three different <span className="text-[#b0141f]">jobs.</span>
              </h2>
            </RevealOnView>
          </div>
          <div className="flex-1 lg:max-w-md">
            <RevealOnView delay={80}>
              <p className="text-body">
                It's easy to mix them up. Here's how each NSW fire safety
                document works, and when you need it.
              </p>
            </RevealOnView>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {docs.map((d, i) => {
            const Icon = d.icon;
            return (
              <RevealOnView
                key={d.title}
                delay={i * 100}
                className="flex flex-col group h-full"
              >
                <div className="relative w-full aspect-[4/3] flex items-center justify-end mb-6 overflow-visible">
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-1/4 text-[clamp(4rem,7vw,7rem)] font-extrabold text-[#e7eef9] leading-none tracking-tighter select-none"
                  >
                    {d.num}
                  </span>
                  <div
                    aria-hidden="true"
                    className="absolute right-[5%] w-[60%] h-[80%] rounded-full bg-[#f5f7fa] z-0 transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="relative w-[70%] aspect-[3/4] z-10 rotate-[2deg] group-hover:rotate-0 transition-transform duration-500 shadow-[0_18px_38px_rgba(11,29,54,0.16)] bg-white border border-[#e3e7ee] rounded-[0.125rem] overflow-hidden">
                    <div
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        inset: 0,
                        height: "3px",
                        background: "#0b1d36",
                      }}
                    />
                    <Image
                      src={d.image}
                      alt={d.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                </div>

                <div className={`flex flex-col flex-1 ${i > 0 ? "lg:border-l lg:border-[#e3e7ee] lg:-ml-5 lg:pl-5" : ""}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      aria-hidden="true"
                      className="text-[#1c4d9c]"
                    >
                      <Icon size={18} strokeWidth={1.6} />
                    </span>
                    <span className="text-[0.72rem] font-mono font-bold tracking-[0.06em] uppercase text-[#1c4d9c]">
                      {d.num}
                    </span>
                  </div>
                  <h3 className="text-[1.02rem] font-extrabold uppercase tracking-[0.02em] text-[#0b1d36] leading-tight">
                    {d.title}
                  </h3>
                  <p className="mt-1 text-[0.92rem] font-bold text-[#1c4d9c]">
                    {d.subtitle}
                  </p>
                  <p className="mt-2 text-[0.88rem] text-[#3a4a63] leading-[1.55]">
                    {d.desc}
                  </p>
                  <Link
                    href={d.href}
                    className="mt-auto pt-4 inline-flex items-center gap-2 text-[0.78rem] font-bold uppercase tracking-[0.06em] text-[#1c4d9c] hover:gap-3 transition-all"
                  >
                    View official template
                    <ArrowRight size={14} strokeWidth={2.4} aria-hidden="true" />
                  </Link>
                </div>
              </RevealOnView>
            );
          })}
        </div>
      </div>
    </section>
  );
}