import axios from "axios";
import { Platform } from "./detectPlatform";

export interface ExtractedImage {
  imageUrl: string;
  username: string | null;
  title: string | null;
  platform: Platform;
}

// Browser-like headers to avoid bot detection
const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Cache-Control": "no-cache",
  "Pragma": "no-cache",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-CH-UA": '"Chromium";v="124", "Google Chrome";v="124"',
  "Upgrade-Insecure-Requests": "1",
};

// Extract a meta tag value from raw HTML using regex (no DOM parser on server)
function getMeta(html: string, property: string): string | null {
  // Match both property="..." and name="..." variants
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`, "i"),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return decodeHtmlEntities(m[1].trim());
  }
  return null;
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function extractUsername(html: string, platform: Platform, url: string): string | null {
  // Try og:site_name first
  const siteName = getMeta(html, "og:site_name");

  if (platform === "instagram") {
    // Look for @username patterns in og:description or title
    const desc = getMeta(html, "og:description") ?? getMeta(html, "description") ?? "";
    const m = desc.match(/@([\w.]+)/);
    if (m) return `@${m[1]}`;
    // Try from URL: instagram.com/username/
    const urlMatch = url.match(/instagram\.com\/([^/?#]+)/);
    if (urlMatch && urlMatch[1] !== "p" && urlMatch[1] !== "reel") return `@${urlMatch[1]}`;
  }

  if (platform === "pinterest") {
    // URL: pinterest.com/username/pin-name
    const urlMatch = url.match(/pinterest\.com\/([^/?#]+)/);
    if (urlMatch) return `@${urlMatch[1]}`;
  }

  if (platform === "facebook") {
    const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleTag) {
      const cleaned = titleTag[1].replace(/\s*[\|–-]\s*Facebook.*$/i, "").trim();
      if (cleaned && cleaned.length < 60) return cleaned;
    }
  }

  return siteName ?? null;
}

async function fetchWithRetry(url: string, retries = 2): Promise<string> {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await axios.get(url, {
        headers: BROWSER_HEADERS,
        timeout: 12000,
        maxRedirects: 5,
        responseType: "text",
        decompress: true,
        validateStatus: (s) => s < 400,
      });
      return res.data as string;
    } catch (err) {
      if (i === retries) throw err;
      await new Promise((r) => setTimeout(r, 800 * (i + 1)));
    }
  }
  throw new Error("Fetch failed after retries");
}

export async function extractImageFromUrl(pageUrl: string, platform: Platform): Promise<ExtractedImage> {
  let html: string;

  try {
    html = await fetchWithRetry(pageUrl);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("403") || msg.includes("401")) {
      throw new Error("This page requires login or is private. Only public content is supported.");
    }
    if (msg.includes("429")) {
      throw new Error("Too many requests. Please wait a moment and try again.");
    }
    throw new Error(`Could not load page: ${msg}`);
  }

  // --- Extract image URL ---
  // Priority: og:image → twitter:image → first large img
  let imageUrl =
    getMeta(html, "og:image") ??
    getMeta(html, "og:image:url") ??
    getMeta(html, "twitter:image") ??
    getMeta(html, "twitter:image:src") ??
    null;

  // Pinterest-specific: look for pinImg or media url
  if (!imageUrl && platform === "pinterest") {
    const pinMatch = html.match(/"url"\s*:\s*"(https:\/\/i\.pinimg\.com\/[^"]+)"/);
    if (pinMatch) imageUrl = pinMatch[1];
  }

  // Facebook-specific: look for large image in JSON-LD
  if (!imageUrl && platform === "facebook") {
    const jsonLd = html.match(/"image"\s*:\s*"(https:\/\/[^"]+\.(jpg|jpeg|png|webp)[^"]*)"/i);
    if (jsonLd) imageUrl = jsonLd[1];
  }

  if (!imageUrl) {
    throw new Error(
      "No image found on this page. The content may be private, require login, or not contain a supported image."
    );
  }

  // Validate image URL
  try {
    new URL(imageUrl);
  } catch {
    throw new Error("Extracted image URL is invalid.");
  }

  // Check it's not a tiny avatar/icon
  const size = getMeta(html, "og:image:width");
  if (size && parseInt(size) < 100) {
    throw new Error("Image found is too small. This may be a private or restricted post.");
  }

  const username = extractUsername(html, platform, pageUrl);
  const title =
    getMeta(html, "og:title") ??
    getMeta(html, "twitter:title") ??
    html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ?? null;

  return {
    imageUrl,
    username,
    title: title ? decodeHtmlEntities(title).replace(/\s*\|\s*.*$/, "").trim() : null,
    platform,
  };
}

export async function fetchImageBuffer(imageUrl: string): Promise<Buffer> {
  const res = await axios.get(imageUrl, {
    headers: {
      ...BROWSER_HEADERS,
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      Referer: new URL(imageUrl).origin + "/",
    },
    responseType: "arraybuffer",
    timeout: 20000,
    maxContentLength: 8 * 1024 * 1024, // 8MB limit
    validateStatus: (s) => s < 400,
  });

  const contentLength = res.headers["content-length"];
  if (contentLength && parseInt(contentLength) > 8 * 1024 * 1024) {
    throw new Error("Image exceeds the 8MB size limit.");
  }

  const buffer = Buffer.from(res.data as ArrayBuffer);
  if (buffer.length > 8 * 1024 * 1024) {
    throw new Error("Image exceeds the 8MB size limit.");
  }
  if (buffer.length < 1000) {
    throw new Error("Image data is too small — this may be a placeholder or blocked resource.");
  }

  return buffer;
}
