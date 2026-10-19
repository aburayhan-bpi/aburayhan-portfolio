import connectToDatabase from "@/lib/db";
import SiteSetting from "@/models/SiteSetting";
import Project from "@/models/Project";
import Skill from "@/models/Skill";
import Experience from "@/models/Experience";
import { DEFAULT_SITE_SETTINGS, SiteSettings } from "@/context/SiteSettingsContext";

export interface SerializedProject {
  id: string;
  title: string;
  category: "Full-Stack ERP" | "Marketplace" | "SaaS Dashboard" | "Mobile App";
  status: "Live" | "Client Beta" | "In Dev" | "Archived";
  tagline: string;
  description: string;
  keyFeatures: string[];
  techStack: string[];
  mockUrl?: string;
  liveUrl?: string;
  githubUrl?: string;
  isPrivateRepo?: boolean;
  imageUrl?: string;
  featured?: boolean;
  views?: number;
  order?: number;
}

export interface SerializedSkill {
  _id?: string;
  name: string;
  category: "Frontend" | "Backend" | "AI & Tools" | "DevOps & Cloud";
  proficiency?: number;
  experienceYears?: number;
  featured?: boolean;
  order?: number;
}

export interface SerializedExperience {
  _id?: string;
  category: "experience" | "education";
  title: string;
  organization: string;
  period: string;
  location?: string;
  type: string;
  description?: string;
  highlights?: string[];
  tech?: string[];
  order?: number;
}

export interface PortfolioServerData {
  settings: SiteSettings;
  projects: SerializedProject[];
  skills: SerializedSkill[];
  experiences: SerializedExperience[];
}

export async function getPortfolioServerData(): Promise<PortfolioServerData> {
  try {
    await connectToDatabase();

    const [settingsDoc, projectDocs, skillDocs, experienceDocs] = await Promise.all([
      SiteSetting.findOne().lean().exec(),
      Project.find({}).sort({ order: 1, createdAt: -1 }).lean().exec(),
      Skill.find({}).sort({ order: 1, createdAt: 1 }).lean().exec(),
      Experience.find({}).sort({ order: 1, createdAt: -1 }).lean().exec(),
    ]);

    // 1. Clean & Sanitize Settings
    let cleanSettings: SiteSettings = DEFAULT_SITE_SETTINGS;
    if (settingsDoc) {
      const raw = settingsDoc as unknown as Record<string, unknown>;
      const rawTagline = (raw.tagline as string) || DEFAULT_SITE_SETTINGS.tagline;
      const rawBio = (raw.bio as string) || DEFAULT_SITE_SETTINGS.bio;

      const cleanTagline =
        rawTagline.toLowerCase().includes("full-stack") || rawTagline.toLowerCase().includes("full stack")
          ? "Frontend Developer"
          : rawTagline;

      const cleanBio = rawBio
        .replace(/Full-Stack Software Engineer & UI\/UX Designer/gi, "Frontend Developer")
        .replace(/Full-Stack Software Engineer/gi, "Frontend Developer")
        .replace(/Full-Stack Engineer/gi, "Frontend Developer")
        .replace(/Full-Stack Developer/gi, "Frontend Developer")
        .replace(/Full-Stack/gi, "Frontend")
        .replace(/Full Stack/gi, "Frontend");

      cleanSettings = {
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
    }

    // 2. Serialize Mongoose documents safely to plain JSON objects
    const projects: SerializedProject[] = JSON.parse(JSON.stringify(projectDocs || []));
    const skills: SerializedSkill[] = JSON.parse(JSON.stringify(skillDocs || []));
    const experiences: SerializedExperience[] = JSON.parse(JSON.stringify(experienceDocs || []));

    return {
      settings: cleanSettings,
      projects,
      skills,
      experiences,
    };
  } catch (err) {
    console.error("⚠️ Failed to load server-side portfolio data:", err);
    return {
      settings: DEFAULT_SITE_SETTINGS,
      projects: [],
      skills: [],
      experiences: [],
    };
  }
}
