/**
 * Intelligent Geo-Location & Country Resolution Service.
 * Combines CDN headers (Vercel / Cloudflare) with client-side TimeZone hints
 * and native ECMAScript Intl.DisplayNames to support ALL 249 countries on Earth with flags.
 */

let regionDisplayNames: Intl.DisplayNames | null = null;

export function getFlagEmoji(countryCode: string): string {
  if (!countryCode || !/^[A-Za-z]{2}$/.test(countryCode)) return "";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export function formatCountryWithFlag(rawCountry: string): string {
  if (!rawCountry || rawCountry === "Global") return "Global";
  if (rawCountry === "Localhost (Dev)") return "Bangladesh 🇧🇩 (Local Dev)";

  // If already formatted with an emoji flag, return as-is
  if (/\p{Extended_Pictographic}/u.test(rawCountry)) return rawCountry;

  const trimmed = rawCountry.trim().toUpperCase();

  // If 2-letter ISO country code (e.g., BD, US, DE, JP, AE, CA, etc.)
  if (/^[A-Z]{2}$/.test(trimmed)) {
    try {
      if (!regionDisplayNames && typeof Intl !== "undefined" && Intl.DisplayNames) {
        regionDisplayNames = new Intl.DisplayNames(["en"], { type: "region" });
      }
      const fullName = regionDisplayNames ? regionDisplayNames.of(trimmed) : trimmed;
      const flag = getFlagEmoji(trimmed);
      return `${fullName || trimmed} ${flag}`.trim();
    } catch {
      const flag = getFlagEmoji(trimmed);
      return `${trimmed} ${flag}`.trim();
    }
  }

  return rawCountry;
}

// Fallback dictionary for backwards compatibility
export const COUNTRY_NAMES: Record<string, string> = new Proxy(
  {},
  {
    get: (_, prop: string) => formatCountryWithFlag(prop),
  },
);

export function resolveGeoLocation({
  ip,
  headersCountry,
  headersCity,
  timeZone,
}: {
  ip: string;
  headersCountry?: string | null;
  headersCity?: string | null;
  timeZone?: string | null;
}): { country: string; city: string } {
  // 1. If Vercel or Cloudflare headers provide a valid production country code
  if (
    headersCountry &&
    headersCountry !== "Global" &&
    headersCountry !== "Localhost (Dev)" &&
    headersCountry.trim() !== ""
  ) {
    return {
      country: headersCountry.trim().toUpperCase(),
      city: (headersCity && headersCity.trim()) || "",
    };
  }

  // 2. High-accuracy timezone to country and city mapping
  if (timeZone) {
    const tz = timeZone.trim().toLowerCase();
    if (tz === "asia/dhaka") return { country: "BD", city: "Dhaka" };
    if (tz === "asia/kolkata" || tz === "asia/calcutta") return { country: "IN", city: "Kolkata" };
    if (tz === "asia/dubai") return { country: "AE", city: "Dubai" };
    if (tz === "asia/riyadh") return { country: "SA", city: "Riyadh" };
    if (tz === "asia/singapore") return { country: "SG", city: "Singapore" };
    if (tz === "asia/kuala_lumpur") return { country: "MY", city: "Kuala Lumpur" };
    if (tz === "asia/bangkok") return { country: "TH", city: "Bangkok" };
    if (tz === "asia/karachi") return { country: "PK", city: "Karachi" };
    if (tz === "asia/tokyo") return { country: "JP", city: "Tokyo" };
    if (tz === "asia/seoul") return { country: "KR", city: "Seoul" };
    if (tz === "europe/london") return { country: "GB", city: "London" };
    if (tz === "europe/berlin") return { country: "DE", city: "Berlin" };
    if (tz === "europe/paris") return { country: "FR", city: "Paris" };
    if (tz === "europe/amsterdam") return { country: "NL", city: "Amsterdam" };
    if (tz === "europe/dublin") return { country: "IE", city: "Dublin" };
    if (tz === "europe/rome") return { country: "IT", city: "Rome" };
    if (tz === "europe/madrid") return { country: "ES", city: "Madrid" };
    if (tz === "america/new_york") return { country: "US", city: "New York" };
    if (tz === "america/chicago") return { country: "US", city: "Chicago" };
    if (tz === "america/los_angeles") return { country: "US", city: "Los Angeles" };
    if (tz === "america/toronto") return { country: "CA", city: "Toronto" };
    if (tz === "australia/sydney") return { country: "AU", city: "Sydney" };

    if (timeZone.includes("/")) {
      const parts = timeZone.split("/");
      const cityGuess = parts[1]?.replace(/_/g, " ") || "";
      return { country: parts[0] || "Global", city: cityGuess };
    }
  }

  // 3. Localhost loopback fallback
  const isLocal =
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip === "localhost" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.");

  if (isLocal) {
    return { country: "BD", city: "Dhaka (Local Dev)" };
  }

  return { country: "Global", city: "" };
}
