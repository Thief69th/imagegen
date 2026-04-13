"use client";

import { useEffect, useState, lazy, Suspense } from "react";
import { getToolById } from "@/lib/tools";
import { getToolMeta } from "@/lib/toolConfigs";

const MultiImageCompressor = lazy(() => import("./tools/MultiImageCompressor"));
const UniversalImageTool = lazy(() => import("./tools/UniversalImageTool"));
const ComplexTool = lazy(() => import("./tools/ComplexTool"));

// Tools that use the bulk multi-image compressor UI
const BULK_COMPRESS_TOOLS = new Set([
  "bulk-image-compressor",
  "compress-for-web",
  "compress-for-email",
  "compress-for-social",
]);

// Tools that need complex/server-side processing
const COMPLEX_TOOLS = new Set([
  "remove-background",
  "merge-images",
  "split-image",
  "collage-maker",
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

function ToolComponent({ toolId }: { toolId: string }) {
  const meta = getToolMeta(toolId);

  if (BULK_COMPRESS_TOOLS.has(toolId)) {
    return <MultiImageCompressor />;
  }
  if (COMPLEX_TOOLS.has(toolId)) {
    return <ComplexTool toolId={toolId} />;
  }
  // All other tools — universal handler
  // "image-compressor" also goes to UniversalImageTool (single file compress)
  return <UniversalImageTool toolId={toolId} key={toolId} />;
}

export default function ActiveToolArea({ activeTool }: { activeTool: string }) {
  const tool = getToolById(activeTool);
  const [mounted, setMounted] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setMounted(false);
    const t = setTimeout(() => { setMounted(true); setKey((k) => k + 1); }, 40);
    return () => clearTimeout(t);
  }, [activeTool]);

  return (
    <section id="active-tool" className="w-full max-w-screen-xl mx-auto px-4 py-8 md:py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-3">
        <span className="font-mono text-xs text-black/30 uppercase tracking-widest">imagegen.online</span>
        <span className="font-mono text-xs text-black/30">/</span>
        <span className="font-mono text-xs text-black uppercase tracking-widest">
          {tool?.name ?? activeTool}
        </span>
      </div>

      {/* Tool container */}
      <div className="border-2 border-black rounded-xl p-5 md:p-8 bg-white">
        {mounted ? (
          <Suspense fallback={<ToolLoader />}>
            <ToolComponent toolId={activeTool} key={key} />
          </Suspense>
        ) : (
          <ToolLoader />
        )}
      </div>
    </section>
  );
}
