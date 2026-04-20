"use client";

import { useState, useRef, useCallback } from "react";

interface ColorResult {
  hex: string; r: number; g: number; b: number;
  hsl: string; count: number; percent: number;
}

function rgbToHex(r: number, g: number, b: number) {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

function quantize(r: number, g: number, b: number, bits = 5) {
  const shift = 8 - bits;
  return `${r >> shift},${g >> shift},${b >> shift}`;
}

function extractColors(img: HTMLImageElement, count = 12): ColorResult[] {
  const canvas = document.createElement("canvas");
  const size = 120; // downscale for speed
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, size, size);
  const data = ctx.getImageData(0, 0, size, size).data;

  const freq: Record<string, { r: number; g: number; b: number; count: number }> = {};
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
    if (a < 128) continue; // skip transparent
    const key = quantize(r, g, b);
    if (!freq[key]) {
      freq[key] = { r: r & 0xE0, g: g & 0xE0, b: b & 0xE0, count: 0 };
    }
    freq[key].count++;
  }

  const total = size * size;
  return Object.values(freq)
    .sort((a, b) => b.count - a.count)
    .slice(0, count)
    .map((c) => ({
      r: c.r, g: c.g, b: c.b,
      hex: rgbToHex(c.r, c.g, c.b),
      hsl: rgbToHsl(c.r, c.g, c.b),
      count: c.count,
      percent: Math.round((c.count / total) * 100),
    }));
}

function isLight(r: number, g: number, b: number) {
  return (0.299 * r + 0.587 * g + 0.114 * b) > 128;
}

export default function ImageColorPicker() {
  const [preview, setPreview] = useState("");
  const [colors, setColors]   = useState<ColorResult[]>([]);
  const [picked, setPicked]   = useState<ColorResult | null>(null);
  const [isDrag, setIsDrag]   = useState(false);
  const [copied, setCopied]   = useState("");
  const [colorCount, setColorCount] = useState(12);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback((fl: FileList | null) => {
    if (!fl || !fl[0]) return;
    const f = fl[0];
    if (!f.type.startsWith("image/")) return;
    if (preview) URL.revokeObjectURL(preview);
    const url = URL.createObjectURL(f);
    setPreview(url);
    setPicked(null);
    const img = new Image();
    img.onload = () => setColors(extractColors(img, colorCount));
    img.src = url;
  }, [preview, colorCount]);

  const copyVal = (val: string) => {
    navigator.clipboard.writeText(val).then(() => {
      setCopied(val);
      setTimeout(() => setCopied(""), 1500);
    });
  };

  return (
    <div className="fade-in-up">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="font-mono font-bold text-xl md:text-2xl tracking-tight">Image Color Picker</h2>
          <p className="text-sm text-black/50 mt-1">
            Extract dominant colours and HEX / RGB / HSL codes from any image. Click a colour to copy its code.
          </p>
        </div>
        <span className="font-mono text-xs border-2 border-black px-2 py-1 flex-shrink-0">FREE</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT */}
        <div className="space-y-4">
          {!preview ? (
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
                <div className="flex gap-1 mb-2">
                  {["#FF6B6B","#4ECDC4","#45B7D1","#96E6A1","#DDA0DD"].map((c) => (
                    <div key={c} className="w-6 h-6 rounded-full" style={{ background: c }} />
                  ))}
                </div>
                <p className="font-mono font-bold text-sm">Drop Image to Extract Colours</p>
                <p className="text-xs text-black/40">Works on photos, logos, artwork — any image</p>
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
                <span className="font-mono text-xs font-bold uppercase">Source Image</span>
                <button onClick={() => { setPreview(""); setColors([]); setPicked(null); }}
                  className="font-mono text-xs text-black/40 hover:text-black">✕ Change</button>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="source" className="w-full object-contain max-h-44 bg-black/5" />
            </div>
          )}

          {/* Settings */}
          {preview && (
            <div className="border border-black/10 rounded-lg p-3 flex items-center gap-4">
              <p className="font-mono text-xs text-black/40">Extract</p>
              <div className="flex gap-2">
                {[8, 12, 16, 20].map((n) => (
                  <button key={n} onClick={() => {
                    setColorCount(n);
                    if (preview) {
                      const img = new Image();
                      img.onload = () => setColors(extractColors(img, n));
                      img.src = preview;
                    }
                  }}
                    className={`font-mono text-xs px-2.5 py-1 border border-black hover:bg-black hover:text-white transition-colors ${colorCount === n ? "bg-black text-white" : ""}`}>
                    {n}
                  </button>
                ))}
              </div>
              <p className="font-mono text-xs text-black/40">colours</p>
            </div>
          )}
        </div>

        {/* RIGHT: Color palette */}
        <div className="space-y-4">
          {colors.length > 0 ? (
            <>
              {/* Palette strip */}
              <div className="border-2 border-black rounded-lg overflow-hidden">
                <div className="flex h-12">
                  {colors.map((c) => (
                    <div key={c.hex}
                      className="flex-1 cursor-pointer hover:scale-105 transition-transform"
                      style={{ background: c.hex }}
                      onClick={() => setPicked(c)}
                      title={c.hex}
                    />
                  ))}
                </div>
              </div>

              {/* Color grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {colors.map((c) => (
                  <button key={c.hex}
                    onClick={() => setPicked(c)}
                    className={`border-2 rounded-lg overflow-hidden hover:scale-105 transition-transform ${picked?.hex === c.hex ? "border-black" : "border-black/20"}`}
                  >
                    <div className="h-10 w-full" style={{ background: c.hex }} />
                    <div className="px-1.5 py-1 bg-white">
                      <p className="font-mono text-xs font-bold text-left">{c.hex}</p>
                      <p className="font-mono text-xs text-black/40 text-left">{c.percent}%</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected colour detail */}
              {picked && (
                <div className="border-2 border-black rounded-lg overflow-hidden">
                  <div className="h-16 w-full" style={{ background: picked.hex }} />
                  <div className="p-3 space-y-2">
                    <p className="font-mono text-xs uppercase tracking-widest text-black/40 mb-2">Colour Codes</p>
                    {[
                      { label: "HEX", value: picked.hex },
                      { label: "RGB", value: `rgb(${picked.r}, ${picked.g}, ${picked.b})` },
                      { label: "HSL", value: picked.hsl },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between gap-2 border border-black/10 rounded px-3 py-2">
                        <span className="font-mono text-xs text-black/40 w-8 flex-shrink-0">{label}</span>
                        <code className="font-mono text-xs flex-1 text-left">{value}</code>
                        <button
                          onClick={() => copyVal(value)}
                          className={`font-mono text-xs px-2 py-1 border border-black transition-colors flex-shrink-0 ${copied === value ? "bg-black text-white" : "hover:bg-black hover:text-white"}`}>
                          {copied === value ? "✓" : "Copy"}
                        </button>
                      </div>
                    ))}

                    {/* Contrast indicator */}
                    <div className="flex gap-2 mt-1">
                      <div className={`flex-1 rounded p-2 text-center font-mono text-xs border ${isLight(picked.r, picked.g, picked.b) ? "border-black/10 text-black" : "border-white/10 text-white"}`}
                        style={{ background: picked.hex }}>
                        Sample text
                      </div>
                      <div className="flex-1 text-center p-2">
                        <p className="font-mono text-xs text-black/40">Luminance</p>
                        <p className="font-mono text-xs font-bold">{isLight(picked.r, picked.g, picked.b) ? "Light" : "Dark"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!picked && (
                <p className="font-mono text-xs text-black/30 text-center">Click any colour swatch to see its codes</p>
              )}
            </>
          ) : (
            <div className="border-2 border-dashed border-black/20 rounded-lg p-10 text-center">
              <p className="font-mono text-xs text-black/30">Upload an image to extract its colour palette</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
