import { NextRequest, NextResponse } from "next/server";

// Allowed image CDN domains (whitelist for security)
const ALLOWED_DOMAINS = [
  "img.youtube.com",
  "i.ytimg.com",
  "i.pinimg.com",
  "pinimg.com",
  "pbs.twimg.com",     // Twitter/X
  "abs.twimg.com",
  "media.licdn.com",   // LinkedIn
  "static.licdn.com",
  "scontent",          // Facebook/Instagram CDN (dynamic subdomains)
  "fbcdn.net",
  "cdninstagram.com",
  "lookaside.fbsbx.com",
  "images.unsplash.com",
  "upload.wikimedia.org",
  "quoracdn.net",
  "qph.cf2.quoracdn.net",
  "qph.fs.quoracdn.net",
  "tumblr.com",
  "assets.tumblr.com",
  "64.media.tumblr.com",
  "media.tenor.com",
  "c.tenor.com",
  "i.imgur.com",
  "imgur.com",
  "images.pexels.com",
  "images.pixabay.com",
  "cdn.pixabay.com",
  "flickr.com",
  "live.staticflickr.com",
  "farm",              // Flickr farm CDN
  "redd.it",           // Reddit
  "i.redd.it",
  "preview.redd.it",
  "external-preview.redd.it",
];

function isDomainAllowed(url: string): boolean {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    return ALLOWED_DOMAINS.some((d) => hostname.includes(d));
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  // Validate URL
  let parsed: URL;
  try {
    parsed = new URL(imageUrl);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  // Only allow http/https
  if (!["http:", "https:"].includes(parsed.protocol)) {
    return NextResponse.json({ error: "Invalid protocol" }, { status: 400 });
  }

  // Check domain whitelist
  if (!isDomainAllowed(imageUrl)) {
    return NextResponse.json(
      { error: "Domain not in allowlist. Direct download may work — try the direct link button." },
      { status: 403 }
    );
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://www.google.com/",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Image fetch failed: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="imagegen_download.${getExt(contentType)}"`,
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("Proxy fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch image. The platform may require authentication." },
      { status: 500 }
    );
  }
}

function getExt(contentType: string): string {
  if (contentType.includes("png")) return "png";
  if (contentType.includes("gif")) return "gif";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("svg")) return "svg";
  return "jpg";
}
