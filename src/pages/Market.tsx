import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calculator, 
  Bell, 
  Search,
  Filter,

  Download,
  MapPin,
  Loader2
} from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";

import { useLocation } from "@/hooks/use-location";
import { MarketService, MarketPrice } from "@/services/MarketService";
import { getStateAndMarket } from "@/services/MarketService";
import { WeatherService } from "@/services/WeatherService";
import { fetchSoilData } from "@/api/soilgrids";

// Interface for crop suitability scoring
interface CropSuitability {
  crop: string;
  price: number;
  minPrice?: number;
  maxPrice?: number;
  modelPrice?: number;
  volume: string;
  change: number;
  trend: "up" | "down";
  suitabilityScore: number;
  market: string;
  state: string;
  date: string;
}

// Enhanced crop suitability scoring function with location-specific intelligence
const calculateCropSuitability = (
  crop: string, 
  price: number, 
  soilData: any, 
  weatherData: any,
  location: any
): number => {
  let score = 0;
  
  // Base score from price (higher price = higher score)
  score += Math.min(price / 100, 40); // Cap at 40 points
  
  // Location-specific crop preferences (based on Indian agriculture patterns)
  const locationPreferences: Record<string, Record<string, number>> = {
    'mumbai': {
      'Rice': 25, 'Sugarcane': 20, 'Cotton': 15, 'Groundnut': 20, 'Maize': 15,
      'Wheat': 10, 'Mustard': 5, 'Sorghum': 15, 'Barley': 5, 'Potato': 10
    },
    'delhi': {
      'Wheat': 25, 'Mustard': 20, 'Sugarcane': 15, 'Rice': 10, 'Maize': 15,
      'Cotton': 5, 'Groundnut': 10, 'Sorghum': 10, 'Barley': 20, 'Potato': 15
    },
    'bangalore': {
      'Rice': 20, 'Ragi': 25, 'Maize': 20, 'Sugarcane': 15, 'Groundnut': 20,
      'Wheat': 5, 'Mustard': 10, 'Cotton': 10, 'Sorghum': 15, 'Barley': 5
    },
    'chennai': {
      'Rice': 25, 'Sugarcane': 20, 'Cotton': 15, 'Groundnut': 20, 'Maize': 15,
      'Wheat': 5, 'Mustard': 10, 'Sorghum': 15, 'Barley': 5, 'Potato': 10
    },
    'kolkata': {
      'Rice': 25, 'Jute': 20, 'Sugarcane': 15, 'Maize': 15, 'Groundnut': 15,
      'Wheat': 10, 'Mustard': 15, 'Cotton': 10, 'Sorghum': 10, 'Barley': 10
    },
    'hyderabad': {
      'Rice': 20, 'Cotton': 25, 'Maize': 20, 'Sugarcane': 15, 'Groundnut': 20,
      'Wheat': 10, 'Mustard': 15, 'Sorghum': 20, 'Barley': 10, 'Potato': 15
    },
    'pune': {
      'Sugarcane': 25, 'Cotton': 20, 'Groundnut': 20, 'Maize': 15, 'Rice': 10,
      'Wheat': 10, 'Mustard': 15, 'Sorghum': 15, 'Barley': 10, 'Potato': 15
    },
    'ahmedabad': {
      'Cotton': 25, 'Groundnut': 20, 'Wheat': 15, 'Mustard': 20, 'Maize': 15,
      'Rice': 5, 'Sugarcane': 10, 'Sorghum': 15, 'Barley': 15, 'Potato': 10
    },
    'jaipur': {
      'Wheat': 20, 'Mustard': 25, 'Cotton': 15, 'Groundnut': 15, 'Maize': 15,
      'Rice': 5, 'Sugarcane': 10, 'Sorghum': 15, 'Barley': 20, 'Potato': 10
    },
    'lucknow': {
      'Wheat': 25, 'Rice': 20, 'Sugarcane': 20, 'Maize': 15, 'Mustard': 15,
      'Cotton': 10, 'Groundnut': 10, 'Sorghum': 10, 'Barley': 15, 'Potato': 15
    },
    'bhopal': {
      'Wheat': 20, 'Soybean': 25, 'Maize': 20, 'Cotton': 15, 'Mustard': 15,
      'Rice': 10, 'Sugarcane': 15, 'Groundnut': 15, 'Sorghum': 15, 'Barley': 15
    },
    'guwahati': {
      'Rice': 25, 'Jute': 20, 'Tea': 20, 'Maize': 15, 'Sugarcane': 15,
      'Wheat': 5, 'Mustard': 10, 'Cotton': 5, 'Sorghum': 10, 'Barley': 5
    },
    'amritsar': {
      'Wheat': 25, 'Rice': 20, 'Sugarcane': 15, 'Maize': 15, 'Mustard': 20,
      'Cotton': 10, 'Groundnut': 10, 'Sorghum': 10, 'Barley': 20, 'Potato': 15
    },
    'ludhiana': {
      'Wheat': 25, 'Rice': 20, 'Sugarcane': 15, 'Maize': 20, 'Mustard': 20,
      'Cotton': 10, 'Groundnut': 10, 'Sorghum': 15, 'Barley': 20, 'Potato': 15
    }
  };
  
  // Get location-specific preferences
  const locationKey = location?.address?.toLowerCase() || '';
  let locationScore = 0;
  
  for (const [city, preferences] of Object.entries(locationPreferences)) {
    if (locationKey.includes(city)) {
      locationScore = preferences[crop] || 0;
      break;
    }
  }
  
  // If no specific city found, use comprehensive state-based preferences
  if (locationScore === 0) {
    const statePreferences: Record<string, Record<string, number>> = {
      'maharashtra': { 'Sugarcane': 25, 'Cotton': 20, 'Groundnut': 20, 'Rice': 15, 'Maize': 15, 'Wheat': 10, 'Mustard': 10, 'Sorghum': 15, 'Barley': 10, 'Potato': 15 },
      'punjab': { 'Wheat': 25, 'Rice': 20, 'Sugarcane': 15, 'Maize': 15, 'Mustard': 20, 'Cotton': 10, 'Groundnut': 10, 'Sorghum': 10, 'Barley': 20, 'Potato': 15 },
      'karnataka': { 'Rice': 20, 'Ragi': 25, 'Maize': 20, 'Sugarcane': 15, 'Groundnut': 20, 'Wheat': 5, 'Mustard': 10, 'Cotton': 10, 'Sorghum': 15, 'Barley': 5 },
      'tamil nadu': { 'Rice': 25, 'Sugarcane': 20, 'Cotton': 15, 'Groundnut': 20, 'Maize': 15, 'Wheat': 5, 'Mustard': 10, 'Sorghum': 15, 'Barley': 5, 'Potato': 10 },
      'west bengal': { 'Rice': 25, 'Jute': 20, 'Sugarcane': 15, 'Maize': 15, 'Mustard': 15, 'Wheat': 10, 'Cotton': 10, 'Groundnut': 15, 'Sorghum': 10, 'Barley': 10 },
      'telangana': { 'Rice': 20, 'Cotton': 25, 'Maize': 20, 'Sugarcane': 15, 'Groundnut': 20, 'Wheat': 10, 'Mustard': 15, 'Sorghum': 20, 'Barley': 10, 'Potato': 15 },
      'gujarat': { 'Cotton': 25, 'Groundnut': 20, 'Wheat': 15, 'Mustard': 20, 'Maize': 15, 'Rice': 5, 'Sugarcane': 10, 'Sorghum': 15, 'Barley': 15, 'Potato': 10 },
      'rajasthan': { 'Wheat': 20, 'Mustard': 25, 'Cotton': 15, 'Groundnut': 15, 'Maize': 15, 'Rice': 5, 'Sugarcane': 10, 'Sorghum': 15, 'Barley': 20, 'Potato': 10 },
      'uttar pradesh': { 'Wheat': 25, 'Rice': 20, 'Sugarcane': 20, 'Maize': 15, 'Mustard': 15, 'Cotton': 10, 'Groundnut': 10, 'Sorghum': 10, 'Barley': 15, 'Potato': 15 },
      'madhya pradesh': { 'Wheat': 20, 'Soybean': 25, 'Maize': 20, 'Cotton': 15, 'Mustard': 15, 'Rice': 10, 'Sugarcane': 15, 'Groundnut': 15, 'Sorghum': 15, 'Barley': 15 },
      'assam': { 'Rice': 25, 'Jute': 20, 'Tea': 20, 'Maize': 15, 'Sugarcane': 15, 'Wheat': 5, 'Mustard': 10, 'Cotton': 5, 'Sorghum': 10, 'Barley': 5 },
      'haryana': { 'Wheat': 25, 'Rice': 20, 'Sugarcane': 15, 'Maize': 15, 'Mustard': 20, 'Cotton': 10, 'Groundnut': 10, 'Sorghum': 10, 'Barley': 20, 'Potato': 15 },
      'bihar': { 'Rice': 25, 'Wheat': 20, 'Maize': 20, 'Sugarcane': 15, 'Mustard': 15, 'Cotton': 10, 'Groundnut': 15, 'Sorghum': 15, 'Barley': 15, 'Potato': 15 },
      'odisha': { 'Rice': 25, 'Sugarcane': 20, 'Maize': 15, 'Groundnut': 15, 'Mustard': 15, 'Wheat': 10, 'Cotton': 10, 'Sorghum': 15, 'Barley': 10, 'Potato': 10 },
      'andhra pradesh': { 'Rice': 25, 'Cotton': 20, 'Sugarcane': 20, 'Groundnut': 20, 'Maize': 15, 'Wheat': 10, 'Mustard': 15, 'Sorghum': 15, 'Barley': 10, 'Potato': 15 },
      'kerala': { 'Rice': 25, 'Coconut': 20, 'Rubber': 20, 'Spices': 20, 'Tea': 15, 'Wheat': 5, 'Mustard': 5, 'Cotton': 5, 'Sorghum': 10, 'Barley': 5 },
      'himachal pradesh': { 'Apple': 25, 'Wheat': 20, 'Maize': 20, 'Potato': 20, 'Barley': 20, 'Rice': 10, 'Mustard': 15, 'Cotton': 5, 'Sorghum': 15, 'Groundnut': 10 },
      'jammu and kashmir': { 'Apple': 25, 'Wheat': 20, 'Rice': 20, 'Maize': 15, 'Barley': 20, 'Mustard': 15, 'Cotton': 5, 'Sorghum': 15, 'Groundnut': 10, 'Potato': 15 },
      'uttarakhand': { 'Rice': 20, 'Wheat': 20, 'Maize': 20, 'Potato': 20, 'Barley': 20, 'Mustard': 15, 'Cotton': 10, 'Sorghum': 15, 'Groundnut': 10, 'Sugarcane': 15 },
      'chhattisgarh': { 'Rice': 25, 'Maize': 20, 'Sugarcane': 15, 'Groundnut': 15, 'Mustard': 15, 'Wheat': 15, 'Cotton': 10, 'Sorghum': 15, 'Barley': 15, 'Potato': 15 },
      'jharkhand': { 'Rice': 25, 'Maize': 20, 'Wheat': 15, 'Mustard': 15, 'Groundnut': 15, 'Sugarcane': 15, 'Cotton': 10, 'Sorghum': 15, 'Barley': 15, 'Potato': 15 },
      'manipur': { 'Rice': 25, 'Maize': 20, 'Sugarcane': 15, 'Groundnut': 15, 'Mustard': 10, 'Wheat': 10, 'Cotton': 5, 'Sorghum': 15, 'Barley': 10, 'Potato': 15 },
      'meghalaya': { 'Rice': 25, 'Maize': 20, 'Sugarcane': 15, 'Groundnut': 15, 'Mustard': 10, 'Wheat': 10, 'Cotton': 5, 'Sorghum': 15, 'Barley': 10, 'Potato': 15 },
      'mizoram': { 'Rice': 25, 'Maize': 20, 'Sugarcane': 15, 'Groundnut': 15, 'Mustard': 10, 'Wheat': 10, 'Cotton': 5, 'Sorghum': 15, 'Barley': 10, 'Potato': 15 },
      'nagaland': { 'Rice': 25, 'Maize': 20, 'Sugarcane': 15, 'Groundnut': 15, 'Mustard': 10, 'Wheat': 10, 'Cotton': 5, 'Sorghum': 15, 'Barley': 10, 'Potato': 15 },
      'sikkim': { 'Rice': 25, 'Maize': 20, 'Sugarcane': 15, 'Groundnut': 15, 'Mustard': 10, 'Wheat': 10, 'Cotton': 5, 'Sorghum': 15, 'Barley': 10, 'Potato': 15 },
      'tripura': { 'Rice': 25, 'Maize': 20, 'Sugarcane': 15, 'Groundnut': 15, 'Mustard': 10, 'Wheat': 10, 'Cotton': 5, 'Sorghum': 15, 'Barley': 10, 'Potato': 15 },
      'arunachal pradesh': { 'Rice': 25, 'Maize': 20, 'Sugarcane': 15, 'Groundnut': 15, 'Mustard': 10, 'Wheat': 10, 'Cotton': 5, 'Sorghum': 15, 'Barley': 10, 'Potato': 15 },
      'goa': { 'Rice': 25, 'Coconut': 20, 'Sugarcane': 15, 'Groundnut': 15, 'Mustard': 10, 'Wheat': 10, 'Cotton': 5, 'Sorghum': 15, 'Barley': 10, 'Potato': 15 }
    };
    
    const stateKey = location?.address?.toLowerCase() || '';
    for (const [state, preferences] of Object.entries(statePreferences)) {
      if (stateKey.includes(state)) {
        locationScore = preferences[crop] || 0;
        break;
      }
    }
  }
  
  score += locationScore;
  
  // Soil suitability scoring (enhanced)
  if (soilData) {
    const ph = soilData.ph;
    const oc = soilData.oc;
    const texture = soilData.texture;
    
    // Enhanced pH scoring with crop-specific ranges
    const phRanges: Record<string, { optimal: [number, number], good: [number, number] }> = {
      'Wheat': { optimal: [6.0, 7.5], good: [5.5, 8.0] },
      'Rice': { optimal: [6.0, 7.0], good: [5.5, 7.5] },
      'Cotton': { optimal: [6.0, 7.5], good: [5.5, 8.0] },
      'Maize': { optimal: [6.0, 7.0], good: [5.5, 7.5] },
      'Sugarcane': { optimal: [6.0, 7.5], good: [5.5, 8.0] },
      'Potato': { optimal: [5.5, 6.5], good: [5.0, 7.0] },
      'Tomato': { optimal: [5.5, 6.5], good: [5.0, 7.0] },
      'Groundnut': { optimal: [6.0, 7.0], good: [5.5, 7.5] },
      'Mustard': { optimal: [6.0, 7.5], good: [5.5, 8.0] },
      'Sorghum': { optimal: [6.0, 7.5], good: [5.5, 8.0] },
      'Barley': { optimal: [6.0, 7.5], good: [5.5, 8.0] }
    };
    
    if (phRanges[crop] && typeof ph === 'number' && !isNaN(ph)) {
      const { optimal, good } = phRanges[crop];
      if (ph >= optimal[0] && ph <= optimal[1]) {
        score += 20;
      } else if (ph >= good[0] && ph <= good[1]) {
        score += 10;
      }
    }
    
    // Organic carbon scoring (enhanced)
    if (typeof oc === 'number' && !isNaN(oc)) {
      if (oc >= 2.0) score += 20;
      else if (oc >= 1.5) score += 15;
      else if (oc >= 1.0) score += 10;
      else if (oc >= 0.5) score += 5;
    }
    
    // Enhanced texture scoring
    if (texture) {
      const texturePreferences: Record<string, string[]> = {
        'Rice': ['Clay', 'Clay Loam'],
        'Groundnut': ['Sandy', 'Sandy Loam'],
        'Wheat': ['Loam', 'Clay Loam'],
        'Cotton': ['Loam', 'Sandy Loam'],
        'Maize': ['Loam', 'Sandy Loam'],
        'Sugarcane': ['Loam', 'Clay Loam'],
        'Potato': ['Sandy Loam', 'Loam'],
        'Tomato': ['Loam', 'Sandy Loam'],
        'Mustard': ['Loam', 'Clay Loam'],
        'Sorghum': ['Loam', 'Sandy Loam'],
        'Barley': ['Loam', 'Clay Loam']
      };
      
      const preferredTextures = texturePreferences[crop] || [];
      if (preferredTextures.some(t => texture.includes(t))) {
        score += 15;
      } else if (texture.includes('Loam')) {
        score += 10;
      }
    }
  }
  
  // Enhanced weather suitability scoring
  if (weatherData) {
    const temp = weatherData.main?.temp;
    const humidity = weatherData.main?.humidity;
    const rainfall = weatherData.rain?.['1h'] || 0;
    
    if (temp) {
      const tempRanges: Record<string, { optimal: [number, number], good: [number, number] }> = {
        'Wheat': { optimal: [15, 25], good: [10, 30] },
        'Rice': { optimal: [25, 35], good: [20, 40] },
        'Cotton': { optimal: [25, 35], good: [20, 40] },
        'Maize': { optimal: [20, 30], good: [15, 35] },
        'Sugarcane': { optimal: [25, 35], good: [20, 40] },
        'Potato': { optimal: [15, 25], good: [10, 30] },
        'Tomato': { optimal: [20, 30], good: [15, 35] },
        'Groundnut': { optimal: [25, 35], good: [20, 40] },
        'Mustard': { optimal: [15, 25], good: [10, 30] },
        'Sorghum': { optimal: [25, 35], good: [20, 40] },
        'Barley': { optimal: [15, 25], good: [10, 30] }
      };
      
      const { optimal, good } = tempRanges[crop] || { optimal: [20, 30], good: [15, 35] };
      if (temp >= optimal[0] && temp <= optimal[1]) {
        score += 15;
      } else if (temp >= good[0] && temp <= good[1]) {
        score += 10;
      }
    }
    
    // Humidity scoring for certain crops
    if (humidity) {
      if (crop === 'Rice' && humidity >= 70) score += 10;
      else if (crop === 'Cotton' && humidity >= 50 && humidity <= 80) score += 10;
      else if (crop === 'Wheat' && humidity >= 40 && humidity <= 70) score += 10;
    }
    
    // Rainfall scoring
    if (rainfall > 0) {
      if (crop === 'Rice' && rainfall >= 10) score += 10;
      else if (crop === 'Sugarcane' && rainfall >= 5) score += 10;
      else if (crop === 'Wheat' && rainfall <= 5) score += 10;
    }
  }
  
  // Market demand bonus (higher price indicates higher demand)
  if (price > 5000) score += 10;
  else if (price > 3000) score += 5;
  
  return Math.min(Math.round(score), 100); // Cap at 100
};

const chartConfig = {
  wheat: {
    label: "Wheat (₹/quintal)",
    color: "hsl(var(--chart-1))",
  },
  rice: {
    label: "Rice (₹/quintal)",
    color: "hsl(var(--chart-2))",
  },
  corn: {
    label: "Corn (₹/quintal)",
    color: "hsl(var(--chart-3))",
  },
};

const Market = () => {

  const { location } = useLocation();
  const [marketData, setMarketData] = useState<CropSuitability[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMarket, setSelectedMarket] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [lastLocation, setLastLocation] = useState<string | null>(null);

  // Static labels (translation system removed)
  const titleText = "Market Analytics";
  const subtitleText = "Real-time crop prices, trends, and profitability analysis for your location";
  const avgMarketPriceText = "Avg Market Price";
  const bestCropText = "Best Crop to Plant";
  const totalVolumeText = "Total Volume";
  const activeMarketsText = "Active Markets";
  const livePricesText = "Live Market Prices - Sorted by Best to Plant";
  const cropsRankedText = "Crops are ranked by suitability score based on your location's soil, weather, and market conditions";
  const tonsTradedText = "tons traded today";
  const mandisReportingText = "mandis reporting";

  // Fetch market data when location changes
  useEffect(() => {
    if (location?.address) {
      // Check if location actually changed
      if (lastLocation && lastLocation !== location.address) {
        console.log(`📍 Location changed from ${lastLocation} to ${location.address} - updating market data`);
      }
      setLastLocation(location.address);
      fetchRealMarketData();
    }
  }, [location?.address, lastLocation]);

  const fetchRealMarketData = async () => {
    if (!location?.address) return;
    
    setLoading(true);
    setError(null);
    console.log('🔄 Fetching real market data for:', location.address);
    
    try {
      // Get state and market from location
      const { state, market } = getStateAndMarket(location.address);
      console.log('📍 Parsed location - State:', state, 'Market:', market);
      
      // Fetch soil and weather data in parallel for better suitability scoring
      const [soilData, weatherData] = await Promise.allSettled([
        location?.lat && location?.lng ? fetchSoilData(location.lat, location.lng) : Promise.resolve(null),
        WeatherService.getCurrent(location)
      ]);
      
      const soil = soilData.status === 'fulfilled' ? soilData.value : null;
      const weather = weatherData.status === 'fulfilled' ? weatherData.value : null;
      
      console.log('🌱 Soil data:', soil);
      console.log('🌤️ Weather data:', weather);
      
      // Fetch crops: align with Soil Insights suggested list if available
      let crops = ['Wheat', 'Rice', 'Cotton', 'Maize', 'Sugarcane', 'Mustard', 'Groundnut', 'Soybean', 'Potato', 'Tomato'];
      try {
        const key = location?.address ? `bestCropsForLocation:${location.address}` : 'bestCropsForLocation';
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length) {
            // prioritize saved list and keep unique
            const set = new Set<string>(parsed.concat(crops));
            crops = Array.from(set);
          }
        }
      } catch {}
      const results: CropSuitability[] = [];
      
      // Fetch data for each crop
      for (const crop of crops) {
        try {
          console.log(`🔄 Fetching ${crop} data for ${state}, ${market}`);
          const prices = await MarketService.getPrices({
            commodity: crop,
            state: state,
            district: market
          });
          
          if (prices && prices.length > 0) {
            const latestPrice = prices[0];
            // Use modelPrice as primary, fallback to price, then average if multiple entries
            const price = latestPrice.modelPrice || latestPrice.price || 
              (prices.length > 1 ? prices.reduce((sum, p) => sum + (p.modelPrice || p.price || 0), 0) / prices.length : 0);
            const change = Math.random() * 20 - 10; // Random change for now
            const volume = `${Math.floor(Math.random() * 1000 + 100)} tons`;
            
            // Calculate suitability score with real soil and weather data
            const suitabilityScore = calculateCropSuitability(crop, price, soil, weather, location);
            
            results.push({
              crop,
              price: Math.round(price),
              minPrice: latestPrice.minPrice,
              maxPrice: latestPrice.maxPrice,
              modelPrice: latestPrice.modelPrice,
              volume,
              change: Math.round(change * 10) / 10,
              trend: change > 0 ? "up" : "down",
              suitabilityScore,
              market: latestPrice.market || market,
              state: latestPrice.state || state,
              date: latestPrice.date || new Date().toISOString().split('T')[0]
            });
            
            console.log(`✅ Got ${crop} data: ₹${price} in ${latestPrice.market} (Score: ${suitabilityScore})`);
          } else {
            console.log(`⚠️ No data for ${crop}`);
          }
        } catch (cropError) {
          console.warn(`❌ Failed to fetch ${crop}:`, cropError);
        }
      }
      
      // Sort by suitability score (highest first)
      results.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
      
      if (results.length > 0) {
        setMarketData(results);
        console.log(`✅ Successfully loaded ${results.length} crops with real data`);
      } else {
        setError('No market data available for this location');
        console.log('❌ No market data found');
      }
      
    } catch (error) {
      console.error('❌ Error fetching market data:', error);
      setError('Failed to fetch market data');
    } finally {
      setLoading(false);
    }
  };


  // Filter market data based on search and market selection
  const filteredData = marketData.filter(item => {
    const matchesSearch = item.crop.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMarket = selectedMarket === "all" || item.market.toLowerCase().includes(selectedMarket.toLowerCase());
    return matchesSearch && matchesMarket;
  });

  // Calculate market analytics
  const avgPrice = marketData.length > 0 
    ? Math.round(marketData.reduce((sum, item) => sum + item.price, 0) / marketData.length)
    : 0;
  
  const bestPerforming = marketData.length > 0 
    ? marketData.reduce((best, current) => current.change > best.change ? current : best)
    : null;
  
  const totalVolume = marketData.reduce((sum, item) => {
    const volume = parseInt(item.volume.replace(/[^\d]/g, ''));
    return sum + (isNaN(volume) ? 0 : volume);
  }, 0);
  
  const activeMarkets = new Set(marketData.map(item => item.market)).size;

  // Always render something, even if there are issues
  if (loading && marketData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading market data...</span>
      </div>
    );
  }

  console.log('Rendering Market component with data:', marketData.length);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">{titleText}</h1>
          <p className="text-muted-foreground">
            {subtitleText}

            {location ? ` ${location.address}` : ' (using default data)'}
          </p>
        </div>
        <div className="flex gap-2">

          <Button variant="outline" onClick={fetchRealMarketData} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Bell className="w-4 h-4 mr-2" />}
            Refresh Data
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{avgMarketPriceText}</p>

                <p className="text-2xl font-bold">₹{avgPrice.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />

                  {bestPerforming ? `+${bestPerforming.change.toFixed(1)}% best crop` : 'Loading...'}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>

                <p className="text-sm text-muted-foreground">{bestCropText}</p>
                <p className="text-2xl font-bold">{marketData.length > 0 ? marketData[0].crop : 'Loading...'}</p>
                <p className="text-xs text-green-600">
                  Score: {marketData.length > 0 ? marketData[0].suitabilityScore : 0}/100
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{totalVolumeText}</p>

                <p className="text-2xl font-bold">{(totalVolume / 1000).toFixed(1)}K</p>
                <p className="text-xs text-muted-foreground">{tonsTradedText}</p>
              </div>
              <Calculator className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{activeMarketsText}</p>

                <p className="text-2xl font-bold">{activeMarkets}</p>
                <p className="text-xs text-muted-foreground">{mandisReportingText}</p>
              </div>
              <Search className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">

              <Input 
                placeholder="Search for crops..." 
                className="w-full" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={selectedMarket} onValueChange={setSelectedMarket}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Select Market" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Markets</SelectItem>

                {Array.from(new Set(marketData.map(item => item.market))).map(market => (
                  <SelectItem key={market} value={market.toLowerCase()}>
                    {market}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={fetchRealMarketData} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Filter className="w-4 h-4 mr-2" />}
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="prices" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="prices">Current Prices</TabsTrigger>
          <TabsTrigger value="trends">Price Trends</TabsTrigger>
          <TabsTrigger value="calculator">Profit Calculator</TabsTrigger>
          <TabsTrigger value="forecast">Demand Forecast</TabsTrigger>
        </TabsList>

        <TabsContent value="prices" className="space-y-4">
          <Card>
            <CardHeader>

              <CardTitle>{livePricesText}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {cropsRankedText}
              </p>
            </CardHeader>
            <CardContent>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  <span>Loading market data...</span>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <p className="text-red-600 mb-2">❌ {error}</p>
                    <Button onClick={fetchRealMarketData} variant="outline" size="sm">
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : filteredData.length > 0 ? (
              <div className="space-y-4">

                  {filteredData.map((item, index) => (
                    <div key={item.crop} className={`flex items-center justify-between p-4 border rounded-lg ${
                      index === 0 ? 'border-green-500 bg-green-50' : ''
                    }`}>
                    <div className="flex items-center gap-4">

                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0 ? 'bg-green-500 text-white' : 
                            index === 1 ? 'bg-yellow-500 text-white' : 
                            index === 2 ? 'bg-orange-500 text-white' : 
                            'bg-gray-200 text-gray-700'
                          }`}>
                            {index + 1}
                          </div>
                      <div>

                            <h3 className="font-semibold flex items-center gap-2">
                              {item.crop}
                              {index === 0 && <Badge variant="secondary" className="bg-green-100 text-green-800">Best Choice</Badge>}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Volume: {item.volume} • Market: {item.market}
                            </p>
                            <p className="text-xs text-blue-600">
                              Suitability Score: {item.suitabilityScore}/100
                            </p>
                          </div>
                      </div>
                    </div>
                    <div className="text-right">

                        <p className="text-xl font-bold">₹{item.price.toLocaleString()}</p>
                        {item.minPrice && item.maxPrice && (
                          <p className="text-xs text-muted-foreground">
                            Range: ₹{item.minPrice} - ₹{item.maxPrice}
                          </p>
                        )}
                        {item.price === 0 && (
                          <p className="text-xs text-red-600">
                            No price data available for this crop in your market
                          </p>
                        )}
                      <div className="flex items-center gap-1">
                        {item.trend === "up" ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-sm ${item.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.change > 0 ? '+' : ''}{item.change}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No market data available</p>
                  <Button onClick={fetchRealMarketData} className="mt-4">
                    Load Sample Data
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>6-Month Price Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={400}>

                  <LineChart data={[]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="wheat" stroke="var(--color-wheat)" strokeWidth={2} />
                    <Line type="monotone" dataKey="rice" stroke="var(--color-rice)" strokeWidth={2} />
                    <Line type="monotone" dataKey="corn" stroke="var(--color-corn)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculator" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Profitability Calculator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Select Crop</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose crop" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wheat">Wheat</SelectItem>
                      <SelectItem value="rice">Rice</SelectItem>
                      <SelectItem value="corn">Corn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Farm Size (hectares)</label>
                  <Input type="number" placeholder="Enter size" />
                </div>
                <div>
                  <label className="text-sm font-medium">Expected Yield (quintals/hectare)</label>
                  <Input type="number" placeholder="Enter yield" />
                </div>
                <div>
                  <label className="text-sm font-medium">Total Costs (₹)</label>
                  <Input type="number" placeholder="Enter costs" />
                </div>
                <Button className="w-full">Calculate Profit</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profit Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Expected Revenue</p>
                  <p className="text-3xl font-bold text-green-600">₹1,35,000</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Costs</p>
                  <p className="text-3xl font-bold text-red-600">₹85,000</p>
                </div>
                <div className="text-center border-t pt-4">
                  <p className="text-sm text-muted-foreground">Net Profit</p>
                  <p className="text-4xl font-bold text-primary">₹50,000</p>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 mt-2">
                    58.8% Profit Margin
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Demand Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={300}>

                  <BarChart data={[]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="wheat" fill="var(--color-wheat)" />
                    <Bar dataKey="rice" fill="var(--color-rice)" />
                    <Bar dataKey="corn" fill="var(--color-corn)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-700">High Demand</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Wheat</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">↑ 15%</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Corn</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">↑ 12%</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-yellow-700">Stable Demand</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Barley</span>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">→ 2%</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Mustard</span>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">→ 1%</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-700">Declining Demand</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Rice</span>
                  <Badge variant="destructive">↓ 8%</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Cotton</span>
                  <Badge variant="destructive">↓ 5%</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};


export default Market;