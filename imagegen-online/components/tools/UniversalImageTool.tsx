"use client";

import { useState, useRef, useCallback } from "react";
import { getToolMeta } from "@/lib/toolConfigs";
import { processImage, downloadBlob, getOutputExt, formatSize, ProcessOptions } from "@/lib/canvasUtils";

interface FileEntry {
  id: string;
  file: File;
  preview: string;
  name: string;
  originalSize: number;
  resultBlob?: Blob;
  resultPreview?: string;
  resultSize?: number;
  status: "idle" | "processing" | "done" | "error";
}

export default function UniversalImageTool({ toolId }: { toolId: string }) {
  const meta = getToolMeta(toolId);
  const isBulk = meta.bulk === true;

  const [files, setFiles] = useState<FileEntry[]>([]);
  const [isDrag, setIsDrag] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ─── Settings state ─────────────────────────────────────────────────────
  // Resize
  const [resizeW, setResizeW] = useState(meta.resizePreset?.width?.toString() ?? "");
  const [resizeH, setResizeH] = useState(meta.resizePreset?.height?.toString() ?? "");
  const [maintainRatio, setMaintainRatio] = useState(true);
  const [fit, setFit] = useState<"contain" | "cover" | "stretch">("contain");
  // Rotate
  const [angle, setAngle] = useState(0);
  // Flip
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  // Adjust
  const [adjustVal, setAdjustVal] = useState(meta.adjustDefault ?? 100);
  // Sharpen
  const [sharpenAmt, setSharpenAmt] = useState(2);
  // Quality
  const [quality, setQuality] = useState(90);
  // Square
  const [squareBg, setSquareBg] = useState("#ffffff");
  // Border
  const [borderSize, setBorderSize] = useState(10);
  const [borderColor, setBorderColor] = useState("#000000");
  // Crop
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropW, setCropW] = useState("");
  const [cropH, setCropH] = useState("");
  // Text / Watermark
  const [textVal, setTextVal] = useState("imagegen.online");
  const [textSize, setTextSize] = useState(40);
  const [textColor, setTextColor] = useState("#ffffff");
  const [textOpacity, setTextOpacity] = useState(70);
  const [textPos, setTextPos] = useState("bottom-right");
  // Convert
  const [convertFmt, setConvertFmt] = useState(meta.convertTo ?? "jpg");

  // ─── File handling ──────────────────────────────────────────────────────
  const addFiles = useCallback((fl: FileList | null) => {
    if (!fl) return;
    const arr = Array.from(fl).filter((f) => f.type.startsWith("image/") || f.name.match(/\.(heic|heif|tiff?|gif)$/i));
    if (!isBulk && arr.length > 0) {
      // single mode: replace
      const f = arr[0];
      const prev = URL.createObjectURL(f);
      setFiles([{ id: `${f.name}-${Date.now()}`, file: f, preview: prev, name: f.name, originalSize: f.size, status: "idle" }]);
    } else {
      const entries: FileEntry[] = arr.map((f) => ({
        id: `${f.name}-${Date.now()}-${Math.random()}`,
        file: f, preview: URL.createObjectURL(f),
        name: f.name, originalSize: f.size, status: "idle",
      }));
      setFiles((prev) => [...prev, ...entries]);
    }
    setAllDone(false);
  }, [isBulk]);

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const f = prev.find((e) => e.id === id);
      if (f) { URL.revokeObjectURL(f.preview); if (f.resultPreview) URL.revokeObjectURL(f.resultPreview); }
      return prev.filter((e) => e.id !== id);
    });
    setAllDone(false);
  };

  // ─── Build ProcessOptions from current state ────────────────────────────
  const buildOpts = useCallback((file: File): ProcessOptions => {
    const opts: ProcessOptions = { quality };

    switch (meta.group) {
      case "resize": {
        const tw = resizeW ? parseInt(resizeW) : undefined;
        const th = resizeH ? parseInt(resizeH) : undefined;
        opts.targetWidth = tw;
        opts.targetHeight = th;
        opts.maintainRatio = maintainRatio;
        opts.fit = fit;
        break;
      }
      case "rotate":
        opts.angle = angle;
        break;
      case "flip":
        opts.flipH = flipH;
        opts.flipV = flipV;
        break;
      case "adjust":
        opts.cssFilter = meta.adjustFilter === "blur"
          ? `blur(${adjustVal}px)`
          : `${meta.adjustFilter}(${adjustVal}%)`;
        break;
      case "sharpen":
        opts.sharpenAmount = sharpenAmt;
        break;
      case "effect":
        opts.effect = meta.effectType as "grayscale" | "invert" | "sepia" | "remove-border";
        break;
      case "square":
        opts.squareBg = squareBg;
        opts.outputFormat = "jpg";
        break;
      case "circle":
        opts.outputFormat = "__circle";
        break;
      case "border":
        opts.borderSize = borderSize;
        opts.borderColor = borderColor;
        break;
      case "crop": {
        const cw = cropW ? parseInt(cropW) : undefined;
        const ch = cropH ? parseInt(cropH) : undefined;
        if (cw && ch) { opts.cropX = cropX; opts.cropY = cropY; opts.cropW = cw; opts.cropH = ch; }
        break;
      }
      case "text":
        opts.text = textVal;
        opts.fontSize = textSize;
        opts.fontColor = textColor;
        opts.fontOpacity = textOpacity;
        opts.textPosition = textPos;
        break;
      case "convert":
        opts.outputFormat = convertFmt;
        break;
      case "compress":
        // quality already set
        break;
      case "lossless":
        opts.lossless = true;
        opts.outputFormat = "png";
        break;
      case "safezone":
        opts.safeZoneOverlay = true;
        break;
    }
    return opts;
  }, [meta, resizeW, resizeH, maintainRatio, fit, angle, flipH, flipV, adjustVal, sharpenAmt, quality, squareBg, borderSize, borderColor, cropX, cropY, cropW, cropH, textVal, textSize, textColor, textOpacity, textPos, convertFmt]);

  // ─── Live CSS filter preview (instant, no canvas) ──────────
  const liveFilter = (() => {
    if (meta.group !== "adjust" && meta.group !== "effect") return "";
    if (meta.group === "adjust") {
      return meta.adjustFilter === "blur"
        ? `blur(${adjustVal}px)`
        : `${meta.adjustFilter}(${adjustVal}%)`;
    }
    if (meta.effectType === "grayscale") return "grayscale(100%)";
    if (meta.effectType === "invert") return "invert(100%)";
    if (meta.effectType === "sepia") return "sepia(100%)";
    return "";
  })();

  // ─── Process all ────────────────────────────────────────────────────────
  const handleProcess = async () => {
    if (files.length === 0 || processing) return;
    setProcessing(true);
    setAllDone(false);

    const updated = [...files];
    for (let i = 0; i < updated.length; i++) {
      updated[i] = { ...updated[i], status: "processing" };
      setFiles([...updated]);
      try {
        const opts = buildOpts(updated[i].file);
        const blob = await processImage(updated[i].file, opts);
        const rPreview = URL.createObjectURL(blob);
        updated[i] = { ...updated[i], status: "done", resultBlob: blob, resultPreview: rPreview, resultSize: blob.size };
      } catch (e) {
        console.error(e);
        updated[i] = { ...updated[i], status: "error" };
      }
      setFiles([...updated]);
    }
    setProcessing(false);
    setAllDone(true);
  };

  const handleDownloadSingle = (entry: FileEntry) => {
    if (!entry.resultBlob) return;
    const opts = buildOpts(entry.file);
    const ext = getOutputExt(opts, entry.file);
    const base = entry.name.replace(/\.[^.]+$/, "");
    downloadBlob(entry.resultBlob, `${base}_${toolId}.${ext}`);
  };

  const handleDownloadAll = async () => {
    const done = files.filter((f) => f.status === "done" && f.resultBlob);
    if (done.length === 1) { handleDownloadSingle(done[0]); return; }
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      done.forEach((f) => {
        const opts = buildOpts(f.file);
        const ext = getOutputExt(opts, f.file);
        const base = f.name.replace(/\.[^.]+$/, "");
        zip.file(`${base}_${toolId}.${ext}`, f.resultBlob!);
      });
      const zb = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
      downloadBlob(zb, `imagegen_${toolId}.zip`);
    } catch {
      done.forEach((f, i) => setTimeout(() => handleDownloadSingle(f), i * 400));
    }
  };

  const doneCount = files.filter((f) => f.status === "done").length;
  const current = files[0];

  return (
    <div className="fade-in-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="font-mono font-bold text-xl md:text-2xl tracking-tight">{meta.label}</h2>
          <p className="text-sm text-black/50 mt-1">{meta.description} — browser-based, nothing uploaded.</p>
        </div>
        <span className="font-mono text-xs border-2 border-black px-2 py-1 flex-shrink-0">FREE</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Upload + Before preview */}
        <div>
          {/* Upload area */}
          {(!current || isBulk) && (
            <div
              className={`border-2 border-dashed border-black rounded-lg p-8 text-center cursor-pointer mb-4 transition-colors ${isDrag ? "bg-black/5" : "hover:bg-black/[0.02]"}`}
              onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
              onDragLeave={() => setIsDrag(false)}
              onDrop={(e) => { e.preventDefault(); setIsDrag(false); addFiles(e.dataTransfer.files); }}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" multiple={isBulk} accept="image/*" className="hidden"
                onChange={(e) => addFiles(e.target.files)} />
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 border-2 border-black rounded-full flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <p className="font-mono font-bold text-sm">
                  {isBulk ? "Drop Multiple Images" : "Drop Image Here"}
                </p>
                <p className="text-xs text-black/40">PNG, JPG, WEBP, GIF supported</p>
                <span className="text-xs text-black/30">— OR —</span>
                <button type="button"
                  className="font-mono text-xs uppercase tracking-widest bg-black text-white px-5 py-2 border-2 border-black hover:bg-white hover:text-black transition-colors"
                  onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>
                  Select {isBulk ? "Images" : "Image"}
                </button>
              </div>
            </div>
          )}

          {/* Before preview (single) */}
          {current && !isBulk && (
            <div className="border-2 border-black rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b-2 border-black bg-black/[0.02]">
                <span className="font-mono text-xs font-bold uppercase">Before</span>
                <button onClick={() => { files.forEach((f) => { URL.revokeObjectURL(f.preview); if (f.resultPreview) URL.revokeObjectURL(f.resultPreview); }); setFiles([]); setAllDone(false); }}
                  className="font-mono text-xs text-black/40 hover:text-black">✕ Change</button>
              </div>
              <div className="aspect-video bg-black/5 relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={current.preview} alt="original" className="w-full h-full object-contain"
                  style={{ filter: liveFilter }} />
                {liveFilter && (
                  <div className="absolute top-2 left-2 bg-black text-white font-mono text-xs px-2 py-0.5">
                    Live Preview
                  </div>
                )}
              </div>
              <div className="px-3 py-2 border-t border-black/10">
                <p className="font-mono text-xs truncate">{current.name}</p>
                <p className="font-mono text-xs text-black/40">{formatSize(current.originalSize)}</p>
              </div>
            </div>
          )}

          {/* Bulk file list */}
          {isBulk && files.length > 0 && (
            <div className="border-2 border-black rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b-2 border-black bg-black/[0.02]">
                <span className="font-mono text-xs font-bold uppercase">{files.length} Files</span>
                <button onClick={() => { files.forEach((f) => { URL.revokeObjectURL(f.preview); if (f.resultPreview) URL.revokeObjectURL(f.resultPreview); }); setFiles([]); setAllDone(false); }}
                  className="font-mono text-xs text-black/40 hover:text-black">Clear All</button>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {files.map((f) => (
                  <div key={f.id} className="flex items-center gap-2 px-3 py-2 border-b border-black/10 last:border-b-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={f.preview} alt="" className="w-8 h-8 object-cover border border-black/20 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs truncate">{f.name}</p>
                      <p className="font-mono text-xs text-black/40">{formatSize(f.originalSize)}
                        {f.resultSize && <span className="text-black font-bold"> → {formatSize(f.resultSize)}</span>}
                      </p>
                    </div>
                    <span className={`font-mono text-xs flex-shrink-0 ${
                      f.status === "done" ? "text-black font-bold" :
                      f.status === "error" ? "text-black/30" :
                      f.status === "processing" ? "text-black/60" : "text-black/20"
                    }`}>
                      {f.status === "done" ? "✓" : f.status === "error" ? "✗" : f.status === "processing" ? "…" : "○"}
                    </span>
                    <button onClick={() => removeFile(f.id)} className="font-mono text-xs text-black/30 hover:text-black">✕</button>
                  </div>
                ))}
              </div>
              <div className="px-3 py-2 border-t-2 border-black">
                <button type="button"
                  className="font-mono text-xs uppercase tracking-widest text-black/50 hover:text-black underline"
                  onClick={() => fileRef.current?.click()}>+ Add more images</button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Controls + After */}
        <div className="flex flex-col gap-4">
          {/* Controls */}
          <div className="border-2 border-black rounded-lg p-4">
            <p className="font-mono text-xs uppercase tracking-widest text-black/40 mb-4">Settings</p>

            {/* ── RESIZE controls ── */}
            {meta.group === "resize" && (
              <div className="space-y-3">
                {meta.resizePreset && (
                  <div className="border border-black/20 px-3 py-2 bg-black/[0.02] font-mono text-xs">
                    Preset: <strong>{meta.resizePreset.label}</strong> — {meta.resizePreset.width} × {meta.resizePreset.height}px
                  </div>
                )}
                <div className="flex gap-3 items-center">
                  <input type="number" placeholder="Width (px)" value={resizeW}
                    onChange={(e) => setResizeW(e.target.value)}
                    className="flex-1 border-2 border-black px-3 py-2 font-mono text-sm focus:outline-none bg-white" />
                  <span className="font-mono text-black/30">×</span>
                  <input type="number" placeholder="Height (px)" value={resizeH}
                    onChange={(e) => setResizeH(e.target.value)}
                    className="flex-1 border-2 border-black px-3 py-2 font-mono text-sm focus:outline-none bg-white" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={maintainRatio} onChange={(e) => setMaintainRatio(e.target.checked)} />
                  <span className="font-mono text-xs">Maintain aspect ratio</span>
                </label>
                {maintainRatio && (
                  <div className="flex gap-3">
                    {(["contain","cover","stretch"] as const).map((f) => (
                      <label key={f} className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input type="radio" name="fit" value={f} checked={fit === f} onChange={() => setFit(f)} />
                        <span className="font-mono text-xs capitalize">{f}</span>
                      </label>
                    ))}
                  </div>
                )}
                <div>
                  <p className="font-mono text-xs text-black/50 mb-1">Quality — <strong>{quality}%</strong></p>
                  <input type="range" min={1} max={100} value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))} className="w-full" />
                </div>
              </div>
            )}

            {/* ── ROTATE controls ── */}
            {meta.group === "rotate" && (
              <div className="space-y-3">
                <p className="font-mono text-xs text-black/50">Angle — <strong>{angle}°</strong></p>
                <input type="range" min={-180} max={180} value={angle}
                  onChange={(e) => setAngle(Number(e.target.value))} className="w-full" />
                <div className="flex gap-2">
                  {[-270,-180,-90,90,180,270].map((a) => (
                    <button key={a} onClick={() => setAngle(a)}
                      className={`font-mono text-xs px-2 py-1 border-2 border-black hover:bg-black hover:text-white transition-colors ${angle === a ? "bg-black text-white" : ""}`}>
                      {a > 0 ? `+${a}°` : `${a}°`}
                    </button>
                  ))}
                  <button onClick={() => setAngle(0)}
                    className="font-mono text-xs px-2 py-1 border-2 border-black hover:bg-black hover:text-white transition-colors">
                    Reset
                  </button>
                </div>
              </div>
            )}

            {/* ── FLIP controls ── */}
            {meta.group === "flip" && (
              <div className="flex gap-3">
                {[
                  { label: "↔ Horizontal", h: true, v: false },
                  { label: "↕ Vertical", h: false, v: true },
                  { label: "↔↕ Both", h: true, v: true },
                ].map((opt) => (
                  <button key={opt.label}
                    onClick={() => { setFlipH(opt.h); setFlipV(opt.v); }}
                    className={`font-mono text-xs px-3 py-2 border-2 border-black hover:bg-black hover:text-white transition-colors ${flipH === opt.h && flipV === opt.v ? "bg-black text-white" : ""}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {/* ── ADJUST slider ── */}
            {(meta.group === "adjust") && (
              <div>
                <p className="font-mono text-xs text-black/50 mb-2">
                  {meta.label} — <strong>{adjustVal}{meta.adjustUnit}</strong>
                </p>
                <input type="range"
                  min={meta.adjustMin ?? 0} max={meta.adjustMax ?? 100} value={adjustVal}
                  onChange={(e) => setAdjustVal(Number(e.target.value))} className="w-full" />
                <div className="flex justify-between font-mono text-xs text-black/30 mt-1">
                  <span>{meta.adjustMin}{meta.adjustUnit}</span>
                  <span>{meta.adjustMax}{meta.adjustUnit}</span>
                </div>
                <p className="font-mono text-xs text-black/40 mt-2">
                  ✓ Live preview active — see the result in Before panel
                </p>
              </div>
            )}

            {/* ── SHARPEN controls ── */}
            {meta.group === "sharpen" && (
              <div>
                <p className="font-mono text-xs text-black/50 mb-2">Sharpen Amount — <strong>{sharpenAmt}</strong></p>
                <input type="range" min={0.5} max={5} step={0.5} value={sharpenAmt}
                  onChange={(e) => setSharpenAmt(Number(e.target.value))} className="w-full" />
                <div className="flex justify-between font-mono text-xs text-black/30 mt-1">
                  <span>Subtle</span><span>Strong</span>
                </div>
              </div>
            )}

            {/* ── EFFECT (no controls needed) ── */}
            {meta.group === "effect" && (
              <div className="border border-black/20 px-3 py-2 bg-black/[0.02]">
                <p className="font-mono text-xs">
                  Effect: <strong>{meta.effectType}</strong> — will be applied to the full image.
                  {meta.group === "effect" && " Live preview active above."}
                </p>
              </div>
            )}

            {/* ── CONVERT controls ── */}
            {meta.group === "convert" && (
              <div className="space-y-3">
                <div>
                  <p className="font-mono text-xs text-black/50 mb-2">Output Format</p>
                  <div className="flex gap-2">
                    {["jpg","png","webp"].map((fmt) => (
                      <button key={fmt} onClick={() => setConvertFmt(fmt)}
                        className={`font-mono text-xs uppercase px-3 py-2 border-2 border-black hover:bg-black hover:text-white transition-colors ${convertFmt === fmt ? "bg-black text-white" : ""}`}>
                        .{fmt}
                      </button>
                    ))}
                  </div>
                </div>
                {convertFmt !== "png" && (
                  <div>
                    <p className="font-mono text-xs text-black/50 mb-1">Quality — <strong>{quality}%</strong></p>
                    <input type="range" min={1} max={100} value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))} className="w-full" />
                  </div>
                )}
                {meta.convertFrom && (
                  <div className="font-mono text-xs text-black/40 border border-black/10 px-3 py-2">
                    {meta.convertFrom} → .{convertFmt.toUpperCase()}
                    {toolId === "heic-to-jpg" && <span className="block mt-1 text-black/30">Note: HEIC support depends on your browser. Chrome 104+ supports it.</span>}
                  </div>
                )}
              </div>
            )}

            {/* ── SQUARE controls ── */}
            {meta.group === "square" && (
              <div className="space-y-3">
                <p className="font-mono text-xs text-black/50">Background Color (for empty space)</p>
                <div className="flex items-center gap-3">
                  <input type="color" value={squareBg} onChange={(e) => setSquareBg(e.target.value)}
                    className="w-12 h-10 border-2 border-black cursor-pointer" />
                  <span className="font-mono text-xs">{squareBg}</span>
                  {["#ffffff","#000000","#f0f0f0","transparent"].map((c) => (
                    c !== "transparent" ? (
                      <button key={c} onClick={() => setSquareBg(c)}
                        style={{ background: c }}
                        className={`w-8 h-8 border-2 ${squareBg === c ? "border-black" : "border-black/30"}`} />
                    ) : null
                  ))}
                </div>
              </div>
            )}

            {/* ── CIRCLE (no controls) ── */}
            {meta.group === "circle" && (
              <div className="border border-black/20 px-3 py-2 bg-black/[0.02]">
                <p className="font-mono text-xs">Crops image into a circle. Output format: PNG (for transparency).</p>
              </div>
            )}

            {/* ── BORDER controls ── */}
            {meta.group === "border" && (
              <div className="space-y-3">
                <div>
                  <p className="font-mono text-xs text-black/50 mb-1">Border Size — <strong>{borderSize}px</strong></p>
                  <input type="range" min={1} max={100} value={borderSize}
                    onChange={(e) => setBorderSize(Number(e.target.value))} className="w-full" />
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-mono text-xs text-black/50">Border Color</p>
                  <input type="color" value={borderColor} onChange={(e) => setBorderColor(e.target.value)}
                    className="w-12 h-9 border-2 border-black cursor-pointer" />
                  {["#000000","#ffffff","#ff0000","#0000ff"].map((c) => (
                    <button key={c} onClick={() => setBorderColor(c)}
                      style={{ background: c }}
                      className={`w-7 h-7 border-2 ${borderColor === c ? "border-black" : "border-black/20"}`} />
                  ))}
                </div>
              </div>
            )}

            {/* ── CROP controls ── */}
            {meta.group === "crop" && (
              <div className="space-y-3">
                <p className="font-mono text-xs text-black/50">Crop Region (pixels from top-left)</p>
                <div className="grid grid-cols-2 gap-2">
                  {[["Start X", cropX, setCropX], ["Start Y", cropY, setCropY]].map(([label, val, setter]) => (
                    <div key={label as string}>
                      <label className="font-mono text-xs text-black/40">{label as string}</label>
                      <input type="number" value={val as number} min={0}
                        onChange={(e) => (setter as (v: number) => void)(Number(e.target.value))}
                        className="w-full border-2 border-black px-2 py-1.5 font-mono text-sm focus:outline-none bg-white" />
                    </div>
                  ))}
                  {[["Crop Width", cropW, setCropW], ["Crop Height", cropH, setCropH]].map(([label, val, setter]) => (
                    <div key={label as string}>
                      <label className="font-mono text-xs text-black/40">{label as string}</label>
                      <input type="number" value={val as string} placeholder="px"
                        onChange={(e) => (setter as (v: string) => void)(e.target.value)}
                        className="w-full border-2 border-black px-2 py-1.5 font-mono text-sm focus:outline-none bg-white" />
                    </div>
                  ))}
                </div>
                <p className="font-mono text-xs text-black/30">Tip: Leave width/height blank to use image size.</p>
              </div>
            )}

            {/* ── TEXT / WATERMARK controls ── */}
            {meta.group === "text" && (
              <div className="space-y-3">
                <div>
                  <label className="font-mono text-xs text-black/50">Watermark Text</label>
                  <input type="text" value={textVal} onChange={(e) => setTextVal(e.target.value)}
                    className="w-full border-2 border-black px-3 py-2 font-mono text-sm focus:outline-none bg-white mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-mono text-xs text-black/50">Font Size</label>
                    <input type="number" value={textSize} min={10} max={200}
                      onChange={(e) => setTextSize(Number(e.target.value))}
                      className="w-full border-2 border-black px-3 py-2 font-mono text-sm focus:outline-none bg-white mt-1" />
                  </div>
                  <div>
                    <label className="font-mono text-xs text-black/50">Opacity — {textOpacity}%</label>
                    <input type="range" min={10} max={100} value={textOpacity}
                      onChange={(e) => setTextOpacity(Number(e.target.value))} className="w-full mt-3" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <label className="font-mono text-xs text-black/50">Color</label>
                  <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)}
                    className="w-12 h-9 border-2 border-black cursor-pointer" />
                  {["#ffffff","#000000","#ffff00"].map((c) => (
                    <button key={c} onClick={() => setTextColor(c)}
                      style={{ background: c }}
                      className={`w-7 h-7 border-2 ${textColor === c ? "border-black" : "border-black/20"}`} />
                  ))}
                </div>
                <div>
                  <label className="font-mono text-xs text-black/50 block mb-1">Position</label>
                  <div className="grid grid-cols-3 gap-1">
                    {["top-left","top-center-h","top-right","center-v","center","center-right","bottom-left","bottom-center-h","bottom-right"].map((p) => (
                      <button key={p} onClick={() => setTextPos(p)}
                        className={`font-mono text-xs px-2 py-1 border border-black hover:bg-black hover:text-white transition-colors truncate ${textPos === p ? "bg-black text-white" : ""}`}>
                        {p.replace(/-/g," ")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── LOSSLESS (no controls needed) ── */}
            {meta.group === "lossless" && (
              <div className="space-y-2">
                <div className="border border-black/20 px-3 py-2 bg-black/[0.02]">
                  <p className="font-mono text-xs">Output format: <strong>PNG (lossless)</strong> — zero quality degradation.</p>
                </div>
                <p className="font-mono text-xs text-black/40">PNG stores every pixel exactly. Ideal for graphics, logos, screenshots, and anything where pixel-perfect accuracy matters.</p>
              </div>
            )}

            {/* ── SAFE ZONE (no controls needed) ── */}
            {meta.group === "safezone" && (
              <div className="space-y-2">
                <div className="border border-black/20 px-3 py-2 bg-black/[0.02]">
                  <p className="font-mono text-xs">Adds a <strong>yellow safe-zone overlay</strong> showing the safe content area for Instagram/Facebook Stories.</p>
                </div>
                <p className="font-mono text-xs text-black/40">The shaded areas at top/bottom may be covered by the platform UI. Keep important content inside the dashed box.</p>
              </div>
            )}

            {/* ── COMPRESS controls ── */}
            {meta.group === "compress" && (
              <div>
                <p className="font-mono text-xs text-black/50 mb-1">Quality — <strong>{quality}%</strong></p>
                <input type="range" min={1} max={100} value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))} className="w-full" />
                <div className="flex justify-between font-mono text-xs text-black/30 mt-1">
                  <span>Smallest</span><span>Best Quality</span>
                </div>
              </div>
            )}
          </div>

          {/* Process + Download */}
          <div className="space-y-3">
            {!allDone ? (
              <button onClick={handleProcess} disabled={processing || files.length === 0}
                className={`w-full font-mono text-sm uppercase tracking-widest py-4 border-2 border-black font-bold transition-colors ${
                  files.length === 0 ? "opacity-40 cursor-not-allowed bg-black/10 text-black"
                  : processing ? "bg-black/60 text-white cursor-wait"
                  : "bg-black text-white hover:bg-white hover:text-black"
                }`}>
                {processing ? `⏳ Processing ${doneCount}/${files.length}...`
                  : `Process ${files.length > 0 ? `(${files.length})` : ""} Image${files.length !== 1 ? "s" : ""} →`}
              </button>
            ) : (
              <div className="flex gap-3">
                <button onClick={handleDownloadAll}
                  className="flex-1 font-mono text-sm uppercase tracking-widest py-4 border-2 border-black font-bold bg-black text-white hover:bg-white hover:text-black transition-colors">
                  ↓ Download {doneCount > 1 ? `All (${doneCount}) as ZIP` : "Result"}
                </button>
                <button onClick={() => { setAllDone(false); setFiles((p) => p.map((f) => ({ ...f, status: "idle" as const, resultBlob: undefined, resultPreview: undefined, resultSize: undefined }))); }}
                  className="font-mono text-sm uppercase tracking-widest px-4 py-4 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors">
                  ↺
                </button>
              </div>
            )}
          </div>

          {/* After preview */}
          {current?.resultPreview && !isBulk && (
            <div className="border-2 border-black rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b-2 border-black bg-black">
                <span className="font-mono text-xs font-bold uppercase text-white">Result</span>
                <span className="font-mono text-xs text-white/60">
                  {current.resultSize && formatSize(current.resultSize)}
                  {current.originalSize && current.resultSize && (
                    <span className="ml-2 text-white">
                      ({Math.round(((current.originalSize - current.resultSize) / current.originalSize) * 100)}% smaller)
                    </span>
                  )}
                </span>
              </div>
              <div className="aspect-video bg-black/5 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={current.resultPreview} alt="result" className="w-full h-full object-contain" />
              </div>
              <div className="px-3 py-2">
                <button onClick={() => handleDownloadSingle(current)}
                  className="w-full font-mono text-xs uppercase tracking-widest py-2 bg-black text-white border-2 border-black hover:bg-white hover:text-black transition-colors">
                  ↓ Download This Image
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
