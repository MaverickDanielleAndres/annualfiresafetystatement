/**
 * Section heading with optional kicker and supporting copy.
 * Default layout: two-column header (kicker above h2, copy on the right).
 * Mirrors the All Fire Services section pattern.
 */
export interface SectionHeadingProps {
  kicker?: string;
  title: React.ReactNode;
  body?: React.ReactNode;
  align?: "left" | "center";
  size?: "default" | "sm";
  highlightLastWord?: string;
  as?: "h2" | "h3";
  className?: string;
  id?: string;
}

export default function SectionHeading({
  kicker,
  title,
  body,
  align = "left",
  size = "default",
  highlightLastWord,
  as: Heading = "h2",
  className = "",
  id,
}: SectionHeadingProps) {
  const headingClass = size === "sm" ? "h-section--sm" : "h-section";

  return (
    <div
      className={`section-header ${align === "center" ? "section-header--center" : ""} ${className}`.trim()}
      style={
        align === "center"
          ? { textAlign: "center", justifyItems: "center" }
          : undefined
      }
    >
      {kicker && <p className="section-header__kicker">{kicker}</p>}
      <Heading className={headingClass} id={id}>
        {title}
        {highlightLastWord && (
          <>
            {" "}
            <span className="gradient-text">{highlightLastWord}</span>
          </>
        )}
      </Heading>
      {body && <p className="section-header__body">{body}</p>}
    </div>
  );
}
