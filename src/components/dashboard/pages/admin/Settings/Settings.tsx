"use client";

import { AppSelect } from "@/components/shared/AppSelect";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Icons } from "@/utils/icons";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface SiteSettingsData {
  siteName: string;
  tagline: string;
  primaryEmail: string;
  location: string;
  availabilityStatus: string;
  responseTime: string;
  bio: string;
  githubUrl: string;
  linkedinUrl: string;
  twitterUrl?: string;
  leetcodeUrl?: string;
  blogUrl?: string;
  resumeUrl?: string;
  whatsapp?: string;
  yearsOfExperience: number;
  completedProjectsCount: number;
}

const AVAILABILITY_OPTIONS = [
  { value: "Available for New Contracts & Roles", label: "🟢 Available for New Contracts & Roles" },
  { value: "Actively Interviewing (Full-Time)", label: "🚀 Actively Interviewing (Full-Time)" },
  { value: "Open to Consulting & High-Impact Work", label: "⚡ Open to Consulting & High-Impact Work" },
  { value: "Currently Booked / Unavailable", label: "🔴 Currently Booked / Unavailable" },
];

export const Settings = () => {
  const [activeTab, setActiveTab] = useState<"profile" | "contact" | "social" | "security">("profile");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploadingResume, setIsUploadingResume] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState<SiteSettingsData>({
    siteName: "Md Abu Rayhan",
    tagline: "Frontend Developer",
    primaryEmail: "aburayhan.bpi@gmail.com",
    location: "Sherpur, Bogura, Bangladesh",
    availabilityStatus: "Available for New Contracts & Roles",
    responseTime: "< 2 hours",
    bio: "Frontend Developer with experience in React.js, Next.js, TypeScript, Redux Toolkit, and RTK Query. Experienced in building full-stack applications using Node.js, Express.js, REST APIs, and MongoDB across ERP, SaaS, and marketplace products. Skilled in building responsive, maintainable interfaces and translating product requirements into practical solutions.",
    githubUrl: "https://github.com",
    linkedinUrl: "https://linkedin.com",
    twitterUrl: "https://twitter.com",
    leetcodeUrl: "",
    blogUrl: "",
    resumeUrl: "",
    whatsapp: "+880 171 985 7898",
    yearsOfExperience: 3,
    completedProjectsCount: 15,
  });

  // Password & Real-World OTP State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [passwordStep, setPasswordStep] = useState<"form" | "otp">("form");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resend OTP countdown effect
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/v1/settings");
      const data = await res.json();
      if (res.ok && data?.data) {
        setFormData(data.data);
      }
    } catch {
      toast.error("Failed to load settings from database");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/v1/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.data) {
          setFormData(data.data);
        }
      })
      .catch(() => {
        toast.error("Failed to load settings from database");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchSettings();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/v1/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        toast.success("Site configuration saved successfully to MongoDB Atlas");
        setFormData(resData.data);
      } else {
        toast.error(resData.error || "Failed to update site settings");
      }
    } catch {
      toast.error("Network error while saving settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingResume(true);
    const uploadForm = new FormData();
    uploadForm.append("file", file);

    try {
      const res = await fetch("/api/v1/upload", {
        method: "POST",
        body: uploadForm,
      });

      const resData = await res.json();
      const uploadedUrl = resData.url || resData.secure_url;
      if (res.ok && uploadedUrl) {
        setFormData((prev) => ({ ...prev, resumeUrl: uploadedUrl }));
        toast.success("Resume uploaded successfully to Cloudinary");
      } else {
        toast.error(resData.error || "Failed to upload resume document");
      }
    } catch {
      toast.error("Network error uploading resume to Cloudinary");
    } finally {
      setIsUploadingResume(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Step 1: Send OTP to Admin Email
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await fetch("/api/v1/admin/send-password-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        toast.success(resData.message || "Verification code sent to your email");
        setPasswordStep("otp");
        setResendCooldown(60);
      } else {
        toast.error(resData.error || "Failed to generate security code");
      }
    } catch {
      toast.error("Network error requesting verification code");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Step 2: Verify OTP and Finalize Password Change
  const handleVerifyOtpAndChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 6) {
      toast.error("Please enter the complete 6-digit code sent to your email");
      return;
    }

    setIsVerifyingPassword(true);
    try {
      const res = await fetch("/api/v1/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
          otp: otpCode.trim(),
        }),
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        toast.success("Security verified! Master password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setOtpCode("");
        setPasswordStep("form");
      } else {
        toast.error(resData.error || "Failed to verify code");
      }
    } catch {
      toast.error("Network error completing password update");
    } finally {
      setIsVerifyingPassword(false);
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
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
            <span className="text-xs font-mono text-primary font-medium">Site Settings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Portfolio Configuration &amp; Settings
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage your personal profile, live availability status, resume link, and master security credentials.
          </p>
        </div>

        {/* Quiet Refresh Button */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing || isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-border bg-card hover:bg-secondary text-foreground text-xs font-mono font-medium transition-colors cursor-pointer disabled:opacity-50"
            title="Reload settings from database"
          >
            <Icons.RefreshCw
              className={`w-3.5 h-3.5 text-primary ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Styled Segmented Tabs Navigation with Clear Spacing */}
      <div className="flex items-center gap-2 p-1.5 bg-card/80 border border-border rounded-2xl overflow-x-auto shadow-xs">
        {[
          { id: "profile", label: "Profile & Bio", icon: Icons.User },
          { id: "contact", label: "Contact & Availability", icon: Icons.Mail },
          { id: "social", label: "Links & Resume", icon: Icons.ExternalLink },
          { id: "security", label: "Security & Password", icon: Icons.Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-primary text-white shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="p-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono">Loading configuration from database...</span>
        </div>
      ) : (
        <div className="pt-2">
          {/* ========================================================================= */}
          {/* TAB 1: Profile & Bio                                                      */}
          {/* ========================================================================= */}
          {activeTab === "profile" && (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 lg:p-10 space-y-8">
                <div>
                  <h3 className="text-base font-bold text-foreground">Engineer Profile Identity</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Your public name, headline, and bio shown across the portfolio header and about sections.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-6 sm:gap-y-7">
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-2">
                      Full Display Name *
                    </label>
                    <Input
                      type="text"
                      required
                      value={formData.siteName}
                      onChange={(e) =>
                        setFormData({ ...formData, siteName: e.target.value })
                      }
                      placeholder="e.g. Md Abu Rayhan"
                      className="bg-secondary/30 border-border/80 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground h-11 px-4 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-2">
                      Professional Role Tagline *
                    </label>
                    <Input
                      type="text"
                      required
                      value={formData.tagline}
                      onChange={(e) =>
                        setFormData({ ...formData, tagline: e.target.value })
                      }
                      placeholder="e.g. Frontend Developer"
                      className="bg-secondary/30 border-border/80 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground h-11 px-4 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-2">
                    Engineering Bio &amp; Philosophy
                  </label>
                  <Textarea
                    rows={4}
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    placeholder="Short description of your technical focus, production expertise, and systems design philosophy."
                    className="bg-secondary/30 border-border/80 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground p-4 rounded-xl resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-6 sm:gap-y-7 pt-4 border-t border-border/60">
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-2">
                      Years of Experience
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={40}
                      value={formData.yearsOfExperience}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          yearsOfExperience: Number(e.target.value),
                        })
                      }
                      className="bg-secondary/30 border-border/80 text-xs sm:text-sm text-foreground h-11 px-4 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-2">
                      Completed Projects Delivered
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={500}
                      value={formData.completedProjectsCount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          completedProjectsCount: Number(e.target.value),
                        })
                      }
                      className="bg-secondary/30 border-border/80 text-xs sm:text-sm text-foreground h-11 px-4 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-medium transition-colors shadow-md shadow-primary/20 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? "Saving Changes..." : "Save Profile Changes"}
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: Contact & Availability (Resolved Grid Gap & Alignments)            */}
          {/* ========================================================================= */}
          {activeTab === "contact" && (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 lg:p-10 space-y-8">
                <div>
                  <h3 className="text-base font-bold text-foreground">Contact &amp; Availability</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Configure your primary direct contact information, response time SLA, and contract status.
                  </p>
                </div>

                {/* Row 1: Email and Phone with generous gap-x-8 lg:gap-x-12 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-6 sm:gap-y-7">
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-2">
                      Primary Inquiries Email *
                    </label>
                    <Input
                      type="email"
                      required
                      value={formData.primaryEmail}
                      onChange={(e) =>
                        setFormData({ ...formData, primaryEmail: e.target.value })
                      }
                      placeholder="aburayhan.bpi@gmail.com"
                      className="bg-secondary/30 border-border/80 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground h-11 px-4 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-2">
                      WhatsApp / Direct Phone
                    </label>
                    <Input
                      type="text"
                      value={formData.whatsapp || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, whatsapp: e.target.value })
                      }
                      placeholder="+880 171 985 7898"
                      className="bg-secondary/30 border-border/80 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground h-11 px-4 rounded-xl"
                    />
                  </div>
                </div>

                {/* Row 2: Location and Response Time with generous gap-x-8 lg:gap-x-12 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-6 sm:gap-y-7">
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-2">
                      Geographic Location &amp; Timezone
                    </label>
                    <Input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="Sherpur, Bogura, Bangladesh (UTC+6)"
                      className="bg-secondary/30 border-border/80 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground h-11 px-4 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-2">
                      Typical Response Time
                    </label>
                    <Input
                      type="text"
                      value={formData.responseTime}
                      onChange={(e) =>
                        setFormData({ ...formData, responseTime: e.target.value })
                      }
                      placeholder="< 2 hours"
                      className="bg-secondary/30 border-border/80 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground h-11 px-4 rounded-xl"
                    />
                  </div>
                </div>

                {/* Row 3: Availability Status Dropdown */}
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <label className="block text-xs font-mono text-muted-foreground">
                    Live Availability Status *
                  </label>
                  <div className="max-w-md">
                    <AppSelect
                      value={formData.availabilityStatus}
                      onValueChange={(val) =>
                        setFormData({ ...formData, availabilityStatus: val })
                      }
                      options={AVAILABILITY_OPTIONS}
                      placeholder="Select Availability"
                    />
                  </div>
                  <p className="text-[11px] font-mono text-muted-foreground pt-1">
                    Displays dynamically in the hero banner pill on the public homepage.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-medium transition-colors shadow-md shadow-primary/20 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? "Saving Changes..." : "Save Contact Changes"}
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: Social & Resume Links                                              */}
          {/* ========================================================================= */}
          {activeTab === "social" && (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 lg:p-10 space-y-8">
                <div>
                  <h3 className="text-base font-bold text-foreground">External Links &amp; Resume Asset</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Manage your public developer profile URLs and upload your official PDF resume to Cloudinary.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-6 sm:gap-y-7">
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-2">
                      GitHub Profile URL
                    </label>
                    <Input
                      type="url"
                      value={formData.githubUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, githubUrl: e.target.value })
                      }
                      placeholder="https://github.com/..."
                      className="bg-secondary/30 border-border/80 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground h-11 px-4 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-2">
                      LinkedIn Profile URL
                    </label>
                    <Input
                      type="url"
                      value={formData.linkedinUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, linkedinUrl: e.target.value })
                      }
                      placeholder="https://linkedin.com/in/..."
                      className="bg-secondary/30 border-border/80 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground h-11 px-4 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-2">
                      Twitter / X Profile URL (Optional)
                    </label>
                    <Input
                      type="url"
                      value={formData.twitterUrl || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, twitterUrl: e.target.value })
                      }
                      placeholder="https://twitter.com/..."
                      className="bg-secondary/30 border-border/80 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground h-11 px-4 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-2">
                      LeetCode / Problem-Solving Profile (Optional)
                    </label>
                    <Input
                      type="url"
                      value={formData.leetcodeUrl || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, leetcodeUrl: e.target.value })
                      }
                      placeholder="https://leetcode.com/u/..."
                      className="bg-secondary/30 border-border/80 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground h-11 px-4 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-2">
                    Technical Blog / Writing Profile (Optional, Dev.to / Medium / Hashnode)
                  </label>
                  <Input
                    type="url"
                    value={formData.blogUrl || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, blogUrl: e.target.value })
                    }
                    placeholder="https://dev.to/... or https://medium.com/@..."
                    className="bg-secondary/30 border-border/80 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground h-11 px-4 rounded-xl max-w-xl"
                  />
                </div>

                {/* Cloudinary Resume Uploader */}
                <div className="pt-4 border-t border-border/60 space-y-3">
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-2">
                      Official Resume / CV Document (PDF or Cloudinary URL)
                    </label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-2xl">
                      <Input
                        type="url"
                        value={formData.resumeUrl || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, resumeUrl: e.target.value })
                        }
                        placeholder="https://res.cloudinary.com/.../resume.pdf"
                        className="bg-secondary/30 border-border/80 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground h-11 px-4 rounded-xl flex-1"
                      />

                      {/* Hidden File Input for Cloudinary Direct Upload */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleResumeUpload}
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingResume}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-secondary text-foreground text-xs font-mono font-medium transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                      >
                        <Icons.RefreshCw
                          className={`w-3.5 h-3.5 text-primary ${
                            isUploadingResume ? "animate-spin" : ""
                          }`}
                        />
                        <span>{isUploadingResume ? "Uploading to Cloudinary..." : "Upload New PDF"}</span>
                      </button>
                    </div>
                  </div>

                  {formData.resumeUrl && (
                    <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground pt-1">
                      <Badge variant="outline" className="border-success/30 bg-success/10 text-success text-[10px]">
                        Active Resume
                      </Badge>
                      <a
                        href={formData.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1 truncate max-w-sm"
                      >
                        <span>Preview Current Resume</span>
                        <Icons.ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-medium transition-colors shadow-md shadow-primary/20 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? "Saving Changes..." : "Save Links Changes"}
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: Security & Real-World Step-Up OTP Verification                     */}
          {/* ========================================================================= */}
          {activeTab === "security" && (
            <div className="space-y-6">
              {passwordStep === "form" ? (
                /* Step 1: Password Input & Request OTP */
                <form onSubmit={handleRequestOtp} className="space-y-6">
                  <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 lg:p-10 space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-primary/10 text-primary border border-primary/20">
                          Step 1 of 2
                        </span>
                        <h3 className="text-base font-bold text-foreground">
                          Change Master Password
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Enter your current password and your desired new password. A 6-digit verification code will be dispatched to your registered email before changing.
                      </p>
                    </div>

                    <div className="space-y-5 max-w-xl">
                      <div>
                        <label className="block text-xs font-mono text-muted-foreground mb-2">
                          Current Master Password *
                        </label>
                        <Input
                          type="password"
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter your current password"
                          className="bg-secondary/30 border-border/80 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground h-11 px-4 rounded-xl"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-mono text-muted-foreground mb-2">
                            New Password * (Min 6 chars)
                          </label>
                          <Input
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="bg-secondary/30 border-border/80 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground h-11 px-4 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-mono text-muted-foreground mb-2">
                            Confirm New Password *
                          </label>
                          <Input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repeat new password"
                            className="bg-secondary/30 border-border/80 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground h-11 px-4 rounded-xl"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/60">
                      <p className="text-xs text-muted-foreground flex items-center gap-2 font-mono">
                        <Icons.Lock className="w-3.5 h-3.5 text-accent" />
                        <span>
                          Two-step email confirmation via TLS SMTP prevents unauthorized modifications.
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <button
                      type="submit"
                      disabled={isSendingOtp}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-medium transition-colors shadow-md shadow-primary/20 cursor-pointer disabled:opacity-50"
                    >
                      {isSendingOtp ? (
                        <>
                          <Icons.RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Dispatching Security OTP...</span>
                        </>
                      ) : (
                        <>
                          <Icons.Mail className="w-3.5 h-3.5" />
                          <span>Send Verification Code to Email</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* Step 2: Enter 6-digit OTP sent to aburayhan.bpi@gmail.com */
                <form onSubmit={handleVerifyOtpAndChange} className="space-y-6">
                  <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 lg:p-10 space-y-6 max-w-xl">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-accent/10 text-accent border border-accent/20">
                          Step 2 of 2
                        </span>
                        <h3 className="text-base font-bold text-foreground">
                          Enter 6-Digit Verification Code
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                        We sent a secure one-time code to{" "}
                        <strong className="text-primary font-mono">{formData.primaryEmail}</strong>. Enter it below to authorize this password update.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-xs font-mono text-muted-foreground">
                        6-Digit Security Code *
                      </label>
                      <Input
                        type="text"
                        required
                        maxLength={6}
                        autoFocus
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="••••••"
                        className="bg-secondary/40 border-primary/50 text-center font-mono text-2xl tracking-[0.5em] text-foreground h-14 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                      <p className="text-[11px] font-mono text-muted-foreground">
                        Check your inbox or spam folder for an email from Abu Rayhan Admin Security.
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/60">
                      <button
                        type="button"
                        onClick={() => setPasswordStep("form")}
                        className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        ← Back to edit password
                      </button>

                      <button
                        type="button"
                        disabled={resendCooldown > 0 || isSendingOtp}
                        onClick={handleRequestOtp}
                        className="text-xs font-mono text-primary hover:underline transition-colors cursor-pointer disabled:opacity-50 disabled:no-underline"
                      >
                        {resendCooldown > 0
                          ? `Resend code in ${resendCooldown}s`
                          : "Resend verification code"}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setPasswordStep("form");
                        setOtpCode("");
                      }}
                      className="px-5 py-2.5 rounded-xl border border-border bg-secondary/50 hover:bg-secondary text-foreground hover:text-foreground text-xs font-medium transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isVerifyingPassword || otpCode.length < 6}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-medium transition-colors shadow-md shadow-primary/20 cursor-pointer disabled:opacity-50"
                    >
                      {isVerifyingPassword ? (
                        <>
                          <Icons.RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Verifying Code...</span>
                        </>
                      ) : (
                        <>
                          <Icons.CheckCircle className="w-3.5 h-3.5" />
                          <span>Verify &amp; Update Password</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Settings;
