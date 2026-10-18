import connectToDatabase from "@/lib/db";
import { syncSecurityCache } from "@/lib/rateLimiter";
import SecurityConfig, { ISecurityConfig } from "@/models/SecurityConfig";
import { NextRequest, NextResponse } from "next/server";

async function getOrCreateSecurityConfig(): Promise<ISecurityConfig> {
  let config = await SecurityConfig.findOne({ key: "global_security_config" });
  if (!config) {
    config = await SecurityConfig.create({
      key: "global_security_config",
      underAttackMode: false,
      rateLimitPerMinute: 60,
      authRateLimitPer10Min: 5,
      autoBanThreshold: 3,
      autoBanDurationMinutes: 60,
      totalAttacksNeutralized: 0,
      blacklistedIps: [],
      whitelistedIps: [
        { ip: "127.0.0.1", label: "Localhost Development", addedAt: new Date() },
      ],
      incidentLogs: [],
    });
  }
  return config;
}

export async function GET() {
  try {
    await connectToDatabase();
    const config = await getOrCreateSecurityConfig();

    // Sync in-memory rate limiter cache
    syncSecurityCache({
      underAttackMode: config.underAttackMode,
      blacklistedIps: config.blacklistedIps,
      whitelistedIps: config.whitelistedIps,
    });

    return NextResponse.json({
      success: true,
      data: {
        underAttackMode: config.underAttackMode,
        rateLimitPerMinute: config.rateLimitPerMinute,
        authRateLimitPer10Min: config.authRateLimitPer10Min,
        autoBanThreshold: config.autoBanThreshold,
        autoBanDurationMinutes: config.autoBanDurationMinutes,
        totalAttacksNeutralized: config.totalAttacksNeutralized,
        blacklistedIps: config.blacklistedIps,
        whitelistedIps: config.whitelistedIps,
        incidentLogs: config.incidentLogs.slice(0, 50).reverse(),
      },
    });
  } catch (error) {
    console.error("GET /api/v1/admin/security error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const config = await getOrCreateSecurityConfig();
    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: "Action is required" },
        { status: 400 },
      );
    }

    switch (action) {
      case "toggle_attack_mode": {
        config.underAttackMode = Boolean(body.enabled);
        break;
      }

      case "update_limits": {
        if (body.rateLimitPerMinute)
          config.rateLimitPerMinute = Number(body.rateLimitPerMinute);
        if (body.authRateLimitPer10Min)
          config.authRateLimitPer10Min = Number(body.authRateLimitPer10Min);
        if (body.autoBanThreshold)
          config.autoBanThreshold = Number(body.autoBanThreshold);
        if (body.autoBanDurationMinutes)
          config.autoBanDurationMinutes = Number(body.autoBanDurationMinutes);
        break;
      }

      case "add_blacklist": {
        const ip = body.ip?.trim();
        if (!ip) {
          return NextResponse.json(
            { success: false, error: "Valid IP address is required" },
            { status: 400 },
          );
        }
        // Avoid duplicate
        if (!config.blacklistedIps.some((b) => b.ip === ip)) {
          config.blacklistedIps.unshift({
            ip,
            reason: body.reason || "Manual ban by administrator",
            addedAt: new Date(),
            isPermanent: Boolean(body.isPermanent),
          });
        }
        break;
      }

      case "remove_blacklist": {
        const ip = body.ip?.trim();
        config.blacklistedIps = config.blacklistedIps.filter((b) => b.ip !== ip);
        break;
      }

      case "add_whitelist": {
        const ip = body.ip?.trim();
        if (!ip) {
          return NextResponse.json(
            { success: false, error: "Valid IP address is required" },
            { status: 400 },
          );
        }
        if (!config.whitelistedIps.some((w) => w.ip === ip)) {
          config.whitelistedIps.unshift({
            ip,
            label: body.label || "Developer IP",
            addedAt: new Date(),
          });
        }
        break;
      }

      case "remove_whitelist": {
        const ip = body.ip?.trim();
        config.whitelistedIps = config.whitelistedIps.filter((w) => w.ip !== ip);
        break;
      }

      case "clear_logs": {
        config.incidentLogs = [];
        break;
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 },
        );
    }

    await config.save();

    // Re-sync memory cache
    syncSecurityCache({
      underAttackMode: config.underAttackMode,
      blacklistedIps: config.blacklistedIps,
      whitelistedIps: config.whitelistedIps,
    });

    return NextResponse.json({
      success: true,
      message: "Security configuration updated successfully",
      data: {
        underAttackMode: config.underAttackMode,
        rateLimitPerMinute: config.rateLimitPerMinute,
        authRateLimitPer10Min: config.authRateLimitPer10Min,
        autoBanThreshold: config.autoBanThreshold,
        autoBanDurationMinutes: config.autoBanDurationMinutes,
        totalAttacksNeutralized: config.totalAttacksNeutralized,
        blacklistedIps: config.blacklistedIps,
        whitelistedIps: config.whitelistedIps,
        incidentLogs: config.incidentLogs.slice(0, 50).reverse(),
      },
    });
  } catch (error) {
    console.error("POST /api/v1/admin/security error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
