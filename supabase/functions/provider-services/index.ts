import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface ProviderService {
  service: string;
  name: string;
  type: string;
  category: string;
  rate: string;
  min: string;
  max: string;
  description?: string;
  refill?: boolean | string;
  cancel?: boolean | string;
  dripfeed?: boolean | string;
  average_time?: string;
}

interface StandardizedService {
  providerId: string;
  providerServiceId: string;
  name: string;
  category: string;
  type: string;
  rate: number;
  min: number;
  max: number;
  description: string;
  refill: boolean;
  cancel: boolean;
  serviceType: string;
  averageTime: string;
}

// Emoji regex pattern to strip emojis from category strings
const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{FE00}-\u{FE0F}]|[\u{1F900}-\u{1F9FF}]/gu;

// Clean category string - strip emojis and normalize
function cleanCategoryString(input: string): string {
  if (!input) return '';
  return input
    .replace(emojiRegex, '')
    .replace(/[🔥⭐✨💎🚀💯🎯🌟⚡️💪🏆🎉🎊]/g, '')
    .replace(/^\d+\.\s*/, '') // Remove leading numbers like "1. "
    .replace(/^\[.*?\]\s*/, '') // Remove [brackets]
    .replace(/^-+\s*/, '') // Remove leading dashes
    .replace(/\s*-+$/, '') // Remove trailing dashes
    .replace(/\s+/g, ' ')
    .trim();
}

// Valid database enum categories - COMPLETE list including 29 new categories
const VALID_CATEGORIES = [
  // Original 47
  'instagram', 'facebook', 'twitter', 'youtube', 'tiktok', 'linkedin', 'telegram',
  'threads', 'snapchat', 'pinterest', 'whatsapp', 'twitch', 'discord', 'spotify',
  'soundcloud', 'audiomack', 'reddit', 'vk', 'kick', 'rumble', 'dailymotion',
  'deezer', 'shazam', 'tidal', 'reverbnation', 'mixcloud', 'quora', 'tumblr',
  'clubhouse', 'likee', 'kwai', 'trovo', 'odysee', 'bilibili', 'lemon8', 'bereal',
  'weibo', 'line', 'patreon', 'medium', 'roblox', 'steam', 'applemusic', 'amazonmusic',
  'napster', 'iheart',
  // New 29 from migration
  'gettr', 'truthsocial', 'parler', 'mastodon', 'bluesky', 'gab', 'minds',
  'caffeine', 'dlive', 'nimotv', 'bigo', 'douyin', 'xiaohongshu', 'qq', 'wechat',
  'kuaishou', 'youtubemusic', 'pandora', 'googlebusiness', 'trustpilot', 'yelp',
  'tripadvisor', 'behance', 'dribbble', 'deviantart', 'flickr', 'vero', 'podcast', 'momo',
  // Misc
  'google', 'website', 'other'
] as const;

type ValidCategory = typeof VALID_CATEGORIES[number];

// Platform patterns with comprehensive keywords - ORDER MATTERS
const PLATFORM_PATTERNS: Array<{ platform: ValidCategory; keywords: string[] }> = [
  // Major platforms first
  { platform: 'instagram', keywords: ['instagram', 'insta ', ' ig ', 'ig follower', 'ig like', 'ig view', 'ig comment', 'ig save', 'ig reach', 'igtv', 'ig story', 'ig reel', 'reels', ' reel '] },
  { platform: 'facebook', keywords: ['facebook', ' fb ', 'fb.com', 'fb like', 'fb follower', 'fb share', 'fb page', 'fb group', 'fb event', 'fb video'] },
  { platform: 'twitter', keywords: ['twitter', 'x.com', 'tweet', ' x follower', ' x like', ' x retweet', ' x view', ' x impression', ' x poll'] },
  { platform: 'youtube', keywords: ['youtube', ' yt ', 'yt.com', 'shorts', 'youtube short', 'yt subscriber', 'yt view', 'yt like', 'yt comment', 'yt watch'] },
  { platform: 'tiktok', keywords: ['tiktok', 'tik tok', ' tt ', 'tt follower', 'tt like', 'tt view', 'tt share', 'tt comment'] },
  { platform: 'linkedin', keywords: ['linkedin', 'linked in', 'linkedin connection', 'linkedin follower', 'linkedin like'] },
  { platform: 'telegram', keywords: ['telegram', ' tg ', 'tg.me', 'tg channel', 'tg group', 'tg member', 'tg view', 'tg post'] },
  { platform: 'threads', keywords: ['threads', 'thread follower', 'thread like', 'thread view'] },
  { platform: 'snapchat', keywords: ['snapchat', 'snap ', 'snap score', 'snap view', 'snap story'] },
  { platform: 'pinterest', keywords: ['pinterest', 'pin ', 'pinterest follower', 'pinterest repin'] },
  { platform: 'whatsapp', keywords: ['whatsapp', 'whats app', 'wa channel', 'whatsapp channel'] },
  { platform: 'twitch', keywords: ['twitch', 'twitch follower', 'twitch viewer', 'twitch subscriber'] },
  { platform: 'discord', keywords: ['discord', 'discord member', 'discord server', 'discord boost'] },
  { platform: 'spotify', keywords: ['spotify', 'spotify follower', 'spotify stream', 'spotify play', 'spotify playlist'] },
  { platform: 'soundcloud', keywords: ['soundcloud', 'sound cloud', ' sc play', ' sc follower'] },
  { platform: 'audiomack', keywords: ['audiomack', 'audio mack'] },
  { platform: 'reddit', keywords: ['reddit', 'reddit upvote', 'subreddit', 'reddit karma'] },
  { platform: 'vk', keywords: ['vk.com', 'vkontakte', ' vk ', 'vk follower', 'vk like'] },
  { platform: 'kick', keywords: ['kick.com', ' kick ', 'kick follower', 'kick viewer'] },
  { platform: 'rumble', keywords: ['rumble', 'rumble view', 'rumble subscriber'] },
  { platform: 'dailymotion', keywords: ['dailymotion', 'daily motion', 'dm view'] },
  { platform: 'deezer', keywords: ['deezer', 'deezer play'] },
  { platform: 'shazam', keywords: ['shazam', 'shazam count'] },
  { platform: 'tidal', keywords: ['tidal', 'tidal play', 'tidal stream'] },
  { platform: 'reverbnation', keywords: ['reverbnation', 'reverb nation'] },
  { platform: 'mixcloud', keywords: ['mixcloud', 'mix cloud'] },
  { platform: 'quora', keywords: ['quora', 'quora follower', 'quora upvote'] },
  { platform: 'tumblr', keywords: ['tumblr', 'tumblr follower', 'tumblr reblog'] },
  { platform: 'clubhouse', keywords: ['clubhouse', 'club house', 'clubhouse follower'] },
  { platform: 'likee', keywords: ['likee', 'likee follower', 'likee like'] },
  { platform: 'kwai', keywords: ['kwai', 'kwai follower', 'kwai like'] },
  { platform: 'trovo', keywords: ['trovo', 'trovo follower'] },
  { platform: 'odysee', keywords: ['odysee', 'odysee view'] },
  { platform: 'bilibili', keywords: ['bilibili', 'bili bili', 'b站'] },
  { platform: 'lemon8', keywords: ['lemon8', 'lemon 8'] },
  { platform: 'bereal', keywords: ['bereal', 'be real'] },
  { platform: 'weibo', keywords: ['weibo', '微博'] },
  { platform: 'line', keywords: ['line app', 'line.me', 'line friend'] },
  { platform: 'patreon', keywords: ['patreon', 'patreon member'] },
  { platform: 'medium', keywords: ['medium.com', ' medium ', 'medium follower', 'medium clap'] },
  { platform: 'roblox', keywords: ['roblox', 'robux', 'roblox visit'] },
  { platform: 'steam', keywords: ['steam', 'steam friend', 'steam wishlist', 'steam review'] },
  { platform: 'applemusic', keywords: ['apple music', 'applemusic', 'itunes', 'apple play'] },
  { platform: 'amazonmusic', keywords: ['amazon music', 'amazonmusic'] },
  { platform: 'napster', keywords: ['napster'] },
  { platform: 'iheart', keywords: ['iheart', 'iheartradio'] },
  // NEW 29 categories
  { platform: 'gettr', keywords: ['gettr', 'gettr follower', 'gettr like'] },
  { platform: 'truthsocial', keywords: ['truthsocial', 'truth social', 'truth follower'] },
  { platform: 'parler', keywords: ['parler', 'parler follower'] },
  { platform: 'mastodon', keywords: ['mastodon', 'masto', 'mastodon follower'] },
  { platform: 'bluesky', keywords: ['bluesky', 'blue sky', 'bsky', 'bluesky follower'] },
  { platform: 'gab', keywords: ['gab', 'gab.com', 'gab follower'] },
  { platform: 'minds', keywords: ['minds', 'minds.com', 'minds follower'] },
  { platform: 'caffeine', keywords: ['caffeine', 'caffeine.tv', 'caffeine follower'] },
  { platform: 'dlive', keywords: ['dlive', 'd.live', 'dlive follower'] },
  { platform: 'nimotv', keywords: ['nimotv', 'nimo.tv', 'nimo', 'nimo follower'] },
  { platform: 'bigo', keywords: ['bigo', 'bigo live', 'bigolive', 'bigo follower'] },
  { platform: 'douyin', keywords: ['douyin', '抖音', 'douyin follower'] },
  { platform: 'xiaohongshu', keywords: ['xiaohongshu', '小红书', 'red', 'little red book', 'xhs'] },
  { platform: 'qq', keywords: [' qq ', 'tencent qq', 'qq.com', 'qq follower'] },
  { platform: 'wechat', keywords: ['wechat', 'weixin', '微信', 'wechat follower'] },
  { platform: 'kuaishou', keywords: ['kuaishou', '快手', 'kuaishou follower'] },
  { platform: 'youtubemusic', keywords: ['youtube music', 'ytmusic', 'yt music'] },
  { platform: 'pandora', keywords: ['pandora', 'pandora music', 'pandora play'] },
  { platform: 'googlebusiness', keywords: ['google business', 'gmb', 'google my business', 'gbp', 'google map review'] },
  { platform: 'behance', keywords: ['behance', 'behance follower', 'behance like'] },
  { platform: 'dribbble', keywords: ['dribbble', 'dribbble follower', 'dribbble like'] },
  { platform: 'deviantart', keywords: ['deviantart', 'deviant art', 'deviantart follower'] },
  { platform: 'flickr', keywords: ['flickr', 'flickr follower', 'flickr like'] },
  { platform: 'vero', keywords: ['vero', 'vero follower'] },
  { platform: 'podcast', keywords: ['podcast', 'podcasts', 'apple podcast', 'google podcast', 'podcast play'] },
  { platform: 'momo', keywords: ['momo', 'momo follower'] },
  { platform: 'trustpilot', keywords: ['trustpilot', 'trust pilot', 'trustpilot review'] },
  { platform: 'yelp', keywords: ['yelp', 'yelp review'] },
  { platform: 'tripadvisor', keywords: ['tripadvisor', 'trip advisor', 'tripadvisor review'] },
  // Generic
  { platform: 'google', keywords: ['google review', 'google map', 'google business'] },
  { platform: 'website', keywords: ['website traffic', 'web traffic', 'site visitor', 'seo ', 'backlink'] },
];

// Platform shortforms for first-word detection - EXTENDED
const PLATFORM_SHORTFORMS: Record<string, ValidCategory> = {
  'ig': 'instagram', 'insta': 'instagram', 'gram': 'instagram', 'igtv': 'instagram', 'reels': 'instagram',
  'fb': 'facebook',
  'tw': 'twitter', 'x': 'twitter', 'twtr': 'twitter', 'tweet': 'twitter',
  'yt': 'youtube', 'tube': 'youtube', 'ytb': 'youtube', 'shorts': 'youtube',
  'tt': 'tiktok', 'tok': 'tiktok',
  'tg': 'telegram', 'telg': 'telegram',
  'li': 'linkedin', 'ln': 'linkedin', 'lkdn': 'linkedin',
  'sc': 'snapchat', 'snap': 'snapchat',
  'pt': 'pinterest', 'pin': 'pinterest',
  'wa': 'whatsapp', 'whtsp': 'whatsapp',
  'dc': 'discord', 'disc': 'discord',
  'vk': 'vk', 'vkontakte': 'vk',
  'th': 'threads', 'thrd': 'threads', 'thread': 'threads',
  'sp': 'spotify', 'spfy': 'spotify', 'spot': 'spotify',
  'am': 'audiomack', 'aud': 'audiomack', 'audio': 'audiomack',
  'scl': 'soundcloud', 'scloud': 'soundcloud',
  'dz': 'deezer', 'shz': 'shazam', 'td': 'tidal',
  'rv': 'reverbnation', 'mc': 'mixcloud', 'np': 'napster',
  'twt': 'twitch', 'rb': 'rumble', 'dm': 'dailymotion',
  'bb': 'bilibili', 'bili': 'bilibili', 'od': 'odysee',
  'kk': 'kick', 'tv': 'trovo',
  'rd': 'reddit', 'qr': 'quora', 'tm': 'tumblr', 'md': 'medium',
  'ptr': 'patreon', 'lk': 'likee', 'kw': 'kwai',
  'ch': 'clubhouse', 'wb': 'weibo', 'br': 'bereal', 'l8': 'lemon8',
  'rx': 'roblox', 'rbx': 'roblox', 'stm': 'steam',
  'apm': 'applemusic', 'amz': 'amazonmusic', 'ih': 'iheart',
  // NEW shortforms
  'gt': 'gettr', 'ts': 'truthsocial', 'pl': 'parler', 'mst': 'mastodon',
  'bs': 'bluesky', 'bsky': 'bluesky', 'nim': 'nimotv', 'bg': 'bigo',
  'dy': 'douyin', 'xhs': 'xiaohongshu', 'ks': 'kuaishou',
  'ytm': 'youtubemusic', 'pd': 'pandora', 'gmb': 'googlebusiness',
  'bh': 'behance', 'dr': 'dribbble', 'da': 'deviantart',
  'fl': 'flickr', 'pc': 'podcast', 'mm': 'momo',
  'tp': 'trustpilot', 'yp': 'yelp', 'ta': 'tripadvisor',
};

// Ignored prefixes (country codes, quality markers)
const IGNORED_PREFIXES = [
  'fr', 'ca', 'us', 'uk', 'de', 'it', 'es', 'br', 'mx', 'ar', 'au', 'nz', 'jp', 'kr', 'cn', 'in', 'ru',
  'nr', 'hq', 'real', 'fast', 'slow', 'cheap', 'premium', 'instant', 'best', 'top', 'super', 'ultra',
  'mega', 'pro', 'vip', 'new', 'hot', 'old', 'mixed', 'pure', 'safe', 'max', 'mini', 'low', 'high',
  'targeted', 'organic', 'active', 'legit', 'quality', 'verified', 'worldwide', 'global', 'intl',
];

// Detect platform from category and service name with enhanced shortform detection
function detectPlatform(category: string, serviceName: string = ''): ValidCategory {
  const cleanedCategory = cleanCategoryString(category).toLowerCase();
  const cleanedName = cleanCategoryString(serviceName).toLowerCase();
  const combinedInput = ` ${cleanedCategory} ${cleanedName} `;
  
  // Step 1: Check if cleaned category exactly matches a valid platform
  if (VALID_CATEGORIES.includes(cleanedCategory as ValidCategory)) {
    return cleanedCategory as ValidCategory;
  }
  
  // Step 2: Check shortforms in first few words
  const words = cleanedName.split(/\s+/).filter(w => w.length > 0);
  for (let i = 0; i < Math.min(3, words.length); i++) {
    const word = words[i];
    // Skip ignored prefixes
    if (IGNORED_PREFIXES.includes(word)) continue;
    // Check shortform match
    if (PLATFORM_SHORTFORMS[word]) {
      return PLATFORM_SHORTFORMS[word];
    }
  }
  
  // Step 3: Check for platform name at start of category
  for (const pattern of PLATFORM_PATTERNS) {
    if (cleanedCategory.startsWith(pattern.platform + ' ') || cleanedCategory === pattern.platform) {
      return pattern.platform;
    }
  }
  
  // Step 4: Check keywords in category (priority)
  for (const pattern of PLATFORM_PATTERNS) {
    if (pattern.keywords.some(kw => cleanedCategory.includes(kw))) {
      return pattern.platform;
    }
  }
  
  // Step 5: Check keywords in service name
  for (const pattern of PLATFORM_PATTERNS) {
    if (pattern.keywords.some(kw => cleanedName.includes(kw))) {
      return pattern.platform;
    }
  }
  
  // Step 6: Check combined input
  for (const pattern of PLATFORM_PATTERNS) {
    if (pattern.keywords.some(kw => combinedInput.includes(kw))) {
      return pattern.platform;
    }
  }
  
  return 'other';
}

// Parse service type from provider
function parseServiceType(type: string | undefined): string {
  if (!type) return 'default';
  const normalized = String(type).toLowerCase().trim();
  
  const typeMap: Record<string, string> = {
    'default': 'default', '0': 'default',
    'package': 'package', '1': 'package',
    'custom_comments': 'custom_comments', 'custom comments': 'custom_comments', '2': 'custom_comments',
    'custom_comments_package': 'custom_comments_package', '3': 'custom_comments_package',
    'mentions_custom_list': 'mentions_custom_list', '4': 'mentions_custom_list',
    'mentions_hashtag': 'mentions_hashtag', '5': 'mentions_hashtag',
    'mentions_user_followers': 'mentions_user_followers', '6': 'mentions_user_followers',
    'mentions_media_likers': 'mentions_media_likers', '7': 'mentions_media_likers',
    'poll': 'poll', '8': 'poll',
    'subscriptions': 'subscriptions', 'subscription': 'subscriptions', '9': 'subscriptions',
    'comment_likes': 'comment_likes', '10': 'comment_likes',
    'comment_replies': 'comment_replies', '11': 'comment_replies',
    'invite_from_groups': 'invite_from_groups', '12': 'invite_from_groups',
    'drip_feed': 'drip_feed', 'dripfeed': 'drip_feed',
  };
  
  return typeMap[normalized] || 'default';
}

// Parse boolean from provider response (handles true, "true", 1, "1", etc.)
function parseBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    return lower === 'true' || lower === '1' || lower === 'yes';
  }
  return false;
}

function extractProviderServiceId(service: Record<string, unknown>): string | null {
  const candidates = [
    service.service,
    service.id,
    service.service_id,
    service.serviceId,
    service.external_service_id,
    service.externalServiceId,
    service.sid,
  ];

  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined) continue;
    const normalized = String(candidate).trim();
    if (normalized) {
      return normalized;
    }
  }

  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { apiEndpoint, apiKey, action = 'services' } = await req.json();

    if (!apiEndpoint || !apiKey) {
      return new Response(
        JSON.stringify({ error: 'API endpoint and API key are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching services from provider: ${apiEndpoint}`);

    // Validate and build the request URL with proper query params
    let url: URL;
    try {
      url = new URL(apiEndpoint);
    } catch (urlError) {
      return new Response(
        JSON.stringify({ error: 'Invalid API endpoint URL format', details: apiEndpoint }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    url.searchParams.set('key', apiKey);
    url.searchParams.set('action', action);

    // Add timeout with AbortController (30 seconds)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    let response: Response;
    let lastError: any = null;

    // Try GET first
    try {
      response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'SMM-Panel/2.0',
          'Accept': 'application/json',
        },
        signal: controller.signal
      });
    } catch (getError: any) {
      lastError = getError;
      console.log('GET request failed, trying POST fallback...');
      
      // Try POST as fallback - many providers require POST
      try {
        const postBody = new URLSearchParams();
        postBody.set('key', apiKey);
        postBody.set('action', action);
        
        response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'SMM-Panel/2.0',
            'Accept': 'application/json'
          },
          body: postBody,
          signal: controller.signal
        });
      } catch (postError: any) {
        clearTimeout(timeout);
        if (lastError.name === 'AbortError' || postError.name === 'AbortError') {
          return new Response(
            JSON.stringify({ error: 'Provider API timed out after 30 seconds' }),
            { status: 504, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        return new Response(
          JSON.stringify({ error: 'Network error connecting to provider', details: lastError.message || postError.message }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('Provider API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: `Provider API error: ${response.status}`, details: errorText.slice(0, 500) }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Enhanced JSON parsing with fallback for malformed responses
    let data;
    const responseText = await response.text();
    try {
      data = JSON.parse(responseText);
    } catch {
      // Some providers return malformed JSON - try to clean it
      const cleaned = responseText
        .trim()
        .replace(/^\uFEFF/, '') // Remove BOM
        .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
        .replace(/,\s*}/g, '}') // Fix trailing commas in objects
        .replace(/,\s*]/g, ']'); // Fix trailing commas in arrays
      try {
        data = JSON.parse(cleaned);
      } catch {
        console.error('Failed to parse provider response:', responseText.slice(0, 200));
        return new Response(
          JSON.stringify({ error: 'Invalid JSON response from provider', details: responseText.slice(0, 200) }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Handle different response formats
    let services: ProviderService[] = [];
    
    if (Array.isArray(data)) {
      services = data;
    } else if (data.services && Array.isArray(data.services)) {
      services = data.services;
    } else if (data.data && Array.isArray(data.data)) {
      services = data.data;
    } else if (data.error) {
      return new Response(
        JSON.stringify({ error: data.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Raw services received: ${services.length}`);

    // Standardize service format with enhanced detection
    const standardizedServices: StandardizedService[] = services.flatMap((service) => {
      const providerServiceId = extractProviderServiceId(service as unknown as Record<string, unknown>);
      if (!providerServiceId) {
        console.warn('[provider-services] Skipping service without detectable provider ID:', JSON.stringify(service).slice(0, 300));
        return [];
      }

      const detectedPlatform = detectPlatform(service.category || '', service.name || '');
      const serviceType = parseServiceType(service.type);
      const refill = parseBoolean(service.refill);
      const cancel = parseBoolean(service.cancel);
      
      // Clean and validate rate
      const rawRate = String(service.rate).replace(/[^0-9.]/g, '');
      const rate = parseFloat(rawRate) || 0;
      const compatibilityId = /^\d+$/.test(providerServiceId) ? Number(providerServiceId) : providerServiceId;
      
      return [{
        providerId: 'external',
        providerServiceId,
        name: service.name || `Service ${providerServiceId}`,
        category: detectedPlatform,
        type: service.type || 'default',
        rate,
        min: parseInt(String(service.min).replace(/[^0-9]/g, '')) || 1,
        max: parseInt(String(service.max).replace(/[^0-9]/g, '')) || 10000,
        description: service.description || generateDescription(service, refill, cancel),
        refill,
        cancel,
        serviceType,
        averageTime: service.average_time || '',
        id: compatibilityId,
        service: compatibilityId,
      } as StandardizedService];
    });

    // Log category detection stats
    const categoryStats: Record<string, number> = {};
    standardizedServices.forEach(s => {
      categoryStats[s.category] = (categoryStats[s.category] || 0) + 1;
    });
    console.log('Category detection stats:', JSON.stringify(categoryStats));

    console.log(`Successfully standardized ${standardizedServices.length} services`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        services: standardizedServices,
        count: standardizedServices.length,
        categoryStats 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error fetching provider services:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || 'Failed to fetch services' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateDescription(service: ProviderService, refill: boolean, cancel: boolean): string {
  const parts = [];
  if (service.min && service.max) {
    parts.push(`Qty: ${service.min} - ${service.max}`);
  }
  if (refill) parts.push('♻️ Refill');
  if (cancel) parts.push('❌ Cancel');
  if (service.average_time) parts.push(`⏱️ ${service.average_time}`);
  return parts.join(' | ') || 'SMM service';
}
