import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// =====================================================
// SERVICE NORMALIZATION ENGINE
// AI-assisted categorization and name cleanup
// =====================================================

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

// Platform display names for buyer-friendly categories
const PLATFORM_DISPLAY_NAMES: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  twitter: 'Twitter/X',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  telegram: 'Telegram',
  threads: 'Threads',
  snapchat: 'Snapchat',
  pinterest: 'Pinterest',
  whatsapp: 'WhatsApp',
  twitch: 'Twitch',
  discord: 'Discord',
  spotify: 'Spotify',
  soundcloud: 'SoundCloud',
  audiomack: 'Audiomack',
  reddit: 'Reddit',
  vk: 'VKontakte',
  kick: 'Kick',
  rumble: 'Rumble',
  dailymotion: 'Dailymotion',
  deezer: 'Deezer',
  shazam: 'Shazam',
  tidal: 'TIDAL',
  reverbnation: 'ReverbNation',
  mixcloud: 'Mixcloud',
  quora: 'Quora',
  tumblr: 'Tumblr',
  clubhouse: 'Clubhouse',
  likee: 'Likee',
  kwai: 'Kwai',
  trovo: 'Trovo',
  odysee: 'Odysee',
  bilibili: 'Bilibili',
  lemon8: 'Lemon8',
  bereal: 'BeReal',
  weibo: 'Weibo',
  line: 'LINE',
  patreon: 'Patreon',
  medium: 'Medium',
  roblox: 'Roblox',
  steam: 'Steam',
  applemusic: 'Apple Music',
  amazonmusic: 'Amazon Music',
  napster: 'Napster',
  iheart: 'iHeartRadio',
  gettr: 'GETTR',
  truthsocial: 'Truth Social',
  parler: 'Parler',
  mastodon: 'Mastodon',
  bluesky: 'Bluesky',
  gab: 'Gab',
  minds: 'Minds',
  caffeine: 'Caffeine',
  dlive: 'DLive',
  nimotv: 'Nimo TV',
  bigo: 'BIGO Live',
  douyin: 'Douyin',
  xiaohongshu: 'Xiaohongshu',
  qq: 'QQ',
  wechat: 'WeChat',
  kuaishou: 'Kuaishou',
  youtubemusic: 'YouTube Music',
  pandora: 'Pandora',
  googlebusiness: 'Google Business',
  trustpilot: 'Trustpilot',
  yelp: 'Yelp',
  tripadvisor: 'TripAdvisor',
  behance: 'Behance',
  dribbble: 'Dribbble',
  deviantart: 'DeviantArt',
  flickr: 'Flickr',
  vero: 'Vero',
  podcast: 'Podcast',
  momo: 'Momo',
  google: 'Google',
  website: 'Website',
  other: 'Other',
};

// Service type labels
const SERVICE_TYPE_LABELS: Record<string, string> = {
  followers: 'Followers',
  likes: 'Likes',
  views: 'Views',
  comments: 'Comments',
  shares: 'Shares',
  subscribers: 'Subscribers',
  saves: 'Saves',
  reach: 'Reach',
  impressions: 'Impressions',
  streams: 'Streams/Plays',
  members: 'Members',
  watch_time: 'Watch Time',
  other: 'Other',
};

// Emoji regex
const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{FE00}-\u{FE0F}]|[\u{1F900}-\u{1F9FF}]/gu;

function cleanServiceName(name: string, platform: string): string {
  let cleaned = name
    .replace(emojiRegex, '')
    .replace(/[🔥⭐✨💎🚀💯🎯🌟⚡️💪🏆🎉🎊]/g, '')
    .replace(/^\d+\.\s*/, '')
    .replace(/^\[.*?\]\s*/, '')
    .replace(/^-+\s*/, '')
    .replace(/\s*-+$/, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Remove platform name from start if present
  const platformLower = platform.toLowerCase();
  const cleanedLower = cleaned.toLowerCase();
  
  if (cleanedLower.startsWith(platformLower + ' ')) {
    cleaned = cleaned.slice(platform.length + 1).trim();
  } else if (cleanedLower.startsWith(platformLower + '-')) {
    cleaned = cleaned.slice(platform.length + 1).trim();
  }

  // Remove common prefixes
  cleaned = cleaned.replace(/^(HQ|Premium|Real|Fast|Slow|Instant|Best|Top)\s+/i, '');

  // Capitalize first letter of each word
  cleaned = cleaned.replace(/\b\w/g, c => c.toUpperCase());

  return cleaned;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { panelId, providerServiceIds, forceRenormalize = false } = await req.json();

    if (!panelId) {
      return new Response(
        JSON.stringify({ error: 'Panel ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[NORMALIZE] Starting for panel: ${panelId}`);

    // Get provider services that need normalization
    let query = supabase
      .from('provider_services')
      .select(`
        id,
        raw_name,
        raw_category,
        dripfeed_available,
        normalized_services!left(id, detected_platform)
      `)
      .eq('panel_id', panelId)
      .eq('sync_status', 'active');

    if (providerServiceIds && providerServiceIds.length > 0) {
      query = query.in('id', providerServiceIds);
    }

    const { data: providerServices, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch provider services: ${error.message}`);
    }

    if (!providerServices || providerServices.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No services to normalize', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filter to only those needing normalization
    const toNormalize = forceRenormalize 
      ? providerServices 
      : providerServices.filter(ps => !ps.normalized_services || ps.normalized_services.length === 0);

    console.log(`[NORMALIZE] Processing ${toNormalize.length} services`);

    let normalized = 0;
    const BATCH_SIZE = 100;

    for (let i = 0; i < toNormalize.length; i += BATCH_SIZE) {
      const batch = toNormalize.slice(i, i + BATCH_SIZE);

      const normalizedData = batch.map(ps => {
        const platform = detectPlatformEnhanced(ps.raw_category || '', ps.raw_name);
        const serviceType = detectServiceType(ps.raw_name);
        const deliveryType = detectDeliveryType(ps.raw_name, ps.dripfeed_available);
        const cleanedName = cleanServiceName(ps.raw_name, platform);

        return {
          provider_service_id: ps.id,
          detected_platform: platform,
          detected_service_type: serviceType,
          detected_delivery_type: deliveryType,
          normalized_name: cleanedName,
          buyer_friendly_category: PLATFORM_DISPLAY_NAMES[platform] || platform,
          platform_icon: platform,
          confidence_score: platform === 'other' ? 0.3 : 0.85,
          is_ai_processed: false,
        };
      });

      const { error: upsertError } = await supabase
        .from('normalized_services')
        .upsert(normalizedData, {
          onConflict: 'provider_service_id',
          ignoreDuplicates: false
        });

      if (upsertError) {
        console.error(`[NORMALIZE] Error in batch ${i/BATCH_SIZE}:`, upsertError);
      } else {
        normalized += batch.length;
      }
    }

    // Get statistics
    const { data: stats } = await supabase
      .from('normalized_services')
      .select('detected_platform')
      .eq('provider_service_id', toNormalize.map(t => t.id));

    const categoryStats: Record<string, number> = {};
    stats?.forEach(s => {
      categoryStats[s.detected_platform] = (categoryStats[s.detected_platform] || 0) + 1;
    });

    console.log(`[NORMALIZE] Complete. Normalized: ${normalized}`);

    return new Response(
      JSON.stringify({
        success: true,
        normalized,
        total: toNormalize.length,
        categoryStats
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[NORMALIZE] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Enhanced platform detection
function detectPlatformEnhanced(category: string, serviceName: string): ValidCategory {
  const cleanCat = category.toLowerCase().replace(emojiRegex, '').trim();
  const cleanName = serviceName.toLowerCase().replace(emojiRegex, '').trim();
  const combined = ` ${cleanCat} ${cleanName} `;

  // Direct match
  for (const cat of VALID_CATEGORIES) {
    if (cleanCat === cat || cleanCat.startsWith(cat + ' ')) {
      return cat;
    }
  }

  // Pattern matching
  const patterns: Array<{ platform: ValidCategory; keywords: string[] }> = [
    { platform: 'instagram', keywords: ['instagram', 'insta', ' ig ', 'igtv', 'reels'] },
    { platform: 'facebook', keywords: ['facebook', ' fb '] },
    { platform: 'twitter', keywords: ['twitter', 'x.com', 'tweet'] },
    { platform: 'youtube', keywords: ['youtube', ' yt ', 'shorts'] },
    { platform: 'tiktok', keywords: ['tiktok', 'tik tok', ' tt '] },
    { platform: 'telegram', keywords: ['telegram', ' tg '] },
    { platform: 'linkedin', keywords: ['linkedin'] },
    { platform: 'threads', keywords: ['threads'] },
    { platform: 'snapchat', keywords: ['snapchat', 'snap'] },
    { platform: 'pinterest', keywords: ['pinterest'] },
    { platform: 'whatsapp', keywords: ['whatsapp'] },
    { platform: 'twitch', keywords: ['twitch'] },
    { platform: 'discord', keywords: ['discord'] },
    { platform: 'spotify', keywords: ['spotify'] },
    { platform: 'soundcloud', keywords: ['soundcloud'] },
    { platform: 'reddit', keywords: ['reddit'] },
    { platform: 'vk', keywords: ['vk.com', ' vk '] },
    { platform: 'kick', keywords: ['kick.com'] },
    { platform: 'rumble', keywords: ['rumble'] },
    // ... add more as needed
  ];

  for (const { platform, keywords } of patterns) {
    if (keywords.some(kw => combined.includes(kw))) {
      return platform;
    }
  }

  return 'other';
}

function detectServiceType(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('follower')) return 'followers';
  if (lower.includes('like')) return 'likes';
  if (lower.includes('view')) return 'views';
  if (lower.includes('comment')) return 'comments';
  if (lower.includes('share')) return 'shares';
  if (lower.includes('subscriber')) return 'subscribers';
  if (lower.includes('save')) return 'saves';
  if (lower.includes('stream') || lower.includes('play')) return 'streams';
  if (lower.includes('member')) return 'members';
  return 'other';
}

function detectDeliveryType(name: string, dripfeed: boolean): string {
  const lower = name.toLowerCase();
  if (dripfeed) return 'dripfeed';
  if (lower.includes('instant')) return 'instant';
  if (lower.includes('slow') || lower.includes('gradual')) return 'gradual';
  if (lower.includes('subscription')) return 'subscription';
  return 'default';
}
