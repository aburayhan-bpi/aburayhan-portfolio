"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function AnalyticsBeacon() {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    // Avoid tracking admin dashboard routes
    if (!pathname || pathname.startsWith("/dashboard")) return;
    if (lastTracked.current === pathname) return;
    lastTracked.current = pathname;
    startTimeRef.current = Date.now();

    const timeZone =
      typeof Intl !== "undefined"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : "";

    const initialPayload = JSON.stringify({
      path: pathname,
      referrer: typeof document !== "undefined" ? document.referrer || "Direct" : "Direct",
      timeZone,
      event: "pageview",
    });

    // 1. Initial Pageview Beacon
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([initialPayload], { type: "application/json" });
      navigator.sendBeacon("/api/v1/analytics/track", blob);
    } else {
      fetch("/api/v1/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: initialPayload,
        keepalive: true,
      }).catch(() => {});
    }

    // 2. Helper to dispatch session dwell time
    const sendDwellTime = () => {
      if (!startTimeRef.current) return;
      const durationSeconds = Math.max(
        1,
        Math.round((Date.now() - startTimeRef.current) / 1000),
      );
      const heartbeatPayload = JSON.stringify({
        path: pathname,
        durationSeconds,
        event: "heartbeat",
      });

      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        navigator.sendBeacon(
          "/api/v1/analytics/track",
          new Blob([heartbeatPayload], { type: "application/json" }),
        );
      }
    };

    // 3. Heartbeat on tab change or window close
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        sendDwellTime();
      }
    };

    const handleBeforeUnload = () => {
      sendDwellTime();
    };

    // 4. Periodic 30-second heartbeat for active reading
    const heartbeatTimer = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        sendDwellTime();
      }
    }, 30000);

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      sendDwellTime();
      clearInterval(heartbeatTimer);
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [pathname]);

  return null;
}

export default AnalyticsBeacon;
