"use client";

import { useEffect, useState, lazy, Suspense } from "react";
import { getToolById } from "@/lib/tools";

const MultiImageCompressor = lazy(() => import("./tools/MultiImageCompressor"));
const PlaceholderTool = lazy(() => import("./tools/PlaceholderTool"));

interface ActiveToolAreaProps {
  activeTool: string;
}

function ToolLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 bg-black rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function ActiveToolArea({ activeTool }: ActiveToolAreaProps) {
  const tool = getToolById(activeTool);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(false);
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, [activeTool]);

  return (
    <section id="active-tool" className="w-full max-w-screen-xl mx-auto px-4 py-8 md:py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4">
        <span className="font-mono text-xs text-black/30 uppercase tracking-widest">
          imagegen.online
        </span>
        <span className="font-mono text-xs text-black/30">/</span>
        <span className="font-mono text-xs text-black uppercase tracking-widest">
          {tool?.name ?? activeTool}
        </span>
      </div>

      {/* Tool Container */}
      <div className="border-2 border-black rounded-xl p-6 md:p-8 bg-white">
        {mounted ? (
          <Suspense fallback={<ToolLoader />}>
            {activeTool === "bulk-image-compressor" || activeTool === "image-compressor" ? (
              <MultiImageCompressor />
            ) : (
              <PlaceholderTool toolName={tool?.name ?? activeTool} toolId={activeTool} />
            )}
          </Suspense>
        ) : (
          <ToolLoader />
        )}
      </div>
    </section>
  );
}
