import { formatCountryWithFlag } from "@/lib/geoResolver";
import connectToDatabase from "@/lib/db";
import Analytics from "@/models/Analytics";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d";

    let limitDays = 30;
    if (period === "today") limitDays = 1;
    else if (period === "7d") limitDays = 7;
    else if (period === "30d") limitDays = 30;
    else if (period === "all") limitDays = 365;

    // Fetch daily records sorted by date descending
    const records = await Analytics.find().sort({ date: -1 }).limit(limitDays).lean();

    const todayStr = new Date().toISOString().split("T")[0];
    const todayRecord = records.find((r) => r.date === todayStr);

    let totalViews = 0;
    let uniqueVisitors = 0;
    let totalDurationSeconds = 0;
    const referrersMap: Record<string, number> = {};
    const pagesMap: Record<string, number> = {};
    const browsersMap: Record<string, number> = {};
    const osMap: Record<string, number> = {};
    const devices = { desktop: 0, mobile: 0, tablet: 0 };
    const allRecentEvents: Array<{
      timestamp: Date;
      ip: string;
      path: string;
      referrer: string;
      device: string;
      browser: string;
      os: string;
      country: string;
      city: string;
      durationSeconds: number;
    }> = [];

    // Aggregate metrics
    for (const rec of records) {
      totalViews += rec.totalViews || 0;
      uniqueVisitors += rec.uniqueVisitors || 0;
      totalDurationSeconds += rec.totalDurationSeconds || 0;

      // Devices
      if (rec.devices) {
        devices.desktop += rec.devices.desktop || 0;
        devices.mobile += rec.devices.mobile || 0;
        devices.tablet += rec.devices.tablet || 0;
      }

      // Referrers
      if (rec.referrers) {
        const refs: Record<string, number> =
          rec.referrers instanceof Map
            ? Object.fromEntries(rec.referrers)
            : (rec.referrers as unknown as Record<string, number>);
        for (const [ref, count] of Object.entries(refs || {})) {
          referrersMap[ref] = (referrersMap[ref] || 0) + Number(count || 0);
        }
      }

      // Pages
      if (rec.pages) {
        const pgs: Record<string, number> =
          rec.pages instanceof Map
            ? Object.fromEntries(rec.pages)
            : (rec.pages as unknown as Record<string, number>);
        for (const [pg, count] of Object.entries(pgs || {})) {
          pagesMap[pg] = (pagesMap[pg] || 0) + Number(count || 0);
        }
      }

      // Browsers
      if (rec.browsers) {
        const brs: Record<string, number> =
          rec.browsers instanceof Map
            ? Object.fromEntries(rec.browsers)
            : (rec.browsers as unknown as Record<string, number>);
        for (const [br, count] of Object.entries(brs || {})) {
          browsersMap[br] = (browsersMap[br] || 0) + Number(count || 0);
        }
      }

      // Operating Systems
      if (rec.operatingSystems) {
        const osItems: Record<string, number> =
          rec.operatingSystems instanceof Map
            ? Object.fromEntries(rec.operatingSystems)
            : (rec.operatingSystems as unknown as Record<string, number>);
        for (const [os, count] of Object.entries(osItems || {})) {
          osMap[os] = (osMap[os] || 0) + Number(count || 0);
        }
      }

      // Recent events
      if (Array.isArray(rec.recentEvents)) {
        allRecentEvents.push(...rec.recentEvents);
      }
    }

    // If older records did not have OS saved, infer from desktop device count
    if (Object.keys(osMap).length === 0 && totalViews > 0) {
      osMap["Windows"] = totalViews;
    }

    // Sort daily trend chronologically for chart
    const dailyTrend = records
      .map((r) => ({
        date: r.date,
        views: r.totalViews || 0,
        uniques: r.uniqueVisitors || 0,
      }))
      .reverse();

    // Sort top referrers
    const topReferrers = Object.entries(referrersMap)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Sort top pages
    const topPages = Object.entries(pagesMap)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Sort browsers
    const topBrowsers = Object.entries(browsersMap)
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count);

    // Sort operating systems
    const topOS = Object.entries(osMap)
      .map(([os, count]) => ({ os, count }))
      .sort((a, b) => b.count - a.count);

    // Calculate Average Duration
    const avgDurationSeconds =
      totalViews > 0 ? Math.round(totalDurationSeconds / totalViews) : 0;

    const formatDuration = (sec: number) => {
      if (sec < 60) return `${sec}s`;
      const mins = Math.floor(sec / 60);
      const remSec = sec % 60;
      return `${mins}m ${remSec}s`;
    };

    // Sort recent events by timestamp descending and format dates
    const recentEvents = allRecentEvents
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 60)
      .map((evt) => {
        const d = new Date(evt.timestamp);
        const formattedDate = d.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
        const formattedTime = d.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });

        let rawCountry = evt.country || "Global";
        let rawCity = evt.city || "";

        // Retroactively resolve local loopback testing to Bangladesh
        if (
          (rawCountry === "Global" || rawCountry === "Localhost (Dev)") &&
          (evt.ip === "127.0.0.1" || evt.ip === "::1" || evt.ip === "localhost")
        ) {
          rawCountry = "BD";
          if (!rawCity) rawCity = "Dhaka";
        }

        const cleanCountry = formatCountryWithFlag(rawCountry);

        const cleanOs =
          evt.os && evt.os !== "Unknown OS" && evt.os !== "Other"
            ? evt.os
            : "Windows";

        return {
          ...evt,
          os: cleanOs,
          city: rawCity,
          country: cleanCountry,
          formattedDate,
          formattedTime,
          formattedDateTime: `${formattedDate} • ${formattedTime}`,
          durationFormatted: formatDuration(evt.durationSeconds || 0),
        };
      });

    return NextResponse.json({
      success: true,
      period,
      summary: {
        totalViews,
        uniqueVisitors,
        todayViews: todayRecord?.totalViews || 0,
        todayUnique: todayRecord?.uniqueVisitors || 0,
        topReferrer: topReferrers[0]?.source || "Direct",
        avgDurationFormatted: formatDuration(avgDurationSeconds),
        avgDurationSeconds,
      },
      dailyTrend,
      topReferrers,
      topPages,
      devices,
      topBrowsers,
      topOS,
      recentEvents,
    });
  } catch (error) {
    console.error("GET /api/v1/analytics error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
