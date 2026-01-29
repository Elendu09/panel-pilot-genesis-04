import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SyncResult {
  providerId: string;
  providerName: string;
  servicesUpdated: number;
  pricesChanged: number;
  newServices: number;
  errors: string[];
}

interface ProviderService {
  service: string | number;
  name: string;
  category: string;
  rate: string | number;
  min: string | number;
  max: string | number;
  desc?: string;
  description?: string;
  type?: string;
  refill?: boolean | string;
  cancel?: boolean | string;
  dripfeed?: boolean;
  average_time?: string;
}

// Emoji regex to strip emojis from category strings
const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{FE00}-\u{FE0F}]|[\u{1F900}-\u{1F9FF}]/gu;

function cleanCategoryString(input: string): string {
  if (!input) return '';
  return input
    .replace(emojiRegex, '')
    .replace(/[🔥⭐✨💎🚀💯🎯🌟⚡️💪🏆🎉🎊]/g, '')
    .replace(/^\d+\.\s*/, '')
    .replace(/^\[.*?\]\s*/, '')
    .replace(/^-+\s*/, '')
    .replace(/\s*-+$/, '')
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

// Platform patterns with comprehensive keywords - ORDER MATTERS (more specific first)
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

const mapCategory = (category: string, serviceName: string = ''): ValidCategory => {
  // Clean the inputs first
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
  for (const { platform } of PLATFORM_PATTERNS) {
    if (cleanedCategory.startsWith(platform + ' ') || cleanedCategory === platform) {
      return platform;
    }
  }
  
  // Step 4: Check keywords in category (priority)
  for (const { platform, keywords } of PLATFORM_PATTERNS) {
    if (keywords.some(kw => cleanedCategory.includes(kw))) {
      return platform;
    }
  }
  
  // Step 5: Check keywords in service name
  for (const { platform, keywords } of PLATFORM_PATTERNS) {
    if (keywords.some(kw => cleanedName.includes(kw))) {
      return platform;
    }
  }
  
  // Step 6: Check combined input
  for (const { platform, keywords } of PLATFORM_PATTERNS) {
    if (keywords.some(kw => combinedInput.includes(kw))) {
      return platform;
    }
  }
  
  return 'other';
};

function parseServiceType(type: string | undefined): string {
  if (!type) return 'default';
  const normalized = String(type).toLowerCase().trim();
  const typeMap: Record<string, string> = {
    'default': 'default', '0': 'default',
    'package': 'package', '1': 'package',
    'custom_comments': 'custom_comments', '2': 'custom_comments',
    'custom_comments_package': 'custom_comments_package', '3': 'custom_comments_package',
    'poll': 'poll', '8': 'poll',
    'subscriptions': 'subscriptions', '9': 'subscriptions',
    'drip_feed': 'drip_feed', 'dripfeed': 'drip_feed',
  };
  return typeMap[normalized] || 'default';
}

function parseBooleanField(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true' || value === '1';
  if (typeof value === 'number') return value === 1;
  return false;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { panelId, providerId, markupPercent = 25, importNew = true } = await req.json();

    if (!panelId) {
      return new Response(
        JSON.stringify({ error: 'Panel ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting sync for panel: ${panelId}, provider: ${providerId || 'all'}, markup: ${markupPercent}%`);

    // Get providers for this panel
    let providerQuery = supabase
      .from('providers')
      .select('*')
      .eq('panel_id', panelId)
      .eq('is_active', true);

    if (providerId) {
      providerQuery = providerQuery.eq('id', providerId);
    }

    const { data: providers, error: providersError } = await providerQuery;

    if (providersError) {
      throw new Error(`Failed to fetch providers: ${providersError.message}`);
    }

    if (!providers || providers.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No active providers found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: SyncResult[] = [];

    for (const provider of providers) {
      // Get provider currency settings
      const providerCurrency = provider.currency || 'USD';
      const currencyRateToUsd = provider.currency_rate_to_usd || 1.0;
      
      console.log(`[SYNC] Provider ${provider.name}: Currency=${providerCurrency}, Rate=${currencyRateToUsd}`);
      
      const result: SyncResult = {
        providerId: provider.id,
        providerName: provider.name,
        servicesUpdated: 0,
        pricesChanged: 0,
        newServices: 0,
        errors: [],
      };

      try {
        // Validate and build provider API URL
        let url: URL;
        try {
          url = new URL(provider.api_endpoint);
        } catch (urlError) {
          result.errors.push(`Invalid API endpoint URL: ${provider.api_endpoint}`);
          results.push(result);
          continue;
        }
        url.searchParams.set('key', provider.api_key);
        url.searchParams.set('action', 'services');

        console.log(`Fetching services from ${provider.name}...`);

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
              'User-Agent': 'SMM-Panel/2.0',
              'Accept': 'application/json'
            },
            signal: controller.signal
          });
        } catch (getError: any) {
          lastError = getError;
          console.log(`GET request failed for ${provider.name}, trying POST fallback...`);
          
          // Try POST as fallback - many providers require POST
          try {
            const postBody = new URLSearchParams();
            postBody.set('key', provider.api_key);
            postBody.set('action', 'services');
            
            response = await fetch(provider.api_endpoint, {
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
              result.errors.push(`Provider API timed out after 30 seconds`);
            } else {
              result.errors.push(`Network error: ${lastError.message || postError.message || 'Failed to connect to provider'}`);
            }
            results.push(result);
            continue;
          }
        }
        clearTimeout(timeout);

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          result.errors.push(`API returned ${response.status}: ${errorText.slice(0, 200)}`);
          results.push(result);
          continue;
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
            result.errors.push(`Invalid JSON response from provider: ${responseText.slice(0, 200)}`);
            results.push(result);
            continue;
          }
        }
        
        // Handle different response formats from various providers
        let providerServices: ProviderService[] = [];
        if (Array.isArray(data)) {
          providerServices = data;
        } else if (data.services) {
          providerServices = data.services;
        } else if (data.data) {
          providerServices = data.data;
        } else if (data.error) {
          result.errors.push(`Provider error: ${data.error}`);
          results.push(result);
          continue;
        }

        console.log(`Found ${providerServices.length} services from ${provider.name}`);

        // Get existing services for this panel
        const providerServiceIds = providerServices.map(s => String(s.service));
        
        // Fetch in batches
        const batchSize = 500;
        const allExistingServices: any[] = [];
        
        for (let i = 0; i < providerServiceIds.length; i += batchSize) {
          const batch = providerServiceIds.slice(i, i + batchSize);
          const { data: batchServices, error: batchError } = await supabase
            .from('services')
            .select('*')
            .eq('panel_id', panelId)
            .in('provider_service_id', batch);
          
          if (!batchError && batchServices) {
            allExistingServices.push(...batchServices);
          }
        }

        const existingByProviderServiceId = new Map(
          allExistingServices.map(s => [s.provider_service_id, s])
        );

        console.log(`Found ${allExistingServices.length} existing services to update`);

        // Prepare batch operations
        const toUpdate: any[] = [];
        const toInsert: any[] = [];
        
        // Process each service - MAINTAIN ORIGINAL ORDER
        providerServices.forEach((providerService, originalIndex) => {
          try {
            const serviceId = String(providerService.service);
            const existing = existingByProviderServiceId.get(serviceId);
            
            // Clean and validate rate - this is in PROVIDER CURRENCY
            const rawRate = String(providerService.rate).replace(/[^0-9.]/g, '');
            const providerRate = parseFloat(rawRate) || 0;
            
            // Skip services with invalid rates
            if (providerRate <= 0) {
              console.log(`Skipping service ${serviceId}: Invalid rate ${providerService.rate}`);
              return;
            }
            
            // CRITICAL: Convert to USD before applying markup
            const costUsd = providerRate * currencyRateToUsd;
            const markupMultiplier = 1 + (markupPercent / 100);
            const finalPrice = costUsd * markupMultiplier;

            // Enhanced category detection with cleaned strings
            const detectedCategory = mapCategory(
              providerService.category || '',
              providerService.name || ''
            );

            const serviceData = {
              panel_id: panelId,
              provider_id: provider.id,
              provider_service_id: serviceId,
              name: providerService.name || `Service ${serviceId}`,
              description: providerService.desc || providerService.description || null,
              category: detectedCategory,
              price: finalPrice,                    // Final price in USD with markup
              provider_price: providerRate,         // Original provider rate (in provider currency)
              provider_cost: providerRate,          // Keep original for reference
              cost_usd: costUsd,                    // Normalized USD cost (before markup)
              markup_percent: markupPercent,
              min_quantity: parseInt(String(providerService.min).replace(/[^0-9]/g, '')) || 1,
              max_quantity: parseInt(String(providerService.max).replace(/[^0-9]/g, '')) || 10000,
              is_active: true,
              display_order: originalIndex,
              service_type: parseServiceType(providerService.type),
              refill_available: parseBooleanField(providerService.refill),
              cancel_available: parseBooleanField(providerService.cancel),
              average_time: providerService.average_time || null,
              updated_at: new Date().toISOString(),
            };

            if (existing) {
              if (Math.abs(existing.price - finalPrice) > 0.001) {
                result.pricesChanged++;
              }
              toUpdate.push({ ...serviceData, id: existing.id });
              result.servicesUpdated++;
            } else if (importNew) {
              toInsert.push({
                ...serviceData,
                created_at: new Date().toISOString(),
              });
              result.newServices++;
            }
          } catch (serviceError: any) {
            console.error(`Error processing service ${providerService.service}:`, serviceError);
            result.errors.push(`Service ${providerService.service}: ${serviceError.message}`);
          }
        });

        // Execute batch updates
        const updateChunkSize = 100;
        for (let i = 0; i < toUpdate.length; i += updateChunkSize) {
          const chunk = toUpdate.slice(i, i + updateChunkSize);
          const { error: updateError } = await supabase
            .from('services')
            .upsert(chunk, { onConflict: 'id' });
          
          if (updateError) {
            console.error(`Batch update error at ${i}:`, updateError);
            result.errors.push(`Batch update failed at ${i}: ${updateError.message}`);
          }
        }

        // Execute batch inserts
        const insertChunkSize = 100;
        for (let i = 0; i < toInsert.length; i += insertChunkSize) {
          const chunk = toInsert.slice(i, i + insertChunkSize);
          const { error: insertError } = await supabase
            .from('services')
            .insert(chunk);
          
          if (insertError) {
            console.error(`Batch insert error at ${i}:`, insertError);
            result.errors.push(`Batch insert failed at ${i}: ${insertError.message}`);
          } else {
            console.log(`Successfully inserted chunk ${i}-${i + chunk.length}`);
          }
        }

        console.log(`Processed: ${result.servicesUpdated} updated, ${result.newServices} new, ${result.pricesChanged} price changes`);

        // Update provider sync timestamp
        await supabase
          .from('providers')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', provider.id);

      } catch (error: any) {
        console.error(`Error syncing provider ${provider.name}:`, error);
        result.errors.push(error.message || 'Unknown error');
      }

      results.push(result);
    }

    // Log sync to audit
    await supabase.from('audit_logs').insert({
      action: 'service_sync',
      resource_type: 'services',
      details: {
        panel_id: panelId,
        markup_percent: markupPercent,
        results: results.map(r => ({
          provider: r.providerName,
          updated: r.servicesUpdated,
          pricesChanged: r.pricesChanged,
          new: r.newServices,
          errors: r.errors.length,
        })),
      },
    });

    const totalNew = results.reduce((sum, r) => sum + r.newServices, 0);
    const totalUpdated = results.reduce((sum, r) => sum + r.servicesUpdated, 0);
    const totalPriceChanges = results.reduce((sum, r) => sum + r.pricesChanged, 0);

    console.log(`Sync completed: ${totalNew} new, ${totalUpdated} updated, ${totalPriceChanges} price changes`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        summary: {
          totalNew,
          totalUpdated,
          totalPriceChanges,
          totalProviders: results.length,
        },
        syncedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Sync error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Sync failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
