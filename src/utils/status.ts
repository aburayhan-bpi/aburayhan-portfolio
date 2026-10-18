export interface StatusConfig {
  cleanText: string;
  dotColor: string;
  pingColor: string;
  textColor: string;
  badgeClass: string;
  shouldPing: boolean;
  type: "available" | "interviewing" | "consulting" | "booked";
}

/**
 * Parses raw availability status string and returns tailored semantic styles,
 * animations, and stripped typography without redundant emoji prefixes.
 */
export function getStatusConfig(rawStatus?: string): StatusConfig {
  const fallback = "Available for New Contracts & Roles";
  const raw = (rawStatus || fallback).trim();

  // Strip leading emojis or symbols (e.g. 🟢, 🔴, ⚡, 🚀, •, etc.)
  const cleanText = raw
    .replace(/^[\p{Emoji}\p{Extended_Pictographic}\uFE0F\u200D\s•\-–—]+/u, "")
    .trim() || fallback;

  const lower = raw.toLowerCase();

  // 1. Unavailable / Booked
  if (
    lower.includes("booked") ||
    lower.includes("unavailable") ||
    lower.includes("busy") ||
    lower.includes("closed")
  ) {
    return {
      cleanText,
      dotColor: "bg-rose-500",
      pingColor: "bg-rose-500",
      textColor: "text-rose-400",
      badgeClass: "border-rose-500/30 bg-rose-500/10 text-rose-400",
      shouldPing: false, // Solid dot indicates committed/unavailable
      type: "booked",
    };
  }

  // 2. Actively Interviewing / Exploring
  if (
    lower.includes("interview") ||
    lower.includes("exploring") ||
    lower.includes("offers")
  ) {
    return {
      cleanText,
      dotColor: "bg-sky-500",
      pingColor: "bg-sky-500",
      textColor: "text-sky-400",
      badgeClass: "border-sky-500/30 bg-sky-500/10 text-sky-400",
      shouldPing: true,
      type: "interviewing",
    };
  }

  // 3. Freelance / Consulting
  if (
    lower.includes("freelance") ||
    lower.includes("consult") ||
    lower.includes("part-time") ||
    lower.includes("contract only")
  ) {
    return {
      cleanText,
      dotColor: "bg-amber-500",
      pingColor: "bg-amber-500",
      textColor: "text-amber-400",
      badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-400",
      shouldPing: true,
      type: "consulting",
    };
  }

  // 4. Default: Available
  return {
    cleanText,
    dotColor: "bg-emerald-500",
    pingColor: "bg-emerald-500",
    textColor: "text-emerald-400",
    badgeClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    shouldPing: true,
    type: "available",
  };
}
