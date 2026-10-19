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
      default: "Frontend Developer",
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
        "Frontend Developer with experience in React.js, Next.js, TypeScript, Redux Toolkit, and RTK Query. Experienced in building full-stack applications using Node.js, Express.js, REST APIs, and MongoDB across ERP, SaaS, and marketplace products. Skilled in building responsive, maintainable interfaces and translating product requirements into practical solutions.",
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
      default: "+880 171 985 7898",
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
