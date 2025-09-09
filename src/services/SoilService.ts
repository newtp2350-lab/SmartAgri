import { withCache } from "@/lib/cache";

const SOILGRIDS_BASE = "https://rest.soilgrids.org/soilgrids/v2.0/properties";

export interface Coordinates { lat: number; lng: number }

async function http<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Soil API error ${res.status}`);
  return res.json() as Promise<T>;
}

export const SoilService = {
  async getSoil({ lat, lng }: Coordinates) {
    const query = new URLSearchParams({
      lon: String(lng),
      lat: String(lat),
      property: ["phh2o", "nitrogen", "soc"].join(","),
      depth: "0-5cm",
    });
    const url = `${SOILGRIDS_BASE}?${query.toString()}`;
    return withCache(`soil:${lat}:${lng}`, () => http(url), { ttlMs: 1000 * 60 * 60 });
  },
};

export default SoilService;





