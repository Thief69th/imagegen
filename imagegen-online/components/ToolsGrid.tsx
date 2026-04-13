"use client";

import { useState } from "react";
import { TOOLS, CATEGORIES } from "@/lib/tools";

interface ToolsGridProps {
  activeTool: string;
  onSelectTool: (id: string) => void;
}

export default function ToolsGrid({ activeTool, onSelectTool }: ToolsGridProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [search, setSearch] = useState("");

  const filtered = TOOLS.filter((tool) => {
    const matchCat = activeCategory === "All" || tool.category === activeCategory;
    const matchSearch =
      search === "" ||
      tool.name.toLowerCase().includes(search.toLowerCase()) ||
      tool.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleSelect = (id: string) => {
    onSelectTool(id);
    document.getElementById("active-tool")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="tools"
      aria-label="All free online image tools"
      className="w-full max-w-screen-xl mx-auto px-4 pb-16"
    >
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pt-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-black/40 mb-1">All Tools</p>
          <h2
            className="font-mono font-bold text-2xl md:text-3xl tracking-tight"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            {TOOLS.length} Free Image Tools Online
          </h2>
          <p className="font-mono text-xs text-black/40 mt-1">
            Compress · Resize · Convert · Edit · Crop · Watermark — all free, no sign-up
          </p>
        </div>
        {/* Search */}
        <div className="relative">
          <label htmlFor="tool-search" className="sr-only">Search image tools</label>
          <input
            id="tool-search"
            type="search"
            placeholder="Search tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-2 border-black px-4 py-2.5 font-mono text-sm w-full md:w-64 focus:outline-none pr-8"
            aria-label="Search image tools"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black font-mono"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div
        className="flex flex-wrap gap-2 mb-6 border-b-2 border-black pb-5"
        role="group"
        aria-label="Filter tools by category"
      >
        {["All", ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            aria-pressed={activeCategory === cat}
            className={`font-mono text-xs uppercase tracking-widest px-3 py-1.5 border-2 border-black transition-colors ${
              activeCategory === cat
                ? "bg-black text-white"
                : "bg-white text-black hover:bg-black hover:text-white"
            }`}
          >
            {cat}
            {cat === "All" && (
              <span className="ml-1.5 opacity-50">{TOOLS.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Results count */}
      {search && (
        <p className="font-mono text-xs text-black/40 mb-4" role="status" aria-live="polite">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &quot;{search}&quot;
        </p>
      )}

      {/* Tools Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16" role="status">
          <p className="font-mono text-sm text-black/40">No tools found for &quot;{search}&quot;</p>
        </div>
      ) : (
        <div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
          role="list"
          aria-label="Image tools list"
        >
          {filtered.map((tool) => (
            <article
              key={tool.id}
              id={`tool-${tool.id}`}
              role="listitem"
              className={`tool-card border-2 border-black rounded-lg p-4 flex flex-col justify-between cursor-pointer ${
                activeTool === tool.id ? "bg-black text-white" : ""
              }`}
              onClick={() => handleSelect(tool.id)}
            >
              <div>
                <div className="flex items-start justify-between gap-1 mb-2">
                  {/* Semantic h2 for SEO — styled to match existing design */}
                  <h2
                    className={`font-mono font-bold text-xs tracking-tight leading-snug ${
                      activeTool === tool.id ? "text-white" : "text-black"
                    }`}
                  >
                    {tool.name}
                  </h2>
                  {activeTool === tool.id && (
                    <span className="flex-shrink-0 w-2 h-2 rounded-full bg-white mt-0.5" aria-hidden="true" />
                  )}
                </div>
                <p
                  className={`text-xs leading-relaxed mb-3 ${
                    activeTool === tool.id ? "text-white/60" : "text-black/50"
                  }`}
                >
                  {tool.description}
                </p>
              </div>
              <button
                className={`tool-card-btn font-mono text-xs uppercase tracking-widest px-2 py-1.5 border-2 transition-colors text-center ${
                  activeTool === tool.id
                    ? "border-white bg-white text-black"
                    : "border-black bg-transparent text-black"
                }`}
                onClick={(e) => { e.stopPropagation(); handleSelect(tool.id); }}
                aria-label={`Open ${tool.name} tool`}
              >
                Open Tool →
              </button>
            </article>
          ))}
        </div>
      )}

      {/* Tool count */}
      <div className="mt-6 text-center">
        <p className="font-mono text-xs text-black/30">
          Showing {filtered.length} of {TOOLS.length} free image tools
          {activeCategory !== "All" && ` in ${activeCategory}`}
        </p>
      </div>
    </section>
  );
}
