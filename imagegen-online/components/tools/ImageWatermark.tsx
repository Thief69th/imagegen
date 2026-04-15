"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { formatSize, downloadBlob } from "@/lib/canvasUtils";

type WatermarkMode = "text" | "image";
type Position =
  | "top-left" | "top-center" | "top-right"
  | "middle-left" | "center" | "middle-right"
  | "bottom-left" | "bottom-center" | "bottom-right"
  | "tile";

interface WatermarkSettings {
  mode: WatermarkMode;
  text: string;
  fontSize: number;
  fontFamily: string;
  fontColor: string;
  fontBold: boolean;
  fontItalic: boolean;
  opacity: number;
  position: Position;
  margin: number;
  rotation: number;
  wmWidth: number; // % of main image width for image watermark
  shadow: boolean;
}

const FONTS = ["Arial", "Georgia", "Times New Roman", "Courier New", "Verdana", "Impact", "Trebuchet MS"];

const POSITIONS: { label: string; value: Position }[] = [
  { label: "↖", value: "top-left" },
  { label: "↑", value: "top-center" },
  { label: "↗", value: "top-right" },
  { label: "←", value: "middle-left" },
  { label: "●", value: "center" },
  { label: "→", value: "middle-right" },
  { label: "↙", value: "bottom-left" },
  { label: "↓", value: "bottom-center" },
  { label: "↘", value: "bottom-right" },
];

function placeWatermark(
  ctx: CanvasRenderingContext2D,
  wmW: number,
  wmH: number,
  canvasW: number,
  canvasH: number,
  position: Position,
  margin: number
): { x: number; y: number } {
  const m = margin;
  switch (position) {
    case "top-left":     return { x: m, y: m };
    case "top-center":   return { x: (canvasW - wmW) / 2, y: m };
    case "top-right":    return { x: canvasW - wmW - m, y: m };
    case "middle-left":  return { x: m, y: (canvasH - wmH) / 2 };
    case "center":       return { x: (canvasW - wmW) / 2, y: (canvasH - wmH) / 2 };
    case "middle-right": return { x: canvasW - wmW - m, y: (canvasH - wmH) / 2 };
    case "bottom-left":  return { x: m, y: canvasH - wmH - m };
    case "bottom-center":return { x: (canvasW - wmW) / 2, y: canvasH - wmH - m };
    case "bottom-right": return { x: canvasW - wmW - m, y: canvasH - wmH - m };
    case "tile":         return { x: 0, y: 0 };
    default:             return { x: canvasW - wmW - m, y: canvasH - wmH - m };
  }
}

async function applyWatermark(
  mainFile: File,
  wmImgEl: HTMLImageElement | null,
  settings: WatermarkSettings
): Promise<Blob> {
  const mainImg = await new Promise<HTMLImageElement>((res, rej) => {
    const img = new Image();
    const url = URL.createObjectURL(mainFile);
    img.onload = () => { URL.revokeObjectURL(url); res(img); };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("Load failed")); };
    img.src = url;
  });

  const canvas = document.createElement("canvas");
  canvas.width = mainImg.naturalWidth;
  canvas.height = mainImg.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(mainImg, 0, 0);

  ctx.globalAlpha = settings.opacity / 100;

  if (settings.mode === "text") {
    const fs = settings.fontSize;
    const weight = settings.fontBold ? "bold" : "normal";
    const style = settings.fontItalic ? "italic" : "normal";
    ctx.font = `${style} ${weight} ${fs}px "${settings.fontFamily}"`;
    ctx.fillStyle = settings.fontColor;
    if (settings.shadow) {
      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = Math.round(fs * 0.15);
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
    }

    const lines = settings.text.split("\n");
    const lineH = fs * 1.3;
    const totalH = lines.length * lineH;
    const maxW = Math.max(...lines.map((l) => ctx.measureText(l).width));

    if (settings.position === "tile") {
      const stepX = maxW + 80;
      const stepY = totalH + 60;
      ctx.save();
      ctx.rotate((settings.rotation * Math.PI) / 180);
      for (let y = -canvas.height; y < canvas.height * 2; y += stepY) {
        for (let x = -canvas.width; x < canvas.width * 2; x += stepX) {
          lines.forEach((line, i) => ctx.fillText(line, x, y + i * lineH));
        }
      }
      ctx.restore();
    } else {
      const { x, y } = placeWatermark(ctx, maxW, totalH, canvas.width, canvas.height, settings.position, settings.margin);
      ctx.save();
      if (settings.rotation !== 0) {
        ctx.translate(x + maxW / 2, y + totalH / 2);
        ctx.rotate((settings.rotation * Math.PI) / 180);
        lines.forEach((line, i) => ctx.fillText(line, -maxW / 2, -totalH / 2 + (i + 1) * lineH - fs * 0.2));
      } else {
        lines.forEach((line, i) => ctx.fillText(line, x, y + (i + 1) * lineH - fs * 0.2));
      }
      ctx.restore();
    }
  } else if (wmImgEl) {
    const wmW = Math.round((settings.wmWidth / 100) * canvas.width);
    const scale = wmW / wmImgEl.naturalWidth;
    const wmH = Math.round(wmImgEl.naturalHeight * scale);

    if (settings.position === "tile") {
      const stepX = wmW + 40;
      const stepY = wmH + 40;
      ctx.save();
      ctx.rotate((settings.rotation * Math.PI) / 180);
      for (let y = -canvas.height; y < canvas.height * 2; y += stepY) {
        for (let x = -canvas.width; x < canvas.width * 2; x += stepX) {
          ctx.drawImage(wmImgEl, x, y, wmW, wmH);
        }
      }
      ctx.restore();
    } else {
      const { x, y } = placeWatermark(ctx, wmW, wmH, canvas.width, canvas.height, settings.position, settings.margin);
      ctx.save();
      if (settings.rotation !== 0) {
        ctx.translate(x + wmW / 2, y + wmH / 2);
        ctx.rotate((settings.rotation * Math.PI) / 180);
        ctx.drawImage(wmImgEl, -wmW / 2, -wmH / 2, wmW, wmH);
      } else {
        ctx.drawImage(wmImgEl, x, y, wmW, wmH);
      }
      ctx.restore();
    }
  }

  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;

  const isPng = mainFile.type === "image/png";
  return new Promise<Blob>((res, rej) =>
    canvas.toBlob(
      (b) => (b ? res(b) : rej(new Error("toBlob failed"))),
      isPng ? "image/png" : "image/jpeg",
      isPng ? undefined : 0.92
    )
  );
}

export default function ImageWatermark() {
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const [wmFile, setWmFile] = useState<File | null>(null);
  const [wmImgEl, setWmImgEl] = useState<HTMLImageElement | null>(null);
  const [wmThumb, setWmThumb] = useState<string | null>(null);

  const [settings, setSettings] = useState<WatermarkSettings>({
    mode: "text",
    text: "© imagegen.online",
    fontSize: 48,
    fontFamily: "Arial",
    fontColor: "#ffffff",
    fontBold: true,
    fontItalic: false,
    opacity: 70,
    position: "bottom-right",
    margin: 30,
    rotation: 0,
    wmWidth: 25,
    shadow: true,
  });

  const [isDragMain, setIsDragMain] = useState(false);
  const [isDragWm, setIsDragWm] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultPreview, setResultPreview] = useState<string | null>(null);

  const mainRef = useRef<HTMLInputElement>(null);
  const wmRef = useRef<HTMLInputElement>(null);

  const set = useCallback(<K extends keyof WatermarkSettings>(key: K, val: WatermarkSettings[K]) => {
    setSettings((s) => ({ ...s, [key]: val }));
    setResultBlob(null);
    setResultPreview(null);
  }, []);

  const handleMainFile = (f: File) => {
    if (!f.type.startsWith("image/")) return;
    setMainFile(f);
    setMainPreview(URL.createObjectURL(f));
    setResultBlob(null);
    setResultPreview(null);
  };

  const handleWmFile = (f: File) => {
    if (!f.type.startsWith("image/")) return;
    setWmFile(f);
    const url = URL.createObjectURL(f);
    setWmThumb(url);
    const img = new Image();
    img.onload = () => setWmImgEl(img);
    img.src = url;
    set("mode", "image");
  };

  const handleProcess = async () => {
    if (!mainFile || processing) return;
    if (settings.mode === "image" && !wmImgEl) return;
    setProcessing(true);
    try {
      const blob = await applyWatermark(mainFile, wmImgEl, settings);
      if (resultPreview) URL.revokeObjectURL(resultPreview);
      const rp = URL.createObjectURL(blob);
      setResultBlob(blob);
      setResultPreview(rp);
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !mainFile) return;
    const ext = mainFile.type === "image/png" ? "png" : "jpg";
    downloadBlob(resultBlob, `${mainFile.name.replace(/\.[^.]+$/, "")}_watermark.${ext}`);
  };

  const canProcess = mainFile && (settings.mode === "text" ? settings.text.trim() : !!wmImgEl);

  return (
    <div className="fade-in-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-5 gap-2">
        <div className="min-w-0">
          <h2 className="font-mono font-bold text-xl md:text-2xl tracking-tight">Image Watermark</h2>
          <p className="text-sm text-black/50 mt-1">Add text or image watermark to photos online — free, browser-based, nothing uploaded.</p>
        </div>
        <span className="font-mono text-xs border-2 border-black px-2 py-1 flex-shrink-0">FREE</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 min-w-0">

        {/* ── LEFT: Upload + Preview ── */}
        <div className="space-y-4 min-w-0">

          {/* Main image upload */}
          {!mainFile ? (
            <div
              className={`border-2 border-dashed border-black rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragMain ? "bg-black/5" : "hover:bg-black/[0.02]"}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragMain(true); }}
              onDragLeave={() => setIsDragMain(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragMain(false); const f = e.dataTransfer.files[0]; if (f) handleMainFile(f); }}
              onClick={() => mainRef.current?.click()}
            >
              <input ref={mainRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleMainFile(f); }} />
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 border-2 border-black rounded-full flex items-center justify-center text-xl">🖼</div>
                <p className="font-mono font-bold text-sm">Drop Main Image</p>
                <p className="text-xs text-black/40">PNG · JPG · WEBP</p>
                <button type="button"
                  className="font-mono text-xs uppercase tracking-widest bg-black text-white px-5 py-2 border-2 border-black hover:bg-white hover:text-black transition-colors mt-1"
                  onClick={(e) => { e.stopPropagation(); mainRef.current?.click(); }}>
                  Select Image
                </button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-black rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b-2 border-black bg-black/[0.02]">
                <span className="font-mono text-xs font-bold uppercase">Main Image</span>
                <button onClick={() => { setMainFile(null); setMainPreview(null); setResultBlob(null); setResultPreview(null); }}
                  className="font-mono text-xs text-black/40 hover:text-black flex-shrink-0">✕ Change</button>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mainPreview!} alt="main" className="w-full object-contain max-h-64 bg-black/5" />
              <div className="px-3 py-2 border-t border-black/10">
                <p className="font-mono text-xs truncate">{mainFile.name}</p>
                <p className="font-mono text-xs text-black/40">{formatSize(mainFile.size)}</p>
              </div>
            </div>
          )}

          {/* Result preview */}
          {resultPreview && resultBlob && (
            <div className="border-2 border-black rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b-2 border-black bg-black">
                <span className="font-mono text-xs font-bold uppercase text-white">Result</span>
                <span className="font-mono text-xs text-white/60">{formatSize(resultBlob.size)}</span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resultPreview} alt="result" className="w-full object-contain max-h-64 bg-black/5" />
              <div className="px-3 py-2">
                <button onClick={handleDownload}
                  className="w-full font-mono text-xs uppercase tracking-widest py-2 bg-black text-white border-2 border-black hover:bg-white hover:text-black transition-colors">
                  ↓ Download Watermarked Image
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Settings ── */}
        <div className="space-y-4 min-w-0">

          {/* Mode toggle */}
          <div className="border-2 border-black rounded-lg overflow-hidden">
            <div className="grid grid-cols-2">
              <button
                onClick={() => set("mode", "text")}
                className={`font-mono text-xs uppercase tracking-widest py-2.5 border-r-2 border-black transition-colors ${settings.mode === "text" ? "bg-black text-white" : "hover:bg-black/5"}`}>
                ✏ Text Watermark
              </button>
              <button
                onClick={() => set("mode", "image")}
                className={`font-mono text-xs uppercase tracking-widest py-2.5 transition-colors ${settings.mode === "image" ? "bg-black text-white" : "hover:bg-black/5"}`}>
                🖼 Image Watermark
              </button>
            </div>
          </div>

          {/* TEXT WATERMARK SETTINGS */}
          {settings.mode === "text" && (
            <div className="border-2 border-black rounded-lg p-4 space-y-3 min-w-0 overflow-hidden">
              <p className="font-mono text-xs uppercase tracking-widest text-black/40">Text Settings</p>

              <div>
                <label className="font-mono text-xs text-black/50">Watermark Text</label>
                <textarea
                  value={settings.text}
                  onChange={(e) => set("text", e.target.value)}
                  rows={2}
                  className="w-full mt-1 border-2 border-black px-3 py-2 font-mono text-sm focus:outline-none bg-white resize-none"
                  placeholder="Your watermark text..." />
                <p className="font-mono text-xs text-black/30 mt-0.5">Use new lines for multi-line text</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-xs text-black/50">Font</label>
                  <select value={settings.fontFamily} onChange={(e) => set("fontFamily", e.target.value)}
                    className="w-full mt-1 border-2 border-black px-2 py-2 font-mono text-xs focus:outline-none bg-white">
                    {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-mono text-xs text-black/50">Size — {settings.fontSize}px</label>
                  <input type="range" min={12} max={200} value={settings.fontSize}
                    onChange={(e) => set("fontSize", Number(e.target.value))} className="w-full mt-2" />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <label className="font-mono text-xs text-black/50 block mb-1">Color</label>
                  <input type="color" value={settings.fontColor}
                    onChange={(e) => set("fontColor", e.target.value)}
                    className="w-10 h-9 border-2 border-black cursor-pointer" />
                </div>
                {["#ffffff","#000000","#ffff00","#ff0000"].map((c) => (
                  <button key={c} onClick={() => set("fontColor", c)}
                    style={{ background: c }}
                    className={`w-8 h-8 border-2 flex-shrink-0 ${settings.fontColor === c ? "border-black" : "border-black/20"}`} />
                ))}
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input type="checkbox" checked={settings.fontBold} onChange={(e) => set("fontBold", e.target.checked)} />
                  <span className="font-mono text-xs font-bold">Bold</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input type="checkbox" checked={settings.fontItalic} onChange={(e) => set("fontItalic", e.target.checked)} />
                  <span className="font-mono text-xs italic">Italic</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input type="checkbox" checked={settings.shadow} onChange={(e) => set("shadow", e.target.checked)} />
                  <span className="font-mono text-xs">Shadow</span>
                </label>
              </div>
            </div>
          )}

          {/* IMAGE WATERMARK SETTINGS */}
          {settings.mode === "image" && (
            <div className="border-2 border-black rounded-lg p-4 space-y-3 min-w-0 overflow-hidden">
              <p className="font-mono text-xs uppercase tracking-widest text-black/40">Watermark Image (Logo)</p>

              {!wmFile ? (
                <div
                  className={`border-2 border-dashed border-black rounded p-5 text-center cursor-pointer transition-colors ${isDragWm ? "bg-black/5" : "hover:bg-black/[0.02]"}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragWm(true); }}
                  onDragLeave={() => setIsDragWm(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragWm(false); const f = e.dataTransfer.files[0]; if (f) handleWmFile(f); }}
                  onClick={() => wmRef.current?.click()}
                >
                  <input ref={wmRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleWmFile(f); }} />
                  <p className="font-mono text-xs font-bold">Drop Logo / Watermark Image</p>
                  <p className="font-mono text-xs text-black/40 mt-1">PNG with transparency works best</p>
                  <button type="button"
                    className="font-mono text-xs uppercase tracking-widest bg-black text-white px-4 py-1.5 border-2 border-black hover:bg-white hover:text-black transition-colors mt-2"
                    onClick={(e) => { e.stopPropagation(); wmRef.current?.click(); }}>
                    Select Logo
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 border border-black/20 px-3 py-2 rounded">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={wmThumb!} alt="wm" className="w-12 h-12 object-contain border border-black/20 flex-shrink-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAIklEQVQoU2NkYGD4z8BQDwAEgAF/QualIQAAAABJRU5ErkJggg==')]" />
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs truncate">{wmFile.name}</p>
                    <p className="font-mono text-xs text-black/40">{formatSize(wmFile.size)}</p>
                  </div>
                  <button onClick={() => { setWmFile(null); setWmThumb(null); setWmImgEl(null); }}
                    className="font-mono text-xs text-black/40 hover:text-black flex-shrink-0">✕</button>
                </div>
              )}

              <div>
                <label className="font-mono text-xs text-black/50">Logo Size — <strong>{settings.wmWidth}% of image width</strong></label>
                <input type="range" min={5} max={80} value={settings.wmWidth}
                  onChange={(e) => set("wmWidth", Number(e.target.value))} className="w-full mt-1" />
                <div className="flex justify-between font-mono text-xs text-black/30 mt-0.5"><span>5%</span><span>80%</span></div>
              </div>
            </div>
          )}

          {/* SHARED SETTINGS: Position, Opacity, Rotation */}
          <div className="border-2 border-black rounded-lg p-4 space-y-4 min-w-0 overflow-hidden">
            <p className="font-mono text-xs uppercase tracking-widest text-black/40">Position & Appearance</p>

            {/* Position grid */}
            <div>
              <p className="font-mono text-xs text-black/50 mb-2">Position</p>
              <div className="grid grid-cols-3 gap-1 w-full max-w-[200px]">
                {POSITIONS.map(({ label, value }) => (
                  <button key={value} onClick={() => set("position", value)}
                    title={value.replace(/-/g, " ")}
                    className={`font-mono text-sm py-2 border-2 border-black hover:bg-black hover:text-white transition-colors ${settings.position === value ? "bg-black text-white" : ""}`}>
                    {label}
                  </button>
                ))}
              </div>
              <button onClick={() => set("position", "tile")}
                className={`mt-2 font-mono text-xs px-3 py-1.5 border-2 border-black hover:bg-black hover:text-white transition-colors ${settings.position === "tile" ? "bg-black text-white" : ""}`}>
                ⊞ Tile / Repeat
              </button>
            </div>

            {/* Opacity */}
            <div>
              <p className="font-mono text-xs text-black/50 mb-1">Opacity — <strong>{settings.opacity}%</strong></p>
              <input type="range" min={10} max={100} value={settings.opacity}
                onChange={(e) => set("opacity", Number(e.target.value))} className="w-full" />
              <div className="flex justify-between font-mono text-xs text-black/30 mt-0.5"><span>Subtle</span><span>Solid</span></div>
            </div>

            {/* Rotation */}
            <div>
              <p className="font-mono text-xs text-black/50 mb-1">Rotation — <strong>{settings.rotation}°</strong></p>
              <input type="range" min={-180} max={180} value={settings.rotation}
                onChange={(e) => set("rotation", Number(e.target.value))} className="w-full" />
              <div className="flex justify-between font-mono text-xs text-black/30 mt-0.5"><span>-180°</span><span>0°</span><span>+180°</span></div>
            </div>

            {/* Margin */}
            {settings.position !== "tile" && (
              <div>
                <p className="font-mono text-xs text-black/50 mb-1">Edge Margin — <strong>{settings.margin}px</strong></p>
                <input type="range" min={0} max={120} value={settings.margin}
                  onChange={(e) => set("margin", Number(e.target.value))} className="w-full" />
              </div>
            )}
          </div>

          {/* Process button */}
          {!resultBlob ? (
            <button onClick={handleProcess}
              disabled={!canProcess || processing}
              className={`w-full font-mono text-sm uppercase tracking-widest py-4 border-2 border-black font-bold transition-colors ${
                !canProcess ? "opacity-40 cursor-not-allowed bg-black/10 text-black"
                : processing ? "bg-black/60 text-white cursor-wait"
                : "bg-black text-white hover:bg-white hover:text-black"
              }`}>
              {processing ? "⏳ Adding Watermark…"
                : !mainFile ? "Upload an Image First"
                : settings.mode === "image" && !wmImgEl ? "Upload Watermark Image"
                : "Add Watermark →"}
            </button>
          ) : (
            <div className="flex gap-3">
              <button onClick={handleDownload}
                className="flex-1 font-mono text-sm uppercase tracking-widest py-4 border-2 border-black font-bold bg-black text-white hover:bg-white hover:text-black transition-colors">
                ↓ Download Watermarked Image
              </button>
              <button onClick={() => { setResultBlob(null); setResultPreview(null); }}
                className="font-mono text-sm px-4 py-4 border-2 border-black hover:bg-black hover:text-white transition-colors">
                ↺
              </button>
            </div>
          )}

          {/* Info */}
          <div className="border border-black/20 px-3 py-2 bg-black/[0.02]">
            <p className="font-mono text-xs text-black/50 leading-relaxed">
              💡 <strong>Tips:</strong> Use PNG with transparent background as logo for best results. &quot;Tile&quot; mode repeats watermark across entire image. Add rotation for diagonal tiling.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
