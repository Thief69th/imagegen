"use client";

import { useEffect, useState, lazy, Suspense } from "react";
import { getToolById } from "@/lib/tools";

// Lazy-load every tool component
const MultiImageCompressor = lazy(() => import("./tools/MultiImageCompressor"));
const UniversalImageTool   = lazy(() => import("./tools/UniversalImageTool"));
const RemoveBackground     = lazy(() => import("./tools/RemoveBackground"));
const MergeImages          = lazy(() => import("./tools/MergeImages"));
const SplitImage           = lazy(() => import("./tools/SplitImage"));
const CollageMaker         = lazy(() => import("./tools/CollageMaker"));
const SocialMediaKit       = lazy(() => import("./tools/SocialMediaKit"));
const TargetSizeCompressor = lazy(() => import("./tools/TargetSizeCompressor"));
const NicheEffects         = lazy(() => import("./tools/NicheEffects"));
const RemoveExif           = lazy(() => import("./tools/RemoveExif"));
const ImageBase64          = lazy(() => import("./tools/ImageBase64"));
const ImageColorPicker     = lazy(() => import("./tools/ImageColorPicker"));
const MemeTextGenerator    = lazy(() => import("./tools/MemeTextGenerator"));

// Niche effects handled by NicheEffects component
const NICHE_EFFECTS = new Set([
  "sepia-effect", "vintage-effect", "pixelate-image", "vignette-effect",
  "duotone-effect", "glitch-effect", "sketch-effect", "posterize-effect",
  "add-rounded-corners", "image-opacity", "image-frame",
]);

// Tools that use the bulk multi-compressor UI
const BULK_COMPRESS = new Set([
  "bulk-image-compressor", "compress-for-web",
  "compress-for-email", "compress-for-social",
]);

function ToolLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="w-2 h-2 bg-black rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}

function ToolRouter({ toolId }: { toolId: string }) {
  if (BULK_COMPRESS.has(toolId))           return <MultiImageCompressor />;
  if (toolId === "remove-background")      return <RemoveBackground />;
  if (toolId === "merge-images")           return <MergeImages />;
  if (toolId === "split-image")            return <SplitImage />;
  if (toolId === "collage-maker")          return <CollageMaker />;
  if (toolId === "social-media-kit")       return <SocialMediaKit />;
  if (toolId === "target-size-compressor") return <TargetSizeCompressor />;
  if (NICHE_EFFECTS.has(toolId))           return <NicheEffects toolId={toolId} />;
  if (toolId === "remove-exif")            return <RemoveExif />;
  if (toolId === "image-to-base64" || toolId === "base64-to-image") return <ImageBase64 />;
  if (toolId === "image-color-picker")     return <ImageColorPicker />;
  if (toolId === "meme-text-generator")    return <MemeTextGenerator />;
  // All remaining tools → universal canvas handler
  return <UniversalImageTool toolId={toolId} key={toolId} />;
}

export default function ActiveToolArea({ activeTool }: { activeTool: string }) {
  const tool = getToolById(activeTool);
  const [mounted, setMounted] = useState(false);
  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => {
    setMounted(false);
    const t = setTimeout(() => { setMounted(true); setRenderKey((k) => k + 1); }, 40);
    return () => clearTimeout(t);
  }, [activeTool]);

  return (
    <section id="active-tool" className="w-full max-w-screen-xl mx-auto px-4 py-8 md:py-10">
      <div className="flex items-center gap-2 mb-3">
        <span className="font-mono text-xs text-black/30 uppercase tracking-widest">imagegen.online</span>
        <span className="font-mono text-xs text-black/30">/</span>
        <span className="font-mono text-xs text-black uppercase tracking-widest font-bold">
          {tool?.name ?? activeTool}
        </span>
      </div>
      <div className="border-2 border-black rounded-xl p-5 md:p-8 bg-white">
        {mounted ? (
          <Suspense fallback={<ToolLoader />}>
            <ToolRouter toolId={activeTool} key={renderKey} />
          </Suspense>
        ) : (
          <ToolLoader />
        )}
      </div>
    </section>
  );
}
