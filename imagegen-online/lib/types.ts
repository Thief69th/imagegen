// Centralized type definitions for imagegen.online

// Tool metadata types
export type ToolGroup =
  | "compress"
  | "compress-target"
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
  | "complex"
  | "metadata"
  | "palette"
  | "lossless"
  | "safezone";

export type EffectType = "grayscale" | "invert" | "sepia" | "blur-bg" | "noise" | "edge" | "remove-border";

export type FitMode = "stretch" | "contain" | "cover";

export type TextPosition = 
  | "top-left" | "top-center-h" | "top-right"
  | "center-v" | "center" | "center-right"
  | "bottom-left" | "bottom-center-h" | "bottom-right";

export type ProcessingStatus = "idle" | "processing" | "done" | "error";

export interface ResizePreset {
  label: string;
  width: number;
  height: number;
}

export interface ToolMeta {
  group: ToolGroup;
  label: string;
  description: string;
  adjustFilter?: string;
  adjustMin?: number;
  adjustMax?: number;
  adjustDefault?: number;
  adjustUnit?: string;
  effectType?: EffectType;
  convertFrom?: string;
  convertTo?: string;
  resizePreset?: ResizePreset;
  bulk?: boolean;
}

// Tool definition types
export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
}

// SEO data types
export interface FAQ {
  q: string;
  a: string;
}

export interface ToolSEOData {
  slug: string;
  title: string;
  shortTitle: string;
  category: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  howTo: string[];
  faqs: FAQ[];
  relatedSlugs: string[];
  searchVolume: "low" | "medium" | "high";
}

// File processing types
export interface ProcessOptions {
  targetWidth?: number;
  targetHeight?: number;
  maintainRatio?: boolean;
  fit?: FitMode;
  angle?: number;
  flipH?: boolean;
  flipV?: boolean;
  cssFilter?: string;
  sharpenAmount?: number;
  effect?: EffectType;
  squareBg?: string;
  borderSize?: number;
  borderColor?: string;
  cropX?: number;
  cropY?: number;
  cropW?: number;
  cropH?: number;
  text?: string;
  fontSize?: number;
  fontColor?: string;
  fontOpacity?: number;
  textX?: number;
  textY?: number;
  textPosition?: TextPosition;
  fontFamily?: string;
  outputFormat?: "jpg" | "png" | "webp" | "__circle";
  quality?: number;
  lossless?: boolean;
  removeMetadata?: boolean;
  safeZoneOverlay?: boolean;
}

export interface FileEntry {
  id: string;
  file: File;
  preview: string;
  name: string;
  originalSize: number;
  resultBlob?: Blob;
  resultPreview?: string;
  resultSize?: number;
  status: ProcessingStatus;
}

export interface UniversalImageToolProps {
  toolId: string;
}

export interface ToolSettingsState {
  resizeW: string;
  resizeH: string;
  maintainRatio: boolean;
  fit: FitMode;
  angle: number;
  flipH: boolean;
  flipV: boolean;
  adjustVal: number;
  sharpenAmount: number;
  quality: number;
  squareBg: string;
  borderSize: number;
  borderColor: string;
  cropX: number;
  cropY: number;
  cropW: string;
  cropH: string;
  textVal: string;
  textSize: number;
  textColor: string;
  textOpacity: number;
  textPos: TextPosition;
  convertFmt: "jpg" | "png" | "webp";
}
