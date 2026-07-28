import { create } from "zustand";
import type { Song } from "@ytmusic/shared-types";

export type RepeatMode = "off" | "all" | "one";

export interface PlaybackContext {
  type: "playlist" | "album" | "artist" | "search" | "liked" | "home";
  id: string;
  title: string;
}

interface PlayerState {
  currentTrack: Song | null;
  queue: Song[];
  originalQueue: Song[];
  currentIndex: number;
  history: string[];
  isPlaying: boolean;
  isBuffering: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  position: number;
  duration: number;
  playbackContext: PlaybackContext | null;

  setCurrentIndex: (i: number) => void;
  setBuffering: (b: boolean) => void;
  setOriginalQueue: (q: Song[]) => void;
  setPlaybackContext: (c: PlaybackContext | null) => void;

  setCurrentTrack: (track: Song | null) => void;
  setQueue: (tracks: Song[], startIndex?: number) => void;
  addToQueue: (track: Song) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (from: number, to: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setPlaying: (playing: boolean) => void;
  setPosition: (position: number) => void;
  setDuration: (duration: number) => void;
  playTrack: (track: Song) => void;
  clearQueue: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  originalQueue: [],
  currentIndex: 0,
  history: [],
  isPlaying: false,
  isBuffering: false,
  shuffle: false,
  repeat: "off",
  position: 0,
  duration: 0,
  playbackContext: null,

  setCurrentIndex: (i) => set({ currentIndex: i }),
  setBuffering: (b) => set({ isBuffering: b }),
  setOriginalQueue: (q) => set({ originalQueue: q }),
  setPlaybackContext: (c) => set({ playbackContext: c }),

  setCurrentTrack: (track) => set({ currentTrack: track }),

  setQueue: (tracks, startIndex = 0) => {
    set({
      queue: tracks,
      currentTrack: tracks[startIndex] ?? null,
    });
  },

  addToQueue: (track) => set((s) => ({ queue: [...s.queue, track] })),

  removeFromQueue: (index) =>
    set((s) => {
      const queue = [...s.queue];
      queue.splice(index, 1);
      return { queue };
    }),

  reorderQueue: (from, to) =>
    set((s) => {
      const queue = [...s.queue];
      const [item] = queue.splice(from, 1);
      queue.splice(to, 0, item);
      return { queue };
    }),

  toggleShuffle: () => {
    const { shuffle, queue, currentTrack } = get();
    if (!shuffle) {
      const current = currentTrack;
      if (current) {
        const rest = queue.filter((t) => t.id !== current.id);
        for (let i = rest.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [rest[i], rest[j]] = [rest[j], rest[i]];
        }
        set({ shuffle: true, queue: [current, ...rest] });
      } else {
        set({ shuffle: true });
      }
    } else {
      set({ shuffle: false });
    }
  },

  cycleRepeat: () =>
    set((s) => ({
      repeat: s.repeat === "off" ? "all" : s.repeat === "all" ? "one" : "off",
    })),

  setPlaying: (playing) => set({ isPlaying: playing }),
  setPosition: (position) => set({ position }),
  setDuration: (duration) => set({ duration }),

  playTrack: (track) =>
    set((s) => ({
      currentTrack: track,
      history: s.currentTrack
        ? [...s.history, s.currentTrack.id]
        : s.history,
      position: 0,
    })),

  clearQueue: () => set({ queue: [], currentTrack: null }),
}));
