// lib/toolConfigs.ts
import { ToolConfig, ToolType } from './types';

export const TOOL_CONFIGS: Record<ToolType, ToolConfig> = {
  // Compression Tools
  'compress': {
    id: 'compress',
    name: 'Compress Image',
    description: 'Reduce image file size without losing quality',
    category: 'compress',
    icon: 'compress',
    supportsBulk: true,
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    defaultOptions: { quality: 80, format: 'original' }
  },
  'compress-bulk': {
    id: 'compress-bulk',
    name: 'Bulk Compress',
    description: 'Compress multiple images at once',
    category: 'compress',
    icon: 'compress',
    supportsBulk: true,
    acceptedTypes: ['image/*'],
    defaultOptions: { quality: 80 }
  },

  // Resize Tools
  'resize': {
    id: 'resize',
    name: 'Resize Image',
    description: 'Change image dimensions',
    category: 'resize',
    icon: 'resize',
    supportsBulk: true,
    acceptedTypes: ['image/*'],
    defaultOptions: { width: 1920, height: 1080, maintainAspectRatio: true }
  },
  'resize-percentage': {
    id: 'resize-percentage',
    name: 'Resize by %',
    description: 'Scale image by percentage',
    category: 'resize',
    icon: 'resize',
    supportsBulk: true,
    acceptedTypes: ['image/*'],
    defaultOptions: { scale: 50 }
  },

  // Format Conversion
  'convert': {
    id: 'convert',
    name: 'Convert Format',
    description: 'Convert between JPG, PNG, WEBP, GIF',
    category: 'convert',
    icon: 'convert',
    supportsBulk: true,
    acceptedTypes: ['image/*'],
    defaultOptions: { format: 'image/webp', quality: 92 }
  },
  'heic-to-jpg': {
    id: 'heic-to-jpg',
    name: 'HEIC to JPG',
    description: 'Convert iPhone HEIC photos to JPG',
    category: 'convert',
    icon: 'convert',
    supportsBulk: true,
    acceptedTypes: ['image/heic', 'image/heif'],
    defaultOptions: { format: 'image/jpeg', quality: 90 }
  },

  // Edit Tools
  'rotate': {
    id: 'rotate',
    name: 'Rotate Image',
    description: 'Rotate image by degrees',
    category: 'edit',
    icon: 'rotate',
    supportsBulk: true,
    acceptedTypes: ['image/*'],
    defaultOptions: { rotation: 90 }
  },
  'flip': {
    id: 'flip',
    name: 'Flip Image',
    description: 'Flip image horizontally or vertically',
    category: 'edit',
    icon: 'flip',
    supportsBulk: true,
    acceptedTypes: ['image/*'],
    defaultOptions: { flipX: false, flipY: false }
  },
  'crop': {
    id: 'crop',
    name: 'Crop Image',
    description: 'Crop image to custom dimensions',
    category: 'edit',
    icon: 'crop',
    supportsBulk: false,
    acceptedTypes: ['image/*'],
    defaultOptions: { aspectRatio: 'free' }
  },
  'effects': {
    id: 'effects',
    name: 'Image Effects',
    description: 'Apply filters: grayscale, blur, brightness, contrast',
    category: 'edit',
    icon: 'effects',
    supportsBulk: true,
    acceptedTypes: ['image/*'],
    defaultOptions: { brightness: 100, contrast: 100, saturation: 100 }
  },

  // AI Tools
  'remove-background': {
    id: 'remove-background',
    name: 'Remove Background',
    description: 'AI-powered background removal',
    category: 'ai',
    icon: 'magic',
    supportsBulk: false,
    acceptedTypes: ['image/jpeg', 'image/png'],
    defaultOptions: {}
  },

  // Combine Tools
  'merge-images': {
    id: 'merge-images',
    name: 'Merge Images',
    description: 'Combine multiple images side by side',
    category: 'combine',
    icon: 'merge',
    supportsBulk: true,
    acceptedTypes: ['image/*'],
    defaultOptions: { direction: 'horizontal', spacing: 10 }
  },
  'split-image': {
    id: 'split-image',
    name: 'Split Image',
    description: 'Split image into grid sections',
    category: 'combine',
    icon: 'split',
    supportsBulk: false,
    acceptedTypes: ['image/*'],
    defaultOptions: { rows: 2, cols: 2 }
  },
  'collage-maker': {
    id: 'collage-maker',
    name: 'Collage Maker',
    description: 'Create photo collages with layouts',
    category: 'combine',
    icon: 'collage',
    supportsBulk: true,
    acceptedTypes: ['image/*'],
    defaultOptions: { layout: 'grid-2x2', spacing: 5 }
  },

  // Social Media
  'social-media': {
    id: 'social-media',
    name: 'Social Media Sizes',
    description: 'Resize for Instagram, Facebook, Twitter, etc.',
    category: 'social',
    icon: 'social',
    supportsBulk: true,
    acceptedTypes: ['image/*'],
    defaultOptions: { platform: 'instagram-post' }
  },

  // Watermark
  'add-watermark': {
    id: 'add-watermark',
    name: 'Add Watermark',
    description: 'Add text or image watermark',
    category: 'edit',
    icon: 'watermark',
    supportsBulk: true,
    acceptedTypes: ['image/*'],
    defaultOptions: { text: '', position: 'bottom-right', opacity: 0.7 }
  },

  // Add remaining tools with similar structure...
  // For tools not fully implemented, set supportsBulk: false and add TODO comments
};

export function getToolConfig(toolId: ToolType): ToolConfig | undefined {
  return TOOL_CONFIGS[toolId];
}

export function getToolsByCategory(category: string): ToolConfig[] {
  return Object.values(TOOL_CONFIGS).filter(tool => tool.category === category);
}
