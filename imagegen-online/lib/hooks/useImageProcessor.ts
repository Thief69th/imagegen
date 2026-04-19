"use client";

import { useState, useCallback } from "react";
import { FileEntry, ProcessOptions } from "@/lib/types";
import { generateFileId, isSupportedImage } from "@/lib/utils";

interface UseImageProcessorOptions {
  isBulk?: boolean;
}

export function useImageProcessor({ isBulk = false }: UseImageProcessorOptions = {}) {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [isDrag, setIsDrag] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [allDone, setAllDone] = useState(false);

  const addFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    const arr = Array.from(fileList).filter(isSupportedImage);
    if (!arr.length) return;

    if (!isBulk && arr.length > 0) {
      const f = arr[0];
      const preview = URL.createObjectURL(f);
      setFiles([{
        id: generateFileId(f),
        file: f,
        preview,
        name: f.name,
        originalSize: f.size,
        status: "idle",
      }]);
    } else {
      const entries: FileEntry[] = arr.map((f) => ({
        id: generateFileId(f),
        file: f,
        preview: URL.createObjectURL(f),
        name: f.name,
        originalSize: f.size,
        status: "idle",
      }));
      setFiles((prev) => [...prev, ...entries]);
    }
    setAllDone(false);
  }, [isBulk]);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((e) => e.id === id);
      if (file) {
        URL.revokeObjectURL(file.preview);
        if (file.resultPreview) URL.revokeObjectURL(file.resultPreview);
      }
      return prev.filter((e) => e.id !== id);
    });
    setAllDone(false);
  }, []);

  const clearAll = useCallback(() => {
    files.forEach((f) => {
      URL.revokeObjectURL(f.preview);
      if (f.resultPreview) URL.revokeObjectURL(f.resultPreview);
    });
    setFiles([]);
    setAllDone(false);
  }, [files]);

  return {
    files,
    isDrag,
    processing,
    allDone,
    addFiles,
    removeFile,
    clearAll,
    setIsDrag,
    setProcessing,
    setAllDone,
    setFiles,
  };
}

export default useImageProcessor;
