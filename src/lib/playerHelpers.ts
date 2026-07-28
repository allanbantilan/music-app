import type { Song } from "@ytmusic/shared-types";

export type RepeatMode = "off" | "all" | "one";

/** Queue + starting index for a context play. Pure. */
export function buildQueue(tracks: Song[], startIndex: number) {
  const i = Math.max(0, Math.min(startIndex, tracks.length - 1));
  return { queue: [...tracks], currentIndex: tracks.length ? i : 0 };
}

/**
 * Shuffle a queue but pin the currently-playing track at index 0 (Spotify
 * behavior). `rng` is injectable for deterministic tests. Pure.
 */
export function shuffleWithPin(
  queue: Song[],
  currentIndex: number,
  rng: () => number = Math.random
): Song[] {
  if (queue.length <= 1) return [...queue];
  const current = queue[currentIndex];
  const rest = queue.filter((_, i) => i !== currentIndex);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return [current, ...rest];
}

/** Recompute the index of a track id after restoring the original order. Pure. */
export function indexOfId(queue: Song[], id: string | undefined): number {
  const i = queue.findIndex((t) => t.id === id);
  return i < 0 ? 0 : i;
}

/** Insert a track right after the current one (Play next). Pure. */
export function insertPlayNext(
  queue: Song[],
  currentIndex: number,
  track: Song
): Song[] {
  const next = [...queue];
  next.splice(currentIndex + 1, 0, track);
  return next;
}

/**
 * Next index on track end / Next press. Returns -1 to stop.
 * one → replay same; all → wrap; off → stop at end. Pure.
 */
export function advance(
  currentIndex: number,
  length: number,
  repeatMode: RepeatMode
): number {
  if (length === 0) return -1;
  if (repeatMode === "one") return currentIndex;
  if (currentIndex + 1 < length) return currentIndex + 1;
  return repeatMode === "all" ? 0 : -1;
}
