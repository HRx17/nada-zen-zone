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
    const { inputType, data, fileData } = await req.json();
    console.log('Processing request:', { inputType, hasData: !!data, hasFileData: !!fileData });
    
    let sourceText = "";
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Handle different input types
    switch (inputType) {
      case "paste":
        sourceText = data;
        break;
        
      case "pdf":
        if (!fileData) {
          throw new Error('PDF file data is required');
        }
        sourceText = "PDF content placeholder. PDF parsing requires additional setup.";
        break;
        
      case "youtube": {
        try {
          sourceText = "YouTube transcript placeholder. Transcript API integration needed.";
        } catch (e) {
          console.error('YouTube transcript error:', e);
          sourceText = "Unable to fetch YouTube transcript. Please try another source.";
        }
        break;
      }
        
      case "url": {
        try {
          const response = await fetch(data);
          const html = await response.text();
          sourceText = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        } catch (e) {
          console.error('URL fetch error:', e);
          throw new Error('Failed to fetch content from URL');
        }
        break;
      }
        
      case "search":
        break;
        
      default:
        throw new Error('Invalid input type');
    }

    const systemPrompt = `You are "Lumi," an expert educator. Create a complete "Lesson Kit" as JSON with this structure:
{
  "title": "lesson title",
  "summary": "brief overview",
  "chapters": [{"title": "chapter name", "timestamp": "MM:SS or N/A"}],
  "jargon": [{"term": "word", "definition": "meaning"}],
  "quiz": [{"question": "Q", "options": ["A","B","C","D"], "answer": "correct option"}]
}

Guidelines:
- For 'search': find best web information
- For 'youtube': base chapters on topic shifts
- For 'url'/'paste': base chapters on sections
- Return ONLY valid JSON, no markdown`;

    let userPrompt;
    if (inputType === "search") {
      userPrompt = `Generate a comprehensive lesson kit about: ${data}`;
    } else {
      userPrompt = `Generate a lesson kit from this content:\n\n${sourceText.slice(0, 5000)}`;
    }

    console.log('Calling Lovable AI Gateway...');
    
    // Call Lovable AI Gateway
    const apiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
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
    const rawText = apiResult?.choices?.[0]?.message?.content;
    
    if (!rawText) {
      console.error('Empty response from AI Gateway');
      throw new Error('Empty response from AI');
    }

    console.log('AI response received:', rawText.slice(0, 200));

    // Extract JSON from response (might be wrapped in markdown code blocks)
    let jsonText = rawText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\s*/g, '').replace(/```\s*$/g, '');
    }

    let lessonKit;
    try {
      lessonKit = JSON.parse(jsonText);
    } catch (parseErr) {
      console.error('Failed to parse JSON:', parseErr);
      console.error('Raw response:', jsonText.slice(0, 500));
      throw new Error('Invalid JSON response from AI');
    }

    return new Response(
      JSON.stringify({ lessonKit, sourceText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in generate-lesson:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate lesson';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
