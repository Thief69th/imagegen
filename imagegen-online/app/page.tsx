"use client";

import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ActiveToolArea from "@/components/ActiveToolArea";
import ToolsGrid from "@/components/ToolsGrid";
import FeaturesSection from "@/components/FeaturesSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";

export default function HomePage() {
  const [activeTool, setActiveTool] = useState<string>("bulk-image-compressor");

  const handleSelectTool = (id: string) => {
    setActiveTool(id);
  };

  return (
    <main className="min-h-screen bg-white text-black">
      <Header />
      <HeroSection />
      <ActiveToolArea activeTool={activeTool} />
      <ToolsGrid activeTool={activeTool} onSelectTool={handleSelectTool} />
      <FeaturesSection />
      <FAQSection />
      <Footer />
    </main>
  );
}
