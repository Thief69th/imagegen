// app/sitemap.js
// Google ko sab 82 pages automatically milenge

import { toolsData } from "@/lib/tools-data";

export default function sitemap() {
  const toolPages = toolsData.map((tool) => ({
    url: `https://imagegen.online/tools/${tool.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: tool.searchVolume === "high" ? 0.9 : tool.searchVolume === "medium" ? 0.7 : 0.5,
  }));

  return [
    {
      url: "https://imagegen.online",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    ...toolPages,
  ];
}
