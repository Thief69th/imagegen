// lib/canvasUtils.ts
import { ProcessingOptions } from './types';

export async function resizeImage(
  canvas: HTMLCanvasElement, 
  options: ProcessingOptions
): Promise<HTMLCanvasElement> {
  const { width, height, maintainAspectRatio = true } = options;
  const img = canvas.getContext('2d')?.getImageData(0, 0, canvas.width, canvas.height);
  if (!img) return canvas;

  let newWidth = width || canvas.width;
  let newHeight = height || canvas.height;

  if (maintainAspectRatio && width && !height) {
    newHeight = Math.round((canvas.height / canvas.width) * width);
  } else if (maintainAspectRatio && height && !width) {
    newWidth = Math.round((canvas.width / canvas.height) * height);
  }

  const newCanvas = document.createElement('canvas');
  newCanvas.width = newWidth;
  newCanvas.height = newHeight;
  const ctx = newCanvas.getContext('2d');
  
  if (ctx) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(canvas, 0, 0, newWidth, newHeight);
  }
  
  return newCanvas;
}

export async function convertImage(
  canvas: HTMLCanvasElement, 
  options: ProcessingOptions
): Promise<HTMLCanvasElement> {
  // Conversion is handled by toBlob() format parameter
  // This function can apply format-specific adjustments if needed
  return canvas;
}

export async function compressImage(
  canvas: HTMLCanvasElement, 
  options: ProcessingOptions
): Promise<HTMLCanvasElement> {
  // Compression is handled by toBlob() quality parameter
  return canvas;
}

export async function applyEffects(
  canvas: HTMLCanvasElement, 
  options: ProcessingOptions
): Promise<HTMLCanvasElement> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const { brightness = 100, contrast = 100, saturation = 100, grayscale = false, blur = 0 } = options;
  
  // Create offscreen canvas for effects
  const offscreen = document.createElement('canvas');
  offscreen.width = canvas.width;
  offscreen.height = canvas.height;
  const offCtx = offscreen.getContext('2d');
  if (!offCtx) return canvas;

  // Copy original
  offCtx.drawImage(canvas, 0, 0);

  // Apply CSS-like filters
  const filters = [];
  if (brightness !== 100) filters.push(`brightness(${brightness}%)`);
  if (contrast !== 100) filters.push(`contrast(${contrast}%)`);
  if (saturation !== 100) filters.push(`saturate(${saturation}%)`);
  if (grayscale) filters.push('grayscale(100%)');
  if (blur) filters.push(`blur(${blur}px)`);
  
  if (filters.length > 0) {
    ctx.filter = filters.join(' ');
    ctx.drawImage(offscreen, 0, 0);
    ctx.filter = 'none';
  }

  return canvas;
}

export function createCanvasFromImage(file: File): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        resolve(canvas);
      } else {
        reject(new Error('Canvas context not available'));
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}
