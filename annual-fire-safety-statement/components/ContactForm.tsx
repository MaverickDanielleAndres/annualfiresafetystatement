"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    // No backend wired up — simulate a successful submission locally so the
    // form behaves like a real production form without promising deliverables.
    setTimeout(() => setStatus("success"), 600);
  }

  if (status === "success") {
    return (
      <div
        className="afss-form-success"
        role="status"
        aria-live="polite"
      >
        <h3 className="h-3">Thanks — we&apos;ll be in touch.</h3>
        <p className="text-body">
          A member of our team will respond within one business day. For urgent
          compliance matters, call us directly on 1300 765 594.
        </p>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[1fr_1.2fr] rounded-2xl overflow-hidden shadow-card border border-[#ececec] bg-white">
      {/* Left side: Book the Boss graphic */}
      <div className="relative min-h-[400px] lg:min-h-full bg-black flex flex-col justify-between p-8 md:p-12 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/img-practitioner.svg" alt="The Boss" className="w-full h-full object-cover opacity-60 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        </div>
        
        <div className="relative z-10">
          <p className="text-[#fb5614] font-bold tracking-widest uppercase mb-4 text-sm">Free Site Visit</p>
          <h2 className="text-5xl md:text-6xl font-black uppercase leading-none tracking-tight mb-4">
            Book The <span className="text-[#fb5614]">Boss</span>
          </h2>
          <p className="text-xl font-medium leading-snug">
            Peter will personally<br/>
            <span className="text-[#fb5614]">come to your property.</span>
          </p>
        </div>
        
        <div className="relative z-10 mt-12">
          <h3 className="text-4xl font-black uppercase mb-3">THE BOSS</h3>
          <p className="text-sm flex items-center gap-2 font-medium">
            <span className="w-5 h-5 rounded-full bg-[#fb5614] flex items-center justify-center text-xs font-bold text-white">✓</span>
            Personally attends every Free Site Visit.
          </p>
        </div>
      </div>

      {/* Right side: The form */}
      <div className="p-6 md:p-12">
        <form className="afss-form h-full flex flex-col" onSubmit={onSubmit} noValidate>
          <div className="afss-form__grid mb-6">
            <label className="afss-form__field">
              <span className="afss-form__label">Name *</span>
              <input type="text" name="name" required autoComplete="name" placeholder="John Smith" />
            </label>
            <label className="afss-form__field">
              <span className="afss-form__label">Phone *</span>
              <input type="tel" name="phone" required autoComplete="tel" placeholder="0400 000 000" />
            </label>
            <label className="afss-form__field">
              <span className="afss-form__label">Email address *</span>
              <input type="email" name="email" required autoComplete="email" placeholder="name@example.com" />
            </label>
            <label className="afss-form__field">
              <span className="afss-form__label">Suburb *</span>
              <input type="text" name="suburb" required autoComplete="address-level2" placeholder="Sydney" />
            </label>
          </div>
          
          <div className="mb-6">
            <label className="afss-form__field">
              <span className="afss-form__label">Address (Optional)</span>
              <input type="text" name="address" autoComplete="street-address" placeholder="123 Example Street" />
            </label>
          </div>

          <label className="afss-form__field mb-6">
            <span className="afss-form__label">Message *</span>
            <textarea name="message" rows={5} required placeholder="Tell us about your property or what you need help with." />
          </label>

          <label className="flex items-start gap-3 mb-8 cursor-pointer">
            <input type="checkbox" className="mt-1" required />
            <span className="text-xs text-[#4a4a46] leading-relaxed">
              I agree to be contacted about this enquiry by Annual Fire Safety Statement. We&apos;ll never share your details. See our privacy notice.
            </span>
          </label>

          <div className="mt-auto flex flex-col items-center gap-6">
            <div className="flex gap-4 w-full md:w-auto">
              <button type="submit" className="btn btn-primary animate-pump !text-lg !px-10 !py-4 w-full md:w-auto rounded-full" disabled={status === "submitting"}>
                {status === "submitting" ? "Sending…" : "GET AN INSTANT QUOTE"}
              </button>
              <button type="reset" className="btn btn-secondary !px-6">Reset</button>
            </div>
            <p className="text-sm font-bold text-[#111111] m-0">
              After Hours: <span className="text-[#fb5614]">1300 765 594</span>
            </p>
          </div>

          {status === "error" && (
            <p className="afss-form__error mt-4 text-center" role="alert">
              Something went wrong. Please try again or call us on 1300 765 594.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
