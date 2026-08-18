"use client";

/**
 * FreeSiteVisitIsland — minimal footer island for the Free Site Visit modal,
 * mobile sticky CTA, and chatbot. Mounted at the very bottom of `<body>`
 * via `app/layout.tsx` so none of it contributes to the React tree above
 * the fold and none of it blocks hydration of the hero/navbar.
 *
 * Visibility/state is sourced from a module singleton
 * (`@/lib/free-site-visit/FreeSiteVisitStore`) instead of a React
 * Context — this means page buttons anywhere on the page can
 * `openFreeSiteVisit()` without being inside a `<Provider>` and without
 * their click being coupled to a provider boundary.
 */

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { openFreeSiteVisit, getFreeSiteVisitState } from "@/lib/free-site-visit/FreeSiteVisitStore";

const ChatbotDeferred = dynamic(
  () => import("@/components/ChatbotDeferred"),
  { ssr: false },
);
const FreeSiteVisitModal = dynamic(
  () => import("@/components/free-site-visit/FreeSiteVisitModal"),
  { ssr: false },
);
const FreeSiteVisitMobileSticky = dynamic(
  () => import("@/components/free-site-visit/FreeSiteVisitMobileSticky"),
  { ssr: false },
);

export default function FreeSiteVisitIsland() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (sessionStorage.getItem("fsv.session.submitted") === "1") return;
      if (sessionStorage.getItem("fsv.session.auto_shown") === "1") return;

      const timer = setTimeout(() => {
        if (!getFreeSiteVisitState().isOpen) {
          sessionStorage.setItem("fsv.session.auto_shown", "1");
          openFreeSiteVisit({ source: "auto_30s" });
        }
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      <FreeSiteVisitModal />
      <FreeSiteVisitMobileSticky />
      <ChatbotDeferred />
    </>
  );
}
