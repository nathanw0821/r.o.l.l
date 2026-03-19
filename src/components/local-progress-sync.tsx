"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLocalProgress } from "@/components/use-local-progress";

export default function LocalProgressSync() {
  const { data: session } = useSession();
  const router = useRouter();
  const { map, hasLocal, clear } = useLocalProgress();
  const syncedRef = React.useRef(false);

  React.useEffect(() => {
    if (!session || !hasLocal || syncedRef.current) return;
    const entries = Object.entries(map).map(([effectTierId, unlocked]) => ({
      effectTierId,
      unlocked
    }));
    if (entries.length === 0) return;
    syncedRef.current = true;

    fetch("/api/progress/sync-local", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ entries })
    })
      .then((res) => res.json())
      .then((payload) => {
        if (payload?.success) {
          clear();
          router.refresh();
        }
      })
      .catch(() => {
        syncedRef.current = false;
      });
  }, [session, hasLocal, map, clear, router]);

  return null;
}
