import connectToDatabase from "@/lib/db";
import { sendInquiryNotification } from "@/lib/mail";
import { checkRequestRateLimit, extractClientIp } from "@/lib/rateLimiter";
import Message from "@/models/Message";
import SecurityConfig from "@/models/SecurityConfig";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const ip = extractClientIp(request.headers);
    const userAgent = request.headers.get("user-agent") || "";

    // Contact form rate limiting check (prevents inbox flooding & mail bombing)
    const rateCheck = checkRequestRateLimit({
      ip,
      endpoint: "/api/v1/contact",
      userAgent,
      authRateLimitPer10Min: 5,
    });

    if (!rateCheck.allowed) {
      try {
        await connectToDatabase();
        await SecurityConfig.updateOne(
          { key: "global_security_config" },
          {
            $inc: { totalAttacksNeutralized: 1 },
            $push: {
              incidentLogs: {
                $each: [
                  {
                    ip,
                    endpoint: "/api/v1/contact",
                    reason: rateCheck.reason || "Spam flood limit triggered on contact form",
                    userAgent,
                    timestamp: new Date(),
                  },
                ],
                $slice: -100,
              },
            },
          },
          { upsert: true },
        );
      } catch {}

      return NextResponse.json(
        { success: false, error: rateCheck.reason },
        { status: rateCheck.statusCode || 429 },
      );
    }

    const body = await request.json();
    const { name, email, projectType, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Name, email, and message are required" },
        { status: 400 },
      );
    }

    // 1. Save to MongoDB
    let savedMessage = null;
    try {
      await connectToDatabase();
      savedMessage = await Message.create({
        name,
        email,
        projectType: projectType || "Full-Stack Web App",
        message,
        isRead: false,
      });
      console.log("💾 Inbound message saved to MongoDB:", savedMessage._id);
    } catch (dbErr) {
      console.error("⚠️ Failed to save message to MongoDB:", dbErr);
    }

    // 2. Send instant email notification to aburayhan.bpi@gmail.com via Resend
    let emailDispatched = false;
    try {
      const emailResult = await sendInquiryNotification({
        name,
        email,
        projectType: projectType || "General Inquiry",
        message,
      });
      emailDispatched = !!emailResult?.success;
    } catch (mailErr) {
      console.error("⚠️ Failed to dispatch Resend email:", mailErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Thank you for reaching out! Your message was received.",
        emailDispatched,
        leadId: savedMessage?._id || null,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("POST /api/v1/contact error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
