import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, type, panelName } = await req.json();

    if (!text || text.length < 5) {
      return new Response(
        JSON.stringify({ enhanced: text, suggestion: '' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use Lovable AI to enhance the text
    const systemPrompt = type === 'title' 
      ? `You are an SEO expert. Improve this SMM panel title to be more compelling and SEO-optimized. 
         Rules:
         - Keep under 60 characters
         - Include the panel name "${panelName}" at the start
         - Include keywords like "SMM Panel", "Followers", "Likes", or "Social Media"
         - Make it action-oriented and professional
         - Do NOT include a domain name
         - Return ONLY the improved title, nothing else`
      : `You are an SEO expert. Improve this SMM panel meta description to be more compelling and SEO-optimized.
         Rules:
         - Keep between 120-155 characters
         - Highlight key benefits: instant delivery, 24/7 support, best prices
         - Include a call-to-action
         - Use natural language that reads well
         - Do NOT include generic filler words
         - Return ONLY the improved description, nothing else`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Improve this ${type}: "${text}"` }
        ],
        max_tokens: 100,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', await response.text());
      // Return a rule-based suggestion as fallback
      let suggestion = '';
      if (type === 'title') {
        suggestion = text.length < 30 
          ? `${panelName} - #1 SMM Panel | Buy Followers, Likes & Views`
          : text;
      } else {
        suggestion = text.length < 80
          ? `${text} Get real followers, likes & views. Instant delivery, 24/7 support, best prices guaranteed.`
          : text;
      }
      return new Response(
        JSON.stringify({ enhanced: suggestion, suggestion: 'AI unavailable - using template' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const enhanced = data.choices?.[0]?.message?.content?.trim() || text;

    console.log(`Enhanced ${type}: "${text}" -> "${enhanced}"`);

    return new Response(
      JSON.stringify({ enhanced, suggestion: 'AI-enhanced' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in enhance-seo-text:', error);
    return new Response(
      JSON.stringify({ error: error.message, enhanced: '' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
