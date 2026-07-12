import { useEffect } from "react";
import { useSession } from "next-auth/react";

export function useVisitorTracking() {
  const { status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    const todayStr = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
    const type = status === "authenticated" ? "user" : "guest";
    const storageKey = type === "user" ? "roll_last_unique_user" : "roll_last_unique_guest";

    const lastVisit = localStorage.getItem(storageKey);
    if (lastVisit !== todayStr) {
      fetch("/api/analytics/ping", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type }),
      })
        .then((res) => {
          if (res.ok) {
            localStorage.setItem(storageKey, todayStr);
          }
        })
        .catch((err) => {
          console.error("Failed to submit analytics ping:", err);
        });
    }
  }, [status]);
}
