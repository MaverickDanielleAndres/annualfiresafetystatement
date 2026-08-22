"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What is an AFSS?",
    answer:
      "An Annual Fire Safety Statement (AFSS) is a statement issued by or on behalf of a building owner confirming that the applicable essential fire safety measures have been assessed and that the required inspection and assessment requirements have been completed. It applies to relevant existing buildings in NSW where essential fire safety measures apply.",
  },
  {
    question: "Who is responsible for arranging an AFSS?",
    answer:
      "The building owner is responsible. In practice, the owner (or their agent) engages appropriately accredited practitioners to assess the applicable measures, then arranges for the Annual Fire Safety Statement to be issued and provided as required.",
  },
  {
    question: "How often is an AFSS required?",
    answer:
      "Generally every 12 months. Your building's Annual Fire Safety Statement is issued each year based on the applicable measures identified on your Fire Safety Schedule or other applicable fire safety requirements.",
  },
  {
    question: "What happens if my AFSS is overdue?",
    answer:
      "Failing to provide an Annual Fire Safety Statement within the required timeframe can result in escalating penalty notices from council. Each week of continuing non-compliance may constitute a further offence. Refer to current NSW legislation and your local council requirements for the position that applies to your building.",
  },
  {
    question: "Does the AFSS price include repair work?",
    answer:
      "No. The AFSS service fee covers the Annual Fire Safety Statement service itself. If the assessment identifies repairs, rectification work, additional testing or other services that are required, those works are quoted separately.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faqs" className="bg-white section-y-tight w-full overflow-hidden">
      <div className="container-inner max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-16">
        
        {/* LEFT COLUMN: TEXT AND QUESTIONS */}
        <div className="w-full md:w-7/12 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#b0141f] text-white font-bold text-[0.85rem] px-2 py-0.5 rounded-[3px] leading-tight">
              14
            </div>
            <span className="text-[#1c4d9c] font-bold text-[0.85rem] tracking-[0.15em] uppercase">
              / FAQ
            </span>
          </div>
          <h2 className="h-section mb-3">Looking for answer?</h2>
          <p className="text-body mt-2 pb-6">
            The questions NSW property owners and managers ask us most often about Annual Fire Safety Statements.
          </p>
          <div className="mt-2 flex flex-col gap-1 border-t border-[rgba(11,29,54,0.08)]">
            {faqs.map((faq, index) => (
              <div
                className="border-b border-[rgba(11,29,54,0.08)] py-5 cursor-pointer group"
                key={index}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-[1.05rem] font-bold text-[#0b1d36] transition-colors group-hover:text-[#1c4d9c]">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    size={20}
                    className={`${
                      openIndex === index ? "rotate-180 text-[#b0141f]" : "text-[#1c4d9c]"
                    } transition-all duration-300 ease-in-out shrink-0`}
                  />
                </div>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openIndex === index ? "max-h-[800px] opacity-100 mt-3" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="text-[0.95rem] text-[#3a4a63] leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: IMAGE */}
        <div className="w-full md:w-5/12 shrink-0">
          <Image
            className="w-full h-[280px] sm:h-[350px] md:h-[420px] rounded-2xl shadow-document object-cover object-center"
            src="/herosection.avif"
            alt="Annual Fire Safety Statement FAQ"
            width={600}
            height={680}
            priority
          />
        </div>

      </div>
    </section>
  );
}