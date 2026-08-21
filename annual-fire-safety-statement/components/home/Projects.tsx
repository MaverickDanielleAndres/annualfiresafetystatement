"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import RevealOnView from "@/components/RevealOnView";
import projects, { hasProjects } from "@/data/projects";

/**
 * AFSS homepage — 09 / Projects.
 *
 * Data-driven from data/projects.ts. Empty-safe: when no projects have
 * been supplied yet, render a polite "coming soon" placeholder so the
 * UI doesn't invent anything.
 */

export default function Projects() {
  // Hide the section entirely until approved project data exists.
  if (!hasProjects) return null;

  return (
    <section
      id="projects"
      className="bg-white section-y-tight w-full overflow-hidden"
    >
      <div className="container-inner">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 lg:mb-12 gap-6">
          <div className="flex-1">
            <RevealOnView>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#b0141f] text-white font-bold text-[0.85rem] px-2 py-0.5 rounded-[3px] leading-tight">
                  09
                </div>
                <span className="text-[#1c4d9c] font-bold text-[0.85rem] tracking-[0.15em] uppercase">
                  / PROJECTS
                </span>
              </div>
              <h2 className="h-section">AFSS <span className="text-[#b0141f]">projects.</span></h2>
            </RevealOnView>
          </div>
          <div className="flex-1 lg:max-w-md">
            <RevealOnView delay={80}>
              <p className="text-body">
                Approved AFSS project case studies will be published here.
              </p>
            </RevealOnView>
          </div>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {projects.map((p, i) => (
            <RevealOnView key={p.slug} delay={i * 60} as="li" className="h-full">
              <article className="afss-card h-full">
                {p.image && (
                  <div className="afss-card__media">
                    <Image
                      src={p.image}
                      alt={p.imageAlt ?? `${p.propertyType}, ${p.location}`}
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                )}
                <div className="afss-card__body">
                  <span className="text-[0.7rem] font-mono font-bold tracking-[0.06em] uppercase text-[#1c4d9c]">
                    {p.propertyType}
                  </span>
                  <h3 className="afss-card__title mt-1">{p.location}</h3>
                  <p className="afss-card__text font-semibold text-[#0b1d36]">
                    {p.service}
                  </p>
                  <p className="afss-card__text">{p.scope}</p>
                  {p.outcome && (
                    <p className="afss-card__text italic text-[#5b6a82]">
                      {p.outcome}
                    </p>
                  )}
                  <Link
                    href={`/projects/${p.slug}`}
                    className="mt-3 inline-flex items-center gap-2 text-[0.78rem] font-bold uppercase tracking-[0.06em] text-[#1c4d9c] hover:gap-3 transition-all"
                  >
                    View project
                    <ArrowRight size={14} strokeWidth={2.4} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            </RevealOnView>
          ))}
        </ul>
      </div>
    </section>
  );
}