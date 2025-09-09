const DEFAULT_TTL_MS = 1000 * 60 * 10; // 10 minutes

export interface CacheOptions {
  ttlMs?: number;
}

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { value: T; expiresAt: number };
    if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed.value;
  } catch {
    return null;
  }
}

export async function setCached<T>(key: string, value: T, options?: CacheOptions) {
  const ttl = options?.ttlMs ?? DEFAULT_TTL_MS;
  const payload = { value, expiresAt: Date.now() + ttl };
  localStorage.setItem(key, JSON.stringify(payload));
}

export async function withCache<T>(key: string, fetcher: () => Promise<T>, options?: CacheOptions) {
  const cached = await getCached<T>(key);
  if (cached) return cached;
  const value = await fetcher();
  await setCached(key, value, options);
  return value;
}





