// Comprehensive service icon and category detection based on service names
// This maps keywords in service names to their appropriate icon identifiers

// ============= PLATFORM SHORTFORMS =============
// Common abbreviations used as first word in service names
export const PLATFORM_SHORTFORMS: Record<string, string> = {
  // ============ MAJOR PLATFORMS ============
  // Instagram
  'ig': 'instagram',
  'insta': 'instagram',
  'gram': 'instagram',
  'igtv': 'instagram',
  'reels': 'instagram',
  'инстаграм': 'instagram', // Russian
  'инста': 'instagram',
  
  // Facebook
  'fb': 'facebook',
  'facebook': 'facebook',
  'фейсбук': 'facebook', // Russian
  
  // Twitter/X
  'tw': 'twitter',
  'x': 'twitter',
  'twtr': 'twitter',
  'tweet': 'twitter',
  'twitter': 'twitter',
  'твиттер': 'twitter', // Russian
  
  // YouTube
  'yt': 'youtube',
  'tube': 'youtube',
  'ytb': 'youtube',
  'youtube': 'youtube',
  'shorts': 'youtube',
  'ютуб': 'youtube', // Russian
  
  // TikTok
  'tt': 'tiktok',
  'tok': 'tiktok',
  'tiktok': 'tiktok',
  'тикток': 'tiktok', // Russian
  
  // Telegram
  'tg': 'telegram',
  'telg': 'telegram',
  'телеграм': 'telegram', // Russian
  
  // LinkedIn
  'li': 'linkedin',
  'ln': 'linkedin',
  'lkdn': 'linkedin',
  'lnkd': 'linkedin',
  
  // Snapchat
  'sc': 'snapchat',
  'snap': 'snapchat',
  
  // Pinterest
  'pt': 'pinterest',
  'pin': 'pinterest',
  'pnt': 'pinterest',
  
  // WhatsApp
  'wa': 'whatsapp',
  'whtsp': 'whatsapp',
  'whatsapp': 'whatsapp',
  
  // Discord
  'dc': 'discord',
  'disc': 'discord',
  
  // ============ VK VARIATIONS ============
  'vk': 'vk',
  'vk.com': 'vk',
  'vkontakte': 'vk',
  'вк': 'vk', // Russian
  'вконтакте': 'vk', // Russian full
  'vkcom': 'vk',
  
  // ============ THREADS ============
  'th': 'threads',
  'thrd': 'threads',
  'thread': 'threads',
  'threads': 'threads',
  
  // ============ MUSIC PLATFORMS ============
  // Spotify
  'sp': 'spotify',
  'spfy': 'spotify',
  'spot': 'spotify',
  'spc': 'spotify',
  'spotify': 'spotify',
  
  // Audiomack
  'am': 'audiomack',
  'aud': 'audiomack',
  'audio': 'audiomack',
  'mack': 'audiomack',
  'audiomack': 'audiomack',
  
  // SoundCloud
  'scl': 'soundcloud',
  'scloud': 'soundcloud',
  'snc': 'soundcloud',
  'soundcloud': 'soundcloud',
  
  // Other Music
  'dz': 'deezer',
  'deezer': 'deezer',
  'shz': 'shazam',
  'shazam': 'shazam',
  'td': 'tidal',
  'tidal': 'tidal',
  'rv': 'reverbnation',
  'reverb': 'reverbnation',
  'mc': 'mixcloud',
  'mixcloud': 'mixcloud',
  'np': 'napster',
  'napster': 'napster',
  'apm': 'applemusic',
  'apple': 'applemusic',
  'amz': 'amazonmusic',
  'amazon': 'amazonmusic',
  'ih': 'iheart',
  'iheart': 'iheart',
  
  // ============ STREAMING/VIDEO ============
  'twt': 'twitch',
  'twitch': 'twitch',
  'rb': 'rumble',
  'rumble': 'rumble',
  'dm': 'dailymotion',
  'daily': 'dailymotion',
  'bb': 'bilibili',
  'bili': 'bilibili',
  'bilibili': 'bilibili',
  'od': 'odysee',
  'odysee': 'odysee',
  'kk': 'kick',
  'kick': 'kick',
  'tv': 'trovo',
  'trovo': 'trovo',
  
  // ============ OTHER SOCIAL ============
  'rd': 'reddit',
  'reddit': 'reddit',
  'qr': 'quora',
  'quora': 'quora',
  'tm': 'tumblr',
  'tumblr': 'tumblr',
  'md': 'medium',
  'medium': 'medium',
  'ptr': 'patreon',
  'patreon': 'patreon',
  'lk': 'likee',
  'likee': 'likee',
  'kw': 'kwai',
  'kwai': 'kwai',
  'ch': 'clubhouse',
  'clubhouse': 'clubhouse',
  'wb': 'weibo',
  'weibo': 'weibo',
  'sina': 'weibo',
  'br': 'bereal',
  'bereal': 'bereal',
  'l8': 'lemon8',
  'lemon8': 'lemon8',
  'ln8': 'line',
  'line': 'line',
  
  // ============ GAMING ============
  'rx': 'roblox',
  'rbx': 'roblox',
  'rob': 'roblox',
  'roblox': 'roblox',
  'stm': 'steam',
  'steam': 'steam',
  'valve': 'steam',
  
  // ============ ADDITIONAL PLATFORMS ============
  // Alternative Video Platforms
  'gt': 'gettr',
  'gettr': 'gettr',
  'ts': 'truthsocial',
  'truth': 'truthsocial',
  'truthsocial': 'truthsocial',
  'parler': 'parler',
  'mastodon': 'mastodon',
  'mstd': 'mastodon',
  'bsky': 'bluesky',
  'bluesky': 'bluesky',
  'gab': 'gab',
  'minds': 'minds',
  
  // Live Streaming
  'cf': 'caffeine',
  'caffeine': 'caffeine',
  'dl': 'dlive',
  'dlive': 'dlive',
  'nimo': 'nimotv',
  'nimotv': 'nimotv',
  'bigo': 'bigo',
  'bigolive': 'bigo',
  
  // Asian Platforms
  'douyin': 'douyin',
  'dy': 'douyin',
  'xiaohongshu': 'xiaohongshu',
  'xhs': 'xiaohongshu',
  'redbook': 'xiaohongshu',
  'qq': 'qq',
  'wechat': 'wechat',
  'wx': 'wechat',
  'kuaishou': 'kuaishou',
  'ks': 'kuaishou',
  'momo': 'momo',
  
  // Music Discovery
  'yt music': 'youtubemusic',
  'ytmusic': 'youtubemusic',
  'pandora': 'pandora',
  'anghami': 'anghami',
  'jiosaavn': 'jiosaavn',
  'gaana': 'gaana',
  'wynk': 'wynk',
  
  // Review & Business
  'gmb': 'googlebusiness',
  'google maps': 'googlebusiness',
  'google business': 'googlebusiness',
  'gb': 'googlebusiness',
  'tp': 'trustpilot',
  'trustpilot': 'trustpilot',
  'yl': 'yelp',
  'yelp': 'yelp',
  'ta': 'tripadvisor',
  'tripadvisor': 'tripadvisor',
  
  // Professional
  'behance': 'behance',
  'dribbble': 'dribbble',
  'deviantart': 'deviantart',
  'da': 'deviantart',
  'flickr': 'flickr',
  '500px': '500px',
  'vero': 'vero',
  
  // Podcasts
  'podcast': 'podcast',
  'anchor': 'anchor',
  'buzzsprout': 'buzzsprout',
};

// ============= COUNTRY/QUALITY PREFIXES TO SKIP =============
// These are geo-targeting or quality prefixes, not platform names
export const IGNORED_PREFIXES: string[] = [
  // Country codes (ISO 3166-1 alpha-2)
  'fr', 'ca', 'us', 'uk', 'de', 'it', 'es', 'br', 'mx', 'ar',
  'au', 'nz', 'jp', 'kr', 'cn', 'in', 'ru', 'pl', 'nl', 'be',
  'se', 'no', 'dk', 'fi', 'at', 'ch', 'pt', 'ie', 'za', 'ng',
  'eg', 'ae', 'sa', 'tr', 'id', 'th', 'vn', 'ph', 'my', 'sg',
  'hk', 'tw', 'pk', 'bd', 'lk', 'np', 'ua', 'cz', 'hu', 'ro',
  'gr', 'il', 'ke', 'gh', 'ma', 'dz', 'tn', 'cl', 'co', 'pe',
  've', 'ec', 'uy', 'py', 'bo', 'cr', 'pa', 'do', 'pr', 'jm',
  'cu', 'ht', 'gt', 'hn', 'sv', 'ni', 'kw', 'qa', 'bh', 'om',
  'lb', 'jo', 'ps', 'iq', 'ly', 'sd', 'et', 'tz', 'ug', 'rw',
  'zm', 'zw', 'bw', 'na', 'mz', 'ao', 'cd', 'cm', 'ci', 'sn',
  'ml', 'bf', 'ne', 'tg', 'bj', 'gm', 'sl', 'lr', 'gn', 'mg',
  // Quality/speed modifiers
  'nr', 'hq', 'real', 'fast', 'slow', 'cheap', 'premium', 'instant',
  'best', 'top', 'super', 'ultra', 'mega', 'pro', 'vip', 'new',
  'hot', 'old', 'mixed', 'pure', 'safe', 'max', 'mini', 'low',
  'high', 'mid', 'std', 'basic', 'lite', 'plus', 'extra', 'bulk',
  // Targeting modifiers
  'targeted', 'organic', 'active', 'legit', 'quality', 'verified',
  'authentic', 'genuine', 'original', 'exclusive', 'custom', 'special',
  'niche', 'specific', 'selected', 'handpicked', 'curated',
  // Regional
  'worldwide', 'global', 'intl', 'international', 'local', 'native',
  'usa', 'europe', 'asia', 'africa', 'latam', 'mena', 'apac',
  'regional', 'country', 'geo', 'location', 'based',
];

// Negative keywords that should force the category to "other"
// These are generic/non-platform-specific services
// IMPORTANT: Do NOT include valid platform names here (google review, yelp, trustpilot, etc.)
// Those are real platforms with their own categories and should be detected correctly
export const NEGATIVE_KEYWORDS: string[] = [
  "traffic", "geo target", "geo-target", "geotarget", "website", "seo", 
  "backlink", "pbn", "domain", "web visitor", "alexa", "press release", 
  "article", "blog post", "guest post", "content writing", "crypto niche",
  "adult", "gambling", "casino", "nft", "token", "dating",
  "mobile app", "app install", "app review",
  "captcha", "survey", "signups", "sign up", "registration",
  "referral", "ref link", "shortlink", "download", "software",
  "forex", "binary", "betting", "promotion", "ads ", " ads",
  // Additional negative keywords
  "vpn", "proxy", "email list", "email marketing", "bulk email",
  "wordpress", "woocommerce", "shopify", "amazon product",
  "fiverr", "upwork", "freelancer", "captcha solving",
  "phone verified", "pva", "aged account", "old account",
  "bot ", " bot", "automation", "script", "software license",
  "hosting", "server", "domain name", "ssl certificate",
  "sms", "phone number", "call ", " call", "voip",
];

// Explicit regex patterns for high-confidence platform detection
// These patterns are tested first and provide the highest confidence
export const EXPLICIT_PATTERNS: Record<string, RegExp[]> = {
  threads: [/\bthreads?\b/i, /\bthreads?\s+(followers|likes|views|reposts|comments|shares)/i],
  instagram: [/\binstagram\b/i, /\binsta(?!nt)\b/i, /\bigtv\b/i, /\breels?\b/i],
  tiktok: [/\btiktok\b/i, /\btik\s*tok\b/i, /\btik-tok\b/i],
  twitter: [/\btwitter\b/i, /\bx\.com\b/i, /\btweet/i, /\bretweet/i],
  youtube: [/\byoutube\b/i, /\byt\b/i, /\byoutuber\b/i, /\bshorts\b/i],
  facebook: [/\bfacebook\b/i, /\bmeta\b/i],
  telegram: [/\btelegram\b/i],
  linkedin: [/\blinkedin\b/i, /\blinked\s*in\b/i],
  spotify: [/\bspotify\b/i, /\bspoti\b/i],
  soundcloud: [/\bsoundcloud\b/i, /\bsound\s*cloud\b/i],
  audiomack: [/\baudiomack\b/i, /\baudio\s*mack\b/i],
  discord: [/\bdiscord\b/i],
  twitch: [/\btwitch\b/i],
  reddit: [/\breddit\b/i, /\bsubreddit\b/i],
  quora: [/\bquora\b/i],
  clubhouse: [/\bclubhouse\b/i, /\bclub\s*house\b/i],
  vk: [/\bvkontakte\b/i, /\bvk\.com\b/i, /\bvk\s/i, /^vk\b/i],
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
    "fans", "fan", "audience", "connections", "friends",
  ],
  likes: [
    "like", "likes", "heart", "hearts", "love", "reactions", "upvote", "upvotes",
  ],
  views: [
    "view", "views", "watch", "watches", "impressions", "reach", "visitors",
  ],
  comments: [
    "comment", "comments", "reply", "replies", "respond", "responses",
  ],
  shares: [
    "share", "shares", "retweet", "retweets", "repost", "reposts", "reblog",
  ],
  saves: [
    "save", "saves", "bookmark", "bookmarks", "collection",
  ],
  members: [
    "member", "members", "group member", "channel member", "join",
  ],
  plays: [
    "play", "plays", "stream", "streams", "listen", "listens", 
    "monthly listeners", "downloads", "download", "spins",
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

// Quality priority for sorting (higher = better, appears first)
export const QUALITY_PRIORITY: Record<string, number> = {
  premium: 1,
  fast: 2,
  refill: 3,
  standard: 4,
  slow: 5,
  cheap: 6,
  noRefill: 7,
};

/**
 * Detects the quality level of a service based on keywords
 * Returns a number for sorting (lower = higher priority)
 */
export const getQualityOrder = (serviceName: string): number => {
  const lowerName = serviceName.toLowerCase();
  
  for (const [quality, keywords] of Object.entries(QUALITY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerName.includes(keyword)) {
        return QUALITY_PRIORITY[quality] || 99;
      }
    }
  }
  
  return 50; // Default middle priority for unknown quality
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
 * Enhanced platform detection with shortform recognition and intelligent full-text scanning
 * Handles patterns like:
 * - "IG Followers" → Instagram (shortform first word)
 * - "FR Audiomack stream" → Audiomack (country code prefix, scan remaining text)
 * - "VK.com Members" → VKontakte (shortform with domain)
 * - "FB Facebook Likes" → Facebook (shortform matches)
 */
export const detectPlatformEnhanced = (serviceName: string): {
  platform: string;
  confidence: number;
  matchType: 'shortform' | 'explicit' | 'keyword' | 'fullscan' | 'none';
  matchedTerm?: string;
} => {
  const normalizedName = normalizeServiceName(serviceName);
  const originalLower = serviceName.toLowerCase();
  const words = normalizedName.split(/\s+/).filter(w => w.length > 0);
  
  // Step 0: Check negative keywords FIRST
  if (containsNegativeKeyword(normalizedName)) {
    return { platform: 'other', confidence: 1.0, matchType: 'none', matchedTerm: 'negative_keyword' };
  }
  
  // Step 1: Check first word for shortform (highest priority)
  const firstWord = words[0]?.toLowerCase();
  if (firstWord && PLATFORM_SHORTFORMS[firstWord]) {
    return {
      platform: PLATFORM_SHORTFORMS[firstWord],
      confidence: 0.98,
      matchType: 'shortform',
      matchedTerm: firstWord
    };
  }
  
  // Step 2: If first word is an ignored prefix (country code, quality modifier), analyze remaining text
  if (firstWord && IGNORED_PREFIXES.includes(firstWord)) {
    // Check second word for shortform
    const secondWord = words[1]?.toLowerCase();
    if (secondWord && PLATFORM_SHORTFORMS[secondWord]) {
      return {
        platform: PLATFORM_SHORTFORMS[secondWord],
        confidence: 0.96,
        matchType: 'shortform',
        matchedTerm: secondWord
      };
    }
    
    // Check third word if second was also a prefix
    if (secondWord && IGNORED_PREFIXES.includes(secondWord)) {
      const thirdWord = words[2]?.toLowerCase();
      if (thirdWord && PLATFORM_SHORTFORMS[thirdWord]) {
        return {
          platform: PLATFORM_SHORTFORMS[thirdWord],
          confidence: 0.94,
          matchType: 'shortform',
          matchedTerm: thirdWord
        };
      }
    }
    
    // Full scan remaining text for platform names
    const remainingText = words.slice(1).join(' ');
    for (const [platform, patterns] of Object.entries(EXPLICIT_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(remainingText) || pattern.test(serviceName)) {
          return {
            platform,
            confidence: 0.92,
            matchType: 'fullscan',
            matchedTerm: pattern.source
          };
        }
      }
    }
  }
  
  // Step 3: Check for shortforms anywhere in first 3 words
  for (let i = 0; i < Math.min(3, words.length); i++) {
    const word = words[i]?.toLowerCase();
    if (word && PLATFORM_SHORTFORMS[word] && !IGNORED_PREFIXES.includes(word)) {
      return {
        platform: PLATFORM_SHORTFORMS[word],
        confidence: 0.95 - (i * 0.02), // Slightly lower confidence for later positions
        matchType: 'shortform',
        matchedTerm: word
      };
    }
  }
  
  // Step 4: Explicit regex patterns (second highest priority)
  const priorityOrder = [
    'threads', 'kick', 'trovo', 'kwai', 'likee', 'rumble', 'odysee', 'bilibili',
    'lemon8', 'bereal', 'audiomack', 'mixcloud', 'reverbnation', 'shazam', 
    'deezer', 'tidal', 'napster', 'applemusic', 'amazonmusic', 'iheart',
    'clubhouse', 'quora', 'tumblr', 'medium', 'patreon', 'roblox', 'steam',
    'dailymotion', 'weibo', 'line', 'vk', 
    'instagram', 'facebook', 'twitter', 'youtube', 'tiktok', 
    'linkedin', 'telegram', 'spotify', 'soundcloud', 'discord', 
    'twitch', 'reddit', 'whatsapp', 'pinterest', 'snapchat'
  ];
  
  for (const platform of priorityOrder) {
    const patterns = EXPLICIT_PATTERNS[platform];
    if (patterns) {
      for (const pattern of patterns) {
        if (pattern.test(serviceName)) {
          const isExactMatch = originalLower.includes(platform);
          return {
            platform,
            confidence: isExactMatch ? 1.0 : 0.95,
            matchType: 'explicit',
            matchedTerm: pattern.source
          };
        }
      }
    }
  }
  
  // Step 5: Keyword matching (fallback)
  let bestMatch: { platform: string; confidence: number; matchType: 'shortform' | 'explicit' | 'keyword' | 'fullscan' | 'none'; matchedTerm?: string } = { platform: 'other', confidence: 0, matchType: 'none', matchedTerm: undefined };
  
  for (const platform of priorityOrder) {
    const keywords = PLATFORM_KEYWORDS[platform];
    if (keywords) {
      for (const keyword of keywords) {
        const normalizedKeyword = keyword.toLowerCase().trim();
        if (normalizedName.includes(normalizedKeyword)) {
          const keywordScore = normalizedKeyword.length / 12;
          const confidence = Math.min(0.85, 0.55 + keywordScore);
          
          if (confidence > bestMatch.confidence) {
            bestMatch = { platform, confidence, matchType: 'keyword', matchedTerm: keyword };
          }
        }
      }
    }
  }
  
  if (bestMatch.confidence > 0.5) {
    return bestMatch;
  }
  
  return { platform: 'other', confidence: 0, matchType: 'none' };
};

/**
 * Detects the platform/category from a service name with confidence scoring
 * Uses enhanced detection with shortform recognition
 */
export const detectPlatformWithConfidence = (serviceName: string): { 
  platform: string; 
  confidence: number;
  matchedPattern?: string;
} => {
  const result = detectPlatformEnhanced(serviceName);
  return {
    platform: result.platform,
    confidence: result.confidence,
    matchedPattern: result.matchedTerm
  };
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
 * Gets a sub-category label combining platform and service type
 * Example: "Instagram - Followers", "Facebook - Likes", "Audiomack - Plays"
 */
export const getSubCategory = (serviceName: string): string => {
  const platform = detectPlatform(serviceName);
  const serviceType = detectServiceType(serviceName);
  
  if (platform === 'other') return 'Other Services';
  
  const typeLabels: Record<string, string> = {
    followers: 'Followers',
    subscribers: 'Subscribers',
    members: 'Members',
    likes: 'Likes',
    views: 'Views',
    comments: 'Comments',
    shares: 'Shares',
    saves: 'Saves',
    plays: 'Plays',
    general: '',
  };
  
  // Get platform label from ICON_CATEGORIES or capitalize platform name
  const platformLabel = platform.charAt(0).toUpperCase() + platform.slice(1);
  const typeLabel = typeLabels[serviceType] || '';
  
  return typeLabel ? `${platformLabel} - ${typeLabel}` : platformLabel;
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
 * Comprehensive icon map for UI rendering - 70+ platforms
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
  // 20+ additional platforms for 70+ total coverage
  { id: "gettr", label: "Gettr", color: "from-red-500 to-red-400" },
  { id: "truthsocial", label: "Truth Social", color: "from-blue-600 to-blue-400" },
  { id: "parler", label: "Parler", color: "from-red-700 to-red-500" },
  { id: "mastodon", label: "Mastodon", color: "from-purple-600 to-purple-400" },
  { id: "bluesky", label: "Bluesky", color: "from-sky-500 to-sky-400" },
  { id: "gab", label: "Gab", color: "from-green-600 to-green-400" },
  { id: "minds", label: "Minds", color: "from-yellow-500 to-yellow-400" },
  { id: "caffeine", label: "Caffeine", color: "from-blue-500 to-blue-400" },
  { id: "dlive", label: "DLive", color: "from-yellow-400 to-yellow-300" },
  { id: "nimotv", label: "Nimo TV", color: "from-blue-400 to-blue-300" },
  { id: "bigo", label: "Bigo Live", color: "from-pink-500 to-pink-400" },
  { id: "douyin", label: "Douyin", color: "from-gray-800 to-gray-600" },
  { id: "xiaohongshu", label: "Xiaohongshu", color: "from-red-500 to-red-400" },
  { id: "qq", label: "QQ", color: "from-sky-500 to-sky-400" },
  { id: "wechat", label: "WeChat", color: "from-green-500 to-green-400" },
  { id: "kuaishou", label: "Kuaishou", color: "from-orange-500 to-orange-400" },
  { id: "youtubemusic", label: "YouTube Music", color: "from-red-600 to-red-400" },
  { id: "pandora", label: "Pandora", color: "from-blue-600 to-blue-400" },
  { id: "googlebusiness", label: "Google Business", color: "from-blue-500 to-green-500" },
  { id: "trustpilot", label: "Trustpilot", color: "from-green-600 to-green-400" },
  { id: "yelp", label: "Yelp", color: "from-red-600 to-red-400" },
  { id: "tripadvisor", label: "TripAdvisor", color: "from-green-600 to-green-400" },
  { id: "behance", label: "Behance", color: "from-blue-600 to-blue-400" },
  { id: "dribbble", label: "Dribbble", color: "from-pink-500 to-pink-400" },
  { id: "deviantart", label: "DeviantArt", color: "from-green-700 to-green-500" },
  { id: "flickr", label: "Flickr", color: "from-pink-600 to-blue-500" },
  { id: "vero", label: "Vero", color: "from-gray-900 to-gray-700" },
  { id: "podcast", label: "Podcast", color: "from-purple-600 to-purple-400" },
  { id: "momo", label: "Momo", color: "from-pink-500 to-pink-400" },
  { id: "other", label: "Other", color: "from-gray-500 to-gray-400" },
];

// Valid database categories - these match the service_category enum in Supabase
export const VALID_DB_CATEGORIES = [
  'instagram', 'facebook', 'twitter', 'youtube', 'tiktok', 'linkedin', 'telegram', 'other',
  'threads', 'snapchat', 'pinterest', 'whatsapp', 'twitch', 'discord', 'spotify', 'soundcloud',
  'audiomack', 'reddit', 'vk', 'kick', 'rumble', 'dailymotion', 'deezer', 'shazam', 'tidal',
  'reverbnation', 'mixcloud', 'quora', 'tumblr', 'clubhouse', 'likee', 'kwai', 'trovo', 'odysee',
  'bilibili', 'lemon8', 'bereal', 'weibo', 'line', 'patreon', 'medium', 'roblox', 'steam',
  'applemusic', 'amazonmusic', 'napster', 'iheart',
  // Newly added categories
  'gettr', 'truthsocial', 'parler', 'mastodon', 'bluesky', 'gab', 'minds', 'caffeine', 'dlive',
  'nimotv', 'bigo', 'douyin', 'xiaohongshu', 'qq', 'wechat', 'kuaishou', 'youtubemusic', 'pandora',
  'googlebusiness', 'trustpilot', 'yelp', 'tripadvisor', 'behance', 'dribbble', 'deviantart',
  'flickr', 'vero', 'podcast', 'momo'
] as const;

// Type for valid categories
export type ValidServiceCategory = typeof VALID_DB_CATEGORIES[number];

// Function to validate and map category to a valid database value
export const mapToValidCategory = (category: string): ValidServiceCategory => {
  const normalized = category.toLowerCase().trim();
  
  // Direct match
  if (VALID_DB_CATEGORIES.includes(normalized as ValidServiceCategory)) {
    return normalized as ValidServiceCategory;
  }
  
  // Fallback mappings for edge cases
  const fallbacks: Record<string, ValidServiceCategory> = {
    'x': 'twitter',
    'ytmusic': 'youtubemusic',
    'yt music': 'youtubemusic',
    'youtube music': 'youtubemusic',
    'google business': 'googlebusiness',
    'trip advisor': 'tripadvisor',
    'deviant art': 'deviantart',
    'nimo': 'nimotv',
    'nimo tv': 'nimotv',
    'bigo live': 'bigo',
    'red': 'xiaohongshu',
    'little red book': 'xiaohongshu',
  };
  
  if (fallbacks[normalized]) {
    return fallbacks[normalized];
  }
  
  // Default fallback
  return 'other';
};
