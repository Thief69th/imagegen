"use client";

import { useState, useRef, useCallback } from "react";
import { extractColorPalette, formatSize } from "@/lib/canvasUtils";

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function hexToHsl(hex: string) {
  let { r, g, b } = hexToRgb(hex);
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function isLight(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

export default function ColorPalette() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [palette, setPalette] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDrag, setIsDrag] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [count, setCount] = useState(8);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setPalette([]);
    setLoading(true);
    try {
      const colors = await extractColorPalette(f, count);
      setPalette(colors);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [count]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDrag(false);
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith("image/")) handleFile(f);
  };

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex).catch(() => {});
    setCopied(hex);
    setTimeout(() => setCopied(null), 1500);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(palette.join(", ")).catch(() => {});
    setCopied("all");
    setTimeout(() => setCopied(null), 1500);
  };

  const exportCSS = () => {
    const css = `:root {\n${palette.map((c, i) => `  --color-${i + 1}: ${c};`).join("\n")}\n}`;
    const blob = new Blob([css], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "palette.css";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="fade-in-up">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="font-mono font-bold text-xl md:text-2xl tracking-tight">Color Palette Extractor</h2>
          <p className="text-sm text-black/50 mt-1">Extract dominant colors from any image — browser-based, nothing uploaded.</p>
        </div>
        <span className="font-mono text-xs border-2 border-black px-2 py-1 flex-shrink-0">FREE</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload */}
        <div>
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
                <div className="w-12 h-12 border-2 border-black rounded-full flex items-center justify-center text-xl">🎨</div>
                <p className="font-mono font-bold text-sm">Drop Image Here</p>
                <p className="text-xs text-black/40">PNG, JPG, WEBP supported</p>
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
                <span className="font-mono text-xs font-bold uppercase">Image</span>
                <button onClick={() => { setFile(null); setPreview(null); setPalette([]); }}
                  className="font-mono text-xs text-black/40 hover:text-black">✕ Change</button>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview!} alt="source" className="w-full object-contain max-h-64 bg-black/5" />
              <div className="px-3 py-2 border-t border-black/10">
                <p className="font-mono text-xs truncate">{file.name}</p>
                <p className="font-mono text-xs text-black/40">{formatSize(file.size)}</p>
              </div>
            </div>
          )}

          {/* Settings */}
          {file && (
            <div className="border-2 border-black rounded-lg p-4 mt-4">
              <p className="font-mono text-xs uppercase tracking-widest text-black/40 mb-3">Settings</p>
              <div>
                <p className="font-mono text-xs text-black/50 mb-1">Colors to extract — <strong>{count}</strong></p>
                <input type="range" min={4} max={16} value={count}
                  onChange={(e) => setCount(Number(e.target.value))} className="w-full" />
                <div className="flex justify-between font-mono text-xs text-black/30 mt-1"><span>4</span><span>16</span></div>
              </div>
              <button
                onClick={async () => { if (file) { setLoading(true); setPalette([]); try { const c = await extractColorPalette(file, count); setPalette(c); } finally { setLoading(false); } } }}
                className="w-full mt-3 font-mono text-xs uppercase tracking-widest py-2 border-2 border-black bg-black text-white hover:bg-white hover:text-black transition-colors">
                {loading ? "Extracting…" : "Re-Extract Palette"}
              </button>
            </div>
          )}
        </div>

        {/* Palette output */}
        <div>
          {loading && (
            <div className="border-2 border-black rounded-lg p-8 text-center">
              <div className="flex gap-1.5 justify-center">
                {[0,1,2].map((i) => (
                  <span key={i} className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
                ))}
              </div>
              <p className="font-mono text-xs text-black/40 mt-3">Analysing colors…</p>
            </div>
          )}

          {palette.length > 0 && !loading && (
            <div className="border-2 border-black rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b-2 border-black bg-black">
                <span className="font-mono text-xs font-bold uppercase text-white">{palette.length} Colors Extracted</span>
                <div className="flex gap-2">
                  <button onClick={copyAll}
                    className="font-mono text-xs px-2 py-1 border border-white/40 text-white hover:bg-white hover:text-black transition-colors">
                    {copied === "all" ? "✓ Copied!" : "Copy All"}
                  </button>
                  <button onClick={exportCSS}
                    className="font-mono text-xs px-2 py-1 border border-white/40 text-white hover:bg-white hover:text-black transition-colors">
                    Export CSS
                  </button>
                </div>
              </div>

              {/* Color strip */}
              <div className="flex h-16">
                {palette.map((hex) => (
                  <div key={hex} style={{ background: hex, flex: 1 }} />
                ))}
              </div>

              {/* Color list */}
              <div className="divide-y divide-black/10">
                {palette.map((hex, i) => {
                  const { r, g, b } = hexToRgb(hex);
                  const { h, s, l } = hexToHsl(hex);
                  const light = isLight(hex);
                  return (
                    <div key={hex} className="flex items-center gap-3 px-3 py-2.5 hover:bg-black/[0.02] cursor-pointer group"
                      onClick={() => copyHex(hex)}>
                      <div className="w-10 h-10 flex-shrink-0 border border-black/20 rounded"
                        style={{ background: hex }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm uppercase">{hex}</span>
                          <span className="font-mono text-xs text-black/30">#{i + 1}</span>
                        </div>
                        <p className="font-mono text-xs text-black/40">
                          rgb({r},{g},{b}) &nbsp; hsl({h},{s}%,{l}%)
                        </p>
                      </div>
                      <span className="font-mono text-xs text-black/40 group-hover:text-black transition-colors flex-shrink-0">
                        {copied === hex ? "✓" : "Copy"}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="px-3 py-2 border-t-2 border-black bg-black/[0.02]">
                <p className="font-mono text-xs text-black/40">Click any color to copy its hex code</p>
              </div>
            </div>
          )}

          {!loading && palette.length === 0 && !file && (
            <div className="border-2 border-dashed border-black/20 rounded-lg p-8 text-center">
              <p className="font-mono text-xs text-black/30">Upload an image to extract its color palette</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
