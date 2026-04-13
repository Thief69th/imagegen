"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { downloadBlob, formatSize } from "@/lib/canvasUtils";

type BgOption = "transparent" | "white" | "black" | "custom" | "blur";

// Declare global type for the library loaded via CDN
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    imgly?: any;
  }
}

export default function RemoveBackgroundTool() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string>("");
  const [isDrag, setIsDrag] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading-lib" | "loading-model" | "processing" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [bgOption, setBgOption] = useState<BgOption>("transparent");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [libReady, setLibReady] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Load the library dynamically on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.imgly) { setLibReady(true); return; }

    const script = document.createElement("script");
    script.type = "module";
    script.innerHTML = `
      import { removeBackground } from "https://esm.run/@imgly/background-removal";
      window._removeBackground = removeBackground;
      window.dispatchEvent(new Event('imgly-ready'));
    `;
    const onReady = () => setLibReady(true);
    window.addEventListener("imgly-ready", onReady, { once: true });
    document.head.appendChild(script);
    return () => {
      window.removeEventListener("imgly-ready", onReady);
    };
  }, []);

  const addFile = useCallback((fl: FileList | null) => {
    if (!fl || fl.length === 0) return;
    const f = fl[0];
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));
    setResultBlob(null);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl("");
    setStatus("idle");
    setErrorMsg("");
  }, [preview, resultUrl]);

  const applyBackground = async (fgBlob: Blob): Promise<Blob> => {
    if (bgOption === "transparent") return fgBlob;
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(fgBlob);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d")!;

        if (bgOption === "blur") {
          const orig = new Image();
          orig.onload = () => {
            ctx.filter = "blur(20px)";
            ctx.drawImage(orig, 0, 0, canvas.width, canvas.height);
            ctx.filter = "none";
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);
            canvas.toBlob((b) => b ? resolve(b) : reject(), "image/png");
          };
          orig.onerror = () => reject();
          orig.src = preview;
          return;
        }
        ctx.fillStyle = bgOption === "white" ? "#ffffff" : bgOption === "black" ? "#000000" : bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        canvas.toBlob((b) => b ? resolve(b) : reject(), "image/png");
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(); };
      img.src = url;
    });
  };

  const handleProcess = async () => {
    if (!file) return;
    // Try to load the library if not already loaded
    if (!(window as Window & { _removeBackground?: unknown })._removeBackground) {
      setStatus("loading-lib");
      setProgress(10);
      await new Promise<void>((res) => {
        const check = setInterval(() => {
          if ((window as Window & { _removeBackground?: unknown })._removeBackground) { clearInterval(check); res(); }
        }, 200);
        setTimeout(() => { clearInterval(check); res(); }, 15000);
      });
    }
    const removeBg = (window as Window & { _removeBackground?: (f: File, opts?: unknown) => Promise<Blob> })._removeBackground;
    if (!removeBg) {
      setStatus("error");
      setErrorMsg("Library failed to load. Check your internet connection and try again.");
      return;
    }

    setStatus("processing");
    setProgress(30);
    setErrorMsg("");

    try {
      const result: Blob = await removeBg(file, {
        progress: (key: string, current: number, total: number) => {
          if (total > 0) setProgress(Math.round(30 + (current / total) * 60));
        },
      });
      setProgress(95);
      const finalBlob = await applyBackground(result);
      const url = URL.createObjectURL(finalBlob);
      setResultBlob(finalBlob);
      setResultUrl(url);
      setStatus("done");
      setProgress(100);
    } catch (e: unknown) {
      setStatus("error");
      setErrorMsg(e instanceof Error ? e.message : "Processing failed.");
    }
  };

  const statusMessages: Record<string, string> = {
    "loading-lib": "Loading AI library from CDN…",
    "loading-model": "Loading AI model…",
    "processing": "Removing background…",
    "done": "Background removed!",
  };

  return (
    <div className="fade-in-up">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="font-mono font-bold text-xl md:text-2xl tracking-tight">Remove Background</h2>
          <p className="text-sm text-black/50 mt-1">
            AI-powered background removal — runs in your browser. First run downloads model (~5MB).
          </p>
        </div>
        <span className="font-mono text-xs border-2 border-black px-2 py-1 flex-shrink-0">AI</span>
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
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <p className="font-mono font-bold text-sm">Drop Image Here</p>
                <p className="text-xs text-black/40">Best results with portraits and product photos</p>
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
                <button onClick={() => { setFile(null); setPreview(""); setResultBlob(null); setResultUrl(""); setStatus("idle"); }}
                  className="font-mono text-xs text-black/40 hover:text-black">✕ Change</button>
              </div>
              <div className="aspect-video bg-[repeating-conic-gradient(#e0e0e0_0%_25%,#fff_0%_50%)] bg-[length:16px_16px] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="original" className="w-full h-full object-contain" />
              </div>
              <div className="px-3 py-2">
                <p className="font-mono text-xs truncate">{file.name}</p>
                <p className="font-mono text-xs text-black/40">{formatSize(file.size)}</p>
              </div>
            </div>
          )}

          {/* Background Options */}
          <div className={`border-2 border-black rounded-lg p-4 ${!file ? "opacity-40 pointer-events-none" : ""}`}>
            <p className="font-mono text-xs uppercase tracking-widest text-black/40 mb-3">New Background</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {([
                { val: "transparent", label: "Transparent (PNG)" },
                { val: "white", label: "White" },
                { val: "black", label: "Black" },
                { val: "blur", label: "Blurred Original" },
                { val: "custom", label: "Custom Color" },
              ] as { val: BgOption; label: string }[]).map((opt) => (
                <button key={opt.val} onClick={() => setBgOption(opt.val)}
                  className={`font-mono text-xs px-3 py-2 border-2 border-black hover:bg-black hover:text-white transition-colors text-left ${bgOption === opt.val ? "bg-black text-white" : ""}`}>
                  {bgOption === opt.val ? "✓ " : ""}{opt.label}
                </button>
              ))}
            </div>
            {bgOption === "custom" && (
              <div className="flex items-center gap-3">
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
                  className="w-12 h-10 border-2 border-black cursor-pointer" />
                <span className="font-mono text-xs">{bgColor}</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          {status !== "idle" && (
            <div className="border-2 border-black rounded-lg p-4">
              <div className="flex justify-between font-mono text-xs mb-2">
                <span className="text-black/60">{statusMessages[status] ?? ""}</span>
                <span className="font-bold">{status !== "error" ? `${progress}%` : "✗"}</span>
              </div>
              {status !== "error" && status !== "done" && (
                <div className="h-1.5 w-full bg-black/10 overflow-hidden">
                  <div className="h-full bg-black transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              )}
              {status === "error" && <p className="text-xs text-black/50 mt-1">{errorMsg}</p>}
            </div>
          )}

          <button onClick={handleProcess}
            disabled={!file || status === "processing" || status === "loading-lib" || status === "loading-model"}
            className={`w-full font-mono text-sm uppercase tracking-widest py-4 border-2 border-black font-bold transition-colors ${
              !file ? "opacity-40 cursor-not-allowed bg-black/10 text-black"
              : (status === "processing" || status === "loading-lib") ? "bg-black/60 text-white cursor-wait"
              : "bg-black text-white hover:bg-white hover:text-black"
            }`}>
            {status === "loading-lib" ? "⏳ Loading Library…"
              : status === "processing" ? "⏳ Removing Background…"
              : "Remove Background →"}
          </button>

          <p className="font-mono text-xs text-black/30 text-center">
            {libReady ? "✓ AI library ready" : "Library loads on first use (~5MB from CDN)"}
          </p>

          {resultUrl && (
            <div className="border-2 border-black rounded-lg overflow-hidden">
              <div className="flex justify-between items-center px-3 py-2 border-b-2 border-black bg-black">
                <span className="font-mono text-xs font-bold uppercase text-white">Result</span>
                <span className="font-mono text-xs text-white/60">{resultBlob && formatSize(resultBlob.size)}</span>
              </div>
              <div className="aspect-video bg-[repeating-conic-gradient(#e0e0e0_0%_25%,#fff_0%_50%)] bg-[length:16px_16px] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={resultUrl} alt="result" className="w-full h-full object-contain" />
              </div>
              <div className="px-3 py-2">
                <button
                  onClick={() => { if (resultBlob && file) downloadBlob(resultBlob, `${file.name.replace(/\.[^.]+$/, "")}_no_bg.png`); }}
                  className="w-full font-mono text-xs uppercase tracking-widest py-2 bg-black text-white border-2 border-black hover:bg-white hover:text-black transition-colors">
                  ↓ Download PNG
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
