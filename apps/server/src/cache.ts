interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export interface CacheOptions {
  maxSize?: number;
  defaultTTL?: number;
}

export class LRUCache<T = unknown> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;
  private defaultTTL: number;

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize ?? 500;
    this.defaultTTL = options.defaultTTL ?? 5 * 60 * 1000; // 5 minutes
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    // Move to end (most recently used) by deleting and re-inserting
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  set(key: string, value: T, ttl?: number): void {
    // Delete first to ensure correct LRU order when re-inserting
    this.cache.delete(key);

    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + (ttl ?? this.defaultTTL),
    });
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }

  // Cleanup expired entries
  prune(): number {
    let pruned = 0;
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        pruned++;
      }
    }
    return pruned;
  }
}

// Pre-configured cache instances
export const suggestionCache = new LRUCache<string[]>({
  maxSize: 200,
  defaultTTL: 30_000, // 30 seconds
});

export const browseCache = new LRUCache<unknown>({
  maxSize: 100,
  defaultTTL: 5 * 60_000, // 5 minutes
});

export const artistCache = new LRUCache<unknown>({
  maxSize: 100,
  defaultTTL: 60 * 60_000, // 1 hour
});

export const albumCache = new LRUCache<unknown>({
  maxSize: 100,
  defaultTTL: 60 * 60_000, // 1 hour
});

export const streamCache = new LRUCache<unknown>({
  maxSize: 50,
  defaultTTL: 30 * 60_000, // 30 minutes
});

export const lyricsCache = new LRUCache<unknown>({
  maxSize: 200,
  defaultTTL: 60 * 60_000, // 1 hour
});

// Periodic cleanup every 5 minutes
const cleanupInterval = setInterval(() => {
  suggestionCache.prune();
  browseCache.prune();
  artistCache.prune();
  albumCache.prune();
  streamCache.prune();
  lyricsCache.prune();
}, 5 * 60_000);

// Don't prevent process exit
if (cleanupInterval.unref) {
  cleanupInterval.unref();
}
