"use client";

import { useState, useRef, useCallback } from "react";
import { downloadBlob, formatSize } from "@/lib/canvasUtils";

interface Slot {
  x: number; y: number; w: number; h: number; label: string;
}

interface LayoutDef {
  id: string;
  label: string;
  slots: Slot[]; // normalized 0–1 coords
}

const LAYOUTS: LayoutDef[] = [
  {
    id: "2-equal",
    label: "2 Equal",
    slots: [
      { x: 0, y: 0, w: 0.5, h: 1, label: "Left" },
      { x: 0.5, y: 0, w: 0.5, h: 1, label: "Right" },
    ],
  },
  {
    id: "3-equal",
    label: "3 Equal",
    slots: [
      { x: 0, y: 0, w: 0.333, h: 1, label: "L" },
      { x: 0.333, y: 0, w: 0.334, h: 1, label: "M" },
      { x: 0.667, y: 0, w: 0.333, h: 1, label: "R" },
    ],
  },
  {
    id: "1-big-2-small",
    label: "1 Big + 2",
    slots: [
      { x: 0, y: 0, w: 0.6, h: 1, label: "Main" },
      { x: 0.6, y: 0, w: 0.4, h: 0.5, label: "Top" },
      { x: 0.6, y: 0.5, w: 0.4, h: 0.5, label: "Bottom" },
    ],
  },
  {
    id: "2-big-3-small",
    label: "2+3 Mix",
    slots: [
      { x: 0, y: 0, w: 0.5, h: 0.6, label: "A" },
      { x: 0.5, y: 0, w: 0.5, h: 0.6, label: "B" },
      { x: 0, y: 0.6, w: 0.333, h: 0.4, label: "C" },
      { x: 0.333, y: 0.6, w: 0.334, h: 0.4, label: "D" },
      { x: 0.667, y: 0.6, w: 0.333, h: 0.4, label: "E" },
    ],
  },
  {
    id: "grid-4",
    label: "2×2 Grid",
    slots: [
      { x: 0, y: 0, w: 0.5, h: 0.5, label: "TL" },
      { x: 0.5, y: 0, w: 0.5, h: 0.5, label: "TR" },
      { x: 0, y: 0.5, w: 0.5, h: 0.5, label: "BL" },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5, label: "BR" },
    ],
  },
  {
    id: "grid-6",
    label: "2×3 Grid",
    slots: [
      { x: 0, y: 0, w: 0.333, h: 0.5, label: "1" },
      { x: 0.333, y: 0, w: 0.334, h: 0.5, label: "2" },
      { x: 0.667, y: 0, w: 0.333, h: 0.5, label: "3" },
      { x: 0, y: 0.5, w: 0.333, h: 0.5, label: "4" },
      { x: 0.333, y: 0.5, w: 0.334, h: 0.5, label: "5" },
      { x: 0.667, y: 0.5, w: 0.333, h: 0.5, label: "6" },
    ],
  },
];

export default function CollageMaker() {
  const [layout, setLayout] = useState<LayoutDef>(LAYOUTS[0]);
  const [slotImages, setSlotImages] = useState<(string | null)[]>(Array(LAYOUTS[0].slots.length).fill(null));
  const [slotFiles, setSlotFiles] = useState<(File | null)[]>(Array(LAYOUTS[0].slots.length).fill(null));
  const [gap, setGap] = useState(4);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [canvasW, setCanvasW] = useState(1200);
  const [canvasH, setCanvasH] = useState(800);
  const [quality, setQuality] = useState(90);
  const [processing, setProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState("");
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const switchLayout = (l: LayoutDef) => {
    setLayout(l);
    setSlotImages(Array(l.slots.length).fill(null));
    setSlotFiles(Array(l.slots.length).fill(null));
    setResultBlob(null);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl("");
  };

  const handleSlotClick = (idx: number) => {
    setActiveSlot(idx);
    fileRef.current?.click();
  };

  const handleFileChange = useCallback((fl: FileList | null) => {
    if (!fl || fl.length === 0 || activeSlot === null) return;
    const f = fl[0];
    if (!f.type.startsWith("image/")) return;
    const url = URL.createObjectURL(f);
    setSlotImages((prev) => { const a = [...prev]; if (a[activeSlot]) URL.revokeObjectURL(a[activeSlot]!); a[activeSlot] = url; return a; });
    setSlotFiles((prev) => { const a = [...prev]; a[activeSlot] = f; return a; });
    setActiveSlot(null);
  }, [activeSlot]);

  const loadHTMLImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = src;
    });

  const handleBuild = async () => {
    const filled = slotImages.filter(Boolean).length;
    if (filled === 0) return;
    setProcessing(true);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext("2d")!;

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvasW, canvasH);

      for (let i = 0; i < layout.slots.length; i++) {
        const slot = layout.slots[i];
        const imgUrl = slotImages[i];
        const x = slot.x * canvasW + gap;
        const y = slot.y * canvasH + gap;
        const w = slot.w * canvasW - gap * 2;
        const h = slot.h * canvasH - gap * 2;

        if (imgUrl) {
          const img = await loadHTMLImage(imgUrl);
          const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
          const dw = img.naturalWidth * scale;
          const dh = img.naturalHeight * scale;
          ctx.save();
          ctx.beginPath();
          ctx.rect(x, y, w, h);
          ctx.clip();
          ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
          ctx.restore();
        } else {
          ctx.fillStyle = "#f0f0f0";
          ctx.fillRect(x, y, w, h);
          ctx.fillStyle = "#cccccc";
          ctx.font = `bold ${Math.min(w, h) * 0.15}px monospace`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("Empty", x + w / 2, y + h / 2);
        }
      }

      canvas.toBlob((blob) => {
        if (!blob) { setProcessing(false); return; }
        if (resultUrl) URL.revokeObjectURL(resultUrl);
        const url = URL.createObjectURL(blob);
        setResultBlob(blob);
        setResultUrl(url);
        setProcessing(false);
      }, "image/jpeg", quality / 100);
    } catch (e) {
      console.error(e);
      setProcessing(false);
    }
  };

  const filledCount = slotImages.filter(Boolean).length;

  return (
    <div className="fade-in-up">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="font-mono font-bold text-xl md:text-2xl tracking-tight">Collage Maker</h2>
          <p className="text-sm text-black/50 mt-1">Choose a layout, fill slots with images, download your collage.</p>
        </div>
        <span className="font-mono text-xs border-2 border-black px-2 py-1 flex-shrink-0">FREE</span>
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => handleFileChange(e.target.files)} />

      {/* Layout Picker */}
      <div className="border-2 border-black rounded-lg p-4 mb-5">
        <p className="font-mono text-xs uppercase tracking-widest text-black/40 mb-3">Choose Layout</p>
        <div className="flex flex-wrap gap-2">
          {LAYOUTS.map((l) => (
            <button key={l.id} onClick={() => switchLayout(l)}
              className={`font-mono text-xs px-4 py-2 border-2 border-black hover:bg-black hover:text-white transition-colors ${layout.id === l.id ? "bg-black text-white" : ""}`}>
              {l.label} ({l.slots.length})
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Slot canvas preview */}
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-black/40 mb-2">
            Click a slot to add image — {filledCount}/{layout.slots.length} filled
          </p>
          <div className="border-2 border-black rounded-lg overflow-hidden relative bg-white"
            style={{ aspectRatio: `${canvasW}/${canvasH}` }}>
            {layout.slots.map((slot, idx) => {
              const imgUrl = slotImages[idx];
              return (
                <button key={idx} onClick={() => handleSlotClick(idx)}
                  className="absolute border-2 border-black hover:border-4 transition-all overflow-hidden group"
                  style={{
                    left: `${slot.x * 100}%`,
                    top: `${slot.y * 100}%`,
                    width: `${slot.w * 100}%`,
                    height: `${slot.h * 100}%`,
                    padding: `${gap / 2}px`,
                  }}>
                  {imgUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="font-mono text-white text-xs">Change</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-black/5 flex flex-col items-center justify-center gap-1">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-30">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      <span className="font-mono text-xs text-black/30">{slot.label}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Settings + Result */}
        <div className="space-y-4">
          <div className="border-2 border-black rounded-lg p-4 space-y-4">
            <p className="font-mono text-xs uppercase tracking-widest text-black/40">Collage Settings</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="font-mono text-xs text-black/50 mb-1">Width (px)</p>
                <input type="number" value={canvasW} min={400} max={4000}
                  onChange={(e) => setCanvasW(Number(e.target.value))}
                  className="w-full border-2 border-black px-3 py-2 font-mono text-sm focus:outline-none bg-white" />
              </div>
              <div>
                <p className="font-mono text-xs text-black/50 mb-1">Height (px)</p>
                <input type="number" value={canvasH} min={400} max={4000}
                  onChange={(e) => setCanvasH(Number(e.target.value))}
                  className="w-full border-2 border-black px-3 py-2 font-mono text-sm focus:outline-none bg-white" />
              </div>
            </div>

            {/* Preset sizes */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "Square", w: 1080, h: 1080 },
                { label: "4:3", w: 1200, h: 900 },
                { label: "16:9", w: 1920, h: 1080 },
                { label: "A4", w: 2480, h: 3508 },
              ].map((p) => (
                <button key={p.label} onClick={() => { setCanvasW(p.w); setCanvasH(p.h); }}
                  className="font-mono text-xs px-2 py-1 border border-black hover:bg-black hover:text-white transition-colors">
                  {p.label}
                </button>
              ))}
            </div>

            <div>
              <p className="font-mono text-xs text-black/50 mb-1">Gap — <strong>{gap}px</strong></p>
              <input type="range" min={0} max={20} value={gap}
                onChange={(e) => setGap(Number(e.target.value))} className="w-full" />
            </div>

            <div className="flex items-center gap-3">
              <p className="font-mono text-xs text-black/50">Background</p>
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
                className="w-10 h-9 border-2 border-black cursor-pointer" />
              {["#ffffff", "#000000", "#f0f0f0"].map((c) => (
                <button key={c} onClick={() => setBgColor(c)}
                  style={{ background: c }}
                  className={`w-7 h-7 border-2 ${bgColor === c ? "border-black" : "border-black/20"}`} />
              ))}
            </div>

            <div>
              <p className="font-mono text-xs text-black/50 mb-1">Quality — <strong>{quality}%</strong></p>
              <input type="range" min={50} max={100} value={quality}
                onChange={(e) => setQuality(Number(e.target.value))} className="w-full" />
            </div>
          </div>

          <button onClick={handleBuild}
            disabled={filledCount === 0 || processing}
            className={`w-full font-mono text-sm uppercase tracking-widest py-4 border-2 border-black font-bold transition-colors ${
              filledCount === 0 ? "opacity-40 cursor-not-allowed bg-black/10 text-black"
              : processing ? "bg-black/60 text-white cursor-wait"
              : "bg-black text-white hover:bg-white hover:text-black"
            }`}>
            {processing ? "⏳ Building Collage…" : "Build Collage →"}
          </button>
          {filledCount === 0 && (
            <p className="font-mono text-xs text-black/30 text-center">Click slots above to add images</p>
          )}

          {resultUrl && (
            <div className="border-2 border-black rounded-lg overflow-hidden">
              <div className="flex justify-between items-center px-3 py-2 border-b-2 border-black bg-black">
                <span className="font-mono text-xs font-bold text-white uppercase">Collage Ready</span>
                <span className="font-mono text-xs text-white/60">{resultBlob && formatSize(resultBlob.size)}</span>
              </div>
              <div className="bg-black/5 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={resultUrl} alt="collage" className="w-full object-contain max-h-48" />
              </div>
              <div className="px-3 py-2">
                <button onClick={() => resultBlob && downloadBlob(resultBlob, "imagegen_collage.jpg")}
                  className="w-full font-mono text-xs uppercase tracking-widest py-2.5 bg-black text-white border-2 border-black hover:bg-white hover:text-black transition-colors">
                  ↓ Download Collage
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
