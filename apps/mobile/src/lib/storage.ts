import { MMKV } from "react-native-mmkv";

const mmkv = new MMKV();

export const storage = {
  getString(key: string): string | undefined {
    return mmkv.getString(key);
  },

  set(key: string, value: string): void {
    mmkv.set(key, value);
  },

  delete(key: string): void {
    mmkv.delete(key);
  },

  getJson<T>(key: string): T | null {
    const raw = mmkv.getString(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  setJson<T>(key: string, value: T): void {
    mmkv.set(key, JSON.stringify(value));
  },

  // Recent searches
  getRecentSearches(): string[] {
    return mmkv.getString("recentSearches")
      ? JSON.parse(mmkv.getString("recentSearches")!)
      : [];
  },

  addRecentSearch(query: string): void {
    const recent = this.getRecentSearches().filter((s) => s !== query);
    recent.unshift(query);
    mmkv.set("recentSearches", JSON.stringify(recent.slice(0, 20)));
  },

  clearRecentSearches(): void {
    mmkv.delete("recentSearches");
  },
};
