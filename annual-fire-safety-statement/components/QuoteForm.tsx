"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export default function QuoteForm() {
  const [status, setStatus] = useState<Status>("idle");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setTimeout(() => setStatus("success"), 700);
  }

  if (status === "success") {
    return (
      <div className="afss-form-success" role="status" aria-live="polite">
        <h3 className="h-3">Quote request received.</h3>
        <p className="text-body">
          We&apos;ll review your building details and get back to you with
          next steps. If your AFSS is approaching its due date, mention it in
          the notes and we&apos;ll prioritise.
        </p>
      </div>
    );
  }

  return (
    <form className="afss-form" onSubmit={onSubmit} noValidate>
      <div className="afss-form__grid">
        <label className="afss-form__field">
          <span className="afss-form__label">Full name</span>
          <input
            type="text"
            name="name"
            required
            autoComplete="name"
            placeholder="e.g. Sam Montgomery"
          />
        </label>
        <label className="afss-form__field">
          <span className="afss-form__label">Phone</span>
          <input
            type="tel"
            name="phone"
            required
            autoComplete="tel"
            placeholder="0400 000 000"
          />
        </label>
        <label className="afss-form__field">
          <span className="afss-form__label">Email</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@building.com.au"
          />
        </label>
        <label className="afss-form__field">
          <span className="afss-form__label">Role</span>
          <select name="role" defaultValue="">
            <option value="" disabled>
              Select your role
            </option>
            <option>Owner / Building owner</option>
            <option>Strata manager</option>
            <option>Building manager</option>
            <option>Facility manager</option>
            <option>Other</option>
          </select>
        </label>
      </div>

      <div className="afss-form__grid">
        <label className="afss-form__field">
          <span className="afss-form__label">Building address</span>
          <input
            type="text"
            name="address"
            autoComplete="street-address"
            placeholder="Street, suburb, NSW"
          />
        </label>
        <label className="afss-form__field">
          <span className="afss-form__label">Building type</span>
          <select name="buildingType" defaultValue="">
            <option value="" disabled>
              Select a building type
            </option>
            <option>Strata / residential</option>
            <option>Commercial</option>
            <option>Industrial</option>
            <option>Institutional</option>
            <option>Other</option>
          </select>
        </label>
      </div>

      <div className="afss-form__grid">
        <label className="afss-form__field">
          <span className="afss-form__label">AFSS due date</span>
          <input type="date" name="dueDate" />
        </label>
        <label className="afss-form__field">
          <span className="afss-form__label">Fire Safety Schedule attached?</span>
          <select name="schedule" defaultValue="">
            <option value="" disabled>
              Select an option
            </option>
            <option>Yes — I have my Schedule</option>
            <option>Yes — but I don&apos;t have a copy yet</option>
            <option>No — I need help finding it</option>
          </select>
        </label>
      </div>

      <label className="afss-form__field">
        <span className="afss-form__label">Notes</span>
        <textarea
          name="notes"
          rows={5}
          placeholder="Anything we should know about the building, the measures on your Schedule, or prior AFSS assessments."
        />
      </label>

      <div className="afss-form__field">
        <span className="afss-form__label">Attach documents (optional)</span>
        <label className="afss-form__file">
          <input type="file" name="attachments" multiple />
          <span className="text-small">
            Drop your Fire Safety Schedule, previous AFSS or council
            correspondence here. We&apos;ll review and confirm receipt.
          </span>
        </label>
      </div>

      <div className="afss-form__actions">
        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Sending…" : "Request a quote"}
        </button>
        <p className="text-small text-[#777777] m-0">
          No obligation. We respond within one business day.
        </p>
      </div>

      {status === "error" && (
        <p className="afss-form__error" role="alert">
          Something went wrong. Please try again or call us on 1300 765 594.
        </p>
      )}
    </form>
  );
}
