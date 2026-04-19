"use client";

import { FitMode } from "@/lib/types";

interface ResizeSettingsProps {
  resizeW: string;
  resizeH: string;
  maintainRatio: boolean;
  fit: FitMode;
  quality: number;
  resizePreset?: { label: string; width: number; height: number };
  onResizeWChange: (value: string) => void;
  onResizeHChange: (value: string) => void;
  onMaintainRatioChange: (checked: boolean) => void;
  onFitChange: (fit: FitMode) => void;
  onQualityChange: (quality: number) => void;
}

export default function ResizeSettings({
  resizeW,
  resizeH,
  maintainRatio,
  fit,
  quality,
  resizePreset,
  onResizeWChange,
  onResizeHChange,
  onMaintainRatioChange,
  onFitChange,
  onQualityChange,
}: ResizeSettingsProps) {
  return (
    <div className="space-y-3">
      {resizePreset && (
        <div className="border border-black/20 px-3 py-2 bg-black/[0.02] font-mono text-xs">
          Preset: <strong>{resizePreset.label}</strong> — {resizePreset.width} × {resizePreset.height}px
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-2 items-center">
        <input
          type="number"
          placeholder="Width (px)"
          value={resizeW}
          onChange={(e) => onResizeWChange(e.target.value)}
          className="w-full min-w-0 border-2 border-black px-2 py-2 font-mono text-sm focus:outline-none bg-white"
        />
        <input
          type="number"
          placeholder="Height (px)"
          value={resizeH}
          onChange={(e) => onResizeHChange(e.target.value)}
          className="w-full min-w-0 border-2 border-black px-2 py-2 font-mono text-sm focus:outline-none bg-white"
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={maintainRatio}
          onChange={(e) => onMaintainRatioChange(e.target.checked)}
        />
        <span className="font-mono text-xs">Maintain aspect ratio</span>
      </label>

      {maintainRatio && (
        <div className="flex gap-3">
          {(["contain", "cover", "stretch"] as const).map((f) => (
            <label key={f} className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="radio"
                name="fit"
                value={f}
                checked={fit === f}
                onChange={() => onFitChange(f)}
              />
              <span className="font-mono text-xs capitalize">{f}</span>
            </label>
          ))}
        </div>
      )}

      <div>
        <p className="font-mono text-xs text-black/50 mb-1">
          Quality — <strong>{quality}%</strong>
        </p>
        <input
          type="range"
          min={1}
          max={100}
          value={quality}
          onChange={(e) => onQualityChange(Number(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
}
