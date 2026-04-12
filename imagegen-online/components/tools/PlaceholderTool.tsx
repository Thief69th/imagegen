"use client";

interface PlaceholderToolProps {
  toolName: string;
  toolId: string;
}

export default function PlaceholderTool({ toolName, toolId }: PlaceholderToolProps) {
  return (
    <div className="fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2
            className="font-mono font-bold text-xl md:text-2xl tracking-tight"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            {toolName}
          </h2>
          <p className="text-sm text-black/60 mt-1">
            This tool is currently in development.
          </p>
        </div>
        <span className="hidden sm:block font-mono text-xs border border-black px-2 py-1 text-black/50">
          FREE
        </span>
      </div>

      <div className="border-2 border-dashed border-black rounded-lg p-12 text-center">
        <div className="w-16 h-16 border-2 border-black rounded-full flex items-center justify-center mx-auto mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
        <p className="font-mono font-bold text-lg mb-2 tracking-tight">{toolName}</p>
        <p className="text-sm text-black/50 max-w-sm mx-auto">
          This tool is coming soon. We're building it with care to deliver the best image processing experience.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            className="font-mono text-xs uppercase tracking-widest bg-black text-white px-6 py-3 border-2 border-black hover:bg-white hover:text-black transition-colors"
          >
            Notify Me When Ready
          </button>
          <button
            onClick={() => {
              document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="font-mono text-xs uppercase tracking-widest bg-white text-black px-6 py-3 border-2 border-black hover:bg-black hover:text-white transition-colors"
          >
            Browse All Tools
          </button>
        </div>
      </div>

      <div className="mt-4 border-2 border-black rounded-lg p-4 bg-black/[0.02]">
        <p className="font-mono text-xs text-black/40 text-center">
          Tool ID: <span className="text-black">{toolId}</span> — Available via API integration
        </p>
      </div>
    </div>
  );
}
