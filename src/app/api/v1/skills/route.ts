import connectToDatabase from "@/lib/db";
import Skill from "@/models/Skill";
import { NextRequest, NextResponse } from "next/server";

const DEFAULT_SKILLS = [
  // Frontend
  { name: "Next.js (App Router)", category: "Frontend", proficiency: 95, experienceYears: 4, featured: true, order: 1 },
  { name: "React.js 19", category: "Frontend", proficiency: 95, experienceYears: 5, featured: true, order: 2 },
  { name: "TypeScript", category: "Frontend", proficiency: 92, experienceYears: 4, featured: true, order: 3 },
  { name: "JavaScript (ES6+)", category: "Frontend", proficiency: 95, experienceYears: 5, featured: true, order: 4 },
  { name: "Redux Toolkit & RTK Query", category: "Frontend", proficiency: 90, experienceYears: 4, featured: true, order: 5 },
  { name: "Tailwind CSS v4", category: "Frontend", proficiency: 98, experienceYears: 5, featured: true, order: 6 },
  { name: "Radix UI & Shadcn", category: "Frontend", proficiency: 94, experienceYears: 3, featured: true, order: 7 },
  // Backend
  { name: "Node.js", category: "Backend", proficiency: 90, experienceYears: 4, featured: true, order: 8 },
  { name: "Express.js", category: "Backend", proficiency: 90, experienceYears: 4, featured: true, order: 9 },
  { name: "MongoDB & Mongoose", category: "Backend", proficiency: 92, experienceYears: 4, featured: true, order: 10 },
  { name: "RESTful API Design", category: "Backend", proficiency: 94, experienceYears: 4, featured: true, order: 11 },
  { name: "JWT Authentication & RBAC", category: "Backend", proficiency: 92, experienceYears: 4, featured: true, order: 12 },
  { name: "Firebase", category: "Backend", proficiency: 85, experienceYears: 3, featured: true, order: 13 },
  // AI & Tools
  { name: "Cursor IDE & AI Flow", category: "AI & Tools", proficiency: 96, experienceYears: 2, featured: true, order: 14 },
  { name: "GitHub Copilot", category: "AI & Tools", proficiency: 95, experienceYears: 3, featured: true, order: 15 },
  { name: "Claude 3.7 & ChatGPT", category: "AI & Tools", proficiency: 95, experienceYears: 3, featured: true, order: 16 },
  { name: "Figma to Code", category: "AI & Tools", proficiency: 90, experienceYears: 4, featured: true, order: 17 },
  { name: "Git & GitHub Flow", category: "AI & Tools", proficiency: 92, experienceYears: 5, featured: true, order: 18 },
  // DevOps & Cloud
  { name: "PostgreSQL & Prisma", category: "DevOps & Cloud", proficiency: 82, experienceYears: 2, featured: true, order: 19 },
  { name: "Docker Basics", category: "DevOps & Cloud", proficiency: 78, experienceYears: 2, featured: true, order: 20 },
  { name: "CI/CD Workflows", category: "DevOps & Cloud", proficiency: 80, experienceYears: 2, featured: true, order: 21 },
  { name: "Agile & Sprint Delivery", category: "DevOps & Cloud", proficiency: 90, experienceYears: 4, featured: true, order: 22 },
];

export async function GET() {
  try {
    await connectToDatabase();
    let skills = await Skill.find().sort({ order: 1, createdAt: 1 });

    // Auto-seed if collection is empty
    if (skills.length === 0) {
      await Skill.insertMany(DEFAULT_SKILLS);
      skills = await Skill.find().sort({ order: 1, createdAt: 1 });
    }

    return NextResponse.json({
      success: true,
      count: skills.length,
      data: skills,
    });
  } catch (error: unknown) {
    console.error("GET /api/v1/skills error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { name, category, proficiency, experienceYears, featured, order } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, error: "Skill name is required" },
        { status: 400 },
      );
    }

    const newSkill = await Skill.create({
      name: name.trim(),
      category: category || "Frontend",
      proficiency: typeof proficiency === "number" ? proficiency : 90,
      experienceYears: typeof experienceYears === "number" ? experienceYears : 3,
      featured: typeof featured === "boolean" ? featured : true,
      order: typeof order === "number" ? order : 0,
    });

    return NextResponse.json({
      success: true,
      message: "Skill created successfully",
      data: newSkill,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { id, name, category, proficiency, experienceYears, featured, order } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Skill ID is required" },
        { status: 400 },
      );
    }

    const updated = await Skill.findByIdAndUpdate(
      id,
      {
        $set: {
          name: name?.trim(),
          category,
          proficiency,
          experienceYears,
          featured,
          order,
        },
      },
      { new: true, runValidators: true },
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Skill not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Skill updated successfully",
      data: updated,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await request.json();
        id = body?.id;
      } catch {
        // Body was empty
      }
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Skill ID is required" },
        { status: 400 },
      );
    }

    const deleted = await Skill.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Skill not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Skill deleted successfully",
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
