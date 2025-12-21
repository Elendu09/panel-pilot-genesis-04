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
      category: categorizeService(service.category || service.name),
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

function categorizeService(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('instagram') || lower.includes('ig ')) return 'instagram';
  if (lower.includes('facebook') || lower.includes('fb ')) return 'facebook';
  if (lower.includes('twitter') || lower.includes('x ')) return 'twitter';
  if (lower.includes('youtube') || lower.includes('yt ')) return 'youtube';
  if (lower.includes('tiktok') || lower.includes('tik tok')) return 'tiktok';
  if (lower.includes('linkedin')) return 'linkedin';
  if (lower.includes('telegram')) return 'telegram';
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
