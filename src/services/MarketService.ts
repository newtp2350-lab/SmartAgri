import { withCache } from "@/lib/cache";

// Agmarknet API configuration
// Real Agmarknet API endpoint
const AGMARKNET_API_BASE = 'http://127.0.0.1:5000/request';
const AGMARKNET_BASE = import.meta.env.VITE_AGMARKNET_BASE_URL || AGMARKNET_API_BASE;

export interface MarketQuery {
  commodity: string;
  state?: string;
  district?: string;
}

export interface MarketPrice {
  commodity: string;
  price: number;
  unit: string;
  market: string;
  state: string;
  district: string;
  date: string;
  minPrice?: number;
  maxPrice?: number;
  modelPrice?: number;
}

export interface MarketTrend {
  commodity: string;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  avgPrice: number;
  unit: string;
}

// State and market mappings for Indian agriculture
const STATE_MARKET_MAPPING: Record<string, string[]> = {
  'Punjab': ['Amritsar', 'Ludhiana', 'Jalandhar', 'Patiala', 'Bathinda', 'Ferozepur'],
  'Haryana': ['Karnal', 'Hisar', 'Rohtak', 'Ambala', 'Panipat', 'Sonipat'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Meerut', 'Varanasi', 'Allahabad', 'Bareilly'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Kolhapur', 'Solapur'],
  'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Belgaum', 'Mangalore', 'Gulbarga', 'Tumkur'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirapalli', 'Tirunelveli'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Anand'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer', 'Bharatpur'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar', 'Rewa'],
  'West Bengal': ['Kolkata', 'Asansol', 'Siliguri', 'Durgapur', 'Bardhaman', 'Malda', 'Kharagpur'],
  'Assam': ['Guwahati', 'Dibrugarh', 'Jorhat', 'Silchar', 'Tezpur', 'Nagaon', 'Tinsukia'],
  'Bihar': ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga', 'Purnia', 'Ara'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Balasore', 'Puri'],
  'Andhra Pradesh': ['Hyderabad', 'Vijayawada', 'Visakhapatnam', 'Tirupati', 'Guntur', 'Nellore', 'Kurnool'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Mahabubnagar', 'Nalgonda'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Palakkad', 'Kannur', 'Kollam'],
  'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Bilaspur', 'Una', 'Kangra'],
  'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Sopore', 'Kathua', 'Udhampur'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 'Kashipur', 'Rishikesh'],
  'Chhattisgarh': ['Raipur', 'Bilaspur', 'Durg', 'Bhilai', 'Korba', 'Rajnandgaon', 'Ambikapur'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Hazaribagh', 'Giridih'],
  'Manipur': ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Senapati', 'Ukhrul', 'Tamenglong'],
  'Meghalaya': ['Shillong', 'Tura', 'Jowai', 'Nongstoin', 'Williamnagar', 'Baghmara', 'Nongpoh'],
  'Mizoram': ['Aizawl', 'Lunglei', 'Saiha', 'Champhai', 'Kolasib', 'Serchhip', 'Mamit'],
  'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha', 'Zunheboto', 'Phek'],
  'Sikkim': ['Gangtok', 'Namchi', 'Mangan', 'Gyalshing', 'Singtam', 'Rangpo', 'Jorethang'],
  'Tripura': ['Agartala', 'Udaipur', 'Dharmanagar', 'Kailashahar', 'Belonia', 'Khowai', 'Ambassa'],
  'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat', 'Tezpur', 'Ziro', 'Along', 'Bomdila'],
  'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Bicholim', 'Valpoi'],
  'Delhi': ['Delhi', 'New Delhi', 'Central Delhi', 'East Delhi', 'North Delhi', 'South Delhi', 'West Delhi']
};

// Crop name mappings for Agmarknet API
const CROP_MAPPING: Record<string, string> = {
  'Wheat': 'Wheat',
  'Rice': 'Rice',
  'Maize': 'Maize',
  'Sugarcane': 'Sugarcane',
  'Cotton': 'Cotton',
  'Mustard': 'Mustard',
  'Groundnut': 'Groundnut',
  'Potato': 'Potato',
  'Tomato': 'Tomato',
  'Onion': 'Onion',
  'Chili': 'Chili',
  'Soybean': 'Soybean',
  'Sunflower': 'Sunflower',
  'Sesame': 'Sesame',
  'Sorghum': 'Sorghum',
  'Pearl Millet': 'Pearl Millet',
  'Finger Millet': 'Finger Millet',
  'Chickpea': 'Chickpea',
  'Pigeon Pea': 'Pigeon Pea',
  'Lentil': 'Lentil',
  'Barley': 'Barley'
};

// Helper function to get state and market from location
export const getStateAndMarket = (location: string): { state: string; market: string } => {
  const locationLower = location.toLowerCase();
  
  // Handle common location formats
  const locationParts = locationLower.split(',').map(part => part.trim());
  
  // PRIORITY 1: Special handling for common city names (check this first!)
  const cityStateMap: Record<string, { state: string; market: string }> = {
    'delhi': { state: 'Delhi', market: 'Delhi' },
    'new delhi': { state: 'Delhi', market: 'Delhi' },
    'mumbai': { state: 'Maharashtra', market: 'Mumbai' },
    'bangalore': { state: 'Karnataka', market: 'Bangalore' },
    'chennai': { state: 'Tamil Nadu', market: 'Chennai' },
    'kolkata': { state: 'West Bengal', market: 'Kolkata' },
    'hyderabad': { state: 'Telangana', market: 'Hyderabad' },
    'pune': { state: 'Maharashtra', market: 'Pune' },
    'ahmedabad': { state: 'Gujarat', market: 'Ahmedabad' },
    'jaipur': { state: 'Rajasthan', market: 'Jaipur' },
    'lucknow': { state: 'Uttar Pradesh', market: 'Lucknow' },
    'kanpur': { state: 'Uttar Pradesh', market: 'Kanpur' },
    'bhopal': { state: 'Madhya Pradesh', market: 'Bhopal' },
    'indore': { state: 'Madhya Pradesh', market: 'Indore' },
    'guwahati': { state: 'Assam', market: 'Guwahati' },
    'amritsar': { state: 'Punjab', market: 'Amritsar' },
    'ludhiana': { state: 'Punjab', market: 'Ludhiana' },
    'karnal': { state: 'Haryana', market: 'Karnal' },
    'hisar': { state: 'Haryana', market: 'Hisar' }
  };
  
  // Check for exact city matches first
  for (const [city, mapping] of Object.entries(cityStateMap)) {
    for (const part of locationParts) {
      if (part.includes(city) || city.includes(part)) {
        return mapping;
      }
    }
  }
  
  // PRIORITY 2: Try to find state first (enhanced state detection)
  const stateKeywords: Record<string, string> = {
    'maharashtra': 'maharashtra',
    'punjab': 'punjab', 
    'karnataka': 'karnataka',
    'tamil nadu': 'tamil nadu',
    'west bengal': 'west bengal',
    'telangana': 'telangana',
    'gujarat': 'gujarat',
    'rajasthan': 'rajasthan',
    'uttar pradesh': 'uttar pradesh',
    'madhya pradesh': 'madhya pradesh',
    'assam': 'assam',
    'haryana': 'haryana',
    'bihar': 'bihar',
    'odisha': 'odisha',
    'andhra pradesh': 'andhra pradesh',
    'kerala': 'kerala',
    'himachal pradesh': 'himachal pradesh',
    'jammu and kashmir': 'jammu and kashmir',
    'uttarakhand': 'uttarakhand',
    'chhattisgarh': 'chhattisgarh',
    'jharkhand': 'jharkhand',
    'manipur': 'manipur',
    'meghalaya': 'meghalaya',
    'mizoram': 'mizoram',
    'nagaland': 'nagaland',
    'sikkim': 'sikkim',
    'tripura': 'tripura',
    'arunachal pradesh': 'arunachal pradesh',
    'goa': 'goa'
  };

  // Check for state keywords in location
  for (const [stateName, stateKey] of Object.entries(stateKeywords)) {
    for (const part of locationParts) {
      if (part.includes(stateKey) || stateKey.includes(part)) {
        // Find the state in STATE_MARKET_MAPPING
        for (const [state, markets] of Object.entries(STATE_MARKET_MAPPING)) {
          if (state.toLowerCase() === stateName) {
            // Find matching market in the same location parts
            for (const market of markets) {
              const marketLower = market.toLowerCase();
              for (const part of locationParts) {
                if (part.includes(marketLower) || marketLower.includes(part)) {
                  return { state, market };
                }
              }
            }
            
            // If no specific market found, use first market in state
            return { state, market: markets[0] };
          }
        }
      }
    }
  }

  // PRIORITY 3: Try to find state using original method
  for (const [state, markets] of Object.entries(STATE_MARKET_MAPPING)) {
    const stateLower = state.toLowerCase();
    
    // Check if any part of the location contains the state name
    for (const part of locationParts) {
      if (part.includes(stateLower) || stateLower.includes(part)) {
        // Find matching market in the same location parts
        for (const market of markets) {
          const marketLower = market.toLowerCase();
          for (const part of locationParts) {
            if (part.includes(marketLower) || marketLower.includes(part)) {
              return { state, market };
            }
          }
        }
        
        // If no specific market found, use first market in state
        return { state, market: markets[0] };
      }
    }
  }
  
  // PRIORITY 4: Try to find by city names directly (more aggressive matching)
  for (const [state, markets] of Object.entries(STATE_MARKET_MAPPING)) {
    for (const market of markets) {
      const marketLower = market.toLowerCase();
      for (const part of locationParts) {
        if (part.includes(marketLower) || marketLower.includes(part)) {
          return { state, market };
        }
      }
    }
  }
  
  // Default fallback
  return { state: 'Punjab', market: 'Amritsar' };
};

async function http<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Market API error ${res.status}`);
  return res.json() as Promise<T>;
}

// Fetch real market data from Agmarknet API
// Generate realistic location-based market data
function generateLocationBasedData(commodity: string, state: string, market: string): MarketPrice[] {
  console.log(`🔄 Generating location-based data for ${commodity} in ${state}, ${market}`);
  
  // Base prices for different crops (in ₹/quintal)
  const basePrices: Record<string, number> = {
    'wheat': 2500,
    'rice': 3200,
    'cotton': 6000,
    'maize': 1800,
    'sugarcane': 320,
    'mustard': 4500,
    'groundnut': 5500,
    'soybean': 3800,
    'turmeric': 8000,
    'chilli': 12000
  };
  
  // State-specific price variations (multipliers)
  const stateMultipliers: Record<string, number> = {
    'Punjab': 1.1,      // Higher prices due to good infrastructure
    'Haryana': 1.05,
    'Uttar Pradesh': 0.95,
    'Maharashtra': 1.0,
    'Gujarat': 0.98,
    'Rajasthan': 0.92,
    'Madhya Pradesh': 0.88,
    'Karnataka': 1.02,
    'Tamil Nadu': 1.08,
    'Andhra Pradesh': 0.95,
    'West Bengal': 0.93,
    'Bihar': 0.85,
    'Odisha': 0.87,
    'Assam': 0.9,
    'Kerala': 1.15,
    'Himachal Pradesh': 1.2,
    'Jammu and Kashmir': 1.25,
    'Uttarakhand': 1.1,
    'Meghalaya': 1.0,
    'Sikkim': 1.1,
    'Delhi': 1.2
  };
  
  const commodityKey = commodity.toLowerCase();
  const basePrice = basePrices[commodityKey] || 2000;
  const stateMultiplier = stateMultipliers[state] || 1.0;
  
  // Add some randomness (±10%)
  const randomFactor = 0.9 + Math.random() * 0.2;
  const finalPrice = Math.round(basePrice * stateMultiplier * randomFactor);
  
  // Generate min/max prices
  const minPrice = Math.round(finalPrice * 0.85);
  const maxPrice = Math.round(finalPrice * 1.15);
  
  const result: MarketPrice = {
    commodity: commodity,
    price: finalPrice,
    unit: 'Quintal',
    market: market,
    state: state,
    district: market,
    date: new Date().toISOString().split('T')[0],
    minPrice: minPrice,
    maxPrice: maxPrice,
    modelPrice: finalPrice
  };
  
  console.log(`✅ Generated ${commodity} data: ₹${finalPrice} (${state} multiplier: ${stateMultiplier})`);
  return [result];
}

async function fetchAgmarknetData(commodity: string, state: string, market: string): Promise<MarketPrice[]> {
  try {
    const url = `${AGMARKNET_API_BASE}?commodity=${encodeURIComponent(commodity)}&state=${encodeURIComponent(state)}&market=${encodeURIComponent(market)}`;
    
    console.log(`🔄 Fetching from Agmarknet API: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`📊 Raw API response for ${commodity}:`, data);
    
    // Parse the API response and convert to our MarketPrice format
    if (Array.isArray(data)) {
      const results = data.map((item: any) => ({
        commodity: item.commodity || commodity,
        state: item.state || state,
        market: item.market || market,
        price: parseFloat(item.price) || 0,
        minPrice: parseFloat(item.min_price) || 0,
        maxPrice: parseFloat(item.max_price) || 0,
        unit: item.unit || 'Quintal',
        district: item.district || market,
        date: item.date || new Date().toISOString().split('T')[0],
        modelPrice: parseFloat(item.model_price) || parseFloat(item.price) || 0
      }));
      
      console.log(`✅ Parsed ${results.length} entries for ${commodity}`);
      return results;
    } else if (data && typeof data === 'object') {
      // Single item response
      const result = [{
        commodity: data.commodity || commodity,
        state: data.state || state,
        market: data.market || market,
        price: parseFloat(data.price) || 0,
        minPrice: parseFloat(data.min_price) || 0,
        maxPrice: parseFloat(data.max_price) || 0,
        unit: data.unit || 'Quintal',
        district: data.district || market,
        date: data.date || new Date().toISOString().split('T')[0],
        modelPrice: parseFloat(data.model_price) || parseFloat(data.price) || 0
      }];
      
      console.log(`✅ Parsed single entry for ${commodity}`);
      return result;
    }
    
    console.log(`⚠️ No valid data structure found for ${commodity}`);
    return [];
  } catch (error) {
    console.error(`❌ Error fetching data for ${commodity} in ${state}, ${market}:`, error);
    
    // Fallback to mock data if API fails
    console.log(`🔄 Falling back to mock data for ${commodity}`);
    return generateLocationBasedData(commodity, state, market);
  }
}

// Generate location-aware mock market data
// Generate basic fallback mock data (only used when API completely fails)
const generateFallbackMockData = (state: string, market: string): Record<string, MarketPrice[]> => {
  const basePrices: Record<string, number> = {
    'wheat': 2700,
    'rice': 3400,
    'maize': 1900,
    'sugarcane': 360,
    'cotton': 6800,
    'mustard': 4800,
    'groundnut': 6300,
    'sorghum': 2300,
    'barley': 2500,
    'potato': 1800
  };

  const mockData: Record<string, MarketPrice[]> = {};
  
  Object.entries(basePrices).forEach(([crop, basePrice]) => {
    // Add some variation based on location
    const variation = Math.random() * 0.2 - 0.1; // ±10% variation
    const price = Math.round(basePrice * (1 + variation));
    const minPrice = Math.round(price * 0.9);
    const maxPrice = Math.round(price * 1.1);
    
    mockData[crop] = [{
      commodity: crop.charAt(0).toUpperCase() + crop.slice(1),
      price: price,
      unit: 'Quintal',
      market: market,
      state: state,
      district: market,
      date: new Date().toISOString().split('T')[0],
      minPrice: minPrice,
      maxPrice: maxPrice,
      modelPrice: price
    }];
  });
  
  return mockData;
};

const MOCK_TRENDS: Record<string, MarketTrend> = {
  'wheat': { commodity: 'Wheat', trend: 'up', changePercent: 5.2, avgPrice: 2415, unit: 'Quintal' },
  'rice': { commodity: 'Rice', trend: 'stable', changePercent: 0.8, avgPrice: 3150, unit: 'Quintal' },
  'sugarcane': { commodity: 'Sugarcane', trend: 'down', changePercent: -2.1, avgPrice: 320, unit: 'Quintal' },
  'cotton': { commodity: 'Cotton', trend: 'up', changePercent: 8.5, avgPrice: 6500, unit: 'Quintal' },
  'mustard': { commodity: 'Mustard', trend: 'up', changePercent: 12.3, avgPrice: 5200, unit: 'Quintal' },
  'groundnut': { commodity: 'Groundnut', trend: 'stable', changePercent: 1.2, avgPrice: 6800, unit: 'Quintal' },
  'maize': { commodity: 'Maize', trend: 'down', changePercent: -3.5, avgPrice: 1850, unit: 'Quintal' },
  'sorghum': { commodity: 'Sorghum', trend: 'up', changePercent: 4.1, avgPrice: 2200, unit: 'Quintal' }
};

export const MarketService = {
  async getPrices(query: MarketQuery): Promise<MarketPrice[]> {
    const commodity = query.commodity.toLowerCase();
    
    console.log(`🔄 Fetching prices for ${commodity} in ${query.state}, ${query.district}`);
    
    try {
      // Try Agmarknet API with simple timeout
      const result = await fetchAgmarknetData(query.commodity, query.state || '', query.district || '');
      
      if (result && result.length > 0) {
        console.log(`✅ Got ${result.length} price entries for ${commodity}`);
        return result;
      } else {
        console.log(`⚠️ No data returned for ${commodity}`);
        return [];
      }
    } catch (error) {
      console.warn(`❌ Failed to fetch ${commodity}:`, error);
      return [];
    }
  },

  async tryAlternativeApiCalls(query: MarketQuery): Promise<MarketPrice[]> {
    const commodity = query.commodity.toLowerCase();
    
    // Try different API endpoint variations
    const apiVariations = [
      // Try with different commodity names
      () => fetchAgmarknetData(query.commodity.toUpperCase(), query.state || '', query.district || ''),
      () => fetchAgmarknetData(query.commodity.toLowerCase(), query.state || '', query.district || ''),
      // Try with state variations
      () => fetchAgmarknetData(query.commodity, query.state?.toLowerCase() || '', query.district || ''),
      () => fetchAgmarknetData(query.commodity, query.state?.toUpperCase() || '', query.district || ''),
      // Try without district
      () => fetchAgmarknetData(query.commodity, query.state || '', ''),
      // Try with just commodity
      () => fetchAgmarknetData(query.commodity, '', '')
    ];

    for (const apiCall of apiVariations) {
      try {
        const result = await apiCall();
        if (result && result.length > 0) {
          console.log('Alternative API call succeeded');
          return result;
        }
      } catch (error) {
        console.warn('Alternative API call failed:', error);
        continue;
      }
    }
    
    throw new Error('All alternative API calls failed');
  },

  async getTrends(query: MarketQuery): Promise<MarketTrend | null> {
    const commodity = query.commodity.toLowerCase();
    
    try {
      const params = new URLSearchParams(query as Record<string, string>);
      const url = `${AGMARKNET_BASE}/trends?${params.toString()}`;
      return await withCache(`market:trends:${params.toString()}`,
        () => http<MarketTrend>(url),
        { ttlMs: 1000 * 60 * 60 }
      );
    } catch (error) {
      console.warn('Market trends API failed, using mock data:', error);
      return MOCK_TRENDS[commodity] || null;
    }
  },

  async getMultipleCropPrices(crops: string[]): Promise<Record<string, MarketPrice[]>> {
    const results: Record<string, MarketPrice[]> = {};
    
    await Promise.allSettled(
      crops.map(async (crop) => {
        try {
          const prices = await this.getPrices({ commodity: crop });
          results[crop] = prices;
        } catch (error) {
          console.warn(`Failed to fetch prices for ${crop}:`, error);
          results[crop] = [];
        }
      })
    );
    
    return results;
  },

  // Get market prices for AI-suggested crops based on location
  async getMarketPricesForLocation(suggestedCrops: string[], location: string): Promise<Record<string, MarketPrice[]>> {
    const { state, market } = getStateAndMarket(location);
    const results: Record<string, MarketPrice[]> = {};
    
    console.log(`🔄 Fetching market data for ${suggestedCrops.length} crops in ${state}, ${market}`);
    
    // Process crops in smaller batches with faster timeouts
    const batchSize = 2;
    const batches = [];
    for (let i = 0; i < suggestedCrops.length; i += batchSize) {
      batches.push(suggestedCrops.slice(i, i + batchSize));
    }
    
    for (const batch of batches) {
      await Promise.allSettled(
        batch.map(async (crop) => {
          try {
            const prices = await this.getPrices({ 
              commodity: crop, 
              state: state, 
              district: market 
            });
            results[crop] = prices;
            console.log(`✅ Fetched prices for ${crop}: ${prices.length} entries`);
          } catch (error) {
            console.warn(`❌ Failed to fetch prices for ${crop} in ${state}, ${market}:`, error);
            results[crop] = [];
          }
        })
      );
      
      // Shorter delay between batches
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    console.log(`📊 Market data fetch complete: ${Object.keys(results).length} crops processed`);
    return results;
  }
};

export default MarketService;





