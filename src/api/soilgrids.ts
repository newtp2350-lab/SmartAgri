/**
 * SoilGrids API Integration
 * Fetches soil data from the ISRIC SoilGrids REST API
 * Documentation: https://rest.isric.org/soilgrids/v2.0/docs
 */

export interface SoilData {
  ph: number;
  organicCarbon: number;
  sandPercent: number;
  clayPercent: number;
  siltPercent: number;
}

export interface SoilGridsResponse {
  properties: {
    phh2o: {
      M: number; // Mean value
      Q0: number; // 5th percentile
      Q5: number; // 5th percentile
      Q50: number; // Median
      Q95: number; // 95th percentile
      Q100: number; // 95th percentile
    };
    ocd: {
      M: number; // Mean value
      Q0: number;
      Q5: number;
      Q50: number;
      Q95: number;
      Q100: number;
    };
    sand: {
      M: number; // Mean value
      Q0: number;
      Q5: number;
      Q50: number;
      Q95: number;
      Q100: number;
    };
    clay: {
      M: number; // Mean value
      Q0: number;
      Q5: number;
      Q50: number;
      Q95: number;
      Q100: number;
    };
    silt: {
      M: number; // Mean value
      Q0: number;
      Q5: number;
      Q50: number;
      Q95: number;
      Q100: number;
    };
  };
}

/**
 * Fetches soil data from SoilGrids API for a given location
 * @param lat - Latitude coordinate
 * @param lon - Longitude coordinate
 * @returns Promise<SoilData> - Simplified soil data object
 */
export async function fetchSoilData(lat: number, lon: number): Promise<SoilData> {
  try {
    console.log(`Fetching soil data for coordinates: lat=${lat}, lon=${lon}`);
    
    // Validate coordinates
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      throw new Error('Invalid coordinates provided');
    }

    const baseUrl = 'https://rest.isric.org/soilgrids/v2.0/properties/query';

    // Helper to build URL with multiple property params (more reliable than comma-separated)
    const buildUrl = (properties: string[]) => {
      const url = new URL(baseUrl);
      // Ensure coordinates are properly formatted with sufficient precision
      url.searchParams.set('lon', lon.toFixed(6));
      url.searchParams.set('lat', lat.toFixed(6));
      url.searchParams.set('depth', '0-5cm');
      url.searchParams.set('value', 'mean');
      // Add timestamp to prevent caching
      url.searchParams.set('_t', Date.now().toString());
      properties.forEach((p) => url.searchParams.append('property', p));
      return url.toString();
    };

    // Generic JSON fetch with error surfacing
    const http = async (url: string) => {
      console.log('Fetching soil data from:', url);
      const res = await fetch(url, { 
        headers: { 
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        } 
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.error(`SoilGrids API error: ${res.status} - ${res.statusText}`, text);
        throw new Error(`SoilGrids API error: ${res.status} - ${res.statusText} ${text ? `| ${text}` : ''}`);
      }
      const data = await res.json();
      console.log('SoilGrids API response:', data);
      return data;
    };

    // First attempt: query all properties together using repeated property params
    let data: SoilGridsResponse | null = null;
    try {
      data = await http(buildUrl(['phh2o', 'ocd', 'sand', 'clay', 'silt']));
    } catch (err) {
      console.warn('Combined properties query failed, falling back to per-property requests:', err);
    }

    // Fallback: fetch each property separately and merge
    if (!data) {
      const [phData, ocData, sandData, clayData, siltData] = await Promise.all([
        http(buildUrl(['phh2o'])).catch((e: unknown) => {
          console.error('phh2o request failed', e);
          return null;
        }),
        http(buildUrl(['ocd'])).catch((e: unknown) => {
          console.error('ocd request failed', e);
          return null;
        }),
        http(buildUrl(['sand'])).catch((e: unknown) => {
          console.error('sand request failed', e);
          return null;
        }),
        http(buildUrl(['clay'])).catch((e: unknown) => {
          console.error('clay request failed', e);
          return null;
        }),
        http(buildUrl(['silt'])).catch((e: unknown) => {
          console.error('silt request failed', e);
          return null;
        }),
      ]);

      data = {
        properties: {
          phh2o: phData?.properties?.phh2o ?? { M: NaN, Q0: NaN, Q5: NaN, Q50: NaN, Q95: NaN, Q100: NaN },
          ocd: ocData?.properties?.ocd ?? { M: NaN, Q0: NaN, Q5: NaN, Q50: NaN, Q95: NaN, Q100: NaN },
          sand: sandData?.properties?.sand ?? { M: NaN, Q0: NaN, Q5: NaN, Q50: NaN, Q95: NaN, Q100: NaN },
          clay: clayData?.properties?.clay ?? { M: NaN, Q0: NaN, Q5: NaN, Q50: NaN, Q95: NaN, Q100: NaN },
          silt: siltData?.properties?.silt ?? { M: NaN, Q0: NaN, Q5: NaN, Q50: NaN, Q95: NaN, Q100: NaN },
        },
      } as SoilGridsResponse;
    }

    console.log('Raw SoilGrids response:', data);

    // Check if we have valid data
    if (!data || !data.properties) {
      console.error('Invalid SoilGrids response structure:', data);
      throw new Error('Invalid response from SoilGrids API');
    }

    // Extract and format the soil data
    const safeNumber = (n: unknown) => (typeof n === 'number' && isFinite(n) ? n : NaN);

    // Flexible extractor to handle different SoilGrids shapes
    const extractMean = (root: any, key: string): number | undefined => {
      if (!root) return undefined;
      const props = root.properties ?? root;
      // Direct: properties[key].M or properties[key]['0-5cm'].M
      const direct = props?.[key];
      if (direct) {
        if (typeof direct.M === 'number') return direct.M;
        if (direct['0-5cm'] && typeof direct['0-5cm'].M === 'number') return direct['0-5cm'].M;
        if (direct.values && typeof direct.values.M === 'number') return direct.values.M;
      }
      // Layered format: properties.layers: [{ name, depths: [{ values: { M } }] }]
      const layers = props?.layers;
      if (Array.isArray(layers)) {
        const layer = layers.find((l: any) => l?.name === key);
        if (layer) {
          if (layer.values && typeof layer.values.M === 'number') return layer.values.M;
          const d0 = Array.isArray(layer.depths) ? layer.depths[0] : undefined;
          if (d0?.values && typeof d0.values.M === 'number') return d0.values.M;
        }
      }
      return undefined;
    };

    const phM = extractMean(data, 'phh2o');
    const ocM = extractMean(data, 'ocd');
    const sandM = extractMean(data, 'sand');
    const clayM = extractMean(data, 'clay');
    const siltM = extractMean(data, 'silt');

    const soilData: SoilData = {
      ph: Math.round(safeNumber(phM) * 10) / 10,
      organicCarbon: Math.round(safeNumber(ocM) * 100) / 100,
      sandPercent: Math.round(safeNumber(sandM) * 10) / 10,
      clayPercent: Math.round(safeNumber(clayM) * 10) / 10,
      siltPercent: Math.round(safeNumber(siltM) * 10) / 10,
    };

    // Check if we got any valid data
    const hasValidData = Object.values(soilData).some(value => !isNaN(value));
    if (!hasValidData) {
      console.warn('No valid soil data received from SoilGrids API');
      throw new Error('No valid soil data available for this location');
    }

    console.log('Processed soil data:', soilData);
    return soilData;

  } catch (error) {
    console.error('Error fetching soil data:', error);
    
    // For development/testing purposes, return mock data if API fails
    if (process.env.NODE_ENV === 'development') {
      console.warn('Returning mock soil data for development');
      // Generate location-specific mock data based on coordinates
      const mockPh = 6.5 + (lat * 0.01) + (lon * 0.005);
      const mockOC = 1.0 + (Math.abs(lat) * 0.02) + (Math.abs(lon) * 0.01);
      const mockSand = 40 + (lat * 0.5) + (lon * 0.3);
      const mockClay = 25 + (Math.abs(lat) * 0.3) + (Math.abs(lon) * 0.2);
      const mockSilt = 100 - mockSand - mockClay;
      
      return {
        ph: Math.round(mockPh * 10) / 10,
        organicCarbon: Math.round(mockOC * 100) / 100,
        sandPercent: Math.round(mockSand * 10) / 10,
        clayPercent: Math.round(mockClay * 10) / 10,
        siltPercent: Math.round(mockSilt * 10) / 10,
      };
    }
    
    throw error;
  }
}

/**
 * Helper function to interpret soil pH levels
 * @param ph - Soil pH value
 * @returns string - pH interpretation
 */
export function interpretSoilPH(ph: number | undefined): string {
  if (typeof ph !== 'number' || !isFinite(ph)) return 'Unknown';
  if (ph < 4.5) return 'Very Acidic';
  if (ph < 5.5) return 'Acidic';
  if (ph < 6.5) return 'Slightly Acidic';
  if (ph < 7.5) return 'Neutral';
  if (ph < 8.5) return 'Slightly Alkaline';
  return 'Alkaline';
}

/**
 * Helper function to interpret organic carbon levels
 * @param oc - Organic carbon percentage
 * @returns string - Organic carbon interpretation
 */
export function interpretOrganicCarbon(oc: number | undefined): string {
  if (typeof oc !== 'number' || !isFinite(oc)) return 'Unknown';
  if (oc < 1) return 'Low';
  if (oc < 2) return 'Moderate';
  if (oc < 4) return 'Good';
  return 'High';
}

/**
 * Helper function to interpret soil texture based on sand, clay, and silt percentages
 * @param sand - Sand percentage
 * @param clay - Clay percentage
 * @param silt - Silt percentage
 * @returns string - Soil texture classification
 */
export function interpretSoilTexture(sand: number | undefined, clay: number | undefined, silt: number | undefined): string {
  if (![sand, clay, silt].every((n) => typeof n === 'number' && isFinite(n as number))) {
    return 'Unknown';
  }
  // Normalize percentages to ensure they add up to 100
  const total = (sand as number) + (clay as number) + (silt as number);
  const normalizedSand = (sand / total) * 100;
  const normalizedClay = (clay / total) * 100;
  const normalizedSilt = (silt / total) * 100;

  // USDA Soil Texture Triangle classification
  if (normalizedClay >= 40) {
    if (normalizedSand <= 45) return 'Clay';
    if (normalizedSand <= 65) return 'Sandy Clay';
    return 'Sandy Clay Loam';
  }
  
  if (normalizedClay >= 27) {
    if (normalizedSand <= 20) return 'Silty Clay';
    if (normalizedSand <= 45) return 'Clay Loam';
    if (normalizedSand <= 65) return 'Sandy Clay Loam';
    return 'Sandy Clay Loam';
  }
  
  if (normalizedClay >= 20) {
    if (normalizedSand <= 20) return 'Silty Clay Loam';
    if (normalizedSand <= 45) return 'Clay Loam';
    if (normalizedSand <= 65) return 'Sandy Clay Loam';
    return 'Sandy Clay Loam';
  }
  
  if (normalizedClay >= 7) {
    if (normalizedSand <= 20) return 'Silt Loam';
    if (normalizedSand <= 45) return 'Loam';
    if (normalizedSand <= 65) return 'Sandy Loam';
    return 'Sandy Loam';
  }
  
  if (normalizedSand >= 85) return 'Sand';
  if (normalizedSand >= 70) return 'Loamy Sand';
  return 'Sandy Loam';
}
