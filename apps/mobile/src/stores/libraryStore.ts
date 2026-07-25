import { create } from "zustand";
import { storage } from "@/lib/storage";

interface LibraryState {
  likedSongIds: Set<string>;
  savedAlbumIds: Set<string>;
  savedPlaylistIds: Set<string>;

  toggleLikeSong: (id: string) => void;
  isLiked: (id: string) => boolean;
  toggleSaveAlbum: (id: string) => void;
  isAlbumSaved: (id: string) => boolean;
  toggleSavePlaylist: (id: string) => void;
  isPlaylistSaved: (id: string) => boolean;
}

function loadSet(key: string): Set<string> {
  const raw = storage.getJson<string[]>(key);
  return new Set(raw ?? []);
}

function saveSet(key: string, set: Set<string>) {
  storage.setJson(key, [...set]);
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  likedSongIds: loadSet("likedSongs"),
  savedAlbumIds: loadSet("savedAlbums"),
  savedPlaylistIds: loadSet("savedPlaylists"),

  toggleLikeSong: (id) =>
    set((s) => {
      const next = new Set(s.likedSongIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveSet("likedSongs", next);
      return { likedSongIds: next };
    }),

  isLiked: (id) => get().likedSongIds.has(id),

  toggleSaveAlbum: (id) =>
    set((s) => {
      const next = new Set(s.savedAlbumIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveSet("savedAlbums", next);
      return { savedAlbumIds: next };
    }),

  isAlbumSaved: (id) => get().savedAlbumIds.has(id),

  toggleSavePlaylist: (id) =>
    set((s) => {
      const next = new Set(s.savedPlaylistIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveSet("savedPlaylists", next);
      return { savedPlaylistIds: next };
    }),

  isPlaylistSaved: (id) => get().savedPlaylistIds.has(id),
}));
