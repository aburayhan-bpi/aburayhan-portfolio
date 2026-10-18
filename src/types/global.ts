export interface IMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
  seasonNumber?: number;
  year?: number;
}

export interface IBaseResponse<T = void, M = IMeta> {
  success: boolean;
  statusCode: number;
  message: string;
  meta?: M;
  data?: T;
}

export enum IAllStatusEnum {
  ALL = "ALL",
  ACTIVE = "ACTIVE",
  BLOCKED = "BLOCKED",
  COMPLETED = "COMPLETED",
  PENDING = "PENDING",
  AVAILABLE = "AVAILABLE",
  UNAVAILABLE = "UNAVAILABLE",
  CANCELLED = "CANCELLED",
  INACTIVE = "INACTIVE",
  DISPUTED = "DISPUTED",
  DISABLED = "DISABLED",
  DISABILITES_CARE = "DISABILITES_CARE",
  SCHEDULED = "SCHEDULED",
  ERROR = "ERROR",
  ONGOING = "ONGOING",
  SUSPENDED = "SUSPENDED",
  FAILED = "FAILED",
  SUCCESS = "SUCCESS",
  UNKNOWN = "UNKNOWN",
  IN_PROGRESS = "IN_PROGRESS",
  CLAIMED = "CLAIMED",
}

export const enum IRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  STUDENT = "STUDENT",
  OWNER = "OWNER",
}

export interface ChildrenProps {
  children: React.ReactNode;
}

// =========================================================================
// AUTHENTICATION TYPES
// =========================================================================

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IAdminProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  location: string | null;
  profilePictureUrl: string | null;
  role: IRole;
  status: IAllStatusEnum.ACTIVE | IAllStatusEnum.INACTIVE;
  twoFactor: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ILoginData = IAdminProfile & {
  accessToken: string;
};

export type ILoginResponse = IBaseResponse<ILoginData>;

export interface IForgotPasswordPayload {
  email: string;
}

export type IForgotPasswordResponse = IBaseResponse<{
  message: string;
  verificationToken?: string;
}>;

export interface IResetPasswordPayload {
  newPassword: string;
  confirmPassword: string;
  token: string;
}

export type IResetPasswordResponse = IBaseResponse;

export interface IVerifyOTPPayload {
  type: "PASSWORD_RESET";
  otp: string;
  verificationToken: string;
}

export type IVerifyOTPResponse = IBaseResponse<{ resetToken: string }>;

export interface IResendOTPReqBody {
  email: string;
}

export type IResendOTPBaseResponse = IBaseResponse<{
  verificationToken?: string;
}>;

// =========================================================================
// PORTFOLIO CORE DATA & CMS TYPES (MD ABU RAYHAN)
// =========================================================================

export interface IProject {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  category: "Full-Stack ERP" | "SaaS Dashboard" | "Marketplace" | "FinTech" | "Enterprise Web" | string;
  role: string;
  impactMetrics: string[];
  techStack: string[];
  featured: boolean;
  githubUrl?: string;
  liveUrl?: string;
  screenshotUrl: string;
  order?: number;
  status?: "Live" | "Client Beta" | "In Dev";
  createdAt?: string;
  updatedAt?: string;
}

export interface ISkill {
  id?: string;
  _id?: string;
  name: string;
  category: "Frontend" | "Backend" | "DevOps & Cloud" | "Databases & Tools" | "Architecture" | string;
  proficiency: number;
  experienceYears: number;
  featured: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ISkillGroup {
  title: string;
  tagline: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  skills: string[];
}

export interface IExperience {
  _id?: string;
  category: "experience" | "education";
  title: string;
  organization: string;
  period: string;
  location?: string;
  type: string;
  description?: string;
  highlights: string[];
  tech: string[];
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface IEducation {
  _id?: string;
  title: string;
  organization: string;
  period: string;
  type: string;
  description?: string;
  order?: number;
}

export interface ISiteSetting {
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
  createdAt?: string;
  updatedAt?: string;
}

export interface IMessage {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  projectType?: string;
  message: string;
  isRead?: boolean;
  replied?: boolean;
  replyMessage?: string;
  repliedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface IStatusBadgeConfig {
  cleanText: string;
  dotColor: string;
  pingColor: string;
  textColor: string;
  badgeClass: string;
  shouldPing: boolean;
  type: "available" | "interviewing" | "consulting" | "booked";
}
