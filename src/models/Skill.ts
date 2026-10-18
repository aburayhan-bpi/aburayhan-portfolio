import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISkill extends Document {
  name: string;
  category: "Frontend" | "Backend" | "AI & Tools" | "DevOps & Cloud";
  proficiency?: number;
  experienceYears?: number;
  featured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema: Schema<ISkill> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Frontend", "Backend", "AI & Tools", "DevOps & Cloud"],
      default: "Frontend",
    },
    proficiency: {
      type: Number,
      min: 1,
      max: 100,
      default: 90,
    },
    experienceYears: {
      type: Number,
      min: 0,
      max: 20,
      default: 3,
    },
    featured: {
      type: Boolean,
      default: true,
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

export const Skill: Model<ISkill> =
  mongoose.models.Skill || mongoose.model<ISkill>("Skill", SkillSchema);

export default Skill;
