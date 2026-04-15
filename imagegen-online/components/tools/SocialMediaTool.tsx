"use client";

import { useState, useRef, useCallback } from "react";
import { getToolMeta } from "@/lib/toolConfigs";
import { processImage, downloadBlob, formatSize, ProcessOptions } from "@/lib/canvasUtils";

interface SocialMediaToolProps {
  toolId: string;
}

type FitMode = "cover" | "contain" | "stretch";

const FIT_OPTIONS: { value: FitMode; label: string; desc: string }[] = [
  { value: "cover",   label: "Fill & Crop",    desc: "Image fills the frame — edges may be cropped" },
  { value: "contain", label: "Fit (Letterbox)", desc: "Whole image visible — blank sides added" },
  { value: "stretch", label: "Stretch",         desc: "Image stretched to fill exactly" },
];

export default function SocialMediaTool({ toolId }: SocialMediaToolProps) {
  const meta = getToolMeta(toolId);
  const preset = meta.resizePreset;

  // For square tools (no preset → use square group logic)
  const isSquare = meta.group === "square";
  const targetW = preset?.width ?? 1080;
  const targetH = preset?.height ?? 1080;

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDrag, setIsDrag] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultPreview, setResultPreview] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [fit, setFit] = useState<FitMode>("cover");
  const [bgColor, setBgColor] = useState("#ffffff");

  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setOriginalSize(f.size);
    setResultBlob(null);
    setResultPreview(null);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleProcess = async () => {
    if (!file || processing) return;
    setProcessing(true);
    try {
      let opts: ProcessOptions;

      if (isSquare) {
        // Square: use squareBg path
        opts = { squareBg: bgColor, quality: 92, outputFormat: "jpg" };
      } else {
        opts = {
          targetWidth: targetW,
          targetHeight: targetH,
          fit,
          maintainRatio: fit !== "stretch",
          squareBg: bgColor,   // used as letterbox bg when fit=contain
          quality: 92,
        };
      }

      const blob = await processImage(file, opts);
      if (resultPreview) URL.revokeObjectURL(resultPreview);
      setResultBlob(blob);
      setResultPreview(URL.createObjectURL(blob));
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const base = file.name.replace(/\.[^.]+$/, "");
    downloadBlob(resultBlob, `${base}_${toolId}.jpg`);
  };

  // Aspect ratio preview box dimensions (max 200px)
  const previewMaxW = 160;
  const previewMaxH = 200;
  const previewScale = Math.min(previewMaxW / targetW, previewMaxH / targetH);
  const previewBoxW = Math.round(targetW * previewScale);
  const previewBoxH = Math.round(targetH * previewScale);

  const aspectLabel = (() => {
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const g = gcd(targetW, targetH);
    return `${targetW / g}:${targetH / g}`;
  })();

  return (
    <div className="fade-in-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-5 gap-2">
        <div className="min-w-0">
          <h2 className="font-mono font-bold text-xl md:text-2xl tracking-tight">{meta.label}</h2>
          <p className="text-sm text-black/50 mt-1">{meta.description} — browser-based, nothing uploaded.</p>
        </div>
        <span className="font-mono text-xs border-2 border-black px-2 py-1 flex-shrink-0">FREE</span>
      </div>

      {/* Target size banner */}
      {!isSquare && (
        <div className="flex flex-wrap items-center gap-4 border-2 border-black px-4 py-3 mb-5 bg-black text-white">
          <div>
            <p className="font-mono text-xs text-white/50 uppercase tracking-widest">Output Size</p>
            <p className="font-mono font-bold text-lg">{targetW} × {targetH}px</p>
          </div>
          <div>
            <p className="font-mono text-xs text-white/50 uppercase tracking-widest">Aspect Ratio</p>
            <p className="font-mono font-bold text-lg">{aspectLabel}</p>
          </div>
          {/* Visual aspect ratio box */}
          <div className="ml-auto hidden sm:flex items-center gap-2">
            <div
              className="border-2 border-white/60 bg-white/10 flex items-center justify-center"
              style={{ width: previewBoxW, height: previewBoxH }}
            >
              <span className="font-mono text-xs text-white/60">{targetW}×{targetH}</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 min-w-0">

        {/* LEFT: Upload + preview */}
        <div className="space-y-4">
          {!file ? (
            <div
              className={`border-2 border-dashed border-black rounded-lg p-8 text-center cursor-pointer transition-colors ${isDrag ? "bg-black/5" : "hover:bg-black/[0.02]"}`}
              onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
              onDragLeave={() => setIsDrag(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 border-2 border-black rounded-full flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <p className="font-mono font-bold text-sm">Drop Image Here</p>
                <p className="text-xs text-black/40">PNG · JPG · WEBP · GIF</p>
                <button type="button"
                  className="font-mono text-xs uppercase tracking-widest bg-black text-white px-5 py-2 border-2 border-black hover:bg-white hover:text-black transition-colors mt-1"
                  onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>
                  Select Image
                </button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-black rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b-2 border-black bg-black/[0.02]">
                <span className="font-mono text-xs font-bold uppercase">Original</span>
                <button
                  onClick={() => { setFile(null); setPreview(null); setResultBlob(null); setResultPreview(null); }}
                  className="font-mono text-xs text-black/40 hover:text-black">✕ Change</button>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview!} alt="original" className="w-full object-contain max-h-64 bg-black/5 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAIklEQVQoU2NkYGD4z8BQDwAEgAF/QualIQAAAABJRU5ErkJggg==')]" />
              <div className="px-3 py-2 border-t border-black/10">
                <p className="font-mono text-xs truncate">{file.name}</p>
                <p className="font-mono text-xs text-black/40">{formatSize(originalSize)}</p>
              </div>
            </div>
          )}

          {/* Result */}
          {resultPreview && resultBlob && (
            <div className="border-2 border-black rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b-2 border-black bg-black">
                <span className="font-mono text-xs font-bold uppercase text-white">Result</span>
                <span className="font-mono text-xs text-white/70">
                  {isSquare ? "Square" : `${targetW} × ${targetH}px`}
                  &nbsp;· {formatSize(resultBlob.size)}
                </span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resultPreview} alt="result" className="w-full object-contain max-h-64 bg-black/5" />
              <div className="px-3 py-2 border-t border-black/10">
                <button onClick={handleDownload}
                  className="w-full font-mono text-xs uppercase tracking-widest py-2 bg-black text-white border-2 border-black hover:bg-white hover:text-black transition-colors">
                  ↓ Download {isSquare ? "Square" : `${targetW}×${targetH}`} Image
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Settings */}
        <div className="space-y-4 min-w-0">

          {/* Fit mode */}
          {!isSquare && (
            <div className="border-2 border-black rounded-lg overflow-hidden">
              <div className="px-3 py-2 border-b-2 border-black bg-black/[0.02]">
                <p className="font-mono text-xs uppercase tracking-widest text-black/40">Fill Mode</p>
              </div>
              <div className="divide-y divide-black/10">
                {FIT_OPTIONS.map((opt) => (
                  <label key={opt.value} className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${fit === opt.value ? "bg-black text-white" : "hover:bg-black/[0.03]"}`}>
                    <input type="radio" name="fit" value={opt.value} checked={fit === opt.value}
                      onChange={() => setFit(opt.value)} className="mt-0.5 flex-shrink-0" />
                    <div>
                      <p className={`font-mono text-xs font-bold ${fit === opt.value ? "text-white" : ""}`}>{opt.label}</p>
                      <p className={`font-mono text-xs mt-0.5 ${fit === opt.value ? "text-white/60" : "text-black/40"}`}>{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Background color — shown for contain mode and square */}
          {(fit === "contain" || isSquare) && (
            <div className="border-2 border-black rounded-lg p-4">
              <p className="font-mono text-xs uppercase tracking-widest text-black/40 mb-3">
                {isSquare ? "Background Color" : "Letterbox Background"}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
                  className="w-10 h-9 border-2 border-black cursor-pointer" />
                {["#ffffff","#000000","#f5f5f5","#1a1a2e","#e8d5b7"].map((c) => (
                  <button key={c} onClick={() => setBgColor(c)} title={c}
                    style={{ background: c }}
                    className={`w-8 h-8 border-2 flex-shrink-0 ${bgColor === c ? "border-black ring-2 ring-black ring-offset-1" : "border-black/20"}`} />
                ))}
                <span className="font-mono text-xs text-black/40">{bgColor}</span>
              </div>
            </div>
          )}

          {/* Info box */}
          <div className="border border-black/20 px-4 py-3 bg-black/[0.02] space-y-1.5">
            {!isSquare ? (
              <>
                <p className="font-mono text-xs font-bold">Output: exactly {targetW} × {targetH}px</p>
                <p className="font-mono text-xs text-black/50">
                  {fit === "cover" && "Image will be cropped from center to fill the frame exactly."}
                  {fit === "contain" && "Image fits inside frame. Empty space filled with background color."}
                  {fit === "stretch" && "Image stretched to fill every pixel — aspect ratio not preserved."}
                </p>
              </>
            ) : (
              <p className="font-mono text-xs text-black/50">
                Adds equal padding on all sides to make the image a perfect square. Background color fills the empty space.
              </p>
            )}
          </div>

          {/* Process button */}
          {!resultBlob ? (
            <button onClick={handleProcess} disabled={processing || !file}
              className={`w-full font-mono text-sm uppercase tracking-widest py-4 border-2 border-black font-bold transition-colors ${
                !file ? "opacity-40 cursor-not-allowed bg-black/10 text-black"
                : processing ? "bg-black/60 text-white cursor-wait"
                : "bg-black text-white hover:bg-white hover:text-black"
              }`}>
              {processing
                ? "⏳ Resizing…"
                : isSquare
                ? "Make Square →"
                : `Resize to ${targetW}×${targetH} →`}
            </button>
          ) : (
            <div className="flex gap-3">
              <button onClick={handleDownload}
                className="flex-1 font-mono text-sm uppercase tracking-widest py-4 border-2 border-black font-bold bg-black text-white hover:bg-white hover:text-black transition-colors">
                ↓ Download
              </button>
              <button onClick={() => { setResultBlob(null); setResultPreview(null); }}
                className="font-mono text-sm px-4 py-4 border-2 border-black hover:bg-black hover:text-white transition-colors">
                ↺
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
