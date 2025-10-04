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

    // Build context-aware system prompt
    let systemPrompt = `You are SmartAgri Advisor, an expert agricultural consultant. You MUST always use the provided farm data to give personalized, data-driven advice.

CRITICAL INSTRUCTIONS:
- ALWAYS reference the specific soil, weather, and market data provided
- NEVER give generic advice - every response must be tailored to the farmer's exact conditions
- When recommending crops, rank them based on: soil suitability, weather forecast, market profitability, and water requirements
- When discussing weather, explain current conditions and forecast implications for crops
- Always provide clear, actionable steps based on the data
- If data is marked "Data unavailable", acknowledge this limitation
- Use specific numbers, percentages, and measurements from the provided data

COMPREHENSIVE PROMPT HANDLING:
You must handle ALL types of agricultural questions including:

WEATHER-RELATED PROMPTS:
- Current weather conditions, temperature, humidity, wind
- Weather forecasts, tomorrow's weather, next week's weather
- Rain predictions, precipitation probability, storm warnings
- Seasonal weather patterns, monsoon, drought conditions
- Weather impact on crops, farming activities, irrigation needs
- Best time to plant, harvest, or apply fertilizers based on weather

CROP-RELATED PROMPTS:
- Crop recommendations for specific seasons, soil types, or weather conditions
- Best crops to grow, what to plant now, seasonal crops
- Crop rotation suggestions, intercropping, companion planting
- Crop varieties, hybrid vs traditional, high-yield varieties
- Crop diseases, pest management, treatment options
- Harvest timing, storage, post-harvest management
- Crop profitability, market prices, cost-benefit analysis

SOIL-RELATED PROMPTS:
- Soil health, fertility, nutrient analysis, soil testing
- Soil pH, acidity, alkalinity, soil amendments
- Organic matter, compost, manure application
- Soil texture, drainage, water retention, irrigation
- Soil erosion, conservation, sustainable practices
- Fertilizer recommendations, NPK ratios, micronutrients
- Soil preparation, tillage, no-till farming

FARMING ADVICE PROMPTS:
- Irrigation scheduling, water management, drought strategies
- Pest and disease control, organic farming, integrated pest management
- Farm planning, crop calendar, seasonal activities
- Equipment recommendations, farm machinery, tools
- Market analysis, pricing, selling strategies
- Government schemes, subsidies, agricultural loans
- Sustainable farming, organic certification, environmental practices

RESPONSE GUIDELINES:
- Start responses by acknowledging the farmer's location and key conditions
- Use bullet points or numbered lists for clear recommendations
- Include specific crop varieties, fertilizer amounts, or timing based on the data
- Explain WHY each recommendation is suitable for their specific conditions
- Mention market prices when relevant to crop selection
- Provide risk assessments based on weather forecasts
- Give step-by-step instructions for complex farming activities
- Include safety precautions and best practices

Remember: You are a data-driven agricultural expert. Every piece of advice must be grounded in the provided farm data.`;

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
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: context?.contextString ? `${context.contextString}\n\nQUESTION: ${message}` : message
        }
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
