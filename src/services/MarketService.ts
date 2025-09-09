import { withCache } from "@/lib/cache";

// Agmarknet public API is limited; treat this as a placeholder using a mockable endpoint.
const AGMARKNET_BASE = import.meta.env.VITE_AGMARKNET_BASE_URL || "https://api.example.com/agmarknet";

export interface MarketQuery {
  commodity: string;
  state?: string;
  district?: string;
}

async function http<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Market API error ${res.status}`);
  return res.json() as Promise<T>;
}

export const MarketService = {
  async getPrices(query: MarketQuery) {
    const params = new URLSearchParams(query as Record<string, string>);
    const url = `${AGMARKNET_BASE}/prices?${params.toString()}`;
    return withCache(`market:prices:${params.toString()}`,
      () => http(url),
      { ttlMs: 1000 * 60 * 30 }
    );
  },
  async getTrends(query: MarketQuery) {
    const params = new URLSearchParams(query as Record<string, string>);
    const url = `${AGMARKNET_BASE}/trends?${params.toString()}`;
    return withCache(`market:trends:${params.toString()}`,
      () => http(url),
      { ttlMs: 1000 * 60 * 60 }
    );
  },
};

export default MarketService;





