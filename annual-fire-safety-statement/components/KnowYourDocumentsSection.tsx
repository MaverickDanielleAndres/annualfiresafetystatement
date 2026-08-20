"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, ClipboardList, ShieldCheck, Download } from 'lucide-react';
import RevealOnView from './RevealOnView';

export default function KnowYourDocumentsSection() {
  return (
    <section className="bg-white pt-6 pb-10 lg:pt-8 lg:pb-16 w-full overflow-hidden">
      <div className="container-inner max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 lg:mb-20 gap-8">
          <div className="flex-1">
            <RevealOnView>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-2 h-2 bg-[#b0141f]" aria-hidden="true" />
                <span className="text-xs font-bold tracking-[0.18em] uppercase text-[#1c4d9c]">
                  03 / Know Your Documents
                </span>
              </div>

              <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-extrabold tracking-tight leading-[1.05] text-[#0b1d36]">
                Three documents.
                <br />
                <span
                  style={{
                    background: "linear-gradient(90deg, #0b1d36 0%, #1c4d9c 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    color: "transparent",
                  }}
                >
                  Three different jobs.
                </span>
              </h2>
            </RevealOnView>
          </div>
          <div className="flex-1 lg:max-w-md">
            <RevealOnView delay={100}>
              <p className="text-lg text-[#3a4a63] font-medium leading-relaxed">
                It&apos;s easy to mix them up. Here&apos;s how each document works, and when you need it.
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
            icon={<Calendar size={28} strokeWidth={1.5} />}
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
            icon={<ClipboardList size={28} strokeWidth={1.5} />}
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
            icon={<ShieldCheck size={28} strokeWidth={1.5} />}
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
    <RevealOnView delay={delay} className={`flex flex-col relative group h-full lg:px-6 xl:px-10 ${index > 0 ? 'lg:border-l lg:border-[#e3e7ee]' : ''}`}>
      {/* Visual Area */}
      <div className="relative w-full aspect-[4/3] flex items-center justify-end mb-8 overflow-visible mt-2 pr-2 md:pr-4">
        {/* Giant Number on the left */}
        <div className="absolute left-0 top-[20%] text-[80px] md:text-[90px] xl:text-[110px] font-medium text-[#e7eef9] leading-none z-0 tracking-tighter select-none">
          {number}
        </div>

        {/* Soft Blue Circle */}
        <div className="absolute right-[5%] w-[60%] h-[75%] rounded-full bg-[#f5f7fa] z-0 transform group-hover:scale-105 transition-transform duration-500"></div>

        {/* Document Image */}
        <div className="relative w-[65%] h-[115%] z-10 transform rotate-3 group-hover:rotate-0 transition-transform duration-500 shadow-[0_18px_38px_rgba(11,29,54,0.16)] bg-white border border-[#e3e7ee] p-1 mr-[2%] mt-4">
          {/* Top Floating Icon directly on the document edge */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[48px] h-[48px] xl:w-[56px] xl:h-[56px] rounded-full bg-[#0b1d36] text-white flex items-center justify-center shadow-[0_4px_15px_rgba(11,29,54,0.25)]">
            {icon}
          </div>
          <div className="relative w-full h-full border border-[#e3e7ee] bg-white">
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
        <h3 className="text-[1.1rem] md:text-[1.15rem] font-bold text-[#0b1d36] mb-2 leading-tight uppercase">
          {title}
        </h3>
        <p className="font-bold text-[#1c4d9c] mb-4 text-[0.95rem]">
          {subtitle}
        </p>
        <p className="text-[#3a4a63] font-medium mb-8 flex-1 leading-relaxed text-[0.9rem]">
          {desc}
        </p>

        <Link href={href} className="flex items-center gap-3 text-[#1c4d9c] font-bold tracking-[0.06em] uppercase text-[0.8rem] hover:gap-4 transition-all mt-auto">
          <Download size={18} strokeWidth={2.5} />
          VIEW OFFICIAL TEMPLATE →
        </Link>
      </div>
    </RevealOnView>
  );
}
