// lib/hooks/useImageProcessor.ts
'use client';

import { useState, useCallback, useMemo } from 'react';
import { ImageFile, ProcessingOptions, ToolType } from '../types';
import { compressImage, convertImage, resizeImage, applyEffects } from '../canvasUtils';

interface UseImageProcessorProps {
  isBulk?: boolean;
  maxFiles?: number;
  acceptedTypes?: string[];
}

export function useImageProcessor({ 
  isBulk = false, 
  maxFiles = 10, 
  acceptedTypes = ['image/*'] 
}: UseImageProcessorProps = {}) {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{ url: string; name: string; size: number }[]>([]);

  const addFiles = useCallback((newFiles: File[]) => {
    setError(null);
    
    const validFiles = newFiles
      .filter(file => acceptedTypes.some(type => 
        type === 'image/*' ? file.type.startsWith('image/') : file.type === type
      ))
      .slice(0, isBulk ? maxFiles : 1);

    if (validFiles.length === 0) {
      setError('Please select valid image files');
      return;
    }

    const imageFiles: ImageFile[] = validFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      type: file.type,
      width: 0,
      height: 0,
      loading: true
    }));

    // Load image dimensions
    imageFiles.forEach(async (imgFile) => {
      try {
        const img = new Image();
        img.src = imgFile.preview;
        await img.decode();
        setFiles(prev => prev.map(f => 
          f.id === imgFile.id 
            ? { ...f, width: img.width, height: img.height, loading: false }
            : f
        ));
      } catch {
        setFiles(prev => prev.map(f => 
          f.id === imgFile.id ? { ...f, loading: false, error: 'Failed to load image' } : f
        ));
      }
    });

    setFiles(prev => isBulk ? [...prev, ...imageFiles] : imageFiles);
  }, [isBulk, maxFiles, acceptedTypes]);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      return prev.filter(f => f.id !== id);
    });
    setResults(prev => prev.filter(r => !r.url.includes(id)));
  }, []);

  const clearAll = useCallback(() => {
    files.forEach(f => f.preview && URL.revokeObjectURL(f.preview));
    results.forEach(r => URL.revokeObjectURL(r.url));
    setFiles([]);
    setResults([]);
    setError(null);
    setProgress(0);
  }, [files, results]);

  const processImage = useCallback(async (
    imageFile: ImageFile, 
    options: ProcessingOptions, 
    toolType: ToolType
  ): Promise<Blob | null> => {
    const img = new Image();
    img.src = imageFile.preview;
    await img.decode();

    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    switch (toolType) {
      case 'resize':
        canvas = await resizeImage(canvas, options);
        break;
      case 'convert':
        canvas = await convertImage(canvas, options);
        break;
      case 'compress':
        canvas = await compressImage(canvas, options);
        break;
      case 'rotate':
        ctx.save();
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.rotate((options.rotation || 0) * Math.PI / 180);
        ctx.drawImage(img, -canvas.width/2, -canvas.height/2);
        ctx.restore();
        break;
      case 'flip':
        ctx.scale(options.flipX ? -1 : 1, options.flipY ? -1 : 1);
        ctx.drawImage(img, options.flipX ? -canvas.width : 0, options.flipY ? -canvas.height : 0);
        break;
      case 'effects':
        canvas = await applyEffects(canvas, options);
        break;
      default:
        // Generic processing - apply basic adjustments
        if (options.brightness !== undefined) {
          ctx.filter = `brightness(${options.brightness}%)`;
          ctx.drawImage(img, 0, 0);
        }
        if (options.contrast !== undefined) {
          ctx.filter = `contrast(${options.contrast}%)`;
          ctx.drawImage(img, 0, 0);
        }
    }

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob), 
        options.format || imageFile.type, 
        options.quality || 0.92
      );
    });
  }, []);

  const processAll = useCallback(async (options: ProcessingOptions, toolType: ToolType) => {
    if (files.length === 0) {
      setError('No files to process');
      return;
    }

    setProcessing(true);
    setProgress(0);
    setError(null);
    setResults([]);

    try {
      const processed: { url: string; name: string; size: number }[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.loading || file.error) continue;

        const blob = await processImage(file, options, toolType);
        if (blob) {
          const url = URL.createObjectURL(blob);
          const ext = blob.type.split('/')[1] || 'png';
          const name = `${file.name.split('.')[0]}_processed.${ext}`;
          
          processed.push({ url, name, size: blob.size });
        }
        
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }
      
      setResults(processed);
      return processed;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed');
      return null;
    } finally {
      setProcessing(false);
    }
  }, [files, processImage]);

  // Cleanup on unmount
  useMemo(() => () => {
    files.forEach(f => f.preview && URL.revokeObjectURL(f.preview));
    results.forEach(r => URL.revokeObjectURL(r.url));
  }, [files, results]);

  return {
    files,
    results,
    processing,
    progress,
    error,
    addFiles,
    removeFile,
    clearAll,
    processAll,
    processImage
  };
}
