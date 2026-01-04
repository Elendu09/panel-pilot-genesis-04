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

// Valid database enum categories
const VALID_CATEGORIES = [
  'instagram', 'facebook', 'twitter', 'youtube', 'tiktok', 'linkedin', 'telegram',
  'threads', 'snapchat', 'pinterest', 'whatsapp', 'twitch', 'discord', 'spotify',
  'soundcloud', 'audiomack', 'reddit', 'vk', 'kick', 'rumble', 'dailymotion',
  'deezer', 'shazam', 'tidal', 'reverbnation', 'mixcloud', 'quora', 'tumblr',
  'clubhouse', 'likee', 'kwai', 'trovo', 'odysee', 'bilibili', 'lemon8', 'bereal',
  'weibo', 'line', 'patreon', 'medium', 'roblox', 'steam', 'applemusic', 'amazonmusic',
  'napster', 'iheart', 'google', 'trustpilot', 'yelp', 'tripadvisor', 'website', 'other'
] as const;

type ValidCategory = typeof VALID_CATEGORIES[number];

const mapCategory = (category: string, serviceName: string = ''): ValidCategory => {
  // Clean the inputs first
  const cleanedCategory = cleanCategoryString(category).toLowerCase();
  const cleanedName = cleanCategoryString(serviceName).toLowerCase();
  const input = `${cleanedCategory} ${cleanedName}`;
  
  // Platform patterns with comprehensive keywords - ORDER MATTERS (more specific first)
  const platforms: Array<{ platform: ValidCategory; keywords: string[] }> = [
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
    { platform: 'google', keywords: ['google review', 'google map', 'gmb ', 'google my business', 'google business'] },
    { platform: 'trustpilot', keywords: ['trustpilot', 'trust pilot'] },
    { platform: 'yelp', keywords: ['yelp', 'yelp review'] },
    { platform: 'tripadvisor', keywords: ['tripadvisor', 'trip advisor'] },
    { platform: 'website', keywords: ['website traffic', 'web traffic', 'site visitor', 'seo ', 'backlink'] },
  ];
  
  // Check if cleaned category exactly matches a valid platform
  if (VALID_CATEGORIES.includes(cleanedCategory as ValidCategory)) {
    return cleanedCategory as ValidCategory;
  }
  
  // Check for platform name at start of category
  for (const { platform } of platforms) {
    if (cleanedCategory.startsWith(platform + ' ') || cleanedCategory === platform) {
      return platform;
    }
  }
  
  // Check keywords in category (priority)
  for (const { platform, keywords } of platforms) {
    if (keywords.some(kw => cleanedCategory.includes(kw))) {
      return platform;
    }
  }
  
  // Check keywords in service name
  for (const { platform, keywords } of platforms) {
    if (keywords.some(kw => cleanedName.includes(kw))) {
      return platform;
    }
  }
  
  // Check combined input
  for (const { platform, keywords } of platforms) {
    if (keywords.some(kw => input.includes(kw))) {
      return platform;
    }
  }
  
  return 'other';
};

function parseServiceType(type: string | undefined): string {
  if (!type) return 'default';
  const normalized = type.toLowerCase().trim();
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
      const result: SyncResult = {
        providerId: provider.id,
        providerName: provider.name,
        servicesUpdated: 0,
        pricesChanged: 0,
        newServices: 0,
        errors: [],
      };

      try {
        // Fetch services from provider API
        const url = new URL(provider.api_endpoint);
        url.searchParams.set('key', provider.api_key);
        url.searchParams.set('action', 'services');

        console.log(`Fetching services from ${provider.name}...`);

        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: { 'User-Agent': 'SMM-Panel/2.0' },
        });

        if (!response.ok) {
          result.errors.push(`API returned ${response.status}`);
          results.push(result);
          continue;
        }

        const data = await response.json();
        
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
          const serviceId = String(providerService.service);
          const existing = existingByProviderServiceId.get(serviceId);
          
          const providerRate = parseFloat(String(providerService.rate)) || 0;
          const markupMultiplier = 1 + (markupPercent / 100);
          const finalPrice = providerRate * markupMultiplier;

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
            price: finalPrice,
            provider_price: providerRate,
            markup_percent: markupPercent,
            min_quantity: parseInt(String(providerService.min)) || 1,
            max_quantity: parseInt(String(providerService.max)) || 10000,
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
