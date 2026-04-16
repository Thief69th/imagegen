export type Platform = "facebook" | "instagram" | "pinterest" | "unknown";

export interface PlatformInfo {
  platform: Platform;
  displayName: string;
  domain: string;
  color: string;
  emoji: string;
}

export function detectPlatform(url: string): PlatformInfo {
  const u = url.toLowerCase();
  if (u.includes("facebook.com") || u.includes("fb.com") || u.includes("fb.watch")) {
    return { platform: "facebook", displayName: "Facebook", domain: "facebook.com", color: "#1877F2", emoji: "📘" };
  }
  if (u.includes("instagram.com") || u.includes("instagr.am")) {
    return { platform: "instagram", displayName: "Instagram", domain: "instagram.com", color: "#E1306C", emoji: "📸" };
  }
  if (u.includes("pinterest.com") || u.includes("pin.it") || u.includes("pinterest.co")) {
    return { platform: "pinterest", displayName: "Pinterest", domain: "pinterest.com", color: "#E60023", emoji: "📌" };
  }
  return { platform: "unknown", displayName: "Unknown", domain: "", color: "#000", emoji: "🌐" };
}

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}
