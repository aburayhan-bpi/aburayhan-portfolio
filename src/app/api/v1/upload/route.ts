import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dibrstmho",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image file provided" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "portfolio/projects",
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      uploadStream.end(buffer);
    });

    const result = uploadResponse as {
      secure_url: string;
      public_id: string;
      format: string;
      width: number;
      height: number;
    };

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error: unknown) {
    console.error("Cloudinary upload error:", error);
    const err = error as { message?: string; http_code?: number };
    const errorMsg =
      err?.message?.includes("403") || err?.http_code === 403
        ? "Cloudinary Access Key lacks 'Create/Upload' permission (403 Forbidden). Please grant upload permission in Cloudinary console or use Master API key."
        : err?.message || "Failed to upload image";

    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: err?.http_code || 500 },
    );
  }
}
