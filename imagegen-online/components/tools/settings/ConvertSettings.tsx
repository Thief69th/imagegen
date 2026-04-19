"use client";

interface ConvertSettingsProps {
  convertFmt: "jpg" | "png" | "webp";
  quality: number;
  convertFrom?: string;
  toolId?: string;
  onFormatChange: (format: "jpg" | "png" | "webp") => void;
  onQualityChange: (quality: number) => void;
}

export default function ConvertSettings({
  convertFmt,
  quality,
  convertFrom,
  toolId,
  onFormatChange,
  onQualityChange,
}: ConvertSettingsProps) {
  return (
    <div className="space-y-3">
      <div>
        <p className="font-mono text-xs text-black/50 mb-2">Output Format</p>
        <div className="flex flex-wrap gap-2">
          {["jpg", "png", "webp"].map((fmt) => (
            <button
              key={fmt}
              onClick={() => onFormatChange(fmt as "jpg" | "png" | "webp")}
              className={`font-mono text-xs uppercase px-3 py-2 border-2 border-black hover:bg-black hover:text-white transition-colors ${
                convertFmt === fmt ? "bg-black text-white" : ""
              }`}
            >
              .{fmt}
            </button>
          ))}
        </div>
      </div>

      {convertFmt !== "png" && (
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
      )}

      {convertFrom && (
        <div className="font-mono text-xs text-black/40 border border-black/10 px-3 py-2">
          {convertFrom} → .{convertFmt.toUpperCase()}
          {toolId === "heic-to-jpg" && (
            <span className="block mt-1 text-black/30">
              Note: HEIC support depends on your browser. Chrome 104+ supports it.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
