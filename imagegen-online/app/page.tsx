"use client";

import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AnchorNav from "@/components/AnchorNav";
import ActiveToolArea from "@/components/ActiveToolArea";
import ToolsGrid from "@/components/ToolsGrid";
import FeaturesSection from "@/components/FeaturesSection";
import FAQSection from "@/components/FAQSection";
import ToolSEODirectory from "@/components/ToolSEODirectory";
import Footer from "@/components/Footer";

export default function HomePage() {
  const [activeTool, setActiveTool] = useState<string>("bulk-image-compressor");

  const handleSelectTool = (id: string) => {
    setActiveTool(id);
  };

  return (
    <main className="min-h-screen bg-white text-black">
      <Header />

      {/* Skip to main content for accessibility */}
      <a
        href="#active-tool"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-black focus:text-white focus:px-4 focus:py-2 font-mono text-xs"
      >
        Skip to tool
      </a>

      <HeroSection />

      {/* Quick-jump anchor navigation — all 50 tools by category */}
      <AnchorNav onSelectTool={handleSelectTool} />

      {/* Active tool area — opens selected tool here */}
      <ActiveToolArea activeTool={activeTool} />

      {/* Tools grid — browse, search, filter all 50 tools */}
      <ToolsGrid activeTool={activeTool} onSelectTool={handleSelectTool} />

      {/* Features */}
      <FeaturesSection />

      {/* Site-wide FAQ */}
      <FAQSection />

      {/* SEO-rich tool directory — H2s, descriptions, per-tool FAQs, related links */}
      <ToolSEODirectory onSelectTool={handleSelectTool} />

      <Footer />
    </main>
  );
}
