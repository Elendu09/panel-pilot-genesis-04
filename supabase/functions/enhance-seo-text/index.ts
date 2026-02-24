import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate template-based SEO with intelligent panel name matching
function generateTemplateBasedSEO(panelName: string, description?: string) {
  const name = panelName.trim();
  const nameLower = name.toLowerCase().replace(/\s+/g, '');
  
  // Generate compelling title variants based on panel name length
  let title: string;
  if (name.length <= 15) {
    title = `${name} - #1 SMM Panel | Buy Real Followers & Likes`;
  } else if (name.length <= 25) {
    title = `${name} | Best SMM Panel - Instant Delivery`;
  } else {
    title = `${name} - Premium SMM Services`;
  }
  
  // Ensure title is under 60 chars
  if (title.length > 60) {
    title = `${name} - Best SMM Panel`;
  }
  
  // Generate description with context
  const descBase = description 
    ? `${name}: ${description.substring(0, 80)}. `
    : `${name} offers premium SMM services. `;
  
  const descSuffix = 'Get real followers, likes & views with instant delivery. 24/7 support, best prices. Start growing today!';
  let desc = descBase + descSuffix;
  
  // Trim to 155 chars max
  if (desc.length > 155) {
    desc = desc.substring(0, 152) + '...';
  }
  
  // Generate comprehensive keywords based on panel name
  const baseKeywords = [
    nameLower,
    `${nameLower} smm panel`,
    'smm panel',
    'buy followers',
    'instagram followers',
    'tiktok followers',
    'youtube subscribers',
    'twitter followers',
    'telegram members',
    'social media marketing',
    'buy likes',
    'buy views',
    'instant delivery smm',
    'cheap smm panel',
    'best smm panel'
  ];
  
  const keywords = baseKeywords.join(', ');
  
  return { title, description: desc, keywords };
}

// Validate and fix title to ensure panel name is present
function validateTitle(title: string | undefined, panelName: string): string {
  if (!title) return `${panelName} - #1 SMM Panel | Buy Followers`;
  
  // Ensure panel name is at the start
  if (!title.toLowerCase().includes(panelName.toLowerCase())) {
    return `${panelName} - ${title}`.substring(0, 60);
  }
  
  // Trim if too long
  if (title.length > 60) {
    return title.substring(0, 57) + '...';
  }
  
  return title;
}

// Validate and fix description
function validateDescription(desc: string | undefined, panelName: string): string {
  if (!desc) {
    return `${panelName} offers premium SMM services. Real followers, instant delivery, 24/7 support. Start growing today!`;
  }
  
  // Trim if too long
  if (desc.length > 160) {
    return desc.substring(0, 157) + '...';
  }
  
  // Pad if too short
  if (desc.length < 100) {
    return `${desc} Get instant delivery, 24/7 support, and best prices.`.substring(0, 160);
  }
  
  return desc;
}

// Validate and enhance keywords
function validateKeywords(keywords: string | undefined, panelName: string): string {
  const nameLower = panelName.toLowerCase().replace(/\s+/g, '');
  const essentialKeywords = [nameLower, 'smm panel', 'buy followers', 'instagram', 'tiktok'];
  
  if (!keywords) {
    return essentialKeywords.concat(['youtube', 'social media marketing', 'likes', 'views']).join(', ');
  }
  
  // Ensure essential keywords are present
  const keywordList = keywords.split(',').map(k => k.trim().toLowerCase());
  const missingEssentials = essentialKeywords.filter(ek => 
    !keywordList.some(k => k.includes(ek))
  );
  
  if (missingEssentials.length > 0) {
    return missingEssentials.join(', ') + ', ' + keywords;
  }
  
  return keywords;
}

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
      const cleanPanelName = (panelName || 'SMM Panel').trim();
      
      if (!LOVABLE_API_KEY) {
        // Return enhanced template-based fallback
        const seoData = generateTemplateBasedSEO(cleanPanelName, description);
        console.log('Using template fallback for SEO generation');
        return new Response(
          JSON.stringify({ ...seoData, source: 'template' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      try {
        const systemPrompt = `You are a top-tier SEO expert specializing in SMM (Social Media Marketing) panels.

Your task: Generate highly optimized, conversion-focused SEO metadata for "${cleanPanelName}".

CRITICAL RULES:
1. TITLE (max 55 chars):
   - MUST start with "${cleanPanelName}"
   - Include power words: "Best", "#1", "Premium", "Top", "Trusted"
   - Include "SMM Panel" or "SMM Services"
   - Example formats:
     - "${cleanPanelName} - #1 SMM Panel | Real Followers"
     - "${cleanPanelName} | Best SMM Panel - Instant Delivery"
     - "${cleanPanelName} - Premium SMM Services & Growth"

2. DESCRIPTION (130-155 chars):
   - Lead with key benefit (instant delivery, real engagement)
   - Include: "real followers", "instant delivery", "24/7 support", "best prices"
   - End with subtle CTA (Start growing today, Join now, Try us)
   - Use active voice, be compelling

3. KEYWORDS (12-15 comma-separated):
   - MUST include: "${cleanPanelName.toLowerCase()}" as first keyword
   - Include platforms: instagram, tiktok, youtube, twitter, telegram, facebook
   - Include services: followers, likes, views, comments, subscribers, shares
   - Include action words: buy, get, increase, boost, grow
   - Include niche terms: smm panel, social media marketing, engagement, growth

${description ? `Panel Description Context: ${description}` : 'This is a professional SMM panel offering social media marketing services.'}

Return ONLY valid JSON (no markdown, no explanation):
{"title":"...","description":"...","keywords":"..."}`;

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
              { role: "user", content: `Generate SEO metadata for ${cleanPanelName}. Return only JSON.` }
            ],
            max_tokens: 300,
            temperature: 0.6,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('AI gateway error:', response.status, errorText);
          throw new Error(`AI gateway error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content?.trim() || '';
        console.log('AI raw response:', content);
        
        // Parse JSON response
        try {
          // Extract JSON from response (handle markdown code blocks)
          const jsonMatch = content.match(/\{[\s\S]*?\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            
            // Validate and enhance the response
            const finalTitle = validateTitle(parsed.title, cleanPanelName);
            const finalDesc = validateDescription(parsed.description, cleanPanelName);
            const finalKeywords = validateKeywords(parsed.keywords, cleanPanelName);
            
            console.log('AI-generated SEO:', { title: finalTitle, description: finalDesc, keywords: finalKeywords });
            return new Response(
              JSON.stringify({ 
                title: finalTitle,
                description: finalDesc,
                keywords: finalKeywords,
                source: 'ai'
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } catch (parseError) {
          console.error('Failed to parse AI response:', parseError, 'Content:', content);
        }
      } catch (aiError) {
        console.error('AI generation failed:', aiError);
      }

      // Fallback to enhanced template
      const seoData = generateTemplateBasedSEO(cleanPanelName, description);
      return new Response(
        JSON.stringify({ ...seoData, source: 'template' }),
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
  } catch (error: unknown) {
    console.error('Error in enhance-seo-text:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message, enhanced: '' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
