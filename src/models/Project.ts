import mongoose, { Document, Model, Schema } from "mongoose";

export interface IProject extends Document {
  id: string; // custom slug or identifier (e.g. raantech-erp)
  title: string;
  category: "Full-Stack ERP" | "Marketplace" | "SaaS Dashboard" | "Mobile App";
  status: "Live" | "Client Beta" | "In Dev" | "Archived";
  tagline: string;
  description: string;
  keyFeatures: string[];
  techStack: string[];
  imageUrl?: string;
  mockUrl?: string;
  liveUrl?: string;
  githubUrl?: string;
  isPrivateRepo: boolean;
  featured: boolean;
  views: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema<IProject> = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["Full-Stack ERP", "Marketplace", "SaaS Dashboard", "Mobile App"],
      default: "Full-Stack ERP",
    },
    status: {
      type: String,
      enum: ["Live", "Client Beta", "In Dev", "Archived"],
      default: "Live",
    },
    tagline: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    keyFeatures: {
      type: [String],
      default: [],
    },
    techStack: {
      type: [String],
      default: [],
    },
    imageUrl: {
      type: String,
      default: "",
    },
    mockUrl: {
      type: String,
      default: "",
    },
    liveUrl: {
      type: String,
      default: "",
    },
    githubUrl: {
      type: String,
      default: "",
    },
    isPrivateRepo: {
      type: Boolean,
      default: false,
    },
    featured: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);

export default Project;
