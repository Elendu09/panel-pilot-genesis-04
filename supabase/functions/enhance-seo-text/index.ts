import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, text, type, panelName, description } = body;

    // Handle generate-all action for complete SEO package
    if (action === 'generate-all') {
      console.log('Generating complete SEO for panel:', panelName);
      
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      
      if (!LOVABLE_API_KEY) {
        // Return template-based fallback
        const title = `${panelName} - #1 SMM Panel | Buy Followers, Likes & Views`;
        const desc = `${panelName} offers premium social media marketing services. Get real followers, likes, views with instant delivery. 24/7 support, best prices guaranteed.`;
        const keywords = `${panelName.toLowerCase()}, SMM panel, buy followers, social media marketing, instagram likes, tiktok views, youtube subscribers, twitter followers`;
        
        console.log('Using template fallback for SEO generation');
        return new Response(
          JSON.stringify({ title, description: desc, keywords, source: 'template' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      try {
        const systemPrompt = `You are an expert SEO specialist for SMM (Social Media Marketing) panels. Generate optimized SEO metadata for a panel.

Rules:
- Title: Max 60 characters, include panel name at start, include "SMM Panel" or similar
- Description: 120-155 characters, highlight key benefits (instant delivery, 24/7 support, best prices), include CTA
- Keywords: 8-12 comma-separated relevant keywords for SMM services

Panel Name: ${panelName}
${description ? `Panel Description: ${description}` : ''}

Return ONLY a JSON object with this exact format:
{"title": "...", "description": "...", "keywords": "..."}`;

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: "Generate the SEO metadata now." }
            ],
            max_tokens: 200,
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          throw new Error(`AI gateway error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content?.trim() || '';
        
        // Parse JSON response
        try {
          // Extract JSON from response (handle markdown code blocks)
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            console.log('AI-generated SEO:', parsed);
            return new Response(
              JSON.stringify({ 
                title: parsed.title || `${panelName} - SMM Panel`,
                description: parsed.description || `${panelName} offers premium SMM services.`,
                keywords: parsed.keywords || `${panelName.toLowerCase()}, SMM panel, buy followers`,
                source: 'ai'
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } catch (parseError) {
          console.error('Failed to parse AI response:', parseError);
        }
      } catch (aiError) {
        console.error('AI generation failed:', aiError);
      }

      // Fallback to template
      const title = `${panelName} - #1 SMM Panel | Buy Followers, Likes & Views`;
      const desc = `${panelName} offers premium social media marketing services. Get real followers, likes, views with instant delivery. 24/7 support, best prices guaranteed.`;
      const keywords = `${panelName.toLowerCase()}, SMM panel, buy followers, social media marketing, instagram likes, tiktok views, youtube subscribers, twitter followers`;
      
      return new Response(
        JSON.stringify({ title, description: desc, keywords, source: 'template' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Original enhance single text logic
    if (!text || text.length < 5) {
      return new Response(
        JSON.stringify({ enhanced: text, suggestion: '' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      // Return rule-based fallback
      const suggestion = type === 'title'
        ? `${panelName} - #1 SMM Panel | Buy Followers, Likes & Views`
        : `${panelName} offers premium social media marketing. Real followers, instant delivery, 24/7 support.`;
      return new Response(
        JSON.stringify({ enhanced: suggestion, suggestion: 'template' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Improve this ${type}: "${text}"` }
        ],
        max_tokens: 100,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      // Return rule-based fallback
      const suggestion = type === 'title'
        ? `${panelName} - #1 SMM Panel | Buy Followers, Likes & Views`
        : `${panelName} offers premium social media marketing. Real followers, instant delivery, 24/7 support.`;
      return new Response(
        JSON.stringify({ enhanced: suggestion, suggestion: 'template' }),
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
