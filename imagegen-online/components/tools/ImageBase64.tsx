"use client";

import { useState, useRef } from "react";
import { downloadBlob } from "@/lib/canvasUtils";

export default function ImageBase64() {
  const [mode, setMode] = useState<"img2b64" | "b642img">("img2b64");
  const [b64String, setB64String] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [copied, setCopied] = useState(false);
  const [isDrag, setIsDrag] = useState(false);
  const [b64Input, setB64Input] = useState("");
  const [decodePreview, setDecodePreview] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  /* Image → Base64 */
  const handleFile = (fl: FileList | null) => {
    if (!fl || !fl[0]) return;
    const f = fl[0];
    if (!f.type.startsWith("image/")) return;
    setFileName(f.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setB64String(result);
      setPreviewUrl(result);
    };
    reader.readAsDataURL(f);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(b64String).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCopyTag = () => {
    const tag = `<img src="${b64String}" alt="${fileName}" />`;
    navigator.clipboard.writeText(tag).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  /* Base64 → Image */
  const handleDecode = () => {
    const raw = b64Input.trim();
    if (!raw) return;
    // Add data URI prefix if missing
    const uri = raw.startsWith("data:") ? raw : `data:image/png;base64,${raw}`;
    setDecodePreview(uri);
  };

  const handleDownloadDecoded = () => {
    const raw = b64Input.trim();
    if (!raw) return;
    const uri = raw.startsWith("data:") ? raw : `data:image/png;base64,${raw}`;
    // Extract extension from data URI
    const mimeMatch = uri.match(/data:(image\/\w+);base64,/);
    const ext = mimeMatch ? mimeMatch[1].split("/")[1] : "png";
    // Convert to blob
    const base64Data = uri.split(",")[1];
    const bytes = atob(base64Data);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    const blob = new Blob([arr], { type: mimeMatch?.[1] ?? "image/png" });
    downloadBlob(blob, `decoded_image.${ext}`);
  };

  const b64Size = b64String
    ? Math.round((b64String.length * 3) / 4 / 1024)
    : 0;

  return (
    <div className="fade-in-up">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="font-mono font-bold text-xl md:text-2xl tracking-tight">Image ↔ Base64 Converter</h2>
          <p className="text-sm text-black/50 mt-1">
            Convert images to Base64 strings for web/CSS embedding, or decode Base64 back to downloadable images.
          </p>
        </div>
        <span className="font-mono text-xs border-2 border-black px-2 py-1 flex-shrink-0">FREE</span>
      </div>

      {/* Mode switcher */}
      <div className="flex gap-0 mb-6 border-2 border-black overflow-hidden">
        <button onClick={() => setMode("img2b64")}
          className={`flex-1 font-mono text-xs uppercase tracking-widest py-3 transition-colors ${mode === "img2b64" ? "bg-black text-white" : "hover:bg-black/5"}`}>
          Image → Base64
        </button>
        <button onClick={() => setMode("b642img")}
          className={`flex-1 font-mono text-xs uppercase tracking-widest py-3 border-l-2 border-black transition-colors ${mode === "b642img" ? "bg-black text-white" : "hover:bg-black/5"}`}>
          Base64 → Image
        </button>
      </div>

      {mode === "img2b64" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload */}
          <div className="space-y-4">
            <div
              className={`border-2 border-dashed border-black rounded-lg p-8 text-center cursor-pointer transition-colors ${isDrag ? "bg-black/5" : "hover:bg-black/[0.02]"}`}
              onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
              onDragLeave={() => setIsDrag(false)}
              onDrop={(e) => { e.preventDefault(); setIsDrag(false); handleFile(e.dataTransfer.files); }}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => handleFile(e.target.files)} />
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 border-2 border-black rounded-full flex items-center justify-center font-mono text-lg">B64</div>
                <p className="font-mono font-bold text-sm">Drop Image to Encode</p>
                <p className="text-xs text-black/40">Any image format — outputs Base64 data URI</p>
                <button type="button"
                  className="font-mono text-xs uppercase tracking-widest bg-black text-white px-5 py-2 border-2 border-black hover:bg-white hover:text-black transition-colors"
                  onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>
                  Select Image
                </button>
              </div>
            </div>
            {previewUrl && (
              <div className="border-2 border-black rounded-lg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="preview" className="w-full object-contain max-h-36 bg-black/5" />
              </div>
            )}
          </div>

          {/* Output */}
          <div className="space-y-3">
            {b64String ? (
              <>
                {/* Stats */}
                <div className="border-2 border-black rounded-lg p-3 bg-black/[0.02] flex gap-4 flex-wrap">
                  <div>
                    <p className="font-mono text-xs text-black/40">String length</p>
                    <p className="font-mono text-sm font-bold">{b64String.length.toLocaleString()} chars</p>
                  </div>
                  <div>
                    <p className="font-mono text-xs text-black/40">Approx size</p>
                    <p className="font-mono text-sm font-bold">~{b64Size} KB</p>
                  </div>
                  <div>
                    <p className="font-mono text-xs text-black/40">Format</p>
                    <p className="font-mono text-sm font-bold">{b64String.split(";")[0].split(":")[1]}</p>
                  </div>
                </div>

                {/* Base64 output */}
                <div className="border-2 border-black rounded-lg overflow-hidden">
                  <div className="flex justify-between items-center px-3 py-2 border-b-2 border-black bg-black/[0.02]">
                    <span className="font-mono text-xs font-bold uppercase">Base64 Data URI</span>
                    <button onClick={handleCopy}
                      className={`font-mono text-xs px-3 py-1 border border-black transition-colors ${copied ? "bg-black text-white" : "hover:bg-black hover:text-white"}`}>
                      {copied ? "✓ Copied!" : "Copy"}
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={b64String}
                    className="w-full h-28 font-mono text-xs p-3 bg-black/[0.01] resize-none focus:outline-none"
                  />
                </div>

                {/* CSS usage */}
                <div className="border border-black/10 rounded-lg p-3">
                  <p className="font-mono text-xs text-black/30 mb-2 uppercase tracking-widest">Use in code</p>
                  <div className="space-y-2">
                    <code className="block font-mono text-xs bg-black/5 p-2 rounded break-all">
                      {`background-image: url("${b64String.slice(0, 50)}…")`}
                    </code>
                    <div className="flex gap-2">
                      <button onClick={handleCopyTag}
                        className="font-mono text-xs px-3 py-1.5 border-2 border-black hover:bg-black hover:text-white transition-colors">
                        Copy &lt;img&gt; Tag
                      </button>
                      <button onClick={handleCopy}
                        className="font-mono text-xs px-3 py-1.5 border-2 border-black hover:bg-black hover:text-white transition-colors">
                        Copy Raw Base64
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="border-2 border-dashed border-black/20 rounded-lg p-10 text-center">
                <p className="font-mono text-xs text-black/30">Upload an image to see its Base64 string</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Base64 → Image decoder */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <p className="font-mono text-xs text-black/50 mb-2 uppercase tracking-widest">Paste Base64 String</p>
              <textarea
                value={b64Input}
                onChange={(e) => setB64Input(e.target.value)}
                placeholder={`Paste Base64 string here...\n\nAccepts:\n• Full data URI: data:image/png;base64,iVBOR...\n• Raw Base64: iVBORw0KGgo...`}
                className="w-full h-48 border-2 border-black p-3 font-mono text-xs focus:outline-none bg-white resize-none"
              />
            </div>
            <button onClick={handleDecode} disabled={!b64Input.trim()}
              className={`w-full font-mono text-sm uppercase tracking-widest py-4 border-2 border-black font-bold transition-colors ${
                !b64Input.trim() ? "opacity-40 cursor-not-allowed bg-black/10 text-black"
                : "bg-black text-white hover:bg-white hover:text-black"
              }`}>
              Decode Base64 →
            </button>
            <p className="font-mono text-xs text-black/30 text-center">
              Paste any Base64 image string — with or without data URI prefix
            </p>
          </div>
          <div className="space-y-3">
            {decodePreview ? (
              <div className="border-2 border-black rounded-lg overflow-hidden">
                <div className="flex justify-between items-center px-3 py-2 border-b-2 border-black bg-black">
                  <span className="font-mono text-xs font-bold text-white uppercase">Decoded Image</span>
                </div>
                <div className="bg-[repeating-conic-gradient(#e0e0e0_0%_25%,#fff_0%_50%)] bg-[length:16px_16px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={decodePreview} alt="decoded" className="w-full object-contain max-h-48" />
                </div>
                <div className="px-3 py-2">
                  <button onClick={handleDownloadDecoded}
                    className="w-full font-mono text-xs uppercase tracking-widest py-2.5 bg-black text-white border-2 border-black hover:bg-white hover:text-black transition-colors">
                    ↓ Download Image
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-black/20 rounded-lg p-10 text-center">
                <p className="font-mono text-xs text-black/30">Paste a Base64 string to decode it</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
