import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, pageContext, panelInfo, conversationHistory } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Detect greeting messages for quick response
    const greetingPatterns = /^(hi|hello|hey|hola|good morning|good afternoon|good evening|sup|yo|what's up|whats up|greetings)[\s!.?]*$/i;
    const isGreeting = greetingPatterns.test(message.trim());

    // Build system prompt based on page context
    const systemPrompt = `You are a friendly and helpful customer support assistant for "${panelInfo?.name || 'SMM Panel'}". 
You help customers with questions about social media marketing services.

Current page context: ${pageContext || 'Homepage'}
Panel services include: social media followers, likes, views, and engagement services.

Key information to help with:
- Services: We offer Instagram, TikTok, YouTube, Twitter, Facebook, Telegram services
- Pricing: Competitive prices starting from $0.001 per 1K (check Services page for exact rates)
- Delivery: Most orders start within 0-1 hour, instant delivery available
- Support: 24/7 customer support available
- Payment: We accept credit cards, PayPal, cryptocurrency, and bank transfer
- Refunds: Full refunds if we cannot deliver
- Quality: High-quality, real engagement from active accounts

**FORMATTING GUIDELINES - ALWAYS FOLLOW THESE:**
- Use **bold text** to emphasize important terms, prices, or key points
- Use numbered lists (1., 2., 3.) when explaining steps or procedures
- Use bullet points (- item) for listing features or options
- Break your response into clear paragraphs for readability
- Keep paragraphs short (2-3 sentences max)
- Use line breaks between sections

Example of good formatting:
"**Order Process:**

1. **Choose your service** - Browse our categories and select what you need
2. **Enter your link** - Provide the URL to your post or profile
3. **Complete payment** - We accept multiple payment methods

Your order will start within **0-1 hour** of payment!"

Guidelines:
- Be friendly, warm, and conversational - respond like a helpful friend
- For greetings, respond enthusiastically and ask how you can help
- If asked about specific pricing, suggest checking the Services page
- For account-specific questions, suggest logging in or contacting support
- Keep responses under 150 words unless more detail is needed
- Use emojis sparingly (1-2 max) for friendliness 
- Never make up specific prices or features not mentioned
- Always be proactive in offering help

${isGreeting ? 'The user just greeted you - respond warmly with a formatted list of things you can help with!' : ''}`;

    // Build messages array
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []).slice(-6), // Keep last 6 messages for context
      { role: 'user', content: message }
    ];

    console.log('Sending request to Lovable AI Gateway...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        max_tokens: 400,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Too many requests. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Service temporarily unavailable.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

    console.log('AI response generated successfully');

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-chat-reply:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate response. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
