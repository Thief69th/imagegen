"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { downloadBlob, formatSize } from "@/lib/canvasUtils";

type MergeLayout = "horizontal" | "vertical" | "grid-2x2" | "grid-2x3" | "grid-3x2";

interface ImgEntry {
  id: string;
  file: File;
  preview: string;
  name: string;
}

export default function MergeImagesTool() {
  const [images, setImages] = useState<ImgEntry[]>([]);
  const [isDrag, setIsDrag] = useState(false);
  const [layout, setLayout] = useState<MergeLayout>("horizontal");
  const [gap, setGap] = useState(8);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [quality, setQuality] = useState(90);
  const [processing, setProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string>("");
  const [resultSize, setResultSize] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const addFiles = useCallback((fl: FileList | null) => {
    if (!fl) return;
    const entries: ImgEntry[] = Array.from(fl)
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => ({
        id: `${f.name}-${Date.now()}-${Math.random()}`,
        file: f,
        preview: URL.createObjectURL(f),
        name: f.name,
      }));
    setImages((prev) => [...prev, ...entries]);
    setResultBlob(null);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl("");
  }, [resultUrl]);

  const removeImg = (id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter((i) => i.id !== id);
    });
  };

  const moveImg = (id: string, dir: -1 | 1) => {
    setImages((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      if (idx < 0) return prev;
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr;
    });
  };

  const loadHTMLImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = src;
    });

  const handleMerge = async () => {
    if (images.length < 2) return;
    setProcessing(true);

    try {
      const imgs = await Promise.all(images.map((e) => loadHTMLImage(e.preview)));
      const g = gap;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;

      let cols = 1, rows = 1;
      if (layout === "horizontal") { cols = imgs.length; rows = 1; }
      else if (layout === "vertical") { cols = 1; rows = imgs.length; }
      else if (layout === "grid-2x2") { cols = 2; rows = 2; }
      else if (layout === "grid-2x3") { cols = 3; rows = 2; }
      else if (layout === "grid-3x2") { cols = 2; rows = 3; }

      const cellW = Math.max(...imgs.map((i) => i.naturalWidth));
      const cellH = Math.max(...imgs.map((i) => i.naturalHeight));

      canvas.width = cols * cellW + (cols - 1) * g;
      canvas.height = rows * cellH + (rows - 1) * g;

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      imgs.forEach((img, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const x = col * (cellW + g);
        const y = row * (cellH + g);
        // Center image in cell
        const scale = Math.min(cellW / img.naturalWidth, cellH / img.naturalHeight);
        const dw = img.naturalWidth * scale;
        const dh = img.naturalHeight * scale;
        const dx = x + (cellW - dw) / 2;
        const dy = y + (cellH - dh) / 2;
        ctx.drawImage(img, dx, dy, dw, dh);
      });

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        if (resultUrl) URL.revokeObjectURL(resultUrl);
        setResultBlob(blob);
        setResultUrl(url);
        setResultSize(blob.size);
        setProcessing(false);
      }, "image/jpeg", quality / 100);
    } catch (e) {
      console.error(e);
      setProcessing(false);
    }
  };

  const layouts: { id: MergeLayout; label: string; icon: string }[] = [
    { id: "horizontal", label: "Side by Side →", icon: "⬛⬛" },
    { id: "vertical", label: "Stacked ↓", icon: "⬛\n⬛" },
    { id: "grid-2x2", label: "2×2 Grid", icon: "⬛⬛\n⬛⬛" },
    { id: "grid-2x3", label: "2×3 Grid", icon: "⬛⬛⬛\n⬛⬛⬛" },
    { id: "grid-3x2", label: "3×2 Grid", icon: "⬛⬛\n⬛⬛\n⬛⬛" },
  ];

  return (
    <div className="fade-in-up">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="font-mono font-bold text-xl md:text-2xl tracking-tight">Merge Images</h2>
          <p className="text-sm text-black/50 mt-1">Combine multiple images side by side, stacked, or in a grid.</p>
        </div>
        <span className="font-mono text-xs border-2 border-black px-2 py-1 flex-shrink-0">FREE</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Upload + Image list */}
        <div className="space-y-4">
          <div
            className={`border-2 border-dashed border-black rounded-lg p-6 text-center cursor-pointer transition-colors ${isDrag ? "bg-black/5" : "hover:bg-black/[0.02]"}`}
            onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
            onDragLeave={() => setIsDrag(false)}
            onDrop={(e) => { e.preventDefault(); setIsDrag(false); addFiles(e.dataTransfer.files); }}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" multiple accept="image/*" className="hidden"
              onChange={(e) => addFiles(e.target.files)} />
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 border-2 border-black rounded-full flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <p className="font-mono font-bold text-xs">Drop Images to Merge</p>
              <button type="button"
                className="font-mono text-xs uppercase tracking-widest bg-black text-white px-4 py-2 border-2 border-black hover:bg-white hover:text-black transition-colors"
                onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>
                + Add Images
              </button>
            </div>
          </div>

          {images.length > 0 && (
            <div className="border-2 border-black rounded-lg overflow-hidden">
              <div className="px-3 py-2 border-b-2 border-black bg-black/[0.02] flex justify-between items-center">
                <span className="font-mono text-xs font-bold uppercase">{images.length} Images — Drag to reorder</span>
                <button onClick={() => { images.forEach((i) => URL.revokeObjectURL(i.preview)); setImages([]); }}
                  className="font-mono text-xs text-black/40 hover:text-black">Clear</button>
              </div>
              <div className="divide-y-2 divide-black/10">
                {images.map((img, idx) => (
                  <div key={img.id} className="flex items-center gap-2 px-3 py-2">
                    <span className="font-mono text-xs text-black/30 w-4 flex-shrink-0">{idx + 1}</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.preview} alt="" className="w-10 h-10 object-cover border-2 border-black flex-shrink-0" />
                    <p className="font-mono text-xs flex-1 truncate">{img.name}</p>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => moveImg(img.id, -1)} disabled={idx === 0}
                        className="w-6 h-6 border border-black font-mono text-xs hover:bg-black hover:text-white transition-colors disabled:opacity-20">↑</button>
                      <button onClick={() => moveImg(img.id, 1)} disabled={idx === images.length - 1}
                        className="w-6 h-6 border border-black font-mono text-xs hover:bg-black hover:text-white transition-colors disabled:opacity-20">↓</button>
                      <button onClick={() => removeImg(img.id)}
                        className="w-6 h-6 border border-black font-mono text-xs hover:bg-black hover:text-white transition-colors">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Settings + Preview */}
        <div className="space-y-4">
          <div className={`border-2 border-black rounded-lg p-4 space-y-4 ${images.length < 2 ? "opacity-40 pointer-events-none" : ""}`}>
            <p className="font-mono text-xs uppercase tracking-widest text-black/40">Layout</p>
            <div className="flex flex-wrap gap-2">
              {layouts.map((l) => (
                <button key={l.id} onClick={() => setLayout(l.id)}
                  className={`font-mono text-xs px-3 py-2 border-2 border-black hover:bg-black hover:text-white transition-colors ${layout === l.id ? "bg-black text-white" : ""}`}>
                  {l.label}
                </button>
              ))}
            </div>

            <div>
              <p className="font-mono text-xs text-black/50 mb-1">Gap between images — <strong>{gap}px</strong></p>
              <input type="range" min={0} max={40} value={gap}
                onChange={(e) => setGap(Number(e.target.value))} className="w-full" />
            </div>

            <div className="flex items-center gap-3">
              <p className="font-mono text-xs text-black/50">Background</p>
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
                className="w-10 h-9 border-2 border-black cursor-pointer" />
              {["#ffffff", "#000000", "#f0f0f0"].map((c) => (
                <button key={c} onClick={() => setBgColor(c)}
                  style={{ background: c }}
                  className={`w-8 h-8 border-2 ${bgColor === c ? "border-black" : "border-black/20"}`} />
              ))}
            </div>

            <div>
              <p className="font-mono text-xs text-black/50 mb-1">Quality — <strong>{quality}%</strong></p>
              <input type="range" min={50} max={100} value={quality}
                onChange={(e) => setQuality(Number(e.target.value))} className="w-full" />
            </div>
          </div>

          <button onClick={handleMerge}
            disabled={images.length < 2 || processing}
            className={`w-full font-mono text-sm uppercase tracking-widest py-4 border-2 border-black font-bold transition-colors ${
              images.length < 2 ? "opacity-40 cursor-not-allowed bg-black/10 text-black"
              : processing ? "bg-black/60 text-white cursor-wait"
              : "bg-black text-white hover:bg-white hover:text-black"
            }`}>
            {processing ? "⏳ Merging…" : `Merge ${images.length} Images →`}
          </button>
          {images.length < 2 && <p className="font-mono text-xs text-black/30 text-center">Add at least 2 images to merge</p>}

          {resultUrl && (
            <div className="border-2 border-black rounded-lg overflow-hidden">
              <div className="flex justify-between items-center px-3 py-2 border-b-2 border-black bg-black">
                <span className="font-mono text-xs font-bold text-white uppercase">Merged Result</span>
                <span className="font-mono text-xs text-white/60">{formatSize(resultSize)}</span>
              </div>
              <div className="bg-black/5 overflow-hidden max-h-64 flex items-center justify-center p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={resultUrl} alt="merged" className="max-w-full max-h-60 object-contain" />
              </div>
              <div className="px-3 py-2">
                <button onClick={() => resultBlob && downloadBlob(resultBlob, "imagegen_merged.jpg")}
                  className="w-full font-mono text-xs uppercase tracking-widest py-2 bg-black text-white border-2 border-black hover:bg-white hover:text-black transition-colors">
                  ↓ Download Merged Image
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
