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
      console.error("[Global Error Caught]", error);
    }
  }, [error]);

  const handleClearAndReload = () => {
    if (typeof window !== "undefined") {
      try {
        // Clear potential corrupted storage keys
        window.localStorage.removeItem("roll_local_progress");
        window.localStorage.removeItem("roll_user_progress");
        window.localStorage.removeItem("roll_progress");
        document.cookie = "roll_local_progress=; path=/; max-age=0";
      } catch {
        // ignore storage clear errors
      }
      window.location.href = "/";
    } else {
      reset();
    }
  };

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#080b0e] text-[#eef7f5] flex items-center justify-center p-6 font-mono">
        <div className="max-w-md w-full rounded-2xl border border-[#2b3945] bg-[#12181d] p-8 text-center space-y-5 shadow-2xl">
          <h2 className="text-xl font-bold uppercase text-[#f3a24d]">System Notice</h2>
          <p className="text-xs text-[#8ba6a0] leading-relaxed">
            The browser session encountered a layout sync issue. Click below to clear temporary state and reload.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleClearAndReload}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#f3a24d] text-[#080b0e] font-bold text-xs uppercase tracking-wider hover:opacity-90 transition cursor-pointer"
            >
              Reset Cache &amp; Reload
            </button>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") window.location.href = "/";
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-700 hover:text-white transition cursor-pointer"
            >
              Return Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
