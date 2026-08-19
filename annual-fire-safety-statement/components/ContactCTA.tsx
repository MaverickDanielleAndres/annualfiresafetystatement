"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useCallback, useId, useRef, useState } from "react";
import SitewideCTA from "@/components/SitewideCTA";
import { ToastViewport, type Toast, type ToastTone } from "@/components/Toast";

const SERVICE_OPTIONS = [
  "Annual Fire Safety Statement (AFSS)",
  "Fire Safety Compliance",
  "Fire Consultation",
  "Fire Safety Training",
  "Monthly Fire Inspection",
  "Hydrant Flow Testing",
  "Diesel Pump Inspection",
  "Sprinkler System Inspection",
  "Smoke Alarm Testing",
  "Emergency & Exit Lighting",
  "Fire Extinguisher Service",
  "Strata / Building Management",
  "Other enquiry",
] as const;

type FormState = {
  name: string;
  phone: string;
  email: string;
  suburb: string;
  address: string;
  message: string;
  consent: boolean;
};

const EMPTY_FORM: FormState = {
  name: "",
  phone: "",
  email: "",
  suburb: "",
  address: "",
  message: "",
  consent: false,
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

function isValidEmail(value: string): boolean {
  // Reasonable email check — full RFC validation is server-side.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value: string): boolean {
  return /^[0-9 +()\-\s]{6,}$/.test(value);
}

const INPUT_STYLE: React.CSSProperties = {
  padding: "10px 14px",
  minHeight: 44,
  fontSize: "1rem",
  color: "#111111",
  borderRadius: 6,
  border: "1px solid #d1d5db",
  width: "100%",
  fontFamily: "inherit",
  background: "#ffffff",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
  boxSizing: "border-box",
};

const INPUT_ERROR_STYLE: React.CSSProperties = {
  ...INPUT_STYLE,
  borderColor: "#dc2626",
  boxShadow: "0 0 0 3px rgba(220, 38, 38, 0.12)",
};

const LABEL_STYLE: React.CSSProperties = {
  fontSize: "1rem",
  fontWeight: 500,
  color: "#111111",
  marginBottom: 8,
  display: "block",
};

export default function ContactCTA({
  hideSitewideCTA,
  layout = "split",
}: {
  hideSitewideCTA?: boolean;
  layout?: "single" | "split";
}) {
  const formId = useId();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const successHeadingRef = useRef<HTMLDivElement>(null);

  const pushToast = useCallback((tone: ToastTone, title: string, description?: string, duration?: number) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, tone, title, description, duration }]);
    return id;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const update = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const validateClient = (state: FormState): FieldErrors => {
    const next: FieldErrors = {};
    if (state.name.trim().length < 2) next.name = "Please enter your full name.";
    if (!isValidPhone(state.phone.trim())) next.phone = "Please enter a valid phone number.";
    if (!isValidEmail(state.email.trim())) next.email = "Please enter a valid email address.";
    if (state.suburb.trim().length < 2) next.suburb = "Please enter your suburb.";
    if (state.message.trim().length < 5) next.message = "Please tell us how we can help (5+ characters).";
    if (!state.consent) next.consent = "Please confirm you agree to be contacted.";
    return next;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const nextErrors = validateClient(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      const firstField = Object.keys(nextErrors)[0] as keyof FormState;
      pushToast(
        "error",
        "Please complete the form",
        nextErrors[firstField] ?? "Some fields need a closer look.",
      );
      // Scroll to first error.
      requestAnimationFrame(() => {
        const el = document.querySelector<HTMLElement>(`[name="${firstField}"]`);
        el?.focus();
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const loadingId = pushToast(
      "loading",
      "Sending your enquiry…",
      "Hang tight — we're passing this to the team.",
      0,
    );

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      let data: { ok?: boolean; error?: string; fields?: Record<string, string> } = {};
      try {
        data = await response.json();
      } catch {
        // Non-JSON response — treat as failure.
      }

      if (response.ok && data.ok) {
        setToasts((prev) => prev.filter((toast) => toast.id !== loadingId));
        pushToast(
          "success",
          "Thanks — your enquiry is on its way!",
          "Our team will be in touch shortly. If it's urgent, call 1300 765 594.",
        );
        setForm(EMPTY_FORM);
        // Move focus to the success heading for screen readers.
        requestAnimationFrame(() => {
          successHeadingRef.current?.focus();
        });
      } else {
        setToasts((prev) => prev.filter((toast) => toast.id !== loadingId));
        if (data.fields && Object.keys(data.fields).length > 0) {
          setErrors(data.fields as FieldErrors);
        }
        pushToast(
          "error",
          "We couldn't send that just now",
          data.error ?? "Please call 1300 765 594 or try again in a moment.",
        );
      }
    } catch (err) {
      setToasts((prev) => prev.filter((toast) => toast.id !== loadingId));
      console.error("[/contact] submit failed:", err);
      pushToast(
        "error",
        "Network error",
        "Please check your connection and try again, or call 1300 765 594.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm(EMPTY_FORM);
    setErrors({});
  };

  // The visible success region announces to assistive tech when shown.
  const showSuccess = !isSubmitting && toasts.some((toast) => toast.tone === "success");

  return (
    <section data-theme="light" className="section_contact-cta">
      <style>{`
        /* ── ContactCTA left panel responsive ── */
        .contact-cta_split {
          display: grid;
          grid-template-columns: minmax(280px, 0.8fr) minmax(500px, 1.2fr);
          gap: 80px;
          align-items: start;
          width: 100%;
          box-sizing: border-box;
        }
        .contact-cta_split > .contact-cta_content, .contact-cta_split > .contact-cta_form-wrapper {
          min-width: 0;
          width: 100%;
          max-width: none;
          box-sizing: border-box;
        }
        @media (max-width: 1023px) {
          .contact-cta_split {
            grid-template-columns: 0.9fr 1.1fr;
            gap: 56px;
          }
        }
        @media (max-width: 767px) {
          .contact-cta_split {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
        }

        .ccta-panel {
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 100%;
          max-width: 430px;
          margin: 0 auto;
          border-radius: 20px;
          background: #1a1a1a;
          position: relative;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
          min-height: 500px;
        }
        .ccta-headline {
          font-size: 3.2rem;
          font-family: Impact, 'Oswald', 'Arial Narrow Bold', sans-serif;
          font-weight: 900;
          line-height: 0.9;
          text-transform: uppercase;
          color: #ffffff;
          letter-spacing: 0.01em;
          transform: scaleY(1.1);
          transform-origin: left bottom;
          margin: 0;
          white-space: nowrap;
        }
        .ccta-subhead {
          margin: 0.35rem 0 0;
          font-size: 1.45rem;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.01em;
        }
        .ccta-eyebrow {
          margin: 0 0 0.8rem 0;
          font-size: 0.9rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          font-weight: 700;
          color: #ffb700;
        }
        .ccta-boss-name {
          font-size: 1.9rem;
        }
        /* Mobile — single column, card becomes a banner */
        @media (max-width: 767px) {
          .ccta-panel {
            max-width: 100% !important;
            min-height: 380px !important;
            border-radius: 16px;
          }
          .ccta-headline {
            font-size: 2.6rem !important;
            white-space: normal !important;
          }
          .ccta-subhead {
            font-size: 1.15rem !important;
          }
          .ccta-eyebrow {
            font-size: 0.8rem !important;
          }
          .ccta-boss-name {
            font-size: 1.5rem !important;
          }
          .ccta-copy-block {
            padding: 1.25rem 1.4rem 1.1rem !important;
          }
          .ccta-identity-block {
            bottom: 14px !important;
            left: 14px !important;
            right: 14px !important;
            gap: 10px !important;
          }
        }
        /* Tablet (768–1023px) */
        @media (min-width: 768px) and (max-width: 1023px) {
          .ccta-panel {
            max-width: 100% !important;
            min-height: 460px !important;
          }
          .ccta-headline {
            font-size: 2.5rem !important;
            white-space: normal !important;
          }
          .ccta-subhead {
            font-size: 1.35rem !important;
          }
          .ccta-eyebrow {
            font-size: 0.85rem !important;
          }
        }
        /* Large desktop (≥ 1440px) */
        @media (min-width: 1440px) {
          .ccta-panel {
            min-height: 600px;
          }
          .ccta-headline {
            font-size: 3.8rem !important;
          }
          .ccta-subhead {
            font-size: 1.6rem !important;
          }
          .ccta-eyebrow {
            font-size: 1rem !important;
          }
          .ccta-boss-name {
            font-size: 2.2rem !important;
          }
        }
        .ccta-boss-gradient {
          background: linear-gradient(to right, #ff2a00, #ffb700);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
          display: inline-block;
        }
      `}</style>
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
      <div className="container-inner">
        <div>
          {!hideSitewideCTA && (
            <div style={{ marginBottom: "clamp(4rem, 6vw, 6rem)" }}>
              <SitewideCTA />
            </div>
          )}
          <div
            className="padding-section-large"
            style={{
              paddingTop: layout === "split" ? "0" : "clamp(10rem, 14vw, 13rem)",
              paddingBottom: "clamp(4rem, 8vw, 8rem)",
            }}
          >

            <div
              className={`contact-cta_component${layout === "split" ? " contact-cta_split contact-grid" : ""}`}
              style={
                layout === "split"
                  ? undefined
                  : { display: "flex", flexDirection: "column", gap: "3rem", alignItems: "stretch" }
              }
            >
              <div 
                className="ccta-panel contact-cta_content"
              >
                <Image
                  src="/peterforcta.jpg"
                  alt="Peter Tricklebank - Boss"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 430px"
                  quality={70}
                  style={{ objectFit: "cover", objectPosition: "center 35%" }}
                />
                {/* Dark overlay on top 75% — same as FSV modal */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "75%", background: "linear-gradient(180deg, rgba(8,8,10,0.85) 0%, rgba(8,8,10,0.7) 45%, rgba(8,8,10,0.1) 92%, rgba(8,8,10,0) 100%)", pointerEvents: "none", zIndex: 1 }} />
                {/* Bottom fade to make identity block readable */}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "38%", background: "linear-gradient(0deg, rgba(8,8,10,0.82) 0%, rgba(8,8,10,0.5) 55%, rgba(8,8,10,0) 100%)", pointerEvents: "none", zIndex: 1 }} />

                {/* Copy overlaid on the dark image — top-left, same as FSV modal */}
                <div className="ccta-copy-block" style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "1.6rem 1.6rem 1.4rem", zIndex: 2 }}>
                  <p className="ccta-eyebrow">
                    Free Site Visit
                  </p>
                  <h2 className="ccta-headline">
                    Book the <span className="ccta-boss-gradient">Boss</span>
                  </h2>
                  <h3 className="ccta-subhead">
                    <span style={{ color: "#ffffff" }}>Peter will personally</span><br />
                    <span className="ccta-boss-gradient">
                      come to your property.
                    </span>
                  </h3>
                </div>

                {/* Identity block — bottom-left, same as FSV modal */}
                <div
                  className="ccta-identity-block"
                  style={{
                    position: "absolute",
                    left: 16,
                    right: 16,
                    bottom: 18,
                    color: "#ffffff",
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                    zIndex: 2,
                  }}
                >
                  <p
                    className="ccta-boss-name"
                    style={{
                      margin: 0,
                      fontWeight: 900,
                      lineHeight: 0.95,
                      color: "#ffffff",
                      fontFamily: "Impact, 'Oswald', 'Arial Narrow Bold', sans-serif",
                      textTransform: "uppercase",
                      letterSpacing: "0.02em",
                      textShadow: "0 2px 8px rgba(0,0,0,0.6)",
                    }}
                  >
                    The Boss
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      color: "#ffffff",
                      lineHeight: 1.4,
                      textShadow: "0 1px 3px rgba(0,0,0,0.55)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: "#ea580c",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
                        flexShrink: 0,
                      }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                    </span>
                    Personally attends every Free Site Visit.
                  </p>
                </div>
              </div>

              <div className="contact-cta_form-wrapper contact-form-column">
                <div className="contact-cta_form-block w-form" style={{ width: "100%" }}>
                  <form
                    onSubmit={handleSubmit}
                    onReset={handleReset}
                    noValidate
                    name={`${formId}-contact-form`}
                    id={`${formId}-contact-form`}
                    className="contact-cta_form flex flex-col gap-3"
                    aria-busy={isSubmitting}
                    style={{ gap: "0.75rem" }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                      <div className="w-full">
                        <label htmlFor={`${formId}-name`} className="form_field-label" style={LABEL_STYLE}>
                          Name <span style={{ color: "#dc2626" }} aria-hidden="true">*</span>
                        </label>
                        <input
                          id={`${formId}-name`}
                          name="name"
                          type="text"
                          autoComplete="name"
                          required
                          maxLength={120}
                          value={form.name}
                          onChange={(e) => update("name", e.target.value)}
                          disabled={isSubmitting}
                          aria-invalid={errors.name ? "true" : undefined}
                          aria-describedby={errors.name ? `${formId}-name-error` : undefined}
                          placeholder="John Smith"
                          style={errors.name ? INPUT_ERROR_STYLE : INPUT_STYLE}
                        />
                        {errors.name && (
                          <p id={`${formId}-name-error`} style={{ margin: "4px 0 0", fontSize: 12.5, color: "#b91c1c" }}>{errors.name}</p>
                        )}
                      </div>

                      <div className="w-full">
                        <label htmlFor={`${formId}-phone`} className="form_field-label" style={LABEL_STYLE}>
                          Phone <span style={{ color: "#dc2626" }} aria-hidden="true">*</span>
                        </label>
                        <input
                          id={`${formId}-phone`}
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          required
                          maxLength={40}
                          value={form.phone}
                          onChange={(e) => update("phone", e.target.value)}
                          disabled={isSubmitting}
                          aria-invalid={errors.phone ? "true" : undefined}
                          aria-describedby={errors.phone ? `${formId}-phone-error` : undefined}
                          placeholder="0400 000 000"
                          style={errors.phone ? INPUT_ERROR_STYLE : INPUT_STYLE}
                        />
                        {errors.phone && (
                          <p id={`${formId}-phone-error`} style={{ margin: "4px 0 0", fontSize: 12.5, color: "#b91c1c" }}>{errors.phone}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                      <div className="w-full">
                        <label htmlFor={`${formId}-email`} className="form_field-label" style={LABEL_STYLE}>
                          Email address <span style={{ color: "#dc2626" }} aria-hidden="true">*</span>
                        </label>
                        <input
                          id={`${formId}-email`}
                          name="email"
                          type="email"
                          autoComplete="email"
                          inputMode="email"
                          required
                          maxLength={254}
                          value={form.email}
                          onChange={(e) => update("email", e.target.value)}
                          disabled={isSubmitting}
                          aria-invalid={errors.email ? "true" : undefined}
                          aria-describedby={errors.email ? `${formId}-email-error` : undefined}
                          placeholder="name@example.com"
                          style={errors.email ? INPUT_ERROR_STYLE : INPUT_STYLE}
                        />
                        {errors.email && (
                          <p id={`${formId}-email-error`} style={{ margin: "4px 0 0", fontSize: 12.5, color: "#b91c1c" }}>{errors.email}</p>
                        )}
                      </div>

                      <div className="w-full">
                        <label htmlFor={`${formId}-suburb`} className="form_field-label" style={LABEL_STYLE}>
                          Suburb <span style={{ color: "#dc2626" }} aria-hidden="true">*</span>
                        </label>
                        <input
                          id={`${formId}-suburb`}
                          name="suburb"
                          type="text"
                          autoComplete="address-level2"
                          required
                          maxLength={120}
                          value={form.suburb}
                          onChange={(e) => update("suburb", e.target.value)}
                          disabled={isSubmitting}
                          aria-invalid={errors.suburb ? "true" : undefined}
                          aria-describedby={errors.suburb ? `${formId}-suburb-error` : undefined}
                          placeholder="Sydney"
                          style={errors.suburb ? INPUT_ERROR_STYLE : INPUT_STYLE}
                        />
                        {errors.suburb && (
                          <p id={`${formId}-suburb-error`} style={{ margin: "4px 0 0", fontSize: 12.5, color: "#b91c1c" }}>{errors.suburb}</p>
                        )}
                      </div>
                    </div>

                    <div className="w-full">
                      <label htmlFor={`${formId}-address`} className="form_field-label" style={LABEL_STYLE}>
                        Address <span style={{ color: "#6b6b6b", fontSize: "0.85rem", fontWeight: 400 }}>(Optional)</span>
                      </label>
                      <input
                        id={`${formId}-address`}
                        name="address"
                        type="text"
                        autoComplete="street-address"
                        maxLength={200}
                        value={form.address}
                        onChange={(e) => update("address", e.target.value)}
                        disabled={isSubmitting}
                        placeholder="123 Example Street"
                        style={errors.address ? INPUT_ERROR_STYLE : INPUT_STYLE}
                        aria-invalid={errors.address ? "true" : undefined}
                        aria-describedby={errors.address ? `${formId}-address-error` : undefined}
                      />
                      {errors.address && (
                        <p id={`${formId}-address-error`} style={{ margin: "4px 0 0", fontSize: 12.5, color: "#b91c1c" }}>{errors.address}</p>
                      )}
                    </div>

                    <div className="w-full">
                      <label htmlFor={`${formId}-message`} className="form_field-label" style={LABEL_STYLE}>
                        Message <span style={{ color: "#dc2626" }} aria-hidden="true">*</span>
                      </label>
                      <textarea
                        id={`${formId}-message`}
                        name="message"
                        required
                        maxLength={4000}
                        rows={5}
                        value={form.message}
                        onChange={(e) => update("message", e.target.value)}
                        disabled={isSubmitting}
                        aria-invalid={errors.message ? "true" : undefined}
                        aria-describedby={errors.message ? `${formId}-message-error` : undefined}
                        placeholder="Tell us about your property or what you need help with."
                        style={{
                          ...(errors.message ? INPUT_ERROR_STYLE : INPUT_STYLE),
                          minHeight: 110,
                          padding: "12px 14px",
                          resize: "vertical",
                          fontFamily: "inherit",
                        }}
                      />
                      {errors.message && (
                        <p id={`${formId}-message-error`} style={{ margin: "4px 0 0", fontSize: 12.5, color: "#b91c1c" }}>{errors.message}</p>
                      )}
                    </div>

                    <label
                      htmlFor={`${formId}-consent`}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.6rem",
                        marginTop: "0.5rem",
                        marginBottom: "1rem",
                        cursor: isSubmitting ? "not-allowed" : "pointer",
                      }}
                    >
                      <input
                        id={`${formId}-consent`}
                        name="consent"
                        type="checkbox"
                        checked={form.consent}
                        onChange={(e) => update("consent", e.target.checked)}
                        disabled={isSubmitting}
                        required
                        aria-invalid={errors.consent ? "true" : undefined}
                        aria-describedby={errors.consent ? `${formId}-consent-error` : undefined}
                        style={{ width: 18, height: 18, marginTop: 2, cursor: "pointer" }}
                      />
                      <span style={{ fontSize: "0.95rem", color: "#111111", lineHeight: 1.5 }}>
                        I agree to be contacted about this enquiry by All Fire Services Australia. We&rsquo;ll never share your details. See our{" "}
                        <Link href="/" className="text-style-link" style={{ color: "#111111", fontWeight: 500, textDecoration: "underline" }}>
                          privacy notice
                        </Link>
                        .
                      </span>
                    </label>
                    {errors.consent && (
                      <p id={`${formId}-consent-error`} style={{ margin: "-0.5rem 0 0.75rem 1.7rem", fontSize: 12.5, color: "#b91c1c" }}>{errors.consent}</p>
                    )}

                    <div className="flex flex-col items-center gap-4 w-full mt-2">
                      <div className="flex gap-3 items-center flex-wrap justify-center w-full">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="button w-button"
                        style={{
                          padding: "16px 48px",
                          minHeight: 48,
                          minWidth: 240,
                          fontSize: "1rem",
                          fontWeight: 600,
                          color: "#ffffff",
                          background: isSubmitting ? "#f87171" : "linear-gradient(135deg, #ff2a00 0%, #ffb700 100%)",
                          border: "none",
                          borderRadius: 8,
                          cursor: isSubmitting ? "not-allowed" : "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 10,
                          outline: "none",
                          boxShadow: "0 6px 18px rgba(255, 42, 0, 0.25)",
                          transition: "transform 0.12s, box-shadow 0.2s",
                          fontFamily: "inherit",
                          textAlign: "center",
                          animation: "fsv-pulse 3s ease-in-out infinite"
                        }}
                        onMouseDown={(e) => {
                          if (!isSubmitting) e.currentTarget.style.transform = "translateY(1px) scale(0.98)";
                        }}
                        onMouseUp={(e) => {
                          e.currentTarget.style.transform = "translateY(0) scale(1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0) scale(1)";
                        }}
                      >
                        {isSubmitting ? (
                          <>
                            <span
                              aria-hidden="true"
                              style={{
                                width: 16,
                                height: 16,
                                borderRadius: "50%",
                                border: "2px solid rgba(255,255,255,0.45)",
                                borderTopColor: "#ffffff",
                                animation: "toast-spin 0.9s linear infinite",
                                display: "inline-block",
                              }}
                            />
                            Sending…
                          </>
                        ) : (
                          "GET AN INSTANT QUOTE"
                        )}
                      </button>
                      <button
                        type="reset"
                        disabled={isSubmitting}
                        onClick={handleReset}
                        style={{
                          padding: "12px 16px",
                          minHeight: 48,
                          fontSize: "0.95rem",
                          fontWeight: 500,
                          color: "#374151",
                          background: "transparent",
                          border: "1px solid #d1d5db",
                          borderRadius: 8,
                          cursor: isSubmitting ? "not-allowed" : "pointer",
                          fontFamily: "inherit",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                        }}
                      >
                        Reset
                      </button>
                      </div>
                      <div className="text-center mt-1">
                        <span style={{ fontSize: "1.05rem", color: "#111111", fontWeight: 600 }}>After Hours: </span>
                        <a href="tel:1300765594" style={{ fontSize: "1.05rem", color: "#c11c00", fontWeight: 700, textDecoration: "none", transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.textDecoration = "underline"} onMouseOut={(e) => e.currentTarget.style.textDecoration = "none"}>1300 765 594</a>
                      </div>
                    </div>

                    {/* Live region for screen readers; focuses on success so AT users know what happened. */}
                    <div
                      ref={successHeadingRef}
                      tabIndex={-1}
                      role="status"
                      aria-live="polite"
                      style={{
                        position: "absolute",
                        width: 1,
                        height: 1,
                        padding: 0,
                        margin: -1,
                        overflow: "hidden",
                        clip: "rect(0, 0, 0, 0)",
                        whiteSpace: "nowrap",
                        border: 0,
                      }}
                    >
                      {showSuccess ? "Your enquiry has been sent successfully." : ""}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
