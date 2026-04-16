"use client";

import { useState, useRef, useCallback } from "react";

type Platform = "facebook" | "instagram" | "pinterest" | "unknown";
type SizeOption = "original" | "large" | "medium" | "small";
type OutputFormat = "jpg" | "png" | "webp";
type QualityLevel = "high" | "medium" | "low";

interface PreviewData {
  imageUrl: string;
  username: string | null;
  title: string | null;
  platform: Platform;
  displayName: string;
  domain: string;
}

const PLATFORM_EXAMPLES = [
  { platform: "Instagram", example: "https://www.instagram.com/p/...", emoji: "📸", color: "from-purple-500 to-pink-500" },
  { platform: "Pinterest", example: "https://www.pinterest.com/pin/...", emoji: "📌", color: "from-red-500 to-red-700" },
  { platform: "Facebook", example: "https://www.facebook.com/photo/...", emoji: "📘", color: "from-blue-500 to-blue-700" },
];

const SIZE_OPTIONS: { value: SizeOption; label: string; desc: string }[] = [
  { value: "original", label: "Original", desc: "Keep original size" },
  { value: "large", label: "Large", desc: "1080px width" },
  { value: "medium", label: "Medium", desc: "720px width" },
  { value: "small", label: "Small", desc: "480px width" },
];

const FORMAT_OPTIONS: { value: OutputFormat; label: string }[] = [
  { value: "jpg", label: "JPG" },
  { value: "png", label: "PNG" },
  { value: "webp", label: "WEBP" },
];

const QUALITY_OPTIONS: { value: QualityLevel; label: string; desc: string }[] = [
  { value: "high", label: "High", desc: "90%" },
  { value: "medium", label: "Medium", desc: "70%" },
  { value: "low", label: "Low", desc: "50%" },
];

function PlatformBadge({ platform, displayName }: { platform: Platform; displayName: string }) {
  const emoji =
    platform === "instagram" ? "📸" :
    platform === "pinterest" ? "📌" :
    platform === "facebook" ? "📘" : "🌐";

  return (
    <span className="inline-flex items-center gap-1 font-mono text-xs border-2 border-black px-2 py-0.5 bg-black text-white">
      {emoji} {displayName}
    </span>
  );
}

export default function SocialDownloader() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  // Options
  const [size, setSize] = useState<SizeOption>("original");
  const [format, setFormat] = useState<OutputFormat>("jpg");
  const [quality, setQuality] = useState<QualityLevel>("high");

  const urlInputRef = useRef<HTMLInputElement>(null);

  const detectUrlPlatform = (u: string): Platform => {
    const lower = u.toLowerCase();
    if (lower.includes("facebook.com") || lower.includes("fb.com")) return "facebook";
    if (lower.includes("instagram.com")) return "instagram";
    if (lower.includes("pinterest.com") || lower.includes("pin.it")) return "pinterest";
    return "unknown";
  };

  const currentPlatform = detectUrlPlatform(url);

  const handleGetPreview = useCallback(async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setPreview(null);
    setImgError(false);

    try {
      const res = await fetch(`/api/preview?url=${encodeURIComponent(url.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load preview.");
        return;
      }
      setPreview(data);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [url]);

  const handleDownload = useCallback(async () => {
    if (!preview || downloading) return;
    setDownloading(true);
    setError(null);

    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: preview.imageUrl,
          username: preview.username,
          platform: preview.platform,
          domain: preview.domain,
          size,
          format,
          quality,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Download failed. Please try again.");
        return;
      }

      // Trigger browser download
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      const cd = res.headers.get("content-disposition") ?? "";
      const nameMatch = cd.match(/filename="([^"]+)"/);
      a.download = nameMatch?.[1] ?? `imagegen_download.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    } catch {
      setError("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  }, [preview, size, format, quality, downloading]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleGetPreview();
  };

  return (
    <div className="fade-in-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-2">
        <div className="min-w-0">
          <h2 className="font-mono font-bold text-xl md:text-2xl tracking-tight">
            Social Media Image Downloader
          </h2>
          <p className="text-sm text-black/50 mt-1">
            Download public images from Instagram, Pinterest &amp; Facebook — resize, convert &amp; watermark.
          </p>
        </div>
        <span className="font-mono text-xs border-2 border-black px-2 py-1 flex-shrink-0">FREE</span>
      </div>

      {/* Platform chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {PLATFORM_EXAMPLES.map(({ platform, emoji }) => (
          <span key={platform}
            className={`font-mono text-xs px-3 py-1.5 border-2 border-black ${
              (currentPlatform === platform.toLowerCase() && url) ? "bg-black text-white" : "bg-white text-black"
            } flex items-center gap-1.5`}>
            {emoji} {platform}
          </span>
        ))}
      </div>

      {/* URL Input */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative min-w-0">
          <input
            ref={urlInputRef}
            type="url"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(null); setPreview(null); setImgError(false); }}
            onKeyDown={handleKeyDown}
            placeholder="Paste Instagram, Pinterest, or Facebook URL here..."
            className="w-full border-2 border-black px-4 py-3 font-mono text-sm focus:outline-none bg-white pr-10"
            disabled={loading}
          />
          {url && (
            <button
              onClick={() => { setUrl(""); setPreview(null); setError(null); urlInputRef.current?.focus(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 hover:text-black font-mono text-lg"
              aria-label="Clear URL">
              ✕
            </button>
          )}
        </div>
        <button
          onClick={handleGetPreview}
          disabled={loading || !url.trim()}
          className={`font-mono text-sm uppercase tracking-widest px-6 py-3 border-2 border-black font-bold transition-colors whitespace-nowrap flex-shrink-0 ${
            !url.trim() ? "opacity-40 cursor-not-allowed bg-black/10 text-black"
            : loading ? "bg-black/60 text-white cursor-wait"
            : "bg-black text-white hover:bg-white hover:text-black"
          }`}>
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="inline-flex gap-0.5">
                {[0,1,2].map((i) => (
                  <span key={i} className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </span>
              Loading…
            </span>
          ) : "Get Preview →"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="border-2 border-black px-4 py-3 mb-6 flex items-start gap-3">
          <span className="text-lg flex-shrink-0">⚠️</span>
          <div>
            <p className="font-mono text-xs font-bold mb-0.5">Could Not Load Image</p>
            <p className="font-mono text-xs text-black/70">{error}</p>
          </div>
        </div>
      )}

      {/* Preview + Options */}
      {preview && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 min-w-0">

          {/* LEFT: Image Preview */}
          <div className="space-y-4">
            <div className="border-2 border-black rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b-2 border-black bg-black">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold uppercase text-white">Preview</span>
                  <PlatformBadge platform={preview.platform} displayName={preview.displayName} />
                </div>
                {preview.username && (
                  <span className="font-mono text-xs text-white/60 truncate max-w-[120px]">{preview.username}</span>
                )}
              </div>

              {!imgError ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={preview.imageUrl}
                  alt={preview.title ?? "Preview"}
                  className="w-full object-contain max-h-80 bg-black/5"
                  onError={() => setImgError(true)}
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="h-48 bg-black/5 flex flex-col items-center justify-center gap-2 px-4 text-center">
                  <span className="text-3xl">🖼</span>
                  <p className="font-mono text-xs font-bold">Image Preview Blocked</p>
                  <p className="font-mono text-xs text-black/50">
                    The image exists but can&apos;t be previewed here due to platform restrictions.
                    Click Download to get the processed image.
                  </p>
                </div>
              )}

              {preview.title && (
                <div className="px-3 py-2 border-t border-black/10">
                  <p className="font-mono text-xs truncate text-black/60">{preview.title}</p>
                </div>
              )}
            </div>

            {/* Watermark info */}
            <div className="border border-black/20 px-3 py-3 bg-black/[0.02]">
              <p className="font-mono text-xs uppercase tracking-widest text-black/40 mb-1.5">Auto Watermark</p>
              <div className="inline-flex items-center gap-2 font-mono text-xs bg-black/80 text-white px-3 py-1.5 rounded">
                <span>©</span>
                <span>
                  {preview.username
                    ? `${preview.username.startsWith("@") ? preview.username : "@" + preview.username} | ${preview.displayName}`
                    : `Source: ${preview.domain}`}
                </span>
              </div>
              <p className="font-mono text-xs text-black/40 mt-1.5">Added to bottom-right corner at 35% opacity</p>
            </div>
          </div>

          {/* RIGHT: Options + Download */}
          <div className="space-y-4 min-w-0">

            {/* Size */}
            <div className="border-2 border-black rounded-lg overflow-hidden">
              <div className="px-3 py-2 border-b-2 border-black bg-black/[0.02]">
                <p className="font-mono text-xs uppercase tracking-widest text-black/40">Size</p>
              </div>
              <div className="grid grid-cols-2">
                {SIZE_OPTIONS.map((opt, i) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-r border-black/10 ${
                      i === SIZE_OPTIONS.length - 1 || i === SIZE_OPTIONS.length - 2 ? "" : ""
                    } ${size === opt.value ? "bg-black text-white" : "hover:bg-black/[0.03]"}`}>
                    <input type="radio" name="size" value={opt.value} checked={size === opt.value}
                      onChange={() => setSize(opt.value)} className="flex-shrink-0" />
                    <div>
                      <p className={`font-mono text-xs font-bold ${size === opt.value ? "text-white" : ""}`}>{opt.label}</p>
                      <p className={`font-mono text-xs ${size === opt.value ? "text-white/60" : "text-black/40"}`}>{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Format */}
            <div className="border-2 border-black rounded-lg p-4">
              <p className="font-mono text-xs uppercase tracking-widest text-black/40 mb-3">Format</p>
              <div className="flex gap-2">
                {FORMAT_OPTIONS.map((opt) => (
                  <button key={opt.value} onClick={() => setFormat(opt.value)}
                    className={`flex-1 font-mono text-xs uppercase tracking-widest py-2.5 border-2 border-black transition-colors ${
                      format === opt.value ? "bg-black text-white" : "hover:bg-black hover:text-white"
                    }`}>
                    .{opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality */}
            <div className="border-2 border-black rounded-lg overflow-hidden">
              <div className="px-3 py-2 border-b-2 border-black bg-black/[0.02]">
                <p className="font-mono text-xs uppercase tracking-widest text-black/40">Quality</p>
              </div>
              <div className="flex divide-x-2 divide-black">
                {QUALITY_OPTIONS.map((opt) => (
                  <label key={opt.value}
                    className={`flex-1 flex flex-col items-center gap-0.5 px-2 py-3 cursor-pointer transition-colors ${
                      quality === opt.value ? "bg-black text-white" : "hover:bg-black/[0.03]"
                    }`}>
                    <input type="radio" name="quality" value={opt.value} checked={quality === opt.value}
                      onChange={() => setQuality(opt.value)} className="sr-only" />
                    <span className={`font-mono text-xs font-bold ${quality === opt.value ? "text-white" : ""}`}>{opt.label}</span>
                    <span className={`font-mono text-xs ${quality === opt.value ? "text-white/60" : "text-black/40"}`}>{opt.desc}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Summary box */}
            <div className="border border-black/20 px-3 py-2 bg-black/[0.02]">
              <p className="font-mono text-xs text-black/50">
                Will download as{" "}
                <strong>.{format.toUpperCase()}</strong> ·{" "}
                <strong>{SIZE_OPTIONS.find((s) => s.value === size)?.desc}</strong> ·{" "}
                <strong>{QUALITY_OPTIONS.find((q) => q.value === quality)?.label} quality</strong> ·{" "}
                <strong>auto watermark</strong>
              </p>
            </div>

            {/* Download button */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              className={`w-full font-mono text-sm uppercase tracking-widest py-4 border-2 border-black font-bold transition-colors ${
                downloading
                  ? "bg-black/60 text-white cursor-wait"
                  : "bg-black text-white hover:bg-white hover:text-black"
              }`}>
              {downloading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-flex gap-0.5">
                    {[0,1,2].map((i) => (
                      <span key={i} className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </span>
                  Processing &amp; Downloading…
                </span>
              ) : "↓ Download Image"}
            </button>

            {/* Notice */}
            <div className="border border-black/10 px-3 py-2">
              <p className="font-mono text-xs text-black/40 leading-relaxed">
                ⚠ Only public images are supported. Private posts, stories, and login-required content cannot be downloaded. Respect copyright and platform terms of service.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty state / How it works */}
      {!preview && !error && !loading && (
        <div className="border-2 border-black/10 rounded-lg p-6">
          <p className="font-mono text-xs uppercase tracking-widest text-black/30 mb-4 text-center">How It Works</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { step: "01", title: "Paste URL", desc: "Copy a public post URL from Instagram, Pinterest, or Facebook and paste it above." },
              { step: "02", title: "Get Preview", desc: "We extract the image and show you a preview with watermark info and download options." },
              { step: "03", title: "Download", desc: "Choose size, format and quality. The image is processed and downloaded instantly." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="font-mono text-3xl font-bold text-black/10 mb-2">{step}</div>
                <p className="font-mono text-xs font-bold mb-1">{title}</p>
                <p className="font-mono text-xs text-black/50">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
