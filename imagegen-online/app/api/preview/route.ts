import { NextRequest, NextResponse } from "next/server";
import { detectPlatform, isValidUrl } from "@/lib/detectPlatform";
import { extractImageFromUrl } from "@/lib/scrapeImage";
import { platformInfo } from "@/lib/platformInfo";

type RequestBody = {
  url: string;
};

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();
    const { url } = body;

    // ❌ URL validation
    if (!url || !isValidUrl(url)) {
      return NextResponse.json(
        { success: false, message: "Invalid URL" },
        { status: 400 }
      );
    }

    // 🔍 Platform detect
    const platform = detectPlatform(url);

    // 🎨 Platform info
    const info = platformInfo[platform] || {
      name: "Unknown",
      color: "#000000",
    };

    // 🖼️ Image extract
    const image = await extractImageFromUrl(url);

    return NextResponse.json({
      success: true,
      data: {
        url,
        platform,
        platformName: info.name,
        color: info.color,
        image,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
