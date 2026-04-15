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
  { id: "watermark", name: "Add Watermark to Photo Online Free", description: "Add text or image/logo watermark to photos — position, opacity, rotation", category: "Watermark" },
  { id: "add-text", name: "Add Text to Image", description: "Overlay custom text or watermark onto images", category: "Watermark" },
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

  // Lossless / Metadata / Palette
  { id: "lossless-convert", name: "Convert Without Loss", description: "Convert image to lossless PNG — zero quality loss", category: "Convert" },
  { id: "lossless-compress", name: "Lossless Image Compressor", description: "Compress image without any quality loss", category: "Compress" },
  { id: "remove-metadata", name: "Remove Image Metadata", description: "Strip EXIF data, GPS location, camera info — 100% private", category: "Convert" },
  { id: "color-palette", name: "Color Palette Extractor", description: "Extract dominant color palette from any image", category: "Effects" },

  // Target-size compress
  { id: "compress-under-100kb", name: "Compress Under 100KB", description: "Auto-compress image to under 100KB file size", category: "Compress" },
  { id: "compress-under-50kb", name: "Compress Under 50KB", description: "Auto-compress image to under 50KB file size", category: "Compress" },
  { id: "smart-compress", name: "Smart Image Compressor", description: "Compress to your custom target file size", category: "Compress" },

  // Instagram
  { id: "instagram-story", name: "Instagram Story Size Tool", description: "Resize to 1080×1920 for Instagram Stories", category: "Instagram" },
  { id: "instagram-reel", name: "Instagram Reel Thumbnail Maker", description: "Resize to 1080×1920 for Instagram Reels cover", category: "Instagram" },
  { id: "instagram-dp", name: "Instagram DP Size Converter", description: "Resize to 320×320 for Instagram profile picture", category: "Instagram" },
  { id: "instagram-profile-pic", name: "Instagram Profile Picture Resizer", description: "Perfect dimensions for Instagram profile photo", category: "Instagram" },
  { id: "instagram-square", name: "Instagram Square Image Maker", description: "Convert any image to 1:1 square for Instagram", category: "Instagram" },
  { id: "instagram-carousel", name: "Instagram Carousel Image Splitter", description: "Split wide image into carousel panels", category: "Instagram" },
  { id: "instagram-safe-zone", name: "Instagram Story Safe Zone Tool", description: "Overlay safe-zone guide onto story images", category: "Instagram" },
  { id: "compress-instagram", name: "Compress Image for Instagram", description: "Compress and optimise images for Instagram upload", category: "Instagram" },

  // WhatsApp
  { id: "whatsapp-dp", name: "WhatsApp DP Image Resizer", description: "Resize to 640×640 for WhatsApp profile photo", category: "WhatsApp" },
  { id: "whatsapp-status", name: "WhatsApp Status Image Size Tool", description: "Resize to 1080×1920 for WhatsApp Status", category: "WhatsApp" },
  { id: "whatsapp-profile-crop", name: "WhatsApp Profile Photo Crop Tool", description: "Square crop for perfect WhatsApp profile photo", category: "WhatsApp" },
  { id: "whatsapp-square", name: "WhatsApp Square Image Maker", description: "Convert any image to square for WhatsApp", category: "WhatsApp" },
  { id: "whatsapp-image-size", name: "WhatsApp Image Size Converter", description: "Convert image to recommended 1600×900 WhatsApp size", category: "WhatsApp" },
  { id: "whatsapp-optimizer", name: "WhatsApp Image Optimizer Tool", description: "Optimise and compress images for WhatsApp", category: "WhatsApp" },
  { id: "compress-whatsapp", name: "Compress Image for WhatsApp", description: "Reduce file size for fast WhatsApp sharing", category: "WhatsApp" },

  // Facebook
  { id: "facebook-cover", name: "Facebook Cover Photo Resizer Tool", description: "Resize to 820×312 for Facebook cover photo", category: "Facebook" },
  { id: "facebook-profile-pic", name: "Facebook Profile Picture Size Tool", description: "Resize to 320×320 for Facebook profile photo", category: "Facebook" },
  { id: "facebook-ads", name: "Facebook Ads Image Resizer", description: "Resize to 1200×628 for Facebook ad creatives", category: "Facebook" },
  { id: "facebook-square", name: "Facebook Square Image Maker", description: "Convert any image to square for Facebook posts", category: "Facebook" },
  { id: "facebook-story", name: "Facebook Story Image Resizer", description: "Resize to 1080×1920 for Facebook Stories", category: "Facebook" },
  { id: "facebook-optimizer", name: "Facebook Image Optimizer Tool", description: "Compress and optimise images for Facebook upload", category: "Facebook" },

  // Combine
  { id: "merge-images", name: "Merge Images", description: "Combine multiple images into one", category: "Combine" },
  { id: "split-image", name: "Split Image", description: "Split one image into multiple parts", category: "Combine" },
  { id: "collage-maker", name: "Collage Maker", description: "Create beautiful image collages", category: "Combine" },
];

export const CATEGORIES = Array.from(new Set(TOOLS.map((t) => t.category)));

export function getToolById(id: string): Tool | undefined {
  return TOOLS.find((t) => t.id === id);
}
