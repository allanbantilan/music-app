import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LRUCache } from '../cache.js';

describe('LRUCache', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should store and retrieve values', () => {
    const cache = new LRUCache<string>({ maxSize: 10, defaultTTL: 1000 });
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  it('should return undefined for missing keys', () => {
    const cache = new LRUCache<string>({ maxSize: 10, defaultTTL: 1000 });
    expect(cache.get('missing')).toBeUndefined();
  });

  it('should expire entries after TTL', () => {
    const cache = new LRUCache<string>({ maxSize: 10, defaultTTL: 1000 });
    cache.set('key1', 'value1');

    vi.advanceTimersByTime(500);
    expect(cache.get('key1')).toBe('value1');

    vi.advanceTimersByTime(600);
    expect(cache.get('key1')).toBeUndefined();
  });

  it('should use custom TTL when provided', () => {
    const cache = new LRUCache<string>({ maxSize: 10, defaultTTL: 1000 });
    cache.set('key1', 'value1', 500);

    vi.advanceTimersByTime(400);
    expect(cache.get('key1')).toBe('value1');

    vi.advanceTimersByTime(200);
    expect(cache.get('key1')).toBeUndefined();
  });

  it('should evict LRU entries when at capacity', () => {
    const cache = new LRUCache<string>({ maxSize: 3, defaultTTL: 1000 });
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.set('key3', 'value3');

    // Access key1 to mark as recently used
    cache.get('key1');

    // Add key4, should evict key2 (least recently used)
    cache.set('key4', 'value4');

    expect(cache.get('key1')).toBe('value1');
    expect(cache.get('key2')).toBeUndefined();
    expect(cache.get('key3')).toBe('value3');
    expect(cache.get('key4')).toBe('value4');
  });

  it('should delete entries', () => {
    const cache = new LRUCache<string>({ maxSize: 10, defaultTTL: 1000 });
    cache.set('key1', 'value1');
    cache.delete('key1');
    expect(cache.get('key1')).toBeUndefined();
  });

  it('should clear all entries', () => {
    const cache = new LRUCache<string>({ maxSize: 10, defaultTTL: 1000 });
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.clear();
    expect(cache.size).toBe(0);
  });

  it('should report correct size', () => {
    const cache = new LRUCache<string>({ maxSize: 10, defaultTTL: 1000 });
    expect(cache.size).toBe(0);
    cache.set('key1', 'value1');
    expect(cache.size).toBe(1);
    cache.set('key2', 'value2');
    expect(cache.size).toBe(2);
  });

  it('should prune expired entries', () => {
    const cache = new LRUCache<string>({ maxSize: 10, defaultTTL: 1000 });
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');

    vi.advanceTimersByTime(1100);

    const pruned = cache.prune();
    expect(pruned).toBe(2);
    expect(cache.size).toBe(0);
  });

  it('should check existence with has()', () => {
    const cache = new LRUCache<string>({ maxSize: 10, defaultTTL: 1000 });
    cache.set('key1', 'value1');

    expect(cache.has('key1')).toBe(true);
    expect(cache.has('key2')).toBe(false);

    vi.advanceTimersByTime(1100);
    expect(cache.has('key1')).toBe(false);
  });
});
