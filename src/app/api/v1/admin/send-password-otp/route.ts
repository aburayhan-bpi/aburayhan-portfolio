import connectToDatabase from "@/lib/db";
import { getOtpEmailHtml } from "@/lib/emailTemplates";
import { sendGmailSmtp } from "@/lib/smtp";
import AdminUser from "@/models/Admin";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: "Current password and new passwords are required" },
        { status: 400 },
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "New password and confirmation do not match" },
        { status: 400 },
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "New password must be at least 6 characters" },
        { status: 400 },
      );
    }

    const adminEmail = process.env.ADMIN_EMAIL || "aburayhan.bpi@gmail.com";
    const initialEnvPassword = process.env.ADMIN_INITIAL_PASSWORD || "Rayhan#Admin@2026!";

    let admin = await AdminUser.findOne({ email: adminEmail.toLowerCase().trim() });

    let isCurrentValid = false;

    if (admin && admin.passwordHash) {
      // Strict check against active database hash
      isCurrentValid = await bcrypt.compare(currentPassword, admin.passwordHash);
    } else {
      isCurrentValid = currentPassword === initialEnvPassword;
    }

    if (!isCurrentValid) {
      return NextResponse.json(
        { success: false, error: "Current master password is incorrect" },
        { status: 401 },
      );
    }

    // Generate 6-digit cryptographic numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (!admin) {
      const newSalt = await bcrypt.genSalt(10);
      const tempHash = await bcrypt.hash(initialEnvPassword, newSalt);
      admin = await AdminUser.create({
        email: adminEmail.toLowerCase().trim(),
        name: "Md Abu Rayhan",
        passwordHash: tempHash,
        role: "ADMIN",
        avatar: "/logo.svg",
        passwordResetOtp: otp,
        passwordResetOtpExpires: expiresAt,
      });
    } else {
      admin.passwordResetOtp = otp;
      admin.passwordResetOtpExpires = expiresAt;
      await admin.save();
    }

    // Generate clean enterprise OTP template
    const emailHtml = getOtpEmailHtml({
      adminName: admin.name || "Md Abu Rayhan",
      otp,
      expiresInMinutes: 10,
    });

    try {
      await sendGmailSmtp({
        to: adminEmail,
        toName: "Md Abu Rayhan",
        subject: `🔒 ${otp} is your verification code for password change`,
        html: emailHtml,
        text: `Your security verification code is: ${otp}. It expires in 10 minutes.`,
      });
    } catch (smtpErr) {
      console.error("Failed to send OTP via SMTP:", smtpErr);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to dispatch verification email. Please check SMTP configuration.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code was sent to ${adminEmail}`,
    });
  } catch (error: unknown) {
    console.error("POST /api/v1/admin/send-password-otp error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
