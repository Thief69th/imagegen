import { NextRequest, NextResponse } from "next/server";
import { detectPlatform, isValidUrl } from "@/lib/detectPlatform";
import { extractImageFromUrl } from "@/lib/scrapeImage";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required." }, { status: 400 });
  }

  if (!isValidUrl(url)) {
    return NextResponse.json({ error: "Invalid URL. Please enter a valid http/https URL." }, { status: 400 });
  }

  const platformInfo = detectPlatform(url);

  if (platformInfo.platform === "unknown") {
    return NextResponse.json(
      { error: "Unsupported platform. Please enter a Facebook, Instagram, or Pinterest URL." },
      { status: 400 }
    );
  }

  try {
    const result = await extractImageFromUrl(url, platformInfo.platform);

    return NextResponse.json({
      imageUrl: result.imageUrl,
      username: result.username,
      title: result.title,
      platform: platformInfo.platform,
      displayName: platformInfo.displayName,
      domain: platformInfo.domain,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to extract image from this URL.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
