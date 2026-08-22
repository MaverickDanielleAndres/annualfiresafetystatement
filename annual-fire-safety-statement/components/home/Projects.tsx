"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Home, Building2, Factory, ShoppingBag, Building, Landmark } from "lucide-react";
import RevealOnView from "@/components/RevealOnView";
import projects, {
  hasProjects,
  deriveCategory,
  type AfssProjectCategory,
  type ProjectEntry,
} from "@/data/projects";

type CategoryFilter = "all" | AfssProjectCategory;

const TAB_ORDER: CategoryFilter[] = [
  "all",
  "residential",
  "commercial",
  "industrial",
  "shops",
  "mixed-use",
  "government",
];

const TAB_LABELS: Record<CategoryFilter, string> = {
  all: "All Projects",
  residential: "Residential",
  commercial: "Commercial",
  industrial: "Industrial",
  shops: "Shops",
  "mixed-use": "Mixed-Use",
  government: "Government",
};

const TAB_ICONS: Record<CategoryFilter, React.ElementType | null> = {
  all: null,
  residential: Home,
  commercial: Building,
  industrial: Factory,
  shops: ShoppingBag,
  "mixed-use": Building2,
  government: Landmark,
};

export default function Projects() {
  const availableCategories = useMemo(() => {
    const present = new Set<AfssProjectCategory>();
    projects.forEach((p) => present.add(deriveCategory(p)));
    return present;
  }, []);

  const [active, setActive] = useState<CategoryFilter>("all");
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const tabsToShow = useMemo(
    () => TAB_ORDER.filter((t) => t === "all" || availableCategories.has(t)),
    [availableCategories],
  );

  const filtered = useMemo(() => {
    if (active === "all") return projects;
    return projects.filter((p) => deriveCategory(p) === active);
  }, [active]);

  useEffect(() => {
    const btn = tabRefs.current[active];
    if (!btn) return;
    btn.scrollIntoView({
      block: "nearest",
      inline: "center",
      behavior: "smooth",
    });
  }, [active]);

  if (!hasProjects) return null;

  const onTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const idx = tabsToShow.indexOf(active);
    if (idx === -1) return;
    const nextIdx =
      e.key === "ArrowRight"
        ? (idx + 1) % tabsToShow.length
        : (idx - 1 + tabsToShow.length) % tabsToShow.length;
    const nextTab = tabsToShow[nextIdx];
    setActive(nextTab);
    tabRefs.current[nextTab]?.focus();
  };

  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="section-y-tight w-full overflow-hidden bg-white"
    >
      <div className="container-inner">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-16 gap-6">
          <div className="flex-1">
            <RevealOnView>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#b0141f] text-white font-bold text-[0.85rem] px-2 py-0.5 rounded-[3px] leading-tight">
                  12
                </div>
                <span className="text-[#1c4d9c] font-bold text-[0.85rem] tracking-[0.15em] uppercase">
                  / Projects
                </span>
              </div>
              <h2 id="projects-heading" className="h-section">
                AFSS <span className="text-[#b0141f]">projects.</span>
              </h2>
            </RevealOnView>
          </div>
          
          <div className="flex-1 lg:max-w-md">
            <RevealOnView delay={80}>
              <div>
                <h3 className="text-[#0b1d36] font-bold text-[1.05rem] leading-[1.6] mb-1">
                    Real properties. Real assessments.
                  </h3>
                  <p className="text-[#3b4b61] text-[0.95rem] leading-[1.6]">
                    From strata complexes to industrial facilities, we help building owners stay compliant and safe year after year.
                  </p>
                </div>
            </RevealOnView>
          </div>
        </div>

        {/* Category tabs */}
        {tabsToShow.length > 1 && (
          <div
            role="tablist"
            aria-label="Filter projects by building type"
            aria-orientation="horizontal"
            className="relative -mx-4 sm:mx-0 mb-8 sm:mb-10"
          >
            <div
              className="
                flex gap-3 md:justify-center overflow-x-auto px-4 sm:px-0 pb-2
                snap-x snap-mandatory sm:snap-none
                [scrollbar-width:none] [-ms-overflow-style:none]
                [&::-webkit-scrollbar]:hidden
              "
            >
              {tabsToShow.map((tab) => {
                const isActive = tab === active;
                const Icon = TAB_ICONS[tab];
                return (
                  <button
                    key={tab}
                    ref={(el) => {
                      tabRefs.current[tab] = el;
                    }}
                    type="button"
                    role="tab"
                    id={`projects-tab-${tab}`}
                    aria-selected={isActive}
                    aria-controls="projects-panel"
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => setActive(tab)}
                    onKeyDown={onTabKeyDown}
                    className="relative flex-none w-max snap-start px-5 py-2.5 rounded-full text-[0.85rem] font-bold tracking-[0.04em] whitespace-nowrap transition-all duration-200 flex items-center justify-center gap-2 border"
                    style={{
                      padding: "0.5rem 1.25rem",
                      backgroundColor: isActive ? "#b0141f" : "#ffffff",
                      color: isActive ? "#ffffff" : "#0b1d36",
                      borderColor: isActive ? "#b0141f" : "#e3e7ee",
                      boxShadow: isActive ? "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" : "none"
                    }}
                  >
                    <span>{TAB_LABELS[tab]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Project grid */}
        <div
          id="projects-panel"
          role="tabpanel"
          aria-labelledby={`projects-tab-${active}`}
        >
          {filtered.length === 0 ? (
            <p className="text-body italic text-[#5b6a82]">
              No projects in this category yet.
            </p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filtered.map((p, i) => (
                <ProjectCard key={p.slug} project={p} priority={i === 0} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({
  project,
  priority,
}: {
  project: ProjectEntry;
  priority: boolean;
}) {
  const category = deriveCategory(project);
  const label = TAB_LABELS[category];
  const href = project.href ?? `/projects/${project.slug}`;

  return (
    <RevealOnView as="li" delay={0} className="h-full">
      <article className="group relative h-full flex flex-col bg-white rounded-[0.5rem] border border-[#e3e7ee] overflow-hidden transition-all duration-300 hover:border-[#1c4d9c] hover:shadow-[0_12px_24px_rgba(11,29,54,0.06)] hover:-translate-y-[2px]">
        {/* Image */}
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#f5f7fa]">
          {project.image ? (
            <Image
              src={project.image}
              alt={project.imageAlt ?? project.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 25vw, 25vw"
              priority={priority}
              className="object-cover transition-transform duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
            />
          ) : (
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center text-[#5b6a82] text-[0.78rem] uppercase tracking-[0.12em] font-bold"
            >
              Image pending
            </div>
          )}
          {/* Subtle navy gradient on hover for depth */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[rgba(11,29,54,0.08)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          />
          <span className="absolute top-3 left-3 bg-[#b0141f] text-white text-[0.66rem] font-bold tracking-[0.08em] uppercase px-2.5 py-1 rounded-[0.25rem] shadow-sm z-10">
            {label}
          </span>
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-5 gap-2">
          <div className="flex items-center gap-1.5 text-[#5b6a82] text-[0.75rem] font-semibold tracking-[0.02em] mb-1">
            <MapPin className="w-3.5 h-3.5 text-[#1c4d9c]" />
            <span>{project.location}</span>
          </div>
          <h3 className="m-0 text-[1.05rem] font-extrabold text-[#b0141f] leading-tight tracking-[-0.01em]">
            {project.title}
          </h3>
          <p className="m-0 text-[0.8rem] font-bold text-[#1c4d9c] leading-snug">
            {project.service}
            {project.year ? (
              <span className="ml-1 font-mono font-medium text-[#5b6a82]">
                • {project.year}
              </span>
            ) : null}
          </p>
          <p className="m-0 text-[0.85rem] text-[#3a4a63] leading-[1.6] mt-1">
            {project.scope}
          </p>

          <div className="mt-auto pt-2">
            <Link
              href={href}
              className="
                inline-flex items-center gap-2 px-4 py-2
                border border-[#e3e7ee] hover:border-[#1c4d9c] rounded-full
                text-[0.8rem] font-bold uppercase tracking-[0.04em]
                text-[#1c4d9c] hover:bg-[#f5f7fa]
                focus-visible:outline-2 focus-visible:outline-[#1c4d9c] focus-visible:outline-offset-4
                transition-all duration-200
              "
            >
              View details
              <ArrowRight size={14} strokeWidth={2.5} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </article>
    </RevealOnView>
  );
}
