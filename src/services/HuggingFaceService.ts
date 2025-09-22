import { withCache } from "@/lib/cache";

const HF_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY as string;
const HF_BASE_URL = "https://api-inference.huggingface.co/models";

// Using a model that works better with basic API access
const MODEL_NAME = "gpt2";

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

async function callHuggingFaceAPI(prompt: string, context?: ChatContext): Promise<string> {
  if (!HF_API_KEY) {
    throw new Error("Hugging Face API key not configured");
  }

  console.log("Calling Hugging Face API with prompt:", prompt.substring(0, 100) + "...");
  console.log("API Key present:", !!HF_API_KEY);

  // Build context-aware prompt
  let contextualPrompt = `You are SmartAgri Advisor, an AI assistant specialized in agriculture and farming. Provide helpful, accurate, and practical advice for farmers. Be conversational and supportive.

User question: ${prompt}`;

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

  try {
    const response = await fetch(`${HF_BASE_URL}/${MODEL_NAME}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: contextualPrompt,
        parameters: {
          max_length: 200,
          temperature: 0.7,
          do_sample: true,
          top_p: 0.9,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Hugging Face API error:", response.status, errorText);
      throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Hugging Face API response:", data);
    
    // Handle different response formats
    if (Array.isArray(data) && data.length > 0) {
      const responseText = data[0].generated_text || data[0].text;
      console.log("Generated text:", responseText);
      return responseText || "I'm sorry, I couldn't generate a response. Please try again.";
    } else if (data.generated_text) {
      console.log("Generated text:", data.generated_text);
      return data.generated_text;
    } else if (data.text) {
      console.log("Text response:", data.text);
      return data.text;
    } else {
      console.log("No valid response format found in:", data);
      return "I'm sorry, I couldn't generate a response. Please try again.";
    }
  } catch (error) {
    console.error("Hugging Face API error:", error);
    throw new Error(`Failed to get response from AI: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const HuggingFaceService = {
  async chat(message: string, context?: ChatContext): Promise<string> {
    const cacheKey = `hf:chat:${btoa(message + JSON.stringify(context || {}))}`;
    return withCache(cacheKey, () => callHuggingFaceAPI(message, context), { 
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

  // Test the API connection
  async testConnection(): Promise<boolean> {
    try {
      await this.chat("Hello, are you working?");
      return true;
    } catch (error) {
      console.error("Hugging Face connection test failed:", error);
      return false;
    }
  }
};

export default HuggingFaceService;
