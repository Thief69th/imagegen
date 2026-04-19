// Utility functions for imagegen.online

/**
 * Format bytes to human-readable string
 */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Download a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Get output file extension based on process options and original file
 */
export function getOutputExt(
  outputFormat: string | undefined,
  fileType: string
): string {
  if (outputFormat === "png" || outputFormat === "__circle") return "png";
  if (outputFormat === "webp") return "webp";
  if (outputFormat === "jpg" || outputFormat === "jpeg") return "jpg";
  
  // Default: keep original
  if (fileType === "image/png") return "png";
  if (fileType === "image/webp") return "webp";
  return "jpg";
}

/**
 * Generate a unique ID for file entries
 */
export function generateFileId(file: File): string {
  return `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Check if a file is a supported image type
 */
export function isSupportedImage(file: File): boolean {
  return (
    file.type.startsWith("image/") ||
    /\.(heic|heif|tiff?|gif)$/i.test(file.name)
  );
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Debounce a function call
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Calculate percentage reduction
 */
export function calculateReduction(original: number, result: number): number {
  if (original <= 0) return 0;
  return Math.round(((original - result) / original) * 100);
}
