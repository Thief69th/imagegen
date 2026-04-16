import sharp from "sharp";
import { Platform } from "./detectPlatform";

export type OutputFormat = "jpg" | "png" | "webp";
export type QualityLevel = "high" | "medium" | "low";
export type SizeOption = "original" | "large" | "medium" | "small";

export interface ProcessOptions {
  size: SizeOption;
  format: OutputFormat;
  quality: QualityLevel;
  watermarkText: string;
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
      platform === "facebook" ? "Facebook" :
      platform === "instagram" ? "Instagram" :
      platform === "pinterest" ? "Pinterest" : "Web";
    return `${name} | ${platformName}`;
  }
  return `Source: ${domain || "web"}`;
}

async function createWatermarkOverlay(
  text: string,
  imgWidth: number,
  imgHeight: number
): Promise<Buffer> {
  const fontSize = Math.max(14, Math.min(28, Math.round(imgWidth * 0.022)));
  const padding = Math.round(fontSize * 0.75);
  const textLen = text.length;
  const estTextWidth = Math.round(textLen * fontSize * 0.55);
  const overlayW = estTextWidth + padding * 2;
  const overlayH = fontSize + padding * 2;

  // SVG watermark with semi-transparent background + text
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

export async function processImage(
  inputBuffer: Buffer,
  opts: ProcessOptions
): Promise<{ buffer: Buffer; mimeType: string; ext: string }> {
  const { size, format, quality, watermarkText } = opts;
  const q = QUALITY_MAP[quality];
  const targetWidth = SIZE_MAP[size];

  // Get image metadata
  const meta = await sharp(inputBuffer).metadata();
  const origW = meta.width ?? 800;
  const origH = meta.height ?? 600;

  // Start pipeline
  let pipeline = sharp(inputBuffer);

  // Resize if needed
  if (targetWidth && origW > targetWidth) {
    pipeline = pipeline.resize(targetWidth, null, {
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  // Convert format with quality
  if (format === "jpg") {
    pipeline = pipeline.jpeg({ quality: q, progressive: true, mozjpeg: true });
  } else if (format === "png") {
    pipeline = pipeline.png({ compressionLevel: Math.round((100 - q) / 11), progressive: true });
  } else {
    pipeline = pipeline.webp({ quality: q, effort: 4 });
  }

  // Get intermediate buffer to know final dimensions for watermark
  let processed = await pipeline.toBuffer();

  // Add watermark
  if (watermarkText) {
    const finalMeta = await sharp(processed).metadata();
    const finalW = finalMeta.width ?? origW;
    const finalH = finalMeta.height ?? origH;

    const wmBuf = await createWatermarkOverlay(watermarkText, finalW, finalH);
    const wmMeta = await sharp(wmBuf).metadata();
    const wmW = wmMeta.width ?? 200;
    const wmH = wmMeta.height ?? 40;

    const margin = Math.max(10, Math.round(finalW * 0.015));
    const left = Math.max(0, finalW - wmW - margin);
    const top = Math.max(0, finalH - wmH - margin);

    // Re-composite watermark — must re-apply format after compositing
    let withWm = sharp(processed).composite([
      {
        input: wmBuf,
        top,
        left,
        blend: "over",
      },
    ]);

    // Re-apply format
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
    format === "png" ? "image/png" :
    "image/webp";

  const ext = format === "jpg" ? "jpg" : format;

  return { buffer: processed, mimeType, ext };
}
