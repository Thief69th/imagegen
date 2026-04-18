// lib/detectPlatform.ts

export type Platform =
  | "youtube"
  | "youtube-shorts"
  | "instagram"
  | "twitter"
  | "tiktok"
  | "facebook"
  | "pinterest"
  | "linkedin"
  | "reddit"
  | "twitch"
  | "vimeo"
  | "snapchat"
  | "tumblr"
  | "flickr"
  | "deviantart"
  | "behance"
  | "dribbble"
  | "500px"
  | "unsplash"
  | "pexels"
  | "pixabay"
  | "imgur"
  | "giphy"
  | "tenor"
  | "threads"
  | "bluesky"
  | "mastodon"
  | "discord"
  | "telegram"
  | "whatsapp"
  | "weibo"
  | "unknown";

export type PlatformInfo = {
  platform: Platform;
  domain: string | null;
  /** Human-readable label, e.g. "YouTube Shorts" */
  label: string;
  /** Whether the platform supports direct video-to-thumbnail extraction */
  supportsAutoThumbnail: boolean;
};

// ─── Pattern registry ─────────────────────────────────────────────────────────

type PlatformRule = {
  platform: Platform;
  label: string;
  supportsAutoThumbnail?: boolean;
  patterns: RegExp[];
  domain: string;
};

const PLATFORM_RULES: PlatformRule[] = [
  // ── Video platforms ──────────────────────────────────────────────────────
  {
    platform: "youtube-shorts",
    label: "YouTube Shorts",
    domain: "youtube.com",
    supportsAutoThumbnail: true,
    patterns: [
      /youtube\.com\/shorts\//i,
    ],
  },
  {
    platform: "youtube",
    label: "YouTube",
    domain: "youtube.com",
    supportsAutoThumbnail: true,
    patterns: [
      /youtube\.com\/watch/i,
      /youtube\.com\/embed\//i,
      /youtube\.com\/v\//i,
      /youtu\.be\//i,
      /img\.youtube\.com\//i,
      /i\.ytimg\.com\//i,
    ],
  },
  {
    platform: "tiktok",
    label: "TikTok",
    domain: "tiktok.com",
    supportsAutoThumbnail: true,
    patterns: [
      /tiktok\.com\//i,
      /p16-sign\.tiktokcdn\.com\//i,
      /p19-sign\.tiktokcdn\.com\//i,
      /p16-amd\.tiktokcdn\.com\//i,
    ],
  },
  {
    platform: "vimeo",
    label: "Vimeo",
    domain: "vimeo.com",
    supportsAutoThumbnail: true,
    patterns: [
      /vimeo\.com\//i,
      /vimeocdn\.com\//i,
      /i\.vimeocdn\.com\//i,
    ],
  },
  {
    platform: "twitch",
    label: "Twitch",
    domain: "twitch.tv",
    supportsAutoThumbnail: true,
    patterns: [
      /twitch\.tv\//i,
      /static-cdn\.jtvnw\.net\//i,
      /clips-media-assets2\.twitch\.tv\//i,
    ],
  },
  {
    platform: "snapchat",
    label: "Snapchat",
    domain: "snapchat.com",
    patterns: [
      /snapchat\.com\//i,
      /sc-cdn\.net\//i,
    ],
  },

  // ── Social / image platforms ──────────────────────────────────────────────
  {
    platform: "instagram",
    label: "Instagram",
    domain: "instagram.com",
    patterns: [
      /instagram\.com\//i,
      /cdninstagram\.com\//i,
      /scontent[^.]*\.cdninstagram\.com\//i,
      /instagram\.f[a-z0-9]+\d+[^.]*\.fna\.fbcdn\.net\//i,
    ],
  },
  {
    platform: "twitter",
    label: "X / Twitter",
    domain: "x.com",
    patterns: [
      /twitter\.com\//i,
      /x\.com\//i,
      /pbs\.twimg\.com\//i,
      /abs\.twimg\.com\//i,
      /video\.twimg\.com\//i,
    ],
  },
  {
    platform: "facebook",
    label: "Facebook",
    domain: "facebook.com",
    patterns: [
      /facebook\.com\//i,
      /fb\.com\//i,
      /scontent[^.]*\.fbcdn\.net\//i,
      /lookaside\.fbsbx\.com\//i,
    ],
  },
  {
    platform: "pinterest",
    label: "Pinterest",
    domain: "pinterest.com",
    patterns: [
      /pinterest\.[a-z.]+\//i,
      /pinimg\.com\//i,
      /i\.pinimg\.com\//i,
    ],
  },
  {
    platform: "linkedin",
    label: "LinkedIn",
    domain: "linkedin.com",
    patterns: [
      /linkedin\.com\//i,
      /media\.licdn\.com\//i,
      /static\.licdn\.com\//i,
    ],
  },
  {
    platform: "reddit",
    label: "Reddit",
    domain: "reddit.com",
    patterns: [
      /reddit\.com\//i,
      /redd\.it\//i,
      /preview\.redd\.it\//i,
      /i\.redd\.it\//i,
      /external-preview\.redd\.it\//i,
    ],
  },
  {
    platform: "tumblr",
    label: "Tumblr",
    domain: "tumblr.com",
    patterns: [
      /tumblr\.com\//i,
      /\d+\.media\.tumblr\.com\//i,
    ],
  },
  {
    platform: "flickr",
    label: "Flickr",
    domain: "flickr.com",
    patterns: [
      /flickr\.com\//i,
      /staticflickr\.com\//i,
      /live\.staticflickr\.com\//i,
      /farm\d+\.staticflickr\.com\//i,
    ],
  },
  {
    platform: "threads",
    label: "Threads",
    domain: "threads.net",
    patterns: [
      /threads\.net\//i,
    ],
  },
  {
    platform: "bluesky",
    label: "Bluesky",
    domain: "bsky.app",
    patterns: [
      /bsky\.app\//i,
      /cdn\.bsky\.app\//i,
    ],
  },
  {
    platform: "mastodon",
    label: "Mastodon",
    domain: "mastodon.social",
    patterns: [
      /mastodon\.social\//i,
      /mastodon\.online\//i,
      /fosstodon\.org\//i,
    ],
  },

  // ── Design / portfolio platforms ──────────────────────────────────────────
  {
    platform: "behance",
    label: "Behance",
    domain: "behance.net",
    patterns: [
      /behance\.net\//i,
      /mir-s3-cdn-cf\.behance\.net\//i,
    ],
  },
  {
    platform: "dribbble",
    label: "Dribbble",
    domain: "dribbble.com",
    patterns: [
      /dribbble\.com\//i,
      /cdn\.dribbble\.com\//i,
    ],
  },
  {
    platform: "deviantart",
    label: "DeviantArt",
    domain: "deviantart.com",
    patterns: [
      /deviantart\.com\//i,
      /images-wixmp[^.]*\.wixmp\.com\//i,
    ],
  },

  // ── Stock / image hosting ─────────────────────────────────────────────────
  {
    platform: "unsplash",
    label: "Unsplash",
    domain: "unsplash.com",
    patterns: [
      /unsplash\.com\//i,
      /images\.unsplash\.com\//i,
      /plus\.unsplash\.com\//i,
    ],
  },
  {
    platform: "pexels",
    label: "Pexels",
    domain: "pexels.com",
    patterns: [
      /pexels\.com\//i,
      /images\.pexels\.com\//i,
    ],
  },
  {
    platform: "pixabay",
    label: "Pixabay",
    domain: "pixabay.com",
    patterns: [
      /pixabay\.com\//i,
      /cdn\.pixabay\.com\//i,
    ],
  },
  {
    platform: "500px",
    label: "500px",
    domain: "500px.com",
    patterns: [
      /500px\.com\//i,
      /drscdn\.500px\.org\//i,
    ],
  },
  {
    platform: "imgur",
    label: "Imgur",
    domain: "imgur.com",
    patterns: [
      /imgur\.com\//i,
      /i\.imgur\.com\//i,
    ],
  },

  // ── GIF platforms ─────────────────────────────────────────────────────────
  {
    platform: "giphy",
    label: "GIPHY",
    domain: "giphy.com",
    patterns: [
      /giphy\.com\//i,
      /media\d?\.giphy\.com\//i,
    ],
  },
  {
    platform: "tenor",
    label: "Tenor",
    domain: "tenor.com",
    patterns: [
      /tenor\.com\//i,
      /c\.tenor\.com\//i,
      /media\.tenor\.com\//i,
    ],
  },

  // ── Messaging platforms ───────────────────────────────────────────────────
  {
    platform: "discord",
    label: "Discord",
    domain: "discord.com",
    patterns: [
      /discord\.com\//i,
      /cdn\.discordapp\.com\//i,
      /media\.discordapp\.net\//i,
    ],
  },
  {
    platform: "telegram",
    label: "Telegram",
    domain: "t.me",
    patterns: [
      /t\.me\//i,
      /telegram\.org\//i,
      /cdn\d*\.telesco\.pe\//i,
    ],
  },
  {
    platform: "whatsapp",
    label: "WhatsApp",
    domain: "whatsapp.com",
    patterns: [
      /whatsapp\.com\//i,
      /whatsapp\.net\//i,
      /mmg\.whatsapp\.net\//i,
    ],
  },
  {
    platform: "weibo",
    label: "Weibo",
    domain: "weibo.com",
    patterns: [
      /weibo\.com\//i,
      /sinaimg\.cn\//i,
      /wbimg\.com\//i,
    ],
  },
];

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Detect which social/media platform an image or video URL belongs to.
 */
export function detectPlatform(url: string): PlatformInfo {
  for (const rule of PLATFORM_RULES) {
    if (rule.patterns.some((p) => p.test(url))) {
      return {
        platform: rule.platform,
        label: rule.label,
        domain: rule.domain,
        supportsAutoThumbnail: rule.supportsAutoThumbnail ?? false,
      };
    }
  }

  // Fallback: try to extract bare hostname as domain
  try {
    const { hostname } = new URL(url);
    return {
      platform: "unknown",
      label: hostname,
      domain: hostname,
      supportsAutoThumbnail: false,
    };
  } catch {
    return {
      platform: "unknown",
      label: "Unknown",
      domain: null,
      supportsAutoThumbnail: false,
    };
  }
}

/**
 * Extract a YouTube video ID from any YouTube URL format:
 *   - https://www.youtube.com/watch?v=VIDEO_ID
 *   - https://youtu.be/VIDEO_ID
 *   - https://youtube.com/shorts/VIDEO_ID
 *   - https://youtube.com/embed/VIDEO_ID
 *   - https://youtube.com/v/VIDEO_ID
 *   - https://www.youtube.com/live/VIDEO_ID
 *
 * Returns null if no video ID is found.
 */
export function extractYouTubeThumbnail(url: string): string | null {
  const patterns: RegExp[] = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,               // watch?v=
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,           // youtu.be/
    /\/shorts\/([a-zA-Z0-9_-]{11})/,             // /shorts/
    /\/embed\/([a-zA-Z0-9_-]{11})/,              // /embed/
    /\/v\/([a-zA-Z0-9_-]{11})/,                  // /v/
    /\/live\/([a-zA-Z0-9_-]{11})/,               // /live/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

/**
 * Build all YouTube thumbnail URLs for a given video ID, ordered best → worst.
 */
export function getYouTubeThumbnailUrls(videoId: string): Record<string, string> {
  return {
    maxresdefault: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    hqdefault:     `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    mqdefault:     `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    sddefault:     `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
    default:       `https://img.youtube.com/vi/${videoId}/default.jpg`,
  };
}

/**
 * Validate that a string is a well-formed URL with an http/https scheme.
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
