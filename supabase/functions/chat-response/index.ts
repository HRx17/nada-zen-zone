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
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
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

    // Format history for Gemini API
    const contents = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }]
      },
      ...history.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: msg.parts
      }))
    ];

    console.log('Processing chat with', history.length, 'messages');
    
    // Call Gemini API directly with Gemini 2.5 Flash
    const apiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contents }),
      }
    );

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('Gemini API error:', apiResponse.status, errorText);
      throw new Error(`Gemini API error: ${apiResponse.status}`);
    }

    const apiResult = await apiResponse.json();
    const responseText = apiResult?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      console.error('Empty response from Gemini chat');
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
