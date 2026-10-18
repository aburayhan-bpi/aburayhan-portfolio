import connectToDatabase from "@/lib/db";
import Project from "@/models/Project";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/v1/projects/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const project = await Project.findOne({
      $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: project });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}

// PUT /api/v1/projects/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();

    const updated = await Project.findOneAndUpdate(
      { $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
      { $set: body },
      { new: true, runValidators: true },
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Project not found to update" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Project updated successfully",
      data: updated,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}

// DELETE /api/v1/projects/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const deleted = await Project.findOneAndDelete({
      $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Project not found to delete" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Project successfully deleted",
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
