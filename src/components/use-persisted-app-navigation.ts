"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

const STORAGE_KEY = "roll.app-nav-stack-v1";
const MAX_STACK = 200;

export type AppNavStackEntry = {
  path: string;
  scrollY: number;
};

function readPathKey(pathname: string) {
  if (typeof window === "undefined") {
    return pathname;
  }
  return `${pathname}${window.location.search}`;
}

function loadStack(): AppNavStackEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as { entries?: unknown };
    if (!Array.isArray(data.entries)) return [];
    return data.entries
      .filter(
        (e): e is AppNavStackEntry =>
          Boolean(e) && typeof e === "object" && typeof (e as AppNavStackEntry).path === "string"
      )
      .map((e) => ({
        path: e.path,
        scrollY: typeof e.scrollY === "number" && Number.isFinite(e.scrollY) ? e.scrollY : 0
      }))
      .slice(-MAX_STACK);
  } catch {
    return [];
  }
}

function saveStack(entries: AppNavStackEntry[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ entries: entries.slice(-MAX_STACK) }));
  } catch {
    /* storage full or disabled */
  }
}

export function usePersistedAppNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const stackRef = React.useRef<AppNavStackEntry[]>([]);
  const [stackSize, setStackSize] = React.useState(0);
  const prevPathKeyRef = React.useRef<string | null>(null);
  const goingBackRef = React.useRef(false);

  const bump = React.useCallback(() => {
    setStackSize(stackRef.current.length);
  }, []);

  React.useLayoutEffect(() => {
    const key = readPathKey(pathname);

    if (goingBackRef.current) {
      goingBackRef.current = false;
      const top = stackRef.current[stackRef.current.length - 1];
      const y = top?.scrollY ?? 0;
      window.scrollTo(0, y);
      prevPathKeyRef.current = key;
      return;
    }

    if (prevPathKeyRef.current === null) {
      const loaded = loadStack();
      let next: AppNavStackEntry[];
      if (loaded.length === 0) {
        next = [{ path: key, scrollY: 0 }];
      } else if (loaded[loaded.length - 1]!.path !== key) {
        next = [{ path: key, scrollY: 0 }];
      } else {
        next = loaded;
      }
      stackRef.current = next;
      saveStack(next);
      bump();
      const y = next[next.length - 1]?.scrollY ?? 0;
      window.scrollTo(0, y);
      prevPathKeyRef.current = key;
      return;
    }

    if (prevPathKeyRef.current === key) {
      return;
    }

    const prevKey = prevPathKeyRef.current;
    const scrollY = window.scrollY;
    let base = stackRef.current;
    const top = base[base.length - 1];
    const parent = base.length >= 2 ? base[base.length - 2] : null;

    if (top && parent && top.path === prevKey && parent.path === key) {
      const updated = base.map((e, i) => (i === base.length - 1 ? { ...e, scrollY } : e));
      const trimmed = updated.slice(0, -1);
      stackRef.current = trimmed;
      saveStack(trimmed);
      bump();
      window.scrollTo(0, trimmed[trimmed.length - 1]?.scrollY ?? 0);
      prevPathKeyRef.current = key;
      return;
    }

    if (top && top.path === prevKey) {
      base = [...base.slice(0, -1), { ...top, scrollY }];
    }

    const next = [...base, { path: key, scrollY: 0 }];
    stackRef.current = next;
    saveStack(next);
    bump();
    window.scrollTo(0, 0);
    prevPathKeyRef.current = key;
  }, [pathname, bump]);

  React.useEffect(() => {
    const key = readPathKey(pathname);
    let frame = 0;
    const flush = () => {
      frame = 0;
      const top = stackRef.current[stackRef.current.length - 1];
      if (!top || top.path !== key) return;
      top.scrollY = window.scrollY;
      saveStack(stackRef.current);
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(flush);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [pathname]);

  const goBack = React.useCallback(() => {
    const current = stackRef.current;
    if (current.length < 2) return;

    const withLeavingScroll = current.map((e, i) =>
      i === current.length - 1 ? { ...e, scrollY: window.scrollY } : e
    );
    const next = withLeavingScroll.slice(0, -1);
    const dest = next[next.length - 1];
    if (!dest) return;

    goingBackRef.current = true;
    stackRef.current = next;
    saveStack(next);
    bump();
    router.replace(dest.path);
  }, [router, bump]);

  const canGoBack = stackSize > 1;

  return { canGoBack, goBack };
}
