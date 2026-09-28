import * as React from "react";

/** True below the md breakpoint (phones). False on the server and on wider screens. */
export function useIsPhoneWidth() {
  return React.useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia("(max-width: 767px)");
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(max-width: 767px)").matches,
    () => false,
  );
}
