import { withCache } from "@/lib/cache";

const OWM_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY as string;
const OWM_BASE = "https://api.openweathermap.org/data/2.5";

export interface Coordinates { lat: number; lng: number }

async function http<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather API error ${res.status}`);
  return res.json() as Promise<T>;
}

export const WeatherService = {
  async getCurrent({ lat, lng }: Coordinates) {
    const url = `${OWM_BASE}/weather?lat=${lat}&lon=${lng}&appid=${OWM_API_KEY}&units=metric`;
    return withCache(`weather:current:${lat}:${lng}`, () => http(url), { ttlMs: 1000 * 60 * 5 });
  },
  async getForecast({ lat, lng }: Coordinates) {
    const url = `${OWM_BASE}/forecast?lat=${lat}&lon=${lng}&appid=${OWM_API_KEY}&units=metric`;
    return withCache(`weather:forecast:${lat}:${lng}`, () => http(url), { ttlMs: 1000 * 60 * 10 });
  },
  async getAlerts({ lat, lng }: Coordinates) {
    const url = `${OWM_BASE}/onecall?lat=${lat}&lon=${lng}&appid=${OWM_API_KEY}&units=metric&exclude=minutely,hourly,daily`;
    return withCache(`weather:alerts:${lat}:${lng}`, () => http(url), { ttlMs: 1000 * 60 * 10 });
  },
};

export default WeatherService;





