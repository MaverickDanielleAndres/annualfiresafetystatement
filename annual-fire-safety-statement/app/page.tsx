import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowUpRight, FileText, ShieldCheck, ClipboardList, ClipboardCheck, Search, UploadCloud, Check, AlertCircle, Calendar, Clock, Bell, Building2, Home, Store, Factory, GraduationCap, Building, Target, CalendarDays, Route, ArrowRight, MapPin, Award, Handshake, Map, CalendarCheck, Wrench } from "lucide-react";
import { ExpandingCards, type CardItem } from "@/components/ui/expanding-cards";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import CTASection from "@/components/CTASection";
import ContactCTA from "@/components/ContactCTA";
import RevealOnView from "@/components/RevealOnView";
import FreeSiteVisitButton from "@/components/free-site-visit/FreeSiteVisitButton";
import { createPageMetadata } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "NSW AFSS Specialists — Annual Fire Safety Statements",
  description:
    "Annual Fire Safety Statement (AFSS) assessments for NSW strata, commercial and industrial buildings. From your Fire Safety Schedule to a lodged AFSS, handled by accredited practitioners.",
  path: "/",
  keywords: [
    "AFSS",
    "Annual Fire Safety Statement NSW",
    "Fire Safety Schedule",
    "AFSS assessment",
    "NSW fire compliance",
  ],
});

const processSteps = [
  {
    n: "01",
    title: "Review",
    body: "Your Fire Safety Schedule and building specifics.",
  },
  {
    n: "02",
    title: "Assess",
    body: "Each essential measure against its required performance standard.",
  },
  {
    n: "03",
    title: "Report",
    body: "Clear findings — pass, defect, or follow-up.",
  },
  {
    n: "04",
    title: "Statement",
    body: "AFSS draft prepared by an Accredited Practitioner.",
  },
  {
    n: "05",
    title: "Lodge",
    body: "Council or strata lodgement support, all wrapped up.",
  },
];

const buildingTypes: CardItem[] = [
  {
    id: "strata",
    title: "Strata",
    description: "Residential and mixed-use. Owner corporations, strata managers, building managers.",
    imgSrc: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=800&auto=format&fit=crop",
    icon: <Building2 size={24} />,
  },
  {
    id: "residential",
    title: "Residential",
    description: "Multi-dwelling homes, high-rise apartments, and residential estates.",
    imgSrc: "https://images.unsplash.com/photo-1486304873000-235643847519?q=80&w=800&auto=format&fit=crop",
    icon: <Home size={24} />,
  },
  {
    id: "commercial",
    title: "Commercial",
    description: "Office towers, business parks, and corporate facilities.",
    imgSrc: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop",
    icon: <Building size={24} />,
  },
  {
    id: "retail",
    title: "Retail",
    description: "Shopping centers, retail fit-outs, and hospitality venues.",
    imgSrc: "https://images.unsplash.com/photo-1601598851547-4302969d0614?q=80&w=800&auto=format&fit=crop",
    icon: <Store size={24} />,
  },
  {
    id: "industrial",
    title: "Industrial",
    description: "Warehouses, manufacturing, logistics. Specialised measures and high-risk services.",
    imgSrc: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?q=80&w=800&auto=format&fit=crop",
    icon: <Factory size={24} />,
  },
  {
    id: "institutional",
    title: "Institutional",
    description: "Schools, healthcare, public buildings. Strict compliance and audit-grade reporting.",
    imgSrc: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop",
    icon: <GraduationCap size={24} />,
  },
];

export default function HomePage() {
  return (
    <>
      <PageHero
        layout="primary"
        eyebrow="ACCREDITED PRACTITIONERS (FIRE SAFETY) • NSW"
        titleLines={["YOUR AFSS ISN'T", "JUST PAPERWORK.", "IT'S RESPONSIBILITY."]}
        description="From your Fire Safety Schedule to the annual assessment and statement, we help make the AFSS process clear, thorough and straightforward."
        imageSrc="/herosection.avif"
        imageAlt="Accredited practitioner inspecting building equipment on site"
        imagePosition="center"
        primaryCta={{ label: "BOOK THE BOSS", href: "/free-quote", isBookTheBoss: true }}
        secondaryCta={{ label: "EXPLORE OUR SERVICES →", href: "/services" }}
      />



      {/* Section: From Schedule to Statement */}
      <section className="container-inner pt-8 pb-8 lg:pt-12 lg:pb-12">
        <RevealOnView className="grid lg:grid-cols-[1fr_1fr] xl:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-stretch">
          {/* Left Column */}
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[#fb5614] text-xs font-bold tracking-[0.15em] uppercase">
                01 / WHAT WE DO
              </span>
            </div>
            <h2 className="text-[clamp(2.5rem,4vw,3.5rem)] font-black mb-6 tracking-tight leading-[1.05] text-[#111111]">
              From Fire Safety Schedule to <br />
              <span className="bg-gradient-to-r from-[#ff5614] to-[#ffad05] bg-clip-text text-transparent">
                Annual Statement.
              </span>
            </h2>
            <p className="text-lg text-[#4a4a46] mb-8 max-w-xl leading-relaxed">
              We take the requirements in your Fire Safety Schedule, coordinate the right assessments, document the findings, and help keep your building compliant — every year.
            </p>
            
            {/* 5 Icons Row */}
            <div className="flex flex-wrap sm:flex-nowrap justify-between gap-2 sm:gap-4 mb-8">
              {/* Icon 1 */}
              <div className="flex flex-col items-center text-center flex-1">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-[#fff8f5] flex items-center justify-center mb-3">
                  <ClipboardCheck className="text-[#fb5614]" strokeWidth={1.5} size={24} />
                </div>
                <h4 className="text-[10px] sm:text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">Review</h4>
                <p className="text-[9px] sm:text-[10px] leading-tight text-[#4a4a46] hidden sm:block">Your Fire Safety Schedule</p>
              </div>
              {/* Icon 2 */}
              <div className="flex flex-col items-center text-center flex-1">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-[#fff8f5] flex items-center justify-center mb-3">
                  <Search className="text-[#fb5614]" strokeWidth={1.5} size={24} />
                </div>
                <h4 className="text-[10px] sm:text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">Assess</h4>
                <p className="text-[9px] sm:text-[10px] leading-tight text-[#4a4a46] hidden sm:block">Applicable fire safety measures</p>
              </div>
              {/* Icon 3 */}
              <div className="flex flex-col items-center text-center flex-1">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-[#fff8f5] flex items-center justify-center mb-3">
                  <FileText className="text-[#fb5614]" strokeWidth={1.5} size={24} />
                </div>
                <h4 className="text-[10px] sm:text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">Document</h4>
                <p className="text-[9px] sm:text-[10px] leading-tight text-[#4a4a46] hidden sm:block">Findings and evidence</p>
              </div>
              {/* Icon 4 */}
              <div className="flex flex-col items-center text-center flex-1">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-[#fff8f5] flex items-center justify-center mb-3">
                  <UploadCloud className="text-[#fb5614]" strokeWidth={1.5} size={24} />
                </div>
                <h4 className="text-[10px] sm:text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">Lodge</h4>
                <p className="text-[9px] sm:text-[10px] leading-tight text-[#4a4a46] hidden sm:block">Support with council & FRNSW</p>
              </div>
              {/* Icon 5 */}
              <div className="flex flex-col items-center text-center flex-1">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-[#fff8f5] flex items-center justify-center mb-3">
                  <ShieldCheck className="text-[#fb5614]" strokeWidth={1.5} size={24} />
                </div>
                <h4 className="text-[10px] sm:text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">Compliant</h4>
                <p className="text-[9px] sm:text-[10px] leading-tight text-[#4a4a46] hidden sm:block">Stay protected and prepared</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 mt-6">
              <FreeSiteVisitButton
                source="floating"
                pulse
                className="btn animate-pump bg-gradient-to-r from-[#ff5614] to-[#ffad05] !text-white px-7 py-3.5 uppercase font-bold tracking-wider text-sm rounded-full border-none shadow-sm hover:scale-105 transition-transform"
              />
              <Link href="/free-quote" className="font-bold underline hover:no-underline underline-offset-4 decoration-2 decoration-gray-300 text-[#111111]">
                Or request a quote
              </Link>
            </div>
          </div>
          
          {/* Right Column: Code Mockup */}
          <div className="relative w-full h-full bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden flex flex-col scale-[0.98] transform-gpu transition-transform hover:scale-100 duration-500">
            {/* Mockup Header */}
            <div className="bg-[#111111] px-5 py-4 border-b-[4px] border-[#fb5614]">
              <p className="text-[#fb5614] text-[9px] font-black uppercase tracking-[0.15em] mb-1.5">Fire Safety Schedule</p>
              <h3 className="text-white text-lg font-bold">Building & Essential Measures</h3>
            </div>
            
            {/* Mockup Body */}
            <div className="p-5 flex-1 flex flex-col bg-white">
              {/* Details */}
              <h4 className="text-[9px] font-bold tracking-widest uppercase text-gray-500 mb-2">Building Details</h4>
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="border border-gray-200 p-2.5 rounded-md">
                  <p className="text-[8px] text-gray-400 uppercase font-bold mb-0.5">Property Address</p>
                  <p className="text-[11px] font-semibold text-[#111111]">2-20 Park Road</p>
                </div>
                <div className="border border-gray-200 p-2.5 rounded-md">
                  <p className="text-[8px] text-gray-400 uppercase font-bold mb-0.5">Suburb / State</p>
                  <p className="text-[11px] font-semibold text-[#111111]">Sydney NSW</p>
                </div>
                <div className="border border-gray-200 p-2.5 rounded-md">
                  <p className="text-[8px] text-gray-400 uppercase font-bold mb-0.5">Type</p>
                  <p className="text-[11px] font-semibold text-[#111111]">Mixed-use</p>
                </div>
              </div>
              
              {/* Table */}
              <h4 className="text-[9px] font-bold tracking-widest uppercase text-gray-500 mb-2">Essential Fire Safety Measures</h4>
              <div className="flex-1 flex flex-col">
                <div className="bg-[#111111] text-white text-[8px] uppercase font-bold grid grid-cols-[24px_1fr_60px_50px] py-2 px-3 rounded-t-md">
                  <div>#</div>
                  <div>Measure</div>
                  <div>Standard</div>
                  <div className="text-center">Req</div>
                </div>
                <div className="flex flex-col border border-gray-100 border-t-0 rounded-b-md">
                  {[
                    { num: '01', title: 'Fire Detection & Alarm Systems', std: 'AS 1670.1', status: 'pass' },
                    { num: '02', title: 'Sprinkler System', std: 'AS 2118.1', status: 'pass' },
                    { num: '03', title: 'Fire Hydrant System', std: 'AS 2419.1', status: 'pass' },
                    { num: '04', title: 'Fire Hose Reels', std: 'AS 2441', status: 'pass' },
                    { num: '05', title: 'Fire Doors & Smoke Doors', std: 'AS 1905.1', status: 'warn' },
                    { num: '06', title: 'Emergency Lighting', std: 'AS 2293.1', status: 'pass' },
                    { num: '07', title: 'Exit & Directional Signage', std: 'AS 2293.1', status: 'pass' },
                    { num: '08', title: 'Portable Fire Extinguishers', std: 'AS 2444', status: 'pass' },
                  ].map((row, i) => (
                    <div key={i} className={`grid grid-cols-[24px_1fr_60px_50px] py-1.5 px-3 border-b border-gray-50 last:border-0 items-center ${i % 2 === 0 ? 'bg-[#faf9f7]' : 'bg-white'}`}>
                      <div className="text-[9px] font-semibold text-gray-400">{row.num}</div>
                      <div className="text-[10px] font-medium text-[#4a4a46] whitespace-nowrap overflow-hidden text-ellipsis">{row.title}</div>
                      <div className="text-[9px] text-gray-400">{row.std}</div>
                      <div className="flex justify-center">
                        {row.status === 'pass' ? (
                          <div className="w-3.5 h-3.5 rounded-full bg-green-500 flex items-center justify-center">
                            <Check size={8} className="text-white" strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full bg-[#fb5614] flex items-center justify-center">
                            <AlertCircle size={8} className="text-white" strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Mockup Footer Note */}
              <div className="mt-5 flex items-start gap-3 pt-4 border-t border-gray-100">
                <ShieldCheck size={24} className="text-[#fb5614] shrink-0" strokeWidth={1.5} />
                <p className="text-[10px] text-gray-500 leading-relaxed max-w-[250px]">
                  This schedule determines what must be assessed and verified for your Annual Fire Safety Statement.
                </p>
              </div>
            </div>
          </div>
        </RevealOnView>
      </section>

      {/* Section: Sample AFSS */}
      <section className="container-inner py-8 lg:py-12">
        <RevealOnView className="grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-center">
          {/* Left Column: AFSS Document Mockup */}
          <div className="relative w-full aspect-[4/3] md:aspect-[1.3/1] bg-white rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-gray-200 overflow-hidden flex flex-col p-6 lg:p-10 transform transition-transform hover:-translate-y-1 duration-500">
             {/* Fake Form Content */}
             <div className="flex justify-between items-start mb-8">
               <div>
                 <h3 className="text-4xl font-black tracking-tighter text-[#111111] mb-1">AFSS</h3>
                 <p className="text-[10px] font-bold tracking-widest uppercase text-gray-800">Annual Fire Safety Statement</p>
               </div>
               <div className="w-24 h-4 bg-gray-100 rounded"></div>
             </div>
             
             {/* Fake Rows */}
             <div className="flex-1 flex flex-col gap-4">
                <div className="w-full h-px bg-gray-300 mb-2"></div>
                <div className="flex gap-6 items-center">
                  <div className="w-1/3 h-2 bg-gray-300 rounded"></div>
                  <div className="w-2/3 h-2 bg-gray-100 rounded"></div>
                </div>
                <div className="w-full h-px bg-gray-200"></div>
                <div className="flex gap-6 items-center">
                  <div className="w-1/4 h-2 bg-gray-300 rounded"></div>
                  <div className="w-3/4 h-2 bg-gray-100 rounded"></div>
                </div>
                <div className="w-full h-px bg-gray-200"></div>
                <div className="flex gap-6 items-center">
                  <div className="w-1/2 h-2 bg-gray-300 rounded"></div>
                  <div className="w-1/2 h-2 bg-gray-100 rounded"></div>
                </div>
                <div className="w-full h-px bg-gray-200"></div>
                <div className="flex gap-6 items-center">
                  <div className="w-1/4 h-2 bg-gray-300 rounded"></div>
                  <div className="w-3/4 h-2 bg-gray-100 rounded"></div>
                </div>
                <div className="w-full h-px bg-gray-200"></div>
                <div className="flex gap-6 items-center">
                  <div className="w-1/3 h-2 bg-gray-300 rounded"></div>
                  <div className="w-2/3 h-2 bg-gray-100 rounded"></div>
                </div>
                <div className="w-full h-px bg-gray-200"></div>
                
                {/* Fake Table */}
                <div className="mt-4 border border-gray-200 rounded">
                  <div className="bg-gray-50 flex gap-4 p-2 border-b border-gray-200">
                     <div className="w-1/4 h-2 bg-gray-300 rounded"></div>
                     <div className="w-1/4 h-2 bg-gray-300 rounded"></div>
                     <div className="w-1/4 h-2 bg-gray-300 rounded"></div>
                  </div>
                  <div className="flex gap-4 p-2 border-b border-gray-100">
                     <div className="w-1/4 h-2 bg-gray-100 rounded"></div>
                     <div className="w-1/4 h-2 bg-gray-100 rounded"></div>
                     <div className="w-1/4 h-2 bg-gray-100 rounded"></div>
                  </div>
                  <div className="flex gap-4 p-2">
                     <div className="w-1/4 h-2 bg-gray-100 rounded"></div>
                     <div className="w-1/4 h-2 bg-gray-100 rounded"></div>
                     <div className="w-1/4 h-2 bg-gray-100 rounded"></div>
                  </div>
                </div>
             </div>

             {/* Red Stamp */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
               <div className="border-[4px] border-red-500 text-red-500 px-6 py-2 text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-widest transform -rotate-[15deg] rounded-lg opacity-90 shadow-sm bg-white/40 backdrop-blur-[2px]">
                 Sample Only
               </div>
             </div>
          </div>

          {/* Right Column: Text */}
          <div className="pl-0 lg:pl-10">
            <h3 className="text-[#fb5614] text-xs font-bold tracking-[0.15em] uppercase mb-4">
              02 / SAMPLE AFSS
            </h3>
            <h2 className="text-[clamp(2.5rem,4vw,3.5rem)] font-black mb-6 tracking-tight leading-[1.05] text-[#111111]">
              Know what you&apos;re <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5614] to-[#ffad05]">
                signing off on.
              </span>
            </h2>
            <p className="text-lg text-[#4a4a46] mb-8">
              See the structure of an Annual Fire Safety Statement before your next assessment.
            </p>
            
            <ul className="flex flex-col gap-4 mb-10">
              <li className="flex items-center gap-4">
                <Check className="text-[#fb5614] shrink-0" size={24} strokeWidth={2.5} />
                <span className="text-base font-semibold text-[#111111]">Building & owner details</span>
              </li>
              <li className="flex items-center gap-4">
                <Check className="text-[#fb5614] shrink-0" size={24} strokeWidth={2.5} />
                <span className="text-base font-semibold text-[#111111]">Essential fire safety measures</span>
              </li>
              <li className="flex items-center gap-4">
                <Check className="text-[#fb5614] shrink-0" size={24} strokeWidth={2.5} />
                <span className="text-base font-semibold text-[#111111]">Practitioner information</span>
              </li>
            </ul>

            <Link href="/sample-afss" className="inline-block border-2 border-[#fb5614] text-[#111111] hover:bg-[#fb5614] hover:text-white px-8 py-3.5 uppercase font-bold tracking-wider text-sm rounded-full transition-colors text-center w-full sm:w-auto">
              VIEW SAMPLE AFSS &rarr;
            </Link>
          </div>
        </RevealOnView>
      </section>



      {/* Section 03: Accreditation */}
      <section className="bg-white relative z-20">
        
        {/* Subtle Watermark Background ONLY on the right half */}
        <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[25%] lg:top-[20%] left-0 -translate-x-[5%] xl:-translate-x-[0%] -translate-y-1/2">
            <span className="text-[100px] lg:text-[140px] xl:text-[180px] font-black text-[#f9f9f9] uppercase tracking-tighter leading-none select-none whitespace-nowrap block">
              SCOPE
            </span>
          </div>
        </div>

        <div className="container-inner pt-24 pb-0 lg:pt-24 lg:pb-0 relative z-10">
          <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-8 relative">
            
            {/* Left Content */}
            <div className="w-full lg:w-1/2 flex flex-col items-start relative z-30 pb-8 lg:pb-10">
              <p className="text-[#fb5614] uppercase tracking-[0.15em] font-bold text-[13px] mb-4">
                03 / Accreditation
              </p>
              
              <h2 className="text-[clamp(2.5rem,4vw,3.5rem)] font-black mb-6 tracking-tight leading-[1.05] text-[#111111]">
                The right scope. <br />
                <span className="bg-gradient-to-r from-[#ff5614] to-[#ffad05] bg-clip-text text-transparent">
                  The right assessment.
                </span>
              </h2>
              
              <p className="text-[#111111] text-sm md:text-base max-w-[440px] mb-10 leading-relaxed font-medium">
                Your Fire Safety Schedule identifies the measures that apply to your building. We match those requirements with the appropriate accredited assessment scope for the work involved.
              </p>
              
              <div className="grid grid-cols-3 gap-4 md:gap-8 mb-10 w-full max-w-[480px]">
                <div className="flex flex-col items-start gap-3">
                  <div className="text-[#fb5614]">
                    <Target size={32} strokeWidth={1.5} />
                  </div>
                  <span className="text-[13px] font-bold text-[#111111] leading-[1.3]">Measure-specific<br />scope</span>
                </div>
                
                <div className="flex flex-col items-start gap-3">
                  <div className="text-[#fb5614]">
                    <CalendarCheck size={32} strokeWidth={1.5} />
                  </div>
                  <span className="text-[13px] font-bold text-[#111111] leading-[1.3]">Schedule-led<br />selection</span>
                </div>
                
                <div className="flex flex-col items-start gap-3">
                  <div className="text-[#fb5614]">
                    <Route size={32} strokeWidth={1.5} />
                  </div>
                  <span className="text-[13px] font-bold text-[#111111] leading-[1.3]">Clear assessment<br />pathway</span>
                </div>
              </div>
              
              <Link href="/practitioners" className="btn bg-gradient-to-r from-[#ff5614] to-[#ffad05] !text-white px-7 py-3.5 uppercase font-bold tracking-wider text-sm rounded-full border-none shadow-sm hover:scale-105 transition-transform flex items-center gap-2">
                MEET OUR PRACTITIONERS <ArrowRight size={16} strokeWidth={2} />
              </Link>
            </div>
            
            {/* Right Image */}
            <div className="w-full lg:w-[55%] relative lg:absolute lg:bottom-0 lg:right-0 flex justify-center lg:justify-end mt-8 lg:mt-0 z-20 pointer-events-none">
              <Image 
                src="/PETEIMAGE.png" 
                alt="Accredited assessment scope and fire safety schedule with practitioner" 
                width={1000} 
                height={800} 
                className="w-[125%] lg:w-[155%] xl:w-[165%] max-w-none h-auto object-contain block mb-0 -ml-[15%] lg:-ml-[35%] xl:-ml-[50%] pointer-events-auto"
                priority
              />
            </div>
          </div>
        </div>
        
        {/* Bottom Banner */}
        <div className="border-t border-gray-200 bg-white relative z-10 pt-10 pb-8 lg:pt-12 lg:pb-10">
          <div className="container-inner max-w-6xl">
            <div className="flex flex-col md:flex-row flex-wrap justify-between items-center gap-8 md:gap-0">
              <div className="flex flex-row items-center gap-4 flex-1 justify-center md:border-r border-gray-200 px-4">
                <Map className="text-[#fb5614] shrink-0" size={36} strokeWidth={1.5} />
                <span className="text-[11px] lg:text-xs font-bold text-[#111111] leading-[1.3] uppercase tracking-wider text-left">Australia Wide<br/>Service</span>
              </div>
              <div className="flex flex-row items-center gap-4 flex-1 justify-center md:border-r border-gray-200 px-4">
                <ShieldCheck className="text-[#fb5614] shrink-0" size={36} strokeWidth={1.5} />
                <span className="text-[11px] lg:text-xs font-bold text-[#111111] leading-[1.3] uppercase tracking-wider text-left">Accredited<br/>Practitioners</span>
              </div>
              <div className="flex flex-row items-center gap-4 flex-1 justify-center md:border-r border-gray-200 px-4">
                <Award className="text-[#fb5614] shrink-0" size={36} strokeWidth={1.5} />
                <span className="text-[11px] lg:text-xs font-bold text-[#111111] leading-[1.3] uppercase tracking-wider text-left">Independent<br/>And Impartial</span>
              </div>
              <div className="flex flex-row items-center gap-4 flex-1 justify-center px-4">
                <Handshake className="text-[#fb5614] shrink-0" size={36} strokeWidth={1.5} />
                <span className="text-[11px] lg:text-xs font-bold text-[#111111] leading-[1.3] uppercase tracking-wider text-left">Committed To<br/>Compliance</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 04: AS 1851-2012 */}
      <section className="container-inner py-8 lg:py-12">
        <RevealOnView className="grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-center">
          {/* Left Column: Image Mockup with Cards */}
          <div className="relative w-full aspect-[4/3] md:aspect-[1.1/1] bg-white rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-gray-200 overflow-hidden flex flex-col transform transition-transform hover:-translate-y-1 duration-500">
             
             <Image
                src="/diesel hydrant.jpg"
                alt="Diesel Hydrant Maintenance"
                fill
                className="object-cover"
                priority
             />

             {/* 13 FEB 2026 Card Overlay */}
             <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-100 p-5 lg:p-6 flex flex-col items-start max-w-[240px] transform transition-transform hover:scale-[1.02]">
                <CalendarCheck className="text-[#111111] mb-3" size={28} strokeWidth={1.5} />
                <h3 className="text-2xl font-black text-[#fb5614] mb-2 tracking-tight">13 FEB 2026</h3>
                <div className="w-full h-px bg-gray-200 mb-2"></div>
                <p className="text-[11px] font-semibold text-[#111111] leading-relaxed">
                  Mandatory for applicable fire safety measures in NSW.
                </p>
             </div>
          </div>

          {/* Right Column: Text */}
          <div className="pl-0 lg:pl-10">
            <h3 className="text-[#fb5614] text-xs font-bold tracking-[0.15em] uppercase mb-4">
              04 / AS 1851-2012
            </h3>
            <h2 className="text-[clamp(2.5rem,4vw,3.5rem)] font-black mb-6 tracking-tight leading-[1.05] text-[#111111]">
              Fire safety maintenance <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5614] to-[#ffad05]">
                changed in NSW.
              </span>
            </h2>
            <p className="text-lg text-[#4a4a46] mb-8">
              AS 1851-2012 now forms part of the maintenance requirements for applicable fire safety measures in NSW.
            </p>
            
            <ul className="flex flex-col gap-4 mb-8">
              <li className="flex items-center gap-4">
                <Check className="text-[#fb5614] shrink-0" size={24} strokeWidth={2.5} />
                <span className="text-base font-semibold text-[#111111]">Routine servicing</span>
              </li>
              <li className="flex items-center gap-4">
                <Check className="text-[#fb5614] shrink-0" size={24} strokeWidth={2.5} />
                <span className="text-base font-semibold text-[#111111]">Maintenance records</span>
              </li>
              <li className="flex items-center gap-4">
                <Check className="text-[#fb5614] shrink-0" size={24} strokeWidth={2.5} />
                <span className="text-base font-semibold text-[#111111]">Applicable fire safety measures</span>
              </li>
            </ul>



            <Link href="/as-1851" className="inline-block border-2 border-[#fb5614] text-[#111111] hover:bg-[#fb5614] hover:text-white px-8 py-3.5 uppercase font-bold tracking-wider text-sm rounded-full transition-colors text-center w-full sm:w-auto">
              UNDERSTAND AS 1851-2012 &rarr;
            </Link>
          </div>
        </RevealOnView>
      </section>

      {/* Section: Building types — large photography, no tiny icon boxes */}
      <section className="container-inner py-8 lg:py-12">
        <SectionHeading
          kicker={<span className="text-[#fb5614] uppercase tracking-[0.15em] font-bold">05 / Building types</span>}
          title={
            <>
              <span className="text-[#111111]">Different buildings.</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5614] to-[#ffad05]">Same responsibility.</span>
            </>
          }
          body="The AFSS framework applies to every building with a Fire Safety Schedule. The measures, the practitioners and the risk profile vary — the duty doesn't."
        />

        <RevealOnView>
          <ExpandingCards items={buildingTypes} className="mt-8 mb-4" />
        </RevealOnView>
        <div className="flex flex-wrap items-center justify-center gap-6 mt-12">
          <FreeSiteVisitButton
            source="floating"
            pulse
            className="btn animate-pump bg-gradient-to-r from-[#ff5614] to-[#ffad05] !text-white px-7 py-3.5 uppercase font-bold tracking-wider text-sm rounded-full border-none shadow-sm hover:scale-105 transition-transform"
          />
          <Link href="/services" className="font-bold underline hover:no-underline underline-offset-4 decoration-2 decoration-gray-300 text-[#111111] uppercase tracking-wider text-sm">
            VIEW ALL BUILDING
          </Link>
        </div>
      </section>

      {/* Section: 12 months — the clock */}
      <section className="container-inner py-8 lg:py-12 overflow-hidden">
        <RevealOnView className="relative z-10 grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-stretch">
          {/* Left Column: Content */}
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[#fb5614] text-xs font-bold tracking-[0.15em] uppercase">
                06 / THE CLOCK
              </span>
            </div>
            <h2 className="text-[clamp(2.5rem,4vw,3.5rem)] font-black mb-6 tracking-tight leading-[1.05] text-[#111111]">
              12 months. Don&apos;t let your AFSS <br />
              <span className="bg-gradient-to-r from-[#ff5614] to-[#ffad05] bg-clip-text text-transparent">
                date sneak up.
              </span>
            </h2>
            <p className="text-lg text-[#4a4a46] mb-10 max-w-xl leading-relaxed">
              AFSS renewals come around every twelve months. Building owners
              who plan ahead avoid the late rush and the council
              correspondence. Send us your Schedule and we&apos;ll handle the
              timing from there.
            </p>
            
            <div className="flex flex-wrap items-center gap-6">
              <Link href="/free-quote" className="btn animate-pump bg-gradient-to-r from-[#ff5614] to-[#ffad05] !text-white px-7 py-3.5 uppercase font-bold tracking-wider text-sm rounded-full border-none shadow-sm hover:scale-105 transition-transform">
                SEND US YOUR SCHEDULE <ArrowUpRight className="inline-block ml-1" size={16} />
              </Link>
              <Link href="/free-quote" className="font-bold underline hover:no-underline underline-offset-4 decoration-2 decoration-gray-300 text-[#111111]">
                Or request a quote
              </Link>
            </div>
          </div>

          {/* Right Column: Clock Mockup */}
          <div className="relative w-full aspect-square max-w-[500px] mx-auto flex items-center justify-center lg:ml-auto">
            {/* Background Clock SVG */}
            <svg className="absolute inset-0 w-full h-full text-gray-200" viewBox="0 0 400 400" aria-hidden="true" style={{ transform: 'scale(1.15)' }}>
              {/* Faint tick marks */}
              <g stroke="#fcebe6" strokeWidth="2" strokeLinecap="round">
                {[...Array(60)].map((_, i) => {
                  const angle = (i * 6 * Math.PI) / 180;
                  const isHour = i % 5 === 0;
                  const r1 = isHour ? 175 : 185;
                  const r2 = 195;
                  const x1 = 200 + r1 * Math.sin(angle);
                  const y1 = 200 - r1 * Math.cos(angle);
                  const x2 = 200 + r2 * Math.sin(angle);
                  const y2 = 200 - r2 * Math.cos(angle);
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={isHour ? '#facdb9' : '#fcebe6'} strokeWidth={isHour ? 3 : 2} />
                })}
              </g>
              {/* Orange arc from 12 to 2 (approx 60 degrees) */}
              <path d="M 200 5 A 195 195 0 0 1 368 100" fill="none" stroke="#fb5614" strokeWidth="6" strokeLinecap="round" />
            </svg>

            {/* Background text: 12 MONTHS */}
            <div className="absolute -top-2 -right-8 lg:-top-4 lg:-right-10 text-right pr-4 hidden sm:block z-20">
              <p 
                className="text-[#111111] text-xs lg:text-sm font-black tracking-widest mb-1"
                style={{ textShadow: "2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 0 2px 0 #fff, 0 -2px 0 #fff, 2px 0 0 #fff, -2px 0 0 #fff, 0 0 8px #fff, 0 0 15px #fff" }}
              >
                12 MONTHS
              </p>
              <p 
                className="text-[#111111] text-xs font-semibold leading-snug max-w-[140px]"
                style={{ textShadow: "2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 0 2px 0 #fff, 0 -2px 0 #fff, 2px 0 0 #fff, -2px 0 0 #fff, 0 0 8px #fff, 0 0 15px #fff" }}
              >
                Annual renewal reminder
              </p>
            </div>

            {/* Inner physical clock face peeking from right side */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 bg-white rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-gray-50 flex items-center justify-center z-0 translate-x-12">
               {/* Center dot */}
               <div className="absolute w-2 h-2 bg-[#fb5614] rounded-full z-10"></div>
               {/* Hands */}
               <div className="absolute w-1 h-[70px] bg-[#111111] bottom-1/2 left-1/2 -translate-x-1/2 origin-bottom rotate-[45deg] rounded-full"></div>
               <div className="absolute w-1.5 h-[50px] bg-[#111111] bottom-1/2 left-1/2 -translate-x-1/2 origin-bottom rotate-[110deg] rounded-full"></div>
               {/* Clock Ticks */}
               {[...Array(12)].map((_, i) => (
                  <div key={i} className="absolute inset-0 flex justify-center" style={{ transform: `rotate(${i * 30}deg)` }}>
                    <div className={`w-0.5 bg-gray-300 mt-3 ${i % 3 === 0 ? 'h-3' : 'h-1.5'}`}></div>
                  </div>
               ))}
            </div>

            {/* The Due Date Card (Foreground) */}
            <div className="relative z-10 w-[110%] sm:w-full max-w-sm mr-auto bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-gray-100 p-6 sm:p-8 transform transition-transform hover:-translate-y-1 duration-500">
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-[#fff8f5] rounded-xl flex items-center justify-center shrink-0">
                  <Calendar className="text-[#fb5614]" size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black tracking-widest text-[#111111] uppercase mb-0.5">Your Next AFSS</h4>
                  <p className="text-[10px] text-gray-500">Annual Fire Safety Statement</p>
                </div>
              </div>
              
              <div className="w-full h-px bg-gray-100 mb-6"></div>
              
              {/* Due Date */}
              <div className="mb-6">
                <h5 className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">Due Date</h5>
                <p className="text-3xl sm:text-4xl font-black text-[#fb5614] tracking-tight">12 MAY 2026</p>
              </div>
              
              {/* Countdown Box */}
              <div className="bg-[#fff8f5] rounded-lg p-3 sm:p-4 flex items-center gap-3 mb-6">
                <Clock className="text-[#fb5614]" size={18} strokeWidth={2} />
                <p className="text-sm text-[#111111] font-medium">Due in <span className="font-bold text-[#fb5614]">218</span> days</p>
              </div>
              
              <p className="text-xs text-[#111111] mb-6 font-medium">Plan ahead and stay compliant.</p>
              
              {/* Reminder Box */}
              <div className="bg-[#faf9f7] rounded-lg p-3 sm:p-4 flex items-center gap-3 border border-gray-100">
                <Bell className="text-gray-500 shrink-0" size={18} strokeWidth={2} />
                <p className="text-xs text-[#111111] font-medium">We&apos;ll remind you before it&apos;s due</p>
              </div>
            </div>
          </div>
        </RevealOnView>
      </section>

      {/* Final CTA */}
      <ContactCTA />
    </>
  );
}
