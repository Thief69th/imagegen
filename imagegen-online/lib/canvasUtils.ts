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
  effect?: "grayscale" | "invert" | "sepia";
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
  if (opts.effect === "grayscale" && file.name.includes("__circle")) {
    // handled below
  }
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
    ctx.filter = "grayscale(100%)";
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
