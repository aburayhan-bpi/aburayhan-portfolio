import connectToDatabase from "@/lib/db";
import { getInquiryReplyEmailHtml } from "@/lib/emailTemplates";
import { sendGmailSmtp } from "@/lib/smtp";
import Message from "@/models/Message";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { messageId, subject, replyText } = body;

    if (!messageId || !replyText?.trim()) {
      return NextResponse.json(
        { success: false, error: "Message ID and reply text are required" },
        { status: 400 },
      );
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return NextResponse.json(
        { success: false, error: "Original message not found" },
        { status: 404 },
      );
    }

    const replySubject =
      subject?.trim() || `Re: Inquiry regarding ${message.projectType || "Project"} — Md Abu Rayhan`;

    // Modern enterprise email layout
    const emailHtml = getInquiryReplyEmailHtml({
      recipientName: message.name,
      replyText: replyText.trim(),
      originalMessage: message.message,
      originalDate: new Date(message.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      projectType: message.projectType || "Project Inquiry",
    });

    // Send using verified Gmail SMTP TLS connection
    const sendResult = await sendGmailSmtp({
      to: message.email,
      toName: message.name,
      subject: replySubject,
      html: emailHtml,
      text: replyText,
    });

    if (!sendResult.success) {
      return NextResponse.json(
        { success: false, error: "Failed to dispatch email via SMTP" },
        { status: 500 },
      );
    }

    // Update MongoDB status
    message.isRead = true;
    message.isReplied = true;
    message.repliedAt = new Date();
    message.replyMessage = replyText.trim();
    await message.save();

    return NextResponse.json({
      success: true,
      message: `Reply email successfully delivered to ${message.email}`,
      data: message,
    });
  } catch (error: unknown) {
    console.error("POST /api/v1/messages/reply error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
