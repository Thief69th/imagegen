import { NextRequest, NextResponse } from "next/server";
import {
  detectPlatform,
  isValidUrl,
  extractYouTubeThumbnail,
  getYouTubeThumbnailUrls,
} from "@/lib/detectPlatform";
import { extractImageFromUrl } from "@/lib/scrapeImage";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || !isValidUrl(url)) {
      return NextResponse.json(
        { success: false, message: "Invalid URL" },
        { status: 400 }
      );
    }

    // 🔍 Detect platform (NEW STRUCTURE)
    const platformData = detectPlatform(url);

    let image: string | null = null;

    // 🚀 Smart thumbnail extraction
    if (platformData.platform === "youtube" || platformData.platform === "youtube-shorts") {
      const videoId = extractYouTubeThumbnail(url);

      if (videoId) {
        const thumbs = getYouTubeThumbnailUrls(videoId);
        image = thumbs.maxresdefault;
      }
    }

    // 🔁 fallback scraping
    if (!image) {
      image = await extractImageFromUrl(url);
    }

    return NextResponse.json({
      success: true,
      data: {
        url,
        platform: platformData.platform,
        label: platformData.label,
        domain: platformData.domain,
        supportsAutoThumbnail: platformData.supportsAutoThumbnail,
        image,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
