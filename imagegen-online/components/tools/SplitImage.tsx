"use client";

import { useState, useRef, useCallback } from "react";
import { downloadBlob } from "@/lib/canvasUtils";

interface TilePreview {
  url: string;
  blob: Blob;
  label: string;
}

export default function SplitImageTool() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [cols, setCols] = useState(2);
  const [rows, setRows] = useState(2);
  const [quality, setQuality] = useState(90);
  const [tiles, setTiles] = useState<TilePreview[]>([]);
  const [processing, setProcessing] = useState(false);
  const [isDrag, setIsDrag] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const addFile = useCallback((fl: FileList | null) => {
    if (!fl || fl.length === 0) return;
    const f = fl[0];
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));
    tiles.forEach((t) => URL.revokeObjectURL(t.url));
    setTiles([]);
  }, [preview, tiles]);

  const handleSplit = async () => {
    if (!file) return;
    setProcessing(true);
    tiles.forEach((t) => URL.revokeObjectURL(t.url));
    setTiles([]);

    try {
      const img = await new Promise<HTMLImageElement>((res, rej) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = rej;
        i.src = preview;
      });

      const tileW = Math.floor(img.naturalWidth / cols);
      const tileH = Math.floor(img.naturalHeight / rows);
      const result: TilePreview[] = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const canvas = document.createElement("canvas");
          canvas.width = tileW;
          canvas.height = tileH;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, c * tileW, r * tileH, tileW, tileH, 0, 0, tileW, tileH);
          const blob = await new Promise<Blob>((res, rej) =>
            canvas.toBlob((b) => b ? res(b) : rej(), "image/jpeg", quality / 100)
          );
          result.push({
            url: URL.createObjectURL(blob),
            blob,
            label: `tile_r${r + 1}_c${c + 1}`,
          });
        }
      }

      setTiles(result);
    } catch (e) {
      console.error(e);
    }
    setProcessing(false);
  };

  const handleDownloadAll = async () => {
    if (tiles.length === 0 || !file) return;
    const base = file.name.replace(/\.[^.]+$/, "");

    if (tiles.length === 1) {
      downloadBlob(tiles[0].blob, `${base}_${tiles[0].label}.jpg`);
      return;
    }

    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      tiles.forEach((t) => zip.file(`${base}_${t.label}.jpg`, t.blob));
      const zb = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
      downloadBlob(zb, `${base}_split_${rows}x${cols}.zip`);
    } catch {
      tiles.forEach((t, i) =>
        setTimeout(() => downloadBlob(t.blob, `${(file?.name ?? "img").replace(/\.[^.]+$/, "")}_${t.label}.jpg`), i * 400)
      );
    }
  };

  const presets = [
    { label: "2×2", r: 2, c: 2 },
    { label: "2×3", r: 2, c: 3 },
    { label: "3×3", r: 3, c: 3 },
    { label: "4×4", r: 4, c: 4 },
    { label: "1×2", r: 1, c: 2 },
    { label: "2×1", r: 2, c: 1 },
    { label: "3×1", r: 3, c: 1 },
    { label: "1×3", r: 1, c: 3 },
  ];

  return (
    <div className="fade-in-up">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="font-mono font-bold text-xl md:text-2xl tracking-tight">Split Image</h2>
          <p className="text-sm text-black/50 mt-1">Split one image into grid tiles. Download as ZIP.</p>
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
              onDrop={(e) => { e.preventDefault(); setIsDrag(false); addFile(e.dataTransfer.files); }}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => addFile(e.target.files)} />
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 border-2 border-black rounded-full flex items-center justify-center">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="12" y1="3" x2="12" y2="21"/>
                  </svg>
                </div>
                <p className="font-mono font-bold text-sm">Drop Image to Split</p>
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
                <button onClick={() => { setFile(null); setPreview(""); setTiles([]); }}
                  className="font-mono text-xs text-black/40 hover:text-black">✕ Change</button>
              </div>
              <div className="relative bg-black/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="original" className="w-full object-contain max-h-64" />
                {/* Grid overlay */}
                <div className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent calc(100%/${rows} - 1px), rgba(0,0,0,0.3) calc(100%/${rows} - 1px), rgba(0,0,0,0.3) calc(100%/${rows})), repeating-linear-gradient(90deg, transparent, transparent calc(100%/${cols} - 1px), rgba(0,0,0,0.3) calc(100%/${cols} - 1px), rgba(0,0,0,0.3) calc(100%/${cols}))`,
                  }} />
              </div>
              <div className="px-3 py-2">
                <p className="font-mono text-xs text-black/40">
                  Will split into <strong className="text-black">{rows * cols} tiles</strong> ({cols} columns × {rows} rows)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Controls + Tiles */}
        <div className="space-y-4">
          <div className={`border-2 border-black rounded-lg p-4 space-y-4 ${!file ? "opacity-40 pointer-events-none" : ""}`}>
            <p className="font-mono text-xs uppercase tracking-widest text-black/40">Split Settings</p>

            {/* Presets */}
            <div>
              <p className="font-mono text-xs text-black/50 mb-2">Quick Presets</p>
              <div className="flex flex-wrap gap-2">
                {presets.map((p) => (
                  <button key={p.label} onClick={() => { setRows(p.r); setCols(p.c); }}
                    className={`font-mono text-xs px-3 py-1.5 border-2 border-black hover:bg-black hover:text-white transition-colors ${rows === p.r && cols === p.c ? "bg-black text-white" : ""}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="font-mono text-xs text-black/50 mb-1">Columns</p>
                <input type="number" min={1} max={10} value={cols}
                  onChange={(e) => setCols(Math.min(10, Math.max(1, Number(e.target.value))))}
                  className="w-full border-2 border-black px-3 py-2 font-mono text-sm focus:outline-none bg-white" />
              </div>
              <div>
                <p className="font-mono text-xs text-black/50 mb-1">Rows</p>
                <input type="number" min={1} max={10} value={rows}
                  onChange={(e) => setRows(Math.min(10, Math.max(1, Number(e.target.value))))}
                  className="w-full border-2 border-black px-3 py-2 font-mono text-sm focus:outline-none bg-white" />
              </div>
            </div>

            <div>
              <p className="font-mono text-xs text-black/50 mb-1">Tile Quality — <strong>{quality}%</strong></p>
              <input type="range" min={50} max={100} value={quality}
                onChange={(e) => setQuality(Number(e.target.value))} className="w-full" />
            </div>
          </div>

          <button onClick={handleSplit}
            disabled={!file || processing}
            className={`w-full font-mono text-sm uppercase tracking-widest py-4 border-2 border-black font-bold transition-colors ${
              !file ? "opacity-40 cursor-not-allowed bg-black/10 text-black"
              : processing ? "bg-black/60 text-white cursor-wait"
              : "bg-black text-white hover:bg-white hover:text-black"
            }`}>
            {processing ? "⏳ Splitting…" : `Split into ${rows * cols} Tiles →`}
          </button>

          {tiles.length > 0 && (
            <div className="border-2 border-black rounded-lg overflow-hidden">
              <div className="flex justify-between items-center px-3 py-2 border-b-2 border-black bg-black">
                <span className="font-mono text-xs font-bold uppercase text-white">{tiles.length} Tiles Ready</span>
                <button onClick={handleDownloadAll}
                  className="font-mono text-xs bg-white text-black px-3 py-1 border border-white hover:bg-black hover:text-white transition-colors">
                  ↓ Download All (ZIP)
                </button>
              </div>
              <div className={`grid gap-1 p-2 bg-black/[0.02]`}
                style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                {tiles.map((t, i) => (
                  <div key={i} className="border border-black/20 overflow-hidden group relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={t.url} alt={t.label} className="w-full aspect-square object-cover" />
                    <button
                      onClick={() => downloadBlob(t.blob, `${(file?.name ?? "img").replace(/\.[^.]+$/, "")}_${t.label}.jpg`)}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 text-white font-mono text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      ↓
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
