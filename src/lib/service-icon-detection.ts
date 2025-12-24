// Comprehensive service icon and category detection based on service names
// This maps keywords in service names to their appropriate icon identifiers

export const PLATFORM_KEYWORDS: Record<string, string[]> = {
  instagram: [
    "instagram", "ig", "insta", "igtv", "reels", "reel",
  ],
  facebook: [
    "facebook", "fb", "meta",
  ],
  twitter: [
    "twitter", "tweet", "x.com", "x ", " x",
  ],
  youtube: [
    "youtube", "yt", "youtuber", "shorts", "youtube shorts",
  ],
  tiktok: [
    "tiktok", "tik tok", "tik-tok", "tt ", " tt",
  ],
  linkedin: [
    "linkedin", "linked in", "linked-in",
  ],
  telegram: [
    "telegram", "tg ", " tg", "telgram",
  ],
  snapchat: [
    "snapchat", "snap", "snpchat",
  ],
  pinterest: [
    "pinterest", "pin", "pins",
  ],
  spotify: [
    "spotify", "spoti",
  ],
  soundcloud: [
    "soundcloud", "sound cloud", "sc ",
  ],
  audiomack: [
    "audiomack", "audio mack", "am ",
  ],
  discord: [
    "discord", "disc",
  ],
  twitch: [
    "twitch", "twtich",
  ],
  reddit: [
    "reddit", "subreddit",
  ],
  quora: [
    "quora",
  ],
  clubhouse: [
    "clubhouse", "club house",
  ],
  vk: [
    "vkontakte", "vk ", " vk",
  ],
  threads: [
    "threads", "thread",
  ],
  whatsapp: [
    "whatsapp", "whats app", "wa ", " wa",
  ],
  deezer: [
    "deezer",
  ],
  shazam: [
    "shazam",
  ],
  reverbnation: [
    "reverbnation", "reverb nation",
  ],
  mixcloud: [
    "mixcloud", "mix cloud",
  ],
  tidal: [
    "tidal",
  ],
  napster: [
    "napster",
  ],
  tumblr: [
    "tumblr",
  ],
  likee: [
    "likee",
  ],
  kwai: [
    "kwai",
  ],
  trovo: [
    "trovo",
  ],
};

export const SERVICE_TYPE_KEYWORDS: Record<string, string[]> = {
  followers: [
    "follower", "followers", "follow", "subs", "subscriber", "subscribers",
  ],
  likes: [
    "like", "likes", "heart", "hearts", "love", "reactions",
  ],
  views: [
    "view", "views", "watch", "watches", "impressions", "reach",
  ],
  comments: [
    "comment", "comments", "reply", "replies", "respond",
  ],
  shares: [
    "share", "shares", "retweet", "repost", "reposts",
  ],
  saves: [
    "save", "saves", "bookmark", "bookmarks",
  ],
  members: [
    "member", "members", "group member", "channel member",
  ],
  plays: [
    "play", "plays", "stream", "streams", "listen", "listens",
  ],
};

export const QUALITY_KEYWORDS: Record<string, string[]> = {
  premium: [
    "premium", "hq", "high quality", "real", "genuine", "organic",
  ],
  standard: [
    "standard", "normal", "regular",
  ],
  cheap: [
    "cheap", "budget", "low cost", "affordable",
  ],
  fast: [
    "fast", "instant", "quick", "speed", "rapid", "express",
  ],
  slow: [
    "slow", "drip", "gradual", "natural",
  ],
  refill: [
    "refill", "guarantee", "warranted", "lifetime",
  ],
  noRefill: [
    "no refill", "non-refill", "nonrefill",
  ],
};

/**
 * Detects the platform/category from a service name
 */
export const detectPlatform = (serviceName: string): string => {
  const lowerName = serviceName.toLowerCase();
  
  for (const [platform, keywords] of Object.entries(PLATFORM_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerName.includes(keyword)) {
        return platform;
      }
    }
  }
  
  return "other";
};

/**
 * Detects the service type from a service name
 */
export const detectServiceType = (serviceName: string): string => {
  const lowerName = serviceName.toLowerCase();
  
  for (const [type, keywords] of Object.entries(SERVICE_TYPE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerName.includes(keyword)) {
        return type;
      }
    }
  }
  
  return "general";
};

/**
 * Gets the appropriate icon identifier for a service
 */
export const getServiceIcon = (serviceName: string, category?: string): string => {
  const platform = category || detectPlatform(serviceName);
  return `icon:${platform}`;
};

/**
 * Maps a raw provider category to our standard categories
 */
export const mapProviderCategory = (rawCategory: string): string => {
  const lowerCat = rawCategory.toLowerCase();
  
  // Direct platform matches
  for (const [platform, keywords] of Object.entries(PLATFORM_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerCat.includes(keyword)) {
        return platform;
      }
    }
  }
  
  return "other";
};

/**
 * Auto-assigns icons and categories to a list of services
 */
export const autoAssignIconsAndCategories = (
  services: Array<{ name: string; category?: string; image_url?: string | null }>
): Array<{ name: string; category: string; image_url: string }> => {
  return services.map((service) => {
    const detectedCategory = service.category || detectPlatform(service.name);
    const icon = service.image_url || getServiceIcon(service.name, detectedCategory);
    
    return {
      ...service,
      category: detectedCategory,
      image_url: icon,
    };
  });
};

/**
 * Comprehensive icon map for UI rendering
 */
export const ICON_CATEGORIES = [
  { id: "instagram", label: "Instagram", color: "from-purple-500 to-pink-500" },
  { id: "facebook", label: "Facebook", color: "from-blue-600 to-blue-400" },
  { id: "twitter", label: "Twitter/X", color: "from-sky-500 to-sky-400" },
  { id: "youtube", label: "YouTube", color: "from-red-600 to-red-400" },
  { id: "tiktok", label: "TikTok", color: "from-pink-500 via-black to-cyan-500" },
  { id: "linkedin", label: "LinkedIn", color: "from-blue-700 to-blue-500" },
  { id: "telegram", label: "Telegram", color: "from-sky-500 to-sky-400" },
  { id: "snapchat", label: "Snapchat", color: "from-yellow-400 to-yellow-300" },
  { id: "pinterest", label: "Pinterest", color: "from-red-600 to-red-400" },
  { id: "spotify", label: "Spotify", color: "from-green-500 to-green-400" },
  { id: "discord", label: "Discord", color: "from-indigo-500 to-indigo-400" },
  { id: "twitch", label: "Twitch", color: "from-purple-600 to-purple-400" },
  { id: "reddit", label: "Reddit", color: "from-orange-600 to-orange-400" },
  { id: "threads", label: "Threads", color: "from-gray-800 to-gray-600" },
  { id: "whatsapp", label: "WhatsApp", color: "from-green-600 to-green-400" },
  { id: "other", label: "Other", color: "from-gray-500 to-gray-400" },
];
