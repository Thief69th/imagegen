"use client";

import { useState } from "react";
import { TOOLS, CATEGORIES } from "@/lib/tools";

interface AnchorNavProps {
  onSelectTool: (id: string) => void;
}

export default function AnchorNav({ onSelectTool }: AnchorNavProps) {
  const [open, setOpen] = useState(false);

  const handleClick = (id: string) => {
    // Open the tool in the active area
    onSelectTool(id);
    // Also scroll to the tool's section anchor in the directory
    setTimeout(() => {
      const el = document.getElementById(`tool-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        document.getElementById("active-tool")?.scrollIntoView({ behavior: "smooth" });
      }
    }, 50);
    setOpen(false);
  };

  const byCategory = CATEGORIES.map((cat) => ({
    cat,
    tools: TOOLS.filter((t) => t.category === cat),
  }));

  return (
    <nav
      aria-label="Quick navigation to all image tools"
      className="w-full border-b-2 border-black bg-white"
    >
      <div className="max-w-screen-xl mx-auto px-4">
        {/* Toggle bar */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center justify-between w-full py-3 font-mono text-xs uppercase tracking-widest text-black/50 hover:text-black transition-colors"
          aria-expanded={open}
        >
          <span className="flex items-center gap-2">
            <span className="hidden sm:inline">⚡</span>
            Quick Jump — All 50 Tools by Category
          </span>
          <span className={`transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
        </button>

        {/* Expandable tool links */}
        {open && (
          <div className="pb-5 border-t border-black/10 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-4">
              {byCategory.map(({ cat, tools }) => (
                <div key={cat}>
                  <p className="font-mono text-xs uppercase tracking-widest text-black/30 mb-2 border-b border-black/10 pb-1">
                    {cat}
                  </p>
                  <ul className="space-y-1">
                    {tools.map((tool) => (
                      <li key={tool.id}>
                        <button
                          onClick={() => handleClick(tool.id)}
                          className="font-mono text-xs text-black hover:text-black/50 transition-colors text-left w-full truncate"
                        >
                          → {tool.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* SEO anchor links (hidden visually for crawlers) */}
            <div className="sr-only" aria-hidden="false">
              {TOOLS.map((tool) => (
                <a key={tool.id} href={`#tool-${tool.id}`}>
                  {tool.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
