import { NextRequest, NextResponse } from "next/server";
import {
  detectPlatform,
  isValidUrl,
  extractYouTubeThumbnail,
  getYouTubeThumbnailUrls,
} from "@/lib/detectPlatform";
import { extractImageFromUrl } from "@/lib/scrapeImage";

type RequestBody = {
  url: string;
};

// 🔥 Scalable platform groups
const YOUTUBE_PLATFORMS = ["youtube", "youtube-shorts"];

export async function POST(req: NextRequest) {
  try {
    const { url }: RequestBody = await req.json();

    // ❌ URL validation
    if (!url || !isValidUrl(url)) {
      return NextResponse.json(
        { success: false, message: "Invalid URL" },
        { status: 400 }
      );
    }

    // 🔍 Detect platform
    const platformData = detectPlatform(url);

    let image: string | null = null;

    // 🚀 YouTube Smart Thumbnail
    if (YOUTUBE_PLATFORMS.includes(platformData.platform)) {
      const videoId = extractYouTubeThumbnail(url);

      if (videoId) {
        const thumbs = getYouTubeThumbnailUrls(videoId);

        // Best → fallback
        image =
          thumbs.maxresdefault ||
          thumbs.hqdefault ||
          thumbs.mqdefault ||
          thumbs.sddefault ||
          thumbs.default;
      }
    }

    // 🔁 Fallback scraping (for all other platforms)
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
