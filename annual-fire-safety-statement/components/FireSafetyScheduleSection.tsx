"use client";

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { ShieldCheck, Calendar, Clock, Bell, ArrowUpRight, Target, CalendarCheck, Route, ArrowRight, Map, Award, Handshake, Check } from 'lucide-react';
import Link from 'next/link';
import RevealOnView from './RevealOnView';
import FreeSiteVisitButton from '@/components/free-site-visit/FreeSiteVisitButton';
import { openFreeSiteVisit } from '@/lib/free-site-visit/FreeSiteVisitStore';

export default function FireSafetyScheduleSection() {
  const items = [
    "Type of Statement",
    "Building / Part of Building",
    "Owner Name & Address",
    "Fire Safety Measures",
    "Minimum Standard of Performance",
    "Date(s) Assessed",
    "Accredited Practitioner / CFSP Reference",
    "Exit Systems Compliance",
    "Owner / Issuer Details",
    "Annual Statement Requirement"
  ];

  const svgRef = useRef<SVGSVGElement>(null);
  const originRef = useRef<HTMLDivElement>(null);
  const destRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [lines, setLines] = useState<{x1: number, y1: number, x2: number, y2: number}[]>([]);
  const [dueDateInput, setDueDateInput] = useState('');
  const [submittedDate, setSubmittedDate] = useState<Date | null>(null);

  useEffect(() => {
    const updateLines = () => {
      if (!svgRef.current || !originRef.current) return;
      const svgRect = svgRef.current.getBoundingClientRect();
      const originRect = originRef.current.getBoundingClientRect();
      
      const ox = originRect.left + originRect.width / 2 - svgRect.left;
      const oy = originRect.top + originRect.height / 2 - svgRect.top;
      
      const newLines = destRefs.current.map((dest) => {
        if (!dest) return null;
        const destRect = dest.getBoundingClientRect();
        return {
          x1: ox,
          y1: oy,
          x2: destRect.left + destRect.width / 2 - svgRect.left,
          y2: destRect.top + destRect.height / 2 - svgRect.top,
        };
      }).filter(Boolean) as {x1: number, y1: number, x2: number, y2: number}[];
      
      setLines(newLines);
    };

    // Ensure it updates on load and if any fonts/images change sizes
    updateLines();
    window.addEventListener('resize', updateLines);
    
    // Use ResizeObserver for more robust tracking of the container
    const container = originRef.current?.closest('section');
    let observer: ResizeObserver | null = null;
    if (container && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(updateLines);
      observer.observe(container);
    }
    
    // Small timeouts to catch any delayed renders like custom fonts
    const timeout1 = setTimeout(updateLines, 100);
    const timeout2 = setTimeout(updateLines, 500);

    return () => {
      window.removeEventListener('resize', updateLines);
      if (observer) observer.disconnect();
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, []);

  return (
    <>
    <section className="bg-white py-8 lg:py-12 w-full overflow-hidden relative">
      <div className="container-inner max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* SVG Overlay covering the entire container for perfect line connections */}
        <svg ref={svgRef} className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none z-0">
          {lines.map((line, i) => {
            // Calculate a dynamic control point distance based on horizontal span
            const cpDist = Math.max(50, (line.x2 - line.x1) * 0.4);
            return (
              <path 
                key={i}
                d={`M ${line.x1} ${line.y1} C ${line.x1 + cpDist} ${line.y1}, ${line.x2 - cpDist} ${line.y2}, ${line.x2} ${line.y2}`} 
                stroke="#fb5614" 
                strokeWidth="1.5" 
                strokeDasharray="4 4" 
                fill="none" 
                className="opacity-60"
              />
            );
          })}
        </svg>

        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:gap-8 mt-2 relative z-10">
          
          {/* Left Column */}
          <div className="w-full lg:w-[45%] flex flex-col relative z-10 lg:py-4">
            
            {/* Eyebrow */}
            <div>
              <p className="font-bold tracking-widest uppercase mb-3 text-xs md:text-sm flex items-center gap-3">
                <span className="text-[#fb5614]">06 / YOUR FIRE SAFETY STATEMENT</span>
              </p>
            </div>

            <div>
              <h2 className="text-[clamp(2.5rem,4vw,3.5rem)] font-black tracking-tight leading-[1.05] text-[#111111] mb-4">
                <span className="whitespace-nowrap">What's in your</span><br/>
                <span className="bg-gradient-to-r from-[#fb5614] to-[#ffad05] bg-clip-text text-transparent whitespace-nowrap">Fire Safety Statement?</span>
              </h2>
              
              <p className="text-gray-700 leading-relaxed font-medium mb-2 max-w-md lg:max-w-[90%]">
                An annual fire safety statement records the building, owner and assessment information used to confirm annual fire safety compliance.
              </p>
            </div>
            
            {/* Document Image */}
            <div className="relative w-full max-w-[380px] lg:mr-auto mt-0 flex flex-col justify-end">
              <div className="relative w-full aspect-[1/1.3] flex items-center justify-center">
                <Image 
                  src="/sampleafss-nobg.png" 
                  alt="Fire Safety Statement" 
                  fill 
                  className="object-contain drop-shadow-2xl rounded-sm" 
                  sizes="(max-width: 1024px) 100vw, 380px"
                  onLoad={() => {
                    // Dispatch a resize event when image loads to trigger line update
                    window.dispatchEvent(new Event('resize'));
                  }}
                />
              </div>
              
              {/* Origin point for SVG lines (Attached to the document) */}
              <div ref={originRef} className="hidden lg:flex absolute top-1/2 -right-[12px] -translate-y-1/2 w-[20px] h-[20px] bg-white border border-gray-100 items-center justify-center rounded-full z-20">
                <div className="w-2.5 h-2.5 bg-[#fb5614] rounded-full shadow-[0_0_10px_rgba(251,86,20,0.5)]"></div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-full lg:w-[45%] flex flex-col justify-between h-auto lg:h-[700px] relative z-10 mt-12 lg:mt-auto gap-3 lg:gap-0">
            {items.map((item, i) => (
              <div key={i} className="w-full h-full flex items-center">
                <div className="relative w-full border border-gray-200 rounded-full py-3 lg:py-0 h-14 xl:h-16 px-6 md:px-8 flex items-center bg-white shadow-sm hover:shadow-md transition-shadow">
                  {/* Destination point for SVG line */}
                  <div 
                    ref={(el) => { destRefs.current[i] = el; }} 
                    className="hidden lg:block absolute top-1/2 -left-[4px] -translate-y-1/2 w-[8px] h-[8px] bg-[#fb5614] rounded-full z-20"
                  ></div>
                  
                  <span className="text-[#fb5614] font-bold text-lg w-[24px] whitespace-nowrap flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                  <div className="w-[1px] h-6 bg-gray-200 mx-4 md:mx-6 flex-shrink-0"></div>
                  <span className="text-[#111111] font-semibold text-[0.95rem]">{item}</span>
                </div>
              </div>
            ))}
          </div>
          
        </div>
        
      </div>
    </section>

      {/* Section: 12 months — the clock */}
      <section className="container-inner py-8 lg:py-12 overflow-hidden bg-white">
        <RevealOnView className="relative z-10 grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-stretch">
          {/* Left Column: Content */}
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[#fb5614] text-xs md:text-sm font-bold tracking-widest uppercase">
                07 / YOUR AFSS DUE DATE
              </span>
            </div>
            <h2 className="text-[clamp(2.5rem,4vw,3.5rem)] font-black mb-6 tracking-tight leading-[1.05] text-[#111111]">
              12 months. Don&apos;t let your <span className="text-[#fb5614]">AFSS</span> <br />
              <span className="bg-gradient-to-r from-[#ff5614] to-[#ffad05] bg-clip-text text-transparent">
                date sneak up.
              </span>
            </h2>
            <p className="text-lg text-[#4a4a46] mb-10 max-w-xl leading-relaxed">
              Annual Fire Safety Statements must be issued each year. Knowing your due date gives you time to organise the required assessments and address anything that needs attention before your statement is due.
            </p>
            
            <div className="flex flex-wrap items-center gap-6">
              <FreeSiteVisitButton 
                source="floating"
                pulse 
                label="GET AN INSTANT QUOTE &rarr;"
                className="btn animate-pump bg-gradient-to-r from-[#ff5614] to-[#ffad05] !text-white px-7 py-3.5 uppercase font-bold tracking-wider text-sm rounded-full border-none shadow-sm hover:scale-105 transition-transform"
              />
              <button 
                onClick={() => openFreeSiteVisit({ source: "floating" })}
                className="font-bold underline hover:no-underline underline-offset-4 decoration-2 decoration-gray-300 text-[#111111] uppercase"
              >
                I&apos;M NOT SURE OF MY DUE DATE &rarr;
              </button>
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
                  const x1 = (200 + r1 * Math.sin(angle)).toFixed(2);
                  const y1 = (200 - r1 * Math.cos(angle)).toFixed(2);
                  const x2 = (200 + r2 * Math.sin(angle)).toFixed(2);
                  const y2 = (200 - r2 * Math.cos(angle)).toFixed(2);
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={isHour ? '#facdb9' : '#fcebe6'} strokeWidth={isHour ? 3 : 2} />
                })}
              </g>
              {/* Orange arc from 12 to 2 (approx 60 degrees) */}
              <path d="M 200 5 A 195 195 0 0 1 368 100" fill="none" stroke="#fb5614" strokeWidth="6" strokeLinecap="round" />
            </svg>



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
                  <h4 className="text-xs font-black tracking-widest text-[#111111] uppercase mb-0.5">Your Next AFSS</h4>
                  <p className="text-xs text-gray-500">Annual Fire Safety Statement</p>
                </div>
              </div>
              
              <div className="w-full h-px bg-gray-100 mb-6"></div>
              
              {!submittedDate ? (
                <div className="mb-2">
                  <h5 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">WHEN IS YOUR AFSS DUE?</h5>
                  <div className="flex flex-col gap-3">
                    <input 
                      type="date" 
                      value={dueDateInput} 
                      onChange={(e) => setDueDateInput(e.target.value)}
                      className="border border-gray-200 rounded-lg px-4 py-2 text-sm text-[#111111] font-semibold w-full focus:outline-none focus:border-[#fb5614] bg-white"
                    />
                    <button 
                      onClick={() => dueDateInput && setSubmittedDate(new Date(dueDateInput))}
                      className="w-full font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 mb-1"
                      style={{ backgroundColor: '#111111', color: '#ffffff', padding: '18px 0' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fb5614'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#111111'}
                    >
                      CHECK MY DATE &rarr;
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Due Date */}
                  <div className="mb-6 relative group">
                    <h5 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">YOUR NEXT AFSS</h5>
                    <p className="text-3xl sm:text-4xl font-black text-[#fb5614] tracking-tight">
                      {submittedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}
                    </p>
                    <button 
                      onClick={() => {
                        setSubmittedDate(null);
                        setDueDateInput('');
                      }} 
                      className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-gray-400 font-bold uppercase hover:text-[#fb5614] underline underline-offset-2"
                    >
                      Change
                    </button>
                  </div>
                  
                  {/* Countdown Box */}
                  <div className="bg-[#fff8f5] rounded-lg p-3 sm:p-4 flex items-center gap-3 mb-6">
                    <Clock className="text-[#fb5614]" size={18} strokeWidth={2} />
                    {(() => {
                      const diffTime = submittedDate.getTime() - new Date().getTime();
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      if (diffDays < 0) {
                        return <p className="text-sm text-[#111111] font-bold">AFSS DATE HAS PASSED</p>;
                      }
                      return <p className="text-sm text-[#111111] font-medium">Due in <span className="font-bold text-[#fb5614]">{diffDays}</span> days</p>;
                    })()}
                  </div>
                  
                  <p className="text-xs text-[#111111] mb-6 font-medium">Plan ahead and start your AFSS early.</p>
                  
                  {/* Reminder Box */}
                  <div className="bg-[#faf9f7] rounded-lg p-3 sm:p-4 flex items-center gap-3 border border-gray-100">
                    <Bell className="text-gray-500 shrink-0" size={18} strokeWidth={2} />
                    <p className="text-xs text-[#111111] font-medium">Use your due date when starting your quote.</p>
                  </div>
                </>
              )}
            </div>
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

        <div className="container-inner pt-8 pb-0 lg:pt-12 lg:pb-0 relative z-10">
          <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-8 relative">
            
            {/* Left Content */}
            <div className="w-full lg:w-1/2 flex flex-col items-start relative z-30 pb-8 lg:pb-10">
              <p className="text-[#fb5614] uppercase tracking-[0.15em] font-bold text-[13px] mb-4">
                08 / ACCREDITED PRACTITIONERS
              </p>
              
              <h2 className="text-[clamp(2.5rem,4vw,3.5rem)] font-black mb-6 tracking-tight leading-[1.05] text-[#111111]">
                The right scope. <br />
                <span className="bg-gradient-to-r from-[#ff5614] to-[#ffad05] bg-clip-text text-transparent">
                  The right assessment.
                </span>
              </h2>
              
              <p className="text-[#111111] text-sm md:text-base max-w-[440px] mb-10 leading-relaxed font-medium">
                Your Fire Safety Schedule identifies the fire safety measures and minimum performance standards that apply to your building. For an AFSS, the applicable measures must be assessed by appropriately accredited practitioners where an approved accreditation scheme covers the relevant function.
              </p>
              
              <div className="grid grid-cols-3 gap-4 md:gap-8 mb-10 w-full max-w-[480px]">
                <div className="flex flex-col items-start gap-3">
                  <div className="text-[#fb5614]">
                    <Target size={32} strokeWidth={1.5} />
                  </div>
                  <span className="text-[13px] font-bold text-[#111111] leading-[1.3] uppercase">Relevant<br />Assessment Scope</span>
                  <span className="text-[11px] text-gray-500 mt-0 leading-snug">Matched to the measure being assessed.</span>
                </div>
                
                <div className="flex flex-col items-start gap-3">
                  <div className="text-[#fb5614]">
                    <CalendarCheck size={32} strokeWidth={1.5} />
                  </div>
                  <span className="text-[13px] font-bold text-[#111111] leading-[1.3] uppercase">Schedule-led<br />Assessment</span>
                  <span className="text-[11px] text-gray-500 mt-0 leading-snug">Your Fire Safety Schedule defines what applies.</span>
                </div>
                
                <div className="flex flex-col items-start gap-3">
                  <div className="text-[#fb5614]">
                    <Route size={32} strokeWidth={1.5} />
                  </div>
                  <span className="text-[13px] font-bold text-[#111111] leading-[1.3] uppercase">Current<br />Accreditation</span>
                  <span className="text-[11px] text-gray-500 mt-0 leading-snug">Current accreditation should be verified.</span>
                </div>
              </div>
              
              <Link href="https://connect.fpaa.com.au/FireSafetyAssessors" target="_blank" rel="noopener noreferrer" className="btn bg-gradient-to-r from-[#ff5614] to-[#ffad05] !text-white px-7 py-3.5 uppercase font-bold tracking-wider text-sm rounded-full border-none shadow-sm hover:scale-105 transition-transform flex items-center gap-2">
                CHECK PRACTITIONER ACCREDITATION <ArrowRight size={16} strokeWidth={2} />
              </Link>
            </div>
            
            {/* Right Image & HTML Panel */}
            <div className="w-full lg:w-[55%] relative lg:absolute lg:bottom-0 lg:right-0 flex justify-center lg:justify-end mt-8 lg:mt-0 z-20 pointer-events-none">
              <Image 
                src="/08IMAGE.png" 
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
                <div className="flex flex-col">
                  <span className="text-[11px] lg:text-xs font-bold text-[#111111] leading-[1.3] uppercase tracking-wider text-left">NSW AFSS<br/>Requirements</span>
                  <span className="text-[9px] lg:text-[10px] text-gray-500 mt-0.5">Aligned with NSW AFSS requirements.</span>
                </div>
              </div>
              <div className="flex flex-row items-center gap-4 flex-1 justify-center md:border-r border-gray-200 px-4">
                <ShieldCheck className="text-[#fb5614] shrink-0" size={36} strokeWidth={1.5} />
                <div className="flex flex-col">
                  <span className="text-[11px] lg:text-xs font-bold text-[#111111] leading-[1.3] uppercase tracking-wider text-left">Accredited<br/>Practitioners</span>
                  <span className="text-[9px] lg:text-[10px] text-gray-500 mt-0.5">For relevant AFSS assessment functions.</span>
                </div>
              </div>
              <div className="flex flex-row items-center gap-4 flex-1 justify-center md:border-r border-gray-200 px-4">
                <Target className="text-[#fb5614] shrink-0" size={36} strokeWidth={1.5} />
                <div className="flex flex-col">
                  <span className="text-[11px] lg:text-xs font-bold text-[#111111] leading-[1.3] uppercase tracking-wider text-left">Correct Assessment<br/>Scope</span>
                  <span className="text-[9px] lg:text-[10px] text-gray-500 mt-0.5">Matched to applicable measures.</span>
                </div>
              </div>
              <div className="flex flex-row items-center gap-4 flex-1 justify-center px-4">
                <Handshake className="text-[#fb5614] shrink-0" size={36} strokeWidth={1.5} />
                <div className="flex flex-col">
                  <span className="text-[11px] lg:text-xs font-bold text-[#111111] leading-[1.3] uppercase tracking-wider text-left">Verify Current<br/>Accreditation</span>
                  <span className="text-[9px] lg:text-[10px] text-gray-500 mt-0.5">Check current practitioner status.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 09: AS 1851-2012 */}
      <section className="container-inner py-8 lg:py-12 bg-white">
        <RevealOnView className="grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-center">
          {/* Left Column: Image Mockup with Cards */}
          <div className="relative w-full aspect-[4/3] md:aspect-[1.1/1] bg-white rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-gray-200 overflow-hidden flex flex-col transform transition-transform hover:-translate-y-1 duration-500">
             
             <Image
                src="/09image.png"
                alt="Fire Safety Maintenance"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
             />

             {/* 13 FEB 2026 Card Overlay */}
             <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-100 p-5 lg:p-6 flex flex-col items-start max-w-[240px] transform transition-transform hover:scale-[1.02]">
                <CalendarCheck className="text-[#111111] mb-3" size={28} strokeWidth={1.5} />
                <h3 className="text-2xl font-black text-[#fb5614] mb-2 tracking-tight">13 FEB 2026</h3>
                <div className="w-full h-px bg-gray-200 mb-2"></div>
                <p className="text-[11px] font-semibold text-[#111111] leading-relaxed">
                  Mandatory maintenance requirements commenced in NSW.
                </p>
             </div>
          </div>

          {/* Right Column: Text */}
          <div className="pl-0 lg:pl-10">
            <h3 className="text-[#fb5614] text-xs font-bold tracking-[0.15em] uppercase mb-4">
              09 / AS 1851-2012
            </h3>
            <h2 className="text-[clamp(2rem,2.5vw,3rem)] xl:text-[clamp(2.2rem,3vw,3.5rem)] font-black mb-6 tracking-tight leading-[1.05] text-[#111111]">
              <span className="block whitespace-nowrap">Fire safety maintenance</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5614] to-[#ffad05] block whitespace-nowrap">
                changed in NSW.
              </span>
            </h2>
            <p className="text-lg text-[#4a4a46] mb-8">
              From 13 February 2026, applicable NSW buildings must maintain essential fire safety measures in accordance with AS 1851-2012 where the Standard applies.
            </p>
            
            <ul className="flex flex-col gap-4 mb-8">
              <li className="flex items-center gap-4">
                <Check className="text-[#fb5614] shrink-0" size={24} strokeWidth={2.5} />
                <span className="text-base font-semibold text-[#111111]">INSPECT, TEST & SERVICE</span>
              </li>
              <li className="flex items-center gap-4">
                <Check className="text-[#fb5614] shrink-0" size={24} strokeWidth={2.5} />
                <span className="text-base font-semibold text-[#111111]">KEEP REQUIRED MAINTENANCE RECORDS</span>
              </li>
              <li className="flex items-center gap-4">
                <Check className="text-[#fb5614] shrink-0" size={24} strokeWidth={2.5} />
                <span className="text-base font-semibold text-[#111111]">MAINTAIN APPLICABLE ESSENTIAL FIRE SAFETY MEASURES</span>
              </li>
            </ul>

            <div className="mb-8">
              <p className="text-sm font-semibold text-[#111111] mb-1">
                AS 1851-2012 and your AFSS are related, but they are different requirements.
              </p>
              <p className="text-sm text-[#4a4a46]">
                Routine maintenance happens throughout the year. The AFSS is a separate annual assessment and statement process.
              </p>
            </div>

            <Link href="/new-legislation" className="inline-block border-2 border-[#fb5614] text-[#111111] hover:bg-[#fb5614] hover:text-white px-8 py-3.5 uppercase font-bold tracking-wider text-sm rounded-full transition-colors text-center w-full sm:w-auto">
              UNDERSTAND AS 1851-2012 &rarr;
            </Link>
          </div>
        </RevealOnView>
      </section>
    </>
  );
}
