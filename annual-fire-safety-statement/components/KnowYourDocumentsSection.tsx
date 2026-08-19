"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, ClipboardList, ShieldCheck, HelpCircle, FileUp, User, BookOpen, Download } from 'lucide-react';
import RevealOnView from './RevealOnView';

export default function KnowYourDocumentsSection() {
  return (
    <section className="bg-white pt-16 lg:pt-24 pb-4 lg:pb-8 w-full overflow-hidden">
      <div className="container-inner max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 lg:mb-24 gap-8">
          <div className="flex-1">
            <RevealOnView>
              <p className="font-bold tracking-widest uppercase mb-4 text-xs md:text-sm flex items-center gap-3">
                <span className="w-2 h-2 bg-[#fb5614]" aria-hidden="true" />
                <span className="text-[#fb5614]">03 / KNOW YOUR DOCUMENTS</span>
              </p>
              
              <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-black tracking-tight leading-[1.05] text-[#111111]">
                Three documents.<br/>
                <span className="bg-gradient-to-r from-[#fb5614] to-[#ffad05] bg-clip-text text-transparent">Three different jobs.</span>
              </h2>
            </RevealOnView>
          </div>
          <div className="flex-1 lg:max-w-md">
            <RevealOnView delay={100}>
              <p className="text-lg text-gray-700 font-medium leading-relaxed">
                It's easy to mix them up. Here's how each document works—and when you need it.
              </p>
            </RevealOnView>
          </div>
        </div>

        {/* 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-0 mb-4 lg:mb-8 relative">
          <DocumentCard 
            delay={100}
            index={0}
            number="01"
            icon={<Calendar size={28} strokeWidth={2} />}
            image="/sampleafss-nobg.png"
            title="ANNUAL FIRE SAFETY STATEMENT (AFSS)"
            subtitle="The yearly statement."
            desc="Confirms the essential fire safety measures in your building have been assessed, inspected and verified."
            href="#"
          />
          <DocumentCard 
            delay={200}
            index={1}
            number="02"
            icon={<ClipboardList size={28} strokeWidth={2} />}
            image="/sampleafss-nobg.png"
            title="FIRE SAFETY SCHEDULE (FSS)"
            subtitle="The requirements for your building."
            desc="Lists the fire safety measures that apply to your building and the minimum performance standards they must meet."
            href="#"
          />
          <DocumentCard 
            delay={300}
            index={2}
            number="03"
            icon={<ShieldCheck size={28} strokeWidth={2} />}
            image="/sampleafss-nobg.png"
            title="FIRE SAFETY CERTIFICATE (FSC)"
            subtitle="For new or altered building work."
            desc="Confirms the relevant fire safety measures have been installed and checked in accordance with the schedule."
            href="#"
          />
        </div>


      </div>
    </section>
  );
}

function DocumentCard({ delay, index, number, icon, image, title, subtitle, desc, href }: any) {
  return (
    <RevealOnView delay={delay} className={`flex flex-col relative group h-full lg:px-6 xl:px-10 ${index > 0 ? 'lg:border-l lg:border-gray-100' : ''}`}>
      {/* Visual Area */}
      <div className="relative w-full aspect-[4/3] flex items-center justify-end mb-8 overflow-visible mt-2 pr-2 md:pr-4">
        {/* Giant Number on the left */}
        <div className="absolute left-0 top-[20%] text-[80px] md:text-[90px] xl:text-[110px] font-medium text-[#fff0e6] leading-none z-0 tracking-tighter select-none">
          {number}
        </div>
        
        {/* Soft Peach Circle */}
        <div className="absolute right-[5%] w-[60%] h-[75%] rounded-full bg-[#fff5ef] z-0 transform group-hover:scale-105 transition-transform duration-500"></div>
        
        {/* Document Image */}
        <div className="relative w-[65%] h-[115%] z-10 transform rotate-3 group-hover:rotate-0 transition-transform duration-500 shadow-xl bg-white border border-gray-100 p-1 mr-[2%] mt-4">
          {/* Top Floating Icon directly on the document edge */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[48px] h-[48px] xl:w-[56px] xl:h-[56px] rounded-full bg-[#ff5614] text-white flex items-center justify-center shadow-[0_4px_15px_rgba(255,86,20,0.3)]">
            {icon}
          </div>
          <div className="relative w-full h-full border border-gray-100 bg-white">
             <Image 
               src={image} 
               alt={title} 
               fill 
               className="object-cover" 
               sizes="(max-width: 768px) 100vw, 33vw"
             />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-col flex-1 mt-6 relative z-20">
        <h3 className="text-[1.1rem] md:text-[1.15rem] font-bold text-[#111111] mb-2 leading-tight uppercase">
          {title}
        </h3>
        <p className="font-bold text-[#ff5614] mb-4 text-[0.95rem]">
          {subtitle}
        </p>
        <p className="text-gray-600 font-medium mb-8 flex-1 leading-relaxed text-[0.9rem]">
          {desc}
        </p>
        
        <Link href={href} className="flex items-center gap-3 text-[#ff5614] font-bold tracking-wide uppercase text-[0.8rem] hover:opacity-80 transition-opacity mt-auto">
          <Download size={18} strokeWidth={2.5} />
          VIEW OFFICIAL TEMPLATE →
        </Link>
      </div>
    </RevealOnView>
  );
}

