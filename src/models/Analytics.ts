import mongoose, { Document, Model, Schema } from "mongoose";

export interface IVisitorEvent {
  timestamp: Date;
  ip: string;
  path: string;
  referrer: string;
  device: "desktop" | "mobile" | "tablet" | "other";
  deviceModel?: string;
  browser: string;
  os: string;
  country: string;
  city: string;
  durationSeconds: number;
}

export interface IAnalytics extends Document {
  date: string; // Format: "YYYY-MM-DD"
  totalViews: number;
  uniqueVisitors: number;
  totalDurationSeconds: number;
  visitorHashes: string[];
  referrers: Map<string, number>;
  devices: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  browsers: Map<string, number>;
  operatingSystems: Map<string, number>;
  pages: Map<string, number>;
  recentEvents: IVisitorEvent[];
  createdAt: Date;
  updatedAt: Date;
}

const VisitorEventSchema = new Schema<IVisitorEvent>(
  {
    timestamp: { type: Date, default: Date.now },
    ip: { type: String, default: "127.0.0.1" },
    path: { type: String, default: "/" },
    referrer: { type: String, default: "Direct" },
    device: { type: String, default: "desktop" },
    deviceModel: { type: String, default: "" },
    browser: { type: String, default: "Chrome" },
    os: { type: String, default: "Windows" },
    country: { type: String, default: "Global" },
    city: { type: String, default: "" },
    durationSeconds: { type: Number, default: 0 },
  },
  { _id: false },
);

const AnalyticsSchema = new Schema<IAnalytics>(
  {
    date: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    totalViews: {
      type: Number,
      default: 0,
    },
    uniqueVisitors: {
      type: Number,
      default: 0,
    },
    totalDurationSeconds: {
      type: Number,
      default: 0,
    },
    visitorHashes: {
      type: [String],
      default: [],
    },
    referrers: {
      type: Map,
      of: Number,
      default: {},
    },
    devices: {
      desktop: { type: Number, default: 0 },
      mobile: { type: Number, default: 0 },
      tablet: { type: Number, default: 0 },
    },
    browsers: {
      type: Map,
      of: Number,
      default: {},
    },
    operatingSystems: {
      type: Map,
      of: Number,
      default: {},
    },
    pages: {
      type: Map,
      of: Number,
      default: {},
    },
    recentEvents: {
      type: [VisitorEventSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export const Analytics: Model<IAnalytics> =
  mongoose.models.Analytics ||
  mongoose.model<IAnalytics>("Analytics", AnalyticsSchema);

export default Analytics;
