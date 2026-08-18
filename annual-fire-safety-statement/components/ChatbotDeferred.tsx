"use client";

import { useEffect, useRef, useState } from "react";
import { Loader, MapPin, MessageCircle, Phone, Send, X } from "lucide-react";
import Image from "next/image";
import { useLenis } from "lenis/react";

// Local Gemini-backed chat route. The bot is owned by ALLFIRE — it streams
// from /api/chat (Google Gemini 2.5 Flash) using the knowledge base in
// lib/allfire-knowledge.ts. No external iframe, no popup.
const CHAT_ENDPOINT = "/api/chat";

type Message = {
  role: "user" | "model";
  content: string;
};

// Initial greeting — the model greets on its own, but we surface a quick
// prompt to set the visitor's expectations.
const SUGGESTED_PROMPTS = [
  "What is an AFSS?",
  "Do you service my suburb?",
  "How quickly can you inspect?",
  "What does monthly testing cover?",
];

function BrandCorner({ compact = false }: { compact?: boolean }) {
  const size = compact ? { width: 68, height: 48 } : { width: 168, height: 122 };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 168 122"
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: size.width,
        height: size.height,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <defs>
        <linearGradient
          id={compact ? "chatCornerOrangeCompact" : "chatCornerOrange"}
          x1="74"
          y1="0"
          x2="168"
          y2="122"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#ff7a1a" />
          <stop offset="0.58" stopColor="#fb5614" />
          <stop offset="1" stopColor="#ffa20d" />
        </linearGradient>
      </defs>
      <path
        d="M50 0H168V122C134 69 98 28 50 0Z"
        fill={`url(#${compact ? "chatCornerOrangeCompact" : "chatCornerOrange"})`}
      />
      <path d="M23 0C68 18 109 52 151 104" fill="none" stroke="#fc0403" strokeWidth="14" strokeLinecap="round" />
      <path d="M45 0C86 20 123 57 168 122" fill="none" stroke="#feaf04" strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}

export default function ChatbotDeferred({ initialOpen = false }: { initialOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  
  const lenis = useLenis();
  const [isCtaVisible, setIsCtaVisible] = useState(false);

  // Sync with the mobile sticky CTA so we can move the chat bubble up when it appears.
  useEffect(() => {
    if (typeof window === "undefined") return;
    let mounted = true;
    let raf = 0;
    const onScroll = () => {
      if (!mounted) return;
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        if (!mounted) return;
        const isMobileScreen = window.innerWidth <= 768;
        const y = (lenis?.scroll ?? window.scrollY) ?? 0;
        const next = isMobileScreen && (y > Math.min(window.innerHeight * 0.7, 480));
        setIsCtaVisible((prev) => (prev === next ? prev : next));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      mounted = false;
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [lenis]);

  // Track viewport so we can collapse the window to a full-screen modal on
  // phones — a 380px panel is too cramped below ~768px.
  useEffect(() => {
    const handleResize = () => setIsMobileOrTablet(window.innerWidth <= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close on outside click / touch.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Auto-scroll to the latest message as the assistant streams.
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isStreaming]);

  // Tear down any in-flight request when the user closes the chat.
  useEffect(() => {
    if (!isOpen) {
      abortRef.current?.abort();
      abortRef.current = null;
      setIsStreaming(false);
    }
  }, [isOpen]);

  // Cleanup on unmount.
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    setError(null);
    const nextHistory: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextHistory);
    setInput("");
    setIsStreaming(true);

    // Reserve a slot for the model's reply so the UI shows a blank line
    // that fills in as tokens arrive.
    setMessages((prev) => [...prev, { role: "model", content: "" }]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextHistory }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const fallback =
          res.status === 503
            ? "The chat assistant is offline right now. Please call 1300 765 594."
            : "Sorry — something went wrong. Please call 1300 765 594.";
        setError(fallback);
        setMessages((prev) => prev.slice(0, -1));
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      // Stream chunks into the last message slot.
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        const snapshot = accumulated;
        setMessages((prev) => {
          if (prev.length === 0) return prev;
          const updated = prev.slice();
          updated[updated.length - 1] = { role: "model", content: snapshot };
          return updated;
        });
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError("Sorry — something went wrong. Please call 1300 765 594.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(input);
    }
  }

  const fullScreen = isMobileOrTablet;

  return (
    <div
      ref={wrapperRef}
      className="chatbot-container"
      style={{
        fontFamily: "var(--font-sans), Inter, Arial, sans-serif",
        position: "fixed",
        bottom: isMobileOrTablet ? (isCtaVisible ? 80 : 10) : 20,
        right: isMobileOrTablet ? 10 : 20,
        zIndex: 9999,
        transition: "bottom 280ms cubic-bezier(0.16, 1, 0.3, 1)",
        touchAction: !isMobileOrTablet && !isOpen ? "none" : "auto",
      }}
    >
      {isOpen && (
        <section
          className="chatbot-window"
          aria-label="Flame from ALLFIRE"
          style={{
            position: "relative",
            width: fullScreen ? "calc(100vw - 20px)" : 380,
            height: fullScreen ? "calc(100vh - 20px)" : 620,
            maxWidth: 380,
            maxHeight: "86vh",
            borderRadius: 8,
            boxShadow: "0 18px 46px rgba(18, 18, 18, 0.16)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            border: "1px solid #ece7e2",
            background: "#fff",
          }}
        >
          <BrandCorner />

          <header
            style={{
              position: "relative",
              zIndex: 1,
              padding: "18px 18px 12px",
              flexShrink: 0,
              background: "#fff",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
              <div>
                <Image
                  src="/logo.png"
                  alt="ALLFIRE"
                  width={84}
                  height={40}
                  priority={false}
                  style={{ objectFit: "contain", height: 36, width: "auto", display: "block" }}
                />
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 12 }}>
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "#21b55a",
                      display: "inline-block",
                    }}
                  />
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#161616" }}>Flame from ALLFIRE</p>
                </div>
                <p style={{ margin: "4px 0 0", fontSize: 11.5, color: "#777", lineHeight: 1.45 }}>
                  Ask about services, coverage, inspections, and enquiries.
                </p>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  border: "1px solid rgba(0,0,0,0.08)",
                  background: "rgba(255,255,255,0.82)",
                  color: "#4b4b4b",
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <X size={15} strokeWidth={2} />
              </button>
            </div>
          </header>

          <div
            ref={bodyRef}
            style={{
              position: "relative",
              zIndex: 1,
              flex: 1,
              overflowY: "auto",
              background: "#faf7f4",
              padding: "14px 14px 4px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {messages.length === 0 && (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #ece7e2",
                  borderRadius: 10,
                  padding: "12px 14px",
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: "#333",
                }}
              >
                <p style={{ margin: 0, fontWeight: 700, color: "#161616" }}>Hi — what can we help with?</p>
                <p style={{ margin: "6px 0 0", color: "#555" }}>
                  We cover AFSS, monthly inspections, smoke alarms, sprinklers, extinguishers, fire
                  consultancy, and more across Greater Sydney.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void sendMessage(prompt)}
                      style={{
                        fontSize: 11.5,
                        fontWeight: 600,
                        color: "#fb5614",
                        background: "#fff5f0",
                        border: "1px solid #fbd9c5",
                        borderRadius: 999,
                        padding: "6px 10px",
                        cursor: "pointer",
                      }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              const isPlaceholder = !isUser && msg.content === "" && idx === messages.length - 1 && isStreaming;
              return (
                <div
                  key={idx}
                  style={{
                    alignSelf: isUser ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                    background: isUser ? "#fb5614" : "#fff",
                    color: isUser ? "#fff" : "#222",
                    border: isUser ? "none" : "1px solid #ece7e2",
                    borderRadius: 12,
                    padding: "9px 12px",
                    fontSize: 13.5,
                    lineHeight: 1.5,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    boxShadow: isUser ? "0 4px 12px rgba(251,86,20,0.18)" : "none",
                  }}
                >
                  {isPlaceholder ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#777" }}>
                      <Loader size={14} className="chatbot-spin" />
                      Thinking…
                    </span>
                  ) : (
                    msg.content
                  )}
                </div>
              );
            })}

            {error && (
              <div
                role="alert"
                style={{
                  background: "#fff4f0",
                  border: "1px solid #fbd9c5",
                  color: "#a3320d",
                  borderRadius: 10,
                  padding: "8px 12px",
                  fontSize: 12.5,
                  lineHeight: 1.5,
                }}
              >
                {error}
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            style={{
              position: "relative",
              zIndex: 1,
              background: "#fff",
              borderTop: "1px solid #ece7e2",
              padding: "10px 12px",
              display: "flex",
              alignItems: "flex-end",
              gap: 8,
              flexShrink: 0,
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Type your question…"
              aria-label="Message"
              style={{
                flex: 1,
                resize: "none",
                font: "inherit",
                fontSize: 13.5,
                lineHeight: 1.4,
                padding: "9px 11px",
                borderRadius: 10,
                border: "1px solid #e3ddd6",
                background: "#faf7f4",
                color: "#1a1a1a",
                outline: "none",
                maxHeight: 120,
                minHeight: 38,
              }}
              onFocus={(event) => {
                event.currentTarget.style.borderColor = "#fb5614";
              }}
              onBlur={(event) => {
                event.currentTarget.style.borderColor = "#e3ddd6";
              }}
            />
            <button
              type="submit"
              disabled={isStreaming || input.trim().length === 0}
              aria-label="Send message"
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                border: "none",
                background: input.trim().length === 0 || isStreaming ? "#f3c8b3" : "#fb5614",
                color: "#fff",
                display: "grid",
                placeItems: "center",
                cursor: input.trim().length === 0 || isStreaming ? "not-allowed" : "pointer",
                flexShrink: 0,
              }}
            >
              {isStreaming ? <Loader size={16} className="chatbot-spin" /> : <Send size={16} strokeWidth={2.2} />}
            </button>
          </form>

          <footer
            style={{
              position: "relative",
              zIndex: 1,
              background: "#fff",
              borderTop: "1px solid #ece7e2",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                padding: "8px 14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0 }}>
                <MapPin size={12} color="#fb5614" strokeWidth={2.5} />
                <span
                  style={{
                    fontSize: 10.5,
                    color: "#777",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  Greater Sydney
                </span>
              </div>
              <a
                href="tel:1300765594"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  textDecoration: "none",
                  color: "#fb5614",
                  flexShrink: 0,
                }}
              >
                <Phone size={12} strokeWidth={2.5} />
                <span style={{ fontSize: 11.5, fontWeight: 750 }}>1300 765 594</span>
              </a>
            </div>
          </footer>
        </section>
      )}

      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Ask Flame from ALLFIRE"
          style={{
            position: "relative",
            overflow: "hidden",
            background: "#fff",
            border: "1px solid #ece7e2",
            borderRadius: 8,
            padding: "10px 14px 10px 12px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
            boxShadow: "0 10px 28px rgba(18,18,18,0.14)",
            minWidth: 170,
          }}
        >
          <BrandCorner compact />
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "#fff5f0",
              color: "#fb5614",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              position: "relative",
              zIndex: 1,
            }}
          >
            <MessageCircle size={18} strokeWidth={2.3} />
          </span>
          <span style={{ position: "relative", zIndex: 1, textAlign: "left" }}>
            <span style={{ display: "block", margin: 0, fontSize: 11, fontWeight: 750, color: "#171717", lineHeight: 1.1 }}>
              Ask Flame<br />from ALLFIRE
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
