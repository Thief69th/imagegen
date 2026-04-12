"use client";

import { useState, useRef, useCallback } from "react";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function MultiImageCompressor() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [compression, setCompression] = useState<"low" | "medium" | "high">("medium");
  const [quality, setQuality] = useState(75);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const newImages: ImageFile[] = [];
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const preview = URL.createObjectURL(file);
      newImages.push({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        preview,
        name: file.name,
        size: formatSize(file.size),
      });
    });
    setImages((prev) => [...prev, ...newImages]);
    setProcessed(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const removeImage = (id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter((i) => i.id !== id);
    });
  };

  const handleCompress = async () => {
    if (images.length === 0) return;
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1500));
    setProcessing(false);
    setProcessed(true);
  };

  return (
    <div className="fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2
            className="font-mono font-bold text-xl md:text-2xl tracking-tight"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Multi Image Compressor
          </h2>
          <p className="text-sm text-black/60 mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Upload multiple images and compress them in one click.
          </p>
        </div>
        <span className="hidden sm:block font-mono text-xs border border-black px-2 py-1 text-black/50">
          FREE
        </span>
      </div>

      {/* Upload Box */}
      <div
        className={`border-2 border-dashed border-black rounded-lg p-8 md:p-12 text-center cursor-pointer transition-colors ${isDragging ? "bg-black/5" : "bg-white hover:bg-black/[0.02]"}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-2 border-black rounded-full flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <div>
            <p className="font-mono font-bold text-sm md:text-base tracking-tight">
              Drag &amp; Drop Images Here
            </p>
            <p className="text-xs text-black/40 mt-1">PNG, JPG, WEBP, GIF, TIFF supported</p>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-black/30">OR</span>
          </div>
          <button
            type="button"
            className="font-mono text-xs uppercase tracking-widest bg-black text-white px-5 py-2.5 border-2 border-black hover:bg-white hover:text-black transition-colors"
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
          >
            Select Multiple Images
          </button>
        </div>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs uppercase tracking-widest text-black/50">
              {images.length} image{images.length !== 1 ? "s" : ""} selected
            </span>
            <button
              onClick={() => { images.forEach((i) => URL.revokeObjectURL(i.preview)); setImages([]); setProcessed(false); }}
              className="font-mono text-xs text-black/40 hover:text-black underline transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((img) => (
              <div key={img.id} className="border-2 border-black rounded-lg overflow-hidden relative group">
                <div className="aspect-square bg-black/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.preview} alt={img.name} className="img-thumb" />
                </div>
                <div className="p-2 bg-white">
                  <p className="font-mono text-xs truncate font-bold" title={img.name}>
                    {img.name}
                  </p>
                  <p className="font-mono text-xs text-black/40">{img.size}</p>
                </div>
                <button
                  onClick={() => removeImage(img.id)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-black text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-black border border-black"
                  aria-label="Remove image"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className={`mt-6 border-2 border-black rounded-lg p-5 ${images.length === 0 ? "opacity-40 pointer-events-none" : ""}`}>
        <p className="font-mono text-xs uppercase tracking-widest mb-4 text-black/50">Compression Settings</p>

        {/* Level */}
        <div className="mb-5">
          <label className="font-mono text-xs uppercase tracking-widest text-black/60 block mb-2">
            Compression Level
          </label>
          <div className="flex gap-4">
            {(["low", "medium", "high"] as const).map((level) => (
              <label key={level} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="compression"
                  value={level}
                  checked={compression === level}
                  onChange={() => setCompression(level)}
                  className="w-4 h-4"
                />
                <span className="font-mono text-xs uppercase tracking-widest capitalize">{level}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Quality Slider */}
        <div className="mb-5">
          <label className="font-mono text-xs uppercase tracking-widest text-black/60 block mb-2">
            Quality — <span className="text-black font-bold">{quality}%</span>
          </label>
          <input
            type="range"
            min={1}
            max={100}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between font-mono text-xs text-black/30 mt-1">
            <span>Smallest</span>
            <span>Best Quality</span>
          </div>
        </div>

        {/* Resize */}
        <div className="mb-5">
          <label className="font-mono text-xs uppercase tracking-widest text-black/60 block mb-2">
            Resize (optional)
          </label>
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="number"
                placeholder="Width (px)"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="w-full border-2 border-black px-3 py-2 font-mono text-sm focus:outline-none"
              />
            </div>
            <div className="flex items-center font-mono text-black/30">×</div>
            <div className="flex-1">
              <input
                type="number"
                placeholder="Height (px)"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full border-2 border-black px-3 py-2 font-mono text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Process Button */}
        <button
          onClick={handleCompress}
          disabled={processing || images.length === 0}
          className={`w-full font-mono text-sm uppercase tracking-widest py-3.5 border-2 border-black transition-colors font-bold ${
            processing
              ? "bg-black/30 text-white cursor-wait"
              : processed
              ? "bg-white text-black hover:bg-black hover:text-white"
              : "bg-black text-white hover:bg-white hover:text-black"
          }`}
        >
          {processing
            ? "⏳ Processing..."
            : processed
            ? `✓ Download ${images.length} Compressed Image${images.length !== 1 ? "s" : ""}`
            : `Compress All ${images.length > 0 ? `(${images.length})` : ""} Images`}
        </button>
        {processed && (
          <p className="font-mono text-xs text-center text-black/40 mt-2">
            ✓ Demo mode — integrate with a server-side compression API for production
          </p>
        )}
      </div>
    </div>
  );
}
