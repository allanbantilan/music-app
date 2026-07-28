import { create } from "zustand";
import type { Song } from "@ytmusic/shared-types";

interface ContextSheetState {
  song: Song | null;
  open: (song: Song) => void;
  close: () => void;
}

/** Global long-press context menu target (§3). */
export const useContextSheet = create<ContextSheetState>((set) => ({
  song: null,
  open: (song) => set({ song }),
  close: () => set({ song: null }),
}));
