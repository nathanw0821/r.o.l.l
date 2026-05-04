"use client";

import * as React from "react";
import { subscribeToAchievements } from "@/lib/achievement-events";
import { AchievementToast, type ToastItem } from "@/components/achievement-toast";

export function AchievementProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  React.useEffect(() => {
    return subscribeToAchievements(({ achievement }) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, achievement }]);
    });
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <AchievementToast 
              achievement={toast.achievement} 
              onClose={() => removeToast(toast.id)} 
            />
          </div>
        ))}
      </div>
    </>
  );
}
