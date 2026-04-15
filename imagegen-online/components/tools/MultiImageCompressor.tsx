"use client";

import { useState, useRef, useCallback } from "react";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  name: string;
  originalSize: number;
  compressedSize?: number;
  compressedBlob?: Blob;
  status: "pending" | "processing" | "done" | "error";
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getSavings(original: number, compressed: number): string {
  const pct = ((original - compressed) / original) * 100;
  return pct > 0 ? `-${pct.toFixed(0)}%` : "Optimised";
}

// Real browser-based compression using Canvas API — no external library needed
async function compressImageFile(
  file: File,
  quality: number,
  maxWidth?: number,
  maxHeight?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      let w = img.naturalWidth;
      let h = img.naturalHeight;

      if (maxWidth && maxHeight) {
        const ratio = Math.min(maxWidth / w, maxHeight / h, 1);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      } else if (maxWidth && maxWidth < w) {
        h = Math.round((h * maxWidth) / w);
        w = maxWidth;
      } else if (maxHeight && maxHeight < h) {
        w = Math.round((w * maxHeight) / h);
        h = maxHeight;
      }

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas not supported")); return; }
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);

      const isPng = file.type === "image/png";
      const outType = isPng ? "image/png" : "image/jpeg";
      const q = isPng ? 1 : quality / 100;

      canvas.toBlob(
        (blob) => { if (blob) resolve(blob); else reject(new Error("Compression failed")); },
        outType,
        q
      );
    };

    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Load failed")); };
    img.src = url;
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function MultiImageCompressor() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [compression, setCompression] = useState<"low" | "medium" | "high">("medium");
  const [quality, setQuality] = useState(75);
  const [resizeWidth, setResizeWidth] = useState("");
  const [resizeHeight, setResizeHeight] = useState("");
  const [processing, setProcessing] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const newImages: ImageFile[] = [];
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const preview = URL.createObjectURL(file);
      newImages.push({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file, preview,
        name: file.name,
        originalSize: file.size,
        status: "pending",
      });
    });
    setImages((prev) => [...prev, ...newImages]);
    setAllDone(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const removeImage = (id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter((i) => i.id !== id);
    });
    setAllDone(false);
  };

  const clearAll = () => {
    images.forEach((i) => URL.revokeObjectURL(i.preview));
    setImages([]);
    setAllDone(false);
  };

  const getQualityValue = () => {
    if (compression === "low") return 90;
    if (compression === "high") return 40;
    return quality;
  };

  const handleCompressAll = async () => {
    if (images.length === 0 || processing) return;
    setProcessing(true);
    setAllDone(false);

    const q = getQualityValue();
    const mw = resizeWidth ? parseInt(resizeWidth) : undefined;
    const mh = resizeHeight ? parseInt(resizeHeight) : undefined;

    const results: ImageFile[] = images.map((i) => ({ ...i, status: "pending" as const }));

    for (let i = 0; i < results.length; i++) {
      results[i] = { ...results[i], status: "processing" };
      setImages([...results]);

      try {
        const blob = await compressImageFile(results[i].file, q, mw, mh);
        results[i] = { ...results[i], status: "done", compressedBlob: blob, compressedSize: blob.size };
      } catch {
        results[i] = { ...results[i], status: "error" };
      }

      setImages([...results]);
    }

    setProcessing(false);
    setAllDone(true);
  };

  const handleDownloadAll = async () => {
    const done = images.filter((i) => i.status === "done" && i.compressedBlob);
    if (done.length === 0) return;

    if (done.length === 1) {
      const img = done[0];
      const ext = img.file.type === "image/png" ? "png" : "jpg";
      downloadBlob(img.compressedBlob!, `${img.name.replace(/\.[^.]+$/, "")}_compressed.${ext}`);
      return;
    }

    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      done.forEach((img) => {
        const ext = img.file.type === "image/png" ? "png" : "jpg";
        zip.file(`${img.name.replace(/\.[^.]+$/, "")}_compressed.${ext}`, img.compressedBlob!);
      });
      const zipBlob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
      downloadBlob(zipBlob, "imagegen_compressed.zip");
    } catch {
      done.forEach((img, idx) => {
        setTimeout(() => {
          const ext = img.file.type === "image/png" ? "png" : "jpg";
          downloadBlob(img.compressedBlob!, `${img.name.replace(/\.[^.]+$/, "")}_compressed.${ext}`);
        }, idx * 400);
      });
    }
  };

  const doneCount = images.filter((i) => i.status === "done").length;
  const totalSaved = images
    .filter((i) => i.status === "done" && i.compressedSize)
    .reduce((acc, i) => acc + (i.originalSize - (i.compressedSize ?? 0)), 0);

  return (
    <div className="fade-in-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-mono font-bold text-xl md:text-2xl tracking-tight">
            Multi Image Compressor
          </h2>
          <p className="text-sm text-black/50 mt-1">
            Real browser-based compression — no upload, nothing stored, instant download.
          </p>
        </div>
        <span className="font-mono text-xs border-2 border-black px-2 py-1 flex-shrink-0">
          FREE
        </span>
      </div>

      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed border-black rounded-lg p-8 md:p-12 text-center cursor-pointer transition-colors ${
          isDragging ? "bg-black/5" : "hover:bg-black/[0.02]"
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 border-2 border-black rounded-full flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <p className="font-mono font-bold text-sm md:text-base">Drag &amp; Drop Images Here</p>
          <p className="text-xs text-black/40">PNG, JPG, WEBP, GIF, TIFF supported</p>
          <span className="text-xs text-black/30">— OR —</span>
          <button
            type="button"
            className="font-mono text-xs uppercase tracking-widest bg-black text-white px-6 py-2.5 border-2 border-black hover:bg-white hover:text-black transition-colors"
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
          >
            Select Multiple Images
          </button>
        </div>
      </div>

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs uppercase tracking-widest text-black/50">
              {images.length} image{images.length !== 1 ? "s" : ""}
              {allDone && totalSaved > 0 && (
                <span className="ml-2 font-bold text-black">· {formatSize(totalSaved)} saved</span>
              )}
            </span>
            <button onClick={clearAll} className="font-mono text-xs text-black/40 hover:text-black underline">
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((img) => (
              <div key={img.id} className="border-2 border-black rounded-lg overflow-hidden relative group bg-white">
                <div className="aspect-square bg-black/5 relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.preview} alt={img.name} className="w-full h-full object-cover" />
                  {img.status === "processing" && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="flex gap-1">
                        {[0,1,2].map((i) => (
                          <span key={i} className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    </div>
                  )}
                  {img.status === "done" && (
                    <div className="absolute top-1.5 left-1.5 bg-black text-white font-mono text-xs px-1.5 py-0.5">
                      ✓
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="font-mono text-xs truncate font-bold" title={img.name}>{img.name}</p>
                  <p className="font-mono text-xs text-black/40">
                    {formatSize(img.originalSize)}
                    {img.compressedSize !== undefined && (
                      <> → <span className="text-black font-bold">{formatSize(img.compressedSize)}</span>
                        {" "}<span className="text-black/50">{getSavings(img.originalSize, img.compressedSize)}</span>
                      </>
                    )}
                  </p>
                  {img.status === "done" && img.compressedBlob && (
                    <button
                      className="mt-1.5 w-full font-mono text-xs bg-black text-white py-1 hover:bg-white hover:text-black border-2 border-black transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        const ext = img.file.type === "image/png" ? "png" : "jpg";
                        downloadBlob(img.compressedBlob!, `${img.name.replace(/\.[^.]+$/, "")}_compressed.${ext}`);
                      }}
                    >
                      ↓ Download
                    </button>
                  )}
                </div>
                {img.status !== "processing" && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-black border border-black"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className={`mt-6 border-2 border-black rounded-lg p-5 bg-white ${images.length === 0 ? "opacity-40 pointer-events-none" : ""}`}>
        <p className="font-mono text-xs uppercase tracking-widest mb-4 text-black/50">Compression Settings</p>

        {/* Level */}
        <div className="mb-5">
          <p className="font-mono text-xs uppercase tracking-widest text-black/60 mb-2">Compression Level</p>
          <div className="flex flex-wrap gap-5">
            {(["low", "medium", "high"] as const).map((level) => (
              <label key={level} className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="compression"
                  value={level}
                  checked={compression === level}
                  onChange={() => {
                    setCompression(level);
                    if (level === "low") setQuality(90);
                    if (level === "high") setQuality(40);
                    if (level === "medium") setQuality(75);
                  }}
                />
                <span className="font-mono text-xs uppercase tracking-widest capitalize">{level}</span>
                <span className="font-mono text-xs text-black/30">
                  {level === "low" ? "(90%)" : level === "medium" ? "(75%)" : "(40%)"}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Quality slider */}
        {compression === "medium" && (
          <div className="mb-5">
            <p className="font-mono text-xs uppercase tracking-widest text-black/60 mb-2">
              Quality — <span className="text-black font-bold">{quality}%</span>
            </p>
            <input
              type="range" min={1} max={100} value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between font-mono text-xs text-black/30 mt-1">
              <span>Smallest File</span><span>Best Quality</span>
            </div>
          </div>
        )}

        {/* Resize */}
        <div className="mb-5">
          <p className="font-mono text-xs uppercase tracking-widest text-black/60 mb-2">
            Resize — Optional (leave blank = keep original size)
          </p>
          <div className="grid grid-cols-2 gap-3 items-center">
            <input
              type="number" placeholder="Max Width (px)" value={resizeWidth}
              onChange={(e) => setResizeWidth(e.target.value)}
              className="w-full min-w-0 border-2 border-black px-2 py-2 font-mono text-sm focus:outline-none bg-white"
            />
            <input
              type="number" placeholder="Max Height (px)" value={resizeHeight}
              onChange={(e) => setResizeHeight(e.target.value)}
              className="w-full min-w-0 border-2 border-black px-2 py-2 font-mono text-sm focus:outline-none bg-white"
            />
          </div>
        </div>

        {/* Action Buttons */}
        {!allDone ? (
          <button
            onClick={handleCompressAll}
            disabled={processing || images.length === 0}
            className={`w-full font-mono text-sm uppercase tracking-widest py-4 border-2 border-black font-bold transition-colors ${
              processing
                ? "bg-black/70 text-white cursor-wait"
                : "bg-black text-white hover:bg-white hover:text-black"
            }`}
          >
            {processing
              ? `⏳ Compressing ${doneCount}/${images.length}...`
              : `Compress All ${images.length > 0 ? `(${images.length})` : ""} Images`}
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownloadAll}
              className="flex-1 font-mono text-sm uppercase tracking-widest py-4 border-2 border-black font-bold bg-black text-white hover:bg-white hover:text-black transition-colors"
            >
              ↓ Download All ({doneCount}) as ZIP
            </button>
            <button
              onClick={() => {
                setAllDone(false);
                setImages((prev) => prev.map((i) => ({
                  ...i, status: "pending" as const,
                  compressedBlob: undefined, compressedSize: undefined
                })));
              }}
              className="sm:w-32 font-mono text-sm uppercase tracking-widest py-4 border-2 border-black bg-white text-black hover:bg-black hover:text-white transition-colors"
            >
              Reset
            </button>
          </div>
        )}

        {/* Summary */}
        {allDone && (
          <div className="mt-3 border-2 border-black/20 p-3 bg-black/[0.02]">
            <div className="flex justify-between font-mono text-xs">
              <span className="text-black/50">Compressed</span>
              <span className="font-bold">{doneCount} / {images.length} images</span>
            </div>
            {totalSaved > 0 && (
              <div className="flex justify-between font-mono text-xs mt-1">
                <span className="text-black/50">Total space saved</span>
                <span className="font-bold">{formatSize(totalSaved)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
