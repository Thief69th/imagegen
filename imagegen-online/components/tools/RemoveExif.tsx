"use client";

import { useState, useRef, useCallback } from "react";
import { downloadBlob, formatSize } from "@/lib/canvasUtils";

export default function RemoveExif() {
  const [file, setFile]         = useState<File | null>(null);
  const [preview, setPreview]   = useState("");
  const [isDrag, setIsDrag]     = useState(false);
  const [processing, setProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl]   = useState("");
  const [format, setFormat]     = useState<"jpg" | "png" | "webp">("jpg");
  const [quality, setQuality]   = useState(95);
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

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      // Re-encoding via Canvas strips ALL EXIF/metadata
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
      canvas.getContext("2d")!.drawImage(img, 0, 0);
      const mime = format === "png" ? "image/png" : format === "webp" ? "image/webp" : "image/jpeg";
      const q = format === "png" ? undefined : quality / 100;
      const blob = await new Promise<Blob>((res, rej) =>
        canvas.toBlob((b) => b ? res(b) : rej(), mime, q)
      );
      const url = URL.createObjectURL(blob);
      setResultBlob(blob);
      setResultUrl(url);
    } catch (e) { console.error(e); }
    setProcessing(false);
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const base = file.name.replace(/\.[^.]+$/, "");
    downloadBlob(resultBlob, `${base}_no_metadata.${format}`);
  };

  const savedBytes = file && resultBlob ? file.size - resultBlob.size : 0;

  return (
    <div className="fade-in-up">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="font-mono font-bold text-xl md:text-2xl tracking-tight">Remove EXIF Data from Image</h2>
          <p className="text-sm text-black/50 mt-1">
            Strip GPS location, camera model, date, and all metadata from photos to protect your privacy.
          </p>
        </div>
        <span className="font-mono text-xs border-2 border-black px-2 py-1 flex-shrink-0">FREE</span>
      </div>

      {/* What is EXIF */}
      <div className="border border-black/10 rounded-lg p-4 mb-5 bg-black/[0.02]">
        <p className="font-mono text-xs uppercase tracking-widest text-black/30 mb-2">What EXIF data contains</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { icon: "📍", label: "GPS Location", sub: "Exact lat/lon coords" },
            { icon: "📷", label: "Camera Model", sub: "Make & model" },
            { icon: "🕐", label: "Date & Time", sub: "When photo was taken" },
            { icon: "⚙️", label: "Settings", sub: "ISO, shutter, f-stop" },
          ].map((item) => (
            <div key={item.label} className="border border-black/10 rounded p-2 text-center">
              <p className="text-lg mb-1">{item.icon}</p>
              <p className="font-mono text-xs font-bold">{item.label}</p>
              <p className="font-mono text-xs text-black/40">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {!file ? (
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
                <div className="w-12 h-12 border-2 border-black rounded-full flex items-center justify-center text-lg">🔒</div>
                <p className="font-mono font-bold text-sm">Drop Photo Here</p>
                <p className="text-xs text-black/40">JPG photos from phones contain the most EXIF data</p>
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
                <span className="font-mono text-xs font-bold uppercase">Photo with EXIF</span>
                <button onClick={() => { setFile(null); setPreview(""); setResultBlob(null); setResultUrl(""); }}
                  className="font-mono text-xs text-black/40 hover:text-black">✕ Change</button>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="original" className="w-full object-contain max-h-44 bg-black/5" />
              <div className="px-3 py-2 flex justify-between">
                <div>
                  <p className="font-mono text-xs font-bold truncate">{file.name}</p>
                  <p className="font-mono text-xs text-black/40">{formatSize(file.size)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Settings */}
          <div className={`border-2 border-black rounded-lg p-4 space-y-3 ${!file ? "opacity-40 pointer-events-none" : ""}`}>
            <p className="font-mono text-xs uppercase tracking-widest text-black/40">Output Settings</p>
            <div>
              <p className="font-mono text-xs text-black/50 mb-2">Output Format</p>
              <div className="flex gap-2">
                {(["jpg", "png", "webp"] as const).map((f) => (
                  <button key={f} onClick={() => setFormat(f)}
                    className={`font-mono text-xs uppercase px-3 py-2 border-2 border-black hover:bg-black hover:text-white transition-colors ${format === f ? "bg-black text-white" : ""}`}>
                    .{f}
                  </button>
                ))}
              </div>
            </div>
            {format !== "png" && (
              <div>
                <p className="font-mono text-xs text-black/50 mb-1">Quality — <strong className="text-black">{quality}%</strong></p>
                <input type="range" min={60} max={100} value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))} className="w-full" />
              </div>
            )}
          </div>

          <button onClick={handleProcess} disabled={!file || processing}
            className={`w-full font-mono text-sm uppercase tracking-widest py-4 border-2 border-black font-bold transition-colors ${
              !file ? "opacity-40 cursor-not-allowed bg-black/10 text-black"
              : processing ? "bg-black/60 text-white cursor-wait"
              : "bg-black text-white hover:bg-white hover:text-black"
            }`}>
            {processing ? "⏳ Removing EXIF Data…" : "Remove All EXIF Data →"}
          </button>
        </div>

        <div className="space-y-4">
          {resultUrl && resultBlob && (
            <>
              <div className="border-2 border-black rounded-lg overflow-hidden">
                <div className="flex justify-between items-center px-3 py-2 border-b-2 border-black bg-black">
                  <span className="font-mono text-xs font-bold text-white uppercase">✓ EXIF Removed</span>
                  <span className="font-mono text-xs text-white/50">{formatSize(resultBlob.size)}</span>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={resultUrl} alt="clean" className="w-full object-contain max-h-44 bg-black/5" />
                <div className="px-3 py-3 space-y-2">
                  {savedBytes > 0 && (
                    <p className="font-mono text-xs text-black/50">
                      Metadata removed: <strong className="text-black">{formatSize(savedBytes)}</strong> stripped
                    </p>
                  )}
                  <button onClick={handleDownload}
                    className="w-full font-mono text-xs uppercase tracking-widest py-2.5 bg-black text-white border-2 border-black hover:bg-white hover:text-black transition-colors">
                    ↓ Download Clean Image
                  </button>
                </div>
              </div>

              <div className="border-2 border-black rounded-lg p-4 bg-black text-white">
                <p className="font-mono text-xs font-bold uppercase mb-2">✓ What was removed</p>
                <div className="grid grid-cols-2 gap-1">
                  {["GPS Coordinates", "Camera Make/Model", "Date & Time", "Exposure Settings", "Lens Info", "Software Used", "Copyright Info", "Thumbnail Data"].map((item) => (
                    <p key={item} className="font-mono text-xs text-white/60 flex items-center gap-1">
                      <span className="text-white">✓</span> {item}
                    </p>
                  ))}
                </div>
              </div>
            </>
          )}

          {!resultUrl && (
            <div className="border-2 border-dashed border-black/20 rounded-lg p-8 text-center">
              <p className="font-mono text-xs text-black/30">Upload a photo and click Remove EXIF</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
