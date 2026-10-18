import mongoose, { Document, Model, Schema } from "mongoose";

export interface IExperience extends Document {
  category: "experience" | "education";
  title: string;          // Role (for work) or Title / Degree (for education)
  organization: string;   // Company (for work) or Institution (for education)
  period: string;         // e.g. "July 2025 – Present" or "2020 – 2024"
  location?: string;      // e.g. "Dhaka, Bangladesh • Remote / Hybrid"
  type: string;          // e.g. "Full-Time", "Diploma in Engineering", "Professional Certification"
  description?: string;   // Summary or certificate focus
  highlights: string[];   // Key achievements / bullet points
  tech: string[];         // Tech stack chips
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ExperienceSchema: Schema<IExperience> = new Schema(
  {
    category: {
      type: String,
      enum: ["experience", "education"],
      required: true,
      default: "experience",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    organization: {
      type: String,
      required: true,
      trim: true,
    },
    period: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    type: {
      type: String,
      required: true,
      default: "Full-Time",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    highlights: {
      type: [String],
      default: [],
    },
    tech: {
      type: [String],
      default: [],
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Experience: Model<IExperience> =
  mongoose.models.Experience ||
  mongoose.model<IExperience>("Experience", ExperienceSchema);

export default Experience;
