"use client";

import { useState, useRef, useCallback } from "react";
import { downloadBlob, formatSize } from "@/lib/canvasUtils";

/* ── Canvas effect processors ───────────────────────────────── */
function loadImg(file: File): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => { URL.revokeObjectURL(url); res(img); };
    img.onerror = () => { URL.revokeObjectURL(url); rej(); };
    img.src = url;
  });
}

type EffectId =
  | "sepia-effect" | "vintage-effect" | "pixelate-image"
  | "vignette-effect" | "duotone-effect" | "glitch-effect"
  | "sketch-effect" | "posterize-effect" | "add-rounded-corners"
  | "image-opacity" | "image-frame";

interface EffectConfig {
  label: string;
  description: string;
  outputPng?: boolean; // needs transparency
  controls: ControlDef[];
}

interface ControlDef {
  id: string;
  label: string;
  type: "range" | "color" | "color2";
  min?: number; max?: number; step?: number; defaultVal?: number | string;
}

const EFFECTS: Record<EffectId, EffectConfig> = {
  "sepia-effect": {
    label: "Sepia Effect",
    description: "Warm brown-tone filter that makes photos look aged and nostalgic.",
    controls: [{ id: "intensity", label: "Intensity", type: "range", min: 0, max: 100, step: 1, defaultVal: 100 }],
  },
  "vintage-effect": {
    label: "Vintage Photo Effect",
    description: "Retro film look: faded colours, warm tones, slight vignette.",
    controls: [{ id: "strength", label: "Strength", type: "range", min: 0, max: 100, step: 1, defaultVal: 70 }],
  },
  "pixelate-image": {
    label: "Pixelate / Mosaic",
    description: "Turn any photo into a blocky pixel art or mosaic effect.",
    controls: [{ id: "size", label: "Pixel Block Size", type: "range", min: 2, max: 40, step: 1, defaultVal: 10 }],
  },
  "vignette-effect": {
    label: "Vignette Effect",
    description: "Darkened edges that draw focus to the centre of the photo.",
    controls: [
      { id: "strength", label: "Strength", type: "range", min: 0, max: 100, step: 1, defaultVal: 60 },
      { id: "size", label: "Vignette Size", type: "range", min: 20, max: 100, step: 1, defaultVal: 60 },
    ],
  },
  "duotone-effect": {
    label: "Duotone Effect",
    description: "Two-colour effect — dark tones → colour 1, light tones → colour 2.",
    controls: [
      { id: "color1", label: "Shadow Colour", type: "color", defaultVal: "#1a1a2e" },
      { id: "color2", label: "Highlight Colour", type: "color", defaultVal: "#ff6b6b" },
    ],
  },
  "glitch-effect": {
    label: "Glitch Effect",
    description: "Cyberpunk-style digital glitch with RGB channel splitting.",
    controls: [
      { id: "intensity", label: "Glitch Intensity", type: "range", min: 1, max: 20, step: 1, defaultVal: 8 },
      { id: "slices", label: "Slice Count", type: "range", min: 3, max: 15, step: 1, defaultVal: 6 },
    ],
  },
  "sketch-effect": {
    label: "Photo to Pencil Sketch",
    description: "Convert any photo into a black & white pencil sketch drawing.",
    controls: [{ id: "strength", label: "Sketch Strength", type: "range", min: 1, max: 5, step: 0.5, defaultVal: 2.5 }],
  },
  "posterize-effect": {
    label: "Posterize Image",
    description: "Reduce colour levels for bold, retro Andy Warhol-style poster effect.",
    controls: [{ id: "levels", label: "Colour Levels", type: "range", min: 2, max: 8, step: 1, defaultVal: 4 }],
  },
  "add-rounded-corners": {
    label: "Rounded Corners",
    description: "Clip image into rounded rectangle — transparent PNG output.",
    outputPng: true,
    controls: [{ id: "radius", label: "Corner Radius (px)", type: "range", min: 5, max: 200, step: 5, defaultVal: 40 }],
  },
  "image-opacity": {
    label: "Change Image Opacity",
    description: "Set image transparency — useful for overlays, watermarks, UI elements.",
    outputPng: true,
    controls: [{ id: "opacity", label: "Opacity", type: "range", min: 5, max: 100, step: 5, defaultVal: 50 }],
  },
  "image-frame": {
    label: "Photo Frame Generator",
    description: "Add a solid or double-line decorative frame around your photo.",
    controls: [
      { id: "size", label: "Frame Size (px)", type: "range", min: 5, max: 80, step: 1, defaultVal: 20 },
      { id: "color1", label: "Frame Colour", type: "color", defaultVal: "#000000" },
      { id: "inner", label: "Inner Gap (px)", type: "range", min: 0, max: 20, step: 1, defaultVal: 4 },
    ],
  },
};

/* ── Effect renderer ────────────────────────────────────────── */
function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

async function applyEffect(
  img: HTMLImageElement,
  effectId: EffectId,
  params: Record<string, number | string>
): Promise<Blob> {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  const isTransparent = EFFECTS[effectId].outputPng;

  switch (effectId) {

    case "sepia-effect": {
      const intensity = (params.intensity as number) / 100;
      const id = ctx.getImageData(0, 0, w, h);
      const d = id.data;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i+1], b = d[i+2];
        const sr = Math.min(255, r * (1-intensity) + (r * 0.393 + g * 0.769 + b * 0.189) * intensity);
        const sg = Math.min(255, g * (1-intensity) + (r * 0.349 + g * 0.686 + b * 0.168) * intensity);
        const sb = Math.min(255, b * (1-intensity) + (r * 0.272 + g * 0.534 + b * 0.131) * intensity);
        d[i] = sr; d[i+1] = sg; d[i+2] = sb;
      }
      ctx.putImageData(id, 0, 0);
      break;
    }

    case "vintage-effect": {
      const s = (params.strength as number) / 100;
      // 1) Slight warm tone + faded
      const id = ctx.getImageData(0, 0, w, h);
      const d = id.data;
      for (let i = 0; i < d.length; i += 4) {
        d[i]   = Math.min(255, d[i]   * (1 + 0.1*s) + 20*s);  // red boost
        d[i+1] = Math.min(255, d[i+1] * (1 - 0.05*s) + 10*s); // slight green
        d[i+2] = Math.min(255, d[i+2] * (1 - 0.1*s));          // reduce blue
      }
      ctx.putImageData(id, 0, 0);
      // 2) Vignette
      const grad = ctx.createRadialGradient(w/2, h/2, Math.min(w,h)*0.3, w/2, h/2, Math.max(w,h)*0.7);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, `rgba(0,0,0,${0.4*s})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      // 3) Film grain
      const grain = ctx.getImageData(0, 0, w, h);
      const gd = grain.data;
      for (let i = 0; i < gd.length; i += 4) {
        const noise = (Math.random() - 0.5) * 30 * s;
        gd[i]   = Math.min(255, Math.max(0, gd[i]   + noise));
        gd[i+1] = Math.min(255, Math.max(0, gd[i+1] + noise));
        gd[i+2] = Math.min(255, Math.max(0, gd[i+2] + noise));
      }
      ctx.putImageData(grain, 0, 0);
      break;
    }

    case "pixelate-image": {
      const size = Math.max(2, params.size as number);
      // Draw downscaled then upscaled via imageSmoothingEnabled
      ctx.imageSmoothingEnabled = false;
      const tmp = document.createElement("canvas");
      tmp.width  = Math.ceil(w / size);
      tmp.height = Math.ceil(h / size);
      const tctx = tmp.getContext("2d")!;
      tctx.drawImage(img, 0, 0, tmp.width, tmp.height);
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(tmp, 0, 0, tmp.width, tmp.height, 0, 0, w, h);
      break;
    }

    case "vignette-effect": {
      const s = (params.strength as number) / 100;
      const sz = (params.size as number) / 100;
      const grad = ctx.createRadialGradient(w/2, h/2, Math.min(w,h)*sz*0.4, w/2, h/2, Math.max(w,h)*0.8);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, `rgba(0,0,0,${s})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      break;
    }

    case "duotone-effect": {
      const c1 = hexToRgb(params.color1 as string);
      const c2 = hexToRgb(params.color2 as string);
      // Grayscale first
      const id = ctx.getImageData(0, 0, w, h);
      const d = id.data;
      for (let i = 0; i < d.length; i += 4) {
        const gray = (d[i]*0.299 + d[i+1]*0.587 + d[i+2]*0.114) / 255;
        d[i]   = Math.round(c1.r + (c2.r - c1.r) * gray);
        d[i+1] = Math.round(c1.g + (c2.g - c1.g) * gray);
        d[i+2] = Math.round(c1.b + (c2.b - c1.b) * gray);
      }
      ctx.putImageData(id, 0, 0);
      break;
    }

    case "glitch-effect": {
      const intensity = params.intensity as number;
      const slices = Math.round(params.slices as number);
      const id = ctx.getImageData(0, 0, w, h);
      // RGB channel shift
      const shifted = ctx.createImageData(w, h);
      const src = id.data; const dst = shifted.data;
      const offsetR = Math.round(intensity * 1.5);
      const offsetB = Math.round(intensity * 1.2);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4;
          // Red channel: shift right
          const rx = Math.min(w-1, x + offsetR);
          const ri = (y * w + rx) * 4;
          dst[i]   = src[ri];
          // Green: normal
          dst[i+1] = src[i+1];
          // Blue: shift left
          const bx = Math.max(0, x - offsetB);
          const bi = (y * w + bx) * 4;
          dst[i+2] = src[bi+2];
          dst[i+3] = 255;
        }
      }
      ctx.putImageData(shifted, 0, 0);
      // Horizontal scan-line slices
      for (let s = 0; s < slices; s++) {
        const sy = Math.floor(Math.random() * h);
        const sh = Math.floor(Math.random() * 10 + 3);
        const sx = Math.round((Math.random() - 0.5) * intensity * 3);
        const slice = ctx.getImageData(0, sy, w, Math.min(sh, h - sy));
        ctx.putImageData(slice, sx, sy);
      }
      break;
    }

    case "sketch-effect": {
      const strength = params.strength as number;
      // 1) Grayscale
      const id = ctx.getImageData(0, 0, w, h);
      const d = id.data;
      for (let i = 0; i < d.length; i += 4) {
        const g = d[i]*0.299 + d[i+1]*0.587 + d[i+2]*0.114;
        d[i] = d[i+1] = d[i+2] = g;
      }
      ctx.putImageData(id, 0, 0);
      // 2) Invert
      const inv = ctx.getImageData(0, 0, w, h);
      const id2 = inv.data;
      for (let i = 0; i < id2.length; i += 4) {
        id2[i] = 255-id2[i]; id2[i+1] = 255-id2[i+1]; id2[i+2] = 255-id2[i+2];
      }
      ctx.putImageData(inv, 0, 0);
      // 3) Blur the inverted layer
      ctx.filter = `blur(${strength}px)`;
      const tmp = document.createElement("canvas");
      tmp.width = w; tmp.height = h;
      const tctx = tmp.getContext("2d")!;
      tctx.putImageData(inv, 0, 0);
      ctx.drawImage(tmp, 0, 0);
      ctx.filter = "none";
      // 4) Color Dodge blend — combine with original grayscale
      const blurred = ctx.getImageData(0, 0, w, h).data;
      const sketch = ctx.createImageData(w, h);
      const sd = sketch.data;
      const origGray = id.data;
      for (let i = 0; i < sd.length; i += 4) {
        const base = origGray[i];
        const top = blurred[i];
        const dodge = top === 255 ? 255 : Math.min(255, (base * 255) / (255 - top));
        sd[i] = sd[i+1] = sd[i+2] = dodge;
        sd[i+3] = 255;
      }
      ctx.putImageData(sketch, 0, 0);
      break;
    }

    case "posterize-effect": {
      const levels = Math.max(2, Math.round(params.levels as number));
      const step = 255 / (levels - 1);
      const id = ctx.getImageData(0, 0, w, h);
      const d = id.data;
      for (let i = 0; i < d.length; i += 4) {
        d[i]   = Math.round(Math.round(d[i]   / step) * step);
        d[i+1] = Math.round(Math.round(d[i+1] / step) * step);
        d[i+2] = Math.round(Math.round(d[i+2] / step) * step);
      }
      ctx.putImageData(id, 0, 0);
      break;
    }

    case "add-rounded-corners": {
      const r = Math.min(params.radius as number, w/2, h/2);
      // Clear and re-draw with clip
      ctx.clearRect(0, 0, w, h);
      ctx.beginPath();
      ctx.moveTo(r, 0);
      ctx.lineTo(w - r, 0);
      ctx.quadraticCurveTo(w, 0, w, r);
      ctx.lineTo(w, h - r);
      ctx.quadraticCurveTo(w, h, w - r, h);
      ctx.lineTo(r, h);
      ctx.quadraticCurveTo(0, h, 0, h - r);
      ctx.lineTo(0, r);
      ctx.quadraticCurveTo(0, 0, r, 0);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, 0, 0);
      break;
    }

    case "image-opacity": {
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = (params.opacity as number) / 100;
      ctx.drawImage(img, 0, 0);
      ctx.globalAlpha = 1;
      break;
    }

    case "image-frame": {
      const sz = Math.round(params.size as number);
      const col = params.color1 as string;
      const inner = Math.round(params.inner as number);
      const nw = w + sz * 2;
      const nh = h + sz * 2;
      canvas.width = nw; canvas.height = nh;
      // outer frame
      ctx.fillStyle = col;
      ctx.fillRect(0, 0, nw, nh);
      // inner gap (white)
      if (inner > 0) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(sz - inner, sz - inner, w + inner*2, h + inner*2);
      }
      ctx.drawImage(img, sz, sz, w, h);
      // Inner line accent
      ctx.strokeStyle = col;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(sz + 3, sz + 3, w - 6, h - 6);
      break;
    }
  }

  return new Promise((res, rej) => {
    const fmt = isTransparent ? "image/png" : "image/jpeg";
    const q = isTransparent ? undefined : 0.92;
    canvas.toBlob((b) => b ? res(b) : rej(), fmt, q);
  });
}

/* ── Component ──────────────────────────────────────────────── */
export default function NicheEffectsTool({ toolId }: { toolId: string }) {
  const effectId = toolId as EffectId;
  const cfg = EFFECTS[effectId];
  if (!cfg) return null;

  const initParams = () => {
    const p: Record<string, number | string> = {};
    cfg.controls.forEach((c) => {
      p[c.id] = c.defaultVal ?? (c.type === "color" ? "#000000" : 50);
    });
    return p;
  };

  const [file, setFile]       = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [params, setParams]   = useState<Record<string, number | string>>(initParams);
  const [isDrag, setIsDrag]   = useState(false);
  const [processing, setProcessing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback((fl: FileList | null) => {
    if (!fl || !fl[0]) return;
    const f = fl[0];
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));
    setResultBlob(null);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl("");
  }, [preview, resultUrl]);

  const setParam = (id: string, val: number | string) =>
    setParams((p) => ({ ...p, [id]: val }));

  const handleApply = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const img = await loadImg(file);
      const blob = await applyEffect(img, effectId, params);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultBlob(blob);
      setResultUrl(URL.createObjectURL(blob));
    } catch (e) { console.error(e); }
    setProcessing(false);
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const ext = cfg.outputPng ? "png" : "jpg";
    const base = file.name.replace(/\.[^.]+$/, "");
    downloadBlob(resultBlob, `${base}_${effectId}.${ext}`);
  };

  return (
    <div className="fade-in-up">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="font-mono font-bold text-xl md:text-2xl tracking-tight">{cfg.label}</h2>
          <p className="text-sm text-black/50 mt-1">{cfg.description} — browser-based, nothing uploaded.</p>
        </div>
        <span className="font-mono text-xs border-2 border-black px-2 py-1 flex-shrink-0">FREE</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT */}
        <div className="space-y-4">
          {!file ? (
            <div
              className={`border-2 border-dashed border-black rounded-lg p-10 text-center cursor-pointer transition-colors ${isDrag ? "bg-black/5" : "hover:bg-black/[0.02]"}`}
              onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
              onDragLeave={() => setIsDrag(false)}
              onDrop={(e) => { e.preventDefault(); setIsDrag(false); loadFile(e.dataTransfer.files); }}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => loadFile(e.target.files)} />
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 border-2 border-black rounded-full flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
                <p className="font-mono font-bold text-sm">Drop Image Here</p>
                <button type="button"
                  className="font-mono text-xs uppercase tracking-widest bg-black text-white px-5 py-2 border-2 border-black hover:bg-white hover:text-black transition-colors"
                  onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>
                  Select Image
                </button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-black rounded-lg overflow-hidden">
              <div className="flex justify-between items-center px-3 py-2 border-b-2 border-black bg-black/[0.02]">
                <span className="font-mono text-xs font-bold uppercase">Original</span>
                <button onClick={() => { setFile(null); setPreview(""); setResultUrl(""); setResultBlob(null); }}
                  className="font-mono text-xs text-black/40 hover:text-black">✕ Change</button>
              </div>
              <div className={`aspect-video overflow-hidden bg-black/5 ${cfg.outputPng ? "bg-[repeating-conic-gradient(#e0e0e0_0%_25%,#fff_0%_50%)] bg-[length:16px_16px]" : ""}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="original" className="w-full h-full object-contain" />
              </div>
              <div className="px-3 py-2">
                <p className="font-mono text-xs truncate">{file.name}</p>
                <p className="font-mono text-xs text-black/40">{formatSize(file.size)}</p>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className={`border-2 border-black rounded-lg p-4 space-y-4 ${!file ? "opacity-40 pointer-events-none" : ""}`}>
            <p className="font-mono text-xs uppercase tracking-widest text-black/40">Settings</p>
            {cfg.controls.map((ctrl) => (
              <div key={ctrl.id}>
                <label className="font-mono text-xs text-black/50 block mb-1">
                  {ctrl.label}
                  {ctrl.type === "range" && (
                    <strong className="text-black ml-1">
                      {params[ctrl.id]}{ctrl.id === "opacity" ? "%" : ctrl.id === "radius" || ctrl.id === "size" || ctrl.id === "inner" ? "px" : ctrl.id === "levels" ? " levels" : ""}
                    </strong>
                  )}
                </label>
                {ctrl.type === "range" && (
                  <input type="range"
                    min={ctrl.min} max={ctrl.max} step={ctrl.step}
                    value={params[ctrl.id] as number}
                    onChange={(e) => setParam(ctrl.id, Number(e.target.value))}
                    className="w-full" />
                )}
                {ctrl.type === "color" && (
                  <div className="flex items-center gap-3">
                    <input type="color" value={params[ctrl.id] as string}
                      onChange={(e) => setParam(ctrl.id, e.target.value)}
                      className="w-12 h-10 border-2 border-black cursor-pointer" />
                    <span className="font-mono text-xs text-black/50">{params[ctrl.id]}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          <button onClick={handleApply}
            disabled={!file || processing}
            className={`w-full font-mono text-sm uppercase tracking-widest py-4 border-2 border-black font-bold transition-colors ${
              !file ? "opacity-40 cursor-not-allowed bg-black/10 text-black"
              : processing ? "bg-black/60 text-white cursor-wait"
              : "bg-black text-white hover:bg-white hover:text-black"
            }`}>
            {processing ? "⏳ Applying Effect…" : `Apply ${cfg.label} →`}
          </button>

          {resultUrl && (
            <div className="border-2 border-black rounded-lg overflow-hidden">
              <div className="flex justify-between items-center px-3 py-2 border-b-2 border-black bg-black">
                <span className="font-mono text-xs font-bold text-white uppercase">Result</span>
                <span className="font-mono text-xs text-white/50">
                  {resultBlob && formatSize(resultBlob.size)}
                  {cfg.outputPng && " · PNG"}
                </span>
              </div>
              <div className={`aspect-video overflow-hidden ${cfg.outputPng ? "bg-[repeating-conic-gradient(#e0e0e0_0%_25%,#fff_0%_50%)] bg-[length:16px_16px]" : "bg-black/5"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={resultUrl} alt="result" className="w-full h-full object-contain" />
              </div>
              <div className="px-3 py-2">
                <button onClick={handleDownload}
                  className="w-full font-mono text-xs uppercase tracking-widest py-2.5 bg-black text-white border-2 border-black hover:bg-white hover:text-black transition-colors">
                  ↓ Download {cfg.outputPng ? "PNG" : "JPG"}
                </button>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="border border-black/10 rounded-lg p-3">
            <p className="font-mono text-xs uppercase tracking-widest text-black/20 mb-1.5">Tips</p>
            {effectId === "pixelate-image" && <p className="font-mono text-xs text-black/40">Small block (2–5px) = subtle mosaic. Large (20–40px) = full pixel art.</p>}
            {effectId === "duotone-effect" && <p className="font-mono text-xs text-black/40">Try dark navy + bright coral for Spotify-style. Or black + gold for premium.</p>}
            {effectId === "glitch-effect" && <p className="font-mono text-xs text-black/40">Low intensity (2–4) = subtle. High intensity (15–20) = heavy cyberpunk distortion.</p>}
            {effectId === "sketch-effect" && <p className="font-mono text-xs text-black/40">Works best on portraits and objects with clear edges. Strength 2–3 is optimal.</p>}
            {effectId === "posterize-effect" && <p className="font-mono text-xs text-black/40">2 levels = black & white poster. 4–5 = bold comic effect. 7–8 = subtle.</p>}
            {effectId === "vignette-effect" && <p className="font-mono text-xs text-black/40">Strength 40–60% is natural. Size controls how far the dark edges extend.</p>}
            {effectId === "vintage-effect" && <p className="font-mono text-xs text-black/40">Strength 40–70% looks natural. 100% gives a very heavy retro film effect.</p>}
            {effectId === "add-rounded-corners" && <p className="font-mono text-xs text-black/40">Output is PNG with transparency — great for profile pictures and app icons.</p>}
            {effectId === "image-opacity" && <p className="font-mono text-xs text-black/40">Output is PNG. 50% opacity is ideal for overlay graphics and watermarks.</p>}
            {effectId === "image-frame" && <p className="font-mono text-xs text-black/40">White frame with black border = classic print look. Try frame size 20–40px.</p>}
            {effectId === "sepia-effect" && <p className="font-mono text-xs text-black/40">100% = full warm sepia. 40–60% = subtle warm vintage tone. Works on any photo.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
