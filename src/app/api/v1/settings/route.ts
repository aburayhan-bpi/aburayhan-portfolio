import connectToDatabase from "@/lib/db";
import SiteSetting from "@/models/SiteSetting";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();
    let settings = await SiteSetting.findOne();

    if (!settings) {
      settings = await SiteSetting.create({
        siteName: "Md Abu Rayhan",
        tagline: "Full-Stack Software Engineer & UI/UX Designer",
        primaryEmail: "aburayhan.bpi@gmail.com",
        location: "Sherpur, Bogura, Bangladesh (UTC+6)",
        availabilityStatus: "Available for New Contracts & Roles",
        responseTime: "< 2 hours",
        bio: "Full-Stack Software Engineer specialized in building high-performance Next.js applications, resilient REST APIs, and production ERP, SaaS & marketplace platforms.",
        githubUrl: "https://github.com",
        linkedinUrl: "https://linkedin.com",
        twitterUrl: "https://twitter.com",
        leetcodeUrl: "",
        blogUrl: "",
        resumeUrl: "",
        whatsapp: "+880 1789-322199",
        yearsOfExperience: 5,
        completedProjectsCount: 45,
      });
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error: unknown) {
    console.error("GET /api/v1/settings error:", error);
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

    const {
      siteName,
      tagline,
      primaryEmail,
      location,
      availabilityStatus,
      responseTime,
      bio,
      githubUrl,
      linkedinUrl,
      twitterUrl,
      leetcodeUrl,
      blogUrl,
      resumeUrl,
      whatsapp,
      yearsOfExperience,
      completedProjectsCount,
    } = body;

    let settings = await SiteSetting.findOne();

    const updateData = {
      siteName: siteName?.trim() || "Md Abu Rayhan",
      tagline: tagline?.trim(),
      primaryEmail: primaryEmail?.trim().toLowerCase(),
      location: location?.trim(),
      availabilityStatus: availabilityStatus?.trim(),
      responseTime: responseTime?.trim(),
      bio: bio?.trim(),
      githubUrl: githubUrl?.trim(),
      linkedinUrl: linkedinUrl?.trim(),
      twitterUrl: twitterUrl?.trim(),
      leetcodeUrl: leetcodeUrl?.trim(),
      blogUrl: blogUrl?.trim(),
      resumeUrl: resumeUrl?.trim(),
      whatsapp: whatsapp?.trim(),
      yearsOfExperience:
        typeof yearsOfExperience === "number"
          ? yearsOfExperience
          : Number(yearsOfExperience) || 5,
      completedProjectsCount:
        typeof completedProjectsCount === "number"
          ? completedProjectsCount
          : Number(completedProjectsCount) || 45,
    };

    if (!settings) {
      settings = await SiteSetting.create(updateData);
    } else {
      settings = await SiteSetting.findByIdAndUpdate(
        settings._id,
        { $set: updateData },
        { new: true, runValidators: true },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Site settings updated successfully",
      data: settings,
    });
  } catch (error: unknown) {
    console.error("PUT /api/v1/settings error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
