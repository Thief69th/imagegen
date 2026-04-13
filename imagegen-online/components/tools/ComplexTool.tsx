"use client";

import { getToolMeta } from "@/lib/toolConfigs";

export default function ComplexTool({ toolId }: { toolId: string }) {
  const meta = getToolMeta(toolId);

  const suggestions: Record<string, { reason: string; alt?: string }> = {
    "remove-background": {
      reason: "Background removal requires an AI/ML model (e.g. remove.bg API or @imgly/background-removal WASM).",
      alt: "You can integrate remove.bg API — free tier gives 50 images/month.",
    },
    "merge-images": {
      reason: "Merge tool requires a canvas layout builder with drag positioning.",
      alt: "Coming soon in v2 with a drag-and-drop canvas editor.",
    },
    "split-image": {
      reason: "Split tool requires grid/tile configuration UI.",
      alt: "Coming soon — will support 2×2, 3×3, and custom grid splits.",
    },
    "collage-maker": {
      reason: "Collage maker requires a layout engine with multiple image slots.",
      alt: "Coming soon with preset collage templates.",
    },
  };

  const info = suggestions[toolId];

  return (
    <div className="fade-in-up">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-mono font-bold text-xl md:text-2xl tracking-tight">{meta.label}</h2>
          <p className="text-sm text-black/50 mt-1">{meta.description}</p>
        </div>
        <span className="font-mono text-xs border-2 border-black px-2 py-1">SOON</span>
      </div>

      <div className="border-2 border-dashed border-black rounded-xl p-10 text-center">
        <div className="w-16 h-16 border-2 border-black rounded-full flex items-center justify-center mx-auto mb-5">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <p className="font-mono font-bold text-lg mb-2">{meta.label}</p>
        {info && (
          <>
            <p className="text-sm text-black/50 max-w-md mx-auto mb-2">{info.reason}</p>
            {info.alt && <p className="text-xs text-black/40 max-w-sm mx-auto">{info.alt}</p>}
          </>
        )}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" })}
            className="font-mono text-xs uppercase tracking-widest px-6 py-3 border-2 border-black hover:bg-black hover:text-white transition-colors">
            ← Browse Working Tools
          </button>
        </div>
      </div>
    </div>
  );
}
