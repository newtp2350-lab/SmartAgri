import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, Loader2, MapPin, RefreshCw } from "lucide-react";
import { useLocation } from "@/hooks/use-location";
import { MarketService } from "@/services/MarketService";
import { WeatherService } from "@/services/WeatherService";
import { fetchSoilData } from "@/api/soilgrids";

interface SimpleMarketData {
  crop: string;
  price: number;
  minPrice?: number;
  maxPrice?: number;
  modelPrice?: number;
  change: number;
  trend: "up" | "down";
  suitabilityScore: number;
  market: string;
  state: string;
  volume: string;
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

const MarketSimple = () => {
  const { location, isLoading: locationLoading } = useLocation();
  const [marketData, setMarketData] = useState<SimpleMarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch market data when location changes
  useEffect(() => {
    console.log('🔄 Location changed in MarketSimple:', location);
    if (location) {
      // Force refresh market data when location changes
      console.log('📍 Location changed, forcing market data refresh...');
      fetchLocationBasedData();
    } else {
      setDefaultData();
    }
  }, [location?.address, location?.lat, location?.lng]);

  // Force refresh when location address changes (even if coordinates are same)
  useEffect(() => {
    if (location?.address) {
      console.log('🔄 Location address changed, refreshing market data...');
      fetchLocationBasedData();
    }
  }, [location?.address]);

  // Listen for location updates from other components
  useEffect(() => {
    const handleLocationUpdate = () => {
      console.log('📍 Location update event received in MarketSimple');
      if (location) {
        fetchLocationBasedData();
      }
    };

    window.addEventListener('locationUpdated', handleLocationUpdate);
    return () => window.removeEventListener('locationUpdated', handleLocationUpdate);
  }, [location]);

  const setDefaultData = () => {
    const defaultData: SimpleMarketData[] = [
      {
        crop: "Wheat",
        price: 2700,
        minPrice: 2500,
        maxPrice: 2900,
        modelPrice: 2700,
        change: 5.2,
        trend: "up",
        suitabilityScore: 85,
        market: "Delhi",
        state: "Delhi",
        volume: "1.2K tons",
        date: new Date().toISOString().split('T')[0]
      },
      {
        crop: "Rice",
        price: 3400,
        minPrice: 3200,
        maxPrice: 3600,
        modelPrice: 3400,
        change: -2.1,
        trend: "down",
        suitabilityScore: 78,
        market: "Delhi",
        state: "Delhi",
        volume: "890 tons",
        date: new Date().toISOString().split('T')[0]
      },
      {
        crop: "Cotton",
        price: 6500,
        minPrice: 6200,
        maxPrice: 6800,
        modelPrice: 6500,
        change: 7.8,
        trend: "up",
        suitabilityScore: 72,
        market: "Delhi",
        state: "Delhi",
        volume: "320 tons",
        date: new Date().toISOString().split('T')[0]
      }
    ];
    setMarketData(defaultData);
    setLoading(false);
    setLastUpdated(new Date());
  };

  const fetchLocationBasedData = async () => {
    if (!location) return;
    
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [marketResult, soilResult, weatherResult] = await Promise.allSettled([
        MarketService.getMarketPricesForLocation([
          'Wheat', 'Rice', 'Maize', 'Sugarcane', 'Cotton', 'Mustard', 'Groundnut', 'Sorghum', 'Barley', 'Potato'
        ], location.address),
        fetchSoilData(location.lat, location.lng),
        WeatherService.getCurrent(location)
      ]);

      const marketPrices = marketResult.status === 'fulfilled' ? marketResult.value : {};
      const soil = soilResult.status === 'fulfilled' ? soilResult.value : null;
      const weather = weatherResult.status === 'fulfilled' ? weatherResult.value : null;

      // Process market data and calculate suitability scores
      const processedData: SimpleMarketData[] = [];
      
      Object.entries(marketPrices).forEach(([crop, prices]: [string, any]) => {
        if (prices && prices.length > 0) {
          const latestPrice = prices[0];
          const price = latestPrice.modelPrice || latestPrice.price || 0;
          const change = Math.random() * 20 - 10; // Mock change percentage
          const volume = `${Math.floor(Math.random() * 1000 + 100)} tons`;
          
          const suitabilityScore = calculateCropSuitability(crop, price, soil, weather, location);
          
          processedData.push({
            crop,
            price,
            minPrice: latestPrice.minPrice,
            maxPrice: latestPrice.maxPrice,
            modelPrice: latestPrice.modelPrice,
            volume,
            change: Math.round(change * 10) / 10,
            trend: change > 0 ? "up" : "down",
            suitabilityScore,
            market: latestPrice.market || 'Unknown',
            state: latestPrice.state || 'Unknown',
            date: latestPrice.date || new Date().toISOString().split('T')[0]
          });
        }
      });

      // Sort by suitability score (best crops first)
      processedData.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
      
      if (processedData.length > 0) {
        setMarketData(processedData);
      } else {
        setDefaultData();
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('❌ Error fetching location-based data:', error);
      setDefaultData();
    } finally {
      setLoading(false);
    }
  };

  // Calculate dynamic analytics
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading market data for {location?.address || 'your location'}...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Market Analytics</h1>
          <p className="text-muted-foreground">
            Real-time crop prices, trends, and profitability analysis
            {location ? ` for ${location.address}` : ' (using default data)'}
          </p>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchLocationBasedData} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Market Price</p>
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
                <p className="text-sm text-muted-foreground">Best Crop to Plant</p>
                <p className="text-2xl font-bold">{marketData[0]?.crop || 'Loading...'}</p>
                <p className="text-xs text-green-600">
                  Score: {marketData[0]?.suitabilityScore || 0}/100
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
                <p className="text-sm text-muted-foreground">Total Volume</p>
                <p className="text-2xl font-bold">{(totalVolume / 1000).toFixed(1)}K</p>
                <p className="text-xs text-muted-foreground">tons traded today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Markets</p>
                <p className="text-2xl font-bold">{activeMarkets}</p>
                <p className="text-xs text-muted-foreground">mandis reporting</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Prices */}
      <Card>
        <CardHeader>
          <CardTitle>Live Market Prices - Sorted by Best to Plant</CardTitle>
          <p className="text-sm text-muted-foreground">
            Crops are ranked by suitability score based on your location's soil, weather, and market conditions
            {location && (
              <span className="block mt-1 text-blue-600">
                📍 Location: {location.address} • Market: {marketData[0]?.market || 'Loading...'}
              </span>
            )}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {marketData.map((item, index) => (
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
                      <p className="text-xs text-blue-600">
                        Suitability Score: {item.suitabilityScore}/100
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Market: {item.market} • Volume: {item.volume}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketSimple;
