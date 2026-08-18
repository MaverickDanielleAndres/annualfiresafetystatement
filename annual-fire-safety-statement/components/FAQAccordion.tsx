"use client";

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQAccordionProps {
  items: FAQItem[];
}

/**
 * Native HTML <details> accordion — keyboard accessible, no JS state,
 * minimal bundle. Each row is a separate element so the browser handles
 * open/close natively. Icon rotates to indicate expanded state.
 */
export default function FAQAccordion({ items }: FAQAccordionProps) {
  return (
    <div className="faq-list">
      {items.map((item, i) => (
        <details key={i} className="faq-row" name="afss-faq">
          <summary>
            <span>{item.question}</span>
            <span className="faq-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </span>
          </summary>
          <p className="faq-body">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
