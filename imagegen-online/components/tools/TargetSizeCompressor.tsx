"use client";

import { useState, useRef, useCallback } from "react";
import { downloadBlob, formatSize } from "@/lib/canvasUtils";

interface SizePreset { label: string; bytes: number; tag?: string; }

const PRESETS: SizePreset[] = [
  { label: "10 KB",  bytes: 10240,   tag: "Icon/Avatar" },
  { label: "20 KB",  bytes: 20480 },
  { label: "30 KB",  bytes: 30720 },
  { label: "40 KB",  bytes: 40960 },
  { label: "50 KB",  bytes: 51200,   tag: "WhatsApp" },
  { label: "60 KB",  bytes: 61440 },
  { label: "70 KB",  bytes: 71680 },
  { label: "80 KB",  bytes: 81920 },
  { label: "90 KB",  bytes: 92160 },
  { label: "100 KB", bytes: 102400,  tag: "Web fast" },
  { label: "150 KB", bytes: 153600 },
  { label: "200 KB", bytes: 204800,  tag: "Email" },
  { label: "300 KB", bytes: 307200 },
  { label: "500 KB", bytes: 512000,  tag: "Blog" },
  { label: "1 MB",   bytes: 1048576, tag: "Print" },
  { label: "2 MB",   bytes: 2097152 },
  { label: "5 MB",   bytes: 5242880 },
];

function loadImg(file: File): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => { URL.revokeObjectURL(url); res(img); };
    img.onerror = () => { URL.revokeObjectURL(url); rej(); };
    img.src = url;
  });
}

function canvasBlob(canvas: HTMLCanvasElement, q: number): Promise<Blob> {
  return new Promise((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej()), "image/jpeg", q / 100)
  );
}

function drawCanvas(img: HTMLImageElement, scale: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width  = Math.round(img.naturalWidth  * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

async function compressToTarget(
  file: File, targetBytes: number, onPct: (n: number) => void
): Promise<{ blob: Blob; quality: number; attempts: number }> {
  const img = await loadImg(file);
  onPct(8);
  const fullCanvas = drawCanvas(img, 1);
  const minBlob = await canvasBlob(fullCanvas, 1);

  if (minBlob.size <= targetBytes) {
    let lo = 1, hi = 95, best = minBlob, bestQ = 1, attempts = 0;
    while (lo <= hi && attempts < 16) {
      const mid = Math.floor((lo + hi) / 2);
      const blob = await canvasBlob(fullCanvas, mid);
      attempts++;
      onPct(8 + Math.round((attempts / 16) * 82));
      if (blob.size <= targetBytes) { best = blob; bestQ = mid; lo = mid + 1; }
      else { hi = mid - 1; }
    }
    onPct(95);
    return { blob: best, quality: bestQ, attempts };
  }

  const scales = [0.85, 0.7, 0.55, 0.45, 0.35, 0.25, 0.18, 0.12, 0.08];
  let attempts = 0;
  for (const scale of scales) {
    attempts++;
    onPct(8 + attempts * 9);
    const canvas = drawCanvas(img, scale);
    let lo = 1, hi = 85, best: Blob | null = null, bestQ = 1;
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      const blob = await canvasBlob(canvas, mid);
      if (blob.size <= targetBytes) { best = blob; bestQ = mid; lo = mid + 1; }
      else { hi = mid - 1; }
    }
    if (best) { onPct(96); return { blob: best, quality: bestQ, attempts }; }
  }
  const tiny = drawCanvas(img, 0.05);
  const blob = await canvasBlob(tiny, 1);
  return { blob, quality: 1, attempts };
}

interface Result {
  bytes: number; label: string; blob: Blob;
  quality: number; attempts: number; status: "done" | "error";
}

function ResultThumb({ blob, label }: { blob: Blob; label: string }) {
  const [url] = useState(() => URL.createObjectURL(blob));
  return (
    <div className="mt-2 flex items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={label} className="w-12 h-12 object-cover border border-black/20 flex-shrink-0" />
      <p className="font-mono text-xs text-black/40">Preview — {label}</p>
    </div>
  );
}

export default function TargetSizeCompressor() {
  const [file, setFile]     = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [isDrag, setIsDrag] = useState(false);
  const [selected, setSelected] = useState<number[]>([10240, 51200, 102400, 204800]);
  const [customKB, setCustomKB] = useState("");
  const [customMB, setCustomMB] = useState("");
  const [progress, setProgress] = useState<Record<number, number>>({});
  const [results, setResults] = useState<Result[]>([]);
  const [processing, setProcessing] = useState(false);
  const [globalDone, setGlobalDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback((fl: FileList | null) => {
    if (!fl || !fl[0]) return;
    const f = fl[0];
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));
    setResults([]); setProgress({}); setGlobalDone(false);
  }, [preview]);

  const isSelected = (bytes: number) => selected.includes(bytes);

  const toggle = (bytes: number) => {
    setSelected((p) => p.includes(bytes) ? p.filter((x) => x !== bytes) : [...p, bytes]);
    setResults([]); setGlobalDone(false);
  };

  const addKB = () => {
    const kb = parseFloat(customKB); if (!kb || kb <= 0) return;
    const bytes = Math.round(kb * 1024);
    setSelected((p) => p.includes(bytes) ? p : [...p, bytes]);
    setCustomKB(""); setResults([]); setGlobalDone(false);
  };

  const addMB = () => {
    const mb = parseFloat(customMB); if (!mb || mb <= 0) return;
    const bytes = Math.round(mb * 1024 * 1024);
    setSelected((p) => p.includes(bytes) ? p : [...p, bytes]);
    setCustomMB(""); setResults([]); setGlobalDone(false);
  };

  const getLabel = (bytes: number) =>
    PRESETS.find((p) => p.bytes === bytes)?.label ??
    (bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`);

  const sorted = [...selected].sort((a, b) => a - b);

  const handleProcess = async () => {
    if (!file || selected.length === 0) return;
    setProcessing(true); setResults([]); setGlobalDone(false); setProgress({});
    const list: Result[] = [];
    for (const bytes of sorted) {
      setProgress((p) => ({ ...p, [bytes]: 5 }));
      try {
        const { blob, quality, attempts } = await compressToTarget(file, bytes,
          (pct) => setProgress((p) => ({ ...p, [bytes]: pct }))
        );
        list.push({ bytes, label: getLabel(bytes), blob, quality, attempts, status: "done" });
        setProgress((p) => ({ ...p, [bytes]: 100 }));
      } catch {
        list.push({ bytes, label: getLabel(bytes), blob: new Blob(), quality: 0, attempts: 0, status: "error" });
      }
      setResults([...list]);
    }
    setProcessing(false); setGlobalDone(true);
  };

  const dlOne = (r: Result) => {
    const base = file?.name.replace(/\.[^.]+$/, "") ?? "image";
    downloadBlob(r.blob, `${base}_${r.label.replace(/\s/g, "")}.jpg`);
  };

  const dlAll = async () => {
    const done = results.filter((r) => r.status === "done");
    if (!done.length) return;
    if (done.length === 1) { dlOne(done[0]); return; }
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const base = file?.name.replace(/\.[^.]+$/, "") ?? "image";
      done.forEach((r) => zip.file(`${base}_${r.label.replace(/\s/g, "")}.jpg`, r.blob));
      const zb = await zip.generateAsync({ type: "blob" });
      downloadBlob(zb, `${base}_sizes.zip`);
    } catch { done.forEach((r, i) => setTimeout(() => dlOne(r), i * 300)); }
  };

  return (
    <div className="fade-in-up">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="font-mono font-bold text-xl md:text-2xl tracking-tight">Compress Image to Exact Size</h2>
          <p className="text-sm text-black/50 mt-1">
            Choose target sizes — 10KB to 5MB or custom — get images compressed to exactly that file size.
          </p>
        </div>
        <span className="font-mono text-xs border-2 border-black px-2 py-1 flex-shrink-0">FREE</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                <div className="w-12 h-12 border-2 border-black rounded-full flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <p className="font-mono font-bold text-sm">Drop Image Here</p>
                <p className="text-xs text-black/40">JPG, PNG, WEBP supported</p>
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
                <button onClick={() => { setFile(null); setPreview(""); setResults([]); setProgress({}); setGlobalDone(false); }}
                  className="font-mono text-xs text-black/40 hover:text-black">Change Image</button>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="source" className="w-full object-contain max-h-44 bg-black/5" />
              <div className="px-3 py-2">
                <p className="font-mono text-xs font-bold truncate">{file.name}</p>
                <p className="font-mono text-xs text-black/40">Size: <strong className="text-black">{formatSize(file.size)}</strong></p>
              </div>
            </div>
          )}

          <div className={`border-2 border-black rounded-lg p-4 space-y-4 ${!file ? "opacity-40 pointer-events-none" : ""}`}>
            <p className="font-mono text-xs uppercase tracking-widest text-black/40">Select Target Sizes</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button key={p.bytes} onClick={() => toggle(p.bytes)}
                  className={`font-mono text-xs px-3 py-2 border-2 border-black transition-colors leading-tight ${isSelected(p.bytes) ? "bg-black text-white" : "hover:bg-black hover:text-white"}`}>
                  <span className="block font-bold">{p.label}</span>
                  {p.tag && <span className={`block text-xs ${isSelected(p.bytes) ? "opacity-50" : "opacity-40"}`}>{p.tag}</span>}
                </button>
              ))}
            </div>

            <div>
              <p className="font-mono text-xs text-black/40 mb-1.5">Add Custom Size</p>
              <div className="flex gap-2 mb-2">
                <div className="flex flex-1 border-2 border-black overflow-hidden">
                  <input type="number" placeholder="e.g. 45" value={customKB}
                    onChange={(e) => setCustomKB(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addKB()}
                    className="flex-1 font-mono text-sm px-3 py-2 focus:outline-none bg-white" min={1} />
                  <span className="font-mono text-xs px-2 flex items-center bg-black/5 border-l border-black text-black/40">KB</span>
                </div>
                <button onClick={addKB} disabled={!customKB}
                  className="font-mono text-xs uppercase px-3 py-2 border-2 border-black bg-black text-white hover:bg-white hover:text-black transition-colors disabled:opacity-30">
                  + Add
                </button>
              </div>
              <div className="flex gap-2">
                <div className="flex flex-1 border-2 border-black overflow-hidden">
                  <input type="number" placeholder="e.g. 1.5" value={customMB}
                    onChange={(e) => setCustomMB(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addMB()}
                    className="flex-1 font-mono text-sm px-3 py-2 focus:outline-none bg-white" min={0.1} step={0.1} />
                  <span className="font-mono text-xs px-2 flex items-center bg-black/5 border-l border-black text-black/40">MB</span>
                </div>
                <button onClick={addMB} disabled={!customMB}
                  className="font-mono text-xs uppercase px-3 py-2 border-2 border-black bg-black text-white hover:bg-white hover:text-black transition-colors disabled:opacity-30">
                  + Add
                </button>
              </div>
            </div>

            {sorted.length > 0 && (
              <div>
                <p className="font-mono text-xs text-black/30 mb-1.5">Selected ({sorted.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {sorted.map((bytes) => (
                    <span key={bytes} className="font-mono text-xs border-2 border-black px-2 py-1 flex items-center gap-1.5">
                      {getLabel(bytes)}
                      <button onClick={() => toggle(bytes)} className="text-black/40 hover:text-black">✕</button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button onClick={handleProcess}
            disabled={!file || selected.length === 0 || processing}
            className={`w-full font-mono text-sm uppercase tracking-widest py-4 border-2 border-black font-bold transition-colors ${
              !file || selected.length === 0 ? "opacity-40 cursor-not-allowed bg-black/10 text-black"
              : processing ? "bg-black/60 text-white cursor-wait"
              : "bg-black text-white hover:bg-white hover:text-black"
            }`}>
            {processing
              ? `Processing ${results.length}/${sorted.length}...`
              : `Compress to ${sorted.length} Size${sorted.length !== 1 ? "s" : ""}`}
          </button>
        </div>

        <div className="space-y-3">
          {sorted.length > 0 ? (
            <div className="border-2 border-black rounded-lg overflow-hidden">
              <div className="px-4 py-2 border-b-2 border-black bg-black/[0.02] flex justify-between items-center">
                <p className="font-mono text-xs uppercase tracking-widest font-bold">Results</p>
                {globalDone && results.filter(r => r.status==="done").length > 1 && (
                  <button onClick={dlAll}
                    className="font-mono text-xs bg-black text-white px-3 py-1 border border-black hover:bg-white hover:text-black transition-colors">
                    Download All ZIP
                  </button>
                )}
              </div>
              <div className="divide-y divide-black/10">
                {sorted.map((bytes) => {
                  const label = getLabel(bytes);
                  const pct = progress[bytes] ?? 0;
                  const result = results.find((r) => r.bytes === bytes);
                  const isActive = processing && pct > 0 && pct < 100 && !result;
                  return (
                    <div key={bytes} className="px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-sm">{label}</span>
                            {PRESETS.find(p => p.bytes === bytes)?.tag && (
                              <span className="font-mono text-xs text-black/30 border border-black/10 px-1.5 py-0.5">
                                {PRESETS.find(p => p.bytes === bytes)?.tag}
                              </span>
                            )}
                          </div>
                          {isActive && (
                            <div className="mt-1.5">
                              <div className="h-1.5 w-full bg-black/10 overflow-hidden">
                                <div className="h-full bg-black transition-all duration-200" style={{ width: `${pct}%` }} />
                              </div>
                              <p className="font-mono text-xs text-black/40 mt-1">Searching quality… {pct}%</p>
                            </div>
                          )}
                          {result?.status === "done" && (
                            <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                              <span className="font-mono text-xs text-black/50">
                                Actual: <strong className="text-black">{formatSize(result.blob.size)}</strong>
                              </span>
                              <span className="font-mono text-xs text-black/50">
                                Quality: <strong className="text-black">{result.quality}%</strong>
                              </span>
                              {file && (
                                <span className="font-mono text-xs text-black/50">
                                  Saved: <strong className="text-black">
                                    {Math.round((1 - result.blob.size / file.size) * 100)}%
                                  </strong>
                                </span>
                              )}
                            </div>
                          )}
                          {!isActive && !result && (
                            <p className="font-mono text-xs text-black/20 mt-0.5">Queued…</p>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          {result?.status === "done" && (
                            <button onClick={() => dlOne(result)}
                              className="font-mono text-xs px-3 py-2 border-2 border-black bg-black text-white hover:bg-white hover:text-black transition-colors">
                              Download
                            </button>
                          )}
                          {result?.status === "error" && <span className="font-mono text-xs text-black/30">Failed</span>}
                          {isActive && <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin inline-block" />}
                        </div>
                      </div>
                      {result?.status === "done" && <ResultThumb blob={result.blob} label={label} />}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-black/20 rounded-lg p-10 text-center">
              <p className="font-mono text-xs text-black/30">Select target sizes on the left, then compress</p>
            </div>
          )}

          <div className="border border-black/10 rounded-lg p-4">
            <p className="font-mono text-xs uppercase tracking-widest text-black/25 mb-2">How it works</p>
            <ul className="space-y-1.5">
              {[
                "Binary search on quality (1–95%) — up to 16 iterations per size",
                "If quality alone isn't enough, also downscales image dimensions",
                "Shows actual achieved size + quality level used",
                "All processing in your browser — nothing uploaded to any server",
              ].map((tip, i) => (
                <li key={i} className="font-mono text-xs text-black/40 flex gap-2">
                  <span className="text-black/20 flex-shrink-0">→</span>{tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
