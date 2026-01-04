/**
 * Enhanced SMM Panel Category Parser
 * Strips emojis, handles provider formatting, and detects platform from categories and service names
 */

// Emoji regex pattern to strip emojis from category strings
const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{FE00}-\u{FE0F}]|[\u{1F900}-\u{1F9FF}]/gu;

// Strip emojis and clean category string
export function cleanCategoryString(input: string): string {
  if (!input) return '';
  
  return input
    .replace(emojiRegex, '') // Remove emojis
    .replace(/[🔥⭐✨💎🚀💯🎯🌟⚡️💪🏆🎉🎊]/g, '') // Remove common decorative emojis
    .replace(/^\d+\.\s*/, '') // Remove leading numbers like "1. "
    .replace(/^\[.*?\]\s*/, '') // Remove [brackets]
    .replace(/^-+\s*/, '') // Remove leading dashes
    .replace(/\s*-+$/, '') // Remove trailing dashes
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

// Platform detection with extensive keyword matching
const PLATFORM_PATTERNS: Array<{ platform: string; keywords: string[]; aliases: string[] }> = [
  {
    platform: 'instagram',
    keywords: ['instagram', 'insta', 'ig follower', 'ig like', 'ig view', 'ig comment', 'ig save', 'ig reach', 'ig impression', 'igtv', 'ig story', 'ig reel'],
    aliases: ['IG', 'Insta', 'Instagram']
  },
  {
    platform: 'facebook',
    keywords: ['facebook', 'fb ', 'fb.com', 'fb like', 'fb follower', 'fb share', 'fb page', 'fb group', 'fb event', 'fb video', 'fb comment'],
    aliases: ['FB', 'Facebook']
  },
  {
    platform: 'twitter',
    keywords: ['twitter', 'x.com', 'tweet', 'x follower', 'x like', 'x retweet', 'x view', 'x reply', 'x impression', 'x poll', 'x space'],
    aliases: ['Twitter', 'X', 'X.com']
  },
  {
    platform: 'youtube',
    keywords: ['youtube', 'yt ', 'yt.com', 'youtube short', 'yt subscriber', 'yt view', 'yt like', 'yt comment', 'yt share', 'yt watch', 'yt live'],
    aliases: ['YT', 'YouTube', 'Youtube']
  },
  {
    platform: 'tiktok',
    keywords: ['tiktok', 'tik tok', 'tt follower', 'tt like', 'tt view', 'tt share', 'tt comment', 'tt save', 'tt duet', 'tt live'],
    aliases: ['TT', 'TikTok', 'Tik Tok']
  },
  {
    platform: 'telegram',
    keywords: ['telegram', 'tg ', 'tg.me', 'tg channel', 'tg group', 'tg member', 'tg view', 'tg reaction', 'tg post'],
    aliases: ['TG', 'Telegram']
  },
  {
    platform: 'linkedin',
    keywords: ['linkedin', 'linked in', 'linkedin connection', 'linkedin follower', 'linkedin like', 'linkedin share', 'linkedin comment'],
    aliases: ['LinkedIn', 'Linked In']
  },
  {
    platform: 'threads',
    keywords: ['threads', 'thread follower', 'thread like', 'thread view', 'thread repost'],
    aliases: ['Threads']
  },
  {
    platform: 'snapchat',
    keywords: ['snapchat', 'snap ', 'snap score', 'snap view', 'snap follower', 'snap story'],
    aliases: ['Snap', 'Snapchat']
  },
  {
    platform: 'pinterest',
    keywords: ['pinterest', 'pin ', 'pinterest follower', 'pinterest repin', 'pinterest save', 'pinterest like'],
    aliases: ['Pinterest', 'Pin']
  },
  {
    platform: 'twitch',
    keywords: ['twitch', 'twitch follower', 'twitch viewer', 'twitch subscriber', 'twitch chat', 'twitch clip'],
    aliases: ['Twitch']
  },
  {
    platform: 'discord',
    keywords: ['discord', 'discord member', 'discord server', 'discord boost', 'discord online'],
    aliases: ['Discord', 'DC']
  },
  {
    platform: 'spotify',
    keywords: ['spotify', 'spotify follower', 'spotify stream', 'spotify play', 'spotify save', 'spotify monthly listener', 'spotify playlist'],
    aliases: ['Spotify']
  },
  {
    platform: 'soundcloud',
    keywords: ['soundcloud', 'sound cloud', 'sc play', 'sc follower', 'sc like', 'sc repost', 'sc comment'],
    aliases: ['SoundCloud', 'SC']
  },
  {
    platform: 'audiomack',
    keywords: ['audiomack', 'audio mack', 'audiomack play', 'audiomack follower'],
    aliases: ['Audiomack']
  },
  {
    platform: 'reddit',
    keywords: ['reddit', 'reddit upvote', 'reddit subscriber', 'reddit comment', 'reddit award', 'reddit karma', 'subreddit'],
    aliases: ['Reddit']
  },
  {
    platform: 'vk',
    keywords: ['vk.com', 'vkontakte', ' vk ', 'vk follower', 'vk like', 'vk group', 'vk friend'],
    aliases: ['VK', 'VKontakte']
  },
  {
    platform: 'kick',
    keywords: ['kick.com', ' kick ', 'kick follower', 'kick viewer', 'kick subscriber', 'kick chat'],
    aliases: ['Kick']
  },
  {
    platform: 'rumble',
    keywords: ['rumble', 'rumble view', 'rumble subscriber', 'rumble like'],
    aliases: ['Rumble']
  },
  {
    platform: 'dailymotion',
    keywords: ['dailymotion', 'daily motion', 'dm view', 'dm subscriber'],
    aliases: ['Dailymotion']
  },
  {
    platform: 'deezer',
    keywords: ['deezer', 'deezer play', 'deezer follower'],
    aliases: ['Deezer']
  },
  {
    platform: 'shazam',
    keywords: ['shazam', 'shazam count'],
    aliases: ['Shazam']
  },
  {
    platform: 'tidal',
    keywords: ['tidal', 'tidal play', 'tidal stream'],
    aliases: ['Tidal']
  },
  {
    platform: 'reverbnation',
    keywords: ['reverbnation', 'reverb nation'],
    aliases: ['ReverbNation']
  },
  {
    platform: 'mixcloud',
    keywords: ['mixcloud', 'mix cloud'],
    aliases: ['Mixcloud']
  },
  {
    platform: 'quora',
    keywords: ['quora', 'quora follower', 'quora upvote', 'quora share'],
    aliases: ['Quora']
  },
  {
    platform: 'tumblr',
    keywords: ['tumblr', 'tumblr follower', 'tumblr reblog', 'tumblr like'],
    aliases: ['Tumblr']
  },
  {
    platform: 'clubhouse',
    keywords: ['clubhouse', 'club house', 'clubhouse follower'],
    aliases: ['Clubhouse']
  },
  {
    platform: 'likee',
    keywords: ['likee', 'likee follower', 'likee like', 'likee view'],
    aliases: ['Likee']
  },
  {
    platform: 'kwai',
    keywords: ['kwai', 'kwai follower', 'kwai like', 'kwai view'],
    aliases: ['Kwai']
  },
  {
    platform: 'trovo',
    keywords: ['trovo', 'trovo follower', 'trovo viewer'],
    aliases: ['Trovo']
  },
  {
    platform: 'odysee',
    keywords: ['odysee', 'odysee view', 'odysee follower'],
    aliases: ['Odysee']
  },
  {
    platform: 'bilibili',
    keywords: ['bilibili', 'bili bili', 'bilibili view', 'bilibili follower'],
    aliases: ['Bilibili', 'B站']
  },
  {
    platform: 'lemon8',
    keywords: ['lemon8', 'lemon 8'],
    aliases: ['Lemon8']
  },
  {
    platform: 'bereal',
    keywords: ['bereal', 'be real'],
    aliases: ['BeReal']
  },
  {
    platform: 'weibo',
    keywords: ['weibo', 'weibo follower'],
    aliases: ['Weibo', '微博']
  },
  {
    platform: 'line',
    keywords: ['line app', 'line.me', 'line friend'],
    aliases: ['Line']
  },
  {
    platform: 'patreon',
    keywords: ['patreon', 'patreon member', 'patreon subscriber'],
    aliases: ['Patreon']
  },
  {
    platform: 'medium',
    keywords: ['medium.com', ' medium ', 'medium follower', 'medium clap'],
    aliases: ['Medium']
  },
  {
    platform: 'whatsapp',
    keywords: ['whatsapp', 'whats app', 'wa channel', 'whatsapp channel'],
    aliases: ['WhatsApp', 'WA']
  },
  {
    platform: 'applemusic',
    keywords: ['apple music', 'applemusic', 'itunes', 'apple play', 'apple stream'],
    aliases: ['Apple Music', 'iTunes']
  },
  {
    platform: 'amazonmusic',
    keywords: ['amazon music', 'amazonmusic'],
    aliases: ['Amazon Music']
  },
  {
    platform: 'napster',
    keywords: ['napster'],
    aliases: ['Napster']
  },
  {
    platform: 'iheart',
    keywords: ['iheart', 'iheartradio'],
    aliases: ['iHeartRadio', 'iHeart']
  },
  {
    platform: 'roblox',
    keywords: ['roblox', 'robux', 'roblox visit', 'roblox follower'],
    aliases: ['Roblox']
  },
  {
    platform: 'steam',
    keywords: ['steam', 'steam friend', 'steam wishlist', 'steam review'],
    aliases: ['Steam']
  },
  {
    platform: 'google',
    keywords: ['google review', 'google map', 'google business', 'gmb ', 'google my business'],
    aliases: ['Google', 'GMB']
  },
  {
    platform: 'trustpilot',
    keywords: ['trustpilot', 'trust pilot', 'trustpilot review'],
    aliases: ['Trustpilot']
  },
  {
    platform: 'yelp',
    keywords: ['yelp', 'yelp review'],
    aliases: ['Yelp']
  },
  {
    platform: 'tripadvisor',
    keywords: ['tripadvisor', 'trip advisor'],
    aliases: ['TripAdvisor']
  },
  {
    platform: 'website',
    keywords: ['website traffic', 'web traffic', 'site visitor', 'website visitor', 'seo ', 'backlink'],
    aliases: ['Website', 'Web Traffic', 'SEO']
  }
];

/**
 * Detect platform from category and service name
 * Prioritizes category over service name
 */
export function detectPlatform(category: string, serviceName: string = ''): { platform: string; confidence: number } {
  const cleanedCategory = cleanCategoryString(category).toLowerCase();
  const cleanedName = cleanCategoryString(serviceName).toLowerCase();
  const combinedInput = `${cleanedCategory} ${cleanedName}`;
  
  // First, try exact category match (highest confidence)
  for (const pattern of PLATFORM_PATTERNS) {
    // Check if category directly matches platform alias
    for (const alias of pattern.aliases) {
      if (cleanedCategory === alias.toLowerCase() || cleanedCategory.startsWith(alias.toLowerCase() + ' ')) {
        return { platform: pattern.platform, confidence: 1.0 };
      }
    }
  }
  
  // Second, try keyword matching in category (high confidence)
  for (const pattern of PLATFORM_PATTERNS) {
    for (const keyword of pattern.keywords) {
      if (cleanedCategory.includes(keyword)) {
        return { platform: pattern.platform, confidence: 0.9 };
      }
    }
  }
  
  // Third, try keyword matching in service name (medium confidence)
  for (const pattern of PLATFORM_PATTERNS) {
    for (const keyword of pattern.keywords) {
      if (cleanedName.includes(keyword)) {
        return { platform: pattern.platform, confidence: 0.7 };
      }
    }
  }
  
  // Fourth, try combined input (lower confidence)
  for (const pattern of PLATFORM_PATTERNS) {
    for (const keyword of pattern.keywords) {
      if (combinedInput.includes(keyword)) {
        return { platform: pattern.platform, confidence: 0.5 };
      }
    }
  }
  
  // Default to 'other'
  return { platform: 'other', confidence: 0 };
}

/**
 * Get display name for a platform
 */
export function getPlatformDisplayName(platform: string): string {
  const platformData = PLATFORM_PATTERNS.find(p => p.platform === platform);
  return platformData?.aliases[0] || platform.charAt(0).toUpperCase() + platform.slice(1);
}

/**
 * Parse service type from provider response
 */
export function parseServiceType(type: string | undefined): string {
  if (!type) return 'default';
  
  const normalized = type.toLowerCase().trim();
  
  const typeMap: Record<string, string> = {
    'default': 'default',
    '0': 'default',
    'package': 'package',
    '1': 'package',
    'custom_comments': 'custom_comments',
    'custom comments': 'custom_comments',
    '2': 'custom_comments',
    'custom_comments_package': 'custom_comments_package',
    '3': 'custom_comments_package',
    'mentions_custom_list': 'mentions_custom_list',
    '4': 'mentions_custom_list',
    'mentions_hashtag': 'mentions_hashtag',
    '5': 'mentions_hashtag',
    'mentions_user_followers': 'mentions_user_followers',
    '6': 'mentions_user_followers',
    'mentions_media_likers': 'mentions_media_likers',
    '7': 'mentions_media_likers',
    'poll': 'poll',
    '8': 'poll',
    'subscriptions': 'subscriptions',
    'subscription': 'subscriptions',
    '9': 'subscriptions',
    'comment_likes': 'comment_likes',
    '10': 'comment_likes',
    'comment_replies': 'comment_replies',
    '11': 'comment_replies',
    'invite_from_groups': 'invite_from_groups',
    '12': 'invite_from_groups',
    'drip_feed': 'drip_feed',
    'dripfeed': 'drip_feed'
  };
  
  return typeMap[normalized] || 'default';
}

/**
 * Get human-readable service type label
 */
export function getServiceTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'default': 'Default',
    'package': 'Package',
    'custom_comments': 'Custom Comments',
    'custom_comments_package': 'Custom Comments Package',
    'mentions_custom_list': 'Mentions Custom List',
    'mentions_hashtag': 'Mentions Hashtag',
    'mentions_user_followers': 'Mentions User Followers',
    'mentions_media_likers': 'Mentions Media Likers',
    'poll': 'Poll',
    'subscriptions': 'Subscriptions',
    'comment_likes': 'Comment Likes',
    'comment_replies': 'Comment Replies',
    'invite_from_groups': 'Invite from Groups',
    'drip_feed': 'Drip-feed'
  };
  
  return labels[type] || type;
}

export type Platform = typeof PLATFORM_PATTERNS[number]['platform'] | 'other';
