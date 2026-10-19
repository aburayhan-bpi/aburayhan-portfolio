import connectToDatabase from "@/lib/db";
import { resolveDeviceModel } from "@/lib/deviceResolver";
import Analytics from "@/models/Analytics";
import crypto from "crypto";
import { UAParser } from "ua-parser-js";

const HASH_SALT = process.env.ANALYTICS_SALT || "rayhan-portfolio-analytics-salt-2026";

/**
 * Creates a privacy-friendly, one-way SHA-256 hash.
 * Used for unique human calculation per calendar date.
 */
export function generateVisitorHash(
  ip: string,
  userAgent: string,
  dateStr: string,
): string {
  return crypto
    .createHash("sha256")
    .update(`${ip}:${userAgent}:${dateStr}:${HASH_SALT}`)
    .digest("hex");
}

export function parseDevice(userAgent: string): "desktop" | "mobile" | "tablet" {
  try {
    const parser = new UAParser(userAgent);
    const type = parser.getResult().device.type;
    if (type === "tablet") return "tablet";
    if (type === "mobile") return "mobile";
    if (!type && /Android|iPhone|Mobile/i.test(userAgent)) return "mobile";
  } catch {}
  return "desktop";
}

export function parseBrowser(userAgent: string): string {
  try {
    const parser = new UAParser(userAgent);
    const name = parser.getResult().browser.name;
    if (name) return name;
  } catch {}
  return "Other";
}

export function parseOS(userAgent: string): string {
  try {
    const parser = new UAParser(userAgent);
    const name = parser.getResult().os.name;
    if (name) return name;
  } catch {}
  return "Other";
}

export function categorizeReferrer(rawReferrer: string): string {
  if (!rawReferrer || rawReferrer === "" || rawReferrer === "Direct") {
    return "Direct";
  }

  try {
    const url = new URL(rawReferrer);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");

    if (host.includes("linkedin.com") || host.includes("lnkd.in"))
      return "LinkedIn";
    if (host.includes("github.com")) return "GitHub";
    if (host.includes("google.")) return "Google";
    if (host.includes("twitter.com") || host.includes("x.com") || host.includes("t.co"))
      return "Twitter / X";
    if (host.includes("facebook.com") || host.includes("fb.com"))
      return "Facebook";
    if (host.includes("youtube.com")) return "YouTube";
    if (host.includes("reddit.com")) return "Reddit";

    return host;
  } catch {
    return "Direct";
  }
}

export interface TrackVisitorParams {
  ip: string;
  userAgent: string;
  path: string;
  referrer: string;
  country?: string;
  city?: string;
  durationSeconds?: number;
  event?: "pageview" | "heartbeat";
  deviceModel?: string;
  gpuRenderer?: string;
  screenWidth?: number;
  screenHeight?: number;
  devicePixelRatio?: number;
}

/**
 * Persists an inbound visitor beacon to MongoDB in daily aggregated format.
 */
export async function trackVisitorEvent({
  ip,
  userAgent,
  path = "/",
  referrer = "Direct",
  country = "Global",
  city = "",
  durationSeconds = 0,
  event = "pageview",
  deviceModel = "",
  gpuRenderer = "",
  screenWidth = 0,
  screenHeight = 0,
  devicePixelRatio = 1,
}: TrackVisitorParams) {
  try {
    await connectToDatabase();

    const todayStr = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
    const visitorHash = generateVisitorHash(ip, userAgent, todayStr);
    const device = parseDevice(userAgent);
    const cleanDeviceModel = resolveDeviceModel({
      userAgent,
      clientModel: deviceModel,
      gpuRenderer,
      screenWidth,
      screenHeight,
      devicePixelRatio,
    });
    const browser = parseBrowser(userAgent);
    const os = parseOS(userAgent);
    const cleanReferrer = categorizeReferrer(referrer);
    const cleanPath = path.startsWith("/") ? path : `/${path}`;

    let record = await Analytics.findOne({ date: todayStr });

    // Handle session duration heartbeat update
    if (event === "heartbeat" && durationSeconds > 0) {
      if (record) {
        record.totalDurationSeconds = (record.totalDurationSeconds || 0) + durationSeconds;
        // Update latest event matching this IP and path
        const matchingEvent = record.recentEvents.find(
          (e) => e.ip === ip && e.path === cleanPath,
        );
        if (matchingEvent) {
          matchingEvent.durationSeconds = Math.max(
            matchingEvent.durationSeconds || 0,
            durationSeconds,
          );
        }
        await record.save();
      }
      return { success: true, updatedHeartbeat: true };
    }

    if (!record) {
      record = new Analytics({
        date: todayStr,
        totalViews: 1,
        uniqueVisitors: 1,
        totalDurationSeconds: Math.max(durationSeconds, 0),
        visitorHashes: [visitorHash],
        referrers: new Map([[cleanReferrer, 1]]),
        devices: {
          desktop: device === "desktop" ? 1 : 0,
          mobile: device === "mobile" ? 1 : 0,
          tablet: device === "tablet" ? 1 : 0,
        },
        browsers: new Map([[browser, 1]]),
        operatingSystems: new Map([[os, 1]]),
        pages: new Map([[cleanPath, 1]]),
        recentEvents: [
          {
            timestamp: new Date(),
            ip,
            path: cleanPath,
            referrer: cleanReferrer,
            device,
            deviceModel: cleanDeviceModel,
            browser,
            os,
            country,
            city,
            durationSeconds: Math.max(durationSeconds, 0),
          },
        ],
      });
      await record.save();
      return { success: true, isNewUnique: true };
    }

    // Increment Total Views
    record.totalViews += 1;

    // Check Unique Visitor
    let isNewUnique = false;
    if (!record.visitorHashes.includes(visitorHash)) {
      record.uniqueVisitors += 1;
      record.visitorHashes.push(visitorHash);
      isNewUnique = true;
    }

    // Increment Device
    if (device === "desktop") record.devices.desktop = (record.devices.desktop || 0) + 1;
    else if (device === "mobile") record.devices.mobile = (record.devices.mobile || 0) + 1;
    else if (device === "tablet") record.devices.tablet = (record.devices.tablet || 0) + 1;

    // Increment Browser
    if (!record.browsers) record.browsers = new Map();
    const currentBrowserCount = record.browsers.get(browser) || 0;
    record.browsers.set(browser, currentBrowserCount + 1);

    // Increment OS
    if (!record.operatingSystems) record.operatingSystems = new Map();
    const currentOsCount = record.operatingSystems.get(os) || 0;
    record.operatingSystems.set(os, currentOsCount + 1);

    // Increment Referrer
    if (!record.referrers) record.referrers = new Map();
    const currentRef = record.referrers.get(cleanReferrer) || 0;
    record.referrers.set(cleanReferrer, currentRef + 1);

    // Increment Page
    if (!record.pages) record.pages = new Map();
    const currentPages = record.pages.get(cleanPath) || 0;
    record.pages.set(cleanPath, currentPages + 1);

    // Append to Recent Events Stream (Cap at 100)
    record.recentEvents.unshift({
      timestamp: new Date(),
      ip,
      path: cleanPath,
      referrer: cleanReferrer,
      device,
      deviceModel: cleanDeviceModel,
      browser,
      os,
      country,
      city,
      durationSeconds: Math.max(durationSeconds, 0),
    });

    if (record.recentEvents.length > 100) {
      record.recentEvents = record.recentEvents.slice(0, 100);
    }

    await record.save();
    return { success: true, isNewUnique };
  } catch (error) {
    console.error("Failed to track visitor event:", error);
    return { success: false, error };
  }
}
