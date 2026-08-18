"use client";

/**
 * FreeSiteVisitForm — the form inside the Book the Boss modal.
 * ──────────────────────────────────────────────────────────────────────────
 * Single, self-contained form that submits to /api/free-site-visit.
 *
 * Fields (the simplified "Book the Boss" hierarchy):
 *   Required — Name, Phone, Email, Suburb, Address, Message
 *   Optional — Previous Annual Fire Safety Statement (PDF/DOC up to 10MB)
 *
 * The form is intentionally compact so the modal fits the typical desktop
 * viewport without scrolling. The Address field uses address autocomplete
 * powered by the address provider selected at build/config time (see the
 * constant ADDRESS_PROVIDER below). When no provider has been configured
 * the field falls back to a plain text input — the form still works.
 *
 * The contact-only fields have all been simplified per the latest client
 * direction:
 *   • Removed — Company / Building, Property / Building, Property address
 *     duplicates, Service required dropdown
 *   • Added   — A single Address field with Australian autocomplete
 *   • Kept    — Suburb (as a separate field so autofill remains accurate)
 */

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";

import { trackFreeSiteVisitEvent } from "@/lib/free-site-visit/analytics";
import { markFreeSiteVisitSubmitted } from "@/lib/free-site-visit/FreeSiteVisitStore";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const ALLOWED_EXT = new Set(["pdf", "doc", "docx"]);

const NAME_MIN = 2;
const NAME_MAX = 120;
const EMAIL_MAX = 254;
const SUBURB_MIN = 2;
const SUBURB_MAX = 120;
const ADDRESS_MIN = 4;
const ADDRESS_MAX = 240;
const MESSAGE_MIN = 5;
const MESSAGE_MAX = 2000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9 +()\-\s]{6,}$/;

interface FreeSiteVisitFormState {
  name: string;
  email: string;
  mobile: string;
  suburb: string;
  address: string;
  message: string;
  /** Honeypot — must stay empty. Bots fill it. */
  hp: string;
}

const EMPTY_FORM: FreeSiteVisitFormState = {
  name: "",
  email: "",
  mobile: "",
  suburb: "",
  address: "",
  message: "",
  hp: "",
};

type FieldErrors = Partial<Record<keyof FreeSiteVisitFormState, string>>;

export interface FreeSiteVisitFormProps {
  /**
   * Pre-selected service id (kept for backwards compatibility with the
   * modal call site). The Book the Boss form no longer shows a service
   * selector, so this prop is accepted but ignored at render time.
   */
  preselectedService?: string;
  /** Where the button came from — for analytics & email metadata. */
  source?: string;
  /** Callback once the form successfully submits. */
  onSubmitted?: () => void;
}

// ─── Address autocomplete ────────────────────────────────────────────────────
// The provider is selected by environment variable. The default is "none"
// so the form falls back to a vanilla <input> when no provider has been
// configured — the form keeps working and the visitor can still type their
// address manually. When NEXT_PUBLIC_ADDRESS_PROVIDER=google is set together
// with NEXT_PUBLIC_GOOGLE_PLACES_API_KEY, the input renders a Google Places
// autocomplete with full keyboard / mouse support.
const ADDRESS_PROVIDER =
  (typeof process !== "undefined" &&
    process.env?.NEXT_PUBLIC_ADDRESS_PROVIDER) ||
  "none";

interface AddressSuggestion {
  /** Human-readable main text (street). */
  main: string;
  /** Secondary text (suburb, state). */
  secondary: string;
  /** Full description as the API returned it. */
  full: string;
}

// Compact input styling — the modal must fit the viewport without scrolling.
const inputStyle: React.CSSProperties = {
  padding: "6px 10px",
  minHeight: 34,
  fontSize: "0.875rem",
  color: "#111111",
  borderRadius: 6,
  border: "1px solid #d8d8d8",
  width: "100%",
  fontFamily: "inherit",
  background: "#ffffff",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
  boxSizing: "border-box",
};
const inputErrorStyle: React.CSSProperties = {
  ...inputStyle,
  borderColor: "#dc2626",
  boxShadow: "0 0 0 3px rgba(220, 38, 38, 0.12)",
};
const labelStyle: React.CSSProperties = {
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "#111111",
  marginBottom: 3,
  display: "block",
  letterSpacing: "0.005em",
};
const helperStyle: React.CSSProperties = {
  fontSize: 11.5,
  color: "#6b6b6b",
  lineHeight: 1.4,
  marginTop: 3,
};
const errorStyle: React.CSSProperties = {
  margin: "3px 0 0",
  fontSize: 11.5,
  color: "#b91c1c",
  lineHeight: 1.4,
};

export default function FreeSiteVisitForm({
  source,
  onSubmitted,
}: FreeSiteVisitFormProps) {
  const visit = null as unknown as { markSubmitted: () => void };
  const [form, setForm] = useState<FreeSiteVisitFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [formStartFired, setFormStartFired] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);
  const formId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const update = useCallback(
    <K extends keyof FreeSiteVisitFormState>(key: K, value: FreeSiteVisitFormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      // Clear the specific error as the user fixes it.
      setErrors((prev) => {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
      if (!formStartFired) {
        setFormStartFired(true);
        trackFreeSiteVisitEvent("free_site_visit_form_start", {
          source: (source as never) ?? "other",
        });
      }
    },
    [formStartFired, source],
  );

  const validate = useCallback((state: FreeSiteVisitFormState): FieldErrors => {
    const next: FieldErrors = {};
    if (state.name.trim().length < NAME_MIN || state.name.trim().length > NAME_MAX) {
      next.name = "Please enter your name.";
    }
    if (!PHONE_RE.test(state.mobile.trim())) {
      next.mobile = "Please enter your phone number.";
    }
    if (!EMAIL_RE.test(state.email.trim()) || state.email.trim().length > EMAIL_MAX) {
      next.email = "Please enter a valid email address.";
    }
    if (state.suburb.trim().length < SUBURB_MIN || state.suburb.trim().length > SUBURB_MAX) {
      next.suburb = "Please enter your suburb.";
    }
    if (state.message.trim().length < MESSAGE_MIN || state.message.length > MESSAGE_MAX) {
      next.message = "Please tell us how we can help (5–2000 characters).";
    }
    return next;
  }, []);

  const handleFile = useCallback((next: File | null) => {
    setFileError(null);
    if (!next) {
      setFile(null);
      return;
    }
    const ext = next.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXT.has(ext)) {
      setFileError("We can only accept PDF or Word documents.");
      return;
    }
    if (!ALLOWED_MIME.has(next.type) && next.type !== "") {
      setFileError("That file type is not supported. Please attach a PDF or Word document.");
      return;
    }
    if (next.size > MAX_FILE_BYTES) {
      setFileError("That file is over the 10MB limit. Please attach a smaller file.");
      return;
    }
    setFile(next);
    trackFreeSiteVisitEvent("free_site_visit_file_attached", {
      source: (source as never) ?? "other",
    });
  }, [source]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (isSubmitting) return;
      const nextErrors = validate(form);
      if (Object.keys(nextErrors).length > 0) {
        setErrors(nextErrors);
        // Focus the first invalid field.
        const firstKey = Object.keys(nextErrors)[0];
        if (firstKey) {
          const el = document.querySelector<HTMLElement>(`[name="${firstKey}"]`);
          el?.focus();
        }
        return;
      }
      setErrors({});
      setIsSubmitting(true);
      setStatus("idle");
      setStatusMessage(null);

      try {
        const fd = new FormData();
        fd.set("name", form.name.trim());
        fd.set("email", form.email.trim());
        fd.set("mobile", form.mobile.trim());
        fd.set("suburb", form.suburb.trim());
        fd.set("address", form.address.trim());
        fd.set("message", form.message.trim());
        fd.set("consent", "1");
        fd.set("hp", form.hp);
        fd.set("source", source ?? "other");
        if (file) fd.set("afss", file);

        const response = await fetch("/api/free-site-visit", {
          method: "POST",
          body: fd,
        });

        let data: { ok?: boolean; error?: string; fields?: Record<string, string> } = {};
        try {
          data = await response.json();
        } catch {
          /* Non-JSON — treat as failure. */
        }

        if (response.ok && data.ok) {
          setStatus("success");
          setStatusMessage("Thanks — we've received your request.");
          setForm(EMPTY_FORM);
          setFile(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
          markFreeSiteVisitSubmitted();
          trackFreeSiteVisitEvent("free_site_visit_success", {
            source: (source as never) ?? "other",
          });
          onSubmitted?.();
          requestAnimationFrame(() => {
            successRef.current?.focus();
          });
        } else {
          setStatus("error");
          setStatusMessage(
            data.error ??
            "We couldn't send your request. Please try again or call 1300 765 594.",
          );
          if (data.fields && Object.keys(data.fields).length > 0) {
            setErrors(data.fields as FieldErrors);
          }
          trackFreeSiteVisitEvent("free_site_visit_error", {
            source: (source as never) ?? "other",
          });
        }
      } catch (err) {
        console.error("[/free-site-visit] submit failed:", err);
        setStatus("error");
        setStatusMessage(
          "We couldn't send your request. Please try again or call 1300 765 594.",
        );
        trackFreeSiteVisitEvent("free_site_visit_error", {
          source: (source as never) ?? "other",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [form, file, isSubmitting, onSubmitted, source, validate, visit],
  );

  const submitting = isSubmitting;
  const success = status === "success";

  // ── Success state ─────────────────────────────────────────────────────
  if (success) {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "0.65rem",
          padding: "0.25rem 0",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #ff2a00 0%, #ffb700 100%)",
            display: "grid",
            placeItems: "center",
            color: "#ffffff",
            fontSize: "1.1rem",
          }}
        >
          ✓
        </div>
        <h3
          style={{
            margin: 0,
            fontSize: "clamp(1.1rem, 2.2vw, 1.3rem)",
            fontWeight: 800,
            color: "#111111",
            lineHeight: 1.2,
          }}
        >
          Thanks, we&apos;ve received your request.
        </h3>
        <p
          style={{
            margin: 0,
            color: "#1f1f1f",
            lineHeight: 1.5,
            fontSize: "0.9rem",
          }}
        >
          Peter and the team will be in touch to confirm your visit.
        </p>
        <p
          style={{
            margin: 0,
            color: "#4b4b4b",
            fontSize: "0.8rem",
            lineHeight: 1.4,
          }}
        >
          If it&apos;s urgent, you can also call us on{" "}
          <a href="tel:1300765594" style={{ color: "#d64012", fontWeight: 700 }}>
            1300 765 594
          </a>
          .
        </p>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────
  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      name={`${formId}-book-the-boss-form`}
      id={`${formId}-book-the-boss-form`}
      aria-busy={submitting}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.35rem",
        width: "100%",
        minHeight: 0,
      }}
    >
      {/* Honeypot — hidden from real users, visible to bots. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-10000px",
          width: 1,
          height: 1,
          overflow: "hidden",
        }}
      >
        <label>
          Do not fill this in
          <input
            type="text"
            name="hp"
            tabIndex={-1}
            autoComplete="off"
            value={form.hp}
            onChange={(e) => update("hp", e.target.value)}
          />
        </label>
      </div>

      {/* Name + Phone */}
      <div
        className="fsv-row-2col"
        style={{
          display: "grid",
          gap: "0.5rem",
          gridTemplateColumns: "1fr 1fr",
        }}
      >
        <div>
          <label htmlFor={`${formId}-name`} style={labelStyle}>
            Name <span style={{ color: "#dc2626" }} aria-hidden="true">*</span>
          </label>
          <input
            id={`${formId}-name`}
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={NAME_MAX}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            disabled={submitting}
            aria-invalid={errors.name ? "true" : undefined}
            aria-describedby={errors.name ? `${formId}-name-error` : undefined}
            placeholder="John Smith"
            style={errors.name ? inputErrorStyle : inputStyle}
          />
          {errors.name && (
            <p id={`${formId}-name-error`} style={errorStyle}>
              {errors.name}
            </p>
          )}
        </div>
        <div>
          <label htmlFor={`${formId}-mobile`} style={labelStyle}>
            Phone <span style={{ color: "#dc2626" }} aria-hidden="true">*</span>
          </label>
          <input
            id={`${formId}-mobile`}
            name="mobile"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            required
            maxLength={40}
            value={form.mobile}
            onChange={(e) => update("mobile", e.target.value)}
            disabled={submitting}
            aria-invalid={errors.mobile ? "true" : undefined}
            aria-describedby={errors.mobile ? `${formId}-mobile-error` : undefined}
            placeholder="0400 000 000"
            style={errors.mobile ? inputErrorStyle : inputStyle}
          />
          {errors.mobile && (
            <p id={`${formId}-mobile-error`} style={errorStyle}>
              {errors.mobile}
            </p>
          )}
        </div>
      </div>

      {/* Email + Suburb */}
      <div
        className="fsv-row-2col"
        style={{
          display: "grid",
          gap: "0.5rem",
          gridTemplateColumns: "1fr 1fr",
        }}
      >
        <div>
          <label htmlFor={`${formId}-email`} style={labelStyle}>
            Email <span style={{ color: "#dc2626" }} aria-hidden="true">*</span>
          </label>
          <input
            id={`${formId}-email`}
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            maxLength={EMAIL_MAX}
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            disabled={submitting}
            aria-invalid={errors.email ? "true" : undefined}
            aria-describedby={errors.email ? `${formId}-email-error` : undefined}
            placeholder="name@example.com"
            style={errors.email ? inputErrorStyle : inputStyle}
          />
          {errors.email && (
            <p id={`${formId}-email-error`} style={errorStyle}>
              {errors.email}
            </p>
          )}
        </div>
        <div>
          <label htmlFor={`${formId}-suburb`} style={labelStyle}>
            Suburb <span style={{ color: "#dc2626" }} aria-hidden="true">*</span>
          </label>
          <input
            id={`${formId}-suburb`}
            name="suburb"
            type="text"
            autoComplete="address-level2"
            required
            maxLength={SUBURB_MAX}
            value={form.suburb}
            onChange={(e) => update("suburb", e.target.value)}
            disabled={submitting}
            aria-invalid={errors.suburb ? "true" : undefined}
            aria-describedby={errors.suburb ? `${formId}-suburb-error` : undefined}
            placeholder="Sydney"
            style={errors.suburb ? inputErrorStyle : inputStyle}
          />
          {errors.suburb && (
            <p id={`${formId}-suburb-error`} style={errorStyle}>
              {errors.suburb}
            </p>
          )}
        </div>
      </div>

      {/* Address — single column so the input remains readable.
          Renders the autocomplete wrapper which automatically degrades to
          a plain input when no provider has been configured. */}
      <div>
        <label htmlFor={`${formId}-address`} style={labelStyle}>
          Address{" "}
          <span
            style={{
              color: "#6b6b6b",
              fontSize: "0.85rem",
              fontWeight: 400,
            }}
          >
            (Optional)
          </span>
        </label>
        <AddressAutocomplete
          inputId={`${formId}-address`}
          name="address"
          value={form.address}
          onChange={(value) => update("address", value)}
          onSelectSuburb={(suburb) => update("suburb", suburb)}
          placeholder="123 Example St, Sydney NSW 2000"
          disabled={submitting}
          aria-invalid={errors.address ? "true" : undefined}
          aria-describedby={errors.address ? `${formId}-address-error` : undefined}
          inputStyle={errors.address ? inputErrorStyle : inputStyle}
        />
        {errors.address && (
          <p id={`${formId}-address-error`} style={errorStyle}>
            {errors.address}
          </p>
        )}
      </div>

      {/* Message */}
      <div>
        <label htmlFor={`${formId}-message`} style={labelStyle}>
          Message
        </label>
        <textarea
          id={`${formId}-message`}
          name="message"
          maxLength={MESSAGE_MAX}
          rows={3}
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          disabled={submitting}
          aria-invalid={errors.message ? "true" : undefined}
          aria-describedby={errors.message ? `${formId}-message-error` : undefined}
          placeholder="Tell us about your property or what you need help with."
          style={{
            ...inputStyle,
            minHeight: 64,
            padding: "7px 11px",
            resize: "vertical",
            fontFamily: "inherit",
            lineHeight: 1.4,
            ...(errors.message ? inputErrorStyle : {}),
          }}
        />
        {errors.message && (
          <p id={`${formId}-message-error`} style={errorStyle}>
            {errors.message}
          </p>
        )}
      </div>

      {/* Previous Annual Fire Safety Statement — clearly optional. */}
      <div style={{ marginTop: "0.1rem" }}>
        <label htmlFor={`${formId}-afss`} style={labelStyle}>
          Previous Annual Fire Safety Statement{" "}
          <span
            style={{
              color: "#6b6b6b",
              fontSize: "0.7rem",
              fontWeight: 500,
            }}
          >
            Optional
          </span>
        </label>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          <label
            htmlFor={`${formId}-afss`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.4rem 0.7rem",
              borderRadius: 6,
              border: "1px solid #d1d5db",
              cursor: submitting ? "not-allowed" : "pointer",
              background: "#ffffff",
              fontWeight: 500,
              fontSize: "0.78rem",
              color: "#111111",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {file ? "Replace file" : "Choose file"}
          </label>
          <input
            ref={fileInputRef}
            id={`${formId}-afss`}
            name="afss"
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            disabled={submitting}
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            style={{
              position: "absolute",
              width: 1,
              height: 1,
              padding: 0,
              margin: -1,
              overflow: "hidden",
              clip: "rect(0,0,0,0)",
              whiteSpace: "nowrap",
              border: 0,
            }}
          />
          <span
            style={{
              fontSize: "0.75rem",
              color: file ? "#111111" : "#6b6b6b",
              flex: "1 1 auto",
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {file ? `${file.name} (${formatBytes(file.size)})` : "No file chosen"}
          </span>
          {file && (
            <button
              type="button"
              onClick={() => {
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              disabled={submitting}
              style={{
                padding: "0.3rem 0.55rem",
                borderRadius: 5,
                border: "1px solid #d1d5db",
                background: "transparent",
                color: "#111111",
                fontSize: "0.75rem",
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              Remove
            </button>
          )}
        </div>
        <p style={helperStyle}>
          Optional — upload it if available. PDF or Word, up to 10MB.
        </p>
        {fileError && <p style={errorStyle}>{fileError}</p>}
      </div>

      {/* Status (error) */}
      {status === "error" && statusMessage && (
        <div
          role="alert"
          style={{
            padding: "0.45rem 0.6rem",
            borderRadius: 6,
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            fontSize: "0.78rem",
            lineHeight: 1.4,
          }}
        >
          {statusMessage}{" "}
          You can also call us on{" "}
          <a href="tel:1300765594" style={{ color: "#991b1b", fontWeight: 700 }}>
            1300 765 594
          </a>
          .
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="fsv-submit"
        style={{
          marginTop: "0.25rem",
          padding: "0.7rem 1.2rem",
          minHeight: 42,
          fontSize: "0.95rem",
          fontWeight: 800,
          color: "#ffffff",
          background: submitting
            ? "#f87171"
            : "linear-gradient(135deg, #ff2a00 0%, #ffb700 100%)",
          border: "none",
          borderRadius: 8,
          cursor: submitting ? "not-allowed" : "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          outline: "none",
          boxShadow: "0 6px 18px rgba(255, 42, 0, 0.28)",
          transition: "transform 0.12s, box-shadow 0.2s",
          fontFamily: "inherit",
          whiteSpace: "nowrap",
          letterSpacing: "0.02em",
          textTransform: "uppercase",
        }}
        onMouseDown={(e) => {
          if (!submitting) e.currentTarget.style.transform = "translateY(1px)";
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        {submitting ? (
          <>
            <span
              aria-hidden="true"
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                border: "2px solid rgba(255,255,255,0.45)",
                borderTopColor: "#ffffff",
                animation: "fsv-spin 0.9s linear infinite",
                display: "inline-block",
              }}
            />
            Sending&hellip;
          </>
        ) : (
          "Book the Boss"
        )}
      </button>

      {/* Privacy note */}
      <p
        style={{
          margin: 0,
          fontSize: "0.75rem",
          color: "#4b4b4b",
          lineHeight: 1.4,
          display: "flex",
          alignItems: "flex-start",
          gap: 5,
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{ color: "#16a34a", flex: "0 0 auto", marginTop: 2 }}
        >
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        Peter and the team will be in touch shortly to confirm your visit. Your information is secure.
      </p>

      {/* Prefer to call — single bold row at the bottom */}
      <div
        className="fsv-bottom-row"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          flexWrap: "wrap",
          marginTop: "0.15rem",
          paddingTop: "0.4rem",
          borderTop: "1px solid rgba(17,17,17,0.08)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "0.78rem",
            color: "#111111",
            lineHeight: 1.4,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ color: "#4b4b4b", fontWeight: 600 }}>Prefer to call?</span>
          <a
            href="tel:1300765594"
            style={{
              color: "#d64012",
              fontWeight: 800,
              textDecoration: "underline",
              letterSpacing: "0.01em",
            }}
          >
            1300 765 594
          </a>
        </p>
        <FreeSiteVisitSocials />
      </div>

      <style>{`
        @keyframes fsv-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .fsv-submit { transition: none !important; }
        }
        /* Tablet & mobile — stack the two-column form rows so inputs
           aren't compressed on narrow viewports, and allow the CTA
           button label to wrap rather than overflow. Visual design,
           height, font-size, gradient and radius are all preserved. */
        @media (max-width: 1024px) {
          .fsv-submit {
            width: 100%;
            white-space: normal;
            text-align: center;
          }
        }
        @media (max-width: 768px) {
          .fsv-row-2col {
            grid-template-columns: minmax(0, 1fr) !important;
          }
          .fsv-submit {
            width: 100%;
            white-space: normal;
            text-align: center;
          }
        }
        @media (max-width: 480px) {
          .fsv-bottom-row {
            justify-content: center !important;
            flex-direction: column !important;
            gap: 0.65rem !important;
          }
        }
      `}</style>

      {/* Reference the Image import so Next.js still bundles the optimizer. */}
      <span aria-hidden="true" style={{ display: "none" }}>
        <Image src="/Peter - Managing Director.jpg" alt="" width={1} height={1} />
      </span>
    </form>
  );
}

/**
 * AddressAutocomplete — wraps the Address input and (when configured)
 * shows a dropdown of address suggestions. Falls back to a vanilla text
 * input when no provider key has been supplied to the environment, so the
 * form continues to function without any autocomplete provider.
 *
 * Provider chosen via NEXT_PUBLIC_ADDRESS_PROVIDER. Supports:
 *   • "google" — Google Places Autocomplete (uses NEXT_PUBLIC_GOOGLE_PLACES_API_KEY)
 *   • "none"   — vanilla text input (default; no third-party script loaded)
 *
 * When Google Places is enabled, the Google script is loaded once at module
 * level. The script creates `window.google.maps.places`; we watch for it via
 * a small poll and hide the list cleanly when the input loses focus.
 */
function AddressAutocomplete({
  inputId,
  name,
  value,
  onChange,
  onSelectSuburb,
  placeholder,
  disabled,
  inputStyle,
  ...aria
}: {
  inputId: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onSelectSuburb?: (suburb: string) => void;
  placeholder?: string;
  disabled?: boolean;
  inputStyle: React.CSSProperties;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "name" | "value" | "onChange" | "placeholder" | "id" | "disabled" | "style">) {
  const providerIsGoogle = ADDRESS_PROVIDER === "google";
  const googleApiKey = (typeof process !== "undefined" &&
    process.env?.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY) ||
    "";
  const googleReady = useGooglePlacesScript(providerIsGoogle && !!googleApiKey, googleApiKey);

  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [open, setOpen] = useState(false);

  // When the Google script has loaded and the provider is configured,
  // attach a Places AutocompleteService via window.google.maps.places.
  const autocompleteServiceRef = useRef<unknown>(null);
  const sessionTokenRef = useRef<unknown>(null);
  useEffect(() => {
    if (!googleReady) return;
    // The Google global is added by the script; check defensively.
    const g = (typeof window !== "undefined" ? (window as unknown as { google?: { maps?: { places?: unknown } } }) : null)?.google;
    if (!g?.maps?.places) return;
    const w = window as unknown as {
      google: {
        maps: {
          places: {
            AutocompleteService: new (opts?: unknown) => unknown;
          };
        };
      };
    };
    const svc = new w.google.maps.places.AutocompleteService();
    autocompleteServiceRef.current = svc;
    void sessionTokenRef;
    return () => {
      autocompleteServiceRef.current = null;
    };
  }, [googleReady]);

  const fetchSuggestions = useCallback(
    (input: string) => {
      if (!providerIsGoogle) {
        setSuggestions([]);
        setOpen(false);
        return;
      }
      const svc = autocompleteServiceRef.current as
        | {
            getPlacePredictions: (
              req: {
                input: string;
                componentRestrictions?: { country: string };
              },
              cb: (
                predictions: Array<{
                  structured_formatting?: { main_text?: string; secondary_text?: string };
                  description?: string;
                }> | null,
                status: string,
              ) => void,
            ) => void;
          }
        | null;
      if (!svc) {
        setSuggestions([]);
        setOpen(false);
        return;
      }
      if (input.trim().length < 3) {
        setSuggestions([]);
        setOpen(false);
        return;
      }
      svc.getPlacePredictions(
        {
          input,
          componentRestrictions: { country: "au" },
        },
        (predictions, status) => {
          if (status !== "OK" || !predictions) {
            setSuggestions([]);
            setOpen(false);
            return;
          }
          const next: AddressSuggestion[] = predictions.slice(0, 6).map((p) => ({
            main: p.structured_formatting?.main_text ?? p.description ?? "",
            secondary: p.structured_formatting?.secondary_text ?? "",
            full: p.description ?? "",
          }));
          setSuggestions(next);
          setActiveIndex(next.length > 0 ? 0 : -1);
          setOpen(next.length > 0);
        },
      );
    },
    [providerIsGoogle],
  );

  const handleChange = useCallback(
    (next: string) => {
      onChange(next);
      fetchSuggestions(next);
    },
    [onChange, fetchSuggestions],
  );

  const handleSelect = useCallback(
    (idx: number) => {
      const picked = suggestions[idx];
      if (!picked) return;
      onChange(picked.full);
      // Best-effort: copy the secondary text (typically the suburb) into
      // the Suburb field too so the visitor doesn't have to type it again.
      const suburbGuess = picked.secondary.split(",")[0]?.trim();
      if (suburbGuess) onSelectSuburb?.(suburbGuess);
      setOpen(false);
      setSuggestions([]);
    },
    [suggestions, onChange, onSelectSuburb],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!open || suggestions.length === 0) return;
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((prev) => (prev + 1) % suggestions.length);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((prev) =>
          prev <= 0 ? suggestions.length - 1 : prev - 1,
        );
      } else if (event.key === "Enter") {
        event.preventDefault();
        if (activeIndex >= 0) handleSelect(activeIndex);
      } else if (event.key === "Escape") {
        setOpen(false);
      }
    },
    [activeIndex, handleSelect, open, suggestions.length],
  );

  if (!providerIsGoogle || !googleApiKey) {
    // No provider — render a plain text input. The form keeps working.
    return (
      <input
        {...aria}
        id={inputId}
        name={name}
        type="text"
        autoComplete="street-address"
        maxLength={ADDRESS_MAX}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        style={inputStyle}
      />
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <input
        {...aria}
        id={inputId}
        name={name}
        type="text"
        autoComplete="street-address"
        maxLength={ADDRESS_MAX}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        disabled={disabled}
        placeholder={placeholder}
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={`${inputId}-listbox`}
        aria-activedescendant={
          open && activeIndex >= 0 ? `${inputId}-option-${activeIndex}` : undefined
        }
        role="combobox"
        style={inputStyle}
      />
      {open && suggestions.length > 0 && (
        <ul
          id={`${inputId}-listbox`}
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 60,
            margin: 0,
            padding: "4px",
            listStyle: "none",
            background: "#ffffff",
            border: "1px solid #d8d8d8",
            borderRadius: 8,
            boxShadow: "0 12px 28px rgba(0,0,0,0.18)",
            maxHeight: 240,
            overflowY: "auto",
          }}
        >
          {suggestions.map((s, idx) => (
            <li
              id={`${inputId}-option-${idx}`}
              role="option"
              aria-selected={activeIndex === idx}
              key={`${s.full}-${idx}`}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(idx);
              }}
              onMouseEnter={() => setActiveIndex(idx)}
              style={{
                padding: "8px 10px",
                borderRadius: 6,
                cursor: "pointer",
                background: activeIndex === idx ? "rgba(255,87,34,0.12)" : "transparent",
                color: "#111111",
              }}
            >
              <div style={{ fontSize: "0.85rem", fontWeight: 600, lineHeight: 1.3 }}>{s.main}</div>
              {s.secondary && (
                <div style={{ fontSize: "0.75rem", color: "#5b5b5b", lineHeight: 1.3 }}>{s.secondary}</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * useGooglePlacesScript — loads the Google Places script once per session,
 * only when actually requested (provider=google + key present). Returns
 * `true` once `window.google.maps.places` is ready to use.
 */
function useGooglePlacesScript(shouldLoad: boolean, apiKey: string): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!shouldLoad || typeof window === "undefined") return;
    const existing = (window as unknown as { __fsvGooglePlaces?: boolean }).__fsvGooglePlaces;
    if (existing) {
      // Script tag already on the page; wait for it to expose the API.
      pollForGoogle();
      return;
    }
    (window as unknown as { __fsvGooglePlaces?: boolean }).__fsvGooglePlaces = true;

    const script = document.createElement("script");
    script.id = "fsv-google-places";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      // Silently fall back — the field continues to work as plain text.
      setReady(false);
    };
    document.head.appendChild(script);
    pollForGoogle();
    return () => {
      /* no cleanup — the script can persist for the session */
    };
  }, [shouldLoad, apiKey]);

  function pollForGoogle() {
    let tries = 0;
    const tick = () => {
      const g = (window as unknown as { google?: { maps?: { places?: unknown } } })?.google;
      if (g?.maps?.places) {
        setReady(true);
        return;
      }
      tries += 1;
      if (tries < 80) window.setTimeout(tick, 125);
    };
    tick();
  }

  return ready;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * FreeSiteVisitSocials — the social icon row that sits at the bottom of
 * the modal so the visitor can find us on any channel from the same
 * surface. Reuses the same verified external URLs as the rest of the
 * site (header + footer + contact page).
 */
function FreeSiteVisitSocials() {
  const links: Array<{ label: string; href: string; icon: React.ReactNode }> = [
    {
      label: "Facebook",
      href: "https://www.facebook.com/profile.php?id=61566630403365",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/_allfireservices_/",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      ),
    },
    {
      label: "LinkedIn",
      href: "https://au.linkedin.com/allfire-services-sydney-92690516",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
    {
      label: "YouTube",
      href: "https://youtube.com/@allfireservices",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
    {
      label: "TikTok",
      href: "https://tiktok.com/@allfireservices",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.69a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.12z" />
        </svg>
      ),
    },
    {
      label: "X (Twitter)",
      href: "https://x.com/Allfiresydney",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
        </svg>
      ),
    },
  ];

  return (
    <ul
      aria-label="Social links"
      style={{
        display: "flex",
        gap: "0.4rem",
        listStyle: "none",
        margin: 0,
        padding: 0,
        alignItems: "center",
      }}
    >
      {links.map((link) => (
        <li key={link.label}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${link.label} (opens in a new tab)`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 26,
              height: 26,
              borderRadius: 999,
              background: "rgba(17,17,17,0.06)",
              color: "#111111",
              transition: "background-color 0.18s, color 0.18s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#d64012";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(17,17,17,0.06)";
              e.currentTarget.style.color = "#111111";
            }}
          >
            {link.icon}
          </a>
        </li>
      ))}
    </ul>
  );
}

