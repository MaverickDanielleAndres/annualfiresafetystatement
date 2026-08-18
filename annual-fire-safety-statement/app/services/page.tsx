import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { 
  ClipboardCheck, Search, FileText, UploadCloud, ShieldCheck, 
  Target, Route, Users, AlertCircle, Wrench, CheckCircle2, 
  FileSignature, Landmark, Building, Archive, CalendarClock, 
  Bell, Calendar, Flame, Building2, HardHat, FileWarning, HelpCircle, 
  Settings, CheckSquare, ClipboardList, ArrowRight, ArrowUpRight, Check,
  BellRing, Droplets, Droplet, Disc, FireExtinguisher, DoorOpen, Lightbulb,
  PersonStanding, Fan, Shield, Megaphone, Handshake, UserCheck,
  Mail, ArrowUp, FileBadge, Folder, User
} from "lucide-react";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import CTASection from "@/components/CTASection";
import ContactCTA from "@/components/ContactCTA";
import RevealOnView from "@/components/RevealOnView";
import FreeSiteVisitButton from "@/components/free-site-visit/FreeSiteVisitButton";
import { createPageMetadata } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "AFSS Services — From Schedule to Statement",
  description:
    "One clear process for your annual fire safety obligations. We review what applies to your building, coordinate the required assessments, document the outcome and help move your AFSS through to completion.",
  path: "/services",
  keywords: ["AFSS services", "Fire Safety Schedule", "AFSS assessment"],
});

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="ANNUAL FIRE SAFETY STATEMENT SERVICES • NSW"
        titleLines={["From Schedule", "to Statement."]}
        description="One clear process for your annual fire safety obligations. We review what applies to your building, coordinate the required assessments, document the outcome and help move your AFSS through to completion."
        imageSrc="/diesel hydrant.jpg"
        imageAlt="Fire safety services"
        eyebrowClassName="text-[#ffad05]"
      />

      {/* Section 01 / AFSS SCOPE REVIEW */}
      <section className="container-inner pb-16 pt-0 lg:pb-24 lg:pt-0">
        <RevealOnView className="grid lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16 items-center lg:items-stretch">
          {/* Left Column Text */}
          <div className="flex flex-col h-full justify-center order-2 lg:order-1">
            <div className="mb-4">
              <span className="text-[#fb5614] text-sm font-bold tracking-widest uppercase">
                01 / AFSS SCOPE REVIEW
              </span>
            </div>
            
            <h2 className="text-[clamp(2.5rem,4vw,3.5rem)] font-black mb-6 tracking-tight leading-[1.05] text-[#111111]">
              It starts with <br />
              <span className="bg-gradient-to-r from-[#ff5614] to-[#ffad05] bg-clip-text text-transparent">
                your Schedule.
              </span>
            </h2>
            
            <p className="text-base text-[#111111] font-medium mb-6 max-w-lg leading-relaxed">
              Before anyone assesses your building, we establish exactly what needs to be assessed.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6 border-t border-gray-200 pt-6 mb-6">
              <div className="flex flex-col gap-2">
                <ClipboardList className="text-[#fb5614]" size={32} strokeWidth={1.5} />
                <div className="flex flex-col gap-1">
                  <h4 className="text-[13px] font-black text-[#111111] uppercase tracking-wide">Fire Safety Schedule Review</h4>
                  <p className="text-sm text-[#4a4a46] leading-relaxed">We review the current Fire Safety Schedule and identify the essential and critical fire safety measures listed for the property.</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <Target className="text-[#fb5614]" size={32} strokeWidth={1.5} />
                <div className="flex flex-col gap-1">
                  <h4 className="text-[13px] font-black text-[#111111] uppercase tracking-wide">Assessment Scope</h4>
                  <p className="text-sm text-[#4a4a46] leading-relaxed">Each listed measure is mapped to the assessment work required for your AFSS.</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <HardHat className="text-[#fb5614]" size={32} strokeWidth={1.5} />
                <div className="flex flex-col gap-1">
                  <h4 className="text-[13px] font-black text-[#111111] uppercase tracking-wide">Practitioner Matching</h4>
                  <p className="text-sm text-[#4a4a46] leading-relaxed">Where different assessment scopes are required, the right practitioner is coordinated for the right measure.</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <HelpCircle className="text-[#fb5614]" size={32} strokeWidth={1.5} />
                <div className="flex flex-col gap-1">
                  <h4 className="text-[13px] font-black text-[#111111] uppercase tracking-wide">Missing Schedule Support</h4>
                  <p className="text-sm text-[#4a4a46] leading-relaxed">Can't find your current Fire Safety Schedule? We can help identify the next step for obtaining or reissuing the correct document.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 mt-2">
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

          {/* Right Column Visual */}
          <div className="relative w-full aspect-square lg:aspect-auto lg:h-full order-1 lg:order-2 mt-8 lg:mt-0 min-h-[400px]">
            <div className="absolute top-0 right-0 w-full lg:w-[90%] h-full bg-gray-200 overflow-hidden">
               {/* Background image of person holding clipboard */}
               <Image src="/diesel hydrant.jpg" alt="Fire Safety Schedule" fill className="object-cover" />
            </div>

            {/* White Glassmorphic Mockup Overlay */}
            <div className="absolute bottom-0 left-0 w-[95%] sm:w-[420px] bg-white/85 backdrop-blur-xl rounded-xl border border-white/50 shadow-[0_30px_60px_rgba(0,0,0,0.12)] overflow-hidden z-10 -translate-x-2 sm:-translate-x-4 translate-y-4 lg:-translate-x-8 lg:translate-y-8">
               
               {/* Header */}
               <div className="flex items-center gap-4 p-5 border-b border-gray-200/50">
                 <ClipboardList className="text-[#fb5614] shrink-0" size={32} strokeWidth={1.5} />
                 <div className="flex flex-col">
                   <h3 className="text-[#111111] text-lg font-black tracking-wide uppercase leading-tight">Fire Safety Schedule</h3>
                   <span className="text-[#fb5614] text-[10px] uppercase tracking-widest font-bold">Scope Verification</span>
                 </div>
               </div>

               {/* Required Measures */}
               <div className="p-5">
                 <h4 className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-4">Required Measures</h4>
                 
                 <div className="space-y-4">
                   {[
                     { icon: Bell, title: "FIRE DETECTION & ALARM", std: "AS1670.1" },
                     { icon: Flame, title: "SPRINKLER SYSTEM", std: "AS2118.1" },
                     { icon: Target, title: "EMERGENCY LIGHTING", std: "AS2293.1" },
                     { icon: Building2, title: "FIRE DOORS", std: "AS1905.1" },
                   ].map((item, i) => (
                     <div key={i} className="flex items-center justify-between border-b border-gray-200/50 pb-4 last:border-0 last:pb-0">
                       <div className="flex items-center gap-4">
                         <item.icon className="text-[#111111]/40 shrink-0" size={24} strokeWidth={1.2} />
                         <div className="flex flex-col">
                           <span className="text-[#111111] text-xs font-bold uppercase tracking-wide">{item.title}</span>
                           <span className="text-gray-500 text-[10px] font-mono mt-0.5">{item.std}</span>
                         </div>
                       </div>
                       <div className="flex items-center gap-1 border border-green-500/30 rounded-full px-2.5 py-0.5 bg-green-50">
                         <CheckCircle2 size={10} className="text-green-600" strokeWidth={3} />
                         <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Verified</span>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>

               {/* Footer Note */}
               <div className="border-t border-gray-200/50 p-5 bg-white/50">
                 <div className="border-l-2 border-[#fb5614] pl-4 py-1">
                   <p className="text-xs text-[#4a4a46] font-medium leading-relaxed">
                     Mapping measures ensures the right accredited practitioner conducts the assessment.
                   </p>
                 </div>
               </div>

            </div>
          </div>
        </RevealOnView>
      </section>

      {/* Section 02 / AFSS ASSESSMENT */}
      <section className="bg-[#faf9f7] text-[#111111] py-16 lg:py-24 relative overflow-hidden border-y border-gray-100">
        {/* subtle watermark */}
        <div className="absolute top-0 right-0 w-full lg:w-[55%] h-full overflow-hidden pointer-events-none z-0 opacity-[0.03] flex items-center">
           <span className="text-[120px] lg:text-[200px] font-black uppercase whitespace-nowrap leading-none text-[#111111] -ml-4 lg:-ml-8">ASSESS</span>
        </div>
        
        <RevealOnView className="container-inner relative z-10 grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 items-center">
          {/* Left Column Image/Visual */}
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-gray-200 shadow-2xl">
             <Image src="/diesel hydrant.jpg" alt="Assessment" fill className="object-cover" />
             <div className="absolute inset-0 bg-black/20 mix-blend-multiply" />
             <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md rounded-xl p-5 border border-white/50 shadow-sm">
                <ClipboardCheck className="text-[#fb5614] mb-3" size={32} />
                <p className="text-[#111111] font-black tracking-widest uppercase text-xs">Accredited Verification</p>
                <div className="w-8 h-1 bg-[#fb5614] mt-3" />
             </div>
          </div>

          {/* Right Column Text */}
          <div className="flex flex-col">
            <span className="text-[#fb5614] text-xs font-bold tracking-[0.15em] uppercase mb-4">
              02 / AFSS ASSESSMENT
            </span>
            <h2 className="text-[clamp(2.5rem,4vw,3.5rem)] font-black mb-6 tracking-tight leading-[1.05] text-[#111111]">
              Every listed measure. <br />
              <span className="bg-gradient-to-r from-[#ff5614] to-[#ffad05] bg-clip-text text-transparent">
                Properly assessed.
              </span>
            </h2>
            <p className="text-lg text-[#4a4a46] mb-12 max-w-xl leading-relaxed">
              The assessment follows the requirements of your building's current Fire Safety Schedule.
            </p>

            <div className="grid sm:grid-cols-2 gap-8">
              <div className="flex items-start gap-4">
                 <div className="w-12 h-12 rounded-full bg-[#fb5614]/10 flex items-center justify-center shrink-0">
                    <CheckSquare className="text-[#fb5614]" size={20} />
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-[#111111] mb-2 uppercase tracking-wider">Essential Fire Safety Measures</h4>
                    <p className="text-xs text-[#4a4a46] leading-relaxed">Applicable measures are inspected and assessed against their required performance standards.</p>
                 </div>
              </div>
              <div className="flex items-start gap-4">
                 <div className="w-12 h-12 rounded-full bg-[#fb5614]/10 flex items-center justify-center shrink-0">
                    <Route className="text-[#fb5614]" size={20} />
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-[#111111] mb-2 uppercase tracking-wider">Exit Systems</h4>
                    <p className="text-xs text-[#4a4a46] leading-relaxed">The building's exit systems are inspected as part of the annual statement requirements.</p>
                 </div>
              </div>
              <div className="flex items-start gap-4">
                 <div className="w-12 h-12 rounded-full bg-[#fb5614]/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="text-[#fb5614]" size={20} />
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-[#111111] mb-2 uppercase tracking-wider">Accredited Assessment</h4>
                    <p className="text-xs text-[#4a4a46] leading-relaxed">AFSS assessment functions are completed by appropriately accredited practitioners where required.</p>
                 </div>
              </div>
              <div className="flex items-start gap-4">
                 <div className="w-12 h-12 rounded-full bg-[#fb5614]/10 flex items-center justify-center shrink-0">
                    <ClipboardList className="text-[#fb5614]" size={20} />
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-[#111111] mb-2 uppercase tracking-wider">Assessment Evidence</h4>
                    <p className="text-xs text-[#4a4a46] leading-relaxed">Inspection findings and supporting information are documented for the statement.</p>
                 </div>
              </div>
            </div>
          </div>
        </RevealOnView>
      </section>

      {/* Section 03 / FIRE SAFETY MEASURES */}
      <section className="bg-white border-y border-gray-100 relative">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] min-h-screen">
           {/* Left */}
           <div className="p-8 lg:py-24 lg:pl-[max(2rem,calc((100vw-80rem)/2))] lg:pr-12 flex flex-col justify-center">
             <RevealOnView>
               <span className="text-[#fb5614] text-sm font-bold tracking-[0.1em] uppercase mb-4 block">
                 03 / FIRE SAFETY MEASURES
               </span>
               <h2 className="text-[clamp(2.5rem,4vw,3.5rem)] font-black mb-6 tracking-tight leading-[1.05] text-[#111111]">
                 What&apos;s on your <br />
                 <span className="bg-gradient-to-r from-[#ff5614] to-[#ffad05] bg-clip-text text-transparent">
                   Schedule?
                 </span>
               </h2>
               <p className="text-lg text-[#4a4a46] mb-12 max-w-2xl leading-relaxed">
                 Every building is different. Your Fire Safety Schedule determines the actual assessment scope. <span className="text-[#fb5614] font-medium">Typical measures</span> can include:
               </p>

               <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-12">
                 {[
                   { num: "01", icon: BellRing, title: "Fire Detection\n& Alarm Systems" },
                   { num: "02", icon: Droplets, title: "Sprinkler\nSystems" },
                   { num: "03", icon: Droplet, title: "Fire\nHydrants" },
                   { num: "04", icon: Disc, title: "Fire Hose\nReels" },
                   { num: "05", icon: FireExtinguisher, title: "Portable Fire\nExtinguishers" },
                   { num: "06", icon: DoorOpen, title: "Fire Doors &\nSmoke Doors" },
                   { num: "07", icon: Lightbulb, title: "Emergency\nLighting" },
                   { num: "08", icon: PersonStanding, title: "Exit &\nDirectional Signage" },
                   { num: "09", icon: Fan, title: "Smoke Control\nSystems" },
                   { num: "10", icon: Shield, title: "Passive Fire\nProtection" },
                   { num: "11", icon: Settings, title: "Mechanical Fire\nSafety Systems" },
                   { num: "12", icon: Megaphone, title: "Occupant Warning\nSystems" },
                 ].map((measure, i) => (
                   <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:border-[#fb5614]/50 hover:shadow-md transition-all group">
                     <span className="text-[#fb5614] font-bold text-lg w-6 shrink-0">{measure.num}</span>
                     <div className="shrink-0 text-[#fb5614] group-hover:scale-110 transition-transform">
                       <measure.icon size={26} strokeWidth={1.5} />
                     </div>
                     <span className="text-[11px] font-bold text-[#111111] leading-tight uppercase whitespace-pre-line tracking-wide">{measure.title}</span>
                   </div>
                 ))}
               </div>

               <div className="border border-[#fb5614] rounded-xl p-6 lg:p-8 flex flex-col sm:flex-row gap-6 items-start bg-white shadow-lg relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-[#fb5614]/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                 <div className="shrink-0 text-[#fb5614] relative z-10">
                   <ShieldCheck size={48} strokeWidth={1.5} />
                 </div>
                 <div className="relative z-10">
                   <h4 className="font-black text-[#111111] uppercase tracking-wide mb-2 text-sm">YOUR SCHEDULE SETS THE REQUIREMENT.</h4>
                   <p className="text-sm text-[#4a4a46] leading-relaxed">We assess only within verified practitioner accreditation and coordinate other appropriate practitioners where additional scopes are required.</p>
                 </div>
               </div>
             </RevealOnView>
           </div>
           
           {/* Right */}
           <div className="relative min-h-[600px] lg:min-h-full w-full lg:p-8 lg:pl-0">
             <div className="relative w-full h-full min-h-[600px] lg:rounded-3xl overflow-hidden shadow-2xl bg-[#111]">
               <Image src="/diesel hydrant.jpg" alt="Fire safety measures" fill className="object-cover opacity-80" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
             </div>
             
             <div className="absolute bottom-8 left-8 right-8 lg:bottom-16 lg:-left-6 lg:right-auto lg:w-[380px]">
               <RevealOnView>
                 <div className="bg-black/30 backdrop-blur-2xl rounded-3xl p-6 lg:p-8 shadow-[0_30px_60px_rgba(0,0,0,0.4)] border border-white/10">
                   <div className="flex gap-4 mb-6 pb-6 border-b border-white/10">
                     <div className="shrink-0 text-[#fb5614]">
                       <CalendarClock size={28} strokeWidth={1.5} />
                     </div>
                     <div>
                       <h4 className="font-bold text-white uppercase text-[11px] tracking-widest mb-2">EVERY MEASURE MATTERS.</h4>
                       <p className="text-xs text-white/80 leading-relaxed">Each essential fire safety measure listed on your Fire Safety Schedule plays a critical role in protecting people, property and the building.</p>
                     </div>
                   </div>
                   
                   <div className="flex gap-4 mb-6 pb-6 border-b border-white/10">
                     <div className="shrink-0 text-[#fb5614]">
                       <UserCheck size={28} strokeWidth={1.5} />
                     </div>
                     <div>
                       <h4 className="font-bold text-white uppercase text-[11px] tracking-widest mb-2">ACCREDITED ASSESSMENTS</h4>
                       <p className="text-xs text-white/80 leading-relaxed">Assessments are carried out by accredited practitioners with the appropriate scopes of accreditation.</p>
                     </div>
                   </div>

                   <div className="flex gap-4">
                     <div className="shrink-0 text-[#fb5614]">
                       <Handshake size={28} strokeWidth={1.5} />
                     </div>
                     <div>
                       <h4 className="font-bold text-white uppercase text-[11px] tracking-widest mb-2">COORDINATED FOR YOU</h4>
                       <p className="text-xs text-white/80 leading-relaxed">Where multiple disciplines are required, we coordinate the right people to get the job done.</p>
                     </div>
                   </div>
                 </div>
               </RevealOnView>
             </div>
           </div>
        </div>
      </section>

      {/* Section 04 / FINDINGS & DEFECTS */}
      <section className="bg-[#faf9f7] py-16 lg:py-24 border-y border-gray-100 overflow-hidden">
        <RevealOnView className="container-inner grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-20 items-center">
          
          {/* Left Side: Photo and Mockup */}
          <div className="relative w-full aspect-[4/5] lg:aspect-auto lg:h-[750px] order-1 lg:order-1 rounded-2xl">
             <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                <Image src="/diesel hydrant.jpg" alt="Fire Door Assessment" fill className="object-cover object-center" />
                <div className="absolute inset-0 bg-black/10 mix-blend-multiply" />
             </div>
             
             {/* Defect Report Card */}
             <div className="absolute right-0 lg:-right-8 xl:-right-12 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-0 bg-white/85 backdrop-blur-xl rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-white/50 p-5 w-[85%] sm:w-[320px] z-10 flex flex-col gap-3">
                <div className="mb-1 px-1">
                   <h3 className="font-black text-[#111111] text-xl uppercase tracking-tighter">DEFECT REPORT</h3>
                   <p className="text-[11px] text-gray-500 font-medium mt-0.5">Summary of Findings</p>
                </div>
                
                {/* Defect item critical */}
                <div className="border border-red-200 rounded-xl p-3.5 flex gap-3 items-start bg-transparent">
                   <div className="w-7 h-7 rounded-full bg-[#e3000f] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <span className="text-white font-black text-base leading-none">!</span>
                   </div>
                   <div>
                      <p className="text-[#e3000f] font-bold text-[10px] uppercase tracking-wider mb-0.5">Critical</p>
                      <p className="font-bold text-[#111111] text-xs mb-1">Fire Door - Ground Floor</p>
                      <p className="text-[11px] text-gray-600 leading-relaxed">Door fails to self-close and latch. Requires urgent adjustment to maintain fire compartmentation.</p>
                   </div>
                </div>

                {/* Defect item non-critical */}
                <div className="border border-amber-200 rounded-xl p-3.5 flex gap-3 items-start bg-transparent">
                   <div className="shrink-0 mt-0.5">
                      <AlertCircle className="text-amber-500" size={26} strokeWidth={1.5} />
                   </div>
                   <div>
                      <p className="text-amber-500 font-bold text-[10px] uppercase tracking-wider mb-0.5">Non-Critical</p>
                      <p className="font-bold text-[#111111] text-xs mb-1">Exit Sign - Level 2</p>
                      <p className="text-[11px] text-gray-600 leading-relaxed">Diffuser cracked. Does not affect illumination but requires replacement.</p>
                   </div>
                </div>

                {/* Defect item non-conformance */}
                <div className="border border-gray-200 rounded-xl p-3.5 flex gap-3 items-start bg-transparent">
                   <div className="w-7 h-7 rounded-full bg-gray-500 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <span className="text-white font-black text-lg leading-none -mt-2">...</span>
                   </div>
                   <div>
                      <p className="text-gray-500 font-bold text-[10px] uppercase tracking-wider mb-0.5">Non-Conf.</p>
                      <p className="font-bold text-[#111111] text-xs mb-1">Baseline Data</p>
                      <p className="text-[11px] text-gray-600 leading-relaxed">Baseline flow/pressure data for hydrant system not available on site.</p>
                   </div>
                </div>
             </div>
          </div>

          {/* Right Side: Text & List */}
          <div className="flex flex-col order-2 lg:order-2 lg:pl-10 xl:pl-16">
            <span className="text-[#fb5614] text-xs font-bold tracking-[0.15em] uppercase mb-4">
              04 / FINDINGS & DEFECTS
            </span>
            <h2 className="text-[clamp(2.5rem,4vw,3.5rem)] font-black mb-6 tracking-tight leading-[1.05] text-[#111111]">
              Know what needs <br />
              <span className="bg-gradient-to-r from-[#ff5614] to-[#ffad05] bg-clip-text text-transparent">
                attention.
              </span>
            </h2>
            <p className="text-lg text-[#4a4a46] mb-12 max-w-xl leading-relaxed">
              An AFSS assessment should leave you with a clear picture of your building's fire safety measures.
            </p>

            <div className="flex flex-col mb-12">
               <div className="flex gap-6 py-5 border-b border-gray-200">
                  <div className="shrink-0 mt-1">
                     <ClipboardList className="text-[#fb5614]" size={36} strokeWidth={1.5} />
                  </div>
                  <div>
                     <h4 className="text-base font-bold text-[#111111] mb-1">Assessment Findings</h4>
                     <p className="text-sm text-[#4a4a46] leading-relaxed">Get a clear record of the measures assessed and their condition.</p>
                  </div>
               </div>
               
               <div className="flex gap-6 py-5 border-b border-gray-200">
                  <div className="shrink-0 mt-1">
                     <AlertCircle className="text-[#fb5614]" size={36} strokeWidth={1.5} />
                  </div>
                  <div>
                     <h4 className="text-base font-bold text-[#111111] mb-1">Critical Defects</h4>
                     <p className="text-sm text-[#4a4a46] leading-relaxed">Issues affecting the operation of a fire safety system are clearly identified for urgent attention.</p>
                  </div>
               </div>
               
               <div className="flex gap-6 py-5 border-b border-gray-200">
                  <div className="shrink-0 mt-1">
                     <Wrench className="text-[#fb5614]" size={36} strokeWidth={1.5} />
                  </div>
                  <div>
                     <h4 className="text-base font-bold text-[#111111] mb-1">Non-Critical Defects</h4>
                     <p className="text-sm text-[#4a4a46] leading-relaxed">Items that require correction or ongoing attention are documented.</p>
                  </div>
               </div>
               
               <div className="flex gap-6 py-5 border-b border-gray-200">
                  <div className="shrink-0 mt-1">
                     <FileText className="text-[#fb5614]" size={36} strokeWidth={1.5} />
                  </div>
                  <div>
                     <h4 className="text-base font-bold text-[#111111] mb-1">Non-Conformances</h4>
                     <p className="text-sm text-[#4a4a46] leading-relaxed">Missing information, documentation issues and other non-conformances are identified separately from operational defects.</p>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-[#fb5614] font-black text-3xl leading-none -mt-1">&gt;</div>
              <span className="font-black text-[#111111] uppercase tracking-wide text-lg sm:text-xl">
                CLEAR FINDINGS. CLEAR NEXT STEPS.
              </span>
            </div>
          </div>

        </RevealOnView>
      </section>

      {/* Section 05 / RECTIFICATION & REASSESSMENT */}
      <section className="container-inner py-16 lg:py-24 overflow-hidden">
        <RevealOnView>
          <div className="flex flex-col lg:flex-row justify-between items-end gap-8 mb-16">
            <div>
              <span className="text-[#fb5614] text-xs font-bold tracking-[0.15em] uppercase mb-4 block">
                05 / RECTIFICATION & REASSESSMENT
              </span>
              <h2 className="text-[clamp(2.5rem,4vw,3.5rem)] font-black mb-6 tracking-tight leading-[1.05] text-[#111111]">
                Find it. Fix it. <br />
                <span className="bg-gradient-to-r from-[#ff5614] to-[#ffad05] bg-clip-text text-transparent">
                  Verify it.
                </span>
              </h2>
            </div>
            <p className="text-lg text-[#4a4a46] max-w-md leading-relaxed lg:pb-2">
              Where an assessment identifies an issue, the AFSS process doesn't have to stop there.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row w-full gap-8 lg:gap-0 mt-8">
             {/* Step 1 */}
             <div className="flex-1 flex flex-col">
               <div className="relative w-full lg:w-[calc(100%+22px)] h-[300px] lg:h-[400px] rounded-2xl lg:rounded-none overflow-hidden lg:[clip-path:polygon(0_0,100%_0,calc(100%-48px)_100%,0_100%)]">
                 <Image src="/diesel hydrant.jpg" fill className="object-cover" alt="01 Identified" />
               </div>
               <div className="flex flex-col items-center text-center mt-6 lg:mt-10 relative z-10">
                 <div className="hidden lg:block absolute top-[23px] left-[50%] right-0 h-[2px] bg-gray-200 z-[-1]" />
                 <div className="w-[48px] h-[48px] rounded-full border-2 border-[#fb5614] bg-white flex items-center justify-center text-[#fb5614] font-bold text-lg mb-5 shadow-sm">
                   01
                 </div>
                 <h4 className="font-black text-sm lg:text-base uppercase tracking-wider mb-2 text-[#111111]">IDENTIFIED</h4>
                 <p className="text-sm text-[#4a4a46] px-2 max-w-[200px]">Defect found during assessment.</p>
               </div>
             </div>

             {/* Step 2 */}
             <div className="flex-1 flex flex-col">
               <div className="relative w-full lg:w-[calc(100%+46px)] lg:-ml-6 h-[300px] lg:h-[400px] rounded-2xl lg:rounded-none overflow-hidden lg:[clip-path:polygon(48px_0,100%_0,calc(100%-48px)_100%,0_100%)]">
                 <Image src="/diesel hydrant.jpg" fill className="object-cover" alt="02 Rectified" />
               </div>
               <div className="flex flex-col items-center text-center mt-6 lg:mt-10 relative z-10">
                 <div className="hidden lg:block absolute top-[23px] left-0 right-0 h-[2px] bg-gray-200 z-[-1]" />
                 <div className="w-[48px] h-[48px] rounded-full border-2 border-[#fb5614] bg-white flex items-center justify-center text-[#fb5614] font-bold text-lg mb-5 shadow-sm">
                   02
                 </div>
                 <h4 className="font-black text-sm lg:text-base uppercase tracking-wider mb-2 text-[#111111]">RECTIFIED</h4>
                 <p className="text-sm text-[#4a4a46] px-2 max-w-[200px]">Appropriate works carried out.</p>
               </div>
             </div>

             {/* Step 3 */}
             <div className="flex-1 flex flex-col">
               <div className="relative w-full lg:w-[calc(100%+46px)] lg:-ml-6 h-[300px] lg:h-[400px] rounded-2xl lg:rounded-none overflow-hidden lg:[clip-path:polygon(48px_0,100%_0,calc(100%-48px)_100%,0_100%)]">
                 <Image src="/diesel hydrant.jpg" fill className="object-cover" alt="03 Reassessed" />
               </div>
               <div className="flex flex-col items-center text-center mt-6 lg:mt-10 relative z-10">
                 <div className="hidden lg:block absolute top-[23px] left-0 right-0 h-[2px] bg-gray-200 z-[-1]" />
                 <div className="w-[48px] h-[48px] rounded-full border-2 border-[#fb5614] bg-white flex items-center justify-center text-[#fb5614] font-bold text-lg mb-5 shadow-sm">
                   03
                 </div>
                 <h4 className="font-black text-sm lg:text-base uppercase tracking-wider mb-2 text-[#111111]">REASSESSED</h4>
                 <p className="text-sm text-[#4a4a46] px-2 max-w-[200px]">Measure checked again.</p>
               </div>
             </div>

             {/* Step 4 */}
             <div className="flex-1 flex flex-col">
               <div className="relative w-full lg:w-[calc(100%+24px)] lg:-ml-6 h-[300px] lg:h-[400px] rounded-2xl lg:rounded-none overflow-hidden lg:[clip-path:polygon(48px_0,100%_0,100%_100%,0_100%)]">
                 <Image src="/diesel hydrant.jpg" fill className="object-cover" alt="04 Close-Out" />
               </div>
               <div className="flex flex-col items-center text-center mt-6 lg:mt-10 relative z-10">
                 <div className="hidden lg:block absolute top-[23px] left-0 right-[50%] h-[2px] bg-gray-200 z-[-1]" />
                 <div className="w-[48px] h-[48px] rounded-full border-2 border-[#fb5614] bg-white flex items-center justify-center text-[#fb5614] font-bold text-lg mb-5 shadow-sm">
                   04
                 </div>
                 <h4 className="font-black text-sm lg:text-base uppercase tracking-wider mb-2 text-[#111111]">CLOSE-OUT</h4>
                 <p className="text-sm text-[#4a4a46] px-2 max-w-[200px]">Records updated and AFSS continues.</p>
               </div>
             </div>
          </div>
        </RevealOnView>
      </section>

      {/* Section 06 / AFSS PREPARATION */}
      <section className="bg-[#faf9f7] text-[#111111] py-16 lg:py-24 relative overflow-hidden border-y border-gray-100">
        {/* subtle watermark */}
        <div className="absolute top-0 right-0 w-full lg:w-[55%] h-full overflow-hidden pointer-events-none z-0 opacity-[0.03] flex items-center">
           <span className="text-[120px] lg:text-[200px] font-black uppercase whitespace-nowrap leading-none text-[#111111] -ml-4 lg:-ml-8">STATEMENT</span>
        </div>
        
        <RevealOnView className="container-inner relative z-10 grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 items-center">
          {/* Left Column Image/Visual */}
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-gray-200 shadow-2xl">
             <Image src="/herosection.avif" alt="Statement Preparation" fill className="object-cover" />
             <div className="absolute inset-0 bg-black/20 mix-blend-multiply" />
             <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md rounded-xl p-5 border border-white/50 shadow-sm">
                <FileSignature className="text-[#fb5614] mb-3" size={32} />
                <p className="text-[#111111] font-black tracking-widest uppercase text-xs">Statement Preparation</p>
                <div className="w-8 h-1 bg-[#fb5614] mt-3" />
             </div>
          </div>

          {/* Right Text */}
          <div className="flex flex-col">
            <span className="text-[#fb5614] text-xs font-bold tracking-[0.15em] uppercase mb-4">
              06 / AFSS PREPARATION
            </span>
            <h2 className="text-[clamp(2.5rem,4vw,3.5rem)] font-black mb-6 tracking-tight leading-[1.05] text-[#111111]">
              From assessment <br />
              <span className="bg-gradient-to-r from-[#ff5614] to-[#ffad05] bg-clip-text text-transparent">
                to statement.
              </span>
            </h2>
            <p className="text-lg text-[#4a4a46] mb-12 max-w-xl leading-relaxed">
              Once the required assessments are complete, the information comes together into the Annual Fire Safety Statement process.
            </p>

            <div className="grid sm:grid-cols-2 gap-8 mb-12">
              <div className="flex items-start gap-4">
                 <div className="w-12 h-12 rounded-full bg-[#fb5614]/10 flex items-center justify-center shrink-0">
                    <FileSignature className="text-[#fb5614]" size={20} />
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-[#111111] mb-2 uppercase tracking-wider">Statement Preparation</h4>
                    <p className="text-xs text-[#4a4a46] leading-relaxed">Assessment information is compiled using the required NSW Annual Fire Safety Statement format.</p>
                 </div>
              </div>
              <div className="flex items-start gap-4">
                 <div className="w-12 h-12 rounded-full bg-[#fb5614]/10 flex items-center justify-center shrink-0">
                    <Users className="text-[#fb5614]" size={20} />
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-[#111111] mb-2 uppercase tracking-wider">Practitioner Details</h4>
                    <p className="text-xs text-[#4a4a46] leading-relaxed">Relevant accredited practitioner information is included for the measures assessed.</p>
                 </div>
              </div>
              <div className="flex items-start gap-4">
                 <div className="w-12 h-12 rounded-full bg-[#fb5614]/10 flex items-center justify-center shrink-0">
                    <Building2 className="text-[#fb5614]" size={20} />
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-[#111111] mb-2 uppercase tracking-wider">Building & Owner Information</h4>
                    <p className="text-xs text-[#4a4a46] leading-relaxed">The statement is prepared with the required property and ownership information.</p>
                 </div>
              </div>
              <div className="flex items-start gap-4">
                 <div className="w-12 h-12 rounded-full bg-[#fb5614]/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="text-[#fb5614]" size={20} />
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-[#111111] mb-2 uppercase tracking-wider">Owner Sign-Off Support</h4>
                    <p className="text-xs text-[#4a4a46] leading-relaxed">We help make the final statement clear for the building owner or authorised representative issuing it.</p>
                 </div>
              </div>
            </div>

            <Link href="/sample" className="font-bold underline hover:no-underline underline-offset-4 decoration-2 decoration-[#fb5614] text-[#111111] uppercase text-sm w-max tracking-widest">
              SEE A SAMPLE AFSS &rarr;
            </Link>
          </div>
        </RevealOnView>
      </section>

      {/* Section 07 / LODGEMENT SUPPORT */}
      <section className="container-inner py-16 lg:py-24">
        <RevealOnView className="grid lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-16 items-start">
          {/* Left Column - Main Content */}
          <div className="flex flex-col justify-between h-full lg:pr-8">
            <div>
              <span className="text-[#fb5614] text-sm font-bold tracking-[0.1em] uppercase mb-4 block">
                07 / LODGEMENT SUPPORT
              </span>
              <h2 className="text-[clamp(2.5rem,4vw,3.5rem)] font-black mb-6 tracking-tight leading-[1.05] text-[#111111]">
                Ready to{' '}
                <span className="bg-gradient-to-r from-[#ff5614] to-[#ffad05] bg-clip-text text-transparent">
                  lodge.
                </span>
              </h2>
              <p className="text-lg text-[#4a4a46] mb-12 max-w-xl leading-relaxed">
                Once your AFSS is complete, we help prepare everything for the final compliance step.
              </p>

              <div className="flex flex-col">
                {/* Item 1 */}
                <div className="flex gap-6 py-6 border-b border-gray-200 first:pt-0">
                  <div className="shrink-0 mt-1">
                    <div className="w-12 h-12 border-2 border-[#fb5614] flex items-center justify-center rounded-md relative">
                      <Mail className="text-[#fb5614]" size={24} strokeWidth={1.5} />
                      <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-white px-0.5">
                        <ArrowUp className="text-[#fb5614]" size={14} strokeWidth={2.5} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[#111111] mb-1">Council + FRNSW</h4>
                    <p className="text-sm text-[#4a4a46] leading-relaxed">Statement and Schedule prepared for submission.</p>
                  </div>
                </div>
                {/* Item 2 */}
                <div className="flex gap-6 py-6 border-b border-gray-200">
                  <div className="shrink-0 mt-1">
                    <div className="w-12 h-12 border-2 border-[#fb5614] flex items-center justify-center rounded-md">
                      <FileBadge className="text-[#fb5614]" size={24} strokeWidth={1.5} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[#111111] mb-1">Building Copy</h4>
                    <p className="text-sm text-[#4a4a46] leading-relaxed">Current documents ready for required display.</p>
                  </div>
                </div>
                {/* Item 3 */}
                <div className="flex gap-6 py-6 border-b border-gray-200 border-b-transparent">
                  <div className="shrink-0 mt-1">
                    <div className="w-12 h-12 border-2 border-[#fb5614] flex items-center justify-center rounded-md">
                      <Folder className="text-[#fb5614]" size={24} strokeWidth={1.5} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[#111111] mb-1">Records</h4>
                    <p className="text-sm text-[#4a4a46] leading-relaxed">Completed AFSS organised for the next annual cycle.</p>
                  </div>
                </div>
              </div>
            </div>


          </div>
          
          {/* Right Column - Images & Timeline */}
          <div className="flex flex-col h-full mt-12 lg:mt-0">
             {/* Collage */}
             <div className="w-full flex-1 min-h-[350px] flex bg-[#f4f4f4] rounded-sm overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
                {/* Panel 1 */}
                <div className="flex-[1.2] border-r-4 border-white relative overflow-hidden [clip-path:polygon(0_0,100%_0,calc(100%-40px)_100%,0_100%)] z-30 mr-[-40px]">
                   <div className="absolute inset-0 bg-[#f4f4f4] p-4 lg:p-6 flex items-center justify-center">
                     {/* The Document */}
                     <div className="bg-white w-[95%] h-[90%] shadow-md border border-gray-200 p-4 lg:p-5 flex flex-col relative">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                           <div className="w-10 h-12 border-2 border-gray-800 rounded-t-xl bg-[#eee] shadow-sm flex justify-center items-end pb-1">
                              <div className="w-6 h-2 border border-gray-600 rounded-full bg-gray-300" />
                           </div>
                        </div>
                        <div className="mt-6 lg:mt-8 text-right flex flex-col items-end">
                           <span className="font-black text-[10px] uppercase tracking-widest text-gray-800">ALL FIRE</span>
                           <span className="font-medium text-[8px] tracking-[0.2em] text-gray-500 uppercase">SERVICES</span>
                        </div>
                        <div className="mt-4">
                           <h3 className="font-medium text-lg text-gray-800">AFSS</h3>
                           <h4 className="font-bold text-[8px] lg:text-[9px] mb-2 uppercase">ANNUAL FIRE SAFETY STATEMENT</h4>
                           <div className="w-full h-[1px] bg-gray-300 my-2" />
                           <div className="w-3/4 h-1 lg:h-1.5 bg-gray-200 mb-2 rounded" />
                           <div className="w-full h-1 lg:h-1.5 bg-gray-200 mb-2 rounded" />
                           <div className="w-5/6 h-1 lg:h-1.5 bg-gray-200 mb-2 rounded" />
                           <div className="w-1/2 h-1 lg:h-1.5 bg-gray-200 mb-6 rounded" />
                           <div className="w-full h-[1px] bg-gray-300 my-2" />
                           <div className="w-full h-1 lg:h-1.5 bg-gray-200 mb-2 rounded" />
                           
                           <div className="absolute bottom-4 right-4 flex justify-end">
                              <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full border-4 border-[#fb5614]/20 flex items-center justify-center">
                                 <Check className="text-[#fb5614]/40" size={32} />
                              </div>
                           </div>
                        </div>
                     </div>
                   </div>
                </div>
                
                {/* Panel 2 */}
                <div className="flex-1 border-r-4 border-white relative overflow-hidden [clip-path:polygon(40px_0,100%_0,calc(100%-40px)_100%,0_100%)] z-20 mr-[-40px]">
                   <div className="absolute inset-0 bg-[#e8e6e1] p-4 lg:p-6 flex flex-col items-center justify-center">
                      {/* Tablet */}
                      <div className="bg-black p-1.5 lg:p-2 rounded-xl w-[95%] h-[55%] mb-[-10%] z-10 shadow-xl">
                         <div className="bg-white w-full h-full rounded-md p-3 flex flex-col items-center justify-center">
                            <span className="text-[7px] lg:text-[9px] font-bold tracking-wider mb-2 lg:mb-4">COUNCIL PORTAL</span>
                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border-2 border-[#fb5614] flex items-center justify-center text-[#fb5614] mb-2">
                               <Check size={24} />
                            </div>
                            <span className="text-[9px] lg:text-[10px] font-medium text-center">Submission<br/>Received</span>
                         </div>
                      </div>
                      {/* Envelope */}
                      <div className="bg-[#e8d5b5] w-[98%] h-[40%] rounded-sm shadow-md border border-[#d6c3a3] p-2 lg:p-3 relative z-20 overflow-hidden">
                         <div className="absolute top-0 left-0 right-0 h-1/2 border-b border-[#d6c3a3] opacity-50" />
                         <div className="mt-2 lg:mt-4">
                           <span className="text-[8px] lg:text-[9px] text-gray-700 font-medium">To:</span><br/>
                           <span className="text-[10px] lg:text-xs font-bold text-black leading-tight">City Council<br/>+ FRNSW</span>
                         </div>
                         <div className="absolute bottom-1 right-1 lg:bottom-2 lg:right-2 border border-[#fb5614] text-[#fb5614] text-[6px] lg:text-[8px] font-bold px-1 py-0.5 uppercase tracking-wider bg-white/80">
                            READY TO LODGE
                         </div>
                      </div>
                   </div>
                </div>

                {/* Panel 3 */}
                <div className="flex-[1.1] relative overflow-hidden [clip-path:polygon(40px_0,100%_0,100%_100%,0_100%)] z-10">
                   <div className="absolute inset-0 bg-[#d9d9d9] p-2 lg:p-4 flex gap-1 lg:gap-2 items-center justify-center">
                      {/* Acrylic Sign */}
                      <div className="w-[45%] h-[65%] lg:h-[70%] bg-white/40 backdrop-blur-md border border-white/60 shadow-lg rounded-sm p-2 lg:p-3 flex flex-col items-center text-center relative">
                         <div className="absolute top-1 left-1 lg:top-2 lg:left-2 w-1 lg:w-1.5 h-1 lg:h-1.5 rounded-full bg-gray-400 shadow-sm" />
                         <div className="absolute top-1 right-1 lg:top-2 lg:right-2 w-1 lg:w-1.5 h-1 lg:h-1.5 rounded-full bg-gray-400 shadow-sm" />
                         <div className="absolute bottom-1 left-1 lg:bottom-2 lg:left-2 w-1 lg:w-1.5 h-1 lg:h-1.5 rounded-full bg-gray-400 shadow-sm" />
                         <div className="absolute bottom-1 right-1 lg:bottom-2 lg:right-2 w-1 lg:w-1.5 h-1 lg:h-1.5 rounded-full bg-gray-400 shadow-sm" />
                         
                         <h4 className="text-[7px] lg:text-[9px] font-black mt-1 lg:mt-2 mb-1 uppercase leading-tight">ANNUAL FIRE<br/>SAFETY STATEMENT</h4>
                         <span className="text-[#fb5614] text-[8px] lg:text-[10px] font-bold mb-1 lg:mb-2">AFSS</span>
                         <span className="text-[6px] lg:text-[7px] font-bold tracking-widest text-gray-600 mb-2 lg:mb-4">THIS BUILDING</span>
                         
                         <div className="w-full h-[1px] bg-gray-400/30 mb-2" />
                         <span className="text-[5px] lg:text-[6px] text-gray-800 leading-tight uppercase font-medium">
                           Statement and schedule<br/>are available for<br/>inspection
                         </span>
                         <div className="absolute bottom-2 lg:bottom-3 flex flex-col items-center">
                           <span className="font-black text-[6px] lg:text-[8px] uppercase tracking-widest text-gray-800 leading-none">ALL FIRE</span>
                           <span className="text-gray-500 font-medium text-[5px] lg:text-[6px] uppercase tracking-[0.2em] mt-0.5">SERVICES</span>
                         </div>
                      </div>
                      
                      {/* Black Box */}
                      <div className="w-[50%] h-[75%] lg:h-[80%] bg-[#222] rounded-t-sm shadow-xl flex flex-col border-l border-gray-700 relative overflow-hidden">
                         {/* Folders sticking out */}
                         <div className="h-[20%] w-[90%] mx-auto bg-white mt-2 rounded-t flex gap-0.5 lg:gap-1 p-0.5 lg:p-1 items-end opacity-90">
                            <div className="w-1 lg:w-1.5 h-full bg-gray-200 rounded-t" />
                            <div className="w-1 lg:w-1.5 h-[90%] bg-gray-300 rounded-t" />
                            <div className="w-1 lg:w-1.5 h-[95%] bg-gray-200 rounded-t" />
                            <div className="w-1 lg:w-1.5 h-[80%] bg-gray-300 rounded-t" />
                         </div>
                         {/* Box body */}
                         <div className="flex-1 w-full bg-[#1a1a1a] p-1.5 lg:p-2 flex flex-col items-center justify-center">
                            <div className="bg-white w-[95%] p-1.5 lg:p-2 flex flex-col items-center text-center rounded-sm">
                               <span className="text-[7px] lg:text-[9px] font-black uppercase leading-tight">AFSS<br/>RECORDS</span>
                               <span className="text-[6px] lg:text-[8px] font-medium text-gray-600 my-1">2024 / 2025</span>
                               <div className="w-3 h-3 lg:w-4 lg:h-4 rounded-full border border-[#fb5614] flex items-center justify-center mt-1">
                                  <Check className="text-[#fb5614]" size={10} />
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
             
             {/* Timeline */}
             <div className="mt-8 lg:mt-12 flex justify-between items-center w-full px-4 lg:px-8 relative max-w-[90%] mx-auto lg:max-w-none">
                <div className="absolute left-[10%] right-[10%] top-[24px] h-[1px] bg-gray-300 z-0" />
                
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-[3px] border-[#fb5614] bg-white flex items-center justify-center text-[#fb5614] text-lg font-black shadow-sm">
                    01
                  </div>
                  <span className="font-black text-[#111111] uppercase tracking-wider text-[11px] lg:text-xs">SUBMIT</span>
                </div>
                
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-[1.5px] border-gray-300 bg-white flex items-center justify-center text-[#fb5614] text-lg font-black shadow-sm">
                    02
                  </div>
                  <span className="font-black text-[#111111] uppercase tracking-wider text-[11px] lg:text-xs">DISPLAY</span>
                </div>

                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-[1.5px] border-gray-300 bg-white flex items-center justify-center text-[#fb5614] text-lg font-black shadow-sm">
                    03
                  </div>
                  <span className="font-black text-[#111111] uppercase tracking-wider text-[11px] lg:text-xs">FILE</span>
                </div>
             </div>
          </div>
        </RevealOnView>
      </section>

      {/* Section 08 / ANNUAL AFSS MANAGEMENT */}
      <section className="bg-[#faf9f7] py-16 lg:py-24 border-y border-gray-100 overflow-hidden">
        <RevealOnView className="container-inner grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-24 items-center">
          {/* Left Text */}
          <div className="flex flex-col">
            <span className="text-[#fb5614] text-xs font-bold tracking-[0.15em] uppercase mb-4">
              08 / ANNUAL AFSS MANAGEMENT
            </span>
            <h2 className="text-[clamp(2.5rem,4vw,3.5rem)] font-black mb-6 tracking-tight leading-[1.05] text-[#111111]">
              Compliance doesn't <br />
              end when the <br />
              <span className="bg-gradient-to-r from-[#ff5614] to-[#ffad05] bg-clip-text text-transparent">
                statement is lodged.
              </span>
            </h2>
            <p className="text-lg text-[#4a4a46] mb-6 max-w-xl leading-relaxed">
              AFSS is an annual obligation, so the next cycle starts sooner than most building owners expect.
            </p>

            <div className="flex flex-col mb-2">
               <div className="flex gap-6 py-5 border-b border-gray-200">
                  <div className="shrink-0 mt-1">
                     <Calendar className="text-[#fb5614]" size={36} strokeWidth={1.5} />
                  </div>
                  <div>
                     <h4 className="text-base font-bold text-[#111111] mb-1">Due-Date Tracking</h4>
                     <p className="text-sm text-[#4a4a46] leading-relaxed">Keep your next AFSS date visible.</p>
                  </div>
               </div>
               
               <div className="flex gap-6 py-5 border-b border-gray-200">
                  <div className="shrink-0 mt-1">
                     <BellRing className="text-[#fb5614]" size={36} strokeWidth={1.5} />
                  </div>
                  <div>
                     <h4 className="text-base font-bold text-[#111111] mb-1">Renewal Reminders</h4>
                     <p className="text-sm text-[#4a4a46] leading-relaxed">Plan inspections and assessments before the deadline approaches.</p>
                  </div>
               </div>
               
               <div className="flex gap-6 py-5 border-b border-gray-200">
                  <div className="shrink-0 mt-1">
                     <ClipboardList className="text-[#fb5614]" size={36} strokeWidth={1.5} />
                  </div>
                  <div>
                     <h4 className="text-base font-bold text-[#111111] mb-1">Schedule on File</h4>
                     <p className="text-sm text-[#4a4a46] leading-relaxed">Keep the current Fire Safety Schedule ready for the next assessment cycle.</p>
                  </div>
               </div>
               
               <div className="flex gap-6 py-5 border-b border-gray-200">
                  <div className="shrink-0 mt-1">
                     <Archive className="text-[#fb5614]" size={36} strokeWidth={1.5} />
                  </div>
                  <div>
                     <h4 className="text-base font-bold text-[#111111] mb-1">Previous Records</h4>
                     <p className="text-sm text-[#4a4a46] leading-relaxed">Maintain continuity between previous findings, completed works and the next annual assessment.</p>
                  </div>
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

          {/* Right HUGE Typography */}
          <div className="flex items-center justify-center relative h-full min-h-[500px]">
             {/* decorative rings */}
             <div className="absolute w-[110%] aspect-square rounded-full border-[2px] border-gray-200 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
             <div className="absolute w-[80%] aspect-square rounded-full border-[2px] border-gray-200 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
             
             <div className="text-center bg-white p-12 rounded-full shadow-[0_30px_60px_rgba(0,0,0,0.08)] relative z-10 w-[70%] aspect-square flex flex-col items-center justify-center border border-gray-50 transform hover:scale-105 transition-transform duration-700">
               <span className="text-[120px] lg:text-[180px] font-black leading-[0.8] text-[#111111] tracking-tighter -ml-4">12</span>
               <span className="text-xl lg:text-3xl font-black text-[#fb5614] tracking-[0.3em] uppercase mt-4 ml-3">MONTHS.</span>
             </div>
          </div>
        </RevealOnView>
      </section>

      {/* Section 09 / SUPPLEMENTARY FIRE SAFETY STATEMENTS */}
      <section className="bg-white py-16 lg:py-24 relative overflow-hidden border-y border-gray-100">
        
        <RevealOnView className="container-inner relative z-10 grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-center">
           <div>
              <div className="w-16 h-16 rounded-2xl bg-[#fb5614]/10 flex items-center justify-center mb-8 shadow-sm">
                 <AlertCircle className="text-[#fb5614]" size={32} />
              </div>
              <span className="text-[#fb5614] text-xs font-bold tracking-[0.15em] uppercase mb-4 block">
                09 / SUPPLEMENTARY FIRE SAFETY STATEMENTS
              </span>
              <h2 className="text-[clamp(2.5rem,4vw,3.5rem)] font-black mb-6 tracking-tight leading-[1.05] text-[#111111]">
                Some measures <br />
                <span className="bg-gradient-to-r from-[#ff5614] to-[#ffad05] bg-clip-text text-transparent">can't wait 12 months.</span>
              </h2>
              <p className="text-lg text-[#4a4a46] max-w-xl leading-relaxed font-medium">
                If your Fire Safety Schedule identifies a <strong className="text-[#111111] font-black bg-gray-100 px-2 py-0.5 rounded border border-gray-200">critical fire safety measure</strong>, it may require a supplementary fire safety statement at intervals shorter than the annual AFSS cycle.
              </p>
           </div>

           <div className="bg-[#faf9f7] rounded-3xl p-10 lg:p-14 shadow-lg border border-gray-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#fb5614]/10 blur-[40px] rounded-full pointer-events-none" />
              <p className="font-black text-[#111111] uppercase tracking-widest mb-8 text-sm">We can help establish:</p>
              <ul className="space-y-6 mb-12 relative z-10">
                 <li className="flex items-start gap-4 border-b border-gray-200 pb-5">
                    <CheckCircle2 className="text-[#fb5614] shrink-0 mt-0.5" size={24} />
                    <span className="text-[#4a4a46] font-medium text-base">Which critical measures apply</span>
                 </li>
                 <li className="flex items-start gap-4 border-b border-gray-200 pb-5">
                    <CheckCircle2 className="text-[#fb5614] shrink-0 mt-0.5" size={24} />
                    <span className="text-[#4a4a46] font-medium text-base">The statement interval shown on the Schedule</span>
                 </li>
                 <li className="flex items-start gap-4 border-b border-gray-200 pb-5">
                    <CheckCircle2 className="text-[#fb5614] shrink-0 mt-0.5" size={24} />
                    <span className="text-[#4a4a46] font-medium text-base">The required assessment</span>
                 </li>
                 <li className="flex items-start gap-4">
                    <CheckCircle2 className="text-[#fb5614] shrink-0 mt-0.5" size={24} />
                    <span className="text-[#4a4a46] font-medium text-base">The supplementary statement process</span>
                 </li>
              </ul>
              
              <Link href="/contact-us" className="relative z-10 font-bold underline hover:no-underline underline-offset-4 decoration-2 decoration-[#fb5614] text-[#111111] uppercase text-sm tracking-widest block transition-all hover:text-[#fb5614]">
                ASK ABOUT SUPPLEMENTARY STATEMENTS &rarr;
              </Link>
           </div>
        </RevealOnView>
      </section>

      {/* Section 10 / AS 1851-2012 SUPPORT */}
      <section className="container-inner py-16 lg:py-24 overflow-visible">
        <RevealOnView className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Column: Text Content */}
          <div className="flex flex-col order-2 lg:order-1">
            <span className="text-[#fb5614] text-xs font-bold tracking-[0.15em] uppercase mb-4">
              10 / AS 1851-2012 SUPPORT
            </span>
            <h2 className="text-[clamp(2.5rem,4vw,3.5rem)] font-black mb-6 tracking-tight leading-[1.05]">
              <span className="text-[#111111] block md:whitespace-nowrap">Maintenance and AFSS</span>
              <span className="bg-gradient-to-r from-[#ff5614] to-[#ffad05] bg-clip-text text-transparent block md:whitespace-nowrap">
                work together.
              </span>
            </h2>
            
            <p className="text-lg text-[#4a4a46] mb-10 max-w-xl leading-relaxed">
              From 13 February 2026, applicable essential fire safety measures in NSW must be routinely serviced under AS 1851-2012 where the Standard addresses that maintenance activity.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10 max-w-2xl">
               <div className="flex flex-col gap-3 items-start">
                  <div className="shrink-0 text-[#fb5614]">
                     <ClipboardCheck size={32} strokeWidth={1.5} />
                  </div>
                  <div>
                     <h4 className="text-[15px] font-bold text-[#111111] mb-1">Routine Servicing</h4>
                     <p className="text-[14px] text-[#4a4a46] leading-relaxed">Inspection, testing and preventive maintenance for applicable systems.</p>
                  </div>
               </div>
               
               <div className="flex flex-col gap-3 items-start">
                  <div className="shrink-0 text-[#fb5614]">
                     <FileText size={32} strokeWidth={1.5} />
                  </div>
                  <div>
                     <h4 className="text-[15px] font-bold text-[#111111] mb-1">Maintenance Records</h4>
                     <p className="text-[14px] text-[#4a4a46] leading-relaxed">Keep the required servicing records and physical logbook information organised.</p>
                  </div>
               </div>

               <div className="flex flex-col gap-3 items-start">
                  <div className="shrink-0 text-[#fb5614]">
                     <Search size={32} strokeWidth={1.5} />
                  </div>
                  <div>
                     <h4 className="text-[15px] font-bold text-[#111111] mb-1">Defect Tracking</h4>
                     <p className="text-[14px] text-[#4a4a46] leading-relaxed">Maintain visibility over defects identified during routine servicing.</p>
                  </div>
               </div>

               <div className="flex flex-col gap-3 items-start">
                  <div className="shrink-0 text-[#fb5614]">
                     <Users size={32} strokeWidth={1.5} />
                  </div>
                  <div>
                     <h4 className="text-[15px] font-bold text-[#111111] mb-1">AFSS Coordination</h4>
                     <p className="text-[14px] text-[#4a4a46] leading-relaxed">Relevant maintenance information can support the accredited practitioner when completing the separate AFSS assessment.</p>
                  </div>
               </div>
            </div>

            <p className="text-lg font-bold text-[#111111] mb-8 leading-snug">
               AS 1851-2012 and your AFSS are related,<br className="hidden sm:block" />
               but they are different obligations.
            </p>

            <div className="flex flex-wrap items-center gap-6 mt-6">
              <Link href="/book-the-boss" className="btn animate-pump bg-gradient-to-r from-[#ff5614] to-[#ffad05] !text-white px-7 py-3.5 uppercase font-bold tracking-wider text-sm rounded-full border-none shadow-sm hover:scale-105 transition-transform inline-flex items-center justify-center">
                Book the Boss
              </Link>
              <Link href="/free-quote" className="font-bold underline hover:no-underline underline-offset-4 decoration-2 decoration-gray-300 text-[#111111]">
                Or request a quote
              </Link>
            </div>
          </div>

          {/* Right Column: Image and Cards */}
          <div className="flex flex-col order-1 lg:order-2 gap-8 lg:pl-10 relative">
            {/* Top Image Box */}
            <div className="relative pl-6 sm:pl-12">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                 <Image src="/diesel hydrant.jpg" alt="AS 1851 Maintenance" fill className="object-cover" />
              </div>
              
              {/* Floating Date Card */}
              <div className="absolute top-1/2 -translate-y-1/2 left-0 bg-white rounded-2xl p-6 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] w-40 sm:w-48 border border-gray-100 flex flex-col text-center">
                 <span className="text-[#fb5614] text-5xl sm:text-6xl font-black leading-none mb-1">13</span>
                 <span className="text-[#111111] text-2xl sm:text-3xl font-black leading-tight mb-4">FEB<br/>2026</span>
                 <p className="text-[11px] sm:text-xs text-[#4a4a46] font-medium leading-relaxed">Routine servicing required<br/>from this date.</p>
              </div>
            </div>

            {/* Bottom Connected Cards */}
            <div className="flex flex-col sm:flex-row items-stretch gap-4 sm:gap-0 mt-4 sm:mt-6 px-0 sm:px-4">
               {/* Left Card */}
               <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 flex-1 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full border-[1.5px] border-[#fb5614] flex items-center justify-center text-[#fb5614] mb-4">
                     <Settings size={28} strokeWidth={1.5} />
                  </div>
                  <h4 className="font-bold text-[#111111] mb-1 text-sm sm:text-base">Routine Servicing</h4>
                  <span className="text-[#fb5614] font-bold text-[13px] sm:text-sm mb-3">AS 1851-2012</span>
                  <p className="text-[12px] sm:text-[13px] text-[#4a4a46] leading-relaxed max-w-[140px]">Ongoing servicing, testing and maintenance.</p>
               </div>

               {/* Connector */}
               <div className="hidden sm:flex items-center w-8 md:w-12 shrink-0 justify-center">
                  <div className="w-[5px] h-[5px] rounded-full bg-[#fb5614]"></div>
                  <div className="h-[1.5px] bg-[#fb5614] flex-1"></div>
                  <div className="w-[5px] h-[5px] rounded-full bg-[#fb5614]"></div>
               </div>

               {/* Right Card */}
               <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 flex-1 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full border-[1.5px] border-[#fb5614] flex items-center justify-center text-[#fb5614] mb-4">
                     <User size={28} strokeWidth={1.5} />
                  </div>
                  <h4 className="font-bold text-[#111111] mb-4 text-sm sm:text-base">AFSS Assessment</h4>
                  <div className="w-8 h-[1.5px] bg-[#fb5614]/40 mb-4"></div>
                  <p className="text-[12px] sm:text-[13px] text-[#4a4a46] leading-relaxed max-w-[140px]">Separate annual assessment by an accredited practitioner.</p>
               </div>
            </div>
          </div>

        </RevealOnView>
      </section>

      {/* Global CTA and Contact Section */}
      <ContactCTA />
    </>
  );
}
