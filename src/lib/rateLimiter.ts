/**
 * In-Memory Sliding-Window Rate Limiter & Attack Mitigation Guard.
 * Zero database overhead for clean traffic; fast LRU-style map expiration.
 */

interface RequestRecord {
  timestamps: number[];
  strikes: number;
  blockedUntil?: number;
}

// In-memory rate limiting state
const ipRequestMap = new Map<string, RequestRecord>();

// Cache for DB-configured blacklists & attack mode (refreshed every 15s)
let cachedUnderAttackMode = false;
let cachedBlacklist = new Set<string>();
let cachedWhitelist = new Set<string>();
let lastConfigSync = 0;

const SUSPICIOUS_BOT_USER_AGENTS = [
  /curl\//i,
  /wget\//i,
  /python-requests/i,
  /scrapy/i,
  /aiohttp/i,
  /httpclient/i,
  /go-http-client/i,
  /postmanruntime/i,
  /headlesschrome/i,
  /phantomjs/i,
];

/**
 * Extracts normalized client IP from request headers.
 */
export function extractClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const ips = forwarded.split(",").map((ip) => ip.trim());
    if (ips[0]) return ips[0];
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();
  return "127.0.0.1";
}

export function syncSecurityCache(config: {
  underAttackMode: boolean;
  blacklistedIps: Array<{ ip: string }>;
  whitelistedIps: Array<{ ip: string }>;
}) {
  cachedUnderAttackMode = config.underAttackMode;
  cachedBlacklist = new Set(config.blacklistedIps.map((b) => b.ip.trim()));
  cachedWhitelist = new Set(config.whitelistedIps.map((w) => w.ip.trim()));
  lastConfigSync = Date.now();
}

export function shouldSyncConfig(): boolean {
  return Date.now() - lastConfigSync > 15000;
}

export interface SecurityCheckResult {
  allowed: boolean;
  statusCode?: 403 | 429;
  reason?: string;
  retryAfterSeconds?: number;
  isBot?: boolean;
}

/**
 * Validates an incoming request against blacklist, rate limiters, and bot detectors.
 */
export function checkRequestRateLimit({
  ip,
  endpoint,
  userAgent = "",
  rateLimitPerMinute = 60,
  authRateLimitPer10Min = 5,
  autoBanThreshold = 3,
  autoBanDurationMinutes = 60,
}: {
  ip: string;
  endpoint: string;
  userAgent?: string;
  rateLimitPerMinute?: number;
  authRateLimitPer10Min?: number;
  autoBanThreshold?: number;
  autoBanDurationMinutes?: number;
}): SecurityCheckResult {
  const now = Date.now();

  // 1. Check Whitelist (immediate pass)
  if (cachedWhitelist.has(ip) || ip === "127.0.0.1" || ip === "::1") {
    return { allowed: true };
  }

  // 2. Check Static Blacklist
  if (cachedBlacklist.has(ip)) {
    return {
      allowed: false,
      statusCode: 403,
      reason: "IP is permanently blacklisted by administrator",
    };
  }

  // 3. Check Under Attack Mode & Suspicious Scrapers
  if (cachedUnderAttackMode) {
    const isBot = SUSPICIOUS_BOT_USER_AGENTS.some((regex) =>
      regex.test(userAgent),
    );
    if (isBot) {
      return {
        allowed: false,
        statusCode: 403,
        reason: "Automated scraper blocked under High-Shield Attack Mode",
        isBot: true,
      };
    }
    // Under attack mode lowers limit by 50%
    rateLimitPerMinute = Math.max(20, Math.floor(rateLimitPerMinute / 2));
  }

  // 4. Retrieve or initialize IP record
  let record = ipRequestMap.get(ip);
  if (!record) {
    record = { timestamps: [], strikes: 0 };
    ipRequestMap.set(ip, record);
  }

  // Check if currently jailed / auto-banned
  if (record.blockedUntil && record.blockedUntil > now) {
    const remainingSeconds = Math.ceil((record.blockedUntil - now) / 1000);
    return {
      allowed: false,
      statusCode: 429,
      reason: `IP temporarily quarantined due to repeated violations. Try again in ${remainingSeconds}s.`,
      retryAfterSeconds: remainingSeconds,
    };
  }

  // Determine window & max count based on route type
  const isAuthOrContact =
    endpoint.includes("/auth/") ||
    endpoint.includes("/contact") ||
    endpoint.includes("/admin/change-password") ||
    endpoint.includes("/admin/send-password-otp");

  const windowMs = isAuthOrContact ? 10 * 60 * 1000 : 60 * 1000;
  const maxAllowed = isAuthOrContact
    ? authRateLimitPer10Min
    : rateLimitPerMinute;

  // Sliding window filter
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= maxAllowed) {
    record.strikes += 1;

    // Trigger Auto-Ban jail if strikes exceed threshold
    if (record.strikes >= autoBanThreshold) {
      record.blockedUntil = now + autoBanDurationMinutes * 60 * 1000;
      const banSeconds = autoBanDurationMinutes * 60;
      return {
        allowed: false,
        statusCode: 429,
        reason: `DDoS Protection Triggered: IP auto-banned for ${autoBanDurationMinutes}m due to ${record.strikes} rapid violations.`,
        retryAfterSeconds: banSeconds,
      };
    }

    return {
      allowed: false,
      statusCode: 429,
      reason: isAuthOrContact
        ? "Too many authentication/contact attempts. Please wait 10 minutes."
        : "Rate limit exceeded (Too Many Requests). Please slow down.",
      retryAfterSeconds: Math.ceil((windowMs - (now - record.timestamps[0])) / 1000),
    };
  }

  // Record legitimate hit
  record.timestamps.push(now);

  // Periodically clean stale records from memory every 1,000 entries
  if (ipRequestMap.size > 1000) {
    for (const [key, val] of ipRequestMap.entries()) {
      if (val.timestamps.length === 0 && (!val.blockedUntil || val.blockedUntil < now)) {
        ipRequestMap.delete(key);
      }
    }
  }

  return { allowed: true };
}
