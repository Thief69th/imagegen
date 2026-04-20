"use client";

import { useState, useRef, useCallback } from "react";
import { downloadBlob, formatSize } from "@/lib/canvasUtils";

export default function MemeTextGenerator() {
  const [file, setFile]         = useState<File | null>(null);
  const [preview, setPreview]   = useState("");
  const [topText, setTopText]   = useState("");
  const [botText, setBotText]   = useState("");
  const [fontSize, setFontSize] = useState(60);
  const [textColor, setTextColor] = useState("#ffffff");
  const [outlineColor, setOutlineColor] = useState("#000000");
  const [outlineWidth, setOutlineWidth] = useState(3);
  const [isDrag, setIsDrag]     = useState(false);
  const [processing, setProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl]   = useState("");
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

  const drawText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, fs: number) => {
    ctx.font = `900 ${fs}px Impact, Arial Black, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.lineWidth = outlineWidth * 2;
    ctx.strokeStyle = outlineColor;
    ctx.strokeText(text.toUpperCase(), x, y, maxW);
    ctx.fillStyle = textColor;
    ctx.fillText(text.toUpperCase(), x, y, maxW);
  };

  const handleGenerate = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const img = await new Promise<HTMLImageElement>((res, rej) => {
        const i = new Image();
        const url = URL.createObjectURL(file);
        i.onload = () => { URL.revokeObjectURL(url); res(i); };
        i.onerror = () => { URL.revokeObjectURL(url); rej(); };
        i.src = url;
      });
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const cx = canvas.width / 2;
      const pad = 20;
      const fs = Math.round(fontSize * (canvas.width / 600));
      const maxW = canvas.width - pad * 2;
      if (topText) drawText(ctx, topText, cx, pad, maxW, fs);
      if (botText) drawText(ctx, botText, cx, canvas.height - fs - pad - 10, maxW, fs);
      const blob = await new Promise<Blob>((res, rej) =>
        canvas.toBlob((b) => b ? res(b) : rej(), "image/jpeg", 0.92)
      );
      const url = URL.createObjectURL(blob);
      setResultBlob(blob);
      setResultUrl(url);
    } catch (e) { console.error(e); }
    setProcessing(false);
  };

  const previewFilter = preview;

  return (
    <div className="fade-in-up">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="font-mono font-bold text-xl md:text-2xl tracking-tight">Meme Text Generator</h2>
          <p className="text-sm text-black/50 mt-1">
            Add bold Impact-font top and bottom text to any image — classic meme style with black outline.
          </p>
        </div>
        <span className="font-mono text-xs border-2 border-black px-2 py-1 flex-shrink-0">FREE</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Upload + Controls */}
        <div className="space-y-4">
          {!file ? (
            <div
              className={`border-2 border-dashed border-black rounded-lg p-8 text-center cursor-pointer transition-colors ${isDrag ? "bg-black/5" : "hover:bg-black/[0.02]"}`}
              onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
              onDragLeave={() => setIsDrag(false)}
              onDrop={(e) => { e.preventDefault(); setIsDrag(false); loadFile(e.dataTransfer.files); }}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => loadFile(e.target.files)} />
              <div className="flex flex-col items-center gap-2">
                <p className="font-mono text-2xl">😂</p>
                <p className="font-mono font-bold text-sm">Drop Meme Template Here</p>
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
                <span className="font-mono text-xs font-bold uppercase">Template</span>
                <button onClick={() => { setFile(null); setPreview(""); setResultUrl(""); setResultBlob(null); }}
                  className="font-mono text-xs text-black/40 hover:text-black">✕ Change</button>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewFilter} alt="template" className="w-full object-contain max-h-44 bg-black/5" />
              {file && <p className="font-mono text-xs text-black/40 px-3 py-1">{formatSize(file.size)}</p>}
            </div>
          )}

          <div className={`border-2 border-black rounded-lg p-4 space-y-3 ${!file ? "opacity-40 pointer-events-none" : ""}`}>
            <p className="font-mono text-xs uppercase tracking-widest text-black/40">Meme Text</p>

            <div>
              <label className="font-mono text-xs text-black/50 block mb-1">Top Text</label>
              <input type="text" value={topText} onChange={(e) => setTopText(e.target.value)}
                placeholder="When you..."
                className="w-full border-2 border-black px-3 py-2 font-mono text-sm focus:outline-none bg-white uppercase placeholder:normal-case" />
            </div>
            <div>
              <label className="font-mono text-xs text-black/50 block mb-1">Bottom Text</label>
              <input type="text" value={botText} onChange={(e) => setBotText(e.target.value)}
                placeholder="...every single time"
                className="w-full border-2 border-black px-3 py-2 font-mono text-sm focus:outline-none bg-white uppercase placeholder:normal-case" />
            </div>

            <div>
              <label className="font-mono text-xs text-black/50 block mb-1">Font Size — <strong className="text-black">{fontSize}px</strong></label>
              <input type="range" min={20} max={120} value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))} className="w-full" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-xs text-black/50 block mb-1">Text Colour</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)}
                    className="w-10 h-9 border-2 border-black cursor-pointer" />
                  {["#ffffff","#ffff00","#000000"].map((c) => (
                    <button key={c} onClick={() => setTextColor(c)}
                      style={{ background: c }}
                      className={`w-7 h-7 border-2 ${textColor === c ? "border-black" : "border-black/20"}`} />
                  ))}
                </div>
              </div>
              <div>
                <label className="font-mono text-xs text-black/50 block mb-1">Outline — <strong className="text-black">{outlineWidth}px</strong></label>
                <input type="range" min={0} max={8} value={outlineWidth}
                  onChange={(e) => setOutlineWidth(Number(e.target.value))} className="w-full mt-2" />
              </div>
            </div>
          </div>

          <button onClick={handleGenerate} disabled={!file || processing || (!topText && !botText)}
            className={`w-full font-mono text-sm uppercase tracking-widest py-4 border-2 border-black font-bold transition-colors ${
              !file || (!topText && !botText) ? "opacity-40 cursor-not-allowed bg-black/10 text-black"
              : processing ? "bg-black/60 text-white cursor-wait"
              : "bg-black text-white hover:bg-white hover:text-black"
            }`}>
            {processing ? "⏳ Generating Meme…" : "Generate Meme →"}
          </button>
        </div>

        {/* RIGHT: Preview */}
        <div className="space-y-4">
          {resultUrl ? (
            <div className="border-2 border-black rounded-lg overflow-hidden">
              <div className="flex justify-between items-center px-3 py-2 border-b-2 border-black bg-black">
                <span className="font-mono text-xs font-bold text-white uppercase">Your Meme 😂</span>
                <span className="font-mono text-xs text-white/50">{resultBlob && formatSize(resultBlob.size)}</span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resultUrl} alt="meme" className="w-full object-contain bg-black/5" />
              <div className="px-3 py-2">
                <button onClick={() => resultBlob && file && downloadBlob(resultBlob, `${file.name.replace(/\.[^.]+$/, "")}_meme.jpg`)}
                  className="w-full font-mono text-xs uppercase tracking-widest py-2.5 bg-black text-white border-2 border-black hover:bg-white hover:text-black transition-colors">
                  ↓ Download Meme
                </button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-black/20 rounded-lg p-10 text-center">
              <p className="font-mono text-2xl mb-3">🤣</p>
              <p className="font-mono text-xs text-black/30">
                Upload image, add top/bottom text, click Generate
              </p>
            </div>
          )}

          {/* Popular meme text ideas */}
          <div className="border border-black/10 rounded-lg p-3">
            <p className="font-mono text-xs uppercase tracking-widest text-black/25 mb-2">Quick text ideas</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                ["When you", "And it works"],
                ["Nobody:", "Me at 3am:"],
                ["Expectation", "Reality"],
                ["Me:", "Also me:"],
              ].map(([top, bot], i) => (
                <button key={i}
                  onClick={() => { setTopText(top); setBotText(bot); }}
                  className="font-mono text-xs border border-black/15 px-2 py-1 hover:bg-black hover:text-white hover:border-black transition-colors">
                  {top} / {bot}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
