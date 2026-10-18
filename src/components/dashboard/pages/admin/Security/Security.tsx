"use client";

import { AppConfirmDialog } from "@/components/shared/AppConfirmDialog";
import { Icons } from "@/utils/icons";
import Link from "next/link";
import React, { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

interface BlacklistedIp {
  ip: string;
  reason: string;
  addedAt: string;
  isPermanent: boolean;
}

interface WhitelistedIp {
  ip: string;
  label: string;
  addedAt: string;
}

interface IncidentLog {
  ip: string;
  endpoint: string;
  reason: string;
  userAgent?: string;
  timestamp: string;
}

interface SecurityConfigData {
  underAttackMode: boolean;
  rateLimitPerMinute: number;
  authRateLimitPer10Min: number;
  autoBanThreshold: number;
  autoBanDurationMinutes: number;
  totalAttacksNeutralized: number;
  blacklistedIps: BlacklistedIp[];
  whitelistedIps: WhitelistedIp[];
  incidentLogs: IncidentLog[];
}

export function Security() {
  const [data, setData] = useState<SecurityConfigData | null>(null);
  const [activeTab, setActiveTab] = useState<"firewall" | "blacklist" | "whitelist" | "logs">("firewall");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, startRefresh] = useTransition();

  // Form states for config update
  const [rateLimitPerMinute, setRateLimitPerMinute] = useState<number>(60);
  const [authRateLimitPer10Min, setAuthRateLimitPer10Min] = useState<number>(5);
  const [autoBanThreshold, setAutoBanThreshold] = useState<number>(3);
  const [autoBanDurationMinutes, setAutoBanDurationMinutes] = useState<number>(60);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Blacklist modal/input states
  const [newBlacklistIp, setNewBlacklistIp] = useState("");
  const [newBlacklistReason, setNewBlacklistReason] = useState("");
  const [isPermanentBan, setIsPermanentBan] = useState(true);
  const [isAddingBlacklist, setIsAddingBlacklist] = useState(false);

  // Whitelist input states
  const [newWhitelistIp, setNewWhitelistIp] = useState("");
  const [newWhitelistLabel, setNewWhitelistLabel] = useState("");
  const [isAddingWhitelist, setIsAddingWhitelist] = useState(false);

  // Confirm dialog state for unblocking
  const [ipToUnblock, setIpToUnblock] = useState<string | null>(null);
  const [isConfirmUnblockOpen, setIsConfirmUnblockOpen] = useState(false);

  useEffect(() => {
    fetch("/api/v1/admin/security")
      .then((res) => res.json())
      .then((json) => {
        if (json?.success && json.data) {
          setData(json.data);
          setRateLimitPerMinute(json.data.rateLimitPerMinute || 60);
          setAuthRateLimitPer10Min(json.data.authRateLimitPer10Min || 5);
          setAutoBanThreshold(json.data.autoBanThreshold || 3);
          setAutoBanDurationMinutes(json.data.autoBanDurationMinutes || 60);
        } else {
          toast.error(json?.error || "Failed to load security status");
        }
      })
      .catch(() => {
        toast.error("Network error fetching security configuration");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleManualRefresh = () => {
    startRefresh(async () => {
      try {
        const res = await fetch("/api/v1/admin/security");
        const json = await res.json();
        if (json?.success && json.data) {
          setData(json.data);
          setRateLimitPerMinute(json.data.rateLimitPerMinute || 60);
          setAuthRateLimitPer10Min(json.data.authRateLimitPer10Min || 5);
          setAutoBanThreshold(json.data.autoBanThreshold || 3);
          setAutoBanDurationMinutes(json.data.autoBanDurationMinutes || 60);
          toast.success("Security status & firewall cache refreshed");
        }
      } catch {
        toast.error("Network error refreshing security data");
      }
    });
  };

  // 1. Toggle Under Attack Mode
  const handleToggleAttackMode = async () => {
    if (!data) return;
    const nextState = !data.underAttackMode;
    try {
      const res = await fetch("/api/v1/admin/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_attack_mode",
          enabled: nextState,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setData((prev) => (prev ? { ...prev, underAttackMode: nextState } : null));
        if (nextState) {
          toast.warning("🚨 UNDER ATTACK SHIELD ACTIVATED. Aggressive bot protection enabled.");
        } else {
          toast.success("🛡️ Normal Guard Restored. Standard rate limits active.");
        }
      } else {
        toast.error(json.error || "Failed to toggle attack mode");
      }
    } catch {
      toast.error("Network error updating attack mode");
    }
  };

  // 2. Save Rate Limiting Thresholds
  const handleSaveLimits = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    try {
      const res = await fetch("/api/v1/admin/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_limits",
          rateLimitPerMinute,
          authRateLimitPer10Min,
          autoBanThreshold,
          autoBanDurationMinutes,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success("Firewall rate limiting rules updated successfully");
        setData(json.data);
      } else {
        toast.error(json.error || "Failed to save firewall settings");
      }
    } catch {
      toast.error("Network error saving firewall configuration");
    } finally {
      setIsSavingConfig(false);
    }
  };

  // 3. Add to Blacklist
  const handleAddBlacklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlacklistIp.trim()) {
      toast.error("Please enter a valid IP address");
      return;
    }
    setIsAddingBlacklist(true);
    try {
      const res = await fetch("/api/v1/admin/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_blacklist",
          ip: newBlacklistIp.trim(),
          reason: newBlacklistReason.trim() || "Manual ban by administrator",
          isPermanent: isPermanentBan,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(`IP ${newBlacklistIp.trim()} successfully blacklisted`);
        setData(json.data);
        setNewBlacklistIp("");
        setNewBlacklistReason("");
      } else {
        toast.error(json.error || "Failed to blacklist IP");
      }
    } catch {
      toast.error("Network error adding IP to blacklist");
    } finally {
      setIsAddingBlacklist(false);
    }
  };

  // 4. Remove from Blacklist (Unblock)
  const handleConfirmUnblock = async () => {
    if (!ipToUnblock) return;
    try {
      const res = await fetch("/api/v1/admin/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "remove_blacklist",
          ip: ipToUnblock,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(`IP ${ipToUnblock} unblocked and restored`);
        setData(json.data);
      } else {
        toast.error(json.error || "Failed to unblock IP");
      }
    } catch {
      toast.error("Network error unblocking IP");
    } finally {
      setIpToUnblock(null);
    }
  };

  // 5. Add to Whitelist
  const handleAddWhitelist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhitelistIp.trim()) {
      toast.error("Please enter a valid IP address");
      return;
    }
    setIsAddingWhitelist(true);
    try {
      const res = await fetch("/api/v1/admin/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_whitelist",
          ip: newWhitelistIp.trim(),
          label: newWhitelistLabel.trim() || "Developer Workstation",
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(`IP ${newWhitelistIp.trim()} added to trusted whitelist`);
        setData(json.data);
        setNewWhitelistIp("");
        setNewWhitelistLabel("");
      } else {
        toast.error(json.error || "Failed to whitelist IP");
      }
    } catch {
      toast.error("Network error whitelisting IP");
    } finally {
      setIsAddingWhitelist(false);
    }
  };

  // 6. Remove from Whitelist
  const handleRemoveWhitelist = async (ip: string) => {
    try {
      const res = await fetch("/api/v1/admin/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "remove_whitelist",
          ip,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(`IP ${ip} removed from whitelist`);
        setData(json.data);
      } else {
        toast.error(json.error || "Failed to remove whitelist IP");
      }
    } catch {
      toast.error("Network error removing IP from whitelist");
    }
  };

  // 7. Clear Logs
  const handleClearLogs = async () => {
    try {
      const res = await fetch("/api/v1/admin/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear_logs" }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success("Incident audit logs cleared");
        setData(json.data);
      } else {
        toast.error(json.error || "Failed to clear logs");
      }
    } catch {
      toast.error("Network error clearing logs");
    }
  };

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
            <span className="text-xs font-mono text-primary font-medium">Firewall</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Security Console &amp; DDoS Mitigation
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Enterprise Layer 7 WAF, intelligent rate limiting, and bot protection managed directly from your console.
          </p>
        </div>

        {/* Refresh Action */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing || isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-secondary text-foreground text-xs font-mono font-medium transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh security configuration"
          >
            <Icons.RefreshCw
              className={`w-3.5 h-3.5 text-primary ${
                isRefreshing || isLoading ? "animate-spin" : ""
              }`}
            />
            <span>Refresh State</span>
          </button>
        </div>
      </div>

      {/* Master "Under Attack Mode" Shield Banner */}
      <div
        className={`rounded-2xl p-6 sm:p-7 border transition-all duration-300 ${
          data?.underAttackMode
            ? "bg-rose-950/20 border-rose-500/50 shadow-lg shadow-rose-950/30"
            : "bg-emerald-950/15 border-emerald-500/30"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="flex items-start gap-4">
            <div
              className={`p-3.5 rounded-2xl border ${
                data?.underAttackMode
                  ? "bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              }`}
            >
              {data?.underAttackMode ? (
                <Icons.ShieldAlert className="w-8 h-8" />
              ) : (
                <Icons.ShieldCheck className="w-8 h-8" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span
                  className={`text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    data?.underAttackMode
                      ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  }`}
                >
                  {data?.underAttackMode
                    ? "Under Attack Mode (Shield Active)"
                    : "Standard Protection Active"}
                </span>
              </div>
              <h2 className="text-xl font-bold text-foreground mt-1.5">
                {data?.underAttackMode
                  ? "Aggressive DDoS & Bot Shield Engaged"
                  : "Firewall Guarding Inbound Traffic"}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                {data?.underAttackMode
                  ? "Strict rate limits enforced (50% reduction). Automated scrapers (curl, python, headless bots) are automatically blocked at edge."
                  : "In-memory sliding window protects public and authenticated routes. Suspicious brute-force attacks are automatically quarantined."}
              </p>
            </div>
          </div>

          {/* Toggle Button */}
          <div className="shrink-0">
            <button
              onClick={handleToggleAttackMode}
              className={`px-5 py-3 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer shadow-md inline-flex items-center gap-2 ${
                data?.underAttackMode
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                  : "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30"
              }`}
            >
              {data?.underAttackMode ? (
                <>
                  <Icons.ShieldCheck className="w-4 h-4" />
                  <span>Deactivate (Return to Normal)</span>
                </>
              ) : (
                <>
                  <Icons.ShieldAlert className="w-4 h-4" />
                  <span>Activate Under Attack Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Attacks Dropped */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-muted-foreground">
              Violations Neutralized
            </span>
            <span className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Icons.ShieldAlert className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-foreground font-mono">
              {isLoading ? "—" : data?.incidentLogs.length || "0"}
            </span>
            <span className="ml-2 text-xs text-rose-400 font-mono font-medium">
              Malicious Hits
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Automated dropped bot &amp; flood attempts
          </p>
        </div>

        {/* Metric 2: Active Blacklisted IPs */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-muted-foreground">
              Banned IP Quarantines
            </span>
            <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Icons.Lock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-foreground font-mono">
              {isLoading ? "—" : data?.blacklistedIps.length || "0"}
            </span>
            <span className="ml-2 text-xs text-amber-400 font-mono font-medium">
              Banned IPs
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Restricted from accessing any portfolio endpoint
          </p>
        </div>

        {/* Metric 3: Whitelisted IPs */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-muted-foreground">
              Trusted Whitelist
            </span>
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Icons.CheckCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-foreground font-mono">
              {isLoading ? "—" : data?.whitelistedIps.length || "0"}
            </span>
            <span className="ml-2 text-xs text-emerald-400 font-mono font-medium">
              Trusted IPs
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Bypasses rate limiting for developer workstations
          </p>
        </div>

        {/* Metric 4: Public Threshold */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-muted-foreground">
              Current Sliding Limit
            </span>
            <span className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Icons.Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4 truncate">
            <span className="text-2xl font-extrabold text-foreground font-mono">
              {isLoading ? "—" : `${data?.rateLimitPerMinute || 60}/min`}
            </span>
            <span className="ml-2 text-xs text-muted-foreground font-mono">
              ({data?.authRateLimitPer10Min || 5} auth/10m)
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Per-IP window before triggering HTTP 429
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto text-xs font-mono">
        <button
          onClick={() => setActiveTab("firewall")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer font-medium flex items-center gap-2 ${
            activeTab === "firewall"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          <Icons.Activity className="w-4 h-4" />
          <span>Firewall Limits</span>
        </button>
        <button
          onClick={() => setActiveTab("blacklist")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer font-medium flex items-center gap-2 ${
            activeTab === "blacklist"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          <Icons.ShieldAlert className="w-4 h-4" />
          <span>IP Blacklist ({data?.blacklistedIps.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveTab("whitelist")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer font-medium flex items-center gap-2 ${
            activeTab === "whitelist"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          <Icons.CheckCircle className="w-4 h-4" />
          <span>IP Whitelist ({data?.whitelistedIps.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer font-medium flex items-center gap-2 ${
            activeTab === "logs"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          <Icons.FileText className="w-4 h-4" />
          <span>Incident Audit Logs ({data?.incidentLogs.length || 0})</span>
        </button>
      </div>

      {/* TAB CONTENT 1: Firewall Limits Configuration */}
      {activeTab === "firewall" && (
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-base font-bold text-foreground">
              Rate Limiting &amp; Jail Thresholds
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tune automated traffic restrictions to prevent HTTP floods and brute-force attacks
            </p>
          </div>

          <form onSubmit={handleSaveLimits} className="space-y-6 max-w-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Public Page Limit */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-medium text-foreground">
                  Public Route Rate Limit (Requests / minute)
                </label>
                <input
                  type="number"
                  min={10}
                  max={300}
                  value={rateLimitPerMinute}
                  onChange={(e) => setRateLimitPerMinute(Number(e.target.value))}
                  className="w-full h-10 px-3.5 rounded-xl border border-border bg-secondary/50 text-foreground font-mono text-xs focus:outline-hidden focus:border-primary"
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Limits general portfolio page requests per IP before returning 429.
                </p>
              </div>

              {/* Auth Route Limit */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-medium text-foreground">
                  Auth &amp; Contact API Limit (Attempts / 10 minutes)
                </label>
                <input
                  type="number"
                  min={2}
                  max={20}
                  value={authRateLimitPer10Min}
                  onChange={(e) => setAuthRateLimitPer10Min(Number(e.target.value))}
                  className="w-full h-10 px-3.5 rounded-xl border border-border bg-secondary/50 text-foreground font-mono text-xs focus:outline-hidden focus:border-primary"
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Strict threshold on login, password change &amp; contact inquiries.
                </p>
              </div>

              {/* Strike Threshold */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-medium text-foreground">
                  Auto-Ban Jail Strike Threshold
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={autoBanThreshold}
                  onChange={(e) => setAutoBanThreshold(Number(e.target.value))}
                  className="w-full h-10 px-3.5 rounded-xl border border-border bg-secondary/50 text-foreground font-mono text-xs focus:outline-hidden focus:border-primary"
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Violations in rapid succession before IP is placed in temporary jail.
                </p>
              </div>

              {/* Auto-Ban Duration */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-medium text-foreground">
                  Auto-Ban Jail Duration (Minutes)
                </label>
                <input
                  type="number"
                  min={10}
                  max={1440}
                  value={autoBanDurationMinutes}
                  onChange={(e) => setAutoBanDurationMinutes(Number(e.target.value))}
                  className="w-full h-10 px-3.5 rounded-xl border border-border bg-secondary/50 text-foreground font-mono text-xs focus:outline-hidden focus:border-primary"
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Length of time offending IP is blocked before jail expires automatically.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex justify-end">
              <button
                type="submit"
                disabled={isSavingConfig}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-mono font-bold hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isSavingConfig ? (
                  <>
                    <Icons.RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Applying Rules...</span>
                  </>
                ) : (
                  <>
                    <Icons.CheckCircle className="w-3.5 h-3.5" />
                    <span>Save Firewall Configuration</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB CONTENT 2: IP Blacklist */}
      {activeTab === "blacklist" && (
        <div className="space-y-6">
          {/* Add Blacklist Form */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-sm font-bold text-foreground mb-1">Add IP to Blacklist</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Instantly drop all incoming connections from a malicious IP address (HTTP 403)
            </p>

            <form onSubmit={handleAddBlacklist} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <input
                    type="text"
                    placeholder="e.g. 185.220.101.5"
                    value={newBlacklistIp}
                    onChange={(e) => setNewBlacklistIp(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl border border-border bg-secondary/50 text-foreground font-mono text-xs focus:outline-hidden focus:border-primary"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Reason (e.g. Scripted DDoS attempt, unauthorized brute force)"
                    value={newBlacklistReason}
                    onChange={(e) => setNewBlacklistReason(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl border border-border bg-secondary/50 text-foreground font-mono text-xs focus:outline-hidden focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                <label className="flex items-center gap-2 text-xs font-mono text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPermanentBan}
                    onChange={(e) => setIsPermanentBan(e.target.checked)}
                    className="rounded border-border bg-secondary text-primary focus:ring-0"
                  />
                  <span>Permanent Ban (Will not expire automatically)</span>
                </label>

                <button
                  type="submit"
                  disabled={isAddingBlacklist}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Icons.Lock className="w-3.5 h-3.5" />
                  <span>{isAddingBlacklist ? "Blacklisting..." : "Block IP Address"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Blacklisted IPs Table */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-sm font-bold text-foreground mb-4">
              Currently Banned IPs ({data?.blacklistedIps.length || 0})
            </h2>

            {(!data?.blacklistedIps || data.blacklistedIps.length === 0) ? (
              <p className="text-xs text-muted-foreground font-mono py-8 text-center">
                No IPs are currently restricted.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="border-b border-border/80 text-[11px] uppercase text-muted-foreground">
                      <th className="py-2.5 px-3">IP Address</th>
                      <th className="py-2.5 px-3">Ban Reason</th>
                      <th className="py-2.5 px-3">Added Date</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {data?.blacklistedIps.map((b) => (
                      <tr key={b.ip} className="hover:bg-secondary/40 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-rose-400">{b.ip}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{b.reason}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">
                          {new Date(b.addedAt).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] ${
                              b.isPermanent
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {b.isPermanent ? "Permanent" : "Temporary"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => {
                              setIpToUnblock(b.ip);
                              setIsConfirmUnblockOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg border border-border bg-secondary hover:bg-secondary/80 text-foreground text-[11px] font-mono cursor-pointer transition-colors"
                          >
                            Unblock
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: IP Whitelist */}
      {activeTab === "whitelist" && (
        <div className="space-y-6">
          {/* Add Whitelist Form */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-sm font-bold text-foreground mb-1">Add Trusted Developer IP</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Whitelisted IPs bypass rate limits and automated bot checks (ideal for your office or home network)
            </p>

            <form onSubmit={handleAddWhitelist} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <input
                    type="text"
                    placeholder="e.g. 103.145.120.45"
                    value={newWhitelistIp}
                    onChange={(e) => setNewWhitelistIp(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl border border-border bg-secondary/50 text-foreground font-mono text-xs focus:outline-hidden focus:border-primary"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Label (e.g. Rayhan Home Fiber, Work Laptop)"
                    value={newWhitelistLabel}
                    onChange={(e) => setNewWhitelistLabel(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl border border-border bg-secondary/50 text-foreground font-mono text-xs focus:outline-hidden focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isAddingWhitelist}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <Icons.CheckCircle className="w-3.5 h-3.5" />
                  <span>{isAddingWhitelist ? "Saving..." : "Add to Whitelist"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Whitelisted IPs Table */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-sm font-bold text-foreground mb-4">
              Trusted IPs ({data?.whitelistedIps.length || 0})
            </h2>

            {(!data?.whitelistedIps || data.whitelistedIps.length === 0) ? (
              <p className="text-xs text-muted-foreground font-mono py-8 text-center">
                No custom whitelisted IPs registered.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="border-b border-border/80 text-[11px] uppercase text-muted-foreground">
                      <th className="py-2.5 px-3">IP Address</th>
                      <th className="py-2.5 px-3">Label / Description</th>
                      <th className="py-2.5 px-3">Whitelisted Date</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {data?.whitelistedIps.map((w) => (
                      <tr key={w.ip} className="hover:bg-secondary/40 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-emerald-400">{w.ip}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{w.label}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">
                          {new Date(w.addedAt).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleRemoveWhitelist(w.ip)}
                            className="px-2.5 py-1 rounded-lg border border-border bg-secondary hover:bg-rose-500/10 hover:text-rose-400 text-muted-foreground text-[11px] font-mono cursor-pointer transition-colors"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: Incident Audit Logs */}
      {activeTab === "logs" && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-sm font-bold text-foreground">Security Incident Trail</h2>
              <p className="text-xs text-muted-foreground">
                Live stream of dropped requests, rate-limit triggers, and neutralized attacks
              </p>
            </div>
            {data?.incidentLogs && data.incidentLogs.length > 0 && (
              <button
                onClick={handleClearLogs}
                className="px-3 py-1.5 rounded-lg border border-border bg-secondary hover:bg-secondary/80 text-xs font-mono text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                Clear Audit Trail
              </button>
            )}
          </div>

          {(!data?.incidentLogs || data.incidentLogs.length === 0) ? (
            <div className="py-12 text-center text-muted-foreground text-xs font-mono">
              <Icons.ShieldCheck className="w-8 h-8 mx-auto text-emerald-400 mb-2 opacity-60" />
              <span>Zero attack incidents recorded. All endpoints operational.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="border-b border-border/80 text-[11px] uppercase text-muted-foreground">
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Offending IP</th>
                    <th className="py-2.5 px-3">Target Endpoint</th>
                    <th className="py-2.5 px-3">Violation Reason</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {data?.incidentLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-secondary/40 transition-colors">
                      <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-foreground whitespace-nowrap">
                        {log.ip}
                      </td>
                      <td className="py-2.5 px-3 text-primary whitespace-nowrap">
                        {log.endpoint}
                      </td>
                      <td className="py-2.5 px-3 text-rose-400 whitespace-nowrap">
                        {log.reason}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={async () => {
                            setNewBlacklistIp(log.ip);
                            setNewBlacklistReason(log.reason);
                            setActiveTab("blacklist");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 text-[11px] cursor-pointer transition-colors"
                        >
                          Ban IP
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* AppConfirmDialog for Unblocking */}
      <AppConfirmDialog
        isOpen={isConfirmUnblockOpen}
        onOpenChange={setIsConfirmUnblockOpen}
        title="Unblock IP Address?"
        description={`Are you sure you want to remove ${ipToUnblock} from the blacklist? This will allow incoming traffic from this IP address again.`}
        confirmText="Yes, Unblock"
        cancelText="Cancel"
        variant="warning"
        onConfirm={handleConfirmUnblock}
      />
    </div>
  );
}

export default Security;
