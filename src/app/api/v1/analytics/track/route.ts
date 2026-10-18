import { trackVisitorEvent } from "@/lib/analyticsTracker";
import { resolveGeoLocation } from "@/lib/geoResolver";
import { checkRequestRateLimit, extractClientIp } from "@/lib/rateLimiter";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const ip = extractClientIp(request.headers);
    const userAgent = request.headers.get("user-agent") || "";

    // Rate limit check to prevent beacon flooding
    const rateCheck = checkRequestRateLimit({
      ip,
      endpoint: "/api/v1/analytics/track",
      userAgent,
      rateLimitPerMinute: 60,
    });

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, reason: rateCheck.reason },
        { status: rateCheck.statusCode || 429 },
      );
    }

    let body: {
      path?: string;
      referrer?: string;
      durationSeconds?: number;
      event?: "pageview" | "heartbeat";
      timeZone?: string;
    } = { path: "/", referrer: "Direct" };

    try {
      const text = await request.text();
      if (text && text.trim().length > 0) {
        body = JSON.parse(text);
      }
    } catch {
      // Fallback in case stream was already read
      try {
        body = await request.json();
      } catch {}
    }

    const {
      path = "/",
      referrer = "Direct",
      durationSeconds = 0,
      event = "pageview",
      timeZone = "",
    } = body;

    const headersCountry =
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("cf-ipcountry");
    const headersCity =
      request.headers.get("x-vercel-ip-city") ||
      request.headers.get("cf-ipcity");

    const { country, city } = resolveGeoLocation({
      ip,
      headersCountry,
      headersCity,
      timeZone,
    });

    const result = await trackVisitorEvent({
      ip,
      userAgent,
      path,
      referrer,
      country,
      city,
      durationSeconds: Number(durationSeconds || 0),
      event,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("POST /api/v1/analytics/track error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
