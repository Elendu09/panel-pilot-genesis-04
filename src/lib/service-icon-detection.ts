// Comprehensive service icon and category detection based on service names
// This maps keywords in service names to their appropriate icon identifiers

export const PLATFORM_KEYWORDS: Record<string, string[]> = {
  instagram: [
    "instagram", "ig", "insta", "igtv", "reels", "reel",
    "igram", "instafollow", "instalike", "instavideo",
    "instastory", "story", "stories", "ig followers",
    "ig likes", "ig views", "ig comments", "ig saves",
    "instagram real", "instagram premium", "instagram hq",
  ],
  facebook: [
    "facebook", "fb", "meta", "fb likes", "fb followers",
    "fb page", "fb group", "fb video", "fb post",
    "facebook page", "facebook group", "facebook video",
  ],
  twitter: [
    "twitter", "tweet", "x.com", "x ", " x", "tweets",
    "retweet", "twitter followers", "twitter likes",
    "twitter retweets", "twitter views", "x followers",
  ],
  youtube: [
    "youtube", "yt", "youtuber", "shorts", "youtube shorts",
    "yt subscribers", "yt views", "yt likes", "yt comments",
    "youtube subscribers", "youtube views", "youtube likes",
    "youtube watch", "youtube hours", "youtube monetization",
  ],
  tiktok: [
    "tiktok", "tik tok", "tik-tok", "tt ", " tt",
    "tiktok followers", "tiktok likes", "tiktok views",
    "tiktok shares", "tiktok saves", "tiktok comments",
    "tt followers", "tt likes", "tt views",
  ],
  linkedin: [
    "linkedin", "linked in", "linked-in", "linkedin followers",
    "linkedin connections", "linkedin likes", "linkedin post",
  ],
  telegram: [
    "telegram", "tg ", " tg", "telgram", "telegram members",
    "telegram views", "telegram post", "telegram channel",
    "telegram group", "tg members", "tg views",
  ],
  snapchat: [
    "snapchat", "snap", "snpchat", "snapchat followers",
    "snapchat views", "snap followers", "snap score",
  ],
  pinterest: [
    "pinterest", "pin", "pins", "pinterest followers",
    "pinterest repins", "pinterest saves", "pinterest boards",
  ],
  spotify: [
    "spotify", "spoti", "spotify plays", "spotify followers",
    "spotify streams", "spotify monthly", "spotify listeners",
    "spotify saves", "spotify playlist",
  ],
  soundcloud: [
    "soundcloud", "sound cloud", "sc ", "soundcloud plays",
    "soundcloud followers", "soundcloud likes", "soundcloud reposts",
  ],
  audiomack: [
    "audiomack", "audio mack", "am ", "audiomack plays",
    "audiomack followers", "audiomack downloads",
  ],
  discord: [
    "discord", "disc", "discord members", "discord server",
    "discord online", "discord boost", "discord nitro",
  ],
  twitch: [
    "twitch", "twtich", "twitch followers", "twitch viewers",
    "twitch subs", "twitch subscribers", "twitch views",
  ],
  reddit: [
    "reddit", "subreddit", "reddit upvotes", "reddit karma",
    "reddit followers", "reddit subscribers", "reddit post",
  ],
  quora: [
    "quora", "quora followers", "quora upvotes", "quora views",
  ],
  clubhouse: [
    "clubhouse", "club house", "clubhouse followers",
  ],
  vk: [
    "vkontakte", "vk ", " vk", "vk followers", "vk likes",
    "vk friends", "vk group", "vk members",
  ],
  threads: [
    "threads", "thread", "threads followers", "threads likes",
    "threads reposts", "threads views",
  ],
  whatsapp: [
    "whatsapp", "whats app", "wa ", " wa", "whatsapp group",
    "whatsapp members", "whatsapp channel",
  ],
  deezer: [
    "deezer", "deezer plays", "deezer followers", "deezer fans",
  ],
  shazam: [
    "shazam", "shazam plays", "shazam count",
  ],
  reverbnation: [
    "reverbnation", "reverb nation", "reverbnation plays",
  ],
  mixcloud: [
    "mixcloud", "mix cloud", "mixcloud plays", "mixcloud followers",
  ],
  tidal: [
    "tidal", "tidal plays", "tidal streams",
  ],
  napster: [
    "napster", "napster plays",
  ],
  tumblr: [
    "tumblr", "tumblr followers", "tumblr reblogs", "tumblr likes",
  ],
  likee: [
    "likee", "likee followers", "likee likes", "likee views",
  ],
  kwai: [
    "kwai", "kwai followers", "kwai likes", "kwai views",
  ],
  trovo: [
    "trovo", "trovo followers", "trovo views",
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
 * Detects the platform/category from a service name with confidence scoring
 */
export const detectPlatformWithConfidence = (serviceName: string): { platform: string; confidence: number } => {
  const lowerName = serviceName.toLowerCase();
  let bestMatch = { platform: 'other', confidence: 0 };
  
  for (const [platform, keywords] of Object.entries(PLATFORM_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerName.includes(keyword)) {
        // Calculate confidence based on keyword length relative to service name
        // Longer, more specific keywords get higher confidence
        const confidence = Math.min((keyword.length / lowerName.length) * 3, 1);
        if (confidence > bestMatch.confidence) {
          bestMatch = { platform, confidence };
        }
      }
    }
  }
  
  return bestMatch;
};

/**
 * Detects the platform/category from a service name
 */
export const detectPlatform = (serviceName: string): string => {
  return detectPlatformWithConfidence(serviceName).platform;
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
