import connectToDatabase from "@/lib/db";
import { getPasswordChangedEmailHtml } from "@/lib/emailTemplates";
import { sendGmailSmtp } from "@/lib/smtp";
import AdminUser from "@/models/Admin";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword, otp } = body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: "All password fields are required" },
        { status: 400 },
      );
    }

    if (!otp || !otp.toString().trim()) {
      return NextResponse.json(
        { success: false, error: "Security OTP verification code is required" },
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
        { success: false, error: "New password must be at least 6 characters long" },
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
        { success: false, error: "Current password is incorrect" },
        { status: 401 },
      );
    }

    // Verify OTP
    if (!admin?.passwordResetOtp || admin.passwordResetOtp !== otp.toString().trim()) {
      return NextResponse.json(
        { success: false, error: "Invalid verification code. Please check your email." },
        { status: 400 },
      );
    }

    if (!admin.passwordResetOtpExpires || new Date() > admin.passwordResetOtpExpires) {
      return NextResponse.json(
        { success: false, error: "Verification code has expired. Please request a new code." },
        { status: 400 },
      );
    }

    const newSalt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, newSalt);

    if (admin) {
      admin.passwordHash = newHash;
      admin.passwordResetOtp = null;
      admin.passwordResetOtpExpires = null;
      await admin.save();
    } else {
      admin = await AdminUser.create({
        email: adminEmail.toLowerCase().trim(),
        name: "Md Abu Rayhan",
        passwordHash: newHash,
        role: "ADMIN",
        avatar: "/logo.svg",
      });
    }

    // Send instant security alert confirmation email via Gmail SMTP
    try {
      const changedAtFormatted = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Dhaka",
        dateStyle: "full",
        timeStyle: "medium",
      }) + " (GMT+6)";

      const emailHtml = getPasswordChangedEmailHtml({
        adminName: admin.name || "Md Abu Rayhan",
        changedAt: changedAtFormatted,
      });

      await sendGmailSmtp({
        to: adminEmail,
        toName: "Md Abu Rayhan",
        subject: "🔒 Security Alert: Your Admin Password Was Changed",
        html: emailHtml,
        text: `Your master admin password was successfully changed at ${changedAtFormatted}. If you did not make this change, please secure your account immediately.`,
      });
    } catch (mailErr) {
      console.error("Failed to send password change confirmation email:", mailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Admin password updated securely. Confirmation email dispatched.",
    });
  } catch (error: unknown) {
    console.error("POST /api/v1/admin/change-password error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
