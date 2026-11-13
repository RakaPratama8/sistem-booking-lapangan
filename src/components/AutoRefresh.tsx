"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Keeps the admin dashboard live: re-fetches server data on a timer while the tab is visible,
// and once as soon as the tab becomes visible again. Renders nothing.
export default function AutoRefresh({ intervalMs = 5000 }: { intervalMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const timer = setInterval(refresh, intervalMs);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router, intervalMs]);
  return null;
}
