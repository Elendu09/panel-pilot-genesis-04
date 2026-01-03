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
  refill?: boolean;
  cancel?: boolean;
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

    // Standardize service format
    const standardizedServices: StandardizedService[] = services.map((service) => ({
      providerId: 'external',
      providerServiceId: String(service.service),
      name: service.name || 'Unknown Service',
      category: categorizeService(service.name || '', service.category || ''),
      type: service.type || 'default',
      rate: parseFloat(service.rate) || 0,
      min: parseInt(service.min) || 1,
      max: parseInt(service.max) || 10000,
      description: service.description || generateDescription(service),
      refill: service.refill === true || service.refill === 'true',
      cancel: service.cancel === true || service.cancel === 'true',
    }));

    console.log(`Successfully fetched ${standardizedServices.length} services`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        services: standardizedServices,
        count: standardizedServices.length 
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

function categorizeService(name: string, category: string = ''): string {
  const input = `${name} ${category}`.toLowerCase();
  
  // Comprehensive platform detection matching sync function and frontend
  const platforms: [string, string[]][] = [
    ['instagram', ['instagram', 'insta', 'ig follower', 'ig like', 'ig view', 'reels']],
    ['facebook', ['facebook', 'fb ', 'fb.com']],
    ['twitter', ['twitter', 'x.com', 'tweet', 'x follower', 'x like']],
    ['youtube', ['youtube', 'yt ', 'yt.com', 'shorts', 'youtube short']],
    ['tiktok', ['tiktok', 'tik tok', 'tt follower', 'tt like']],
    ['linkedin', ['linkedin', 'linked in']],
    ['telegram', ['telegram', 'tg ', 'tg.me']],
    ['threads', ['threads']],
    ['snapchat', ['snapchat', 'snap ']],
    ['pinterest', ['pinterest', 'pin ']],
    ['whatsapp', ['whatsapp', 'whats app']],
    ['twitch', ['twitch']],
    ['discord', ['discord']],
    ['spotify', ['spotify']],
    ['soundcloud', ['soundcloud', 'sound cloud']],
    ['audiomack', ['audiomack', 'audio mack']],
    ['reddit', ['reddit']],
    ['vk', ['vk.com', 'vkontakte', ' vk ']],
    ['kick', ['kick.com', ' kick ']],
    ['rumble', ['rumble']],
    ['dailymotion', ['dailymotion', 'daily motion']],
    ['deezer', ['deezer']],
    ['shazam', ['shazam']],
    ['tidal', ['tidal']],
    ['reverbnation', ['reverbnation', 'reverb nation']],
    ['mixcloud', ['mixcloud', 'mix cloud']],
    ['quora', ['quora']],
    ['tumblr', ['tumblr']],
    ['clubhouse', ['clubhouse', 'club house']],
    ['likee', ['likee']],
    ['kwai', ['kwai']],
    ['trovo', ['trovo']],
    ['odysee', ['odysee']],
    ['bilibili', ['bilibili', 'bili bili']],
    ['lemon8', ['lemon8', 'lemon 8']],
    ['bereal', ['bereal', 'be real']],
    ['weibo', ['weibo']],
    ['line', ['line app', 'line.me']],
    ['patreon', ['patreon']],
    ['medium', ['medium.com', ' medium ']],
    ['roblox', ['roblox']],
    ['steam', ['steam']],
    ['applemusic', ['apple music', 'applemusic', 'itunes']],
    ['amazonmusic', ['amazon music', 'amazonmusic']],
    ['napster', ['napster']],
    ['iheart', ['iheart', 'iheartradio']],
  ];
  
  for (const [platform, keywords] of platforms) {
    if (keywords.some(kw => input.includes(kw))) {
      return platform;
    }
  }
  return 'other';
}

function generateDescription(service: ProviderService): string {
  const parts = [];
  if (service.min && service.max) {
    parts.push(`Quantity: ${service.min} - ${service.max}`);
  }
  if (service.refill) parts.push('Refill available');
  if (service.cancel) parts.push('Cancel available');
  return parts.join(' | ') || 'SMM service';
}
