export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

export interface ChatContext {
  location?: { lat: number; lng: number; address: string };
  weather?: any;
  forecast?: any;
  soil?: any;
  market?: any;
}

// Simple rule-based responses for common agricultural questions
const AGRICULTURAL_RESPONSES = {
  greetings: [
    "Hello! I'm here to help with your farming questions. What would you like to know about agriculture today?",
    "Hi there! I'm your SmartAgri Assistant. How can I help you with your farming needs?",
    "Welcome! I'm ready to assist you with crop advice, soil management, and farming techniques."
  ],
  weather: [
    "Weather plays a crucial role in farming. Based on your location, I can help you understand how current conditions affect your crops.",
    "For optimal farming, monitor temperature, humidity, and rainfall patterns. These factors directly impact crop growth and yield.",
    "Consider using weather forecasts to plan your planting and harvesting schedules effectively."
  ],
  crops: [
    "Crop selection depends on your soil type, climate, and market demand. I can help you choose the best crops for your region.",
    "Consider rotating crops to maintain soil health and prevent pest buildup. This practice improves long-term farm productivity.",
    "Different crops have different water and nutrient requirements. Plan your irrigation and fertilization accordingly."
  ],
  soil: [
    "Healthy soil is the foundation of successful farming. Regular soil testing helps determine nutrient levels and pH balance.",
    "Organic matter, proper drainage, and appropriate pH levels are key to maintaining fertile soil for your crops.",
    "Consider cover crops and crop rotation to improve soil structure and fertility over time."
  ],
  general: [
    "Farming requires patience, knowledge, and adaptation to changing conditions. I'm here to support your agricultural journey.",
    "Every farm is unique. Consider your specific location, climate, and resources when making farming decisions.",
    "Stay informed about the latest agricultural practices and technologies to improve your farm's efficiency and sustainability."
  ]
};

function getResponseCategory(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Weather-related keywords
  if (lowerMessage.includes('weather') || lowerMessage.includes('temperature') || lowerMessage.includes('rain') || 
      lowerMessage.includes('forecast') || lowerMessage.includes('humidity') || lowerMessage.includes('wind') ||
      lowerMessage.includes('storm') || lowerMessage.includes('monsoon') || lowerMessage.includes('drought') ||
      lowerMessage.includes('tomorrow') || lowerMessage.includes('next week') || lowerMessage.includes('seasonal') ||
      lowerMessage.includes('precipitation') || lowerMessage.includes('cloud') || lowerMessage.includes('sunny') ||
      lowerMessage.includes('hot') || lowerMessage.includes('cold') || lowerMessage.includes('cool')) {
    return 'weather';
  }
  
  // Crop-related keywords
  if (lowerMessage.includes('crop') || lowerMessage.includes('plant') || lowerMessage.includes('grow') || 
      lowerMessage.includes('harvest') || lowerMessage.includes('seed') || lowerMessage.includes('variety') ||
      lowerMessage.includes('wheat') || lowerMessage.includes('rice') || lowerMessage.includes('maize') ||
      lowerMessage.includes('sugarcane') || lowerMessage.includes('cotton') || lowerMessage.includes('mustard') ||
      lowerMessage.includes('rotation') || lowerMessage.includes('intercrop') || lowerMessage.includes('disease') ||
      lowerMessage.includes('pest') || lowerMessage.includes('yield') || lowerMessage.includes('profit') ||
      lowerMessage.includes('recommend') || lowerMessage.includes('which crop') || lowerMessage.includes('what to grow') ||
      lowerMessage.includes('best crop') || lowerMessage.includes('suitable crop') || lowerMessage.includes('seasonal crop')) {
    return 'crops';
  }
  
  // Soil-related keywords
  if (lowerMessage.includes('soil') || lowerMessage.includes('ph') || lowerMessage.includes('fertility') || 
      lowerMessage.includes('nutrient') || lowerMessage.includes('fertilizer') || lowerMessage.includes('manure') ||
      lowerMessage.includes('compost') || lowerMessage.includes('organic') || lowerMessage.includes('texture') ||
      lowerMessage.includes('drainage') || lowerMessage.includes('erosion') || lowerMessage.includes('tillage') ||
      lowerMessage.includes('npk') || lowerMessage.includes('micronutrient') || lowerMessage.includes('amendment') ||
      lowerMessage.includes('alkaline') || lowerMessage.includes('acidic') || lowerMessage.includes('sandy') ||
      lowerMessage.includes('clay') || lowerMessage.includes('loam') || lowerMessage.includes('carbon')) {
    return 'soil';
  }
  
  // Farming advice keywords
  if (lowerMessage.includes('irrigation') || lowerMessage.includes('water') || lowerMessage.includes('schedule') ||
      lowerMessage.includes('equipment') || lowerMessage.includes('machinery') || lowerMessage.includes('planning') ||
      lowerMessage.includes('market') || lowerMessage.includes('price') || lowerMessage.includes('selling') ||
      lowerMessage.includes('government') || lowerMessage.includes('scheme') || lowerMessage.includes('loan') ||
      lowerMessage.includes('sustainable') || lowerMessage.includes('organic') || lowerMessage.includes('certification') ||
      lowerMessage.includes('farming') || lowerMessage.includes('agriculture') || lowerMessage.includes('farm')) {
    return 'farming';
  }
  
  // Greeting keywords
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || 
      lowerMessage.includes('good morning') || lowerMessage.includes('good afternoon') || lowerMessage.includes('good evening')) {
    return 'greetings';
  }
  
  return 'general';
}

function generateContextualResponse(message: string, context?: ChatContext): string {
  const category = getResponseCategory(message);
  const lower = message.toLowerCase();

  // Helpers to read soil context safely
  const soil = context?.soil || {} as any;
  const ph: number | undefined = typeof soil.ph === 'number' ? soil.ph : undefined;
  const oc: number | undefined = typeof soil.organicCarbon === 'number' ? soil.organicCarbon : undefined;
  const sand: number | undefined = typeof soil.sandPercent === 'number' ? soil.sandPercent : undefined;
  const clay: number | undefined = typeof soil.clayPercent === 'number' ? soil.clayPercent : undefined;
  const silt: number | undefined = typeof soil.siltPercent === 'number' ? soil.siltPercent : undefined;
  const texture: string | undefined = soil.texture;
  const phNote = soil.phInterpretation ? `pH ${ph} (${soil.phInterpretation})` : (typeof ph === 'number' ? `pH ${ph}` : undefined);
  const ocNote = soil.ocInterpretation ? `${soil.ocInterpretation} organic carbon${typeof oc === 'number' ? ` (${oc}%)` : ''}` : (typeof oc === 'number' ? `${oc}% organic carbon` : undefined);

  const weather = context?.weather || {} as any;
  const forecast = context?.forecast || {} as any;
  const temp: number | undefined = weather?.main?.temp; // metric °C

  const where = context?.location?.address ? `For your location (${context.location.address})` : 'For your farm';

  // Weather-specific responses
  if (category === 'weather') {
    let response = `${where}`;
    
    if (typeof temp === 'number') {
      response += `, current temperature is ${temp.toFixed(1)}°C`;
    }
    
    if (weather?.weather?.[0]?.description) {
      response += ` with ${weather.weather[0].description}`;
    }
    
    if (weather?.main?.humidity) {
      response += `. Humidity is ${weather.main.humidity}%`;
    }
    
    if (weather?.wind?.speed) {
      response += `. Wind speed: ${weather.wind.speed.toFixed(1)} m/s`;
    }
    
    // Add forecast information if available
    if (forecast?.list && forecast.list.length > 0) {
      response += `\n\n📅 WEATHER FORECAST:\n`;
      const nextHours = forecast.list.slice(0, 8); // Next 24 hours
      nextHours.forEach((hour: any) => {
        const time = new Date(hour.dt * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        response += `• ${time}: ${hour.main.temp.toFixed(1)}°C, ${hour.weather[0].description}`;
        if (hour.pop > 0) response += `, ${Math.round(hour.pop * 100)}% rain chance`;
        response += `\n`;
      });
      
      // Add farming advice based on forecast
      const hasRain = nextHours.some((hour: any) => hour.pop > 0.3);
      const avgTemp = nextHours.reduce((sum: number, hour: any) => sum + hour.main.temp, 0) / nextHours.length;
      const maxTemp = Math.max(...nextHours.map((hour: any) => hour.main.temp));
      const minTemp = Math.min(...nextHours.map((hour: any) => hour.main.temp));
      
      response += `\n🌱 FARMING ADVICE:\n`;
      if (hasRain) {
        response += `• Rain expected - avoid irrigation, protect sensitive crops\n`;
        response += `• Cover exposed soil to prevent erosion\n`;
      }
      if (maxTemp > 35) {
        response += `• High temperatures - ensure adequate irrigation and mulching\n`;
        response += `• Consider shade nets for sensitive crops\n`;
      } else if (minTemp < 10) {
        response += `• Cool conditions - good for cool-season crops, protect from frost\n`;
        response += `• Cover crops with frost protection if needed\n`;
      }
      if (avgTemp > 25 && avgTemp < 30) {
        response += `• Optimal temperature range for most crops\n`;
      }
      response += `• Monitor soil moisture levels closely\n`;
      response += `• Check for pest activity during temperature changes\n`;
    }
    
    return response;
  }

  // Personalized intents
  if (lower.includes('less water') || lower.includes('low water') || lower.includes('drought')) {
    const droughtCrops = ['Sorghum', 'Pearl millet (Bajra)', 'Finger millet (Ragi)', 'Chickpea (Gram)', 'Pigeon pea (Tur)', 'Groundnut', 'Sesame', 'Mustard'];
    const sandyBias = (typeof sand === 'number' && sand > 60) ? 'Your sandy texture drains quickly, so drought-hardy cereals and pulses fit well.' : '';
    const hotBias = (typeof temp === 'number' && temp > 32) ? 'With current high temperatures, prefer heat-tolerant varieties.' : '';
    const line1 = `${where}, ${[phNote, ocNote, texture ? `texture ${texture}` : undefined].filter(Boolean).join(', ')}.`;
    return `${line1} For low-water cropping, consider: ${droughtCrops.join(', ')}. ${sandyBias} ${hotBias}`.trim();
  }

  // Crop-specific responses
  if (category === 'crops') {
    let response = `${where}`;
    
    // Get market data if available
    const market = context?.market || {};
    const marketPrices = Object.entries(market).map(([crop, prices]: [string, any]) => {
      if (prices && prices.length > 0) {
        const avgPrice = prices.reduce((sum: number, p: any) => sum + p.price, 0) / prices.length;
        return { crop, price: avgPrice };
      }
      return null;
    }).filter(Boolean);
    
    // Determine suitable crops based on soil and weather
    const suited: string[] = [];
    const caution: string[] = [];
    
    if (typeof ph === 'number') {
      if (ph >= 6.0 && ph <= 7.5) {
        suited.push('Wheat', 'Rice', 'Maize', 'Sugarcane', 'Cotton', 'Mustard', 'Groundnut');
      } else if (ph >= 5.5 && ph <= 6.5) {
        suited.push('Potato', 'Tomato', 'Chili', 'Tea', 'Coffee');
        caution.push('pH slightly acidic - good for some crops');
      } else if (ph >= 7.5 && ph <= 8.5) {
        suited.push('Wheat', 'Barley', 'Mustard', 'Cotton', 'Sugarcane');
        caution.push('pH alkaline - avoid acid-loving crops');
      } else {
        caution.push('pH outside optimal range - consider soil amendments');
      }
    }
    
    if (typeof oc === 'number') {
      if (oc < 1.0) {
        caution.push('Low organic matter - add compost or manure');
      } else if (oc > 3.0) {
        suited.push('Rice', 'Sugarcane', 'Vegetables');
      }
    }
    
    if (texture) {
      if (texture.includes('Sandy')) {
        suited.push('Groundnut', 'Sesame', 'Pearl millet', 'Sorghum');
        caution.push('Sandy soil - needs frequent irrigation');
      } else if (texture.includes('Clay')) {
        suited.push('Rice', 'Wheat', 'Sugarcane');
        caution.push('Clay soil - ensure good drainage');
      } else if (texture.includes('Loam')) {
        suited.push('Most crops suitable');
      }
    }
    
    // Add weather-based recommendations
    if (typeof temp === 'number') {
      if (temp > 30) {
        suited.push('Cotton', 'Sugarcane', 'Sorghum', 'Pearl millet');
        caution.push('High temperature - choose heat-tolerant varieties');
      } else if (temp < 20) {
        suited.push('Wheat', 'Barley', 'Mustard', 'Potato');
        caution.push('Cool temperature - good for winter crops');
      }
    }
    
    // Remove duplicates and create response
    const uniqueSuited = [...new Set(suited)];
    
    if (uniqueSuited.length > 0) {
      response += `, here are crop recommendations based on your conditions:\n\n`;
      
      // Add soil info
      if (phNote || ocNote || texture) {
        response += `🌱 SOIL CONDITIONS:\n`;
        if (phNote) response += `• ${phNote}\n`;
        if (ocNote) response += `• ${ocNote}\n`;
        if (texture) response += `• Soil texture: ${texture}\n`;
        response += `\n`;
      }
      
      // Add weather info
      if (typeof temp === 'number') {
        response += `🌤️ WEATHER CONDITIONS:\n`;
        response += `• Current temperature: ${temp.toFixed(1)}°C\n`;
        if (weather?.weather?.[0]?.description) {
          response += `• Conditions: ${weather.weather[0].description}\n`;
        }
        response += `\n`;
      }
      
      response += `🌾 RECOMMENDED CROPS:\n`;
      uniqueSuited.forEach((crop, index) => {
        response += `${index + 1}. ${crop}`;
        
        // Add market price if available
        const marketCrop = marketPrices.find(m => m?.crop.toLowerCase() === crop.toLowerCase());
        if (marketCrop) {
          // Use same price logic as market section: modelPrice as primary, fallback to price
          const primaryPrice = marketCrop.modelPrice || marketCrop.price || 0;
          if (marketCrop.minPrice && marketCrop.maxPrice && marketCrop.modelPrice) {
            response += ` - Min ₹${marketCrop.minPrice}, Max ₹${marketCrop.maxPrice}, Model ₹${Math.round(primaryPrice)}/quintal`;
          } else {
            response += ` - ₹${Math.round(primaryPrice)}/quintal`;
          }
        }
        
        // Add specific advice
        if (crop === 'Wheat') response += `\n   • Best for pH 6.0-7.5, moderate water needs`;
        else if (crop === 'Rice') response += `\n   • Requires good water management, high organic matter`;
        else if (crop === 'Cotton') response += `\n   • Heat tolerant, good for alkaline soils`;
        else if (crop === 'Sugarcane') response += `\n   • High water requirement, good for clay soils`;
        else if (crop === 'Mustard') response += `\n   • Drought tolerant, good for sandy soils`;
        else if (crop === 'Groundnut') response += `\n   • Sandy soil preferred, moderate water`;
        
        response += `\n`;
      });
      
      if (caution.length > 0) {
        response += `⚠️ IMPORTANT NOTES:\n`;
        caution.forEach(note => response += `• ${note}\n`);
      }
      
      // Add seasonal advice
      const currentMonth = new Date().getMonth() + 1;
      if (currentMonth >= 10 || currentMonth <= 2) {
        response += `\n📅 SEASONAL ADVICE:\n`;
        response += `• Winter season - ideal for wheat, mustard, potato\n`;
        response += `• Prepare fields for rabi crops\n`;
      } else if (currentMonth >= 6 && currentMonth <= 9) {
        response += `\n📅 SEASONAL ADVICE:\n`;
        response += `• Monsoon season - good for rice, maize, sugarcane\n`;
        response += `• Ensure proper drainage\n`;
      } else {
        response += `\n📅 SEASONAL ADVICE:\n`;
        response += `• Summer season - consider drought-tolerant crops\n`;
        response += `• Plan irrigation schedule carefully\n`;
      }
    } else {
      response += `, I need more information about your soil and weather conditions to provide specific crop recommendations.`;
    }
    
    return response;
  }

  // Soil-specific responses
  if (category === 'soil') {
    let response = `${where}`;
    
    if (phNote || ocNote || texture) {
      response += `, here's your soil analysis:\n\n`;
      
      response += `🌱 SOIL PROPERTIES:\n`;
      if (phNote) response += `• ${phNote}\n`;
      if (ocNote) response += `• ${ocNote}\n`;
      if (texture) response += `• Soil texture: ${texture}\n`;
      if (typeof sand === 'number') response += `• Sand content: ${sand.toFixed(1)}%\n`;
      if (typeof clay === 'number') response += `• Clay content: ${clay.toFixed(1)}%\n`;
      if (typeof silt === 'number') response += `• Silt content: ${silt.toFixed(1)}%\n`;
      
      response += `\n🔧 SOIL IMPROVEMENT RECOMMENDATIONS:\n`;
      
      // pH recommendations
      if (typeof ph === 'number') {
        if (ph < 6.0) {
          response += `• pH is acidic - apply agricultural lime (2-4 tons/ha)\n`;
          response += `• Target pH: 6.5-7.0 for most crops\n`;
        } else if (ph > 8.0) {
          response += `• pH is alkaline - use elemental sulfur or gypsum\n`;
          response += `• Avoid lime application\n`;
        } else {
          response += `• pH is in good range for most crops\n`;
        }
      }
      
      // Organic matter recommendations
      if (typeof oc === 'number') {
        if (oc < 1.0) {
          response += `• Low organic matter - add 10-15 tons/ha compost\n`;
          response += `• Use green manure crops like sunn hemp\n`;
        } else if (oc > 3.0) {
          response += `• Good organic matter content\n`;
        } else {
          response += `• Moderate organic matter - maintain with regular compost\n`;
        }
      }
      
      // Texture-based recommendations
      if (texture) {
        if (texture.includes('Sandy')) {
          response += `• Sandy soil - add organic matter, use mulch\n`;
          response += `• Frequent irrigation needed, split fertilizer applications\n`;
        } else if (texture.includes('Clay')) {
          response += `• Clay soil - improve drainage, avoid over-tillage\n`;
          response += `• Add organic matter to improve structure\n`;
        } else if (texture.includes('Loam')) {
          response += `• Loam soil - ideal texture for most crops\n`;
        }
      }
      
      response += `\n🌾 CROP SUITABILITY:\n`;
      if (typeof ph === 'number' && ph >= 6.0 && ph <= 7.5) {
        response += `• Most crops suitable (wheat, rice, maize, cotton)\n`;
      } else if (typeof ph === 'number' && ph < 6.0) {
        response += `• Acid-loving crops: potato, tea, coffee\n`;
      } else if (typeof ph === 'number' && ph > 7.5) {
        response += `• Alkaline-tolerant crops: wheat, barley, cotton\n`;
      }
      
      response += `\n📋 FERTILIZER RECOMMENDATIONS:\n`;
      response += `• NPK ratio: 120:60:40 kg/ha for most crops\n`;
      if (typeof oc === 'number' && oc < 1.5) {
        response += `• Increase nitrogen by 20% due to low organic matter\n`;
      }
      response += `• Apply micronutrients: Zn, Fe, Mn if deficient\n`;
      response += `• Split applications: 50% at planting, 50% at flowering\n`;
    } else {
      response += `, I need soil test data to provide specific recommendations. Please get your soil tested for pH, organic matter, and nutrients.`;
    }
    
    return response;
  }

  // Farming advice responses
  if (category === 'farming') {
    let response = `${where}`;
    
    if (lower.includes('irrigation') || lower.includes('water')) {
      response += `, here's your irrigation guidance:\n\n`;
      
      if (typeof temp === 'number') {
        if (temp > 30) {
          response += `🌡️ HIGH TEMPERATURE CONDITIONS:\n`;
          response += `• Increase irrigation frequency by 20-30%\n`;
          response += `• Water early morning (5-7 AM) or evening (6-8 PM)\n`;
          response += `• Use mulch to reduce evaporation\n`;
        } else if (temp < 20) {
          response += `🌡️ COOL CONDITIONS:\n`;
          response += `• Reduce irrigation frequency\n`;
          response += `• Water mid-morning to allow drying\n`;
        }
      }
      
      if (texture) {
        if (texture.includes('Sandy')) {
          response += `\n🏜️ SANDY SOIL IRRIGATION:\n`;
          response += `• Frequent, light irrigation (every 2-3 days)\n`;
          response += `• Use drip irrigation for efficiency\n`;
          response += `• Monitor soil moisture closely\n`;
        } else if (texture.includes('Clay')) {
          response += `\n🏺 CLAY SOIL IRRIGATION:\n`;
          response += `• Less frequent, deep irrigation (weekly)\n`;
          response += `• Ensure good drainage\n`;
          response += `• Avoid waterlogging\n`;
        }
      }
      
      response += `\n💧 GENERAL IRRIGATION TIPS:\n`;
      response += `• Check soil moisture 2-3 inches deep\n`;
      response += `• Water when soil feels dry\n`;
      response += `• Use rain gauges to track precipitation\n`;
      response += `• Consider weather forecast before irrigating\n`;
    } else if (lower.includes('market') || lower.includes('price')) {
      response += `, here's market information:\n\n`;
      
      const market = context?.market || {};
      if (Object.keys(market).length > 0) {
        response += `💰 CURRENT MARKET PRICES:\n`;
        Object.entries(market).forEach(([crop, prices]: [string, any]) => {
          if (prices && prices.length > 0) {
            const latestPrice = prices[0]; // Get the most recent price
            // Use same price logic as market section: modelPrice as primary, fallback to price
            const primaryPrice = latestPrice.modelPrice || latestPrice.price || 
              (prices.length > 1 ? prices.reduce((sum, p) => sum + (p.modelPrice || p.price || 0), 0) / prices.length : 0);
            
            if (latestPrice.minPrice && latestPrice.maxPrice && latestPrice.modelPrice) {
              response += `• ${crop.charAt(0).toUpperCase() + crop.slice(1)}: Min ₹${latestPrice.minPrice}, Max ₹${latestPrice.maxPrice}, Model ₹${Math.round(primaryPrice)}/quintal\n`;
            } else {
              response += `• ${crop.charAt(0).toUpperCase() + crop.slice(1)}: ₹${Math.round(primaryPrice)}/quintal\n`;
            }
          }
        });
        
        response += `\n📈 MARKETING TIPS:\n`;
        response += `• Sell during peak demand seasons\n`;
        response += `• Consider contract farming for stable prices\n`;
        response += `• Store crops properly to avoid losses\n`;
        response += `• Explore direct-to-consumer markets\n`;
      } else {
        response += `Market price data is currently unavailable. Check local mandis for current rates.`;
      }
    } else {
      response += `, here's general farming advice:\n\n`;
      
      response += `🌱 FARMING BEST PRACTICES:\n`;
      response += `• Practice crop rotation to maintain soil health\n`;
      response += `• Use integrated pest management (IPM)\n`;
      response += `• Maintain proper spacing between plants\n`;
      response += `• Regular soil testing (every 2-3 years)\n`;
      response += `• Keep farm records for better planning\n`;
      
      if (typeof temp === 'number' && temp > 30) {
        response += `\n🌡️ HOT WEATHER MANAGEMENT:\n`;
        response += `• Use shade nets for sensitive crops\n`;
        response += `• Increase irrigation frequency\n`;
        response += `• Apply mulch to retain moisture\n`;
      }
    }
    
    return response;
  }

  // Default contextualized response
  const responses = AGRICULTURAL_RESPONSES[category as keyof typeof AGRICULTURAL_RESPONSES];
  let contextualResponse = responses[Math.floor(Math.random() * responses.length)];
  if (context?.location) contextualResponse += ` ${where}.`;
  if (typeof temp === 'number') {
    if (temp > 30) contextualResponse += ' It is quite warm now; ensure irrigation and mulching.';
    else if (temp < 15) contextualResponse += ' Cooler conditions favor cool-season crops; protect against frost.';
  }
  if (texture) contextualResponse += ` Your soil texture is ${texture}.`;
  if (phNote) contextualResponse += ` Soil ${phNote}.`;
  if (ocNote) contextualResponse += ` ${ocNote}.`;
  return contextualResponse;
}

export const LocalAIService = {
  async chat(message: string, context?: ChatContext): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return generateContextualResponse(message, context);
  },

  async getCropRecommendation(location: { lat: number; lng: number; address: string }, season?: string): Promise<string> {
    const prompt = `Based on the location ${location.address}, recommend suitable crops for ${season || 'current season'}. Consider soil type, climate, and market demand.`;
    return this.chat(prompt, { location });
  },

  async getFarmingAdvice(topic: string, context?: ChatContext): Promise<string> {
    const prompt = `Provide detailed farming advice about: ${topic}`;
    return this.chat(prompt, context);
  }
};

export default LocalAIService;
