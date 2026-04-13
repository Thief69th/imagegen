export type ToolGroup =
  | "compress"
  | "resize"
  | "rotate"
  | "flip"
  | "adjust"
  | "effect"
  | "convert"
  | "border"
  | "square"
  | "circle"
  | "crop"
  | "text"
  | "sharpen"
  | "complex";

export interface ResizePreset {
  label: string;
  width: number;
  height: number;
}

export interface ToolMeta {
  group: ToolGroup;
  label: string;
  description: string;
  adjustFilter?: string;   // CSS filter property name for adjust tools
  adjustMin?: number;
  adjustMax?: number;
  adjustDefault?: number;
  adjustUnit?: string;
  effectType?: "grayscale" | "invert" | "sepia" | "blur-bg" | "noise" | "edge";
  convertFrom?: string;
  convertTo?: string;
  resizePreset?: ResizePreset;
  bulk?: boolean;
}

export const TOOL_META: Record<string, ToolMeta> = {
  // ─── Compress ───────────────────────────────────────────
  "image-compressor":       { group: "compress",  label: "Image Compressor",          description: "Compress a single image with quality control", bulk: false },
  "bulk-image-compressor":  { group: "compress",  label: "Bulk Image Compressor",     description: "Compress multiple images at once", bulk: true },
  "reduce-image-size":      { group: "compress",  label: "Reduce Image Size",         description: "Shrink image file size", bulk: false },
  "compress-for-web":       { group: "compress",  label: "Compress for Web",          description: "Optimise images for fast web loading", bulk: true },
  "compress-for-email":     { group: "compress",  label: "Compress for Email",        description: "Reduce size for email attachments", bulk: true },
  "compress-for-social":    { group: "compress",  label: "Compress for Social Media", description: "Perfect sizes for social platforms", bulk: true },

  // ─── Resize ─────────────────────────────────────────────
  "image-resizer":          { group: "resize",    label: "Image Resizer",             description: "Resize image to exact dimensions" },
  "create-thumbnail":       { group: "resize",    label: "Create Thumbnail",          description: "Generate optimised image thumbnails", resizePreset: { label: "Thumbnail", width: 300, height: 300 } },
  "resize-instagram":       { group: "resize",    label: "Resize for Instagram",      description: "Square 1080×1080 for Instagram posts", resizePreset: { label: "Instagram", width: 1080, height: 1080 } },
  "resize-whatsapp":        { group: "resize",    label: "Resize for WhatsApp",       description: "Optimised for WhatsApp sharing", resizePreset: { label: "WhatsApp", width: 1600, height: 900 } },
  "resize-facebook":        { group: "resize",    label: "Resize for Facebook",       description: "Correct sizes for Facebook posts", resizePreset: { label: "Facebook Post", width: 1200, height: 630 } },
  "resize-website":         { group: "resize",    label: "Resize for Website",        description: "Web-ready image dimensions", resizePreset: { label: "Web Banner", width: 1920, height: 1080 } },
  "change-resolution":      { group: "resize",    label: "Change Image Resolution",   description: "Modify image pixel resolution" },
  "change-dpi":             { group: "resize",    label: "Change Image DPI",          description: "Adjust image DPI for print or web" },
  "batch-image-resize":     { group: "resize",    label: "Batch Image Resize",        description: "Resize many images at once", bulk: true },

  // ─── Rotate ─────────────────────────────────────────────
  "image-rotate":           { group: "rotate",    label: "Image Rotate",              description: "Rotate image by any angle" },

  // ─── Flip ───────────────────────────────────────────────
  "image-flip":             { group: "flip",      label: "Image Flip",                description: "Flip image horizontally or vertically" },
  "image-mirror":           { group: "flip",      label: "Image Mirror",              description: "Create mirror reflections of images" },

  // ─── Adjustments (slider) ───────────────────────────────
  "image-blur":             { group: "adjust",    label: "Image Blur",                description: "Apply blur effect", adjustFilter: "blur", adjustMin: 0, adjustMax: 20, adjustDefault: 5, adjustUnit: "px" },
  "image-brightness":       { group: "adjust",    label: "Brightness Adjust",         description: "Adjust brightness levels", adjustFilter: "brightness", adjustMin: 0, adjustMax: 200, adjustDefault: 100, adjustUnit: "%" },
  "contrast-adjust":        { group: "adjust",    label: "Contrast Adjust",           description: "Fine-tune contrast settings", adjustFilter: "contrast", adjustMin: 0, adjustMax: 200, adjustDefault: 100, adjustUnit: "%" },
  "saturation-adjust":      { group: "adjust",    label: "Saturation Adjust",         description: "Boost or reduce colour saturation", adjustFilter: "saturate", adjustMin: 0, adjustMax: 300, adjustDefault: 100, adjustUnit: "%" },
  "image-sharpen":          { group: "sharpen",   label: "Image Sharpen",             description: "Enhance sharpness and clarity", adjustMin: 0, adjustMax: 5, adjustDefault: 2 },
  "noise-reduction":        { group: "adjust",    label: "Noise Reduction",           description: "Reduce grain and noise", adjustFilter: "blur", adjustMin: 0, adjustMax: 3, adjustDefault: 1, adjustUnit: "px" },
  "edge-enhance":           { group: "adjust",    label: "Edge Enhance",              description: "Sharpen and define image edges", adjustFilter: "contrast", adjustMin: 100, adjustMax: 250, adjustDefault: 150, adjustUnit: "%" },

  // ─── Effects (no controls needed) ───────────────────────
  "grayscale":              { group: "effect",    label: "Convert to Grayscale",      description: "Turn colour images to black & white", effectType: "grayscale" },
  "color-invert":           { group: "effect",    label: "Color Invert",              description: "Invert all colours in an image", effectType: "invert" },
  "background-blur":        { group: "adjust",    label: "Background Blur",           description: "Blur background, keep subject", adjustFilter: "blur", adjustMin: 0, adjustMax: 15, adjustDefault: 6, adjustUnit: "px" },

  // ─── Conversion ─────────────────────────────────────────
  "png-to-jpg":             { group: "convert",   label: "PNG to JPG",                description: "Convert PNG to JPG format", convertFrom: "PNG", convertTo: "jpg" },
  "jpg-to-png":             { group: "convert",   label: "JPG to PNG",                description: "Convert JPG to PNG format", convertFrom: "JPG", convertTo: "png" },
  "jpg-to-webp":            { group: "convert",   label: "JPG to WEBP",               description: "Convert JPG to WEBP format", convertFrom: "JPG", convertTo: "webp" },
  "webp-to-jpg":            { group: "convert",   label: "WEBP to JPG",               description: "Convert WEBP to JPG format", convertFrom: "WEBP", convertTo: "jpg" },
  "png-to-webp":            { group: "convert",   label: "PNG to WEBP",               description: "Convert PNG to WEBP format", convertFrom: "PNG", convertTo: "webp" },
  "webp-to-png":            { group: "convert",   label: "WEBP to PNG",               description: "Convert WEBP to PNG format", convertFrom: "WEBP", convertTo: "png" },
  "gif-to-jpg":             { group: "convert",   label: "GIF to JPG",                description: "Convert GIF to JPG format", convertFrom: "GIF", convertTo: "jpg" },
  "gif-to-png":             { group: "convert",   label: "GIF to PNG",                description: "Convert GIF to PNG format", convertFrom: "GIF", convertTo: "png" },
  "tiff-to-jpg":            { group: "convert",   label: "TIFF to JPG",               description: "Convert TIFF to JPG format", convertFrom: "TIFF", convertTo: "jpg" },
  "heic-to-jpg":            { group: "convert",   label: "HEIC to JPG",               description: "Convert iPhone HEIC to JPG", convertFrom: "HEIC", convertTo: "jpg" },
  "batch-convert":          { group: "convert",   label: "Batch Image Convert",        description: "Convert many images between formats", bulk: true, convertTo: "jpg" },

  // ─── Shape tools ─────────────────────────────────────────
  "square-maker":           { group: "square",    label: "Square Image Maker",        description: "Convert image to perfect square" },
  "circle-maker":           { group: "circle",    label: "Circle Image Maker",        description: "Crop image into circle shape" },
  "add-border":             { group: "border",    label: "Add Border to Image",       description: "Add custom borders around images" },
  "remove-border":          { group: "effect",    label: "Remove Border",             description: "Auto-detect and remove image borders", effectType: "grayscale" },

  // ─── Crop ────────────────────────────────────────────────
  "image-crop":             { group: "crop",      label: "Image Crop",                description: "Crop images to any shape or ratio" },

  // ─── Text / Watermark ────────────────────────────────────
  "watermark":              { group: "text",      label: "Image Watermark",           description: "Add text or logo watermarks to images" },
  "add-text":               { group: "text",      label: "Add Text to Image",         description: "Overlay custom text onto images" },

  // ─── Complex (needs ML/server) ───────────────────────────
  "remove-background":      { group: "complex",   label: "Remove Background",         description: "Auto remove image background — requires AI API" },
  "merge-images":           { group: "complex",   label: "Merge Images",              description: "Combine multiple images into one" },
  "split-image":            { group: "complex",   label: "Split Image",               description: "Split one image into multiple parts" },
  "collage-maker":          { group: "complex",   label: "Collage Maker",             description: "Create beautiful image collages" },
};

export function getToolMeta(id: string): ToolMeta {
  return TOOL_META[id] ?? { group: "complex", label: id, description: "Tool coming soon" };
}
