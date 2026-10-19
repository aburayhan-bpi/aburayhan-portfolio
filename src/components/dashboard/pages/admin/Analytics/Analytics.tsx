"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icons } from "@/utils/icons";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import {
  FaAndroid,
  FaApple,
  FaChrome,
  FaEdge,
  FaFirefoxBrowser,
  FaGithub,
  FaGoogle,
  FaLinkedin,
  FaLinux,
  FaOpera,
  FaSafari,
  FaTwitter,
  FaWindows,
  FaYoutube,
} from "react-icons/fa";
import { toast } from "sonner";

function getReferrerMeta(source?: string) {
  const s = (source || "").toLowerCase().trim();
  if (s.includes("linkedin")) {
    return {
      title: "LinkedIn",
      sub: "Professional Network",
      icon: <FaLinkedin className="w-4 h-4 text-[#0a66c2]" />,
    };
  }
  if (s.includes("github")) {
    return {
      title: "GitHub",
      sub: "Repositories & Profile",
      icon: <FaGithub className="w-4 h-4 text-foreground" />,
    };
  }
  if (s.includes("google")) {
    return {
      title: "Google Search",
      sub: "Organic Inbound Search",
      icon: <FaGoogle className="w-4 h-4 text-[#ea4335]" />,
    };
  }
  if (s.includes("twitter") || s.includes("x.com") || s === "x") {
    return {
      title: "X / Twitter",
      sub: "Social Feed Inbound",
      icon: <FaTwitter className="w-4 h-4 text-sky-400" />,
    };
  }
  if (s.includes("youtube")) {
    return {
      title: "YouTube",
      sub: "Video Referral Link",
      icon: <FaYoutube className="w-4 h-4 text-red-500" />,
    };
  }
  if (s === "direct" || s.includes("direct")) {
    return {
      title: "Direct Traffic",
      sub: "Bookmarks & Typed URLs",
      icon: <Icons.Globe className="w-4 h-4 text-emerald-400" />,
    };
  }
  if (s.includes("localhost") || s.includes("127.0.0.1")) {
    return {
      title: "Localhost",
      sub: "Local Dev Preview",
      icon: <Icons.Laptop className="w-4 h-4 text-amber-400" />,
    };
  }
  return {
    title: source || "External Referral",
    sub: "Inbound Web Link",
    icon: <Icons.Globe className="w-4 h-4 text-primary" />,
  };
}

function getContentMeta(path?: string) {
  const p = (path || "").trim();
  if (p === "/" || p === "") {
    return {
      title: "Home Portfolio",
      slug: "/",
      category: "Home",
      categoryStyle: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      icon: <Icons.Home className="w-3.5 h-3.5 text-indigo-400" />,
      href: "/",
    };
  }
  if (p === "/login") {
    return {
      title: "Sign In Workspace",
      slug: "/login",
      category: "Portal",
      categoryStyle: "bg-secondary text-muted-foreground border-border",
      icon: <Icons.Lock className="w-3.5 h-3.5 text-muted-foreground" />,
      href: "/login",
    };
  }
  if (p.startsWith("/projects/")) {
    const rawSlug = p.replace("/projects/", "").trim();
    const words = rawSlug.split("-").map((w) => {
      const lower = w.toLowerCase();
      if (lower === "erp") return "ERP";
      if (lower === "saas") return "SaaS";
      if (lower === "api") return "API";
      if (lower === "uaepl8") return "UAEPL8";
      return w.charAt(0).toUpperCase() + w.slice(1);
    });
    const formattedTitle = words.join(" ");

    return {
      title: formattedTitle || rawSlug,
      slug: p,
      category: "Project",
      categoryStyle: "bg-primary/10 text-primary border-primary/20",
      icon: <Icons.Code className="w-3.5 h-3.5 text-primary" />,
      href: p,
    };
  }
  if (p.startsWith("/blog/")) {
    const slug = p.replace("/blog/", "");
    const title = slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return {
      title: title || "Blog Post",
      slug: p,
      category: "Article",
      categoryStyle: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      icon: <Icons.FileText className="w-3.5 h-3.5 text-emerald-400" />,
      href: p,
    };
  }
  const cleaned = p
    .replace(/^\//, "")
    .split("/")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" / ");
  return {
    title: cleaned || p,
    slug: p,
    category: "Page",
    categoryStyle: "bg-secondary text-muted-foreground border-border",
    icon: <Icons.Globe className="w-3.5 h-3.5 text-muted-foreground" />,
    href: p,
  };
}

function getOsMeta(osName?: string) {
  const norm = (osName || "").toLowerCase();
  if (norm.includes("win")) {
    return {
      name: "Windows",
      icon: <FaWindows className="w-4 h-4 text-[#00adef]" />,
      color: "from-blue-500 to-cyan-500",
    };
  }
  if (norm.includes("android")) {
    return {
      name: "Android",
      icon: <FaAndroid className="w-4 h-4 text-[#3ddc84]" />,
      color: "from-emerald-500 to-green-400",
    };
  }
  if (
    norm.includes("mac") ||
    norm.includes("ios") ||
    norm.includes("apple") ||
    norm.includes("iphone") ||
    norm.includes("ipad")
  ) {
    return {
      name: osName || "Apple macOS/iOS",
      icon: <FaApple className="w-4 h-4 text-foreground" />,
      color: "from-slate-400 to-slate-200",
    };
  }
  if (norm.includes("linux") || norm.includes("ubuntu")) {
    return {
      name: "Linux",
      icon: <FaLinux className="w-4 h-4 text-[#fcc624]" />,
      color: "from-amber-500 to-yellow-400",
    };
  }
  return {
    name: osName || "Other OS",
    icon: <Icons.Monitor className="w-4 h-4 text-muted-foreground" />,
    color: "from-primary to-sky-400",
  };
}

function getBrowserMeta(browserName?: string) {
  const norm = (browserName || "").toLowerCase();
  if (
    norm.includes("chrome") &&
    !norm.includes("edge") &&
    !norm.includes("headless")
  ) {
    return {
      name: browserName,
      icon: <FaChrome className="w-4 h-4 text-[#4285F4]" />,
      color: "from-blue-500 to-emerald-400",
    };
  }
  if (norm.includes("safari")) {
    return {
      name: browserName,
      icon: <FaSafari className="w-4 h-4 text-[#006CFF]" />,
      color: "from-sky-500 to-blue-600",
    };
  }
  if (norm.includes("edge")) {
    return {
      name: "Microsoft Edge",
      icon: <FaEdge className="w-4 h-4 text-[#0078D7]" />,
      color: "from-teal-500 to-blue-500",
    };
  }
  if (norm.includes("firefox")) {
    return {
      name: "Mozilla Firefox",
      icon: <FaFirefoxBrowser className="w-4 h-4 text-[#FF7139]" />,
      color: "from-orange-500 to-amber-500",
    };
  }
  if (norm.includes("opera")) {
    return {
      name: "Opera",
      icon: <FaOpera className="w-4 h-4 text-[#FF1B2D]" />,
      color: "from-red-500 to-rose-400",
    };
  }
  if (norm.includes("headless") || norm.includes("bot")) {
    return {
      name: browserName,
      icon: <Icons.Code className="w-4 h-4 text-purple-400" />,
      color: "from-purple-500 to-indigo-500",
    };
  }
  return {
    name: browserName || "Other Browser",
    icon: <Icons.Globe className="w-4 h-4 text-muted-foreground" />,
    color: "from-emerald-500 to-teal-400",
  };
}

interface AnalyticsSummary {
  totalViews: number;
  uniqueVisitors: number;
  todayViews: number;
  todayUnique: number;
  topReferrer: string;
  avgDurationFormatted: string;
  avgDurationSeconds: number;
}

interface DailyTrendItem {
  date: string;
  views: number;
  uniques: number;
}

interface RankedItem {
  source?: string;
  path?: string;
  browser?: string;
  os?: string;
  count: number;
}

interface VisitorEventItem {
  timestamp: string;
  formattedDate?: string;
  formattedTime?: string;
  formattedDateTime: string;
  ip: string;
  path: string;
  referrer: string;
  device: "desktop" | "mobile" | "tablet" | "other";
  deviceModel?: string;
  browser: string;
  os: string;
  country: string;
  countryCode?: string;
  countryName?: string;
  city: string;
  durationSeconds: number;
  durationFormatted: string;
}

interface AnalyticsPagination {
  page: number;
  limit: number;
  totalEvents: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
}

interface AnalyticsData {
  period: string;
  pagination?: AnalyticsPagination;
  summary: AnalyticsSummary;
  dailyTrend: DailyTrendItem[];
  topReferrers: RankedItem[];
  topPages: RankedItem[];
  devices: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  topBrowsers: RankedItem[];
  topOS: RankedItem[];
  recentEvents: VisitorEventItem[];
}

export function Analytics() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Read URL parameters with reliable defaults
  const period =
    (searchParams.get("period") as "today" | "7d" | "30d" | "all") || "30d";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const limit = Math.max(
    1,
    Math.min(200, parseInt(searchParams.get("limit") || "10", 10) || 10),
  );
  const search = searchParams.get("search") || "";

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, startRefresh] = useTransition();

  // Local state for search input (synced during render to avoid effect cascades)
  const [prevSearch, setPrevSearch] = useState(search);
  const [searchInput, setSearchInput] = useState(search);

  if (search !== prevSearch) {
    setPrevSearch(search);
    setSearchInput(search);
  }

  // Local state for custom rows-per-page dropdown/input
  const [prevLimit, setPrevLimit] = useState(limit);
  const [isCustomLimit, setIsCustomLimit] = useState(
    ![10, 20, 25, 50, 100].includes(limit),
  );
  const [customLimitInput, setCustomLimitInput] = useState(String(limit));

  if (limit !== prevLimit) {
    setPrevLimit(limit);
    setIsCustomLimit(![10, 20, 25, 50, 100].includes(limit));
    setCustomLimitInput(String(limit));
  }

  // URL updater helper
  const updateUrl = useCallback(
    (updates: {
      page?: number;
      limit?: number;
      search?: string;
      period?: string;
    }) => {
      setIsLoading(true);
      const params = new URLSearchParams(searchParams.toString());

      if (updates.period !== undefined) {
        if (updates.period === "30d") params.delete("period");
        else params.set("period", updates.period);
      }

      if (updates.page !== undefined) {
        if (updates.page <= 1) params.delete("page");
        else params.set("page", String(updates.page));
      }

      if (updates.limit !== undefined) {
        if (updates.limit === 10) params.delete("limit");
        else params.set("limit", String(updates.limit));
      }

      if (updates.search !== undefined) {
        const trimmed = updates.search.trim();
        if (!trimmed) params.delete("search");
        else params.set("search", trimmed);
      }

      const queryString = params.toString();
      router.replace(`${pathname}${queryString ? `?${queryString}` : ""}`, {
        scroll: false,
      });
    },
    [searchParams, pathname, router],
  );

  // Debounce search input to URL
  useEffect(() => {
    if (searchInput === search) return;
    const timer = setTimeout(() => {
      updateUrl({ search: searchInput, page: 1 });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, search, updateUrl]);

  // Fetch from backend API whenever query parameters change
  useEffect(() => {
    let ignore = false;

    const query = new URLSearchParams();
    if (period) query.set("period", period);
    if (page > 1) query.set("page", String(page));
    if (limit !== 10) query.set("limit", String(limit));
    if (search.trim()) query.set("search", search.trim());

    fetch(`/api/v1/analytics?${query.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        if (!ignore) {
          if (json?.success) {
            setData(json);
          } else {
            toast.error(json?.error || "Failed to load visitor analytics");
          }
        }
      })
      .catch(() => {
        if (!ignore) toast.error("Network error fetching analytics data");
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [period, page, limit, search]);

  const handleManualRefresh = () => {
    startRefresh(async () => {
      try {
        const query = new URLSearchParams();
        if (period) query.set("period", period);
        if (page > 1) query.set("page", String(page));
        if (limit !== 10) query.set("limit", String(limit));
        if (search.trim()) query.set("search", search.trim());

        const res = await fetch(`/api/v1/analytics?${query.toString()}`);
        const json = await res.json();
        if (json?.success) {
          setData(json);
          toast.success("Visitor telemetry refreshed");
        }
      } catch {
        toast.error("Network error refreshing analytics");
      }
    });
  };

  const handleApplyCustomLimit = () => {
    const parsed = parseInt(customLimitInput, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 200) {
      updateUrl({ limit: parsed, page: 1 });
      toast.success(`Showing ${parsed} rows per page`);
    } else {
      toast.error("Please enter a valid limit between 1 and 200");
    }
  };

  const totalDeviceSum =
    (data?.devices.desktop || 0) +
      (data?.devices.mobile || 0) +
      (data?.devices.tablet || 0) || 1;

  const maxTrendViews = Math.max(
    ...(data?.dailyTrend?.map((t) => t.views) || [10]),
    1,
  );

  const totalEvents =
    data?.pagination?.totalEvents ?? (data?.recentEvents?.length || 0);
  const totalPages =
    data?.pagination?.totalPages ?? Math.max(1, Math.ceil(totalEvents / limit));
  const currentPage = data?.pagination?.page ?? page;
  const from = totalEvents === 0 ? 0 : (currentPage - 1) * limit + 1;
  const to = Math.min(currentPage * limit, totalEvents);
  const eventsList = data?.recentEvents || [];

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link
              href="/dashboard/admin"
              className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
            >
              Admin
            </Link>
            <span className="text-xs text-muted-foreground">/</span>
            <span className="text-xs font-mono text-primary font-medium">
              Telemetry
            </span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Visitor Intelligence &amp; Traffic Analytics
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Engine Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Privacy-first, cookieless first-party analytics engine with session
            dwell time &amp; project interest telemetry.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Period Selector */}
          <div className="flex items-center bg-secondary/80 border border-border rounded-xl p-1 text-xs font-mono">
            {(
              [
                { id: "today", label: "Today" },
                { id: "7d", label: "7 Days" },
                { id: "30d", label: "30 Days" },
                { id: "all", label: "All Time" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => updateUrl({ period: tab.id, page: 1 })}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
                  period === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing || isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-secondary text-foreground text-xs font-mono font-medium transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh analytics data"
          >
            <Icons.RefreshCw
              className={`w-3.5 h-3.5 text-primary ${
                isRefreshing || isLoading ? "animate-spin" : ""
              }`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Page Views */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-muted-foreground">
              Total Page Impressions
            </span>
            <span className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Icons.Eye className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-foreground font-mono">
              {isLoading
                ? "—"
                : data?.summary.totalViews.toLocaleString() || "0"}
            </span>
            <span className="ml-2 text-xs text-emerald-400 font-mono font-medium">
              Verified Hits
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Aggregated views across {period}
          </p>
        </div>

        {/* Metric 2: Unique Visitors */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-muted-foreground">
              Unique Visitors
            </span>
            <span className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Icons.Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-foreground font-mono">
              {isLoading
                ? "—"
                : data?.summary.uniqueVisitors.toLocaleString() || "0"}
            </span>
            <span className="ml-2 text-xs text-sky-400 font-mono font-medium">
              Distinct Humans
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            SHA-256 daily unique cryptographic hashes
          </p>
        </div>

        {/* Metric 3: Today's Live Velocity */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-muted-foreground">
              Today&apos;s Live Velocity
            </span>
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Icons.Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-foreground font-mono">
              {isLoading
                ? "—"
                : data?.summary.todayViews.toLocaleString() || "0"}
            </span>
            <span className="ml-2 text-xs text-emerald-400 font-mono font-medium">
              ({data?.summary.todayUnique || 0} unique)
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Hits logged during current 24h cycle
          </p>
        </div>

        {/* Metric 4: Average Session Duration */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-muted-foreground">
              Avg Time on Site
            </span>
            <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Icons.Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4 truncate">
            <span className="text-3xl font-extrabold text-foreground font-mono truncate block">
              {isLoading ? "—" : data?.summary.avgDurationFormatted || "0s"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2 truncate">
            Active reading &amp; navigation dwell time
          </p>
        </div>
      </div>

      {/* Visual Timeline Trend Chart */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h2 className="text-base font-bold text-foreground">
              Traffic Trend &amp; Growth Curve
            </h2>
            <p className="text-xs text-muted-foreground">
              Daily breakdown of total views vs unique visitors over selected
              period
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-primary" />
              <span className="text-muted-foreground">Total Views</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-sky-400" />
              <span className="text-muted-foreground">Unique Visitors</span>
            </span>
          </div>
        </div>

        {/* Bar Timeline */}
        {(!data?.dailyTrend || data.dailyTrend.length === 0) && !isLoading ? (
          <div className="py-16 text-center text-muted-foreground text-sm font-mono">
            No telemetry records logged yet for this period.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="h-64 flex items-end gap-2 pt-16 pb-2 px-3 border-b border-border/60 overflow-x-auto">
              {data?.dailyTrend.map((item, idx) => {
                const totalBars = data.dailyTrend.length;
                const isFirst = idx === 0;
                const isLast = idx === totalBars - 1 && totalBars > 3;
                const isNearStart = idx === 1 && totalBars > 6;
                const isNearEnd = idx === totalBars - 2 && totalBars > 6;

                const tooltipAlignClass = isFirst
                  ? "left-0 items-start"
                  : isLast
                    ? "right-0 items-end"
                    : isNearStart
                      ? "left-0 sm:left-1/2 sm:-translate-x-1/2 items-start sm:items-center"
                      : isNearEnd
                        ? "right-0 sm:left-1/2 sm:-translate-x-1/2 items-end sm:items-center"
                        : "left-1/2 -translate-x-1/2 items-center";

                const viewHeightPercent = Math.min(
                  100,
                  Math.max(12, Math.round((item.views / maxTrendViews) * 100)),
                );
                const uniqueHeightPercent = Math.min(
                  100,
                  Math.max(8, Math.round((item.uniques / maxTrendViews) * 100)),
                );

                return (
                  <div
                    key={item.date}
                    className="flex-1 min-w-[28px] max-w-[48px] h-full flex flex-col justify-end items-center group relative cursor-pointer"
                  >
                    {/* Tooltip Hover (Smart Edge-Aligned & Padded) */}
                    <div
                      className={`absolute -top-12 z-30 hidden group-hover:flex flex-col bg-popover/95 backdrop-blur-md text-popover-foreground border border-border px-3 py-1.5 rounded-lg text-[11px] font-mono whitespace-nowrap shadow-xl pointer-events-none ${tooltipAlignClass}`}
                    >
                      <span className="text-[10px] text-muted-foreground">
                        {item.date}
                      </span>
                      <span className="font-bold flex items-center gap-1.5 pt-0.5">
                        <span className="text-primary">{item.views} views</span>
                        <span className="text-muted-foreground/60">•</span>
                        <span className="text-sky-400">
                          {item.uniques} unique
                        </span>
                      </span>
                    </div>

                    {/* Dual Bars */}
                    <div className="w-full flex items-end justify-center gap-1 h-full group-hover:brightness-110 transition-all">
                      <div
                        style={{ height: `${viewHeightPercent}%` }}
                        className="w-2.5 sm:w-3.5 bg-primary hover:bg-primary/90 rounded-t-sm transition-all duration-300"
                      />
                      <div
                        style={{ height: `${uniqueHeightPercent}%` }}
                        className="w-2.5 sm:w-3.5 bg-sky-400 hover:bg-sky-300 rounded-t-sm transition-all duration-300"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Date Labels */}
            <div className="flex justify-between items-center text-[10px] sm:text-xs font-mono text-muted-foreground pt-1">
              <span>{data?.dailyTrend[0]?.date || ""}</span>
              <span>
                {data?.dailyTrend[data.dailyTrend.length - 1]?.date || ""}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Dual Column Grid: Referrers & Pages / Devices, OS & Browsers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Acquisition Channels & Content Breakdown */}
        <div className="space-y-6">
          {/* Top Referrers */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-foreground">
                Top Referrer Channels
              </h2>
              <span className="text-[11px] font-mono text-muted-foreground bg-secondary/80 border border-border px-2 py-0.5 rounded-md">
                Inbound Channels
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Where prospective clients and recruiters discover your portfolio
            </p>

            {(!data?.topReferrers || data.topReferrers.length === 0) &&
            !isLoading ? (
              <p className="text-xs text-muted-foreground font-mono py-6 text-center">
                No referral sources captured yet.
              </p>
            ) : (
              <div className="space-y-2.5">
                {data?.topReferrers.map((ref, idx) => {
                  const percentage = Math.round(
                    (ref.count / (data?.summary.totalViews || 1)) * 100,
                  );
                  const meta = getReferrerMeta(ref.source || "");
                  return (
                    <div
                      key={ref.source}
                      className="p-3 rounded-xl bg-secondary/25 hover:bg-secondary/45 border border-border/50 hover:border-border transition-all space-y-2 group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-5 h-5 rounded-md bg-card border border-border flex items-center justify-center text-[10px] font-mono font-bold text-muted-foreground shrink-0">
                            #{idx + 1}
                          </span>
                          <div className="w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center shrink-0">
                            {meta.icon}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-semibold text-foreground truncate block">
                              {meta.title}
                            </span>
                            <span className="text-[10px] font-mono text-muted-foreground truncate block">
                              {meta.sub}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0 flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-foreground">
                            {ref.count.toLocaleString()}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[10px] font-mono font-semibold">
                            {percentage}%
                          </span>
                        </div>
                      </div>

                      <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.max(percentage, 5)}%` }}
                          className="h-full bg-gradient-to-r from-primary to-sky-400 rounded-full transition-all duration-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Most Viewed Content & Projects */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-foreground">
                Most Viewed Content &amp; Projects
              </h2>
              <span className="text-[11px] font-mono text-muted-foreground bg-secondary/80 border border-border px-2 py-0.5 rounded-md">
                Top Destinations
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Specific pages or project case-studies frequented by visitors
            </p>

            {(!data?.topPages || data.topPages.length === 0) && !isLoading ? (
              <p className="text-xs text-muted-foreground font-mono py-6 text-center">
                No page visits captured yet.
              </p>
            ) : (
              <div className="space-y-2.5">
                {data?.topPages.map((pg, idx) => {
                  const percentage = Math.round(
                    (pg.count / (data?.summary.totalViews || 1)) * 100,
                  );
                  const meta = getContentMeta(pg.path);
                  return (
                    <div
                      key={pg.path}
                      className="p-3 rounded-xl bg-secondary/25 hover:bg-secondary/45 border border-border/50 hover:border-border transition-all space-y-2 group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-5 h-5 rounded-md bg-card border border-border flex items-center justify-center text-[10px] font-mono font-bold text-muted-foreground shrink-0">
                            #{idx + 1}
                          </span>
                          <div className="w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center shrink-0">
                            {meta.icon}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-foreground truncate block">
                                {meta.title}
                              </span>
                              <Link
                                href={meta.href}
                                target="_blank"
                                rel="noreferrer"
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                                title="Open in new tab"
                              >
                                <Icons.ExternalLink className="w-3 h-3" />
                              </Link>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className={`px-1.5 py-0.2 rounded text-[10px] font-mono border ${meta.categoryStyle}`}
                              >
                                {meta.category}
                              </span>
                              <span className="text-[10px] font-mono text-muted-foreground truncate">
                                {meta.slug}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0 flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-foreground">
                            {pg.count.toLocaleString()}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-mono font-semibold">
                            {percentage}%
                          </span>
                        </div>
                      </div>

                      <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.max(percentage, 5)}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${
                            meta.category === "Project"
                              ? "bg-gradient-to-r from-primary to-indigo-500"
                              : "bg-gradient-to-r from-sky-400 to-cyan-400"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Device, Operating System & Browser Intelligence */}
        <div className="space-y-6">
          {/* Device Split */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-foreground">
                Device Form Factors
              </h2>
              <span className="text-[11px] font-mono text-muted-foreground bg-secondary/80 border border-border px-2 py-0.5 rounded-md">
                Screen Matrix
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Screen categories utilized to browse your portfolio
            </p>

            <div className="grid grid-cols-3 gap-3 mb-5">
              {/* Desktop */}
              <div className="p-3.5 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/50 hover:border-primary/40 transition-all text-center space-y-1 group">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary mb-1">
                  <Icons.Laptop className="w-4 h-4" />
                </div>
                <div className="text-lg font-mono font-extrabold text-foreground">
                  {data?.devices.desktop || 0}
                </div>
                <div className="text-[11px] font-medium text-foreground">
                  Desktop PC
                </div>
                <span className="inline-block px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-mono font-semibold">
                  {Math.round(
                    ((data?.devices.desktop || 0) / totalDeviceSum) * 100,
                  )}
                  %
                </span>
              </div>

              {/* Mobile */}
              <div className="p-3.5 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/50 hover:border-sky-400/40 transition-all text-center space-y-1 group">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mx-auto text-sky-400 mb-1">
                  <Icons.Smartphone className="w-4 h-4" />
                </div>
                <div className="text-lg font-mono font-extrabold text-foreground">
                  {data?.devices.mobile || 0}
                </div>
                <div className="text-[11px] font-medium text-foreground">
                  Mobile Phone
                </div>
                <span className="inline-block px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 text-[10px] font-mono font-semibold">
                  {Math.round(
                    ((data?.devices.mobile || 0) / totalDeviceSum) * 100,
                  )}
                  %
                </span>
              </div>

              {/* Tablet */}
              <div className="p-3.5 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/50 hover:border-emerald-400/40 transition-all text-center space-y-1 group">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400 mb-1">
                  <Icons.Monitor className="w-4 h-4" />
                </div>
                <div className="text-lg font-mono font-extrabold text-foreground">
                  {data?.devices.tablet || 0}
                </div>
                <div className="text-[11px] font-medium text-foreground">
                  Tablet
                </div>
                <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-semibold">
                  {Math.round(
                    ((data?.devices.tablet || 0) / totalDeviceSum) * 100,
                  )}
                  %
                </span>
              </div>
            </div>

            {/* Segmented Gradient Progress Track */}
            <div className="space-y-2.5">
              <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden flex p-0.5 gap-0.5 border border-border/60">
                {(data?.devices.desktop || 0) > 0 && (
                  <div
                    style={{
                      width: `${Math.round(((data?.devices.desktop || 0) / totalDeviceSum) * 100)}%`,
                    }}
                    className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full transition-all duration-500"
                    title={`Desktop: ${data?.devices.desktop || 0}`}
                  />
                )}
                {(data?.devices.mobile || 0) > 0 && (
                  <div
                    style={{
                      width: `${Math.round(((data?.devices.mobile || 0) / totalDeviceSum) * 100)}%`,
                    }}
                    className="h-full bg-gradient-to-r from-sky-400 to-cyan-400 rounded-full transition-all duration-500"
                    title={`Mobile: ${data?.devices.mobile || 0}`}
                  />
                )}
                {(data?.devices.tablet || 0) > 0 && (
                  <div
                    style={{
                      width: `${Math.round(((data?.devices.tablet || 0) / totalDeviceSum) * 100)}%`,
                    }}
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-500"
                    title={`Tablet: ${data?.devices.tablet || 0}`}
                  />
                )}
              </div>

              {/* Modern Legend */}
              <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span>
                    Desktop (
                    {Math.round(
                      ((data?.devices.desktop || 0) / totalDeviceSum) * 100,
                    )}
                    %)
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  <span>
                    Mobile (
                    {Math.round(
                      ((data?.devices.mobile || 0) / totalDeviceSum) * 100,
                    )}
                    %)
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>
                    Tablet (
                    {Math.round(
                      ((data?.devices.tablet || 0) / totalDeviceSum) * 100,
                    )}
                    %)
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Operating Systems Breakdown */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-foreground">
                Operating Systems
              </h2>
              <span className="text-[11px] font-mono text-muted-foreground bg-secondary/80 border border-border px-2 py-0.5 rounded-md">
                Platforms
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Platforms and operating systems running on visitor devices
            </p>

            {(!data?.topOS || data.topOS.length === 0) && !isLoading ? (
              <p className="text-xs text-muted-foreground font-mono py-6 text-center">
                No OS telemetry captured yet.
              </p>
            ) : (
              <div className="space-y-2.5">
                {data?.topOS.map((o, idx) => {
                  const percentage = Math.round(
                    (o.count / (data?.summary.totalViews || 1)) * 100,
                  );
                  const meta = getOsMeta(o.os);
                  return (
                    <div
                      key={o.os}
                      className="p-2.5 rounded-xl bg-secondary/25 hover:bg-secondary/45 border border-border/50 hover:border-border transition-all space-y-2 group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-5 h-5 rounded-md bg-card border border-border flex items-center justify-center text-[10px] font-mono font-bold text-muted-foreground shrink-0">
                            #{idx + 1}
                          </span>
                          <div className="w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center shrink-0">
                            {meta.icon}
                          </div>
                          <span className="text-xs font-semibold text-foreground truncate">
                            {meta.name}
                          </span>
                        </div>

                        <div className="text-right shrink-0 flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-foreground">
                            {o.count.toLocaleString()}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-secondary text-muted-foreground border border-border text-[10px] font-mono font-semibold">
                            {percentage}%
                          </span>
                        </div>
                      </div>

                      <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.max(percentage, 5)}%` }}
                          className={`h-full rounded-full bg-gradient-to-r ${meta.color} transition-all duration-500`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Browser Breakdown */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-foreground">
                Browsers Used
              </h2>
              <span className="text-[11px] font-mono text-muted-foreground bg-secondary/80 border border-border px-2 py-0.5 rounded-md">
                Client Engines
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Client user-agents rendering the React application
            </p>

            {(!data?.topBrowsers || data.topBrowsers.length === 0) &&
            !isLoading ? (
              <p className="text-xs text-muted-foreground font-mono py-6 text-center">
                No browser telemetry captured yet.
              </p>
            ) : (
              <div className="space-y-2.5">
                {data?.topBrowsers.map((br, idx) => {
                  const percentage = Math.round(
                    (br.count / (data?.summary.totalViews || 1)) * 100,
                  );
                  const meta = getBrowserMeta(br.browser);
                  return (
                    <div
                      key={br.browser}
                      className="p-2.5 rounded-xl bg-secondary/25 hover:bg-secondary/45 border border-border/50 hover:border-border transition-all space-y-2 group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-5 h-5 rounded-md bg-card border border-border flex items-center justify-center text-[10px] font-mono font-bold text-muted-foreground shrink-0">
                            #{idx + 1}
                          </span>
                          <div className="w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center shrink-0">
                            {meta.icon}
                          </div>
                          <span className="text-xs font-semibold text-foreground truncate">
                            {meta.name}
                          </span>
                        </div>

                        <div className="text-right shrink-0 flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-foreground">
                            {br.count.toLocaleString()}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-secondary text-muted-foreground border border-border text-[10px] font-mono font-semibold">
                            {percentage}%
                          </span>
                        </div>
                      </div>

                      <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.max(percentage, 5)}%` }}
                          className={`h-full rounded-full bg-gradient-to-r ${meta.color} transition-all duration-500`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Real-Time Live Activity Stream */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-foreground">
              Live Telemetry Feed (Date, IP, Location &amp; Time Spent)
            </h2>
            <p className="text-xs text-muted-foreground">
              Comprehensive real-time forensic stream of inbound visits with
              exact timestamp and dwell time
            </p>
          </div>

          {/* Search & Refresh Controls */}
          <div className="flex items-center gap-2">
            {/* Live Search Input */}
            <div className="relative min-w-[200px] sm:min-w-[280px]">
              <Icons.Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search IP, Project, Country, OS, Browser..."
                className="w-full bg-secondary/70 border border-border rounded-xl pl-9 pr-8 py-1.5 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {searchInput && (
                <button
                  onClick={() => {
                    setSearchInput("");
                    updateUrl({ search: "", page: 1 });
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Clear filter"
                >
                  <Icons.X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Table Refresh Button */}
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isRefreshing || isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-secondary/80 hover:bg-secondary text-foreground text-xs font-mono font-medium transition-colors cursor-pointer disabled:opacity-50 shrink-0 shadow-xs"
              title="Refresh telemetry table data"
            >
              <Icons.RefreshCw
                className={`w-3.5 h-3.5 text-primary ${
                  isRefreshing || isLoading ? "animate-spin" : ""
                }`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {eventsList.length === 0 && !isLoading ? (
          search ? (
            <div className="py-12 text-center text-muted-foreground text-xs font-mono">
              No telemetry records match &quot;{search}&quot;. Try clearing your
              search query.
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground text-sm font-mono">
              No live events recorded yet. Open aburayhan.dev in your browser to
              see events stream in.
            </div>
          )
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/80 text-[11px] font-mono uppercase text-muted-foreground">
                    <th className="py-2.5 px-3">Date &amp; Time</th>
                    <th className="py-2.5 px-3">Visitor IP</th>
                    <th className="py-2.5 px-3">Page / Project</th>
                    <th className="py-2.5 px-3">Time Spent</th>
                    <th className="py-2.5 px-3">Device &amp; Model</th>
                    <th className="py-2.5 px-3">Browser</th>
                    <th className="py-2.5 px-3">Referrer</th>
                    <th className="py-2.5 px-3 text-right">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-xs font-mono">
                  {eventsList.map((evt, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-secondary/40 transition-colors"
                    >
                      {/* Date & Exact Timestamp */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
                            <Icons.Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                            {evt.formattedDate ||
                              new Date(evt.timestamp).toLocaleDateString(
                                "en-US",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                          </span>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5 font-mono">
                            <Icons.Clock className="w-3 h-3 text-muted-foreground/70 shrink-0" />
                            {evt.formattedTime ||
                              new Date(evt.timestamp).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                  hour12: true,
                                },
                              )}
                          </span>
                        </div>
                      </td>

                      {/* IP Address */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="font-bold text-primary font-mono bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                          {evt.ip || "127.0.0.1"}
                        </span>
                      </td>

                      {/* Page / Project Path */}
                      <td className="py-2.5 px-3 font-medium text-foreground whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded font-mono text-[11px] ${
                            evt.path.startsWith("/projects/")
                              ? "bg-primary/15 text-primary border border-primary/30"
                              : "bg-secondary text-foreground"
                          }`}
                        >
                          {evt.path}
                        </span>
                      </td>

                      {/* Dwell Time / Time Spent */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-amber-400 font-semibold">
                        {evt.durationFormatted ||
                          (evt.durationSeconds
                            ? `${evt.durationSeconds}s`
                            : "< 5s")}
                      </td>

                      {/* Device & Model */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                            {evt.device === "mobile" ||
                            evt.device === "tablet" ? (
                              <Icons.Smartphone className="w-3.5 h-3.5 text-primary shrink-0" />
                            ) : (
                              <Icons.Monitor className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            )}
                            {evt.deviceModel ||
                              (evt.device === "desktop"
                                ? "Desktop PC"
                                : evt.device === "tablet"
                                  ? "Tablet Device"
                                  : "Mobile Device")}
                          </span>
                          <span className="text-[11px] text-muted-foreground font-mono mt-0.5 capitalize">
                            {evt.os && evt.os !== "Unknown OS"
                              ? evt.os
                              : "Windows"}{" "}
                            • {evt.device}
                          </span>
                        </div>
                      </td>

                      {/* Browser */}
                      <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                        {evt.browser}
                      </td>

                      {/* Referrer */}
                      <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                        {evt.referrer}
                      </td>

                      {/* Location */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-secondary text-foreground border border-border">
                          <Image
                            src={`https://flagcdn.com/20x15/${(evt.countryCode || "bd").toLowerCase()}.png`}
                            alt={evt.countryName || "Flag"}
                            width={16}
                            height={12}
                            unoptimized
                            className="rounded-[2px] object-cover inline-block shadow-xs shrink-0"
                          />
                          <span>
                            {evt.city ? `${evt.city}, ` : ""}
                            {evt.countryName || evt.country || "Bangladesh"}
                          </span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Footer */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t border-border/60 text-xs font-mono">
              {/* Left / Info & Rows Per Page Dropdown */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-muted-foreground whitespace-nowrap">
                  Showing{" "}
                  <strong className="text-foreground font-semibold">
                    {from}
                  </strong>
                  –
                  <strong className="text-foreground font-semibold">
                    {to}
                  </strong>{" "}
                  of{" "}
                  <strong className="text-foreground font-semibold">
                    {totalEvents}
                  </strong>{" "}
                  entries
                  {search && (
                    <span className="text-primary font-medium ml-1">
                      (filtered)
                    </span>
                  )}
                </span>

                <span className="hidden sm:inline-block text-border/80">|</span>

                {/* Modern Rows Per Page Dropdown with Custom Input */}
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground whitespace-nowrap">
                    Rows:
                  </span>
                  <Select
                    value={isCustomLimit ? "custom" : String(limit)}
                    onValueChange={(val) => {
                      if (val === "custom") {
                        setIsCustomLimit(true);
                      } else {
                        setIsCustomLimit(false);
                        const num = parseInt(val, 10);
                        updateUrl({ limit: num, page: 1 });
                      }
                    }}
                  >
                    <SelectTrigger
                      size="sm"
                      className="h-8 w-[115px] bg-secondary/60 hover:bg-secondary border-border text-xs font-mono rounded-lg px-2.5 focus-visible:ring-1 focus-visible:ring-primary shadow-2xs"
                    >
                      <SelectValue placeholder="Rows / page" />
                    </SelectTrigger>
                    <SelectContent className="font-mono text-xs z-50 bg-card border-border shadow-lg">
                      <SelectItem value="10">10 / page</SelectItem>
                      <SelectItem value="20">20 / page</SelectItem>
                      <SelectItem value="25">25 / page</SelectItem>
                      <SelectItem value="50">50 / page</SelectItem>
                      <SelectItem value="100">100 / page</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>

                  {isCustomLimit && (
                    <div className="inline-flex items-center h-8 rounded-lg border border-border bg-secondary/50 p-0.5 animate-in fade-in duration-200 shadow-2xs">
                      <input
                        type="number"
                        min={1}
                        max={200}
                        value={customLimitInput}
                        onChange={(e) => setCustomLimitInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleApplyCustomLimit();
                          }
                        }}
                        placeholder="1-200"
                        className="w-12 h-full bg-transparent px-1.5 text-xs font-mono text-foreground text-center focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCustomLimit}
                        className="h-full px-2.5 rounded-md bg-primary text-primary-foreground text-xs font-mono font-medium hover:bg-primary/90 cursor-pointer transition-colors"
                        title="Apply custom limit"
                      >
                        Set
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomLimit(false);
                          updateUrl({ limit: 10, page: 1 });
                        }}
                        className="h-full px-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Revert to 10 rows"
                      >
                        <Icons.X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Quick Refresh at Table Bottom */}
                  <button
                    type="button"
                    onClick={handleManualRefresh}
                    disabled={isRefreshing || isLoading}
                    className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg border border-border bg-card hover:bg-secondary text-foreground text-xs font-mono font-medium cursor-pointer disabled:opacity-50 transition-colors shadow-2xs"
                    title="Refresh telemetry table data"
                  >
                    <Icons.RefreshCw
                      className={`w-3 h-3 text-primary ${
                        isRefreshing || isLoading ? "animate-spin" : ""
                      }`}
                    />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                </div>
              </div>

              {/* Right / Page Navigation */}
              <div className="flex items-center justify-between sm:justify-end gap-1.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => updateUrl({ page: 1 })}
                  disabled={page <= 1 || isLoading}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-border bg-card hover:bg-secondary text-foreground text-xs font-medium cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="First page"
                  aria-label="First page"
                >
                  <Icons.ChevronLeft className="w-3.5 h-3.5 -mr-2" />
                  <Icons.ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => updateUrl({ page: Math.max(1, page - 1) })}
                  disabled={page <= 1 || isLoading}
                  className="h-8 px-2.5 inline-flex items-center gap-1 rounded-lg border border-border bg-card hover:bg-secondary text-foreground text-xs font-mono font-medium cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Previous page"
                >
                  <Icons.ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Prev</span>
                </button>

                <div className="h-8 px-3 inline-flex items-center justify-center rounded-lg border border-border/80 bg-secondary/60 text-xs font-mono text-muted-foreground whitespace-nowrap">
                  Page{" "}
                  <strong className="text-foreground font-semibold mx-1">
                    {currentPage}
                  </strong>{" "}
                  of{" "}
                  <strong className="text-foreground font-semibold ml-1">
                    {totalPages}
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    updateUrl({ page: Math.min(totalPages, page + 1) })
                  }
                  disabled={page >= totalPages || isLoading}
                  className="h-8 px-2.5 inline-flex items-center gap-1 rounded-lg border border-border bg-card hover:bg-secondary text-foreground text-xs font-mono font-medium cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Next page"
                >
                  <span className="hidden xs:inline">Next</span>
                  <Icons.ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => updateUrl({ page: totalPages })}
                  disabled={page >= totalPages || isLoading}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-border bg-card hover:bg-secondary text-foreground text-xs font-medium cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Last page"
                  aria-label="Last page"
                >
                  <Icons.ChevronRight className="w-3.5 h-3.5" />
                  <Icons.ChevronRight className="w-3.5 h-3.5 -ml-2" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Analytics;
