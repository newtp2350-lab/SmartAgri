import { withCache } from "@/lib/cache";

const OPENCAGE_API_KEY = import.meta.env.VITE_OPENCAGE_API_KEY as string;
const OPENCAGE_BASE_URL = "https://api.opencagedata.com/geocode/v1/json";

export interface LocationSuggestion {
  formatted: string;
  lat: number;
  lng: number;
  place_id: string;
  components: {
    village?: string;
    town?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

export interface GeocodingResult {
  results: Array<{
    formatted: string;
    geometry: {
      lat: number;
      lng: number;
    };
    place_id: string;
    components: {
      village?: string;
      town?: string;
      city?: string;
      state?: string;
      country?: string;
    };
  }>;
}

async function callGeocodingAPI(query: string): Promise<LocationSuggestion[]> {
  if (!OPENCAGE_API_KEY) {
    throw new Error("OpenCage API key not configured");
  }

  const params = new URLSearchParams({
    q: query,
    key: OPENCAGE_API_KEY,
    limit: '5',
    countrycode: 'in', // Focus on India
    no_annotations: '1',
  });

  const response = await fetch(`${OPENCAGE_BASE_URL}?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Geocoding API error: ${response.status}`);
  }

  const data: GeocodingResult = await response.json();
  
  return data.results.map(result => ({
    formatted: result.formatted,
    lat: result.geometry.lat,
    lng: result.geometry.lng,
    place_id: result.place_id,
    components: result.components,
  }));
}

export const GeocodingService = {
  async getSuggestions(query: string): Promise<LocationSuggestion[]> {
    if (query.length < 3) return [];
    
    const cacheKey = `geocoding:suggestions:${btoa(query)}`;
    return withCache(cacheKey, () => callGeocodingAPI(query), { 
      ttlMs: 1000 * 60 * 60 // 1 hour cache
    });
  },

  async reverseGeocode(lat: number, lng: number): Promise<string> {
    const cacheKey = `geocoding:reverse:${lat}:${lng}`;
    return withCache(cacheKey, async () => {
      const params = new URLSearchParams({
        q: `${lat},${lng}`,
        key: OPENCAGE_API_KEY,
        limit: '1',
        no_annotations: '1',
      });

      const response = await fetch(`${OPENCAGE_BASE_URL}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Reverse geocoding API error: ${response.status}`);
      }

      const data: GeocodingResult = await response.json();
      return data.results[0]?.formatted || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }, { 
      ttlMs: 1000 * 60 * 60 // 1 hour cache
    });
  },
};

export default GeocodingService;

