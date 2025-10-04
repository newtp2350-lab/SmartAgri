import { useState, useRef, useEffect } from "react";
import StreamedText from "./StreamedText";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Sprout, Image as ImageIcon, Mic, Camera, History } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { OpenRouterService } from "@/services/OpenRouterService";
import { LocalAIService } from "@/services/LocalAIService";
import { WeatherService } from "@/services/WeatherService";
import { fetchSoilData, interpretSoilPH, interpretOrganicCarbon, interpretSoilTexture } from "@/api/soilgrids";
import { MarketService, getStateAndMarket } from "@/services/MarketService";
import { DatabaseService } from "@/services/DatabaseService";
import { predictFromImageElement, predictFromImageElementByType } from "@/services/plantModel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SpeechToTextButton from "./SpeechToTextButton";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  location?: { lat: number; lng: number; address: string };
}

export const ChatInterface = ({ location }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastLocation, setLastLocation] = useState<string | null>(null);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [modelType, setModelType] = useState<'plantdoc' | 'plantvillage' | 'plantnet'>('plantdoc');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const autoScrollRef = useRef<boolean>(true);

  // Load chat history on component mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  // Auto-scroll to bottom when messages change (only if user is near bottom)
  useEffect(() => {
    if (autoScrollRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, typingMessageId]);

  // Load chat history from database
  const loadChatHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const user = await DatabaseService.getCurrentUser();
      if (!user) {
        // If no user, show welcome message
        setMessages([{
          id: '1',
          type: 'assistant',
          content: `Hello! I'm your SmartAgri Advisor. I can help you with crop recommendations, soil analysis, weather insights, market information, and plant disease detection. ${location ? `I see you're located at ${location.address}.` : 'Please set your location first.'}

What would you like to know about farming today?`,
          timestamp: new Date(),
        }]);
        return;
      }

      const history = await DatabaseService.getChatHistory(user.id, 20);
      if (history.length > 0) {
        // Convert database messages to UI format
        const uiMessages: Message[] = history.reverse().map((msg, index) => ({
          id: msg.id || `history-${index}`,
          type: 'user' as const,
          content: msg.query,
          timestamp: new Date(msg.timestamp || new Date()),
        })).concat(history.map((msg, index) => ({
          id: `response-${msg.id || index}`,
          type: 'assistant' as const,
          content: msg.response,
          timestamp: new Date(msg.timestamp || new Date()),
        }))).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

        setMessages(uiMessages);
      } else {
        // Show welcome message if no history
        setMessages([{
          id: '1',
          type: 'assistant',
          content: `Hello! I'm your SmartAgri Advisor. I can help you with crop recommendations, soil analysis, weather insights, market information, and plant disease detection. ${location ? `I see you're located at ${location.address}.` : 'Please set your location first.'}

What would you like to know about farming today?`,
          timestamp: new Date(),
        }]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      // Show welcome message on error
      setMessages([{
        id: '1',
        type: 'assistant',
        content: `Hello! I'm your SmartAgri Advisor. I can help you with crop recommendations, soil analysis, weather insights, market information, and plant disease detection. ${location ? `I see you're located at ${location.address}.` : 'Please set your location first.'}

What would you like to know about farming today?`,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Update welcome message when location changes
  useEffect(() => {
    if (location?.address && location.address !== lastLocation) {
      setLastLocation(location.address);
      
      // Update the welcome message with new location
      setMessages(prev => {
        const updated = [...prev];
        if (updated.length > 0 && updated[0].type === 'assistant') {
          updated[0] = {
            ...updated[0],
            content: `Hello! I'm your SmartAgri Advisor. I can help you with crop recommendations, soil analysis, weather insights, market information, and plant disease detection. I see you're located at ${location.address}. 

🌱 **New Feature**: You can now upload plant images for instant AI-powered disease detection! Just click the image button to upload a photo of a plant leaf.

What would you like to know about farming today?`
          };
        }
        return updated;
      });

      // Add a notification about fresh data being available
      if (lastLocation) { // Only show notification if there was a previous location
        const locationUpdateMessage: Message = {
          id: `location-update-${Date.now()}`,
          type: 'assistant',
          content: `📍 Location updated to ${location.address}. Fresh market prices, weather data, and soil information will be fetched for your next question.`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, locationUpdateMessage]);
      }
    }
  }, [location?.address, lastLocation]);

  // Infinite scroll handler (disabled by default)
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    // Disabled infinite scroll to prevent unwanted message loading
    // Uncomment the code below if you want to enable infinite scroll
    /*
    const { scrollTop } = e.currentTarget;
    if (scrollTop === 0 && !isLoadingOlder) {
      loadOlderMessages();
    }
    */
    const el = e.currentTarget;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    autoScrollRef.current = distanceFromBottom < 80; // enable auto-scroll if close to bottom
  };

  // Placeholder function for loading older messages (disabled)
  const loadOlderMessages = async () => {
    // This function is disabled to prevent automatic message loading
    // You can implement this later when you have actual message history
    console.log('loadOlderMessages called - currently disabled');
  };

  const inFlightRef = useRef(false);


  const handlePickImage = () => {
    // default to opening popover via UI; keep for direct fallback
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzingImage(true);
    
    try {
      // Create image element for analysis
      const img = new Image();
      img.src = URL.createObjectURL(file);
      
      img.onload = async () => {
        try {
          // Create a user message showing the image was uploaded (shown first)
          const userMsg: Message = {
            id: `user-${Date.now()}`,
            type: 'user',
            content: `📷 Uploaded plant image (${modelType}): ${file.name}`,
            timestamp: new Date(),
          };
          
          setMessages(prev => [...prev, userMsg]);

          // Run plant disease detection using selected model
          const prediction = await predictFromImageElementByType(modelType, img);

          // Ask the AI assistant for disease overview, remedies, fertilizers, and pesticides
          const disease = prediction.label;

          // Build rich farm context to pass to the AI
          let ctx: any = { detectedDisease: disease, modelType };
          try {
            if (location) {
              const [weather, forecast, soil] = await Promise.allSettled([
                WeatherService.getCurrent(location),
                WeatherService.getHourlyForecast(location),
                fetchSoilData(location.lat, location.lng),
              ]);

              const weatherData = weather.status === 'fulfilled' ? weather.value : null;
              const forecastData = forecast.status === 'fulfilled' ? forecast.value : null;
              const soilData = soil.status === 'fulfilled' ? soil.value : null;

              let contextString = `FARM DATA SUMMARY (for disease advice)\n`;
              contextString += `Location: ${location.address} (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})\n`;
              if (weatherData) {
                contextString += `Weather: ${weatherData.main?.temp ? weatherData.main.temp.toFixed(1) + '°C' : 'n/a'}, ${weatherData.weather?.[0]?.description || 'n/a'}, humidity ${weatherData.main?.humidity ?? 'n/a'}%\n`;
              }
              if (soilData && typeof soilData.ph === 'number') {
                contextString += `Soil: pH ${soilData.ph.toFixed(1)}, OC ${typeof soilData.organicCarbon === 'number' ? soilData.organicCarbon.toFixed(1) + '%' : 'n/a'}, texture ${soilData.texture || 'n/a'}\n`;
              }

              ctx = { ...ctx, location, weather: weatherData, forecast: forecastData, soil: soilData, contextString };
            }
          } catch (e) {
            // proceed without extra context on failure
          }

          const prompt = `You are an agricultural expert.\nDetected plant disease: ${disease}.\nUse the provided farm context if any to localize timing and practicality.\nProvide a concise, actionable guide with these sections:\n- Overview (1-2 lines)\n- Key symptoms to confirm\n- Immediate actions farmers can take\n- Organic/Bio controls (names and how to apply)\n- Chemical control (active ingredients + safe usage; give 2-3 options)\n- Recommended fertilizers or nutrition plan to support recovery (NPK or micronutrients if relevant)\n- Preventive practices (hygiene, spacing, resistant varieties)\nFormat as clear bullet points. Avoid confidence/probability. Keep it practical.`;

          let details = '';
          try {
            details = await OpenRouterService.chat(prompt, ctx);
          } catch (e) {
            details = `**Detected Condition:** ${disease}\n\nI couldn't fetch detailed guidance right now. Please ensure internet connectivity and try again, or ask for remedies for ${disease}.`;
          }

          const responseMsg: Message = {
            id: `analysis-${Date.now()}`,
            type: 'assistant',
            content: `🌱 **Plant Disease Analysis**\n\n**Detected Condition:** ${disease}\n\n${details}`,
            timestamp: new Date(),
          };

          setMessages(prev => [...prev, responseMsg]);
          
        } catch (error) {
          console.error('Plant disease detection error:', error);
          
          // Create more specific error message based on error type
          let errorMessage = `I encountered an error while analyzing your plant image. `;
          
          if (error instanceof Error) {
            if (error.message.includes('Model loading failed')) {
              errorMessage += `The AI model is currently unavailable. Please try again later or ask me about plant diseases in text.`;
            } else if (error.message.includes('inputShape') || error.message.includes('batchInputShape')) {
              errorMessage += `There's an issue with the AI model configuration. Please contact support or ask me about plant diseases in text.`;
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
              errorMessage += `There's a network issue. Please check your internet connection and try again.`;
            } else {
              errorMessage += `Please try uploading a clearer image or ask me about plant diseases in text.`;
            }
          } else {
            errorMessage += `Please try uploading a clearer image or ask me about plant diseases in text.`;
          }
          
          // Add error message
          const errorMsg: Message = {
            id: `error-${Date.now()}`,
            type: 'assistant',
            content: errorMessage,
            timestamp: new Date(),
          };
          
          setMessages(prev => [...prev, errorMsg]);
        } finally {
          setIsAnalyzingImage(false);
        }
      };

      img.onerror = () => {
        setIsAnalyzingImage(false);
        const errorMsg: Message = {
          id: `error-${Date.now()}`,
          type: 'assistant',
          content: `Failed to load the image. Please try uploading a different image file.`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMsg]);
      };
      
    } catch (error) {
      console.error('File processing error:', error);
      setIsAnalyzingImage(false);
    }
    
    // Reset value so selecting the same file again triggers change
    e.currentTarget.value = "";
  };

  const handleTranscription = (text: string) => {
    setInputMessage(prev => `${prev}${prev ? ' ' : ''}${text}`);
  };


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    if (inFlightRef.current) return; // prevent overlapping calls

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage("");
    setIsLoading(true);
    setTypingMessageId(null);
    inFlightRef.current = true;

    try {
      // Gather comprehensive context data if location is available
      let context = {};
      if (location) {
        try {
          console.log('Fetching comprehensive farm data for location:', location);
          
          // Fetch all data sources in parallel
          const [weather, forecast, soil, marketData] = await Promise.allSettled([
            WeatherService.getCurrent(location),
            WeatherService.getHourlyForecast(location),
            fetchSoilData(location.lat, location.lng),
            MarketService.getMarketPricesForLocation(['Wheat', 'Rice', 'Sugarcane', 'Cotton', 'Mustard', 'Groundnut', 'Maize', 'Sorghum'], location.address)
          ]);
          
          // Log each API result
          console.log('Weather API result:', weather);
          console.log('Forecast API result:', forecast);
          console.log('Soil API result:', soil);
          console.log('Market API result:', marketData);
          
          // Build structured context
          const weatherData = weather.status === 'fulfilled' ? weather.value : null;
          const forecastData = forecast.status === 'fulfilled' ? forecast.value : null;
          const soilData = soil.status === 'fulfilled' ? soil.value : null;
          const marketPrices = marketData.status === 'fulfilled' ? marketData.value : {};
          
          console.log('Processed data - Weather:', weatherData, 'Soil:', soilData, 'Market:', marketPrices);
          
          // Create comprehensive context string
          let contextString = `FARM DATA SUMMARY:\n`;
          contextString += `📍 Location: ${location.address} (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})\n\n`;
          
          // Soil Information
          if (soilData && typeof soilData.ph === 'number' && !isNaN(soilData.ph)) {
            contextString += `🌱 SOIL PROPERTIES:\n`;
            contextString += `• pH Level: ${soilData.ph.toFixed(1)} (${soilData.phInterpretation || 'Unknown'})\n`;
            contextString += `• Organic Carbon: ${typeof soilData.organicCarbon === 'number' && !isNaN(soilData.organicCarbon) ? soilData.organicCarbon.toFixed(1) + '%' : 'Data unavailable'} (${soilData.ocInterpretation || 'Unknown'})\n`;
            contextString += `• Soil Texture: ${soilData.texture || 'Data unavailable'}\n`;
            contextString += `• Sand Content: ${typeof soilData.sandPercent === 'number' && !isNaN(soilData.sandPercent) ? soilData.sandPercent.toFixed(1) + '%' : 'Data unavailable'}\n`;
            contextString += `• Clay Content: ${typeof soilData.clayPercent === 'number' && !isNaN(soilData.clayPercent) ? soilData.clayPercent.toFixed(1) + '%' : 'Data unavailable'}\n`;
            contextString += `• Silt Content: ${typeof soilData.siltPercent === 'number' && !isNaN(soilData.siltPercent) ? soilData.siltPercent.toFixed(1) + '%' : 'Data unavailable'}\n\n`;
          } else {
            contextString += `🌱 SOIL PROPERTIES: Data unavailable\n\n`;
          }
          
          // Weather Information
          if (weatherData) {
            contextString += `🌤️ CURRENT WEATHER:\n`;
            contextString += `• Temperature: ${weatherData.main?.temp ? weatherData.main.temp.toFixed(1) + '°C' : 'Data unavailable'}\n`;
            contextString += `• Humidity: ${weatherData.main?.humidity ? weatherData.main.humidity + '%' : 'Data unavailable'}\n`;
            contextString += `• Conditions: ${weatherData.weather?.[0]?.description || 'Data unavailable'}\n`;
            contextString += `• Wind Speed: ${weatherData.wind?.speed ? weatherData.wind.speed.toFixed(1) + ' m/s' : 'Data unavailable'}\n`;
            contextString += `• Pressure: ${weatherData.main?.pressure ? weatherData.main.pressure + ' hPa' : 'Data unavailable'}\n\n`;
          } else {
            contextString += `🌤️ CURRENT WEATHER: Data unavailable\n\n`;
          }
          
          // Weather Forecast Information
          if (forecastData && forecastData.list && forecastData.list.length > 0) {
            contextString += `📅 WEATHER FORECAST (Next 24 Hours):\n`;
            // Get next 8 hours (3-hour intervals)
            const nextHours = forecastData.list.slice(0, 8);
            nextHours.forEach((hour, index) => {
              const time = new Date(hour.dt * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
              contextString += `• ${time}: ${hour.main.temp.toFixed(1)}°C, ${hour.weather[0].description}, ${hour.main.humidity}% humidity`;
              if (hour.pop > 0) contextString += `, ${Math.round(hour.pop * 100)}% rain chance`;
              contextString += `\n`;
            });
            contextString += `\n`;
          } else {
            contextString += `📅 WEATHER FORECAST: Data unavailable\n\n`;
          }
          
          // Market Information
          if (Object.keys(marketPrices).length > 0) {
            contextString += `💰 MARKET PRICES (per Quintal):\n`;
            Object.entries(marketPrices).forEach(([crop, prices]) => {
              if (prices && prices.length > 0) {
                const latestPrice = prices[0]; // Get the most recent price
                // Use same price logic as market section: modelPrice as primary, fallback to price
                const primaryPrice = latestPrice.modelPrice || latestPrice.price || 
                  (prices.length > 1 ? prices.reduce((sum, p) => sum + (p.modelPrice || p.price || 0), 0) / prices.length : 0);
                
                if (latestPrice.minPrice && latestPrice.maxPrice && latestPrice.modelPrice) {
                  contextString += `• ${crop}: Min ₹${latestPrice.minPrice}, Max ₹${latestPrice.maxPrice}, Model ₹${Math.round(primaryPrice)}\n`;
                } else {
                  contextString += `• ${crop}: ₹${Math.round(primaryPrice)}\n`;
                }
              }
            });
            contextString += `\n`;
          } else {
            contextString += `💰 MARKET PRICES: Data unavailable\n\n`;
          }
          // Output rules for the AI to ensure ordering and clarity
          contextString += `📋 OUTPUT RULES:\n`;
          contextString += `• When recommending crops, RANK from most suitable to least suitable for THIS location.\n`;
          contextString += `• Use a numbered list and include one-line reasons tied to soil/weather/market.\n`;
          contextString += `• Prefer crops matching pH, texture, OC; then check temperature/humidity/rain; then profitability.\n\n`;
          
          context = {
            location,
            weather: weatherData,
            forecast: forecastData,
            soil: soilData && typeof soilData.ph === 'number' && !isNaN(soilData.ph) ? {
              ...soilData,
              phInterpretation: soilData.phInterpretation,
              ocInterpretation: soilData.ocInterpretation,
              texture: soilData.texture
            } : null,
            market: marketPrices,
            contextString
          };
          
          console.log('Comprehensive context built:', context);
          
        } catch (error) {
          console.warn("Failed to fetch comprehensive context data:", error);
          // If soil data fails, still try to get weather and market data
          try {
            const [weather, forecast, marketData] = await Promise.allSettled([
              WeatherService.getCurrent(location),
              WeatherService.getHourlyForecast(location),
              MarketService.getMarketPricesForLocation(['Wheat', 'Rice', 'Sugarcane', 'Cotton', 'Mustard', 'Groundnut', 'Maize', 'Sorghum'], location.address)
            ]);
            
            const weatherData = weather.status === 'fulfilled' ? weather.value : null;
            const forecastData = forecast.status === 'fulfilled' ? forecast.value : null;
            const marketPrices = marketData.status === 'fulfilled' ? marketData.value : {};
            
            let contextString = `FARM DATA SUMMARY:\n`;
            contextString += `📍 Location: ${location.address} (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})\n\n`;
            contextString += `🌱 SOIL PROPERTIES: Data unavailable\n\n`;
            
            if (weatherData) {
              contextString += `🌤️ CURRENT WEATHER:\n`;
              contextString += `• Temperature: ${weatherData.main?.temp ? weatherData.main.temp.toFixed(1) + '°C' : 'Data unavailable'}\n`;
              contextString += `• Humidity: ${weatherData.main?.humidity ? weatherData.main.humidity + '%' : 'Data unavailable'}\n`;
              contextString += `• Conditions: ${weatherData.weather?.[0]?.description || 'Data unavailable'}\n\n`;
            } else {
              contextString += `🌤️ CURRENT WEATHER: Data unavailable\n\n`;
            }
            
            if (forecastData && forecastData.list && forecastData.list.length > 0) {
              contextString += `📅 WEATHER FORECAST (Next 24 Hours):\n`;
              const nextHours = forecastData.list.slice(0, 8);
              nextHours.forEach((hour, index) => {
                const time = new Date(hour.dt * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                contextString += `• ${time}: ${hour.main.temp.toFixed(1)}°C, ${hour.weather[0].description}, ${hour.main.humidity}% humidity`;
                if (hour.pop > 0) contextString += `, ${Math.round(hour.pop * 100)}% rain chance`;
                contextString += `\n`;
              });
              contextString += `\n`;
            } else {
              contextString += `📅 WEATHER FORECAST: Data unavailable\n\n`;
            }
            
            if (Object.keys(marketPrices).length > 0) {
              contextString += `💰 MARKET PRICES (per Quintal):\n`;
              Object.entries(marketPrices).forEach(([crop, prices]) => {
                if (prices && prices.length > 0) {
                  const latestPrice = prices[0]; // Get the most recent price
                  // Use same price logic as market section: modelPrice as primary, fallback to price
                  const primaryPrice = latestPrice.modelPrice || latestPrice.price || 
                    (prices.length > 1 ? prices.reduce((sum, p) => sum + (p.modelPrice || p.price || 0), 0) / prices.length : 0);
                  
                  if (latestPrice.minPrice && latestPrice.maxPrice && latestPrice.modelPrice) {
                    contextString += `• ${crop}: Min ₹${latestPrice.minPrice}, Max ₹${latestPrice.maxPrice}, Model ₹${Math.round(primaryPrice)}\n`;
                  } else {
                    contextString += `• ${crop}: ₹${Math.round(primaryPrice)}\n`;
                  }
                }
              });
            } else {
              contextString += `💰 MARKET PRICES: Data unavailable\n\n`;
            }
            // Output rules for the AI to ensure ordering and clarity
            contextString += `📋 OUTPUT RULES:\n`;
            contextString += `• When recommending crops, RANK from most suitable to least suitable for THIS location.\n`;
            contextString += `• Use a numbered list and include one-line reasons tied to soil/weather/market.\n`;
            contextString += `• Prefer crops matching pH, texture, OC; then check temperature/humidity/rain; then profitability.\n\n`;
            
            context = {
              location,
              weather: weatherData,
              forecast: forecastData,
              soil: null,
              market: marketPrices,
              contextString
            };
          } catch (fallbackError) {
            console.warn("Fallback data fetch also failed:", fallbackError);
            context = { location };
          }
        }
      }

      // Try OpenRouter first, fallback to local AI (with single retry)
      let aiResponse: string;
      try {
        console.log('Attempting OpenRouter API call with context:', context);
        try {
          aiResponse = await OpenRouterService.chat(currentMessage, context);
        } catch (firstErr) {
          console.warn('First AI attempt failed, retrying once...', firstErr);
          await new Promise(r => setTimeout(r, 400 + Math.random()*300));
          aiResponse = await OpenRouterService.chat(currentMessage, context);
        }
        console.log('OpenRouter API response received:', aiResponse);
      } catch (error) {
        console.warn("OpenRouter failed, using local AI:", error);
        aiResponse = await LocalAIService.chat(currentMessage, context);
        console.log('Local AI response received:', aiResponse);
      }
      
      const newId = (Date.now() + 1).toString();
      const aiMessage: Message = {
        id: newId,
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };
      setTypingMessageId(newId);
      setMessages(prev => [...prev, aiMessage]);

      // Save chat history to database
      try {
        const user = await DatabaseService.getCurrentUser();
        if (user) {
          await DatabaseService.saveChatMessage({
            user_id: user.id,
            query: currentMessage,
            response: aiResponse,
            location: location
          });
        }
      } catch (error) {
        console.error('Error saving chat message:', error);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'm sorry, I encountered an error while processing your request. I'm using a local AI system as a fallback. Please check your OpenRouter API key configuration.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inFlightRef.current = false;
    }
  };

  return (
    <Card className="flex flex-col h-[70vh] max-h-[600px] shadow-soft">
      <CardHeader className="bg-gradient-hero text-primary-foreground rounded-t-lg flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sprout className="w-5 h-5" />
            SmartAgri Assistant
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadChatHistory}
            disabled={isLoadingHistory}
            className="text-primary-foreground hover:bg-white/10"
          >
            <History className="w-4 h-4 mr-2" />
            {isLoadingHistory ? 'Loading...' : 'Refresh History'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        {/* Fixed height scrollable messages container */}
        <div 
          className="flex-1 overflow-y-auto p-4"
          onScroll={handleScroll}
          style={{ height: '500px' }}
        >
          
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-accent text-accent-foreground'
                  }`}>
                    {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}>
                    {message.type === 'assistant' ? (
                      <StreamedText
                        text={message.content}
                        className="text-sm"
                        onProgress={() => {
                          if (autoScrollRef.current) {
                            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        onDone={() => {
                          if (typingMessageId === message.id) setTypingMessageId(null);
                        }}
                      />
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    )}
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-secondary text-secondary-foreground rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            {isAnalyzingImage && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div className="bg-secondary text-secondary-foreground rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm">Analyzing plant image...</span>
                  </div>
                </div>
              </div>
            )}
            {typingMessageId && (
              <div className="text-xs text-muted-foreground pl-11">AI is typing…</div>
            )}
          </div>
          
          {/* Invisible element to scroll to */}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Pinned input bar at bottom */}
        <div className="p-4 border-t border-border flex-shrink-0 bg-background">
          <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
            <Input
              placeholder="Ask about crops, soil, weather, or market prices..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
            {/* Themed model selector */}
            <div className="min-w-[160px]">
              <Select
                value={modelType}
                onValueChange={(v) => setModelType(v as 'plantdoc' | 'plantvillage' | 'plantnet')}
                disabled={isAnalyzingImage || isLoading}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="plantdoc">PlantDoc</SelectItem>
                  <SelectItem value="plantvillage">PlantVillage</SelectItem>
                  <SelectItem value="plantnet">PlantNet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" disabled={isLoading || isAnalyzingImage} variant="hero" title="Attach image" aria-label="Attach image">
                  <ImageIcon className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-40 p-2">
                <button
                  type="button"
                  disabled={isAnalyzingImage}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera className="w-4 h-4" />
                  Camera
                </button>
                <button
                  type="button"
                  disabled={isAnalyzingImage}
                  className="w-full mt-1 flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-4 h-4" />
                  Upload
                </button>
              </PopoverContent>
            </Popover>
                     <SpeechToTextButton
                       onTranscription={handleTranscription}
                       disabled={isLoading}
                       className="shrink-0"
                     />
            <Button type="submit" disabled={isLoading || !inputMessage.trim()} variant="hero">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};