"use client";

import Image from "next/image";
import RevealOnView from "@/components/RevealOnView";

const clients = [
  { name: "Household Properties", src: "/client-logos/household-properties.png", width: 250, height: 88 },
  { name: "Civium", src: "/client-logos/civium.svg", width: 158, height: 29 },
  { name: "LUNA Management", src: "/client-logos/luna.png", width: 130, height: 48 },
  { name: "Vital Strata Management", src: "/client-logos/vital-strata.png", width: 400, height: 400, className: "is-square" },
  { name: "Netstrata", src: "/client-logos/netstrata.svg", width: 240, height: 68 },
  { name: "Get Strata", src: "/client-logos/get-strata.png", width: 135, height: 72, className: "is-inverted" },
  { name: "Cambridge Lodge", src: "/client-logos/cambridge-lodge.jpg", width: 296, height: 90 },
  { name: "Strathfield Partners", src: "/client-logos/strathfield-partners.png", width: 500, height: 221 },
  { name: "Arriva", src: "/client-logos/arriva.svg", width: 131, height: 39 },
];

const clientLogoRows = [
  clients.slice(0, 5),
  clients.slice(5),
];

export default function Partners() {
  return (
    <section
      id="clients"
      aria-labelledby="clients-heading"
      className="bg-white section-y-tight w-full overflow-hidden clients-marquee"
    >
      <style>{`
        .clients-marquee {
          overflow: hidden;
          position: relative;
        }

        .clients-marquee::before,
        .clients-marquee::after {
          content: "";
          inset-block: 0;
          pointer-events: none;
          position: absolute;
          width: min(13vw, 9rem);
          z-index: 2;
        }

        .clients-marquee::before {
          background: linear-gradient(90deg, #ffffff 0%, rgba(255, 255, 255, 0) 100%);
          left: 0;
        }

        .clients-marquee::after {
          background: linear-gradient(270deg, #ffffff 0%, rgba(255, 255, 255, 0) 100%);
          right: 0;
        }

        .clients-marquee-track-wrap {
          display: grid;
          gap: clamp(1.6rem, 3.2vw, 2.7rem);
        }

        .clients-marquee-track {
          display: flex;
          gap: clamp(2.4rem, 5.2vw, 4.5rem);
          width: max-content;
          will-change: transform;
        }

        .clients-marquee-track.is-left {
          animation: clients-slide-left 38s linear infinite;
        }

        .clients-marquee-track.is-right {
          animation: clients-slide-right 34s linear infinite;
        }

        .clients-marquee-item {
          align-items: center;
          display: flex;
          flex: 0 0 clamp(9rem, 12vw, 13rem);
          height: clamp(4rem, 5.5vw, 5.5rem);
          justify-content: center;
        }

        .clients-marquee-logo {
          display: block;
          height: auto;
          max-height: clamp(2.4rem, 3.8vw, 3.8rem);
          max-width: min(100%, 12rem);
          object-fit: contain;
          width: auto;
        }

        .clients-marquee-logo.is-square {
          max-height: clamp(4rem, 5.2vw, 5.2rem);
        }

        .clients-marquee-logo.is-inverted {
          background-color: #1a1a1a;
          border-radius: 0.5rem;
          padding: 0.5rem 1rem;
        }

        @keyframes clients-slide-left {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        @keyframes clients-slide-right {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .clients-marquee-track.is-left,
          .clients-marquee-track.is-right {
            animation-duration: 90s;
          }
        }

        @media (max-width: 767px) {
          .clients-marquee-track {
            gap: 2rem;
          }

          .clients-marquee-item {
            flex-basis: 11rem;
            height: 5.5rem;
          }
        }
      `}</style>
      <div className="container-inner">
        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6 lg:gap-12 lg:items-end mb-8 lg:mb-12">
          <RevealOnView>
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-[#b0141f] text-white font-bold text-[0.85rem] px-2 py-0.5 rounded-[3px] leading-tight">
                13
              </div>
              <span className="text-[#1c4d9c] font-bold text-[0.85rem] tracking-[0.15em] uppercase">
                / Clients
              </span>
            </div>
            <h2 id="clients-heading" className="h-section">
              Working with the people behind{" "}
              <span className="text-[#b0141f]">safer buildings.</span>
            </h2>
          </RevealOnView>
          <RevealOnView delay={80}>
            <p className="text-body">
              AFSS compliance can involve building owners, strata
              managers, property managers, facilities teams, accredited
              practitioners and specialist fire safety professionals.
            </p>
          </RevealOnView>
        </div>

        {/* Logo strip */}
        <RevealOnView delay={120}>
          <div className="clients-marquee-track-wrap" aria-label="Client logos">
            {clientLogoRows.map((row, rowIndex) => {
              const repeatedLogos = [...row, ...row, ...row, ...row];
              return (
                <div
                  key={rowIndex}
                  className={`clients-marquee-track ${rowIndex === 0 ? "is-right" : "is-left"}`}
                >
                  {repeatedLogos.map((logo, logoIndex) => (
                    <div
                      className="clients-marquee-item"
                      key={`${logo.name}-${logoIndex}`}
                    >
                      <Image
                        src={logo.src}
                        alt={logo.name}
                        width={logo.width}
                        height={logo.height}
                        className={`clients-marquee-logo ${logo.className ?? ""}`}
                        sizes="(max-width: 767px) 12rem, 18rem"
                      />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </RevealOnView>
      </div>
    </section>
  );
}
