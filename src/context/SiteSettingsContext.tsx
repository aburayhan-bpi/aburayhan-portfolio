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

  const rawTagline = (raw.tagline as string) || DEFAULT_SITE_SETTINGS.tagline;
  const rawBio = (raw.bio as string) || DEFAULT_SITE_SETTINGS.bio;

  // Sanitize any legacy Full-Stack designation to Frontend Developer
  const cleanTagline = rawTagline.toLowerCase().includes("full-stack") || rawTagline.toLowerCase().includes("full stack")
    ? "Frontend Developer"
    : rawTagline;

  const cleanBio = rawBio
    .replace(/Full-Stack Software Engineer & UI\/UX Designer/gi, "Frontend Developer")
    .replace(/Full-Stack Software Engineer/gi, "Frontend Developer")
    .replace(/Full-Stack Engineer/gi, "Frontend Developer")
    .replace(/Full-Stack Developer/gi, "Frontend Developer")
    .replace(/Full-Stack/gi, "Frontend")
    .replace(/Full Stack/gi, "Frontend");

  return {
    siteName: (raw.siteName as string) || DEFAULT_SITE_SETTINGS.siteName,
    tagline: cleanTagline,
    primaryEmail: (raw.primaryEmail as string) || DEFAULT_SITE_SETTINGS.primaryEmail,
    location: (raw.location as string) || DEFAULT_SITE_SETTINGS.location,
    availabilityStatus: (raw.availabilityStatus as string) || DEFAULT_SITE_SETTINGS.availabilityStatus,
    responseTime: (raw.responseTime as string) || DEFAULT_SITE_SETTINGS.responseTime,
    bio: cleanBio,
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
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings?: SiteSettings;
}) => {
  const [settings, setSettings] = useState<SiteSettings>(
    initialSettings ? mapSiteSettings(initialSettings as unknown as Record<string, unknown>) : DEFAULT_SITE_SETTINGS
  );
  const [isLoading, setIsLoading] = useState<boolean>(!initialSettings);

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
