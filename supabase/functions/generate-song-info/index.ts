import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const ALLOWED_ORIGIN = "https://worshipsync.vercel.app";

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { title, artist } = body;
    const apiKey = Deno.env.get('GEMINI_API_KEY');

    if (!apiKey) {
      throw new Error("API Key missing");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Prompt melhorado para forçar busca por fatos reais
    const prompt = `You are a music researcher. Search and provide accurate information for the song "${title}" by "${artist}". 
    DO NOT invent data. If you are not sure about a link, leave it empty.
    Return ONLY a JSON object with these keys: 
    - default_key (string, the most common original key)
    - default_bpm (number, the standard BPM)
    - youtube_url (string, official music video or audio link)
    - spotify_url (string, official Spotify track link)
    - lyrics (string, official full lyrics)`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("Raw AI response:", text);
    
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '');
    const data = JSON.parse(jsonString);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ error: 'Failed to generate content', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
