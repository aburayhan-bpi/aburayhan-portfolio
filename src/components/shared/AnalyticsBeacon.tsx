"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

function getClientDeviceModel(): string {
  if (typeof window === "undefined") return "";

  const ua = navigator.userAgent || "";
  const width = window.screen.width;
  const height = window.screen.height;
  const ratio = window.devicePixelRatio || 1;

  // iOS Resolution Detection
  if (/iPhone/i.test(ua)) {
    const min = Math.min(width, height) * ratio;
    const max = Math.max(width, height) * ratio;

    if (min === 1290 && max === 2796) return "iPhone 15/16 Pro Max";
    if (min === 1179 && max === 2556) return "iPhone 15/16 Pro";
    if (min === 1170 && max === 2532) return "iPhone 13/14 / 12";
    if (min === 1284 && max === 2778) return "iPhone 13/14 Pro Max";
    if (min === 1080 && max === 2340) return "iPhone 12/13 mini";
    if (min === 828 && max === 1792) return "iPhone 11 / XR";
    if (min === 1125 && max === 2436) return "iPhone X / XS / 11 Pro";
    if (min === 1242 && max === 2688) return "iPhone XS Max / 11 Pro Max";
    if (min === 750 && max === 1334) return "iPhone SE (Gen 2/3)";
    return "Apple iPhone";
  }

  if (/iPad/i.test(ua)) {
    return "Apple iPad";
  }

  // Android Model from UA
  if (/Android/i.test(ua)) {
    const androidMatch = ua.match(/Android\s+[^;]+;\s*([^;)]+?)(?:\s+Build|\)|;)/i);
    if (androidMatch && androidMatch[1]) {
      return androidMatch[1].trim();
    }
    return "Android Device";
  }

  if (/Macintosh|Mac OS X/i.test(ua)) return "Apple Mac";
  if (/Windows/i.test(ua)) return "Windows PC";
  if (/Linux/i.test(ua)) return "Linux PC";

  return "";
}

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

    const deviceModel = getClientDeviceModel();

    const initialPayload = JSON.stringify({
      path: pathname,
      referrer: typeof document !== "undefined" ? document.referrer || "Direct" : "Direct",
      timeZone,
      deviceModel,
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
