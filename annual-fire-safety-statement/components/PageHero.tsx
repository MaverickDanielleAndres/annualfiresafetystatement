import Image from "next/image";
import Link from "next/link";

export interface PageHeroProps {
  eyebrow: string;
  titleLines: string[];
  description: string | React.ReactNode;
  imageSrc: string;
  imageAlt: string;
  imagePosition?: string;
  primaryCta?: { label: string; href: string; isBookTheBoss?: boolean };
  secondaryCta?: { label: string; href: string };
  variant?: "light" | "dark";
  layout?: "primary" | "secondary";
  eyebrowClassName?: string;
  hideWatermark?: boolean;
  hideImageTints?: boolean;
  imageObjectFit?: "cover" | "contain";
  foregroundImageSrc?: string;
  foregroundImageAlt?: string;
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
  layout = "secondary",
  eyebrowClassName,
  hideWatermark = false,
  hideImageTints = false,
  imageObjectFit = "cover",
  foregroundImageSrc,
  foregroundImageAlt,
}: PageHeroProps) {
  if (layout === "secondary") {
    return (
      <section className="relative w-full min-h-[40vh] md:min-h-[50vh] flex items-center bg-[#111111] overflow-hidden pt-20 pb-24 lg:pt-28 lg:pb-32">
        {/* Full width background image with overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            style={{ objectFit: "cover", objectPosition: imagePosition }}
            priority
            quality={90}
          />
          {/* Dark overlay to make text readable */}
          <div className="absolute inset-0 bg-black/70" />
        </div>

        {/* Content wrapper */}
        <div className="container-inner relative z-10 w-full">
          <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8 lg:gap-16 items-center">
            {/* Left Column: Title */}
            <div>
              <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-black tracking-tight leading-[0.95] m-0" style={{ textWrap: "balance" }}>
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
            </div>

            {/* Right Column: Eyebrow + Description */}
            <div className="flex flex-col pl-0 lg:pl-10 mt-6 lg:mt-0">
              <p className={`font-bold tracking-widest uppercase mb-4 text-xs md:text-sm ${eyebrowClassName || 'text-[#fb5614]'}`}>
                {eyebrow}
              </p>
              <p className="text-base md:text-lg font-medium text-white/90 leading-relaxed max-w-lg">
                {description}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom fade into the next section */}
        <div 
          className="absolute bottom-0 left-0 right-0 z-[5] pointer-events-none" 
          style={{
            height: "35%",
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

  return (
    <section className="relative w-full min-h-[60vh] flex items-center bg-[#1a0505] overflow-hidden pt-4 pb-16 lg:pt-8 lg:pb-20">
      {/* Background Image on the right side only */}
      <div className="absolute inset-y-0 right-0 w-full lg:w-[65%] z-0">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          style={{ objectFit: imageObjectFit, objectPosition: imagePosition }}
          priority
          sizes="(max-width: 1024px) 100vw, 65vw"
          quality={90}
        />
        {/* Warm/Dark Red Tint on the right side to remove any blueish feel */}
        {!hideImageTints && (
          <>
            <div className="absolute inset-0 bg-gradient-to-l from-red-950/40 via-red-900/10 to-transparent pointer-events-none mix-blend-multiply" />
            <div className="absolute inset-0 bg-red-950/20 pointer-events-none" />
          </>
        )}
        
        {/* Gradient fade from left to right to blend the image into the background color (placed after tints so the left edge matches the solid bg perfectly) */}
        {!hideImageTints && (
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#1a0505] from-[5%] via-[#1a0505]/80 via-[30%] to-transparent pointer-events-none" />
        )}
        
        {foregroundImageSrc && (
          <div className="absolute inset-0 z-10 flex items-center justify-center lg:justify-end pr-0 lg:-mr-[5%] pb-10 lg:pb-0 pointer-events-none drop-shadow-2xl">
            <Image
              src={foregroundImageSrc}
              alt={foregroundImageAlt || ""}
              width={900}
              height={1100}
              className="w-[100%] sm:w-[85%] lg:w-auto h-[80%] lg:h-[120%] max-h-none lg:max-h-[1000px] object-contain rotate-3 hover:rotate-0 transition-transform duration-500 pointer-events-auto mt-24 lg:mt-0"
              priority
            />
          </div>
        )}
      </div>

      {/* Watermark aligned exactly with the navbar-inner right edge */}
      {!hideWatermark && (
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
      )}

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
                    label={primaryCta.label}
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
