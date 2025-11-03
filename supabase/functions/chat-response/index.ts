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
    const { history, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are "Lumi," a friendly, patient, and encouraging study buddy. Your goal is to help the user practice the concepts from the lesson they just learned.
    
Here is the full context of their lesson:
---
${context}
---

Rules:
- Use the provided chat history to understand the conversation.
- Keep your responses short, conversational, and encouraging.
- Do NOT just lecture. Ask open-ended questions to test their knowledge.
- If they are wrong, gently correct them and guide them to the right answer.
- Behave like a real, friendly human tutor.`;

    // Convert history to OpenAI chat format
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map((msg: any) => ({
        role: msg.role,
        content: msg.parts[0].text
      }))
    ];

    console.log('Processing chat with', history.length, 'messages');
    
    // Call Lovable AI Gateway
    const apiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
      }),
    });

    if (!apiResponse.ok) {
      if (apiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (apiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add credits to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await apiResponse.text();
      console.error('AI Gateway error:', apiResponse.status, errorText);
      throw new Error(`AI Gateway error: ${apiResponse.status}`);
    }

    const apiResult = await apiResponse.json();
    const responseText = apiResult?.choices?.[0]?.message?.content;
    
    if (!responseText) {
      console.error('Empty response from AI Gateway');
      throw new Error('Empty response from AI');
    }

    return new Response(
      JSON.stringify({ text: responseText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in chat-response:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate chat response';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
