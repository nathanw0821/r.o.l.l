"use client";

import * as React from "react";

/** True while the document root carries data-density="compact". */
export function useDensityCompact() {
  const [compact, setCompact] = React.useState(false);
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const read = () =>
      setCompact(root.getAttribute("data-density") === "compact");
    read();
    const obs = new MutationObserver(read);
    obs.observe(root, { attributes: true, attributeFilter: ["data-density"] });
    return () => obs.disconnect();
  }, []);
  return compact;
}
