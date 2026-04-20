"use client";

import { useState, useCallback } from "react";

// ─── Platform configs ────────────────────────────────────────────────────────

interface Platform {
  id: string;
  name: string;
  icon: string;
  color: string;
  placeholder: string;
  hint: string;
  extract: (url: string) => PlatformResult | null;
}

interface PlatformResult {
  platform: string;
  title: string;
  images: ImageOption[];
  directOnly?: boolean; // if true, show note about auth requirement
}

interface ImageOption {
  label: string;
  url: string;
  quality: "HD" | "SD" | "thumb" | "full";
  width?: number;
  height?: number;
}

// ─── YouTube helpers ─────────────────────────────────────────────────────────

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([A-Za-z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

// ─── Platform definitions ────────────────────────────────────────────────────

const PLATFORMS: Platform[] = [
  // ── YouTube ────────────────────────────────────────────────────
  {
    id: "youtube",
    name: "YouTube",
    icon: "▶",
    color: "#ff0000",
    placeholder: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    hint: "Paste any YouTube video URL to get all thumbnail sizes",
    extract(url) {
      const id = extractYouTubeId(url);
      if (!id) return null;
      return {
        platform: "YouTube",
        title: `YouTube Thumbnail — ${id}`,
        images: [
          { label: "Max Resolution (1280×720)", url: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`, quality: "HD", width: 1280, height: 720 },
          { label: "Standard Quality (480×360)", url: `https://img.youtube.com/vi/${id}/sddefault.jpg`, quality: "SD", width: 480, height: 360 },
          { label: "High Quality (480×360)", url: `https://img.youtube.com/vi/${id}/hqdefault.jpg`, quality: "SD", width: 480, height: 360 },
          { label: "Medium Quality (320×180)", url: `https://img.youtube.com/vi/${id}/mqdefault.jpg`, quality: "thumb", width: 320, height: 180 },
          { label: "Default (120×90)", url: `https://img.youtube.com/vi/${id}/default.jpg`, quality: "thumb", width: 120, height: 90 },
          { label: "Thumbnail 1 (120×90)", url: `https://img.youtube.com/vi/${id}/1.jpg`, quality: "thumb", width: 120, height: 90 },
          { label: "Thumbnail 2 (120×90)", url: `https://img.youtube.com/vi/${id}/2.jpg`, quality: "thumb", width: 120, height: 90 },
          { label: "Thumbnail 3 (120×90)", url: `https://img.youtube.com/vi/${id}/3.jpg`, quality: "thumb", width: 120, height: 90 },
        ],
      };
    },
  },

  // ── YouTube Shorts ──────────────────────────────────────────────
  {
    id: "youtube-shorts",
    name: "YouTube Shorts",
    icon: "⚡",
    color: "#ff0000",
    placeholder: "https://youtube.com/shorts/VIDEO_ID",
    hint: "Same as YouTube — paste the Shorts URL",
    extract(url) {
      // Shorts use same thumbnail CDN as regular videos
      const id = extractYouTubeId(url);
      if (!id) return null;
      return {
        platform: "YouTube Shorts",
        title: `Shorts Thumbnail — ${id}`,
        images: [
          { label: "Max Resolution", url: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`, quality: "HD", width: 1280, height: 720 },
          { label: "High Quality", url: `https://img.youtube.com/vi/${id}/hqdefault.jpg`, quality: "SD", width: 480, height: 360 },
          { label: "Default Thumbnail", url: `https://img.youtube.com/vi/${id}/default.jpg`, quality: "thumb", width: 120, height: 90 },
        ],
      };
    },
  },

  // ── Pinterest ───────────────────────────────────────────────────
  {
    id: "pinterest",
    name: "Pinterest",
    icon: "📌",
    color: "#e60023",
    placeholder: "https://pin.it/XXXXX  or  https://www.pinterest.com/pin/1234/",
    hint: "Paste Pinterest pin URL — image fetched via proxy",
    extract(url) {
      // Pinterest pins: extract the image via proxy
      // The actual image URL is embedded in Pinterest's JSON — we do best-effort
      const isPinterest = url.includes("pinterest.com") || url.includes("pin.it");
      if (!isPinterest) return null;

      // Pinterest CDN images follow: https://i.pinimg.com/originals/xx/xx/xx/hash.jpg
      // We can't extract directly without API, so show instructions + proxy option
      const cdnMatch = url.match(/i\.pinimg\.com\/[^"'\s]+/);
      if (cdnMatch) {
        const cdnUrl = `https://${cdnMatch[0]}`;
        return {
          platform: "Pinterest",
          title: "Pinterest Image",
          images: [
            { label: "Original Size", url: cdnUrl, quality: "full" },
            { label: "736px Wide", url: cdnUrl.replace("/originals/", "/736x/"), quality: "HD" },
            { label: "236px Wide", url: cdnUrl.replace("/originals/", "/236x/"), quality: "thumb" },
          ],
        };
      }
      return {
        platform: "Pinterest",
        title: "Pinterest Pin",
        directOnly: true,
        images: [],
      };
    },
  },

  // ── Twitter / X ─────────────────────────────────────────────────
  {
    id: "twitter",
    name: "Twitter / X",
    icon: "✕",
    color: "#000000",
    placeholder: "https://pbs.twimg.com/media/XXXXXXX?format=jpg&name=large",
    hint: "Paste a Twitter/X media image URL (pbs.twimg.com)",
    extract(url) {
      const isTwitterMedia =
        url.includes("pbs.twimg.com/media") || url.includes("abs.twimg.com");
      if (!isTwitterMedia) return null;

      // Construct all sizes from Twitter CDN
      const baseUrl = url.split("?")[0];
      return {
        platform: "Twitter / X",
        title: "Twitter Media Image",
        images: [
          { label: "Original (4096px)", url: `${baseUrl}?format=jpg&name=4096x4096`, quality: "HD" },
          { label: "Large (2048px)", url: `${baseUrl}?format=jpg&name=large`, quality: "HD" },
          { label: "Medium (1200px)", url: `${baseUrl}?format=jpg&name=medium`, quality: "SD" },
          { label: "Small (680px)", url: `${baseUrl}?format=jpg&name=small`, quality: "SD" },
          { label: "Thumb (150px)", url: `${baseUrl}?format=jpg&name=thumb`, quality: "thumb" },
          { label: "PNG (large)", url: `${baseUrl}?format=png&name=large`, quality: "HD" },
        ],
      };
    },
  },

  // ── Reddit ──────────────────────────────────────────────────────
  {
    id: "reddit",
    name: "Reddit",
    icon: "🔴",
    color: "#ff4500",
    placeholder: "https://i.redd.it/XXXXXXX.jpg  or  Reddit post URL",
    hint: "Paste Reddit image URL or i.redd.it link",
    extract(url) {
      const isRedditImg =
        url.includes("i.redd.it") ||
        url.includes("preview.redd.it") ||
        url.includes("external-preview.redd.it");
      if (!isRedditImg) return null;

      const cleanUrl = url.split("?")[0];
      return {
        platform: "Reddit",
        title: "Reddit Image",
        images: [
          { label: "Full Resolution", url: cleanUrl, quality: "full" },
          {
            label: "Preview (1080px)",
            url: url.includes("preview.redd.it")
              ? url
              : cleanUrl.replace("i.redd.it", "preview.redd.it") + "?width=1080&crop=smart&auto=webp",
            quality: "HD",
          },
        ],
      };
    },
  },

  // ── Imgur ───────────────────────────────────────────────────────
  {
    id: "imgur",
    name: "Imgur",
    icon: "🖼",
    color: "#1bb76e",
    placeholder: "https://imgur.com/XXXXX  or  https://i.imgur.com/XXXXX.jpg",
    hint: "Paste Imgur image or album link",
    extract(url) {
      if (!url.includes("imgur.com")) return null;

      // Direct image link
      const directMatch = url.match(/i\.imgur\.com\/([A-Za-z0-9]+)\.(jpg|png|gif|gifv|mp4|webp)/i);
      if (directMatch) {
        const id = directMatch[1];
        const ext = directMatch[2] === "gifv" ? "gif" : directMatch[2];
        return {
          platform: "Imgur",
          title: `Imgur Image — ${id}`,
          images: [
            { label: "Original", url: `https://i.imgur.com/${id}.${ext}`, quality: "full" },
            { label: "Huge (1024px)", url: `https://i.imgur.com/${id}h.${ext}`, quality: "HD" },
            { label: "Large (640px)", url: `https://i.imgur.com/${id}l.${ext}`, quality: "SD" },
            { label: "Medium (320px)", url: `https://i.imgur.com/${id}m.${ext}`, quality: "thumb" },
            { label: "Small (160px)", url: `https://i.imgur.com/${id}s.${ext}`, quality: "thumb" },
          ],
        };
      }

      // Page link — extract ID
      const pageMatch = url.match(/imgur\.com\/(?:gallery\/)?([A-Za-z0-9]+)/);
      if (pageMatch) {
        const id = pageMatch[1];
        return {
          platform: "Imgur",
          title: `Imgur Image — ${id}`,
          images: [
            { label: "Original (JPG)", url: `https://i.imgur.com/${id}.jpg`, quality: "full" },
            { label: "Original (PNG)", url: `https://i.imgur.com/${id}.png`, quality: "full" },
            { label: "Large (640px)", url: `https://i.imgur.com/${id}l.jpg`, quality: "SD" },
            { label: "Medium (320px)", url: `https://i.imgur.com/${id}m.jpg`, quality: "thumb" },
          ],
        };
      }
      return null;
    },
  },

  // ── Unsplash ────────────────────────────────────────────────────
  {
    id: "unsplash",
    name: "Unsplash",
    icon: "📷",
    color: "#000000",
    placeholder: "https://unsplash.com/photos/XXXXX",
    hint: "Paste Unsplash photo URL or direct image URL",
    extract(url) {
      if (!url.includes("unsplash.com")) return null;

      // Direct CDN image
      const cdnMatch = url.match(/images\.unsplash\.com\/photo-[^?&"'\s]+/);
      if (cdnMatch) {
        const base = `https://${cdnMatch[0]}`;
        return {
          platform: "Unsplash",
          title: "Unsplash Photo",
          images: [
            { label: "Full Resolution (Original)", url: `${base}?q=100&fm=jpg`, quality: "full" },
            { label: "HD (2400px)", url: `${base}?w=2400&q=90&fm=jpg`, quality: "HD" },
            { label: "Large (1920px)", url: `${base}?w=1920&q=85&fm=jpg`, quality: "HD" },
            { label: "Medium (1080px)", url: `${base}?w=1080&q=80&fm=jpg`, quality: "SD" },
            { label: "Small (640px)", url: `${base}?w=640&q=75&fm=jpg`, quality: "thumb" },
            { label: "WebP (2400px)", url: `${base}?w=2400&q=90&fm=webp`, quality: "HD" },
          ],
        };
      }

      // Photo page — construct from photo ID
      const pageMatch = url.match(/unsplash\.com\/photos\/([A-Za-z0-9_-]+)/);
      if (pageMatch) {
        const id = pageMatch[1];
        return {
          platform: "Unsplash",
          title: `Unsplash Photo — ${id}`,
          images: [
            { label: "Full Resolution", url: `https://unsplash.com/photos/${id}/download?force=true`, quality: "full" },
            { label: "Large (1920px)", url: `https://source.unsplash.com/${id}/1920x1080`, quality: "HD" },
            { label: "Medium (1280px)", url: `https://source.unsplash.com/${id}/1280x720`, quality: "SD" },
          ],
        };
      }
      return null;
    },
  },

  // ── Flickr ──────────────────────────────────────────────────────
  {
    id: "flickr",
    name: "Flickr",
    icon: "📸",
    color: "#ff0084",
    placeholder: "https://live.staticflickr.com/XXXXX/photo_id.jpg",
    hint: "Paste Flickr direct image URL (live.staticflickr.com)",
    extract(url) {
      const isFlickr =
        url.includes("staticflickr.com") || url.includes("flickr.com");
      if (!isFlickr) return null;

      const staticMatch = url.match(/live\.staticflickr\.com\/[^"'\s?]+\.(jpg|png)/i);
      if (staticMatch) {
        const base = `https://${staticMatch[0]}`;
        const baseName = base.replace(/_(b|c|n|m|t|sq|q|s|k|h|o)\./, "_");
        return {
          platform: "Flickr",
          title: "Flickr Photo",
          images: [
            { label: "Original", url: baseName.replace(/\.(jpg|png)/, "_o.$1"), quality: "full" },
            { label: "Large 2048 (k)", url: baseName.replace(/\.(jpg|png)/, "_k.$1"), quality: "HD" },
            { label: "Large 1600 (h)", url: baseName.replace(/\.(jpg|png)/, "_h.$1"), quality: "HD" },
            { label: "Large (b)", url: baseName.replace(/\.(jpg|png)/, "_b.$1"), quality: "SD" },
            { label: "Medium 800 (c)", url: baseName.replace(/\.(jpg|png)/, "_c.$1"), quality: "SD" },
            { label: "Medium 500 (default)", url: base, quality: "thumb" },
            { label: "Small 320 (n)", url: baseName.replace(/\.(jpg|png)/, "_n.$1"), quality: "thumb" },
          ],
        };
      }
      return null;
    },
  },

  // ── Direct Image URL ────────────────────────────────────────────
  {
    id: "direct",
    name: "Direct Image URL",
    icon: "🔗",
    color: "#000000",
    placeholder: "https://example.com/image.jpg",
    hint: "Paste any direct image URL (ends in .jpg, .png, .webp, .gif)",
    extract(url) {
      const isImage = /\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)(\?[^"'\s]*)?$/i.test(url);
      const hasImageInPath = url.match(/\/(photo|image|img|pic|media|thumb|photo|foto)\//i);
      if (!isImage && !hasImageInPath) return null;
      return {
        platform: "Direct URL",
        title: "Image Download",
        images: [
          { label: "Original Image", url, quality: "full" },
        ],
      };
    },
  },
];

// ─── Auto-detect platform from URL ──────────────────────────────────────────

function detectPlatform(url: string): Platform | null {
  const lower = url.toLowerCase();
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) {
    return lower.includes("shorts") ? PLATFORMS[1] : PLATFORMS[0];
  }
  if (lower.includes("pinterest.com") || lower.includes("pin.it")) return PLATFORMS[2];
  if (lower.includes("twimg.com") || lower.includes("twitter.com") || lower.includes("x.com")) return PLATFORMS[3];
  if (lower.includes("redd.it") || lower.includes("reddit.com")) return PLATFORMS[4];
  if (lower.includes("imgur.com")) return PLATFORMS[5];
  if (lower.includes("unsplash.com")) return PLATFORMS[6];
  if (lower.includes("flickr.com") || lower.includes("staticflickr.com")) return PLATFORMS[7];
  return null;
}

const QUALITY_BADGE: Record<string, string> = {
  HD: "bg-black text-white",
  SD: "bg-black/60 text-white",
  full: "bg-black text-white",
  thumb: "bg-black/20 text-black",
};

// ─── Main component ──────────────────────────────────────────────────────────

export default function SocialImageDownloader() {
  const [inputUrl, setInputUrl] = useState("");
  const [activePlatformId, setActivePlatformId] = useState("youtube");
  const [result, setResult] = useState<PlatformResult | null>(null);
  const [loadingIdx, setLoadingIdx] = useState<number | null>(null);
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());
  const [error, setError] = useState("");

  const activePlatform =
    PLATFORMS.find((p) => p.id === activePlatformId) ?? PLATFORMS[0];

  const handleProcess = useCallback(() => {
    const url = inputUrl.trim();
    if (!url) { setError("Please enter a URL."); return; }
    setError("");
    setResult(null);
    setImgErrors(new Set());

    // Auto-detect first
    const detected = detectPlatform(url);
    const platform = detected ?? activePlatform;
    const extracted = platform.extract(url);

    if (!extracted) {
      // Try direct URL fallback
      const directResult = PLATFORMS[PLATFORMS.length - 1].extract(url);
      if (directResult) {
        setResult(directResult);
        return;
      }
      setError(
        `Could not extract image from this URL. Make sure it's a valid ${platform.name} URL.`
      );
      return;
    }
    if (detected) setActivePlatformId(detected.id);
    setResult(extracted);
  }, [inputUrl, activePlatform]);

  const handleDownload = async (imgUrl: string, label: string, idx: number) => {
    setLoadingIdx(idx);
    try {
      // Use proxy for non-YouTube (YouTube thumbnails are public CORS-free)
      const isYouTubeCdn =
        imgUrl.includes("img.youtube.com") || imgUrl.includes("i.ytimg.com");

      let fetchUrl = imgUrl;
      if (!isYouTubeCdn) {
        fetchUrl = `/api/proxy-image?url=${encodeURIComponent(imgUrl)}`;
      }

      const res = await fetch(fetchUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      const ext = imgUrl.includes(".png") ? "png" : imgUrl.includes(".webp") ? "webp" : "jpg";
      a.download = `imagegen_${label.replace(/\s+/g, "_").toLowerCase()}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch {
      // Fallback: open directly in new tab
      window.open(imgUrl, "_blank");
    } finally {
      setLoadingIdx(null);
    }
  };

  const handleImgError = (idx: number) => {
    setImgErrors((prev) => new Set(prev).add(idx));
  };

  const platformGroups = [
    { label: "Video", platforms: ["youtube", "youtube-shorts"] },
    { label: "Social", platforms: ["pinterest", "twitter", "reddit"] },
    { label: "Photo", platforms: ["unsplash", "flickr", "imgur"] },
    { label: "Other", platforms: ["direct"] },
  ];

  return (
    <div className="fade-in-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="font-mono font-bold text-xl md:text-2xl tracking-tight">
            Social Media Image Downloader
          </h2>
          <p className="text-sm text-black/50 mt-1">
            Download images & thumbnails from YouTube, Pinterest, Twitter, Reddit, Imgur, Unsplash, Flickr and more.
          </p>
        </div>
        <span className="font-mono text-xs border-2 border-black px-2 py-1 flex-shrink-0">FREE</span>
      </div>

      {/* Platform tabs */}
      <div className="mb-5">
        <div className="flex flex-wrap gap-1 border-2 border-black rounded-lg p-2">
          {platformGroups.map((group) => (
            <div key={group.label} className="flex items-center gap-1">
              <span className="font-mono text-xs text-black/20 px-1 hidden sm:inline">{group.label}</span>
              {group.platforms.map((pid) => {
                const p = PLATFORMS.find((pl) => pl.id === pid)!;
                return (
                  <button
                    key={pid}
                    onClick={() => { setActivePlatformId(pid); setResult(null); setError(""); setInputUrl(""); }}
                    className={`font-mono text-xs px-2.5 py-1.5 border transition-colors whitespace-nowrap ${
                      activePlatformId === pid
                        ? "bg-black text-white border-black"
                        : "bg-white text-black border-black/20 hover:border-black hover:bg-black/5"
                    }`}
                  >
                    {p.icon} {p.name}
                  </button>
                );
              })}
              <span className="font-mono text-xs text-black/10 px-1">|</span>
            </div>
          ))}
        </div>
      </div>

      {/* Input area */}
      <div className="border-2 border-black rounded-lg p-5 mb-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-mono font-bold text-sm">{activePlatform.icon}</span>
          <span className="font-mono font-bold text-sm">{activePlatform.name}</span>
        </div>
        <p className="font-mono text-xs text-black/40 mb-3">{activePlatform.hint}</p>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            value={inputUrl}
            onChange={(e) => { setInputUrl(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleProcess()}
            placeholder={activePlatform.placeholder}
            className="flex-1 border-2 border-black px-4 py-3 font-mono text-sm focus:outline-none bg-white placeholder:text-black/25"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            onClick={handleProcess}
            disabled={!inputUrl.trim()}
            className={`font-mono text-sm uppercase tracking-widest px-6 py-3 border-2 border-black font-bold transition-colors ${
              !inputUrl.trim()
                ? "opacity-40 cursor-not-allowed bg-black/10"
                : "bg-black text-white hover:bg-white hover:text-black"
            }`}
          >
            Get Images →
          </button>
        </div>

        {error && (
          <p className="font-mono text-xs text-black/60 mt-3 border border-black/20 px-3 py-2 bg-black/[0.02]">
            ✗ {error}
          </p>
        )}
      </div>

      {/* Quick examples */}
      {!result && (
        <div className="mb-5">
          <p className="font-mono text-xs text-black/30 uppercase tracking-widest mb-2">Try an example</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "YouTube Video", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
              { label: "YouTube Shorts", url: "https://youtube.com/shorts/5LGEiIGCPY4" },
              { label: "Imgur Image", url: "https://i.imgur.com/removed.png" },
              { label: "Direct JPG", url: "https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=1920" },
            ].map((ex) => (
              <button
                key={ex.label}
                onClick={() => { setInputUrl(ex.url); setResult(null); setError(""); }}
                className="font-mono text-xs px-3 py-1.5 border border-black/20 hover:border-black hover:bg-black/5 transition-colors"
              >
                {ex.label} ↗
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="border-2 border-black rounded-lg overflow-hidden">
          {/* Result header */}
          <div className="flex items-center justify-between px-4 py-3 bg-black text-white border-b-2 border-black">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-white/50">Result</p>
              <p className="font-mono font-bold text-sm">{result.title}</p>
            </div>
            <button
              onClick={() => { setResult(null); setInputUrl(""); setImgErrors(new Set()); }}
              className="font-mono text-xs text-white/50 hover:text-white border border-white/20 hover:border-white px-2 py-1 transition-colors"
            >
              ✕ Clear
            </button>
          </div>

          {result.directOnly ? (
            <div className="p-6 text-center">
              <p className="font-mono text-sm text-black/60 mb-3">
                This platform requires authentication to access images.
              </p>
              <p className="font-mono text-xs text-black/40">
                Tip: Right-click the image on the platform and choose &quot;Save image as...&quot;, or paste the direct CDN image URL below.
              </p>
            </div>
          ) : (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {result.images.map((img, idx) => {
                const hasError = imgErrors.has(idx);
                const isLoading = loadingIdx === idx;
                return (
                  <div
                    key={idx}
                    className="border-2 border-black rounded-lg overflow-hidden flex flex-col"
                  >
                    {/* Preview */}
                    <div className="aspect-video bg-black/5 overflow-hidden relative flex items-center justify-center">
                      {!hasError ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={img.url}
                          alt={img.label}
                          className="w-full h-full object-cover"
                          onError={() => handleImgError(idx)}
                          crossOrigin="anonymous"
                        />
                      ) : (
                        <div className="text-center p-2">
                          <p className="font-mono text-xs text-black/30">Preview unavailable</p>
                          <p className="font-mono text-xs text-black/20 mt-1">Download to view</p>
                        </div>
                      )}
                      {/* Quality badge */}
                      <span className={`absolute top-1.5 left-1.5 font-mono text-xs px-1.5 py-0.5 ${QUALITY_BADGE[img.quality]}`}>
                        {img.quality.toUpperCase()}
                      </span>
                    </div>

                    {/* Info + Download */}
                    <div className="p-2.5 flex flex-col gap-2 flex-1 justify-between">
                      <div>
                        <p className="font-mono font-bold text-xs leading-snug">{img.label}</p>
                        {img.width && img.height && (
                          <p className="font-mono text-xs text-black/40">{img.width}×{img.height}px</p>
                        )}
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleDownload(img.url, img.label, idx)}
                          disabled={isLoading}
                          className={`flex-1 font-mono text-xs uppercase tracking-widest py-2 border-2 border-black font-bold transition-colors ${
                            isLoading
                              ? "bg-black/40 text-white cursor-wait"
                              : "bg-black text-white hover:bg-white hover:text-black"
                          }`}
                        >
                          {isLoading ? "…" : "↓ Download"}
                        </button>
                        <a
                          href={img.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs px-2 py-2 border-2 border-black hover:bg-black hover:text-white transition-colors"
                          title="Open in new tab"
                        >
                          ↗
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Platform support table */}
      {!result && (
        <div className="mt-8 border-2 border-black rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b-2 border-black">
            <p className="font-mono font-bold text-xs uppercase tracking-widest">Platform Support</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full font-mono text-xs">
              <thead>
                <tr className="border-b border-black/10">
                  <th className="text-left px-4 py-2.5 text-black/40 uppercase tracking-widest">Platform</th>
                  <th className="text-left px-4 py-2.5 text-black/40 uppercase tracking-widest">What you get</th>
                  <th className="text-left px-4 py-2.5 text-black/40 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { p: "YouTube", what: "Up to 8 thumbnail sizes (maxres, SD, HQ, MQ, default)", status: "✓ Full support", ok: true },
                  { p: "YouTube Shorts", what: "Thumbnail in 3 sizes", status: "✓ Full support", ok: true },
                  { p: "Twitter / X", what: "All sizes from pbs.twimg.com URLs", status: "✓ Direct CDN", ok: true },
                  { p: "Reddit", what: "Full image from i.redd.it links", status: "✓ Direct CDN", ok: true },
                  { p: "Imgur", what: "5 sizes — original, huge, large, medium, small", status: "✓ Full support", ok: true },
                  { p: "Unsplash", what: "Multiple sizes + WebP from photo URLs", status: "✓ Full support", ok: true },
                  { p: "Flickr", what: "7 sizes from live.staticflickr.com links", status: "✓ Direct CDN", ok: true },
                  { p: "Pinterest", what: "Image from i.pinimg.com CDN links", status: "~ Partial (CDN URL required)", ok: false },
                  { p: "Facebook", what: "Profile/cover photos", status: "✗ Auth required", ok: false },
                  { p: "Instagram", what: "Posts, Reels, Stories", status: "✗ Auth required", ok: false },
                  { p: "Quora", what: "qph.cf2.quoracdn.net image URLs", status: "~ Direct URL only", ok: false },
                  { p: "Any Direct URL", what: "Any .jpg .png .webp .gif image URL", status: "✓ Universal", ok: true },
                ].map((row) => (
                  <tr key={row.p} className="border-b border-black/10 last:border-b-0 hover:bg-black/[0.02]">
                    <td className="px-4 py-2.5 font-bold">{row.p}</td>
                    <td className="px-4 py-2.5 text-black/50">{row.what}</td>
                    <td className={`px-4 py-2.5 ${row.ok ? "text-black font-bold" : "text-black/30"}`}>{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Note about Instagram/Facebook */}
      <div className="mt-4 border border-black/10 rounded-lg p-4 bg-black/[0.02]">
        <p className="font-mono text-xs text-black/50">
          <strong className="text-black">Note on Instagram & Facebook:</strong> These platforms require login to access images and block all third-party downloaders. Their CDN URLs change frequently. For Instagram, use the Instagram app&apos;s built-in download (Reels) or take a screenshot. For Facebook, right-click the image and &quot;Save image as&quot; when logged in.
        </p>
      </div>
    </div>
  );
}
