// Add these types if missing
export type ToolType = 'compress' | 'resize' | 'convert' | 'rotate' | 'flip' | 'effects' | 'remove-background' | 'merge-images' | 'split-image' | 'collage-maker' | 'add-watermark' | 'social-media' | 'compress-bulk' | 'resize-percentage' | 'heic-to-jpg' | 'crop';

export interface ProcessingOptions {
  width?: number;
  height?: number;
  scale?: number;
  quality?: number;
  format?: string;
  rotation?: number;
  flipX?: boolean;
  flipY?: boolean;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  grayscale?: boolean;
  blur?: number;
  maintainAspectRatio?: boolean;
  [key: string]: any;
}

export interface ImageFile {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: number;
  type: string;
  width: number;
  height: number;
  loading: boolean;
  error?: string;
}
