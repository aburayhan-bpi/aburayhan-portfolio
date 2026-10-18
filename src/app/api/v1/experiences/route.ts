import connectToDatabase from "@/lib/db";
import Experience from "@/models/Experience";
import { NextRequest, NextResponse } from "next/server";

const DEFAULT_EXPERIENCES = [
  {
    category: "experience",
    organization: "SM Technology",
    title: "Frontend Developer",
    period: "July 2025 – September 2026",
    location: "Dhaka, Bangladesh • Remote / Hybrid",
    type: "Full-Time",
    highlights: [
      "Engineered production web applications using Next.js, React.js, TypeScript, Redux Toolkit, and RTK Query.",
      "Collaborated directly with backend teams and international clients to translate complex product specs into reliable, intuitive UIs.",
      "Architected reusable component libraries and API-driven workflows across ERP, SaaS, and marketplace solutions.",
      "Contributed to core frontend design patterns, reducing redundant code and speeding up sprint velocity.",
    ],
    tech: ["Next.js", "TypeScript", "Redux Toolkit", "RTK Query", "Tailwind CSS"],
    order: 1,
  },
  {
    category: "education",
    type: "Diploma in Engineering",
    title: "Computer Technology",
    organization: "Bogura Polytechnic Institute",
    period: "2020 – 2024",
    description:
      "Core foundation in computer science principles, data structures, algorithms, and software development fundamentals.",
    highlights: [],
    tech: [],
    order: 1,
  },
  {
    category: "education",
    type: "Professional Certification",
    title: "Complete Web Development Course",
    organization: "Programming Hero",
    period: "June 2024 – March 2025",
    description:
      "Comprehensive full-stack engineering with MERN stack, Next.js, TypeScript, API integration, and cloud databases.",
    highlights: [],
    tech: [],
    order: 2,
  },
  {
    category: "education",
    type: "Professional Certification",
    title: "Fundamentals of Webpage Design",
    organization: "NACTAR (National Academy for Computer Training and Research)",
    period: "June 2024 – September 2024",
    description:
      "Specialized training in modern responsive web architecture, semantic design, and accessibility standards.",
    highlights: [],
    tech: [],
    order: 3,
  },
  {
    category: "education",
    type: "Professional Certification",
    title: "Web Development Specialization",
    organization: "Nova Institute of Technology & Management",
    period: "June 2023 – Dec 2023",
    description:
      "Hands-on project engineering with modern JavaScript, DOM architecture, and responsive user interfaces.",
    highlights: [],
    tech: [],
    order: 4,
  },
];

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const count = await Experience.countDocuments();
    if (count === 0) {
      await Experience.insertMany(DEFAULT_EXPERIENCES);
    }

    const query: Record<string, unknown> = {};
    if (category) {
      query.category = category;
    }

    const items = await Experience.find(query).sort({ order: 1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (error: unknown) {
    console.error("GET /api/v1/experiences error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const {
      category = "experience",
      title,
      organization,
      period,
      location = "",
      type = "Full-Time",
      description = "",
      highlights = [],
      tech = [],
      order = 0,
    } = body;

    if (!title || !organization || !period) {
      return NextResponse.json(
        { success: false, error: "Title, organization, and period are required." },
        { status: 400 }
      );
    }

    const newItem = await Experience.create({
      category,
      title: title.trim(),
      organization: organization.trim(),
      period: period.trim(),
      location: location.trim(),
      type: type.trim(),
      description: description.trim(),
      highlights: Array.isArray(highlights)
        ? highlights.map((h: string) => h.trim()).filter(Boolean)
        : [],
      tech: Array.isArray(tech)
        ? tech.map((t: string) => t.trim()).filter(Boolean)
        : [],
      order: Number(order) || 0,
    });

    return NextResponse.json({
      success: true,
      message: `${category === "experience" ? "Experience" : "Education"} item created successfully`,
      data: newItem,
    });
  } catch (error: unknown) {
    console.error("POST /api/v1/experiences error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { _id, ...updatePayload } = body;

    if (!_id) {
      return NextResponse.json(
        { success: false, error: "Missing required item _id for update." },
        { status: 400 }
      );
    }

    if (updatePayload.highlights && Array.isArray(updatePayload.highlights)) {
      updatePayload.highlights = updatePayload.highlights
        .map((h: string) => (typeof h === "string" ? h.trim() : ""))
        .filter(Boolean);
    }
    if (updatePayload.tech && Array.isArray(updatePayload.tech)) {
      updatePayload.tech = updatePayload.tech
        .map((t: string) => (typeof t === "string" ? t.trim() : ""))
        .filter(Boolean);
    }

    const updated = await Experience.findByIdAndUpdate(
      _id,
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Item not found to update." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Item updated successfully",
      data: updated,
    });
  } catch (error: unknown) {
    console.error("PUT /api/v1/experiences error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing required item ID to delete." },
        { status: 400 }
      );
    }

    const deleted = await Experience.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Item not found to delete." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error: unknown) {
    console.error("DELETE /api/v1/experiences error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
