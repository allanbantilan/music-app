/**
 * API layer — runs youtubei.js on-device.
 *
 * Every function here is a thin async wrapper around the Innertube
 * client. React Query hooks consume these for caching + reactivity.
 */
import { useQuery } from "@tanstack/react-query";
import type {
  HomeFeed,
  SearchResults,
  ArtistPage,
  AlbumPage,
  PlaylistPage,
  StreamInfo,
  Lyrics,
  SearchFilter,
} from "@ytmusic/shared-types";
import {
  getHomeFeed,
  search as ytSearch,
  getSuggestions,
  getArtist,
  getAlbum,
  getPlaylist,
  getStreamUrl,
  getLyrics,
  getExplore,
} from "./innertube";

// ─── Stream URL builder (for track-player URI) ─────────────────

/**
 * Returns a playable stream URL for the given videoId.
 * The URL points directly to Google's CDN — no proxy needed.
 */
export async function fetchStreamUrl(videoId: string): Promise<StreamInfo> {
  return getStreamUrl(videoId);
}

// ─── React Query hooks ─────────────────────────────────────────

export function useHomeFeed() {
  return useQuery({
    queryKey: ["home"],
    queryFn: getHomeFeed,
    staleTime: 5 * 60_000,
  });
}

export function useSearch(query: string, filter?: SearchFilter) {
  return useQuery({
    queryKey: ["search", query, filter],
    queryFn: () => ytSearch(query, filter),
    enabled: query.length > 0,
    staleTime: 2 * 60_000,
  });
}

export function useSearchSuggestions(query: string) {
  return useQuery({
    queryKey: ["suggestions", query],
    queryFn: () => getSuggestions(query),
    enabled: query.length > 1,
    staleTime: 60_000,
  });
}

export function useArtist(id: string) {
  return useQuery({
    queryKey: ["artist", id],
    queryFn: () => getArtist(id),
    staleTime: 10 * 60_000,
  });
}

export function useAlbum(id: string) {
  return useQuery({
    queryKey: ["album", id],
    queryFn: () => getAlbum(id),
    staleTime: 10 * 60_000,
  });
}

export function usePlaylist(id: string) {
  return useQuery({
    queryKey: ["playlist", id],
    queryFn: () => getPlaylist(id),
    staleTime: 10 * 60_000,
  });
}

export function useLyrics(videoId: string) {
  return useQuery({
    queryKey: ["lyrics", videoId],
    queryFn: () => getLyrics(videoId),
    staleTime: 30 * 60_000,
  });
}

export function useExplore() {
  return useQuery({
    queryKey: ["explore"],
    queryFn: getExplore,
    staleTime: 10 * 60_000,
  });
}
