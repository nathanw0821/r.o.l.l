"use client";

import { useState, useEffect } from "react";

const GUEST_UUID_KEY = "roll-guest-uuid";

export function useGuestIdentity() {
  const [guestUuid, setGuestUuid] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem(GUEST_UUID_KEY);
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (typeof window !== "undefined" && !guestUuid) {
      try {
        const newUuid = crypto.randomUUID();
        localStorage.setItem(GUEST_UUID_KEY, newUuid);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setGuestUuid(newUuid);
      } catch (error) {
        console.warn("Failed to generate guest UUID:", error);
      }
    }
  }, [guestUuid]);

  return guestUuid;
}
