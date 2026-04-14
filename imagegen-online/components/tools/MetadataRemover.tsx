"use client";

import { useState, useRef, useCallback } from "react";
import { formatSize, downloadBlob } from "@/lib/canvasUtils";

interface MetaInfo {
  key: string;
  value: string;
}

function readExifStrings(file: File): Promise<MetaInfo[]> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const buf = e.target?.result as ArrayBuffer;
      if (!buf) { resolve([]); return; }
      const view = new DataView(buf);
      const results: MetaInfo[] = [];

      // Check JPEG marker
      if (view.getUint16(0) !== 0xFFD8) { resolve(results); return; }

      // Scan for APP1 (Exif) marker: 0xFFE1
      let offset = 2;
      while (offset < buf.byteLength - 4) {
        const marker = view.getUint16(offset);
        const length = view.getUint16(offset + 2);
        if (marker === 0xFFE1) {
          // Check for "Exif" header
          const exifHeader = String.fromCharCode(
            view.getUint8(offset + 4), view.getUint8(offset + 5),
            view.getUint8(offset + 6), view.getUint8(offset + 7)
          );
          if (exifHeader === "Exif") {
            results.push({ key: "EXIF Data", value: `${length} bytes of camera/location metadata` });
          }
        }
        if (marker === 0xFFE0) results.push({ key: "JFIF Header", value: "JPEG File Interchange Format info" });
        if (marker === 0xFFEE) results.push({ key: "Adobe Marker", value: "Adobe color profile info" });
        if (marker === 0xFFED) results.push({ key: "IPTC Data", value: "Copyright and caption metadata" });
        if (marker === 0xFFDA) break; // Start of scan
        offset += 2 + length;
      }

      if (results.length === 0) {
        results.push({ key: "No EXIF Found", value: "Image may already be clean or is not a JPEG" });
      }
      resolve(results);
    };
    reader.onerror = () => resolve([]);
    reader.readAsArrayBuffer(file.slice(0, 65536)); // Read only first 64KB
  });
}

async function stripMetadata(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      // Canvas toBlob always strips all EXIF — this is the metadata removal
      const isPng = file.type === "image/png";
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
        isPng ? "image/png" : "image/jpeg",
        isPng ? undefined : 0.95
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Load failed")); };
    img.src = url;
  });
}

export default function MetadataRemover() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [metaInfo, setMetaInfo] = useState<MetaInfo[]>([]);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [isDrag, setIsDrag] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResultBlob(null);
    setDone(false);
    const info = await readExifStrings(f);
    setMetaInfo(info);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDrag(false);
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith("image/")) handleFile(f);
  };

  const handleProcess = async () => {
    if (!file || processing) return;
    setProcessing(true);
    try {
      const blob = await stripMetadata(file);
      setResultBlob(blob);
      setDone(true);
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const ext = file.type === "image/png" ? "png" : "jpg";
    const base = file.name.replace(/\.[^.]+$/, "");
    downloadBlob(resultBlob, `${base}_clean.${ext}`);
  };

  return (
    <div className="fade-in-up">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="font-mono font-bold text-xl md:text-2xl tracking-tight">Remove Image Metadata</h2>
          <p className="text-sm text-black/50 mt-1">Strip EXIF data, GPS location, camera info — 100% private, browser-based.</p>
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
                <div className="w-12 h-12 border-2 border-black rounded-full flex items-center justify-center text-xl">🔒</div>
                <p className="font-mono font-bold text-sm">Drop Image Here</p>
                <p className="text-xs text-black/40">All image formats supported</p>
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
                <button onClick={() => { setFile(null); setPreview(null); setResultBlob(null); setDone(false); setMetaInfo([]); }}
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

        {/* Right: Metadata info + result */}
        <div className="flex flex-col gap-4">
          {/* Metadata found */}
          {metaInfo.length > 0 && (
            <div className="border-2 border-black rounded-lg overflow-hidden">
              <div className="px-3 py-2 border-b-2 border-black bg-black/[0.02]">
                <p className="font-mono text-xs font-bold uppercase">Metadata Detected</p>
              </div>
              <div className="divide-y divide-black/10">
                {metaInfo.map((m, i) => (
                  <div key={i} className="flex items-start gap-3 px-3 py-2">
                    <span className="text-xs mt-0.5 flex-shrink-0">
                      {m.key === "No EXIF Found" ? "✓" : "⚠"}
                    </span>
                    <div>
                      <p className="font-mono text-xs font-bold">{m.key}</p>
                      <p className="font-mono text-xs text-black/50">{m.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info box */}
          <div className="border border-black/20 px-3 py-3 bg-black/[0.02]">
            <p className="font-mono text-xs text-black/60 leading-relaxed">
              🔒 <strong>Your privacy:</strong> EXIF data can contain GPS coordinates, device model, serial number, timestamps, and software info. Removing it before sharing protects your location and identity.
            </p>
          </div>

          {/* Process button */}
          {!done ? (
            <button onClick={handleProcess} disabled={processing || !file}
              className={`w-full font-mono text-sm uppercase tracking-widest py-4 border-2 border-black font-bold transition-colors ${
                !file ? "opacity-40 cursor-not-allowed bg-black/10 text-black"
                : processing ? "bg-black/60 text-white cursor-wait"
                : "bg-black text-white hover:bg-white hover:text-black"
              }`}>
              {processing ? "⏳ Stripping Metadata…" : "Strip All Metadata →"}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="border-2 border-black px-4 py-3 bg-black/[0.02]">
                <p className="font-mono text-xs font-bold">✓ All metadata removed</p>
                {file && resultBlob && (
                  <p className="font-mono text-xs text-black/50 mt-1">
                    {formatSize(file.size)} → {formatSize(resultBlob.size)}
                    {file.size > resultBlob.size && <span className="ml-1">({formatSize(file.size - resultBlob.size)} saved)</span>}
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={handleDownload}
                  className="flex-1 font-mono text-sm uppercase tracking-widest py-4 border-2 border-black font-bold bg-black text-white hover:bg-white hover:text-black transition-colors">
                  ↓ Download Clean Image
                </button>
                <button onClick={() => { setDone(false); setResultBlob(null); }}
                  className="font-mono text-sm px-4 py-4 border-2 border-black hover:bg-black hover:text-white transition-colors">
                  ↺
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
