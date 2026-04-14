export interface ProcessOptions {
  // resize
  targetWidth?: number;
  targetHeight?: number;
  maintainRatio?: boolean;
  fit?: "stretch" | "contain" | "cover";
  // rotate
  angle?: number;
  // flip
  flipH?: boolean;
  flipV?: boolean;
  // css filter adjust
  cssFilter?: string;
  // sharpen
  sharpenAmount?: number;
  // effect
  effect?: "grayscale" | "invert" | "sepia" | "remove-border";
  // square
  squareBg?: string;
  // circle
  // border
  borderSize?: number;
  borderColor?: string;
  // crop
  cropX?: number;
  cropY?: number;
  cropW?: number;
  cropH?: number;
  // text / watermark
  text?: string;
  fontSize?: number;
  fontColor?: string;
  fontOpacity?: number;
  textX?: number;
  textY?: number;
  textPosition?: string;
  fontFamily?: string;
  // convert
  outputFormat?: string; // "jpg" | "png" | "webp"
  quality?: number; // 1–100
  // lossless: force PNG output at 100% (no quality loss)
  lossless?: boolean;
  // metadata removal: re-encode to strip EXIF (canvas already strips it)
  removeMetadata?: boolean;
  // safe zone overlay for stories
  safeZoneOverlay?: boolean;
}

// ─── Load image from File ───────────────────────────────────────────────────
export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image load failed")); };
    img.src = url;
  });
}

// ─── Apply convolution kernel (for sharpen/edge) ────────────────────────────
function applyConvolution(ctx: CanvasRenderingContext2D, w: number, h: number, kernel: number[], divisor = 1) {
  const src = ctx.getImageData(0, 0, w, h);
  const dst = ctx.createImageData(w, h);
  const s = src.data;
  const d = dst.data;
  const side = Math.round(Math.sqrt(kernel.length));
  const half = Math.floor(side / 2);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dstOff = (y * w + x) * 4;
      let r = 0, g = 0, b = 0;
      for (let ky = 0; ky < side; ky++) {
        for (let kx = 0; kx < side; kx++) {
          const sy = Math.min(h - 1, Math.max(0, y + ky - half));
          const sx = Math.min(w - 1, Math.max(0, x + kx - half));
          const srcOff = (sy * w + sx) * 4;
          const wt = kernel[ky * side + kx];
          r += s[srcOff] * wt;
          g += s[srcOff + 1] * wt;
          b += s[srcOff + 2] * wt;
        }
      }
      d[dstOff] = Math.min(255, Math.max(0, r / divisor));
      d[dstOff + 1] = Math.min(255, Math.max(0, g / divisor));
      d[dstOff + 2] = Math.min(255, Math.max(0, b / divisor));
      d[dstOff + 3] = s[dstOff + 3];
    }
  }
  ctx.putImageData(dst, 0, 0);
}

// ─── Master process function ────────────────────────────────────────────────
export async function processImage(file: File, opts: ProcessOptions): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  const origW = img.naturalWidth;
  const origH = img.naturalHeight;

  // ── Crop ──────────────────────────────────────────────────
  if (opts.cropW && opts.cropH) {
    const cx = opts.cropX ?? 0;
    const cy = opts.cropY ?? 0;
    const cw = Math.min(opts.cropW, origW - cx);
    const ch = Math.min(opts.cropH, origH - cy);
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, cx, cy, cw, ch, 0, 0, cw, ch);
    return toBlob(canvas, opts);
  }

  // ── Resize ─────────────────────────────────────────────────
  if (opts.targetWidth || opts.targetHeight) {
    let tw = opts.targetWidth ?? origW;
    let th = opts.targetHeight ?? origH;

    if (opts.maintainRatio !== false && opts.targetWidth && opts.targetHeight) {
      const fit = opts.fit ?? "contain";
      const scale = fit === "cover"
        ? Math.max(tw / origW, th / origH)
        : Math.min(tw / origW, th / origH);
      tw = Math.round(origW * scale);
      th = Math.round(origH * scale);
    } else if (opts.maintainRatio !== false && opts.targetWidth && !opts.targetHeight) {
      th = Math.round(origH * (opts.targetWidth / origW));
    } else if (opts.maintainRatio !== false && opts.targetHeight && !opts.targetWidth) {
      tw = Math.round(origW * (opts.targetHeight / origH));
    }

    canvas.width = tw;
    canvas.height = th;
    const ctx = canvas.getContext("2d")!;
    if (opts.cssFilter) ctx.filter = opts.cssFilter;
    ctx.drawImage(img, 0, 0, tw, th);
    if (opts.effect === "invert") invertPixels(ctx, tw, th);
    return toBlob(canvas, opts);
  }

  // ── Rotate ─────────────────────────────────────────────────
  if (opts.angle !== undefined && opts.angle !== 0) {
    const rad = (opts.angle * Math.PI) / 180;
    const sin = Math.abs(Math.sin(rad));
    const cos = Math.abs(Math.cos(rad));
    const newW = Math.round(origW * cos + origH * sin);
    const newH = Math.round(origW * sin + origH * cos);
    canvas.width = newW;
    canvas.height = newH;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, newW, newH);
    ctx.translate(newW / 2, newH / 2);
    ctx.rotate(rad);
    ctx.drawImage(img, -origW / 2, -origH / 2, origW, origH);
    return toBlob(canvas, opts);
  }

  // ── Flip ───────────────────────────────────────────────────
  if (opts.flipH || opts.flipV) {
    canvas.width = origW;
    canvas.height = origH;
    const ctx = canvas.getContext("2d")!;
    ctx.translate(opts.flipH ? origW : 0, opts.flipV ? origH : 0);
    ctx.scale(opts.flipH ? -1 : 1, opts.flipV ? -1 : 1);
    ctx.drawImage(img, 0, 0);
    return toBlob(canvas, opts);
  }

  // ── Square maker ───────────────────────────────────────────
  if (opts.squareBg !== undefined) {
    const size = Math.max(origW, origH);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = opts.squareBg || "#ffffff";
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(img, Math.round((size - origW) / 2), Math.round((size - origH) / 2), origW, origH);
    return toBlob(canvas, { ...opts, outputFormat: "jpg" });
  }

  // ── Circle maker ───────────────────────────────────────────
  const isCircle = opts.outputFormat === "__circle";
  if (isCircle) {
    const size = Math.min(origW, origH);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, -(origW - size) / 2, -(origH - size) / 2, origW, origH);
    return toBlob(canvas, { outputFormat: "png", quality: 100 });
  }

  // ── Border ────────────────────────────────────────────────
  if (opts.borderSize !== undefined) {
    const b = opts.borderSize;
    canvas.width = origW + b * 2;
    canvas.height = origH + b * 2;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = opts.borderColor || "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, b, b, origW, origH);
    return toBlob(canvas, opts);
  }

  // ── Text / Watermark ─────────────────────────────────────
  if (opts.text) {
    canvas.width = origW;
    canvas.height = origH;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    const fs = opts.fontSize ?? Math.round(origW * 0.05);
    ctx.font = `bold ${fs}px ${opts.fontFamily ?? "Arial, sans-serif"}`;
    ctx.globalAlpha = (opts.fontOpacity ?? 70) / 100;
    ctx.fillStyle = opts.fontColor ?? "#ffffff";
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 4;
    const metrics = ctx.measureText(opts.text);
    const pad = 20;
    let tx = pad, ty = pad + fs;
    const pos = opts.textPosition ?? "bottom-right";
    if (pos.includes("right")) tx = origW - metrics.width - pad;
    if (pos.includes("center-h")) tx = (origW - metrics.width) / 2;
    if (pos.includes("bottom")) ty = origH - pad;
    if (pos.includes("center-v")) ty = origH / 2;
    ctx.fillText(opts.text, tx, ty);
    ctx.globalAlpha = 1;
    return toBlob(canvas, opts);
  }

  // ── Sharpen ──────────────────────────────────────────────
  if (opts.sharpenAmount !== undefined) {
    canvas.width = origW;
    canvas.height = origH;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    const a = opts.sharpenAmount ?? 1;
    const center = 1 + 4 * a;
    const side = -a;
    const kernel = [0, side, 0, side, center, side, 0, side, 0];
    applyConvolution(ctx, origW, origH, kernel);
    return toBlob(canvas, opts);
  }

  // ── Remove Border ─────────────────────────────────────────
  if (opts.effect === "remove-border") {
    canvas.width = origW;
    canvas.height = origH;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    const id = ctx.getImageData(0, 0, origW, origH);
    const d = id.data;
    const isBorderPixel = (x: number, y: number) => {
      const i = (y * origW + x) * 4;
      return d[i] > 230 && d[i+1] > 230 && d[i+2] > 230;
    };
    let top = 0, bottom = origH - 1, left = 0, right = origW - 1;
    while (top < origH && Array.from({length: origW}, (_,x) => isBorderPixel(x, top)).every(Boolean)) top++;
    while (bottom > top && Array.from({length: origW}, (_,x) => isBorderPixel(x, bottom)).every(Boolean)) bottom--;
    while (left < origW && Array.from({length: origH}, (_,y) => isBorderPixel(left, y)).every(Boolean)) left++;
    while (right > left && Array.from({length: origH}, (_,y) => isBorderPixel(right, y)).every(Boolean)) right--;
    const cropW = right - left + 1;
    const cropH = bottom - top + 1;
    const out = document.createElement("canvas");
    out.width = cropW; out.height = cropH;
    out.getContext("2d")!.drawImage(canvas, left, top, cropW, cropH, 0, 0, cropW, cropH);
    return toBlob(out, opts);
  }

  // ── Lossless (force PNG) ───────────────────────────────────
  if (opts.lossless) {
    canvas.width = origW;
    canvas.height = origH;
    canvas.getContext("2d")!.drawImage(img, 0, 0);
    return toBlob(canvas, { ...opts, outputFormat: "png", quality: 100 });
  }

  // ── CSS Filter adjust (blur, brightness, contrast, saturate) ─
  canvas.width = origW;
  canvas.height = origH;
  const ctx = canvas.getContext("2d")!;

  if (opts.cssFilter) {
    ctx.filter = opts.cssFilter;
  }
  ctx.drawImage(img, 0, 0);
  ctx.filter = "none";

  // ── Invert pixels ─────────────────────────────────────────
  if (opts.effect === "invert") {
    invertPixels(ctx, origW, origH);
  }

  // ── Grayscale pixels ──────────────────────────────────────
  if (opts.effect === "grayscale") {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = origW;
    tempCanvas.height = origH;
    const tCtx = tempCanvas.getContext("2d")!;
    tCtx.filter = "grayscale(100%)";
    tCtx.drawImage(img, 0, 0);
    ctx.filter = "none";
    ctx.clearRect(0, 0, origW, origH);
    ctx.drawImage(tempCanvas, 0, 0);
  }

  // ── Sepia ─────────────────────────────────────────────────
  if (opts.effect === "sepia") {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = origW;
    tempCanvas.height = origH;
    const tCtx = tempCanvas.getContext("2d")!;
    tCtx.filter = "sepia(100%)";
    tCtx.drawImage(img, 0, 0);
    ctx.clearRect(0, 0, origW, origH);
    ctx.drawImage(tempCanvas, 0, 0);
  }

  // ── Safe Zone Overlay (Instagram/Story) ───────────────────
  if (opts.safeZoneOverlay) {
    const zoneX = Math.round(origW * 0.083);
    const zoneY = Math.round(origH * 0.152);
    const zoneW = origW - zoneX * 2;
    const zoneH = origH - zoneY * 2;
    ctx.strokeStyle = "rgba(255,255,0,0.9)";
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 6]);
    ctx.strokeRect(zoneX, zoneY, zoneW, zoneH);
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, origW, zoneY);
    ctx.fillRect(0, origH - zoneY, origW, zoneY);
    ctx.fillStyle = "rgba(255,255,0,0.9)";
    ctx.font = `bold ${Math.round(origW * 0.03)}px Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("SAFE ZONE", origW / 2, zoneY - 10);
  }

  return toBlob(canvas, opts);
}

function invertPixels(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const id = ctx.getImageData(0, 0, w, h);
  for (let i = 0; i < id.data.length; i += 4) {
    id.data[i] = 255 - id.data[i];
    id.data[i + 1] = 255 - id.data[i + 1];
    id.data[i + 2] = 255 - id.data[i + 2];
  }
  ctx.putImageData(id, 0, 0);
}

function toBlob(canvas: HTMLCanvasElement, opts: ProcessOptions): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const fmt = opts.outputFormat === "png" ? "image/png"
      : opts.outputFormat === "webp" ? "image/webp"
      : "image/jpeg";
    const q = fmt === "image/png" ? undefined : (opts.quality ?? 90) / 100;
    canvas.toBlob(
      (blob) => { if (blob) resolve(blob); else reject(new Error("toBlob failed")); },
      fmt, q
    );
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function getOutputExt(opts: ProcessOptions, file: File): string {
  if (opts.outputFormat === "png" || opts.outputFormat === "__circle") return "png";
  if (opts.outputFormat === "webp") return "webp";
  if (opts.outputFormat === "jpg" || opts.outputFormat === "jpeg") return "jpg";
  // default: keep original
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ─── Color palette extraction ──────────────────────────────────────────────
export async function extractColorPalette(
  file: File,
  count = 8
): Promise<string[]> {
  const img = await loadImage(file);
  const size = 150; // downsample for speed
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);

  // Median-cut: bucket pixels into 8-bit quantized buckets
  const buckets: Map<string, number> = new Map();
  for (let i = 0; i < data.length; i += 4) {
    const r = Math.round(data[i] / 32) * 32;
    const g = Math.round(data[i + 1] / 32) * 32;
    const b = Math.round(data[i + 2] / 32) * 32;
    if (data[i + 3] < 128) continue; // skip transparent
    const key = `${r},${g},${b}`;
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  // Sort by frequency, deduplicate by minimum distance
  const sorted = Array.from(buckets.entries()).sort((a, b) => b[1] - a[1]);
  const palette: string[] = [];
  for (const [key] of sorted) {
    const [r, g, b] = key.split(",").map(Number);
    const hex = "#" + [r, g, b].map((v) => Math.min(255, v).toString(16).padStart(2, "0")).join("");
    // Ensure minimum perceptual distance from existing colors
    const tooClose = palette.some((existing) => {
      const er = parseInt(existing.slice(1, 3), 16);
      const eg = parseInt(existing.slice(3, 5), 16);
      const eb = parseInt(existing.slice(5, 7), 16);
      return Math.abs(er - r) < 40 && Math.abs(eg - g) < 40 && Math.abs(eb - b) < 40;
    });
    if (!tooClose) palette.push(hex);
    if (palette.length >= count) break;
  }
  return palette;
}

// ─── Binary-search compress to target size ─────────────────────────────────
export async function compressToTargetSize(
  file: File,
  targetKB: number
): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  canvas.getContext("2d")!.drawImage(img, 0, 0);

  const targetBytes = targetKB * 1024;
  let lo = 1, hi = 95, bestBlob: Blob | null = null;

  for (let iter = 0; iter < 10; iter++) {
    const mid = Math.round((lo + hi) / 2);
    const blob = await new Promise<Blob>((res, rej) =>
      canvas.toBlob(
        (b) => (b ? res(b) : rej(new Error("toBlob failed"))),
        "image/jpeg",
        mid / 100
      )
    );
    if (blob.size <= targetBytes) {
      bestBlob = blob;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
    if (lo > hi) break;
  }

  // If even quality=1 is too large, scale down
  if (!bestBlob) {
    const scaleCanvas = document.createElement("canvas");
    let scale = 0.9;
    while (scale > 0.1) {
      scaleCanvas.width = Math.round(img.naturalWidth * scale);
      scaleCanvas.height = Math.round(img.naturalHeight * scale);
      scaleCanvas.getContext("2d")!.drawImage(img, 0, 0, scaleCanvas.width, scaleCanvas.height);
      const blob = await new Promise<Blob>((res, rej) =>
        scaleCanvas.toBlob(
          (b) => (b ? res(b) : rej(new Error("toBlob failed"))),
          "image/jpeg",
          0.5
        )
      );
      if (blob.size <= targetBytes) { bestBlob = blob; break; }
      scale -= 0.1;
    }
  }

  if (!bestBlob) {
    // Return lowest quality as fallback
    return new Promise<Blob>((res, rej) =>
      canvas.toBlob((b) => (b ? res(b) : rej()), "image/jpeg", 0.01)
    );
  }
  return bestBlob;
}
