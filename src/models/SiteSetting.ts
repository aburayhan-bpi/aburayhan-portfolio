import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISiteSetting extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const SiteSettingSchema: Schema<ISiteSetting> = new Schema(
  {
    siteName: {
      type: String,
      default: "Md Abu Rayhan",
      required: true,
      trim: true,
    },
    tagline: {
      type: String,
      default: "Full-Stack Software Engineer & UI/UX Designer",
      trim: true,
    },
    primaryEmail: {
      type: String,
      default: "aburayhan.bpi@gmail.com",
      trim: true,
      lowercase: true,
    },
    location: {
      type: String,
      default: "Sherpur, Bogura, Bangladesh (UTC+6)",
      trim: true,
    },
    availabilityStatus: {
      type: String,
      default: "Available for New Contracts & Roles",
      trim: true,
    },
    responseTime: {
      type: String,
      default: "< 2 hours",
      trim: true,
    },
    bio: {
      type: String,
      default:
        "Full-Stack Software Engineer specialized in building high-performance Next.js applications, resilient REST APIs, and production ERP, SaaS & marketplace platforms.",
      trim: true,
    },
    githubUrl: {
      type: String,
      default: "https://github.com",
      trim: true,
    },
    linkedinUrl: {
      type: String,
      default: "https://linkedin.com",
      trim: true,
    },
    twitterUrl: {
      type: String,
      default: "https://twitter.com",
      trim: true,
    },
    leetcodeUrl: {
      type: String,
      default: "",
      trim: true,
    },
    blogUrl: {
      type: String,
      default: "",
      trim: true,
    },
    resumeUrl: {
      type: String,
      default: "",
      trim: true,
    },
    whatsapp: {
      type: String,
      default: "+880 1789-322199",
      trim: true,
    },
    yearsOfExperience: {
      type: Number,
      default: 5,
    },
    completedProjectsCount: {
      type: Number,
      default: 45,
    },
  },
  {
    timestamps: true,
  },
);

export const SiteSetting: Model<ISiteSetting> =
  mongoose.models.SiteSetting ||
  mongoose.model<ISiteSetting>("SiteSetting", SiteSettingSchema);

export default SiteSetting;
