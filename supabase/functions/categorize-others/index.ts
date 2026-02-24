import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// =====================================================
// OTHERS CATEGORIZATION ENGINE
// Deep AI analysis for services in "Other" category
// Supports 70+ refined categories
// =====================================================

// Extended categories for deep categorization
const EXTENDED_CATEGORIES = [
  // Major Platforms
  'instagram', 'facebook', 'twitter', 'youtube', 'tiktok', 'linkedin', 'telegram',
  'threads', 'snapchat', 'pinterest', 'whatsapp', 'twitch', 'discord',
  
  // Music & Audio
  'spotify', 'soundcloud', 'audiomack', 'deezer', 'shazam', 'tidal', 
  'reverbnation', 'mixcloud', 'napster', 'applemusic', 'amazonmusic',
  'youtubemusic', 'pandora', 'anghami', 'jiosaavn', 'gaana', 'wynk',
  
  // Video Platforms
  'rumble', 'dailymotion', 'bilibili', 'odysee', 'vimeo', 'dtube',
  'bitchute', 'brighteon', 'peertube', 'lbry',
  
  // Live Streaming
  'kick', 'trovo', 'caffeine', 'dlive', 'nimotv', 'bigo', 'liveme',
  'periscope', 'streamyard', 'restream',
  
  // Social Networks
  'reddit', 'quora', 'tumblr', 'vk', 'ok', 'weibo', 'clubhouse',
  'mastodon', 'bluesky', 'gab', 'minds', 'parler', 'truthsocial', 'gettr',
  
  // Asian Platforms
  'douyin', 'xiaohongshu', 'qq', 'wechat', 'kuaishou', 'line', 'kakaotalk',
  'zalo', 'viber', 'naver', 'melon',
  
  // Short-form Video
  'likee', 'kwai', 'lemon8', 'bereal', 'triller', 'byte', 'clash', 'firework',
  
  // Business & Reviews
  'googlebusiness', 'trustpilot', 'yelp', 'tripadvisor', 'glassdoor',
  'capterra', 'g2', 'productreview', 'sitejabber', 'bbb',
  
  // Creative & Portfolio
  'behance', 'dribbble', 'deviantart', 'flickr', 'artstation', '500px',
  'pixiv', 'newgrounds', 'wattpad', 'ao3',
  
  // Professional
  'medium', 'substack', 'patreon', 'kofi', 'buymeacoffee', 'gumroad',
  'teachable', 'skillshare', 'udemy',
  
  // Gaming
  'roblox', 'steam', 'epicgames', 'origin', 'uplay', 'gog',
  'itch', 'gamejolt', 'humble',
  
  // Podcast
  'podcast', 'anchor', 'buzzsprout', 'libsyn', 'podbean', 'spreaker',
  
  // E-commerce & Marketplace
  'etsy', 'ebay', 'amazon', 'shopify', 'aliexpress', 'wish', 'poshmark',
  'mercari', 'depop', 'vinted',
  
  // Dating & Social
  'tinder', 'bumble', 'hinge', 'okcupid', 'match', 'pof',
  'momo', 'tantan', 'soul',
  
  // Messaging
  'signal', 'threema', 'session', 'element', 'matrix', 'rocketchat',
  
  // Other
  'website', 'traffic', 'seo', 'google', 'other'
] as const;

type ExtendedCategory = typeof EXTENDED_CATEGORIES[number];

// Pattern detection for extended categories
const EXTENDED_PATTERNS: Record<string, RegExp[]> = {
  // Existing major patterns
  instagram: [/\binstagram\b/i, /\binsta(?!nt)\b/i, /\bigtv\b/i, /\breels?\b/i, /\b(ig)\s*(followers|likes|views)/i],
  facebook: [/\bfacebook\b/i, /\bmeta\b/i, /\bfb\s*(page|group|likes|followers)/i],
  twitter: [/\btwitter\b/i, /\bx\.com\b/i, /\btweet/i, /\bretweet/i],
  youtube: [/\byoutube\b/i, /\byt\b/i, /\byoutuber\b/i, /\bshorts\b/i],
  tiktok: [/\btiktok\b/i, /\btik\s*tok\b/i, /\btt\s*(followers|likes|views)/i],
  
  // Extended video
  vimeo: [/\bvimeo\b/i],
  dtube: [/\bdtube\b/i, /\bd\.tube\b/i],
  bitchute: [/\bbitchute\b/i],
  brighteon: [/\bbrighteon\b/i],
  peertube: [/\bpeertube\b/i],
  lbry: [/\blbry\b/i],
  
  // Streaming
  liveme: [/\bliveme\b/i, /\blive\.me\b/i],
  periscope: [/\bperiscope\b/i],
  streamyard: [/\bstreamyard\b/i],
  restream: [/\brestream\b/i],
  
  // Social additions
  ok: [/\bodnoklassniki\b/i, /\bok\.ru\b/i],
  
  // Asian additions
  kakaotalk: [/\bkakaotalk\b/i, /\bkakao\b/i],
  zalo: [/\bzalo\b/i],
  viber: [/\bviber\b/i],
  naver: [/\bnaver\b/i],
  melon: [/\bmelon\b/i],
  
  // Short-form
  triller: [/\btriller\b/i],
  byte: [/\bbyte\s*(app)?\b/i],
  clash: [/\bclash\s*(app)?\b/i],
  firework: [/\bfirework\b/i],
  
  // Business additions
  glassdoor: [/\bglassdoor\b/i],
  capterra: [/\bcapterra\b/i],
  g2: [/\bg2\s*(crowd)?\b/i],
  productreview: [/\bproductreview\b/i],
  sitejabber: [/\bsitejabber\b/i],
  bbb: [/\bbbb\b/i, /\bbetter\s*business\b/i],
  
  // Creative additions
  artstation: [/\bartstation\b/i],
  pixiv: [/\bpixiv\b/i],
  newgrounds: [/\bnewgrounds\b/i],
  wattpad: [/\bwattpad\b/i],
  ao3: [/\bao3\b/i, /\barchive\s*of\s*our\s*own\b/i],
  
  // Professional additions
  substack: [/\bsubstack\b/i],
  kofi: [/\bko-?fi\b/i],
  buymeacoffee: [/\bbuy\s*me\s*a\s*coffee\b/i],
  gumroad: [/\bgumroad\b/i],
  teachable: [/\bteachable\b/i],
  skillshare: [/\bskillshare\b/i],
  udemy: [/\budemy\b/i],
  
  // Gaming additions
  epicgames: [/\bepic\s*games?\b/i, /\bfortnite\b/i],
  origin: [/\borigin\b/i, /\bea\s*(games)?\b/i],
  uplay: [/\buplay\b/i, /\bubisoft\b/i],
  gog: [/\bgog\b/i, /\bgood\s*old\s*games\b/i],
  itch: [/\bitch\.io\b/i],
  gamejolt: [/\bgamejolt\b/i, /\bgame\s*jolt\b/i],
  humble: [/\bhumble\b/i],
  
  // Podcast additions
  libsyn: [/\blibsyn\b/i],
  podbean: [/\bpodbean\b/i],
  spreaker: [/\bspreaker\b/i],
  
  // E-commerce
  etsy: [/\betsy\b/i],
  ebay: [/\bebay\b/i],
  amazon: [/\bamazon\b/i],
  shopify: [/\bshopify\b/i],
  aliexpress: [/\baliexpress\b/i],
  wish: [/\bwish\b/i],
  poshmark: [/\bposhmark\b/i],
  mercari: [/\bmercari\b/i],
  depop: [/\bdepop\b/i],
  vinted: [/\bvinted\b/i],
  
  // Dating
  tinder: [/\btinder\b/i],
  bumble: [/\bbumble\b/i],
  hinge: [/\bhinge\b/i],
  okcupid: [/\bokcupid\b/i],
  match: [/\bmatch\.com\b/i],
  pof: [/\bplenty\s*of\s*fish\b/i, /\bpof\b/i],
  tantan: [/\btantan\b/i],
  soul: [/\bsoul\s*(app)?\b/i],
  
  // Messaging
  signal: [/\bsignal\b/i],
  threema: [/\bthreema\b/i],
  session: [/\bsession\b/i],
  element: [/\belement\b/i, /\briot\.im\b/i],
  matrix: [/\bmatrix\b/i],
  rocketchat: [/\brocket\.?chat\b/i],
  
  // Generic
  website: [/\bwebsite\b/i, /\bweb\s*traffic\b/i, /\bsite\s*visit/i],
  traffic: [/\btraffic\b/i, /\bvisitor/i],
  seo: [/\bseo\b/i, /\bbacklink/i, /\bda\s*\d+/i],
  google: [/\bgoogle\b/i, /\bgmb\b/i, /\bgoogle\s*(maps?|business)/i],
};

function detectExtendedCategory(serviceName: string, currentCategory: string): ExtendedCategory {
  const cleanName = serviceName.toLowerCase().trim();
  
  // If already properly categorized, skip
  if (currentCategory && currentCategory !== 'other' && EXTENDED_CATEGORIES.includes(currentCategory as any)) {
    return currentCategory as ExtendedCategory;
  }
  
  // Check extended patterns
  for (const [platform, patterns] of Object.entries(EXTENDED_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(cleanName)) {
        return platform as ExtendedCategory;
      }
    }
  }
  
  // Keyword-based detection for remaining
  const keywordMap: Record<string, string[]> = {
    anghami: ['anghami'],
    jiosaavn: ['jiosaavn', 'saavn'],
    gaana: ['gaana'],
    wynk: ['wynk'],
  };
  
  for (const [platform, keywords] of Object.entries(keywordMap)) {
    for (const keyword of keywords) {
      if (cleanName.includes(keyword)) {
        return platform as ExtendedCategory;
      }
    }
  }
  
  return 'other';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { panelId, batchSize = 100, offset = 0 } = await req.json();

    if (!panelId) {
      return new Response(
        JSON.stringify({ error: 'Panel ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[CATEGORIZE-OTHERS] Starting for panel: ${panelId}, offset: ${offset}`);

    // Fetch services in "Other" category that need refinement
    const { data: otherServices, error: fetchError, count } = await supabase
      .from('services')
      .select('id, name, category, image_url', { count: 'exact' })
      .eq('panel_id', panelId)
      .or('category.is.null,category.eq.other,category.eq.Other')
      .range(offset, offset + batchSize - 1);

    if (fetchError) {
      throw new Error(`Failed to fetch services: ${fetchError.message}`);
    }

    if (!otherServices || otherServices.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true,
          processed: 0, 
          remaining: 0,
          total: count || 0,
          message: 'No more services in Other category',
          categoryStats: {}
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process services with extended detection
    const updates: Array<{ id: string; category: string; newIcon: string }> = [];
    const categoryStats: Record<string, number> = {};

    for (const service of otherServices) {
      const detectedCategory = detectExtendedCategory(service.name, service.category);
      
      if (detectedCategory !== 'other') {
        updates.push({
          id: service.id,
          category: detectedCategory,
          newIcon: `icon:${detectedCategory}`,
        });
        categoryStats[detectedCategory] = (categoryStats[detectedCategory] || 0) + 1;
      } else {
        categoryStats['other'] = (categoryStats['other'] || 0) + 1;
      }
    }

    // Apply updates in batches
    let successCount = 0;
    let failCount = 0;
    
    const CHUNK_SIZE = 25;
    for (let i = 0; i < updates.length; i += CHUNK_SIZE) {
      const chunk = updates.slice(i, i + CHUNK_SIZE);
      
      const results = await Promise.allSettled(
        chunk.map(async (update) => {
          const { error } = await supabase
            .from('services')
            .update({ 
              category: update.category as any, 
              image_url: update.newIcon 
            })
            .eq('id', update.id);
          
          if (error) throw error;
          return update.id;
        })
      );
      
      successCount += results.filter(r => r.status === 'fulfilled').length;
      failCount += results.filter(r => r.status === 'rejected').length;
    }

    const remaining = (count || 0) - offset - otherServices.length;

    console.log(`[CATEGORIZE-OTHERS] Processed: ${updates.length}, Recategorized: ${successCount}, Remaining: ${remaining}`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: otherServices.length,
        recategorized: successCount,
        failed: failCount,
        remaining: Math.max(0, remaining),
        total: count || 0,
        offset: offset + otherServices.length,
        hasMore: remaining > 0,
        categoryStats
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[CATEGORIZE-OTHERS] Error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
