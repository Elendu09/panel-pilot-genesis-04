// Comprehensive service icon and category detection based on service names
// This maps keywords in service names to their appropriate icon identifiers

// Negative keywords that should force the category to "other"
// These are generic/non-platform-specific services
export const NEGATIVE_KEYWORDS: string[] = [
  "traffic", "geo target", "geo-target", "geotarget", "website", "seo", 
  "backlink", "pbn", "domain", "web visitor", "alexa", "press release", 
  "article", "blog post", "guest post", "content writing", "crypto niche",
  "adult", "gambling", "casino", "nft", "token", "dating", "email",
  "mobile app", "app install", "app review", "google review", "yelp",
  "trustpilot", "tripadvisor", "google map", "google business",
  "captcha", "survey", "signups", "sign up", "registration",
  "referral", "ref link", "shortlink", "download", "software",
  "forex", "binary", "betting", "promotion", "ads ", " ads"
];

// Explicit regex patterns for high-confidence platform detection
// These patterns are tested first and provide the highest confidence
export const EXPLICIT_PATTERNS: Record<string, RegExp[]> = {
  threads: [/\bthreads?\b/i, /\bthreads?\s+(followers|likes|views|reposts|comments|shares)/i],
  instagram: [/\binstagram\b/i, /\binsta(?!nt)\b/i, /\bigtv\b/i, /\breels?\b/i],
  tiktok: [/\btiktok\b/i, /\btik\s*tok\b/i, /\btik-tok\b/i],
  twitter: [/\btwitter\b/i, /\bx\.com\b/i, /\btweet/i, /\bretweet/i],
  youtube: [/\byoutube\b/i, /\byt\b/i, /\byoutuber\b/i, /\bshorts\b/i],
  facebook: [/\bfacebook\b/i, /\bfb\b/i, /\bmeta\b/i],
  telegram: [/\btelegram\b/i, /\btg\b/i],
  linkedin: [/\blinkedin\b/i, /\blinked\s*in\b/i],
  spotify: [/\bspotify\b/i, /\bspoti\b/i],
  soundcloud: [/\bsoundcloud\b/i, /\bsound\s*cloud\b/i],
  audiomack: [/\baudiomack\b/i, /\baudio\s*mack\b/i],
  discord: [/\bdiscord\b/i],
  twitch: [/\btwitch\b/i],
  reddit: [/\breddit\b/i, /\bsubreddit\b/i],
  quora: [/\bquora\b/i],
  clubhouse: [/\bclubhouse\b/i, /\bclub\s*house\b/i],
  vk: [/\bvkontakte\b/i, /\bvk\b/i],
  whatsapp: [/\bwhatsapp\b/i, /\bwhats\s*app\b/i],
  deezer: [/\bdeezer\b/i],
  shazam: [/\bshazam\b/i],
  reverbnation: [/\breverbnation\b/i, /\breverb\s*nation\b/i],
  mixcloud: [/\bmixcloud\b/i, /\bmix\s*cloud\b/i],
  tidal: [/\btidal\b/i],
  napster: [/\bnapster\b/i],
  tumblr: [/\btumblr\b/i],
  likee: [/\blikee\b/i],
  kwai: [/\bkwai\b/i],
  trovo: [/\btrovo\b/i],
  kick: [/\bkick\b/i, /\bkick\s*(followers|views|subs)/i],
  rumble: [/\brumble\b/i],
  dailymotion: [/\bdailymotion\b/i, /\bdaily\s*motion\b/i],
  odysee: [/\bodysee\b/i],
  bilibili: [/\bbilibili\b/i, /\bbili\b/i],
  lemon8: [/\blemon\s*8\b/i],
  bereal: [/\bbereal\b/i, /\bbe\s*real\b/i],
  weibo: [/\bweibo\b/i, /\bsina\s*weibo\b/i],
  line: [/\bline\b/i],
  patreon: [/\bpatreon\b/i],
  medium: [/\bmedium\b/i],
  roblox: [/\broblox\b/i],
  steam: [/\bsteam\b/i],
  pinterest: [/\bpinterest\b/i],
  snapchat: [/\bsnapchat\b/i, /\bsnap\s*(followers|score|views)/i],
  applemusic: [/\bapple\s*music\b/i],
  amazonmusic: [/\bamazon\s*music\b/i],
  iheart: [/\biheart\b/i, /\biheart\s*radio\b/i],
};

// Platform keywords - longer and more specific keywords for fallback matching
// Removed short/ambiguous keywords that cause false positives
export const PLATFORM_KEYWORDS: Record<string, string[]> = {
  instagram: [
    "instagram", "insta followers", "insta likes", "insta views",
    "igtv", "ig followers", "ig likes", "ig views", "ig comments", "ig saves",
    "instagram real", "instagram premium", "instagram hq",
  ],
  facebook: [
    "facebook", "fb likes", "fb followers", "fb page", "fb group", 
    "fb video", "fb post", "facebook page", "facebook group", 
    "facebook video", "facebook likes", "facebook followers",
  ],
  twitter: [
    "twitter", "tweet", "tweets", "retweet", "twitter followers", 
    "twitter likes", "twitter retweets", "twitter views", 
    "x followers", "x likes", "x views", "x.com",
  ],
  youtube: [
    "youtube", "youtuber", "youtube shorts", "yt subscribers", 
    "yt views", "yt likes", "yt comments", "youtube subscribers", 
    "youtube views", "youtube likes", "youtube watch", 
    "youtube hours", "youtube monetization",
  ],
  tiktok: [
    "tiktok", "tik tok", "tik-tok", "tiktok followers", 
    "tiktok likes", "tiktok views", "tiktok shares", 
    "tiktok saves", "tiktok comments", "tt followers", 
    "tt likes", "tt views",
  ],
  linkedin: [
    "linkedin", "linked in", "linked-in", "linkedin followers",
    "linkedin connections", "linkedin likes", "linkedin post",
  ],
  telegram: [
    "telegram", "telegram members", "telegram views", 
    "telegram post", "telegram channel", "telegram group", 
    "tg members", "tg views", "tg channel",
  ],
  snapchat: [
    "snapchat", "snapchat followers", "snapchat views", 
    "snap followers", "snap score", "snap views",
  ],
  pinterest: [
    "pinterest", "pinterest followers", "pinterest repins", 
    "pinterest saves", "pinterest boards",
  ],
  spotify: [
    "spotify", "spotify plays", "spotify followers",
    "spotify streams", "spotify monthly", "spotify listeners",
    "spotify saves", "spotify playlist",
  ],
  soundcloud: [
    "soundcloud", "sound cloud", "soundcloud plays",
    "soundcloud followers", "soundcloud likes", "soundcloud reposts",
  ],
  audiomack: [
    "audiomack", "audio mack", "audiomack plays",
    "audiomack followers", "audiomack downloads",
  ],
  discord: [
    "discord", "discord members", "discord server",
    "discord online", "discord boost", "discord nitro",
  ],
  twitch: [
    "twitch", "twitch followers", "twitch viewers",
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
    "vkontakte", "vk followers", "vk likes",
    "vk friends", "vk group", "vk members",
  ],
  threads: [
    "threads", "threads followers", "threads likes",
    "threads reposts", "threads views",
  ],
  whatsapp: [
    "whatsapp", "whats app", "whatsapp group",
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
  kick: [
    "kick", "kick followers", "kick views", "kick subscribers",
  ],
  rumble: [
    "rumble", "rumble views", "rumble subscribers", "rumble followers",
  ],
  dailymotion: [
    "dailymotion", "daily motion", "dailymotion views",
  ],
  odysee: [
    "odysee", "odysee views", "odysee followers",
  ],
  bilibili: [
    "bilibili", "bilibili views", "bilibili followers",
  ],
  lemon8: [
    "lemon8", "lemon 8", "lemon8 followers",
  ],
  bereal: [
    "bereal", "be real", "bereal friends",
  ],
  weibo: [
    "weibo", "sina weibo", "weibo followers",
  ],
  line: [
    "line friends", "line followers", "line official",
  ],
  patreon: [
    "patreon", "patreon subscribers", "patreon members",
  ],
  medium: [
    "medium", "medium followers", "medium claps",
  ],
  roblox: [
    "roblox", "roblox followers", "roblox friends",
  ],
  steam: [
    "steam", "steam friends", "steam followers",
  ],
  applemusic: [
    "apple music", "applemusic", "apple music plays",
  ],
  amazonmusic: [
    "amazon music", "amazonmusic", "amazon music plays",
  ],
  iheart: [
    "iheart", "iheart radio", "iheartradio",
  ],
};

// Service type priority for sorting within categories
export const SERVICE_TYPE_PRIORITY = [
  'followers', 'subscribers', 'members',    // Audience growth
  'likes', 'reactions', 'hearts',           // Engagement
  'views', 'plays', 'streams', 'watch',     // Views/plays
  'comments', 'replies',                    // Comments
  'shares', 'reposts', 'retweets',          // Shares
  'saves', 'bookmarks',                     // Saves
  'general'                                 // Default fallback
];

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
 * Normalizes service name for better keyword matching
 * Removes brackets, extra punctuation, and normalizes spacing
 */
const normalizeServiceName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[\[\]\(\)\{\}]/g, ' ') // Remove brackets
    .replace(/[^\w\s]/g, ' ')         // Remove special chars except letters/numbers
    .replace(/\s+/g, ' ')             // Collapse multiple spaces
    .trim();
};

/**
 * Check if service name contains any negative keywords (should be "other")
 */
const containsNegativeKeyword = (normalizedName: string): boolean => {
  for (const negative of NEGATIVE_KEYWORDS) {
    if (normalizedName.includes(negative.toLowerCase())) {
      return true;
    }
  }
  return false;
};

/**
 * Detects the platform/category from a service name with confidence scoring
 * Uses explicit regex patterns first, then falls back to keyword matching
 */
export const detectPlatformWithConfidence = (serviceName: string): { 
  platform: string; 
  confidence: number;
  matchedPattern?: string;
} => {
  const normalizedName = normalizeServiceName(serviceName);
  
  // Check negative keywords FIRST - these force "other" category
  if (containsNegativeKeyword(normalizedName)) {
    return { platform: 'other', confidence: 1.0, matchedPattern: 'negative_keyword' };
  }
  
  // Track best match
  let bestMatch = { platform: 'other', confidence: 0, matchedPattern: undefined as string | undefined };
  
  // Priority order for platform checking (specific platforms first)
  const priorityOrder = [
    'threads', 'kick', 'trovo', 'kwai', 'likee', 'rumble', 'odysee', 'bilibili',
    'lemon8', 'bereal', 'audiomack', 'mixcloud', 'reverbnation', 'shazam', 
    'deezer', 'tidal', 'napster', 'applemusic', 'amazonmusic', 'iheart',
    'clubhouse', 'quora', 'tumblr', 'medium', 'patreon', 'roblox', 'steam',
    'dailymotion', 'weibo', 'line', 'vk', 
    // Then major platforms
    'instagram', 'facebook', 'twitter', 'youtube', 'tiktok', 
    'linkedin', 'telegram', 'spotify', 'soundcloud', 'discord', 
    'twitch', 'reddit', 'whatsapp', 'pinterest', 'snapchat'
  ];
  
  // Check explicit regex patterns first (highest priority, confidence 0.95+)
  for (const platform of priorityOrder) {
    const patterns = EXPLICIT_PATTERNS[platform];
    if (patterns) {
      for (const pattern of patterns) {
        if (pattern.test(serviceName)) {
          // For exact platform name matches, give highest confidence
          const isExactPlatformMatch = serviceName.toLowerCase().includes(platform);
          const confidence = isExactPlatformMatch ? 1.0 : 0.95;
          
          if (confidence > bestMatch.confidence) {
            bestMatch = { platform, confidence, matchedPattern: pattern.source };
          }
        }
      }
    }
    
    // If we found a high-confidence match, stop looking
    if (bestMatch.confidence >= 0.95) {
      return bestMatch;
    }
  }
  
  // Fall back to keyword matching if no regex match found
  if (bestMatch.confidence < 0.8) {
    for (const platform of priorityOrder) {
      const keywords = PLATFORM_KEYWORDS[platform];
      if (keywords) {
        for (const keyword of keywords) {
          const normalizedKeyword = keyword.toLowerCase().trim();
          
          if (normalizedName.includes(normalizedKeyword)) {
            // Longer keywords = more specific = higher confidence
            const keywordScore = normalizedKeyword.length / 10;
            const confidence = Math.min(0.85, 0.6 + keywordScore);
            
            if (confidence > bestMatch.confidence) {
              bestMatch = { platform, confidence, matchedPattern: keyword };
            }
          }
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
  const { platform, confidence } = detectPlatformWithConfidence(rawCategory);
  
  // Only use detected platform if confidence is reasonable
  if (confidence >= 0.6) {
    return platform;
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
    const { platform: detectedCategory } = detectPlatformWithConfidence(service.name);
    const icon = getServiceIcon(service.name, detectedCategory);
    
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
  { id: "soundcloud", label: "SoundCloud", color: "from-orange-500 to-orange-400" },
  { id: "audiomack", label: "Audiomack", color: "from-orange-400 to-yellow-400" },
  { id: "discord", label: "Discord", color: "from-indigo-500 to-indigo-400" },
  { id: "twitch", label: "Twitch", color: "from-purple-600 to-purple-400" },
  { id: "reddit", label: "Reddit", color: "from-orange-600 to-orange-400" },
  { id: "quora", label: "Quora", color: "from-red-700 to-red-500" },
  { id: "clubhouse", label: "Clubhouse", color: "from-amber-100 to-amber-200" },
  { id: "threads", label: "Threads", color: "from-gray-800 to-gray-600" },
  { id: "whatsapp", label: "WhatsApp", color: "from-green-600 to-green-400" },
  { id: "tumblr", label: "Tumblr", color: "from-slate-700 to-slate-500" },
  { id: "vk", label: "VKontakte", color: "from-blue-500 to-blue-400" },
  { id: "deezer", label: "Deezer", color: "from-cyan-500 to-cyan-400" },
  { id: "shazam", label: "Shazam", color: "from-blue-500 to-blue-400" },
  { id: "reverbnation", label: "ReverbNation", color: "from-red-600 to-red-400" },
  { id: "mixcloud", label: "Mixcloud", color: "from-violet-600 to-violet-400" },
  { id: "tidal", label: "Tidal", color: "from-gray-900 to-gray-700" },
  { id: "napster", label: "Napster", color: "from-gray-900 to-gray-700" },
  { id: "likee", label: "Likee", color: "from-teal-500 to-teal-400" },
  { id: "kwai", label: "Kwai", color: "from-orange-500 to-orange-400" },
  { id: "trovo", label: "Trovo", color: "from-emerald-500 to-emerald-400" },
  { id: "kick", label: "Kick", color: "from-green-500 to-green-400" },
  { id: "rumble", label: "Rumble", color: "from-lime-500 to-lime-400" },
  { id: "dailymotion", label: "Dailymotion", color: "from-blue-600 to-blue-400" },
  { id: "odysee", label: "Odysee", color: "from-pink-500 to-pink-400" },
  { id: "bilibili", label: "Bilibili", color: "from-cyan-500 to-cyan-400" },
  { id: "lemon8", label: "Lemon8", color: "from-yellow-400 to-yellow-300" },
  { id: "bereal", label: "BeReal", color: "from-gray-900 to-gray-700" },
  { id: "weibo", label: "Weibo", color: "from-red-600 to-red-400" },
  { id: "line", label: "Line", color: "from-green-500 to-green-400" },
  { id: "patreon", label: "Patreon", color: "from-orange-500 to-orange-400" },
  { id: "medium", label: "Medium", color: "from-gray-900 to-gray-700" },
  { id: "roblox", label: "Roblox", color: "from-red-500 to-red-400" },
  { id: "steam", label: "Steam", color: "from-slate-800 to-slate-600" },
  { id: "applemusic", label: "Apple Music", color: "from-pink-500 to-red-500" },
  { id: "amazonmusic", label: "Amazon Music", color: "from-teal-400 to-teal-300" },
  { id: "iheart", label: "iHeart Radio", color: "from-red-600 to-red-400" },
  { id: "other", label: "Other", color: "from-gray-500 to-gray-400" },
];
