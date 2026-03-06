import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// =====================================================
// PROFESSIONAL SERVICE IMPORT - RAW DATA STORAGE
// Stores provider services exactly as received, then normalizes
// =====================================================

interface RawProviderService {
  service: string | number;
  name: string;
  category?: string;
  type?: string;
  rate: string | number;
  min: string | number;
  max: string | number;
  desc?: string;
  description?: string;
  refill?: boolean | string | number;
  cancel?: boolean | string | number;
  dripfeed?: boolean | string | number;
  average_time?: string;
}

interface ImportResult {
  providerId: string;
  providerName: string;
  totalFetched: number;
  rawStored: number;
  normalized: number;
  buyerServicesCreated: number;
  errors: string[];
}

// Emoji regex to strip emojis
const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{FE00}-\u{FE0F}]|[\u{1F900}-\u{1F9FF}]/gu;

function cleanString(input: string): string {
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

// Complete list of valid categories matching database enum
const VALID_CATEGORIES = [
  'instagram', 'facebook', 'twitter', 'youtube', 'tiktok', 'linkedin', 'telegram',
  'threads', 'snapchat', 'pinterest', 'whatsapp', 'twitch', 'discord', 'spotify',
  'soundcloud', 'audiomack', 'reddit', 'vk', 'kick', 'rumble', 'dailymotion',
  'deezer', 'shazam', 'tidal', 'reverbnation', 'mixcloud', 'quora', 'tumblr',
  'clubhouse', 'likee', 'kwai', 'trovo', 'odysee', 'bilibili', 'lemon8', 'bereal',
  'weibo', 'line', 'patreon', 'medium', 'roblox', 'steam', 'applemusic', 'amazonmusic',
  'napster', 'iheart', 'gettr', 'truthsocial', 'parler', 'mastodon', 'bluesky', 'gab', 'minds',
  'caffeine', 'dlive', 'nimotv', 'bigo', 'douyin', 'xiaohongshu', 'qq', 'wechat',
  'kuaishou', 'youtubemusic', 'pandora', 'googlebusiness', 'trustpilot', 'yelp',
  'tripadvisor', 'behance', 'dribbble', 'deviantart', 'flickr', 'vero', 'podcast', 'momo',
  'google', 'website', 'other'
] as const;

type ValidCategory = typeof VALID_CATEGORIES[number];

// Enhanced platform detection patterns
const PLATFORM_PATTERNS: Array<{ platform: ValidCategory; keywords: string[] }> = [
  { platform: 'instagram', keywords: ['instagram', 'insta', ' ig ', 'igtv', 'reels', 'reel'] },
  { platform: 'facebook', keywords: ['facebook', ' fb ', 'fb page', 'fb group'] },
  { platform: 'twitter', keywords: ['twitter', 'x.com', 'tweet', ' x '] },
  { platform: 'youtube', keywords: ['youtube', ' yt ', 'shorts', 'yt subscriber'] },
  { platform: 'tiktok', keywords: ['tiktok', 'tik tok', ' tt '] },
  { platform: 'linkedin', keywords: ['linkedin', 'linked in'] },
  { platform: 'telegram', keywords: ['telegram', ' tg ', 'tg channel', 'tg group'] },
  { platform: 'threads', keywords: ['threads'] },
  { platform: 'snapchat', keywords: ['snapchat', 'snap score'] },
  { platform: 'pinterest', keywords: ['pinterest'] },
  { platform: 'whatsapp', keywords: ['whatsapp'] },
  { platform: 'twitch', keywords: ['twitch'] },
  { platform: 'discord', keywords: ['discord'] },
  { platform: 'spotify', keywords: ['spotify'] },
  { platform: 'soundcloud', keywords: ['soundcloud'] },
  { platform: 'audiomack', keywords: ['audiomack'] },
  { platform: 'reddit', keywords: ['reddit', 'subreddit'] },
  { platform: 'vk', keywords: ['vk.com', 'vkontakte', ' vk '] },
  { platform: 'kick', keywords: ['kick.com', ' kick '] },
  { platform: 'rumble', keywords: ['rumble'] },
  { platform: 'dailymotion', keywords: ['dailymotion'] },
  { platform: 'deezer', keywords: ['deezer'] },
  { platform: 'shazam', keywords: ['shazam'] },
  { platform: 'tidal', keywords: ['tidal'] },
  { platform: 'reverbnation', keywords: ['reverbnation'] },
  { platform: 'mixcloud', keywords: ['mixcloud'] },
  { platform: 'quora', keywords: ['quora'] },
  { platform: 'tumblr', keywords: ['tumblr'] },
  { platform: 'clubhouse', keywords: ['clubhouse'] },
  { platform: 'likee', keywords: ['likee'] },
  { platform: 'kwai', keywords: ['kwai'] },
  { platform: 'trovo', keywords: ['trovo'] },
  { platform: 'odysee', keywords: ['odysee'] },
  { platform: 'bilibili', keywords: ['bilibili'] },
  { platform: 'lemon8', keywords: ['lemon8'] },
  { platform: 'bereal', keywords: ['bereal'] },
  { platform: 'weibo', keywords: ['weibo'] },
  { platform: 'line', keywords: ['line app', 'line.me'] },
  { platform: 'patreon', keywords: ['patreon'] },
  { platform: 'medium', keywords: ['medium.com', ' medium '] },
  { platform: 'roblox', keywords: ['roblox', 'robux'] },
  { platform: 'steam', keywords: ['steam'] },
  { platform: 'applemusic', keywords: ['apple music', 'itunes'] },
  { platform: 'amazonmusic', keywords: ['amazon music'] },
  { platform: 'napster', keywords: ['napster'] },
  { platform: 'iheart', keywords: ['iheart'] },
  { platform: 'gettr', keywords: ['gettr'] },
  { platform: 'truthsocial', keywords: ['truthsocial', 'truth social'] },
  { platform: 'parler', keywords: ['parler'] },
  { platform: 'mastodon', keywords: ['mastodon'] },
  { platform: 'bluesky', keywords: ['bluesky', 'blue sky', 'bsky'] },
  { platform: 'gab', keywords: ['gab'] },
  { platform: 'minds', keywords: ['minds'] },
  { platform: 'caffeine', keywords: ['caffeine'] },
  { platform: 'dlive', keywords: ['dlive'] },
  { platform: 'nimotv', keywords: ['nimotv', 'nimo'] },
  { platform: 'bigo', keywords: ['bigo'] },
  { platform: 'douyin', keywords: ['douyin'] },
  { platform: 'xiaohongshu', keywords: ['xiaohongshu', '小红书', 'little red book'] },
  { platform: 'qq', keywords: [' qq ', 'tencent qq'] },
  { platform: 'wechat', keywords: ['wechat', 'weixin'] },
  { platform: 'kuaishou', keywords: ['kuaishou'] },
  { platform: 'youtubemusic', keywords: ['youtube music', 'yt music'] },
  { platform: 'pandora', keywords: ['pandora'] },
  { platform: 'googlebusiness', keywords: ['google business', 'gmb', 'google my business'] },
  { platform: 'behance', keywords: ['behance'] },
  { platform: 'dribbble', keywords: ['dribbble'] },
  { platform: 'deviantart', keywords: ['deviantart'] },
  { platform: 'flickr', keywords: ['flickr'] },
  { platform: 'vero', keywords: ['vero'] },
  { platform: 'podcast', keywords: ['podcast'] },
  { platform: 'momo', keywords: ['momo'] },
  { platform: 'trustpilot', keywords: ['trustpilot'] },
  { platform: 'yelp', keywords: ['yelp'] },
  { platform: 'tripadvisor', keywords: ['tripadvisor', 'trip advisor'] },
  { platform: 'google', keywords: ['google review', 'google map'] },
  { platform: 'website', keywords: ['website traffic', 'web traffic', 'seo'] },
];

const PLATFORM_SHORTFORMS: Record<string, ValidCategory> = {
  'ig': 'instagram', 'insta': 'instagram', 'fb': 'facebook',
  'tw': 'twitter', 'x': 'twitter', 'yt': 'youtube', 'tt': 'tiktok',
  'tg': 'telegram', 'li': 'linkedin', 'sc': 'snapchat', 'pt': 'pinterest',
  'wa': 'whatsapp', 'dc': 'discord', 'vk': 'vk', 'sp': 'spotify',
  'rd': 'reddit', 'twt': 'twitch', 'kk': 'kick', 'rb': 'rumble',
};

function detectPlatform(category: string, serviceName: string): ValidCategory {
  const cleanCat = cleanString(category).toLowerCase();
  const cleanName = cleanString(serviceName).toLowerCase();
  const combined = ` ${cleanCat} ${cleanName} `;

  // Exact match
  if (VALID_CATEGORIES.includes(cleanCat as ValidCategory)) {
    return cleanCat as ValidCategory;
  }

  // First word shortform
  const words = cleanName.split(/\s+/);
  for (let i = 0; i < Math.min(3, words.length); i++) {
    if (PLATFORM_SHORTFORMS[words[i]]) {
      return PLATFORM_SHORTFORMS[words[i]];
    }
  }

  // Keyword matching
  for (const { platform, keywords } of PLATFORM_PATTERNS) {
    if (keywords.some(kw => combined.includes(kw))) {
      return platform;
    }
  }

  return 'other';
}

// Detect service type from name
function detectServiceType(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('follower')) return 'followers';
  if (lower.includes('like')) return 'likes';
  if (lower.includes('view')) return 'views';
  if (lower.includes('comment')) return 'comments';
  if (lower.includes('share')) return 'shares';
  if (lower.includes('subscriber')) return 'subscribers';
  if (lower.includes('save')) return 'saves';
  if (lower.includes('reach')) return 'reach';
  if (lower.includes('impression')) return 'impressions';
  if (lower.includes('stream') || lower.includes('play')) return 'streams';
  if (lower.includes('member')) return 'members';
  if (lower.includes('watch')) return 'watch_time';
  return 'other';
}

// Detect delivery type
function detectDeliveryType(name: string, dripfeed: boolean): string {
  const lower = name.toLowerCase();
  if (dripfeed) return 'dripfeed';
  if (lower.includes('instant')) return 'instant';
  if (lower.includes('slow') || lower.includes('gradual')) return 'gradual';
  if (lower.includes('subscription') || lower.includes('monthly')) return 'subscription';
  return 'default';
}

function parseBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  return false;
}

function parseRate(rate: any): number {
  const str = String(rate).replace(/[^0-9.]/g, '');
  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : parsed;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { panelId, providerId, markupPercent = 20 } = await req.json();

    if (!panelId || !providerId) {
      return new Response(
        JSON.stringify({ error: 'Panel ID and Provider ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[IMPORT] Starting import for panel: ${panelId}, provider: ${providerId}`);

    // Get provider details WITH currency info
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('*, currency, currency_rate_to_usd')
      .eq('id', providerId)
      .eq('panel_id', panelId)
      .single();

    if (providerError || !provider) {
      return new Response(
        JSON.stringify({ error: 'Provider not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Currency conversion setup - default to USD if not set
    const providerCurrency = provider.currency || 'USD';
    const currencyRateToUsd = provider.currency_rate_to_usd || 1.0;
    
    console.log(`[IMPORT] Provider currency: ${providerCurrency}, rate to USD: ${currencyRateToUsd}`);

    const result: ImportResult & { currency: string; currencyRate: number } = {
      providerId: provider.id,
      providerName: provider.name,
      totalFetched: 0,
      rawStored: 0,
      normalized: 0,
      buyerServicesCreated: 0,
      errors: [],
      currency: providerCurrency,
      currencyRate: currencyRateToUsd,
    };

    // Fetch services from provider API
    const url = new URL(provider.api_endpoint);
    url.searchParams.set('key', provider.api_key);
    url.searchParams.set('action', 'services');

    console.log(`[IMPORT] Fetching from ${provider.name}...`);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'User-Agent': 'SMM-Panel/3.0' },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[IMPORT] Provider API error: ${response.status}`, errorText);
      return new Response(
        JSON.stringify({ error: `Provider API error: ${response.status}`, details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();

    // Handle different response formats
    let rawServices: RawProviderService[] = [];
    if (Array.isArray(data)) {
      rawServices = data;
    } else if (data.services) {
      rawServices = data.services;
    } else if (data.data) {
      rawServices = data.data;
    } else if (data.error) {
      return new Response(
        JSON.stringify({ error: `Provider returned error: ${data.error}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    result.totalFetched = rawServices.length;
    console.log(`[IMPORT] Fetched ${rawServices.length} services from ${provider.name}`);

    // Process in batches
    const BATCH_SIZE = 100;
    
    for (let i = 0; i < rawServices.length; i += BATCH_SIZE) {
      const batch = rawServices.slice(i, i + BATCH_SIZE);
      
      // 1. Store raw data in provider_services WITH currency conversion
      const rawInserts = batch.map((svc, idx) => {
        const rawRate = parseRate(svc.rate);
        // CRITICAL: Convert provider rate to USD
        const costUsd = rawRate * currencyRateToUsd;
        
        return {
          panel_id: panelId,
          provider_id: providerId,
          external_service_id: String(svc.service),
          raw_name: svc.name || `Service ${svc.service}`,
          raw_category: svc.category || '',
          raw_type: svc.type || '',
          provider_rate: rawRate,           // Original rate in provider currency
          raw_currency: providerCurrency,   // Track original currency
          cost_usd: costUsd,                // Normalized USD cost
          min_quantity: parseInt(String(svc.min)) || 10,
          max_quantity: parseInt(String(svc.max)) || 100000,
          raw_description: svc.desc || svc.description || '',
          refill_available: parseBoolean(svc.refill),
          cancel_available: parseBoolean(svc.cancel),
          dripfeed_available: parseBoolean(svc.dripfeed),
          average_time: svc.average_time || '',
          raw_data: svc,
          sync_status: 'active',
        };
      });

      const { data: storedRaw, error: rawError } = await supabase
        .from('provider_services')
        .upsert(rawInserts, { 
          onConflict: 'panel_id,provider_id,external_service_id',
          ignoreDuplicates: false 
        })
        .select('id, external_service_id, raw_name, raw_category, provider_rate, refill_available, cancel_available, dripfeed_available');

      if (rawError) {
        console.error(`[IMPORT] Raw storage error:`, rawError);
        result.errors.push(`Batch ${i/BATCH_SIZE}: ${rawError.message}`);
        continue;
      }

      result.rawStored += storedRaw?.length || 0;

      // 2. Create normalized entries
      if (storedRaw && storedRaw.length > 0) {
        const normalizedInserts = storedRaw.map(raw => {
          const platform = detectPlatform(raw.raw_category || '', raw.raw_name);
          const serviceType = detectServiceType(raw.raw_name);
          const deliveryType = detectDeliveryType(raw.raw_name, raw.dripfeed_available);
          
          // Clean name for buyers
          let normalizedName = cleanString(raw.raw_name);
          // Remove platform prefix if it starts with it
          const platformLower = platform.toLowerCase();
          if (normalizedName.toLowerCase().startsWith(platformLower)) {
            normalizedName = normalizedName.slice(platform.length).trim();
            // Remove leading dash or hyphen
            normalizedName = normalizedName.replace(/^[-–—]\s*/, '');
          }
          
          return {
            provider_service_id: raw.id,
            detected_platform: platform,
            detected_service_type: serviceType,
            detected_delivery_type: deliveryType,
            normalized_name: normalizedName || raw.raw_name,
            buyer_friendly_category: platform.charAt(0).toUpperCase() + platform.slice(1),
            platform_icon: platform,
            confidence_score: platform === 'other' ? 0.3 : 0.85,
            is_ai_processed: false,
          };
        });

        const { data: normalizedData, error: normError } = await supabase
          .from('normalized_services')
          .upsert(normalizedInserts, {
            onConflict: 'provider_service_id',
            ignoreDuplicates: false
          })
          .select('id, provider_service_id, detected_platform');

        if (normError) {
          console.error(`[IMPORT] Normalization error:`, normError);
          result.errors.push(`Normalization batch ${i/BATCH_SIZE}: ${normError.message}`);
        } else {
          result.normalized += normalizedData?.length || 0;
        }

        // 3. Create buyer-visible services WITH USD-based pricing
        const buyerServiceInserts = storedRaw.map((raw, idx) => {
          const norm = normalizedInserts[idx];
          const rawRate = raw.provider_rate;
          // CRITICAL: Use USD cost for markup calculation, never raw provider rate
          const costUsd = rawRate * currencyRateToUsd;
          const buyerPrice = costUsd * (1 + markupPercent / 100);

          return {
            panel_id: panelId,
            provider_service_ref: raw.id,
            provider_id: providerId,
            provider_service_id: raw.external_service_id,
            name: norm.normalized_name || raw.raw_name,
            category: norm.detected_platform,
            service_type: norm.detected_service_type,
            description: `${norm.detected_service_type} for ${norm.buyer_friendly_category}`,
            price: Math.round(buyerPrice * 10000) / 10000,     // Final buyer price in USD
            provider_price: rawRate,                           // Original provider rate
            provider_cost: rawRate,                            // Keep original for reference
            cost_usd: costUsd,                                 // Normalized USD cost
            markup_percent: markupPercent,
            min_quantity: parseInt(String(batch[idx]?.min)) || 10,
            max_quantity: parseInt(String(batch[idx]?.max)) || 100000,
            refill_available: raw.refill_available,
            cancel_available: raw.cancel_available,
            is_active: true,
            display_order: i + idx,
          };
        });

        const { data: buyerServices, error: buyerError } = await supabase
          .from('services')
          .upsert(buyerServiceInserts, {
            onConflict: 'panel_id,provider_service_id,provider_id',
            ignoreDuplicates: false
          })
          .select('id');

        if (buyerError) {
          console.error(`[IMPORT] Buyer service error:`, buyerError);
          result.errors.push(`Buyer services batch ${i/BATCH_SIZE}: ${buyerError.message}`);
        } else {
          result.buyerServicesCreated += buyerServices?.length || 0;
        }
      }

      // Log progress
      console.log(`[IMPORT] Processed ${Math.min(i + BATCH_SIZE, rawServices.length)}/${rawServices.length}`);
    }

    // 4. Deactivate stale services no longer available from the provider
    const importedExternalIds = rawServices.map(svc => String(svc.service));
    
    if (importedExternalIds.length > 0) {
      // Get all active services for this provider+panel
      const { data: existingServices } = await supabase
        .from('services')
        .select('id, provider_service_id')
        .eq('panel_id', panelId)
        .eq('provider_id', providerId)
        .eq('is_active', true);

      if (existingServices) {
        const staleServices = existingServices.filter(
          (svc: any) => !importedExternalIds.includes(svc.provider_service_id)
        );
        
        if (staleServices.length > 0) {
          const staleIds = staleServices.map((s: any) => s.id);
          await supabase
            .from('services')
            .update({ is_active: false })
            .in('id', staleIds);
          
          console.log(`[IMPORT] Deactivated ${staleServices.length} stale services`);
        }
      }
      
      // Also deactivate stale provider_services
      const { data: existingProviderServices } = await supabase
        .from('provider_services')
        .select('id, external_service_id')
        .eq('panel_id', panelId)
        .eq('provider_id', providerId)
        .eq('sync_status', 'active');

      if (existingProviderServices) {
        const staleProviderServices = existingProviderServices.filter(
          (svc: any) => !importedExternalIds.includes(svc.external_service_id)
        );
        
        if (staleProviderServices.length > 0) {
          const staleProvIds = staleProviderServices.map((s: any) => s.id);
          await supabase
            .from('provider_services')
            .update({ sync_status: 'inactive' })
            .in('id', staleProvIds);
          
          console.log(`[IMPORT] Marked ${staleProviderServices.length} provider_services as inactive`);
        }
      }
    }

    // 5. Sync categories to service_categories table for persistent ordering
    console.log(`[IMPORT] Syncing categories to service_categories table...`);
    
    // Get unique categories from the imported services
    const { data: categoryData } = await supabase
      .from('services')
      .select('category')
      .eq('panel_id', panelId)
      .eq('is_active', true);
    
    if (categoryData) {
      const categoryCounts: Record<string, number> = {};
      categoryData.forEach((svc: any) => {
        const cat = svc.category || 'other';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });

      // Upsert each category to service_categories
      const sortedCategories = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1]); // Sort by count descending

      for (let idx = 0; idx < sortedCategories.length; idx++) {
        const [category, count] = sortedCategories[idx];
        const catName = category.charAt(0).toUpperCase() + category.slice(1);
        
        await supabase
          .from('service_categories')
          .upsert({
            panel_id: panelId,
            name: catName,
            slug: category,
            icon_key: category,
            position: idx,
            service_count: count,
            is_active: true,
          }, {
            onConflict: 'panel_id,slug'
          });
      }
      
      console.log(`[IMPORT] Synced ${sortedCategories.length} categories`);
    }

    // Update provider sync status
    await supabase
      .from('providers')
      .update({ 
        last_sync_at: new Date().toISOString(),
        sync_status: 'synced'
      })
      .eq('id', providerId);

    // Log to audit
    await supabase.from('audit_logs').insert({
      action: 'provider_import',
      resource_type: 'provider_services',
      resource_id: providerId,
      details: {
        panel_id: panelId,
        provider_name: provider.name,
        provider_currency: providerCurrency,
        currency_rate_to_usd: currencyRateToUsd,
        total_fetched: result.totalFetched,
        raw_stored: result.rawStored,
        normalized: result.normalized,
        buyer_services: result.buyerServicesCreated,
        errors: result.errors.length,
        markup_percent: markupPercent,
      },
    });

    console.log(`[IMPORT] Complete:`, result);

    return new Response(
      JSON.stringify({ 
        success: true, 
        result,
        message: `Imported ${result.buyerServicesCreated} services from ${provider.name}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[IMPORT] Error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
