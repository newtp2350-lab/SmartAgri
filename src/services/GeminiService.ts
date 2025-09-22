import { withCache } from "@/lib/cache";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

export interface ChatContext {
  location?: { lat: number; lng: number; address: string };
  weather?: any;
  soil?: any;
  market?: any;
}

async function callGeminiAPI(prompt: string, context?: ChatContext): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured");
  }

  // Build context-aware prompt
  let contextualPrompt = prompt;
  if (context?.location) {
    contextualPrompt += `\n\nLocation: ${context.location.address}`;
  }
  if (context?.weather) {
    contextualPrompt += `\n\nWeather data: ${JSON.stringify(context.weather)}`;
  }
  if (context?.soil) {
    contextualPrompt += `\n\nSoil data: ${JSON.stringify(context.soil)}`;
  }
  if (context?.market) {
    contextualPrompt += `\n\nMarket data: ${JSON.stringify(context.market)}`;
  }

  const response = await fetch(`${GEMINI_BASE_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `You are SmartAgri Advisor, an AI assistant specialized in agriculture and farming. Provide helpful, accurate, and practical advice for farmers. Be conversational and supportive.

User question: ${contextualPrompt}

Please provide a comprehensive response that addresses the user's agricultural question, considering their location and any available data.`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response. Please try again.";
}

export const GeminiService = {
  async chat(message: string, context?: ChatContext): Promise<string> {
    const cacheKey = `gemini:chat:${btoa(message + JSON.stringify(context || {}))}`;
    return withCache(cacheKey, () => callGeminiAPI(message, context), { 
      ttlMs: 1000 * 60 * 30 // 30 minutes cache
    });
  },

  async getCropRecommendation(location: { lat: number; lng: number; address: string }, season?: string): Promise<string> {
    const prompt = `Based on the location ${location.address}, recommend suitable crops for ${season || 'current season'}. Consider soil type, climate, and market demand.`;
    return this.chat(prompt, { location });
  },

  async getFarmingAdvice(topic: string, context?: ChatContext): Promise<string> {
    const prompt = `Provide detailed farming advice about: ${topic}`;
    return this.chat(prompt, context);
  },
};

export default GeminiService;

