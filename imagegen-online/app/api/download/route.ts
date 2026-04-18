import { NextRequest, NextResponse } from "next/server";
import { detectPlatform, isValidUrl, extractYouTubeThumbnail } from "@/lib/detectPlatform";
import { fetchImageBuffer } from "@/lib/scrapeImage";
import {
  processImage,
  buildWatermarkText,
  OutputFormat,
  QualityLevel,
  SizeOption,
} from "@/lib/processImage";

export const runtime = "nodejs";
export const maxDuration = 60;

// ─── Types ────────────────────────────────────────────────────────────────────

type RequestBody = {
  imageUrl?: string;
  videoUrl?: string;          // NEW: pass a YouTube / TikTok / etc. video URL directly
  thumbnailQuality?: YouTubeThumbnailQuality; // NEW: max | hq | mq | sd | default
  username?: string | null;
  platform?: string;
  domain?: string;
  size?: SizeOption;
  format?: OutputFormat;
  quality?: QualityLevel;
  watermark?: boolean;        // NEW: opt-out of watermark
  watermarkPosition?: WatermarkPosition; // NEW
};

type YouTubeThumbnailQuality = "maxresdefault" | "hqdefault" | "mqdefault" | "sddefault" | "default";
type WatermarkPosition = "bottom-right" | "bottom-left" | "top-right" | "top-left" | "center";

// ─── Constants ────────────────────────────────────────────────────────────────

const VALID_SIZES: SizeOption[]         = ["original", "large", "medium", "small"];
const VALID_FORMATS: OutputFormat[]     = ["jpg", "png", "webp"];
const VALID_QUALITIES: QualityLevel[]   = ["high", "medium", "low"];
const VALID_WM_POSITIONS: WatermarkPosition[] = [
  "bottom-right", "bottom-left", "top-right", "top-left", "center",
];
const VALID_YT_QUALITIES: YouTubeThumbnailQuality[] = [
  "maxresdefault", "hqdefault", "mqdefault", "sddefault", "default",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function validate<T>(value: unknown, allowed: T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

/**
 * Given a YouTube video URL or short URL, return the best available thumbnail URL.
 * Falls back through quality levels until one resolves successfully (checked server-side).
 */
async function resolveBestYouTubeThumbnail(
  videoUrl: string,
  preferredQuality: YouTubeThumbnailQuality
): Promise<string | null> {
  const videoId = extractYouTubeThumbnail(videoUrl);
  if (!videoId) return null;

  const qualityFallback: YouTubeThumbnailQuality[] = [
    "maxresdefault",
    "hqdefault",
    "mqdefault",
    "sddefault",
    "default",
  ];

  // Start from the preferred quality, then fall back
  const preferred = VALID_YT_QUALITIES.includes(preferredQuality) ? preferredQuality : "maxresdefault";
  const startIdx   = qualityFallback.indexOf(preferred);
  const order      = [
    ...qualityFallback.slice(startIdx),
    ...qualityFallback.slice(0, startIdx),
  ];

  for (const q of order) {
    const url = `https://img.youtube.com/vi/${videoId}/${q}.jpg`;
    try {
      const res = await fetch(url, { method: "HEAD" });
      // YouTube returns a 120×90 placeholder for missing thumbs – filter it out
      const w = res.headers.get("content-length");
      if (res.ok && (!w || parseInt(w) > 2000)) return url;
    } catch {
      // network hiccup – try next quality
    }
  }
  return null;
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ── 1. Parse body ──────────────────────────────────────────────────────────
  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const {
    imageUrl: rawImageUrl,
    videoUrl,
    thumbnailQuality = "maxresdefault",
    username,
    platform,
    domain,
    size,
    format,
    quality,
    watermark = true,
    watermarkPosition = "bottom-right",
  } = body;

  // ── 2. Resolve the actual image URL ───────────────────────────────────────
  let imageUrl = rawImageUrl;

  if (!imageUrl && videoUrl) {
    // Attempt to auto-resolve a thumbnail from a video URL
    if (!isValidUrl(videoUrl)) {
      return NextResponse.json({ error: "Invalid videoUrl." }, { status: 400 });
    }

    const platformInfo = detectPlatform(videoUrl);

    switch (platformInfo.platform) {
      case "youtube": {
        const resolved = await resolveBestYouTubeThumbnail(videoUrl, thumbnailQuality);
        if (!resolved) {
          return NextResponse.json(
            { error: "Could not extract a YouTube thumbnail for the given URL." },
            { status: 422 }
          );
        }
        imageUrl = resolved;
        break;
      }

      case "tiktok": {
        // TikTok oembed thumbnail extraction
        try {
          const oembedRes = await fetch(
            `https://www.tiktok.com/oembed?url=${encodeURIComponent(videoUrl)}`
          );
          if (!oembedRes.ok) throw new Error("TikTok oembed failed");
          const data = await oembedRes.json();
          if (!data.thumbnail_url) throw new Error("No thumbnail in oembed");
          imageUrl = data.thumbnail_url;
        } catch {
          return NextResponse.json(
            { error: "Could not extract a TikTok thumbnail for the given URL." },
            { status: 422 }
          );
        }
        break;
      }

      case "vimeo": {
        try {
          const vimeoId = videoUrl.match(/vimeo\.com\/(\d+)/)?.[1];
          if (!vimeoId) throw new Error("No Vimeo ID");
          const oembedRes = await fetch(
            `https://vimeo.com/api/v2/video/${vimeoId}.json`
          );
          if (!oembedRes.ok) throw new Error("Vimeo API failed");
          const [data] = await oembedRes.json();
          imageUrl = data.thumbnail_large ?? data.thumbnail_medium ?? data.thumbnail_small;
          if (!imageUrl) throw new Error("No Vimeo thumbnail");
        } catch {
          return NextResponse.json(
            { error: "Could not extract a Vimeo thumbnail for the given URL." },
            { status: 422 }
          );
        }
        break;
      }

      case "twitch": {
        // Twitch clip thumbnails via oembed
        try {
          const oembedRes = await fetch(
            `https://api.twitch.tv/v5/oembed?url=${encodeURIComponent(videoUrl)}`
          );
          if (!oembedRes.ok) throw new Error("Twitch oembed failed");
          const data = await oembedRes.json();
          imageUrl = data.thumbnail_url;
          if (!imageUrl) throw new Error("No Twitch thumbnail");
        } catch {
          return NextResponse.json(
            { error: "Could not extract a Twitch thumbnail for the given URL." },
            { status: 422 }
          );
        }
        break;
      }

      default:
        return NextResponse.json(
          {
            error: `Automatic thumbnail extraction is not supported for platform "${platformInfo.platform}". Please pass imageUrl directly.`,
          },
          { status: 400 }
        );
    }
  }

  if (!imageUrl) {
    return NextResponse.json(
      { error: "Provide either imageUrl or a supported videoUrl." },
      { status: 400 }
    );
  }

  if (!isValidUrl(imageUrl)) {
    return NextResponse.json({ error: "Invalid image URL." }, { status: 400 });
  }

  // ── 3. Validate & normalise options ───────────────────────────────────────
  const finalSize      = validate(size,              VALID_SIZES,        "original" as SizeOption);
  const finalFormat    = validate(format,            VALID_FORMATS,      "jpg"      as OutputFormat);
  const finalQuality   = validate(quality,           VALID_QUALITIES,    "high"     as QualityLevel);
  const finalWmPos     = validate(watermarkPosition, VALID_WM_POSITIONS, "bottom-right" as WatermarkPosition);

  // ── 4. Build watermark ────────────────────────────────────────────────────
  const platformInfo    = detectPlatform(imageUrl);
  const resolvedDomain  = domain   ?? platformInfo.domain   ?? "imagegen.online";
  const resolvedPlatform =
    (platform ?? platformInfo.platform) as ReturnType<typeof detectPlatform>["platform"];

  const watermarkText = watermark
    ? buildWatermarkText(username ?? null, resolvedPlatform, resolvedDomain)
    : null;

  // ── 5. Fetch → process → respond ─────────────────────────────────────────
  try {
    const rawBuffer = await fetchImageBuffer(imageUrl);

    const { buffer, mimeType, ext } = await processImage(rawBuffer, {
      size: finalSize,
      format: finalFormat,
      quality: finalQuality,
      watermarkText,
      watermarkPosition: finalWmPos,
    });

    const filename = `imagegen_${resolvedPlatform}_${Date.now()}.${ext}`;

    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "no-store",
        "X-Platform": resolvedPlatform,
        "X-Image-Source": imageUrl,
      },
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to process image.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
