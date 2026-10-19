"use client";

import { resolveDeviceModel } from "@/lib/deviceResolver";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

function getWebGLRenderer(): string {
  if (typeof window === "undefined") return "";
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    if (!gl) return "";

    const webgl = gl as WebGLRenderingContext;
    const ext = webgl.getExtension("WEBGL_debug_renderer_info");
    if (ext) {
      // 0x9246 = UNMASKED_RENDERER_WEBGL
      const unmasked = webgl.getParameter(ext.UNMASKED_RENDERER_WEBGL || 0x9246);
      if (typeof unmasked === "string" && unmasked.trim()) {
        return unmasked.trim();
      }
    }

    // 0x1F01 is the standard WebGL RENDERER constant
    const standard = webgl.getParameter(webgl.RENDERER || 0x1f01);
    if (typeof standard === "string" && standard.trim()) {
      return standard.trim();
    }
  } catch {}
  return "";
}

async function detectDeviceModelAsync(): Promise<{
  deviceModel: string;
  gpuRenderer: string;
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
}> {
  if (typeof window === "undefined") {
    return {
      deviceModel: "",
      gpuRenderer: "",
      screenWidth: 0,
      screenHeight: 0,
      devicePixelRatio: 1,
    };
  }

  const ua = navigator.userAgent || "";
  const screenWidth = window.screen.width || 0;
  const screenHeight = window.screen.height || 0;
  const devicePixelRatio = window.devicePixelRatio || 1;
  const gpuRenderer = getWebGLRenderer();

  let clientModel = "";

  // 1. High-Entropy User-Agent Client Hints (when running in HTTPS / supported browsers)
  try {
    const navAny = navigator as unknown as {
      userAgentData?: {
        getHighEntropyValues?: (hints: string[]) => Promise<{ model?: string; platform?: string }>;
      };
    };
    if (navAny.userAgentData && typeof navAny.userAgentData.getHighEntropyValues === "function") {
      const hints = await navAny.userAgentData.getHighEntropyValues(["model", "platform"]);
      if (hints?.model && hints.model.trim() && hints.model !== "K" && hints.model !== "Unknown") {
        clientModel = hints.model.trim();
      }
    }
  } catch {}

  // 2. High-precision hardware fingerprint resolution
  const resolved = resolveDeviceModel({
    userAgent: ua,
    clientModel,
    gpuRenderer,
    screenWidth,
    screenHeight,
    devicePixelRatio,
  });

  return {
    deviceModel: resolved,
    gpuRenderer,
    screenWidth,
    screenHeight,
    devicePixelRatio,
  };
}

export function AnalyticsBeacon() {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);
  const startTimeRef = useRef<number>(0);
  const detectedModelRef = useRef<string>("");

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

    // Asynchronously detect hardware model and dispatch beacon
    detectDeviceModelAsync().then((telemetry) => {
      detectedModelRef.current = telemetry.deviceModel;

      const initialPayload = JSON.stringify({
        path: pathname,
        referrer: typeof document !== "undefined" ? document.referrer || "Direct" : "Direct",
        timeZone,
        deviceModel: telemetry.deviceModel,
        gpuRenderer: telemetry.gpuRenderer,
        screenWidth: telemetry.screenWidth,
        screenHeight: telemetry.screenHeight,
        devicePixelRatio: telemetry.devicePixelRatio,
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
    });

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
        deviceModel: detectedModelRef.current,
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
