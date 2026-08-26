// Simple high-performance in-memory cache for API responses

interface CacheEntry<T> {
    data: T;
    expiry: number;
}

class SimpleMemoryCache {
    private cache = new Map<string, CacheEntry<any>>();

    get<T>(key: string): T | null {
        const entry = this.cache.get(key);
        if (!entry) return null;
        if (Date.now() > entry.expiry) {
            this.cache.delete(key);
            return null;
        }
        return entry.data;
    }

    set<T>(key: string, data: T, ttlSeconds: number = 30): void {
        this.cache.set(key, {
            data,
            expiry: Date.now() + ttlSeconds * 1000,
        });
    }

    invalidate(keyPattern?: string): void {
        if (!keyPattern) {
            this.cache.clear();
            return;
        }
        for (const key of this.cache.keys()) {
            if (key.includes(keyPattern)) {
                this.cache.delete(key);
            }
        }
    }
}

export const memoryCache = new SimpleMemoryCache();
