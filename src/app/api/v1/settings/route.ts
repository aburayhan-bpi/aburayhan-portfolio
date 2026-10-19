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
        tagline: "Frontend Developer",
        primaryEmail: "aburayhan.bpi@gmail.com",
        location: "Sherpur, Bogura, Bangladesh",
        availabilityStatus: "Available for New Contracts & Roles",
        responseTime: "< 2 hours",
        bio: "Frontend Developer with experience in React.js, Next.js, TypeScript, Redux Toolkit, and RTK Query. Experienced in building full-stack applications using Node.js, Express.js, REST APIs, and MongoDB across ERP, SaaS, and marketplace products. Skilled in building responsive, maintainable interfaces and translating product requirements into practical solutions.",
        githubUrl: "https://github.com",
        linkedinUrl: "https://linkedin.com",
        twitterUrl: "https://twitter.com",
        leetcodeUrl: "",
        blogUrl: "",
        resumeUrl: "",
        whatsapp: "+880 171 985 7898",
        yearsOfExperience: 3,
        completedProjectsCount: 15,
      });
    } else {
      let changed = false;
      if (settings.tagline && (settings.tagline.toLowerCase().includes("full-stack") || settings.tagline.toLowerCase().includes("full stack"))) {
        settings.tagline = "Frontend Developer";
        changed = true;
      }
      if (settings.bio && (settings.bio.toLowerCase().includes("full-stack") || settings.bio.toLowerCase().includes("full stack"))) {
        settings.bio = "Frontend Developer with experience in React.js, Next.js, TypeScript, Redux Toolkit, and RTK Query. Experienced in building full-stack applications using Node.js, Express.js, REST APIs, and MongoDB across ERP, SaaS, and marketplace products. Skilled in building responsive, maintainable interfaces and translating product requirements into practical solutions.";
        changed = true;
      }
      if (!settings.whatsapp || settings.whatsapp.includes("1789")) {
        settings.whatsapp = "+880 171 985 7898";
        changed = true;
      }
      if (changed) {
        await settings.save();
      }
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
