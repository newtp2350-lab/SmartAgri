import { withCache } from "@/lib/cache";

const OWM_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY as string;
const OWM_BASE = "https://api.openweathermap.org/data/2.5";



export interface Coordinates { lat: number; lng: number }

export interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  visibility: number;
  dt: number;
  name?: string;
}

export interface HourlyForecast {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  visibility: number;
  pop: number; // Probability of precipitation
}

export interface WeatherForecast {
  list: HourlyForecast[];
  city: {
    name: string;
    country: string;
    coord: {
      lat: number;
      lon: number;
    };
  };
}

async function http<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Weather API error ${res.status}: ${errorText}`);
  }
  return res.json() as Promise<T>;
}

export const WeatherService = {
  async getCurrent({ lat, lng }: Coordinates): Promise<WeatherData> {
    const url = `${OWM_BASE}/weather?lat=${lat}&lon=${lng}&appid=${OWM_API_KEY}&units=metric`;
    return withCache(`weather:current:${lat}:${lng}`, () => http(url), { ttlMs: 1000 * 60 * 5 });
  },
  
  async getHourlyForecast({ lat, lng }: Coordinates): Promise<WeatherForecast> {
    const url = `${OWM_BASE}/forecast?lat=${lat}&lon=${lng}&appid=${OWM_API_KEY}&units=metric`;
    return withCache(`weather:forecast:${lat}:${lng}`, () => http(url), { ttlMs: 1000 * 60 * 30 });
  },
  
  async getAlerts({ lat, lng }: Coordinates) {
    const url = `${OWM_BASE}/onecall?lat=${lat}&lon=${lng}&appid=${OWM_API_KEY}&units=metric&exclude=minutely,hourly,daily`;
    return withCache(`weather:alerts:${lat}:${lng}`, () => http(url), { ttlMs: 1000 * 60 * 10 });
  },

  // Helper function to get weather icon URL
  getWeatherIconUrl(iconCode: string): string {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  },

  // Helper function to format temperature
  formatTemperature(temp: number): string {
    return `${Math.round(temp)}°C`;
  },

  // Helper function to get wind direction
  getWindDirection(degrees: number): string {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  },

  // Helper function to get precipitation probability
  getPrecipitationProbability(pop: number): string {
    return `${Math.round(pop * 100)}%`;
  },
};

export default WeatherService;





