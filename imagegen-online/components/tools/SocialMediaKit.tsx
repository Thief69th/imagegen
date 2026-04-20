"use client";

import { useState, useRef, useCallback } from "react";
import { downloadBlob, formatSize } from "@/lib/canvasUtils";

/* ─── Platform definitions ───────────────────────────────────────── */
interface SizeVariant {
  name: string;      // e.g. "Square Post"
  w: number;
  h: number;
  tip: string;       // short usage tip
}

interface Platform {
  id: string;
  label: string;
  color: string;     // bg color for card header
  textColor: string; // text color for card header
  icon: string;      // emoji/icon
  sizes: SizeVariant[];
}

const PLATFORMS: Platform[] = [
  {
    id: "instagram",
    label: "Instagram",
    color: "#E1306C",
    textColor: "#fff",
    icon: "📸",
    sizes: [
      { name: "Square Post",  w: 1080, h: 1080, tip: "Best for feed posts" },
      { name: "Portrait Post",w: 1080, h: 1350, tip: "More screen space in feed" },
      { name: "Landscape",    w: 1080, h: 566,  tip: "Cinematic crop" },
      { name: "Story / Reel", w: 1080, h: 1920, tip: "Full-screen vertical" },
      { name: "Profile Pic",  w: 320,  h: 320,  tip: "Displays as circle" },
    ],
  },
  {
    id: "facebook",
    label: "Facebook",
    color: "#1877F2",
    textColor: "#fff",
    icon: "👍",
    sizes: [
      { name: "Feed Post",      w: 1200, h: 630,  tip: "Recommended feed size" },
      { name: "Square Post",    w: 1080, h: 1080, tip: "Clean square feed" },
      { name: "Cover Photo",    w: 820,  h: 312,  tip: "Page cover banner" },
      { name: "Story",          w: 1080, h: 1920, tip: "Full-screen story" },
      { name: "Profile Photo",  w: 170,  h: 170,  tip: "Displays as circle" },
      { name: "Event Cover",    w: 1920, h: 1080, tip: "Event page banner" },
    ],
  },
  {
    id: "youtube",
    label: "YouTube",
    color: "#FF0000",
    textColor: "#fff",
    icon: "▶️",
    sizes: [
      { name: "Thumbnail",      w: 1280, h: 720,  tip: "Most clicked size" },
      { name: "Channel Art",    w: 2560, h: 1440, tip: "Desktop banner" },
      { name: "Channel Icon",   w: 800,  h: 800,  tip: "Profile picture" },
      { name: "Shorts Cover",   w: 1080, h: 1920, tip: "Vertical short" },
      { name: "Community Post", w: 1080, h: 1080, tip: "Square community tab" },
    ],
  },
  {
    id: "pinterest",
    label: "Pinterest",
    color: "#E60023",
    textColor: "#fff",
    icon: "📌",
    sizes: [
      { name: "Standard Pin",   w: 1000, h: 1500, tip: "2:3 ratio — most saves" },
      { name: "Square Pin",     w: 1000, h: 1000, tip: "Square idea pin" },
      { name: "Long Pin",       w: 1000, h: 2100, tip: "Tall infographic pin" },
      { name: "Board Cover",    w: 800,  h: 800,  tip: "Board cover image" },
      { name: "Profile Photo",  w: 165,  h: 165,  tip: "Account picture" },
    ],
  },
  {
    id: "twitter",
    label: "Twitter / X",
    color: "#000000",
    textColor: "#fff",
    icon: "🐦",
    sizes: [
      { name: "Post Image",     w: 1600, h: 900,  tip: "16:9 timeline card" },
      { name: "Square Post",    w: 1080, h: 1080, tip: "Square tweet" },
      { name: "Header Banner",  w: 1500, h: 500,  tip: "Profile header" },
      { name: "Profile Photo",  w: 400,  h: 400,  tip: "Displays as circle" },
    ],
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    color: "#0A66C2",
    textColor: "#fff",
    icon: "💼",
    sizes: [
      { name: "Post / Article",   w: 1200, h: 627,  tip: "Standard share" },
      { name: "Square Post",      w: 1080, h: 1080, tip: "Feed square" },
      { name: "Cover Photo",      w: 1584, h: 396,  tip: "Profile banner" },
      { name: "Company Banner",   w: 1128, h: 191,  tip: "Company page cover" },
      { name: "Profile Photo",    w: 400,  h: 400,  tip: "Professional headshot" },
    ],
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    color: "#25D366",
    textColor: "#fff",
    icon: "💬",
    sizes: [
      { name: "Status",         w: 1080, h: 1920, tip: "Full-screen 24h status" },
      { name: "Shared Image",   w: 1600, h: 900,  tip: "Best for chat sharing" },
      { name: "Profile Photo",  w: 500,  h: 500,  tip: "Contact picture" },
      { name: "Group Icon",     w: 500,  h: 500,  tip: "Group profile image" },
    ],
  },
  {
    id: "snapchat",
    label: "Snapchat",
    color: "#FFFC00",
    textColor: "#000",
    icon: "👻",
    sizes: [
      { name: "Snap / Story",   w: 1080, h: 1920, tip: "Full-screen snap" },
      { name: "Spotlight",      w: 1080, h: 1920, tip: "Discover vertical" },
      { name: "Profile Icon",   w: 320,  h: 320,  tip: "Bitmoji placeholder" },
    ],
  },
  {
    id: "tiktok",
    label: "TikTok",
    color: "#010101",
    textColor: "#fff",
    icon: "🎵",
    sizes: [
      { name: "Video Thumbnail",  w: 1080, h: 1920, tip: "Portrait video cover" },
      { name: "Profile Photo",    w: 200,  h: 200,  tip: "Account picture" },
      { name: "Banner / Ad",      w: 1200, h: 628,  tip: "TopView ad size" },
    ],
  },
  {
    id: "telegram",
    label: "Telegram",
    color: "#2AABEE",
    textColor: "#fff",
    icon: "✈️",
    sizes: [
      { name: "Shared Image",   w: 1280, h: 720,  tip: "Chat image preview" },
      { name: "Channel Banner", w: 1280, h: 854,  tip: "Channel cover" },
      { name: "Profile Photo",  w: 512,  h: 512,  tip: "Contact picture" },
      { name: "Sticker",        w: 512,  h: 512,  tip: "Square sticker" },
    ],
  },
];

/* ─── Canvas resize + watermark utility ────────────────────────────── */
interface RenderOpts {
  w: number;
  h: number;
  username: string;
  showUsername: boolean;
  showPlatform: boolean;
  platformLabel: string;
  quality: number;
  fit: "cover" | "contain" | "stretch";
  bgColor: string;
}

function renderCanvas(img: HTMLImageElement, opts: RenderOpts): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = opts.w;
    canvas.height = opts.h;
    const ctx = canvas.getContext("2d")!;

    // Background
    ctx.fillStyle = opts.bgColor;
    ctx.fillRect(0, 0, opts.w, opts.h);

    // Draw image
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    if (opts.fit === "stretch") {
      ctx.drawImage(img, 0, 0, opts.w, opts.h);
    } else if (opts.fit === "contain") {
      const scale = Math.min(opts.w / iw, opts.h / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      ctx.drawImage(img, (opts.w - dw) / 2, (opts.h - dh) / 2, dw, dh);
    } else {
      // cover
      const scale = Math.max(opts.w / iw, opts.h / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      ctx.drawImage(img, (opts.w - dw) / 2, (opts.h - dh) / 2, dw, dh);
    }

    // Bottom bar watermark
    const showBar = opts.showUsername || opts.showPlatform;
    if (showBar) {
      const barH = Math.max(32, Math.round(opts.h * 0.045));
      const fs = Math.max(11, Math.round(barH * 0.52));

      // Semi-transparent bar at bottom
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(0, opts.h - barH, opts.w, barH);

      ctx.font = `600 ${fs}px 'Space Mono', monospace, sans-serif`;
      ctx.fillStyle = "#ffffff";
      ctx.textBaseline = "middle";
      const cy = opts.h - barH / 2;
      const pad = Math.round(opts.w * 0.02);

      // Left: @ username
      if (opts.showUsername && opts.username.trim()) {
        const handle = opts.username.startsWith("@")
          ? opts.username.trim()
          : `@${opts.username.trim()}`;
        ctx.textAlign = "left";
        ctx.fillText(handle, pad, cy);
      }

      // Right: platform name
      if (opts.showPlatform) {
        ctx.textAlign = "right";
        ctx.fillText(opts.platformLabel, opts.w - pad, cy);
      }
    }

    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      "image/jpeg",
      opts.quality / 100
    );
  });
}

/* ─── Main Component ───────────────────────────────────────────────── */
export default function SocialMediaKit() {
  const [file, setFile] = useState<File | null>(null);
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [preview, setPreview] = useState("");
  const [isDrag, setIsDrag] = useState(false);

  // Settings
  const [username, setUsername] = useState("");
  const [showUsername, setShowUsername] = useState(true);
  const [showPlatform, setShowPlatform] = useState(true);
  const [fit, setFit] = useState<"cover" | "contain" | "stretch">("cover");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [quality, setQuality] = useState(88);

  // State per size: "idle" | "processing" | "done" | "error"
  const [sizeStatus, setSizeStatus] = useState<Record<string, string>>({});
  const [sizeBlobs, setSizeBlobs] = useState<Record<string, Blob>>({});

  // Selected platforms to show
  const [shownPlatforms, setShownPlatforms] = useState<Set<string>>(
    new Set(PLATFORMS.map((p) => p.id))
  );

  const fileRef = useRef<HTMLInputElement>(null);

  /* Load file */
  const loadFile = useCallback((fl: FileList | null) => {
    if (!fl || fl.length === 0) return;
    const f = fl[0];
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
    setSizeStatus({});
    setSizeBlobs({});
    // Pre-load HTMLImageElement for canvas
    const img = new Image();
    img.onload = () => setImgEl(img);
    img.src = url;
  }, []);

  /* Key for a size: platformId-sizeName */
  const key = (pid: string, sname: string) => `${pid}__${sname}`;

  /* Process one size */
  const processOne = async (platform: Platform, size: SizeVariant) => {
    if (!imgEl) return;
    const k = key(platform.id, size.name);
    setSizeStatus((s) => ({ ...s, [k]: "processing" }));
    try {
      const blob = await renderCanvas(imgEl, {
        w: size.w, h: size.h,
        username, showUsername, showPlatform,
        platformLabel: `${platform.label} · ${size.name}`,
        quality, fit, bgColor,
      });
      setSizeBlobs((b) => ({ ...b, [k]: blob }));
      setSizeStatus((s) => ({ ...s, [k]: "done" }));
    } catch {
      setSizeStatus((s) => ({ ...s, [k]: "error" }));
    }
  };

  /* Process all sizes of all shown platforms */
  const processAll = async () => {
    if (!imgEl) return;
    for (const platform of PLATFORMS.filter((p) => shownPlatforms.has(p.id))) {
      for (const size of platform.sizes) {
        await processOne(platform, size);
      }
    }
  };

  /* Download one */
  const dlOne = (platform: Platform, size: SizeVariant) => {
    const k = key(platform.id, size.name);
    const blob = sizeBlobs[k];
    if (!blob) return;
    const base = file?.name.replace(/\.[^.]+$/, "") ?? "image";
    const fname = `${base}_${platform.id}_${size.name.replace(/\s+/g, "-").toLowerCase()}_${size.w}x${size.h}.jpg`;
    downloadBlob(blob, fname);
  };

  /* Download all done */
  const dlAll = async () => {
    const entries = Object.entries(sizeBlobs);
    if (entries.length === 0) return;
    if (entries.length === 1) {
      const [k, blob] = entries[0];
      downloadBlob(blob, `image_${k}.jpg`);
      return;
    }
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const base = file?.name.replace(/\.[^.]+$/, "") ?? "image";
      entries.forEach(([k, blob]) => {
        const parts = k.split("__");
        zip.file(`${base}_${parts[0]}_${parts[1]?.replace(/\s+/g, "-").toLowerCase()}.jpg`, blob);
      });
      const zb = await zip.generateAsync({ type: "blob" });
      downloadBlob(zb, `${base}_social_media_kit.zip`);
    } catch {
      entries.forEach(([k, blob], i) =>
        setTimeout(() => downloadBlob(blob, `${k}.jpg`), i * 300)
      );
    }
  };

  const togglePlatform = (id: string) => {
    setShownPlatforms((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const totalSizes = PLATFORMS.filter((p) => shownPlatforms.has(p.id))
    .reduce((acc, p) => acc + p.sizes.length, 0);
  const doneCount = Object.values(sizeStatus).filter((s) => s === "done").length;
  const allDone = doneCount === totalSizes && totalSizes > 0 && !!imgEl;

  return (
    <div className="fade-in-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="font-mono font-bold text-xl md:text-2xl tracking-tight">
            Social Media Image Kit
          </h2>
          <p className="text-sm text-black/50 mt-1">
            Upload once → get perfect sizes for Instagram, Facebook, YouTube, Pinterest & 6 more platforms. Add your username as a watermark.
          </p>
        </div>
        <span className="font-mono text-xs border-2 border-black px-2 py-1 flex-shrink-0">FREE</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT: Upload + Settings ── */}
        <div className="space-y-4">
          {/* Upload */}
          {!file ? (
            <div
              className={`border-2 border-dashed border-black rounded-lg p-8 text-center cursor-pointer transition-colors ${isDrag ? "bg-black/5" : "hover:bg-black/[0.02]"}`}
              onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
              onDragLeave={() => setIsDrag(false)}
              onDrop={(e) => { e.preventDefault(); setIsDrag(false); loadFile(e.dataTransfer.files); }}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => loadFile(e.target.files)} />
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 border-2 border-black rounded-full flex items-center justify-center text-lg">
                  📱
                </div>
                <p className="font-mono font-bold text-sm">Drop Your Image Here</p>
                <p className="text-xs text-black/40">JPG, PNG, WEBP — any size</p>
                <button type="button"
                  className="font-mono text-xs uppercase tracking-widest bg-black text-white px-5 py-2 border-2 border-black hover:bg-white hover:text-black transition-colors mt-1"
                  onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>
                  Select Image
                </button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-black rounded-lg overflow-hidden">
              <div className="flex justify-between items-center px-3 py-2 border-b-2 border-black bg-black/[0.02]">
                <span className="font-mono text-xs font-bold uppercase">Your Image</span>
                <button onClick={() => { setFile(null); setPreview(""); setImgEl(null); setSizeStatus({}); setSizeBlobs({}); }}
                  className="font-mono text-xs text-black/40 hover:text-black">✕ Change</button>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="source" className="w-full object-contain max-h-40 bg-black/5" />
              <div className="px-3 py-2">
                <p className="font-mono text-xs truncate">{file.name}</p>
                <p className="font-mono text-xs text-black/40">{formatSize(file.size)}</p>
              </div>
            </div>
          )}

          {/* Settings */}
          <div className={`border-2 border-black rounded-lg p-4 space-y-4 ${!file ? "opacity-40 pointer-events-none" : ""}`}>
            <p className="font-mono text-xs uppercase tracking-widest text-black/40">Branding Settings</p>

            {/* Username */}
            <div>
              <label className="font-mono text-xs text-black/50 block mb-1">
                Your Username / Handle
              </label>
              <div className="flex items-center border-2 border-black overflow-hidden">
                <span className="font-mono text-sm px-2 bg-black/5 border-r border-black py-2 text-black/40">@</span>
                <input
                  type="text"
                  value={username.replace(/^@/, "")}
                  onChange={(e) => setUsername(e.target.value.replace(/^@/, ""))}
                  placeholder="yourname"
                  className="flex-1 font-mono text-sm px-3 py-2 focus:outline-none bg-white"
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={showUsername} onChange={(e) => setShowUsername(e.target.checked)} className="w-4 h-4" />
                <span className="font-mono text-xs">Show @username on image</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={showPlatform} onChange={(e) => setShowPlatform(e.target.checked)} className="w-4 h-4" />
                <span className="font-mono text-xs">Show platform name on image</span>
              </label>
            </div>

            {/* Fit mode */}
            <div>
              <p className="font-mono text-xs text-black/50 mb-2">Image Fit</p>
              <div className="flex gap-2">
                {(["cover", "contain", "stretch"] as const).map((f) => (
                  <button key={f} onClick={() => setFit(f)}
                    className={`font-mono text-xs px-3 py-1.5 border-2 border-black transition-colors capitalize ${fit === f ? "bg-black text-white" : "hover:bg-black hover:text-white"}`}>
                    {f}
                  </button>
                ))}
              </div>
              <p className="font-mono text-xs text-black/30 mt-1">
                {fit === "cover" ? "Fills frame, may crop edges" : fit === "contain" ? "Fits fully, may show bg" : "Stretches to fill — may distort"}
              </p>
            </div>

            {/* Background color (for contain mode) */}
            {fit === "contain" && (
              <div className="flex items-center gap-3">
                <p className="font-mono text-xs text-black/50">Background</p>
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
                  className="w-10 h-9 border-2 border-black cursor-pointer" />
                {["#ffffff","#000000","#f5f5f5"].map((c) => (
                  <button key={c} onClick={() => setBgColor(c)} style={{ background: c }}
                    className={`w-7 h-7 border-2 ${bgColor === c ? "border-black" : "border-black/20"}`} />
                ))}
              </div>
            )}

            {/* Quality */}
            <div>
              <p className="font-mono text-xs text-black/50 mb-1">Output Quality — <strong>{quality}%</strong></p>
              <input type="range" min={60} max={100} value={quality}
                onChange={(e) => setQuality(Number(e.target.value))} className="w-full" />
            </div>
          </div>

          {/* Process All Button */}
          <button onClick={processAll}
            disabled={!imgEl || doneCount > 0}
            className={`w-full font-mono text-sm uppercase tracking-widest py-4 border-2 border-black font-bold transition-colors ${
              !imgEl ? "opacity-40 cursor-not-allowed bg-black/10 text-black"
              : doneCount > 0 ? "bg-white text-black border-black opacity-60 cursor-default"
              : "bg-black text-white hover:bg-white hover:text-black"
            }`}>
            {doneCount > 0
              ? `✓ ${doneCount}/${totalSizes} Sizes Ready`
              : `Generate All ${totalSizes} Sizes →`}
          </button>

          {allDone && (
            <div className="flex gap-3">
              <button onClick={dlAll}
                className="flex-1 font-mono text-sm uppercase tracking-widest py-3 border-2 border-black font-bold bg-black text-white hover:bg-white hover:text-black transition-colors">
                ↓ Download All as ZIP
              </button>
              <button onClick={() => { setSizeStatus({}); setSizeBlobs({}); }}
                className="font-mono text-xs uppercase tracking-widest px-4 py-3 border-2 border-black hover:bg-black hover:text-white transition-colors">
                ↺
              </button>
            </div>
          )}
        </div>

        {/* ── RIGHT (span 2): Platform cards ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Platform filter toggles */}
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-black/30 mb-2">Select Platforms</p>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button key={p.id} onClick={() => togglePlatform(p.id)}
                  className={`font-mono text-xs px-3 py-1.5 border-2 border-black transition-colors ${shownPlatforms.has(p.id) ? "bg-black text-white" : "hover:bg-black hover:text-white"}`}>
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Platform cards */}
          <div className="space-y-4">
            {PLATFORMS.filter((p) => shownPlatforms.has(p.id)).map((platform) => (
              <div key={platform.id} className="border-2 border-black rounded-xl overflow-hidden">
                {/* Platform header */}
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ background: platform.color, color: platform.textColor }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{platform.icon}</span>
                    <span className="font-mono font-bold text-sm tracking-tight">{platform.label}</span>
                    <span className="font-mono text-xs opacity-60">{platform.sizes.length} sizes</span>
                  </div>
                  {/* Process this platform */}
                  <button
                    onClick={() => { if (imgEl) platform.sizes.forEach((s) => processOne(platform, s)); }}
                    disabled={!imgEl}
                    className="font-mono text-xs uppercase tracking-widest px-3 py-1.5 border-2 transition-colors"
                    style={{
                      borderColor: platform.textColor,
                      color: platform.textColor,
                      background: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = platform.textColor;
                      (e.currentTarget as HTMLButtonElement).style.color = platform.color;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                      (e.currentTarget as HTMLButtonElement).style.color = platform.textColor;
                    }}
                  >
                    Generate All →
                  </button>
                </div>

                {/* Size rows */}
                <div className="divide-y divide-black/10">
                  {platform.sizes.map((size) => {
                    const k = key(platform.id, size.name);
                    const st = sizeStatus[k] ?? "idle";
                    const blob = sizeBlobs[k];
                    return (
                      <div key={size.name}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-black/[0.02] transition-colors">
                        {/* Size info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold">{size.name}</span>
                            <span className="font-mono text-xs text-black/40 border border-black/15 px-1.5 py-0.5 rounded">
                              {size.w}×{size.h}
                            </span>
                            <span className="font-mono text-xs text-black/30 hidden sm:inline">
                              {(size.w / size.h).toFixed(2) === "1.00" ? "1:1" :
                               (size.w / size.h).toFixed(2) === "1.78" ? "16:9" :
                               (size.w / size.h).toFixed(2) === "0.56" ? "9:16" :
                               (size.w / size.h).toFixed(2) === "0.67" ? "2:3" :
                               `${size.w}:${size.h}`}
                            </span>
                          </div>
                          <p className="font-mono text-xs text-black/35 mt-0.5">{size.tip}</p>
                        </div>

                        {/* Status + actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {st === "idle" && (
                            <button
                              onClick={() => processOne(platform, size)}
                              disabled={!imgEl}
                              className="font-mono text-xs px-3 py-1.5 border-2 border-black hover:bg-black hover:text-white transition-colors disabled:opacity-30">
                              Generate
                            </button>
                          )}
                          {st === "processing" && (
                            <span className="font-mono text-xs text-black/50 flex items-center gap-1">
                              <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin inline-block" />
                              Processing
                            </span>
                          )}
                          {st === "done" && blob && (
                            <>
                              <span className="font-mono text-xs text-black/40">{formatSize(blob.size)}</span>
                              <button
                                onClick={() => dlOne(platform, size)}
                                className="font-mono text-xs px-3 py-1.5 border-2 border-black bg-black text-white hover:bg-white hover:text-black transition-colors">
                                ↓ Download
                              </button>
                            </>
                          )}
                          {st === "error" && (
                            <span className="font-mono text-xs text-black/40">Error — retry</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Summary bar when all done */}
          {allDone && (
            <div className="border-2 border-black rounded-lg p-4 bg-black text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono font-bold text-sm">✓ All {doneCount} sizes generated!</p>
                  <p className="font-mono text-xs text-white/60 mt-1">
                    {username ? `@${username.replace(/^@/, "")} watermark applied` : "No watermark"} ·{" "}
                    {shownPlatforms.size} platforms ·{" "}
                    {PLATFORMS.filter((p) => shownPlatforms.has(p.id)).reduce((a, p) => a + p.sizes.length, 0)} sizes
                  </p>
                </div>
                <button onClick={dlAll}
                  className="font-mono text-xs uppercase tracking-widest px-4 py-2.5 border-2 border-white bg-white text-black hover:bg-black hover:text-white transition-colors">
                  ↓ ZIP All
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
