"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  threshold?: number;
  delay?: number;
  as?: keyof React.JSX.IntrinsicElements;
};

/**
 * Server-friendly reveal animation. Mirrors All Fire Services' `reveal`
 * class behaviour: 24px slide-up + opacity, 650ms ease-out, fires once.
 * Above-the-fold elements skip the offset to avoid CLS.
 */
export default function RevealOnView({
  children,
  className = "",
  style,
  threshold = 0.12,
  delay = 0,
  as: Tag = "div",
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      return;
    }
    const rect = node.getBoundingClientRect();
    const viewportH = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top < viewportH * 0.9) {
      return;
    }
    // Below-fold: start at translateY(24px), animate up on intersection.
    queueMicrotask(() => {
      setVisible(false);
    });
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  const Component = Tag as React.ElementType;
  const classes = `${className} ${visible ? "reveal reveal-in" : "reveal"}`.trim();
  const inlineStyle = delay ? { ...style, transitionDelay: `${delay}ms` } : style;

  return (
    <Component ref={ref} className={classes} style={inlineStyle}>
      {children}
    </Component>
  );
}
