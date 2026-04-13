"use client";

import { useState } from "react";
import { TOOLS, CATEGORIES } from "@/lib/tools";
import { getToolSeo } from "@/lib/toolSeo";

interface ToolSEODirectoryProps {
  onSelectTool: (id: string) => void;
}

function ToolFAQ({ faqs }: { faqs: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mt-4 border border-black/10 rounded-lg overflow-hidden">
      <p className="font-mono text-xs uppercase tracking-widest text-black/30 px-4 py-2 bg-black/[0.02] border-b border-black/10">
        FAQ
      </p>
      {faqs.map((faq, i) => (
        <div key={i} className="border-b border-black/10 last:border-b-0">
          <button
            className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-black/[0.02] transition-colors"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="font-mono text-xs font-bold">{faq.q}</span>
            <span className={`flex-shrink-0 font-mono text-xs transition-transform ${open === i ? "rotate-45" : ""}`}>
              +
            </span>
          </button>
          {open === i && (
            <p className="px-4 pb-3 font-mono text-xs text-black/60 leading-relaxed">
              {faq.a}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export default function ToolSEODirectory({ onSelectTool }: ToolSEODirectoryProps) {
  const byCategory = CATEGORIES.map((cat) => ({
    cat,
    tools: TOOLS.filter((t) => t.category === cat),
  }));

  const handleOpen = (id: string) => {
    onSelectTool(id);
    document.getElementById("active-tool")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="tool-directory"
      aria-label="Complete image tools directory with descriptions"
      className="w-full border-t-2 border-black"
    >
      <div className="max-w-screen-xl mx-auto px-4 py-12">
        {/* Section header */}
        <div className="mb-10">
          <p className="font-mono text-xs uppercase tracking-widest text-black/30 mb-1">Tool Guide</p>
          <h2
            className="font-mono font-bold text-2xl md:text-3xl tracking-tight"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Complete Image Tools Directory
          </h2>
          <p className="font-mono text-xs text-black/40 mt-2 max-w-2xl">
            Detailed guide to every free online image tool on imagegen.online — use cases, tips, FAQs, and related tools.
          </p>
        </div>

        {byCategory.map(({ cat, tools }) => (
          <div key={cat} className="mb-16">
            {/* Category heading */}
            <div className="flex items-center gap-4 mb-6 border-b-2 border-black pb-3">
              <h2
                className="font-mono font-bold text-lg tracking-tight"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                {cat} Tools
              </h2>
              <span className="font-mono text-xs text-black/30 border border-black/20 px-2 py-0.5">
                {tools.length} tools
              </span>
            </div>

            {/* Tools in this category */}
            <div className="space-y-8">
              {tools.map((tool) => {
                const seo = getToolSeo(tool.id);
                return (
                  <section
                    key={tool.id}
                    id={`dir-${tool.id}`}
                    aria-label={tool.name}
                    className="border-2 border-black rounded-xl p-5 md:p-6 scroll-mt-20"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                      <div className="flex-1">
                        {/* SEO H3 heading (category H2 is above) */}
                        <h3
                          className="font-mono font-bold text-base md:text-lg tracking-tight leading-snug"
                          style={{ fontFamily: "'Space Mono', monospace" }}
                        >
                          {seo?.h2 ?? tool.name}
                        </h3>
                        {seo?.tagline && (
                          <p className="font-mono text-xs text-black/50 mt-1">{seo.tagline}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleOpen(tool.id)}
                        className="flex-shrink-0 font-mono text-xs uppercase tracking-widest bg-black text-white px-4 py-2 border-2 border-black hover:bg-white hover:text-black transition-colors"
                        aria-label={`Open ${tool.name}`}
                      >
                        Use Tool →
                      </button>
                    </div>

                    {/* Rich description */}
                    {seo?.description && (
                      <p className="text-sm text-black/70 leading-relaxed mb-4">{seo.description}</p>
                    )}

                    {/* Keywords */}
                    {seo?.keywords && seo.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {seo.keywords.map((kw) => (
                          <span
                            key={kw}
                            className="font-mono text-xs border border-black/20 px-2 py-0.5 text-black/40"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Related tools */}
                    {seo?.related && seo.related.length > 0 && (
                      <div className="mb-4">
                        <p className="font-mono text-xs uppercase tracking-widest text-black/30 mb-2">
                          Try related tools
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {seo.related.map((relId) => {
                            const relTool = TOOLS.find((t) => t.id === relId);
                            if (!relTool) return null;
                            return (
                              <button
                                key={relId}
                                onClick={() => handleOpen(relId)}
                                className="font-mono text-xs px-2.5 py-1 border border-black/30 hover:bg-black hover:text-white hover:border-black transition-colors"
                                aria-label={`Try ${relTool.name}`}
                              >
                                {relTool.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* FAQ */}
                    {seo?.faqs && seo.faqs.length > 0 && (
                      <ToolFAQ faqs={seo.faqs} />
                    )}
                  </section>
                );
              })}
            </div>
          </div>
        ))}

        {/* Structured data anchor list (for crawlers) */}
        <nav aria-label="Image tools index" className="sr-only">
          <h2>All Image Tools Index</h2>
          <ul>
            {TOOLS.map((tool) => (
              <li key={tool.id}>
                <a href={`#tool-${tool.id}`}>{tool.name} — {tool.description}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
