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
    const { prompt } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating theme for prompt:", prompt);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a professional UI/UX designer specializing in color theory and web design. Generate beautiful, harmonious color palettes for web applications based on user descriptions. Always return valid hex color codes.`
          },
          {
            role: "user",
            content: `Generate a cohesive color palette for a web application theme based on this description: "${prompt}". The palette should include colors that work well together and provide good contrast for readability.`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_color_palette",
              description: "Generate a color palette with 6 colors for a web application theme",
              parameters: {
                type: "object",
                properties: {
                  primary: {
                    type: "string",
                    description: "Primary brand color in hex format (e.g., #8B5CF6)"
                  },
                  secondary: {
                    type: "string", 
                    description: "Secondary accent color in hex format"
                  },
                  accent: {
                    type: "string",
                    description: "Accent/highlight color in hex format"
                  },
                  background: {
                    type: "string",
                    description: "Main background color in hex format"
                  },
                  surface: {
                    type: "string",
                    description: "Surface/card background color in hex format"
                  },
                  text: {
                    type: "string",
                    description: "Primary text color in hex format"
                  }
                },
                required: ["primary", "secondary", "accent", "background", "surface", "text"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_color_palette" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response:", JSON.stringify(data));

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "generate_color_palette") {
      throw new Error("Invalid AI response format");
    }

    const colors = JSON.parse(toolCall.function.arguments);
    console.log("Generated colors:", colors);

    return new Response(JSON.stringify({ colors }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating theme:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Failed to generate theme" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
