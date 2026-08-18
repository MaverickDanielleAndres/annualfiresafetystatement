import Image from "next/image";
import Link from "next/link";

export interface PageHeroProps {
  eyebrow: string;
  titleLines: string[];
  description: string;
  imageSrc: string;
  imageAlt: string;
  imagePosition?: string;
  primaryCta?: { label: string; href: string; isBookTheBoss?: boolean };
  secondaryCta?: { label: string; href: string };
  variant?: "light" | "dark";
}

import FreeSiteVisitButton from "@/components/free-site-visit/FreeSiteVisitButton";

export default function PageHero({
  eyebrow,
  titleLines,
  description,
  imageSrc,
  imageAlt,
  imagePosition = "center",
  primaryCta,
  secondaryCta,
}: PageHeroProps) {
  return (
    <section className="relative w-full min-h-[60vh] flex items-center bg-[#1a0505] overflow-hidden pt-4 pb-16 lg:pt-8 lg:pb-20">
      {/* Background Image on the right side only */}
      <div className="absolute inset-y-0 right-0 w-full lg:w-[65%] z-0">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          style={{ objectFit: "cover", objectPosition: imagePosition }}
          priority
          sizes="(max-width: 1024px) 100vw, 65vw"
          quality={90}
        />
        {/* Warm/Dark Red Tint on the right side to remove any blueish feel */}
        <div className="absolute inset-0 bg-gradient-to-l from-red-950/40 via-red-900/10 to-transparent pointer-events-none mix-blend-multiply" />
        <div className="absolute inset-0 bg-red-950/20 pointer-events-none" />
        
        {/* Gradient fade from left to right to blend the image into the background color (placed after tints so the left edge matches the solid bg perfectly) */}
        <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#1a0505] from-[5%] via-[#1a0505]/80 via-[30%] to-transparent pointer-events-none" />
      </div>

      {/* Watermark aligned exactly with the navbar-inner right edge */}
      <div className="absolute inset-0 z-0 pointer-events-none w-full flex justify-center">
        {/* We match the navbar-inner max-width exactly */}
        <div className="w-full max-w-[1440px] relative h-full">
          {/* We use padding classes that match the navbar-inner breakpoints 
              (4rem on large, 2rem on 1025-1400, 1rem below 1024) */}
          <div className="absolute top-6 lg:top-12 opacity-20 mix-blend-overlay hidden sm:block right-[1rem] min-[1025px]:right-[2rem] min-[1441px]:right-[4rem]">
            <p className="text-white font-black text-2xl md:text-3xl lg:text-4xl uppercase tracking-[0.2em] text-right max-w-sm leading-tight">
              Annual Fire Safety Statement
            </p>
          </div>
        </div>
      </div>  

      {/* Content wrapper */}
      <div className="container-inner relative z-10 w-full">
        <div className="max-w-[1000px] text-white pt-2 lg:pt-2">
          <p className="font-bold tracking-widest uppercase mb-2 text-xs md:text-sm flex items-center gap-3">
            <span className="w-2 h-2 bg-[#fb5614]" aria-hidden="true" />
            <span className="bg-gradient-to-r from-[#ff5614] to-[#ffad05] bg-clip-text text-transparent">{eyebrow}</span>
          </p>
          <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-black tracking-tight leading-[0.95] mb-8 relative z-10">
            {titleLines.map((line, index) => {
              const isLast = index === titleLines.length - 1;
              return (
                <span
                  key={`${line}-${index}`}
                  className={isLast ? "bg-gradient-to-r from-[#ff5614] to-[#ffad05] bg-clip-text text-transparent" : "text-white"}
                  style={{ display: "block", width: "fit-content" }}
                >
                  {line}
                </span>
              );
            })}
          </h1>
          <p className="text-base md:text-lg font-medium text-white/90 mb-8 max-w-3xl leading-relaxed relative z-10">
            {description}
          </p>
          {(primaryCta || secondaryCta) && (
            <div className="flex flex-wrap gap-4 items-center relative z-10">
              {primaryCta && (
                primaryCta.isBookTheBoss ? (
                  <FreeSiteVisitButton
                    source="hero"
                    pulse
                    className="btn animate-pump !px-8 !py-4 !text-lg bg-gradient-to-r from-[#ff5614] to-[#ffad05] text-white border-none shadow-md hover:scale-105 transition-transform"
                    style={{ fontSize: "clamp(0.95rem, 1.2vw, 1.05rem)" }}
                  />
                ) : (
                  <Link
                    href={primaryCta.href}
                    className="btn animate-pump !px-8 !py-4 !text-lg bg-gradient-to-r from-[#ff5614] to-[#ffad05] text-white border-none shadow-md hover:scale-105 transition-transform"
                  >
                    {primaryCta.label}
                  </Link>
                )
              )}
              {secondaryCta && (
                <Link
                  href={secondaryCta.href}
                  className="btn btn-secondary !px-8 !py-4 !text-lg !text-[#111111] hover:!bg-[#f0f0f0]"
                >
                  {secondaryCta.label}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom fade into the next section (Eased gradient perfectly matching allfireservices) */}
      <div 
        className="absolute bottom-0 left-0 right-0 z-[5] pointer-events-none" 
        style={{
          height: "32%",
          background: `linear-gradient(to bottom,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0.05) 12%,
            rgba(255,255,255,0.12) 24%,
            rgba(255,255,255,0.22) 36%,
            rgba(255,255,255,0.36) 48%,
            rgba(255,255,255,0.54) 60%,
            rgba(255,255,255,0.72) 72%,
            rgba(255,255,255,0.86) 84%,
            rgba(255,255,255,0.96) 94%,
            #ffffff 100%
          )`,
          marginBottom: "-1px"
        }}
      />
    </section>
  );
}
