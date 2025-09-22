/**
 * OpenRouter API Integration with DeepSeek Chat v3.1
 * Provides personalized agricultural advice using location, weather, and soil data
 */

export interface ChatContext {
  location?: { lat: number; lng: number; address: string };
  weather?: any;
  forecast?: any;
  soil?: any;
  market?: any;
  contextString?: string;
}

export interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export const OpenRouterService = {
  async chat(message: string, context?: ChatContext): Promise<string> {
    const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY as string;
    
    if (!OPENROUTER_API_KEY) {
      throw new Error("OpenRouter API key not configured");
    }

    // Build simplified, raw-behavior system prompt per user's specification
    const systemPrompt = `You are an AI agricultural assistant for farmers. Your role is to provide highly accurate, practical, and localized farming advice.
Do not generate generic responses; instead, ground your answers in the factual data and insights provided below, while always focusing on the specific user’s query.

=== CONTEXT DATA SOURCES ===
1. User Profile:
   - Name, location (state, district, lat/lon), preferred language (e.g., English, Malayalam).
   - Farming experience, farm size, crop preferences.

2. Crop Information (from database):
   - Crop name (English + Malayalam), growing season, water requirements.
   - Ideal soil type, soil pH range, organic matter requirements.
   - Temperature, rainfall requirements.
   - Known pests and diseases.
   - Market demand indicators.

3. Soil Insights (from database & IoT/soil data):
   - pH, N-P-K levels, organic carbon, moisture, sand/clay/silt ratios.
   - Suitability score per crop with reasoning.

4. Weather Data (from weather API/database):
   - Current temperature, rainfall, humidity, wind speed, solar radiation.
   - Forecast (7-day if available).
   - Climate zone of location.

5. Market Insights (from market_prices table):
   - Current price, price trends, demand level in user’s nearest market.
   - Recommended timing for selling crops.

6. Plant Health & Disease Detection (AI Vision Model):
   - If user uploads leaf/plant image: detect disease, identify crop stage, suggest treatment (organic and chemical).
   - If no disease is detected: confirm healthy status and general crop care steps.

7. Language Rules:
   - If user inputs in Malayalam → respond in Malayalam.
   - If user inputs in English → respond in English.
   - Never mix languages unless explicitly asked.

=== BEHAVIOR RULES ===
- Always directly address the user’s query (do not restate the context unless relevant).
- Use the above context data to personalize answers, but only include details that help answer the query.
- If multiple solutions exist, rank them clearly.
- Provide actionable steps (not vague descriptions).
- Avoid hallucinations. If data is missing, clearly state “No data available for this crop/region”.
- Be concise, practical, and farmer-friendly.

=== END CONTEXT ===

Now process the user’s query with the above information. The user’s query is the actual prompt, not this context block.`;

    // Remove old context building - we'll use the structured contextString instead
    // if (context?.location) {
    //   systemPrompt += `\n\nUser Location: ${context.location.address} (${context.location.lat}, ${context.location.lng})`;
    // }

    // if (context?.weather) {
    //   const weather = context.weather;
    //   systemPrompt += `\n\nCurrent Weather:`;
    //   if (weather.main?.temp) systemPrompt += ` Temperature: ${weather.main.temp}°C`;
    //   if (weather.main?.humidity) systemPrompt += `, Humidity: ${weather.main.humidity}%`;
    //   if (weather.weather?.[0]?.description) systemPrompt += `, Conditions: ${weather.weather[0].description}`;
    // }

    // if (context?.soil) {
    //   const soil = context.soil;
    //   systemPrompt += `\n\nSoil Properties:`;
    //   if (typeof soil.ph === 'number') systemPrompt += ` pH: ${soil.ph} (${soil.phInterpretation || 'Unknown'})`;
    //   if (typeof soil.organicCarbon === 'number') systemPrompt += `, Organic Carbon: ${soil.organicCarbon}% (${soil.ocInterpretation || 'Unknown'})`;
    //   if (soil.texture) systemPrompt += `, Texture: ${soil.texture}`;
    //   if (typeof soil.sandPercent === 'number') systemPrompt += `, Sand: ${soil.sandPercent}%`;
    //   if (typeof soil.clayPercent === 'number') systemPrompt += `, Clay: ${soil.clayPercent}%`;
    //   if (typeof soil.siltPercent === 'number') systemPrompt += `, Silt: ${soil.siltPercent}%`;
    // }

    const requestBody = {
      model: import.meta.env.VITE_OPENROUTER_MODEL || "deepseek/deepseek-chat-v3.1:free",
      messages: [
        { role: "system", content: systemPrompt },
        // Optional raw context as a single assistant-prelude message to ground answers
        ...(context?.contextString ? [{ role: "assistant", content: context.contextString }] as const : []),
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 1500,
      top_p: 0.9
    };

    try {
      console.log('Calling OpenRouter DeepSeek Chat v3.1 API...');
      
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          // Use standard Referer header key per OpenRouter docs
          "Referer": window.location.origin,
          "X-Title": "SmartAgri Advisor"
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        // Surface a concise message in console; upstream UI will fall back if needed
        console.warn('OpenRouter API error:', response.status, errorText);
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data: OpenRouterResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error("No response from OpenRouter API");
      }

      const aiResponse = data.choices[0].message.content;
      console.log('OpenRouter response received:', aiResponse);
      
      return aiResponse;

    } catch (error) {
      console.error('OpenRouter API error:', error);
      throw error;
    }
  }
};

export default OpenRouterService;
