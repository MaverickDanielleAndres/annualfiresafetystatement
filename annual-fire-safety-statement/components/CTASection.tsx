import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export interface CTASectionProps {
  title: React.ReactNode;
  body?: React.ReactNode;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  variant?: "light" | "dark";
  kicker?: string;
}

export default function CTASection({
  title,
  body,
  primaryCta,
  secondaryCta,
  variant = "light",
  kicker,
}: CTASectionProps) {
  const isDark = variant === "dark";

  return (
    <section
      className={`cta-section ${isDark ? "afss-section--dark" : ""}`}
      style={
        isDark
          ? { borderTop: "none", borderBottom: "none" }
          : undefined
      }
    >
      <div className="container-inner section-y">
        <div className="cta-section__inner">
          <div>
            {kicker && (
              <p className={`h-eyebrow ${isDark ? "h-eyebrow--light" : ""} mb-3`}>
                {kicker}
              </p>
            )}
            <h2 className={`h-section ${isDark ? "" : ""} mb-3`}>{title}</h2>
            {body && (
              <p
                className={`text-body ${isDark ? "text-body--light" : ""} max-w-prose`}
              >
                {body}
              </p>
            )}
          </div>
          <div
            className="flex flex-col gap-3 sm:flex-row sm:flex-wrap"
            style={{ alignItems: "stretch" }}
          >
            {primaryCta && (
              <Link
                href={primaryCta.href}
                className="btn btn-primary btn-lg"
                style={{ flex: 1, minWidth: "12rem" }}
              >
                {primaryCta.label}
              </Link>
            )}
            {secondaryCta && (
              <Link
                href={secondaryCta.href}
                className={`btn ${
                  isDark ? "btn-secondary" : "btn-secondary"
                } btn-lg`}
                style={{ flex: 1, minWidth: "12rem" }}
              >
                {secondaryCta.label}
                <ArrowUpRight size={16} strokeWidth={2.4} aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
