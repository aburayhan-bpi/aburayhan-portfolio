/**
 * Helper to dynamically resolve the active site domain / URL:
 * 1. Checks NEXT_PUBLIC_APP_URL or NEXT_PUBLIC_SITE_URL from .env
 * 2. Checks VERCEL_URL automatically injected by Vercel deployment
 * 3. Falls back to localhost in development
 */
export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && !envUrl.includes("localhost:3007")) {
    return envUrl.replace(/\/$/, "");
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}
