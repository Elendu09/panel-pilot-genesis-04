import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

// Enhanced platform detection patterns
const PLATFORM_PATTERNS: Array<{ platform: string; keywords: string[] }> = [
  { platform: 'instagram', keywords: ['instagram', 'insta', 'ig follower', 'ig like', 'ig view', 'ig comment', 'ig save', 'ig reach', 'igtv', 'ig story', 'ig reel', 'reels'] },
  { platform: 'facebook', keywords: ['facebook', 'fb ', 'fb.com', 'fb like', 'fb follower', 'fb share', 'fb page', 'fb group', 'fb event', 'fb video', 'fb comment'] },
  { platform: 'twitter', keywords: ['twitter', 'x.com', 'tweet', 'x follower', 'x like', 'x retweet', 'x view', 'x reply', 'x impression', 'x poll', 'x space'] },
  { platform: 'youtube', keywords: ['youtube', 'yt ', 'yt.com', 'youtube short', 'yt subscriber', 'yt view', 'yt like', 'yt comment', 'yt share', 'yt watch', 'yt live', 'shorts'] },
  { platform: 'tiktok', keywords: ['tiktok', 'tik tok', 'tt follower', 'tt like', 'tt view', 'tt share', 'tt comment', 'tt save', 'tt duet', 'tt live'] },
  { platform: 'telegram', keywords: ['telegram', 'tg ', 'tg.me', 'tg channel', 'tg group', 'tg member', 'tg view', 'tg reaction', 'tg post'] },
  { platform: 'linkedin', keywords: ['linkedin', 'linked in', 'linkedin connection', 'linkedin follower', 'linkedin like', 'linkedin share', 'linkedin comment'] },
  { platform: 'threads', keywords: ['threads', 'thread follower', 'thread like', 'thread view', 'thread repost'] },
  { platform: 'snapchat', keywords: ['snapchat', 'snap ', 'snap score', 'snap view', 'snap follower', 'snap story'] },
  { platform: 'pinterest', keywords: ['pinterest', 'pin ', 'pinterest follower', 'pinterest repin', 'pinterest save', 'pinterest like'] },
  { platform: 'twitch', keywords: ['twitch', 'twitch follower', 'twitch viewer', 'twitch subscriber', 'twitch chat', 'twitch clip'] },
  { platform: 'discord', keywords: ['discord', 'discord member', 'discord server', 'discord boost', 'discord online'] },
  { platform: 'spotify', keywords: ['spotify', 'spotify follower', 'spotify stream', 'spotify play', 'spotify save', 'spotify monthly listener', 'spotify playlist'] },
  { platform: 'soundcloud', keywords: ['soundcloud', 'sound cloud', 'sc play', 'sc follower', 'sc like', 'sc repost', 'sc comment'] },
  { platform: 'audiomack', keywords: ['audiomack', 'audio mack', 'audiomack play', 'audiomack follower'] },
  { platform: 'reddit', keywords: ['reddit', 'reddit upvote', 'reddit subscriber', 'reddit comment', 'reddit award', 'reddit karma', 'subreddit'] },
  { platform: 'vk', keywords: ['vk.com', 'vkontakte', ' vk ', 'vk follower', 'vk like', 'vk group', 'vk friend'] },
  { platform: 'kick', keywords: ['kick.com', ' kick ', 'kick follower', 'kick viewer', 'kick subscriber', 'kick chat'] },
  { platform: 'rumble', keywords: ['rumble', 'rumble view', 'rumble subscriber', 'rumble like'] },
  { platform: 'dailymotion', keywords: ['dailymotion', 'daily motion', 'dm view', 'dm subscriber'] },
  { platform: 'deezer', keywords: ['deezer', 'deezer play', 'deezer follower'] },
  { platform: 'shazam', keywords: ['shazam', 'shazam count'] },
  { platform: 'tidal', keywords: ['tidal', 'tidal play', 'tidal stream'] },
  { platform: 'reverbnation', keywords: ['reverbnation', 'reverb nation'] },
  { platform: 'mixcloud', keywords: ['mixcloud', 'mix cloud'] },
  { platform: 'quora', keywords: ['quora', 'quora follower', 'quora upvote', 'quora share'] },
  { platform: 'tumblr', keywords: ['tumblr', 'tumblr follower', 'tumblr reblog', 'tumblr like'] },
  { platform: 'clubhouse', keywords: ['clubhouse', 'club house', 'clubhouse follower'] },
  { platform: 'likee', keywords: ['likee', 'likee follower', 'likee like', 'likee view'] },
  { platform: 'kwai', keywords: ['kwai', 'kwai follower', 'kwai like', 'kwai view'] },
  { platform: 'trovo', keywords: ['trovo', 'trovo follower', 'trovo viewer'] },
  { platform: 'odysee', keywords: ['odysee', 'odysee view', 'odysee follower'] },
  { platform: 'bilibili', keywords: ['bilibili', 'bili bili', 'bilibili view', 'bilibili follower'] },
  { platform: 'lemon8', keywords: ['lemon8', 'lemon 8'] },
  { platform: 'bereal', keywords: ['bereal', 'be real'] },
  { platform: 'weibo', keywords: ['weibo', 'weibo follower'] },
  { platform: 'line', keywords: ['line app', 'line.me', 'line friend'] },
  { platform: 'patreon', keywords: ['patreon', 'patreon member', 'patreon subscriber'] },
  { platform: 'medium', keywords: ['medium.com', ' medium ', 'medium follower', 'medium clap'] },
  { platform: 'whatsapp', keywords: ['whatsapp', 'whats app', 'wa channel', 'whatsapp channel'] },
  { platform: 'applemusic', keywords: ['apple music', 'applemusic', 'itunes', 'apple play', 'apple stream'] },
  { platform: 'amazonmusic', keywords: ['amazon music', 'amazonmusic'] },
  { platform: 'napster', keywords: ['napster'] },
  { platform: 'iheart', keywords: ['iheart', 'iheartradio'] },
  { platform: 'roblox', keywords: ['roblox', 'robux', 'roblox visit', 'roblox follower'] },
  { platform: 'steam', keywords: ['steam', 'steam friend', 'steam wishlist', 'steam review'] },
  { platform: 'google', keywords: ['google review', 'google map', 'google business', 'gmb ', 'google my business'] },
  { platform: 'trustpilot', keywords: ['trustpilot', 'trust pilot', 'trustpilot review'] },
  { platform: 'yelp', keywords: ['yelp', 'yelp review'] },
  { platform: 'tripadvisor', keywords: ['tripadvisor', 'trip advisor'] },
  { platform: 'website', keywords: ['website traffic', 'web traffic', 'site visitor', 'website visitor', 'seo ', 'backlink'] },
];

// Platform aliases for direct matching
const PLATFORM_ALIASES: Record<string, string> = {
  'ig': 'instagram', 'insta': 'instagram',
  'fb': 'facebook',
  'yt': 'youtube',
  'tt': 'tiktok', 'tik tok': 'tiktok',
  'tg': 'telegram',
  'x': 'twitter', 'x.com': 'twitter',
  'sc': 'soundcloud',
  'vk': 'vk', 'vkontakte': 'vk',
  'dc': 'discord',
  'wa': 'whatsapp',
};

// Detect platform from category and service name
function detectPlatform(category: string, serviceName: string = ''): string {
  const cleanedCategory = cleanCategoryString(category).toLowerCase();
  const cleanedName = cleanCategoryString(serviceName).toLowerCase();
  const combinedInput = `${cleanedCategory} ${cleanedName}`;
  
  // First, try direct alias match on category
  for (const [alias, platform] of Object.entries(PLATFORM_ALIASES)) {
    if (cleanedCategory === alias || cleanedCategory.startsWith(alias + ' ')) {
      return platform;
    }
  }
  
  // Second, try keyword matching in category (priority)
  for (const pattern of PLATFORM_PATTERNS) {
    for (const keyword of pattern.keywords) {
      if (cleanedCategory.includes(keyword)) {
        return pattern.platform;
      }
    }
  }
  
  // Third, try keyword matching in service name
  for (const pattern of PLATFORM_PATTERNS) {
    for (const keyword of pattern.keywords) {
      if (cleanedName.includes(keyword)) {
        return pattern.platform;
      }
    }
  }
  
  // Fourth, try combined input
  for (const pattern of PLATFORM_PATTERNS) {
    for (const keyword of pattern.keywords) {
      if (combinedInput.includes(keyword)) {
        return pattern.platform;
      }
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

    // Build the request URL with proper query params
    const url = new URL(apiEndpoint);
    url.searchParams.set('key', apiKey);
    url.searchParams.set('action', action);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SMM-Panel/1.0',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Provider API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: `Provider API error: ${response.status}`, details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();

    // Handle different response formats
    let services: ProviderService[] = [];
    
    if (Array.isArray(data)) {
      services = data;
    } else if (data.services && Array.isArray(data.services)) {
      services = data.services;
    } else if (data.error) {
      return new Response(
        JSON.stringify({ error: data.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Raw services received: ${services.length}`);

    // Standardize service format with enhanced detection
    const standardizedServices: StandardizedService[] = services.map((service) => {
      const detectedPlatform = detectPlatform(service.category || '', service.name || '');
      const serviceType = parseServiceType(service.type);
      const refill = parseBoolean(service.refill);
      const cancel = parseBoolean(service.cancel);
      
      return {
        providerId: 'external',
        providerServiceId: String(service.service),
        name: service.name || 'Unknown Service',
        category: detectedPlatform,
        type: service.type || 'default',
        rate: parseFloat(service.rate) || 0,
        min: parseInt(service.min) || 1,
        max: parseInt(service.max) || 10000,
        description: service.description || generateDescription(service, refill, cancel),
        refill,
        cancel,
        serviceType,
        averageTime: service.average_time || '',
      };
    });

    // Log category detection stats
    const categoryStats: Record<string, number> = {};
    standardizedServices.forEach(s => {
      categoryStats[s.category] = (categoryStats[s.category] || 0) + 1;
    });
    console.log('Category detection stats:', categoryStats);

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

  } catch (error) {
    console.error('Error fetching provider services:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch services' }),
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
