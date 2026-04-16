import { NextRequest, NextResponse } from "next/server";
import { detectPlatform, isValidUrl } from "@/lib/detectPlatform";
import { fetchImageBuffer } from "@/lib/scrapeImage";
import { processImage, buildWatermarkText, OutputFormat, QualityLevel, SizeOption } from "@/lib/processImage";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let body: {
    imageUrl?: string;
    username?: string | null;
    platform?: string;
    domain?: string;
    size?: SizeOption;
    format?: OutputFormat;
    quality?: QualityLevel;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { imageUrl, username, platform, domain, size, format, quality } = body;

  if (!imageUrl) {
    return NextResponse.json({ error: "imageUrl is required." }, { status: 400 });
  }

  if (!isValidUrl(imageUrl)) {
    return NextResponse.json({ error: "Invalid image URL." }, { status: 400 });
  }

  // Validate options
  const validSizes: SizeOption[] = ["original", "large", "medium", "small"];
  const validFormats: OutputFormat[] = ["jpg", "png", "webp"];
  const validQualities: QualityLevel[] = ["high", "medium", "low"];

  const finalSize: SizeOption = validSizes.includes(size as SizeOption) ? (size as SizeOption) : "original";
  const finalFormat: OutputFormat = validFormats.includes(format as OutputFormat) ? (format as OutputFormat) : "jpg";
  const finalQuality: QualityLevel = validQualities.includes(quality as QualityLevel) ? (quality as QualityLevel) : "high";

  // Build watermark text
  const platformInfo = detectPlatform(imageUrl);
  const resolvedDomain = domain ?? platformInfo.domain ?? "imagegen.online";
  const resolvedPlatform = (platform ?? platformInfo.platform) as ReturnType<typeof detectPlatform>["platform"];
  const watermarkText = buildWatermarkText(username ?? null, resolvedPlatform, resolvedDomain);

  try {
    // Fetch image
    const rawBuffer = await fetchImageBuffer(imageUrl);

    // Process: resize + format + watermark
    const { buffer, mimeType, ext } = await processImage(rawBuffer, {
      size: finalSize,
      format: finalFormat,
      quality: finalQuality,
      watermarkText,
    });

    // Build filename
    const filename = `imagegen_${resolvedPlatform}_${Date.now()}.${ext}`;

    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to process image.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
