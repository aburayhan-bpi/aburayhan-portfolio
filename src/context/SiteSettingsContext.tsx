"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface SiteSettings {
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

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: "Md Abu Rayhan",
  tagline: "Full-Stack Software Engineer & UI/UX Designer",
  primaryEmail: "aburayhan.bpi@gmail.com",
  location: "Sherpur, Bogura, Bangladesh (UTC+6)",
  availabilityStatus: "Available for New Contracts & Roles",
  responseTime: "< 2 hours",
  bio: "Full-Stack Software Engineer specialized in building high-performance Next.js applications, resilient REST APIs, and production ERP, SaaS & marketplace platforms.",
  githubUrl: "https://github.com",
  linkedinUrl: "https://linkedin.com",
  twitterUrl: "https://twitter.com",
  leetcodeUrl: "",
  blogUrl: "",
  resumeUrl: "",
  whatsapp: "+880 1789-322199",
  yearsOfExperience: 5,
  completedProjectsCount: 45,
};

interface SiteSettingsContextType {
  settings: SiteSettings;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: DEFAULT_SITE_SETTINGS,
  isLoading: false,
  refreshSettings: async () => {},
});

const mapSiteSettings = (raw: Record<string, unknown> | null | undefined): SiteSettings => {
  if (!raw) return DEFAULT_SITE_SETTINGS;
  return {
    siteName: (raw.siteName as string) || DEFAULT_SITE_SETTINGS.siteName,
    tagline: (raw.tagline as string) || DEFAULT_SITE_SETTINGS.tagline,
    primaryEmail: (raw.primaryEmail as string) || DEFAULT_SITE_SETTINGS.primaryEmail,
    location: (raw.location as string) || DEFAULT_SITE_SETTINGS.location,
    availabilityStatus: (raw.availabilityStatus as string) || DEFAULT_SITE_SETTINGS.availabilityStatus,
    responseTime: (raw.responseTime as string) || DEFAULT_SITE_SETTINGS.responseTime,
    bio: (raw.bio as string) || DEFAULT_SITE_SETTINGS.bio,
    githubUrl: (raw.githubUrl as string) || DEFAULT_SITE_SETTINGS.githubUrl,
    linkedinUrl: (raw.linkedinUrl as string) || DEFAULT_SITE_SETTINGS.linkedinUrl,
    twitterUrl: (raw.twitterUrl as string) || DEFAULT_SITE_SETTINGS.twitterUrl,
    leetcodeUrl: (raw.leetcodeUrl as string) || DEFAULT_SITE_SETTINGS.leetcodeUrl,
    blogUrl: (raw.blogUrl as string) || DEFAULT_SITE_SETTINGS.blogUrl,
    resumeUrl: (raw.resumeUrl as string) || DEFAULT_SITE_SETTINGS.resumeUrl,
    whatsapp: (raw.whatsapp as string) || DEFAULT_SITE_SETTINGS.whatsapp,
    yearsOfExperience:
      typeof raw.yearsOfExperience === "number"
        ? raw.yearsOfExperience
        : DEFAULT_SITE_SETTINGS.yearsOfExperience,
    completedProjectsCount:
      typeof raw.completedProjectsCount === "number"
        ? raw.completedProjectsCount
        : DEFAULT_SITE_SETTINGS.completedProjectsCount,
  };
};

export const SiteSettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/v1/settings");
      const data = await res.json();
      if (data?.data) {
        setSettings(mapSiteSettings(data.data));
      }
    } catch {
      // Retain default static cache
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/v1/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.data) {
          setSettings(mapSiteSettings(data.data));
        }
      })
      .catch(() => {})
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <SiteSettingsContext.Provider
      value={{ settings, isLoading, refreshSettings: fetchSettings }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => useContext(SiteSettingsContext);
