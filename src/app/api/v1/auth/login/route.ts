import connectToDatabase from "@/lib/db";
import { checkRequestRateLimit, extractClientIp } from "@/lib/rateLimiter";
import AdminUser from "@/models/Admin";
import SecurityConfig from "@/models/SecurityConfig";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const ip = extractClientIp(request.headers);
    const userAgent = request.headers.get("user-agent") || "";

    // Brute-force & DDoS rate limiting check
    const rateCheck = checkRequestRateLimit({
      ip,
      endpoint: "/api/v1/auth/login",
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
                    endpoint: "/api/v1/auth/login",
                    reason: rateCheck.reason || "Brute-force limit triggered on login",
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

    const { email, password } = await request.json();

    const normalizedEmail = (email || "").toLowerCase().trim();
    const adminEmail = (process.env.ADMIN_EMAIL || "aburayhan.bpi@gmail.com").toLowerCase().trim();
    const initialEnvPassword = process.env.ADMIN_INITIAL_PASSWORD || "Rayhan#Admin@2026!";

    let isMatch = false;
    let loggedInUser = null;

    try {
      await connectToDatabase();
      const adminInDb = await AdminUser.findOne({
        email: normalizedEmail,
      });

      if (adminInDb?.passwordHash) {
        // Strict database hash comparison — only the current active password matches!
        isMatch = await bcrypt.compare(password, adminInDb.passwordHash);
        if (isMatch) {
          adminInDb.lastLogin = new Date();
          await adminInDb.save();
          loggedInUser = adminInDb;
        }
      } else if (normalizedEmail === adminEmail) {
        // Initial setup before any password was changed or DB record created
        isMatch = password === initialEnvPassword;
        if (isMatch) {
          // Auto-seed admin user in database with hashed password
          const salt = await bcrypt.genSalt(10);
          const hash = await bcrypt.hash(initialEnvPassword, salt);
          loggedInUser = await AdminUser.create({
            email: adminEmail,
            passwordHash: hash,
            name: "Md Abu Rayhan",
            role: "ADMIN",
            avatar: "/logo.svg",
            lastLogin: new Date(),
          });
        }
      }
    } catch (dbErr) {
      console.error("Database connection error during login:", dbErr);
      return NextResponse.json(
        { success: false, error: "Authentication service temporarily unavailable" },
        { status: 500 },
      );
    }

    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const adminProfile = {
      id: loggedInUser?._id?.toString() || "admin-abu-rayhan",
      email: loggedInUser?.email || normalizedEmail,
      firstName: "Abu",
      lastName: "Rayhan",
      role: loggedInUser?.role || "ADMIN",
      avatar: loggedInUser?.avatar || "/logo.svg",
      phone: "+880 171 985 7898",
      location: "Sherpur, Bogura, Bangladesh",
    };

    const token = `rayhan-jwt-token-${Date.now()}`;

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful",
      user: adminProfile,
      token,
    });

    // Set secure HTTP cookies
    response.cookies.set("accessToken", token, {
      path: "/",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    response.cookies.set("userRole", "ADMIN", {
      path: "/",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: unknown) {
    console.error("POST /api/v1/auth/login error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
