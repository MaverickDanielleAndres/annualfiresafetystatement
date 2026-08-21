"use client";

import FAQAccordion from "@/components/FAQAccordion";
import RevealOnView from "@/components/RevealOnView";

/**
 * AFSS homepage — FAQ.
 *
 * Conversion-focused questions. Uses the existing native <details>
 * accordion for accessibility.
 */

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
    question: "What is a Fire Safety Schedule?",
    answer:
      "A Fire Safety Schedule (FSS) is the document that lists the essential fire safety measures applying to your building and the minimum standards of performance each measure must meet. The Schedule is what determines which measures are assessed when preparing an AFSS.",
  },
  {
    question: "What if I can't find my current AFSS?",
    answer:
      "That's common. Start your quote and select 'I can't find either' — we'll guide you through the next steps using your Fire Safety Schedule and the property details instead.",
  },
  {
    question: "Who can assess my fire safety measures?",
    answer:
      "Where an approved accreditation scheme covers the relevant assessment function, the assessment must be performed by an appropriately accredited practitioner for that function. You can verify current accreditation on the public register (FPAA — Fire Protection Association Australia).",
  },
  {
    question: "What happens if something fails assessment?",
    answer:
      "Any measure that does not meet the required standard is identified for attention. Repair, rectification or replacement of that measure may be required before the AFSS can be completed. The associated work is quoted separately and is not part of the AFSS service itself.",
  },
  {
    question: "Does the AFSS price include repair work?",
    answer:
      "No. The AFSS service fee covers the Annual Fire Safety Statement service itself. If the assessment identifies repairs, rectification work, additional testing or other services that are required, those works are quoted separately.",
  },
  {
    question: "How long does the process take?",
    answer:
      "Timing depends on your building, the applicable measures, practitioner availability and whether any issues need to be addressed before the statement can be completed. We'll give you a clear timeline once we have reviewed your Fire Safety Schedule and property details.",
  },
  {
    question: "Where does the statement need to be provided?",
    answer:
      "The owner gives the Annual Fire Safety Statement to the relevant local council. Required copies of the statement and the current Fire Safety Schedule must also be provided to the Commissioner of Fire and Rescue NSW, and required documents must be prominently displayed in the building.",
  },
  {
    question: "Can you help if I don't know my due date?",
    answer:
      "Yes. Start your quote and tell us what you know — we'll work with the documents and property details to identify the right cycle and advise next steps.",
  },
];

export default function FAQ() {
  return (
    <section
      id="faqs"
      className="bg-white section-y-tight w-full overflow-hidden"
    >
      <div className="container-inner">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 lg:mb-10 gap-6">
          <div className="flex-1">
            <RevealOnView>
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="w-2 h-2 bg-[#b0141f]"
                  aria-hidden="true"
                />
                <span className="text-xs font-bold tracking-[0.18em] uppercase text-[#1c4d9c]">
                  FAQs
                </span>
              </div>
              <h2 className="h-section">Questions, <span className="text-[#b0141f]">answered.</span></h2>
            </RevealOnView>
          </div>
          <div className="flex-1 lg:max-w-md">
            <RevealOnView delay={80}>
              <p className="text-body">
                The questions NSW property owners and managers ask us most
                often about Annual Fire Safety Statements.
              </p>
            </RevealOnView>
          </div>
        </div>

        <RevealOnView delay={120}>
          <FAQAccordion items={faqs} />
        </RevealOnView>
      </div>
    </section>
  );
}