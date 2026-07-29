"use client";

import * as React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    if (error?.message && !error.message.includes("aborted")) {
      console.error("[Global Error]", error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#080b0e] text-[#eef7f5] flex items-center justify-center p-6 font-mono">
        <div className="max-w-md w-full rounded-2xl border border-[#2b3945] bg-[#12181d] p-8 text-center space-y-5 shadow-2xl">
          <h2 className="text-xl font-bold uppercase text-[#f3a24d]">System Notice</h2>
          <p className="text-xs text-[#8ba6a0] leading-relaxed">
            The browser session was interrupted. Click to reload the active view.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="px-6 py-2.5 rounded-lg bg-[#f3a24d] text-[#080b0e] font-bold text-xs uppercase tracking-wider hover:opacity-90 transition"
          >
            Reload Page
          </button>
        </div>
      </body>
    </html>
  );
}
