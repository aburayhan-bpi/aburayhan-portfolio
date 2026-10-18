import mongoose, { Document, Model, Schema } from "mongoose";

export interface IAdminUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  role: "ADMIN" | "SUPER_ADMIN";
  avatar?: string;
  passwordResetOtp?: string | null;
  passwordResetOtpExpires?: Date | null;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema: Schema<IAdminUser> = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      default: "Md Abu Rayhan",
    },
    role: {
      type: String,
      enum: ["ADMIN", "SUPER_ADMIN"],
      default: "ADMIN",
    },
    avatar: {
      type: String,
      default: "/logo.svg",
    },
    passwordResetOtp: {
      type: String,
      default: null,
    },
    passwordResetOtpExpires: {
      type: Date,
      default: null,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

export const AdminUser: Model<IAdminUser> =
  mongoose.models.AdminUser ||
  mongoose.model<IAdminUser>("AdminUser", AdminSchema);

export default AdminUser;
