import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBlacklistedIp {
  ip: string;
  reason: string;
  addedAt: Date;
  isPermanent: boolean;
}

export interface IWhitelistedIp {
  ip: string;
  label: string;
  addedAt: Date;
}

export interface IAttackIncidentLog {
  ip: string;
  endpoint: string;
  reason: string;
  userAgent?: string;
  timestamp: Date;
}

export interface ISecurityConfig extends Document {
  key: string; // "global_security_config"
  underAttackMode: boolean;
  rateLimitPerMinute: number;
  authRateLimitPer10Min: number;
  autoBanThreshold: number;
  autoBanDurationMinutes: number;
  totalAttacksNeutralized: number;
  blacklistedIps: IBlacklistedIp[];
  whitelistedIps: IWhitelistedIp[];
  incidentLogs: IAttackIncidentLog[];
  updatedAt: Date;
}

const BlacklistedIpSchema = new Schema<IBlacklistedIp>(
  {
    ip: { type: String, required: true },
    reason: { type: String, default: "Rate limit violation" },
    addedAt: { type: Date, default: Date.now },
    isPermanent: { type: Boolean, default: false },
  },
  { _id: false },
);

const WhitelistedIpSchema = new Schema<IWhitelistedIp>(
  {
    ip: { type: String, required: true },
    label: { type: String, default: "Trusted Developer IP" },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const AttackIncidentLogSchema = new Schema<IAttackIncidentLog>(
  {
    ip: { type: String, required: true },
    endpoint: { type: String, required: true },
    reason: { type: String, required: true },
    userAgent: { type: String, default: "Unknown" },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false },
);

const SecurityConfigSchema = new Schema<ISecurityConfig>(
  {
    key: {
      type: String,
      default: "global_security_config",
      unique: true,
    },
    underAttackMode: {
      type: Boolean,
      default: false,
    },
    rateLimitPerMinute: {
      type: Number,
      default: 60,
    },
    authRateLimitPer10Min: {
      type: Number,
      default: 5,
    },
    autoBanThreshold: {
      type: Number,
      default: 3,
    },
    autoBanDurationMinutes: {
      type: Number,
      default: 60,
    },
    totalAttacksNeutralized: {
      type: Number,
      default: 0,
    },
    blacklistedIps: {
      type: [BlacklistedIpSchema],
      default: [],
    },
    whitelistedIps: {
      type: [WhitelistedIpSchema],
      default: [],
    },
    incidentLogs: {
      type: [AttackIncidentLogSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export const SecurityConfig: Model<ISecurityConfig> =
  mongoose.models.SecurityConfig ||
  mongoose.model<ISecurityConfig>("SecurityConfig", SecurityConfigSchema);

export default SecurityConfig;
