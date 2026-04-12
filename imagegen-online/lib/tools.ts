export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
}

export const TOOLS: Tool[] = [
  // Compression
  { id: "image-compressor", name: "Image Compressor", description: "Compress single images with quality control", category: "Compress" },
  { id: "bulk-image-compressor", name: "Bulk Image Compressor", description: "Compress multiple images at once", category: "Compress" },
  { id: "compress-for-web", name: "Compress for Web", description: "Optimise images for fast web loading", category: "Compress" },
  { id: "compress-for-email", name: "Compress for Email", description: "Reduce image size for email attachments", category: "Compress" },
  { id: "compress-for-social", name: "Compress for Social Media", description: "Perfect sizes for social platforms", category: "Compress" },
  { id: "reduce-image-size", name: "Reduce Image Size", description: "Shrink image file size without visible loss", category: "Compress" },

  // Resize
  { id: "image-resizer", name: "Image Resizer", description: "Resize images to exact dimensions", category: "Resize" },
  { id: "batch-image-resize", name: "Batch Image Resize", description: "Resize hundreds of images at once", category: "Resize" },
  { id: "create-thumbnail", name: "Create Thumbnail", description: "Generate optimised image thumbnails", category: "Resize" },
  { id: "resize-instagram", name: "Resize for Instagram", description: "Perfect dimensions for Instagram posts", category: "Resize" },
  { id: "resize-whatsapp", name: "Resize for WhatsApp", description: "Optimise images for WhatsApp sharing", category: "Resize" },
  { id: "resize-facebook", name: "Resize for Facebook", description: "Correct sizes for Facebook posts & covers", category: "Resize" },
  { id: "resize-website", name: "Resize for Website", description: "Web-ready image dimensions", category: "Resize" },
  { id: "change-dpi", name: "Change Image DPI", description: "Adjust image DPI for print or web", category: "Resize" },
  { id: "change-resolution", name: "Change Image Resolution", description: "Modify image pixel resolution", category: "Resize" },

  // Edit
  { id: "image-crop", name: "Image Crop", description: "Crop images to any shape or ratio", category: "Edit" },
  { id: "image-rotate", name: "Image Rotate", description: "Rotate images by any angle", category: "Edit" },
  { id: "image-flip", name: "Image Flip", description: "Flip images horizontally or vertically", category: "Edit" },
  { id: "image-mirror", name: "Image Mirror", description: "Create mirror reflections of images", category: "Edit" },
  { id: "image-blur", name: "Image Blur", description: "Apply Gaussian blur to images", category: "Edit" },
  { id: "image-sharpen", name: "Image Sharpen", description: "Enhance image sharpness and clarity", category: "Edit" },
  { id: "image-brightness", name: "Image Brightness Adjust", description: "Adjust brightness levels of images", category: "Edit" },
  { id: "contrast-adjust", name: "Contrast Adjust", description: "Fine-tune image contrast settings", category: "Edit" },
  { id: "saturation-adjust", name: "Saturation Adjust", description: "Boost or reduce colour saturation", category: "Edit" },
  { id: "noise-reduction", name: "Image Noise Reduction", description: "Remove grain and noise from photos", category: "Edit" },
  { id: "edge-enhance", name: "Image Edge Enhance", description: "Sharpen and define image edges", category: "Edit" },

  // Effects
  { id: "grayscale", name: "Convert to Grayscale", description: "Turn colour images to black & white", category: "Effects" },
  { id: "color-invert", name: "Color Invert", description: "Invert all colours in an image", category: "Effects" },
  { id: "background-blur", name: "Background Blur", description: "Blur image background, keep subject sharp", category: "Effects" },
  { id: "add-border", name: "Add Border to Image", description: "Add custom borders around images", category: "Effects" },
  { id: "remove-border", name: "Remove Border", description: "Detect and remove image borders", category: "Effects" },
  { id: "square-maker", name: "Square Image Maker", description: "Convert any image to perfect square", category: "Effects" },
  { id: "circle-maker", name: "Circle Image Maker", description: "Crop image into a circle shape", category: "Effects" },

  // Text & Watermark
  { id: "watermark", name: "Image Watermark", description: "Add text or logo watermarks to images", category: "Watermark" },
  { id: "add-text", name: "Add Text to Image", description: "Overlay custom text onto images", category: "Watermark" },
  { id: "remove-background", name: "Remove Background", description: "Auto remove image backgrounds", category: "Watermark" },

  // Convert
  { id: "png-to-jpg", name: "PNG to JPG", description: "Convert PNG images to JPG format", category: "Convert" },
  { id: "jpg-to-png", name: "JPG to PNG", description: "Convert JPG images to PNG format", category: "Convert" },
  { id: "jpg-to-webp", name: "JPG to WEBP", description: "Convert JPG images to WEBP format", category: "Convert" },
  { id: "webp-to-jpg", name: "WEBP to JPG", description: "Convert WEBP images to JPG format", category: "Convert" },
  { id: "png-to-webp", name: "PNG to WEBP", description: "Convert PNG images to WEBP format", category: "Convert" },
  { id: "webp-to-png", name: "WEBP to PNG", description: "Convert WEBP images to PNG format", category: "Convert" },
  { id: "gif-to-jpg", name: "GIF to JPG", description: "Extract GIF frames as JPG images", category: "Convert" },
  { id: "gif-to-png", name: "GIF to PNG", description: "Extract GIF frames as PNG images", category: "Convert" },
  { id: "heic-to-jpg", name: "HEIC to JPG", description: "Convert iPhone HEIC photos to JPG", category: "Convert" },
  { id: "tiff-to-jpg", name: "TIFF to JPG", description: "Convert TIFF images to JPG format", category: "Convert" },
  { id: "batch-convert", name: "Batch Image Convert", description: "Convert many images between formats", category: "Convert" },

  // Combine
  { id: "merge-images", name: "Merge Images", description: "Combine multiple images into one", category: "Combine" },
  { id: "split-image", name: "Split Image", description: "Split one image into multiple parts", category: "Combine" },
  { id: "collage-maker", name: "Collage Maker", description: "Create beautiful image collages", category: "Combine" },
];

export const CATEGORIES = Array.from(new Set(TOOLS.map((t) => t.category)));

export function getToolById(id: string): Tool | undefined {
  return TOOLS.find((t) => t.id === id);
}
