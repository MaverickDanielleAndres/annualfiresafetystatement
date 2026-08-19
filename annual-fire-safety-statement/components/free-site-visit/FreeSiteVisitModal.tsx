"use client";

import React from "react";
import {
  useFreeSiteVisitState,
  closeFreeSiteVisit,
} from "@/lib/free-site-visit/FreeSiteVisitStore";
import InstantQuoteModal from "../quote/InstantQuoteModal";

export default function FreeSiteVisitModal() {
  const visit = useFreeSiteVisitState();

  return (
    <InstantQuoteModal
      isOpen={visit.isOpen}
      onClose={closeFreeSiteVisit}
    />
  );
}
