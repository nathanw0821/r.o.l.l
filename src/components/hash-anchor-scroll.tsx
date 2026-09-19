"use client";

import * as React from "react";

/**
 * Scrolls to the element named by `location.hash` once the page has mounted. A full load does this
 * natively, but a client-side navigation into the page (e.g. a guide link to /wiki/glossary#evade)
 * lands at the top; this closes that gap. Renders nothing.
 */
export default function HashAnchorScroll() {
  React.useEffect(() => {
    const id = decodeURIComponent(window.location.hash.replace(/^#/, ""));
    if (!id) return;
    const frame = requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  return null;
}
