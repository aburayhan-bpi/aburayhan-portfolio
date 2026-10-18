import connectToDatabase from "@/lib/db";
import Project from "@/models/Project";
import { NextRequest, NextResponse } from "next/server";

const DEFAULT_SEED_PROJECTS = [
  {
    id: "raantech-erp",
    title: "RaanTech — Business Operations ERP",
    category: "Full-Stack ERP",
    status: "Live",
    mockUrl: "https://raantech-erp.app/dashboard",
    tagline: "End-to-End Enterprise Resource & Inventory Management Platform",
    description:
      "A comprehensive full-stack ERP architecture engineered to manage inventory, procurement, sales workflows, customer lifecycle, finances, and multi-branch staff administration.",
    keyFeatures: [
      "Product, supplier & purchase tracking with high-speed CSV/Excel data import & export.",
      "Complete customer order lifecycle: returns, refunds, cancellations & automated email notifications.",
      "Granular role-based staff administration (RBAC), audit activity logs & soft-delete data recovery.",
    ],
    techStack: ["Next.js", "TypeScript", "Redux Toolkit", "Node.js", "MongoDB", "Express.js"],
    liveUrl: "https://raantech-demo.dev",
    githubUrl: "https://github.com",
    isPrivateRepo: false,
    featured: true,
    views: 890,
    order: 1,
  },
  {
    id: "uaepl8-marketplace",
    title: "UAEPL8 — Premium Vehicle Plate Marketplace",
    category: "Marketplace",
    status: "Client Beta",
    mockUrl: "https://uaepl8.ae/marketplace",
    tagline: "High-Ticket Automotive Luxury Marketplace for the UAE",
    description:
      "Engineered for high-net-worth clients in the United Arab Emirates to discover, value, and trade premium vehicle registration plates with real-time valuation algorithms and VIP sourcing.",
    keyFeatures: [
      "Multi-facet search & filtering engine by Emirate, digit length, customized letters & plate code.",
      "Automated dynamic plate valuation models and VIP custom plate sourcing requests.",
      "Dedicated buyer & seller interfaces with real-time offer negotiation and admin approvals.",
    ],
    techStack: ["Next.js", "TypeScript", "Redux Toolkit", "Tailwind CSS", "Zod", "Framer Motion"],
    liveUrl: "https://uaepl8.ae",
    githubUrl: "https://github.com",
    isPrivateRepo: true,
    featured: true,
    views: 640,
    order: 2,
  },
  {
    id: "fansphere-saas",
    title: "FanSphere — SaaS-Ready Admin Dashboard",
    category: "SaaS Dashboard",
    status: "In Dev",
    mockUrl: "https://fansphere.io/admin",
    tagline: "Modular Enterprise Console for Analytics, Marketplaces & Events",
    description:
      "A production-ready, modular dashboard foundation built with reusable component architecture, high-density analytics charts, and strict TypeScript contracts.",
    keyFeatures: [
      "Modular dashboard architecture featuring 30+ reusable UI components and shared design tokens.",
      "Role-Based Access Control (RBAC) with secure session handling and protected route wrappers.",
      "Interactive telemetry charts, paginated data tables, dialog modals, and API-ready RTK hooks.",
    ],
    techStack: ["Next.js", "React 19", "Redux Toolkit", "Radix UI", "Recharts", "Framer Motion"],
    liveUrl: "https://fansphere.dev",
    githubUrl: "https://github.com",
    isPrivateRepo: true,
    featured: true,
    views: 410,
    order: 3,
  },
];

// GET /api/v1/projects
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const featuredOnly = searchParams.get("featured") === "true";

    // Auto-seed if collection is empty
    const count = await Project.countDocuments();
    if (count === 0) {
      await Project.insertMany(DEFAULT_SEED_PROJECTS);
      console.log("🌱 Auto-seeded initial portfolio projects into MongoDB");
    }

    const query: Record<string, unknown> = {};
    if (category && category !== "All") {
      query.category = category;
    }
    if (featuredOnly) {
      query.featured = true;
    }

    const projects = await Project.find(query).sort({ order: 1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error: unknown) {
    console.error("GET /api/v1/projects error:", error);
    // Graceful fallback to default seed array if DB connection fails temporarily
    return NextResponse.json({
      success: true,
      count: DEFAULT_SEED_PROJECTS.length,
      data: DEFAULT_SEED_PROJECTS,
      fallback: true,
    });
  }
}

// POST /api/v1/projects
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();

    if (!body.title) {
      return NextResponse.json(
        { success: false, error: "Project title is required" },
        { status: 400 },
      );
    }

    const slug =
      body.id ||
      body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const newProject = await Project.create({
      ...body,
      id: slug,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Project successfully created",
        data: newProject,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("POST /api/v1/projects error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
