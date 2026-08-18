"use client";

import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, X, Loader2 } from "lucide-react";

export type ToastTone = "success" | "error" | "loading" | "info";

export type Toast = {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
  // duration in ms; 0 means sticky (loading / persistent errors)
  duration?: number;
};

const TONE_STYLES: Record<ToastTone, { bg: string; border: string; icon: React.ReactNode; bar: string }> = {
  success: {
    bg: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
    border: "#86efac",
    icon: <CheckCircle2 size={20} color="#16a34a" strokeWidth={2.4} />,
    bar: "#16a34a",
  },
  error: {
    bg: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
    border: "#fca5a5",
    icon: <AlertTriangle size={20} color="#dc2626" strokeWidth={2.4} />,
    bar: "#dc2626",
  },
  loading: {
    bg: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
    border: "#fdba74",
    icon: (
      <span style={{ display: "inline-flex" }}>
        <Loader2
          size={20}
          color="#ea580c"
          strokeWidth={2.4}
          style={{ animation: "toast-spin 0.9s linear infinite" }}
        />
      </span>
    ),
    bar: "#ea580c",
  },
  info: {
    bg: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
    border: "#93c5fd",
    icon: <CheckCircle2 size={20} color="#2563eb" strokeWidth={2.4} />,
    bar: "#2563eb",
  },
};

type ToastProps = {
  toast: Toast;
  onDismiss: (id: string) => void;
};

export function ToastItem({ toast, onDismiss }: ToastProps) {
  const style = TONE_STYLES[toast.tone];
  const duration = toast.duration ?? (toast.tone === "success" ? 5000 : toast.tone === "error" ? 7000 : 0);

  useEffect(() => {
    if (!duration) return;
    const timer = window.setTimeout(() => onDismiss(toast.id), duration);
    return () => window.clearTimeout(timer);
  }, [duration, onDismiss, toast.id]);

  return (
    <motion.div
      role={toast.tone === "error" ? "alert" : "status"}
      aria-live={toast.tone === "error" ? "assertive" : "polite"}
      layout
      initial={{ opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.18 } }}
      transition={{ type: "spring", stiffness: 360, damping: 28, mass: 0.6 }}
      style={{
        pointerEvents: "auto",
        position: "relative",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        minWidth: 300,
        maxWidth: 420,
        padding: "14px 16px 14px 18px",
        borderRadius: 10,
        background: style.bg,
        border: `1px solid ${style.border}`,
        boxShadow: "0 14px 38px rgba(18, 18, 18, 0.16), 0 2px 6px rgba(18, 18, 18, 0.06)",
        overflow: "hidden",
        fontFamily: "var(--font-sans), Inter, Arial, sans-serif",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: style.bar,
        }}
      />
      <span style={{ flexShrink: 0, marginTop: 1 }}>{style.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 700,
            color: "#111111",
            lineHeight: 1.35,
            wordWrap: "break-word",
          }}
        >
          {toast.title}
        </p>
        {toast.description && (
          <p
            style={{
              margin: "4px 0 0 0",
              fontSize: 12.5,
              color: "#374151",
              lineHeight: 1.5,
              wordWrap: "break-word",
            }}
          >
            {toast.description}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        style={{
          flexShrink: 0,
          width: 22,
          height: 22,
          borderRadius: 999,
          border: "none",
          background: "rgba(0,0,0,0.06)",
          color: "#374151",
          display: "grid",
          placeItems: "center",
          cursor: "pointer",
          padding: 0,
        }}
      >
        <X size={12} strokeWidth={2.5} />
      </button>
    </motion.div>
  );
}

type ToastViewportProps = {
  toasts: Toast[];
  onDismiss: (id: string) => void;
};

export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  return (
    <>
      <style>{`
        @keyframes toast-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div
        aria-live="polite"
        aria-atomic="false"
        style={{
          position: "fixed",
          top: 16,
          right: 16,
          left: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          zIndex: 10000,
          pointerEvents: "none",
          maxWidth: "calc(100vw - 32px)",
        }}
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
