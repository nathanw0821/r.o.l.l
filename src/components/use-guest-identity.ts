"use client";

import { useState, useEffect } from "react";

const GUEST_UUID_KEY = "roll-guest-uuid";

export function useGuestIdentity() {
  const [guestUuid, setGuestUuid] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedUuid = localStorage.getItem(GUEST_UUID_KEY);
      if (storedUuid) {
        setGuestUuid(storedUuid);
      } else {
        const newUuid = crypto.randomUUID();
        localStorage.setItem(GUEST_UUID_KEY, newUuid);
        setGuestUuid(newUuid);
      }
    } catch (error) {
      console.warn("Failed to manage guest UUID in localStorage:", error);
    }
  }, []);

  return guestUuid;
}
