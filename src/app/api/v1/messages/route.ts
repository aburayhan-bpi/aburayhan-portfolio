import connectToDatabase from "@/lib/db";
import Message from "@/models/Message";
import { NextRequest, NextResponse } from "next/server";

// GET /api/v1/messages (List inquiries for admin)
export async function GET() {
  try {
    await connectToDatabase();
    const messages = await Message.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error: unknown) {
    console.error("GET /api/v1/messages error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}

// PATCH /api/v1/messages (Toggle read/unread or bulk update)
export async function PATCH(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { id, isRead } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Message ID is required" },
        { status: 400 },
      );
    }

    const updated = await Message.findByIdAndUpdate(
      id,
      { $set: { isRead } },
      { new: true },
    );

    return NextResponse.json({
      success: true,
      message: "Message updated",
      data: updated,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}

// DELETE /api/v1/messages?id=... or body { id }
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
        // Body was empty or not JSON
      }
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Message ID is required" },
        { status: 400 },
      );
    }

    const deleted = await Message.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Message not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}

