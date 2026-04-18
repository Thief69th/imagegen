import sharp from "sharp";
import { Platform } from "./detectPlatform";

export type OutputFormat = "jpg" | "png" | "webp";
export type QualityLevel = "high" | "medium" | "low";
export type SizeOption = "original" | "large" | "medium" | "small";

export interface ProcessOptions {
  size: SizeOption;
  format: OutputFormat;
  quality: QualityLevel;
  watermarkText?: string;        // ✅ FIX: string से string? किया — undefined allow
  watermarkPosition?: string;    // ✅ NEW: position support
}

const SIZE_MAP: Record<SizeOption, number | null> = {
  original: null,
  large: 1080,
  medium: 720,
  small: 480,
};

const QUALITY_MAP: Record<QualityLevel, number> = {
  high: 90,
  medium: 70,
  low: 50,
};

export function buildWatermarkText(
  username: string | null,
  platform: Platform,
  domain: string
): string {
  if (username) {
    const name = username.startsWith("@") ? username : `@${username}`;
    const platformName =
      platform === "youtube"        ? "YouTube"    :
      platform === "youtube-shorts" ? "YT Shorts"  :
      platform === "tiktok"         ? "TikTok"     :
      platform === "instagram"      ? "Instagram"  :
      platform === "facebook"       ? "Facebook"   :
      platform === "twitter"        ? "X / Twitter":
      platform === "pinterest"      ? "Pinterest"  :
      platform === "reddit"         ? "Reddit"     :
      platform === "linkedin"       ? "LinkedIn"   :
      platform === "twitch"         ? "Twitch"     :
      platform === "vimeo"          ? "Vimeo"      :
      "Web";
    return `${name} | ${platformName}`;
  }
  return `Source: ${domain || "web"}`;
}

async function createWatermarkOverlay(
  text: string,
  imgWidth: number,
  imgHeight: number
): Promise<Buffer> {
  const fontSize    = Math.max(14, Math.min(28, Math.round(imgWidth * 0.022)));
  const padding     = Math.round(fontSize * 0.75);
  const estTextWidth = Math.round(text.length * fontSize * 0.55);
  const overlayW    = estTextWidth + padding * 2;
  const overlayH    = fontSize + padding * 2;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${overlayW}" height="${overlayH}">
  <rect width="${overlayW}" height="${overlayH}" fill="rgba(0,0,0,0.45)" rx="4"/>
  <text
    x="${overlayW / 2}"
    y="${overlayH / 2 + fontSize * 0.35}"
    font-family="Arial, Helvetica, sans-serif"
    font-size="${fontSize}"
    font-weight="bold"
    fill="rgba(255,255,255,0.85)"
    text-anchor="middle"
    letter-spacing="0.5"
  >${escapeXml(text)}</text>
</svg>`;

  return Buffer.from(svg);
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Calculate watermark position (top-left corner of the watermark overlay)
 * based on the position string and image/watermark dimensions.
 */
function calcWatermarkPosition(
  position: string,
  imgW: number,
  imgH: number,
  wmW: number,
  wmH: number
): { top: number; left: number } {
  const margin = Math.max(10, Math.round(imgW * 0.015));

  switch (position) {
    case "top-left":
      return { top: margin, left: margin };
    case "top-right":
      return { top: margin, left: Math.max(0, imgW - wmW - margin) };
    case "bottom-left":
      return { top: Math.max(0, imgH - wmH - margin), left: margin };
    case "center":
      return {
        top:  Math.max(0, Math.round((imgH - wmH) / 2)),
        left: Math.max(0, Math.round((imgW - wmW) / 2)),
      };
    case "bottom-right":
    default:
      return {
        top:  Math.max(0, imgH - wmH - margin),
        left: Math.max(0, imgW - wmW - margin),
      };
  }
}

export async function processImage(
  inputBuffer: Buffer,
  opts: ProcessOptions
): Promise<{ buffer: Buffer; mimeType: string; ext: string }> {
  const { size, format, quality, watermarkText, watermarkPosition = "bottom-right" } = opts;
  const q           = QUALITY_MAP[quality];
  const targetWidth = SIZE_MAP[size];

  const meta  = await sharp(inputBuffer).metadata();
  const origW = meta.width  ?? 800;
  const origH = meta.height ?? 600;

  let pipeline = sharp(inputBuffer);

  // Resize
  if (targetWidth && origW > targetWidth) {
    pipeline = pipeline.resize(targetWidth, null, {
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  // Format + quality
  if (format === "jpg") {
    pipeline = pipeline.jpeg({ quality: q, progressive: true, mozjpeg: true });
  } else if (format === "png") {
    pipeline = pipeline.png({ compressionLevel: Math.round((100 - q) / 11), progressive: true });
  } else {
    pipeline = pipeline.webp({ quality: q, effort: 4 });
  }

  let processed = await pipeline.toBuffer();

  // ✅ watermarkText undefined या empty string हो तो watermark skip
  if (watermarkText) {
    const finalMeta = await sharp(processed).metadata();
    const finalW    = finalMeta.width  ?? origW;
    const finalH    = finalMeta.height ?? origH;

    const wmBuf  = await createWatermarkOverlay(watermarkText, finalW, finalH);
    const wmMeta = await sharp(wmBuf).metadata();
    const wmW    = wmMeta.width  ?? 200;
    const wmH    = wmMeta.height ?? 40;

    const { top, left } = calcWatermarkPosition(
      watermarkPosition, finalW, finalH, wmW, wmH
    );

    let withWm = sharp(processed).composite([
      { input: wmBuf, top, left, blend: "over" },
    ]);

    if (format === "jpg") {
      withWm = withWm.jpeg({ quality: q, mozjpeg: true });
    } else if (format === "png") {
      withWm = withWm.png({ compressionLevel: Math.round((100 - q) / 11) });
    } else {
      withWm = withWm.webp({ quality: q });
    }

    processed = await withWm.toBuffer();
  }

  const mimeType =
    format === "jpg" ? "image/jpeg" :
    format === "png" ? "image/png"  :
    "image/webp";

  const ext = format === "jpg" ? "jpg" : format;

  return { buffer: processed, mimeType, ext };
}
