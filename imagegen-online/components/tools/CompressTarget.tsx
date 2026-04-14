"use client";

import { useState, useRef, useCallback } from "react";
import { compressToTargetSize, formatSize, downloadBlob } from "@/lib/canvasUtils";
import { getToolMeta } from "@/lib/toolConfigs";

interface CompressTargetProps {
  toolId: string;
}

export default function CompressTarget({ toolId }: CompressTargetProps) {
  const meta = getToolMeta(toolId);
  const defaultTarget =
    toolId === "compress-under-50kb" ? 50 :
    toolId === "compress-under-100kb" ? 100 : 200;

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultPreview, setResultPreview] = useState<string | null>(null);
  const [isDrag, setIsDrag] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [targetKB, setTargetKB] = useState(defaultTarget);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResultBlob(null);
    setResultPreview(null);
    setError(null);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDrag(false);
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith("image/")) handleFile(f);
  };

  const handleProcess = async () => {
    if (!file || processing) return;
    setProcessing(true);
    setError(null);
    try {
      const blob = await compressToTargetSize(file, targetKB);
      const rPreview = URL.createObjectURL(blob);
      setResultBlob(blob);
      setResultPreview(rPreview);
      if (blob.size > targetKB * 1024) {
        setError(`Best achievable: ${formatSize(blob.size)} — image may be too large to reach ${targetKB}KB without extreme downscaling.`);
      }
    } catch (e) {
      console.error(e);
      setError("Compression failed. Please try a different image.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const base = file.name.replace(/\.[^.]+$/, "");
    downloadBlob(resultBlob, `${base}_${targetKB}kb.jpg`);
  };

  return (
    <div className="fade-in-up">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="font-mono font-bold text-xl md:text-2xl tracking-tight">{meta.label}</h2>
          <p className="text-sm text-black/50 mt-1">{meta.description} — 100% browser-based, nothing uploaded.</p>
        </div>
        <span className="font-mono text-xs border-2 border-black px-2 py-1 flex-shrink-0">FREE</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Upload */}
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
                <div className="w-12 h-12 border-2 border-black rounded-full flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
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
                <span className="font-mono text-xs font-bold uppercase">Original</span>
                <button onClick={() => { setFile(null); setPreview(null); setResultBlob(null); setResultPreview(null); }}
                  className="font-mono text-xs text-black/40 hover:text-black">✕ Change</button>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview!} alt="original" className="w-full object-contain max-h-56 bg-black/5" />
              <div className="px-3 py-2 border-t border-black/10">
                <p className="font-mono text-xs truncate">{file.name}</p>
                <p className="font-mono text-xs text-black/40">{formatSize(file.size)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Settings + Result */}
        <div className="flex flex-col gap-4">
          <div className="border-2 border-black rounded-lg p-4">
            <p className="font-mono text-xs uppercase tracking-widest text-black/40 mb-4">Target Size</p>

            {/* Quick presets */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {[50, 100, 200, 500, 1000].map((kb) => (
                <button key={kb} onClick={() => setTargetKB(kb)}
                  className={`font-mono text-xs px-3 py-1.5 border-2 border-black hover:bg-black hover:text-white transition-colors ${targetKB === kb ? "bg-black text-white" : ""}`}>
                  {kb < 1000 ? `${kb}KB` : `${kb/1000}MB`}
                </button>
              ))}
            </div>

            <div>
              <p className="font-mono text-xs text-black/50 mb-1">Custom target — <strong>{targetKB}KB</strong></p>
              <input type="range" min={10} max={2000} value={targetKB}
                onChange={(e) => setTargetKB(Number(e.target.value))} className="w-full" />
              <div className="flex justify-between font-mono text-xs text-black/30 mt-1"><span>10KB</span><span>2MB</span></div>
            </div>

            <div className="border border-black/20 px-3 py-2 mt-3 bg-black/[0.02]">
              <p className="font-mono text-xs text-black/60">
                ⚡ Smart binary-search compression — finds the best quality that fits under <strong>{formatSize(targetKB * 1024)}</strong>
              </p>
            </div>
          </div>

          {/* Process button */}
          {!resultBlob ? (
            <button onClick={handleProcess} disabled={processing || !file}
              className={`w-full font-mono text-sm uppercase tracking-widest py-4 border-2 border-black font-bold transition-colors ${
                !file ? "opacity-40 cursor-not-allowed bg-black/10 text-black"
                : processing ? "bg-black/60 text-white cursor-wait"
                : "bg-black text-white hover:bg-white hover:text-black"
              }`}>
              {processing ? "⏳ Compressing…" : `Compress to Under ${targetKB}KB →`}
            </button>
          ) : (
            <div className="flex gap-3">
              <button onClick={handleDownload}
                className="flex-1 font-mono text-sm uppercase tracking-widest py-4 border-2 border-black font-bold bg-black text-white hover:bg-white hover:text-black transition-colors">
                ↓ Download Result
              </button>
              <button onClick={() => { setResultBlob(null); setResultPreview(null); setError(null); }}
                className="font-mono text-sm uppercase tracking-widest px-4 py-4 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors">
                ↺
              </button>
            </div>
          )}

          {error && (
            <div className="border-2 border-black/30 px-3 py-2 bg-black/[0.02]">
              <p className="font-mono text-xs text-black/60">⚠ {error}</p>
            </div>
          )}

          {/* Result preview */}
          {resultBlob && resultPreview && (
            <div className="border-2 border-black rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b-2 border-black bg-black">
                <span className="font-mono text-xs font-bold uppercase text-white">Result</span>
                <span className="font-mono text-xs text-white/80">
                  {formatSize(resultBlob.size)}
                  {resultBlob.size <= targetKB * 1024
                    ? <span className="ml-2 text-green-400">✓ Under {targetKB}KB</span>
                    : <span className="ml-2 text-yellow-400">⚠ Best possible</span>
                  }
                </span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resultPreview} alt="result" className="w-full object-contain max-h-56 bg-black/5" />
              {file && (
                <div className="px-3 py-2 border-t border-black/10 bg-black/[0.02]">
                  <p className="font-mono text-xs text-black/50">
                    {formatSize(file.size)} → {formatSize(resultBlob.size)} &nbsp;
                    <strong>({Math.round((1 - resultBlob.size / file.size) * 100)}% smaller)</strong>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
