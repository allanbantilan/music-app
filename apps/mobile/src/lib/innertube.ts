/**
 * On-device Innertube client.
 *
 * Wraps youtubei.js to run directly inside React Native.
 * Must import polyfills.ts first to ensure eval, TextDecoder,
 * crypto.subtle, URL, and Buffer shims are installed.
 */
import "./polyfills";

import { Innertube } from "youtubei.js";
import type {
  Song,
  ArtistInfo,
  AlbumInfo,
  Playlist,
  Video,
  SearchResults,
  SearchFilter,
  HomeFeed,
  Shelf,
  MoodChip,
  ArtistPage,
  AlbumPage,
  PlaylistPage,
  StreamInfo,
  Lyrics,
  Thumbnail,
  RelatedTracks,
} from "@ytmusic/shared-types";

// ── Singleton ──────────────────────────────────────────────────

let instance: Innertube | null = null;

async function getYT(): Promise<Innertube> {
  if (!instance) {
    instance = await Innertube.create({
      lang: "en",
      location: "US",
    });
  }
  return instance;
}

// ── Helpers ────────────────────────────────────────────────────

function thumb(arr: any[]): Thumbnail[] {
  return (arr ?? []).map((t) => ({
    url: t.url ?? t.toString?.() ?? "",
    width: t.width ?? 0,
    height: t.height ?? 0,
  }));
}

function parseSong(item: any): Song {
  return {
    id: item.id ?? item.videoId ?? "",
    title: item.title?.text ?? item.title ?? "",
    artist: {
      id: item.artists?.[0]?.id ?? item.author?.id ?? "",
      name: item.artists?.[0]?.name ?? item.author?.name ?? "",
    },
    album: item.album
      ? { id: item.album.id ?? "", title: item.album.name ?? "", thumbnail: [] }
      : undefined,
    duration: item.duration?.seconds ?? item.duration ?? 0,
    thumbnail: thumb(item.thumbnails ?? []),
    isExplicit: item.isExplicit ?? false,
  };
}

function parseAlbum(item: any): AlbumInfo {
  return {
    id: item.id ?? "",
    title: item.title?.text ?? item.title ?? "",
    thumbnail: thumb(item.thumbnails ?? []),
    year: item.year ? parseInt(item.year) : undefined,
  };
}

function parseArtist(item: any): ArtistInfo {
  return {
    id: item.id ?? "",
    name: item.name ?? item.title?.text ?? item.title ?? "",
    thumbnail: thumb(item.thumbnails ?? []),
  };
}

function parseVideo(item: any): Video {
  return {
    id: item.id ?? item.videoId ?? "",
    title: item.title?.text ?? item.title ?? "",
    artist: {
      id: item.artists?.[0]?.id ?? item.author?.id ?? "",
      name: item.artists?.[0]?.name ?? item.author?.name ?? "",
    },
    duration: item.duration?.seconds ?? item.duration ?? 0,
    thumbnail: thumb(item.thumbnails ?? []),
    viewCount: item.viewCount?.text ?? item.viewCount ?? undefined,
  };
}

// ── Public API ─────────────────────────────────────────────────

export async function getHomeFeed(): Promise<HomeFeed> {
  const yt = await getYT();
  const feed = await yt.music.getHomeFeed();
  const data = feed as any;

  const shelves: Shelf[] = [];
  const moods: MoodChip[] = [];

  const sections = data.contents ?? [];

  for (const section of sections) {
    if (section.header && section.contents) {
      const title = section.header?.title ?? "";
      const items: any[] = [];
      let type: Shelf["type"] = "card_playlist";

      for (const item of section.contents) {
        if (item.type === "Song" || item.type === "song") {
          items.push(parseSong(item));
          type = "compact_song";
        } else if (item.type === "Album" || item.type === "album") {
          items.push(parseAlbum(item));
          type = "card_album";
        } else if (item.type === "Artist" || item.type === "artist") {
          items.push(parseArtist(item));
          type = "card_artist";
        } else if (item.type === "Playlist" || item.type === "playlist") {
          items.push({
            id: item.id ?? "",
            title: item.title?.text ?? item.title ?? "",
            thumbnail: thumb(item.thumbnails ?? []),
            trackCount: item.trackCount ?? item.videoCount ?? 0,
          });
          type = "card_playlist";
        } else if (item.type === "Video" || item.type === "video") {
          items.push(parseVideo(item));
          type = "card_video";
        }
      }

      if (items.length > 0) {
        shelves.push({ id: `shelf-${shelves.length}`, title, type, items });
      }
    }
  }

  return { shelves, moods };
}

export async function search(
  query: string,
  filter?: SearchFilter
): Promise<SearchResults> {
  const yt = await getYT();
  const opts: any = {};
  if (filter) opts.filter = filter;

  const response = await yt.music.search(query, opts);
  const results = (response as any).results ?? response;

  const out: SearchResults = {
    songs: [],
    videos: [],
    albums: [],
    artists: [],
    playlists: [],
    podcasts: [],
  };

  if (results.songs) {
    for (const s of results.songs) {
      if (s.id) out.songs.push(parseSong(s));
    }
  }
  if (results.videos) {
    for (const v of results.videos) {
      if (v.id) out.videos.push(parseVideo(v));
    }
  }
  if (results.albums) {
    for (const a of results.albums) {
      if (a.id) out.albums.push(parseAlbum(a));
    }
  }
  if (results.artists) {
    for (const a of results.artists) {
      if (a.id) out.artists.push(parseArtist(a));
    }
  }
  const playlists = results.playlists ?? results.community_playlists ?? [];
  for (const p of playlists) {
    if (p.id) {
      out.playlists.push({
        id: p.id,
        title: p.title?.text ?? p.title ?? "",
        thumbnail: thumb(p.thumbnails ?? []),
        trackCount: p.trackCount ?? p.videoCount ?? 0,
      });
    }
  }

  return out;
}

export async function getSuggestions(query: string): Promise<string[]> {
  const yt = await getYT();
  const res = await yt.music.getSearchSuggestions(query);
  return ((res as any).results ?? res ?? []) as string[];
}

export async function getArtist(channelId: string): Promise<ArtistPage> {
  const yt = await getYT();
  const data = (await yt.music.getArtist(channelId)) as any;

  return {
    id: channelId,
    name: data.name ?? data.header?.title ?? "",
    headerImage: thumb(
      data.header?.image?.thumbnails ?? data.header?.banner?.thumbnails ?? []
    ),
    thumbnail: thumb(data.header?.thumbnail?.thumbnails ?? []),
    description: data.header?.description ?? data.description ?? undefined,
    subscribers: data.header?.subscriberCount ?? undefined,
    songs: (data.songs?.contents ?? data.songs ?? []).map(parseSong),
    albums: (data.albums?.contents ?? data.albums ?? []).map(parseAlbum),
    singles: (data.singles?.contents ?? data.singles ?? []).map(parseAlbum),
    videos: (data.videos?.contents ?? data.videos ?? []).map(parseVideo),
    relatedArtists: (data.related?.contents ?? data.related ?? []).map(
      parseArtist
    ),
  };
}

export async function getAlbum(browseId: string): Promise<AlbumPage> {
  const yt = await getYT();
  const data = (await yt.music.getAlbum(browseId)) as any;

  return {
    id: browseId,
    title: data.title ?? "",
    artist: data.artists?.[0]
      ? { id: data.artists[0].id ?? "", name: data.artists[0].name ?? "" }
      : { id: "", name: "" },
    year: data.year ? parseInt(data.year) : undefined,
    thumbnail: thumb(data.thumbnails ?? []),
    description: data.description ?? undefined,
    tracks: (data.tracks ?? []).map(parseSong),
    totalDuration: (data.tracks ?? []).reduce(
      (acc: number, t: any) => acc + (t.duration?.seconds ?? t.duration ?? 0),
      0
    ),
  };
}

export async function getPlaylist(playlistId: string): Promise<PlaylistPage> {
  const yt = await getYT();
  const data = (await yt.music.getPlaylist(playlistId)) as any;

  return {
    id: playlistId,
    title: data.title ?? "",
    artist: data.artists?.[0]
      ? { id: data.artists[0].id ?? "", name: data.artists[0].name ?? "" }
      : undefined,
    thumbnail: thumb(data.thumbnails ?? []),
    description: data.description ?? undefined,
    trackCount: data.trackCount ?? data.tracks?.length ?? 0,
    tracks: (data.tracks ?? []).map(parseSong),
  };
}

export async function getSongInfo(videoId: string): Promise<Song> {
  const yt = await getYT();
  const info = await yt.music.getInfo(videoId);
  const data = info as any;

  return {
    id: videoId,
    title: data.basic_info?.title ?? data.title ?? "",
    artist: {
      id: data.basic_info?.channel_id ?? "",
      name: data.basic_info?.author ?? data.artists?.[0]?.name ?? "",
    },
    duration: data.basic_info?.duration ?? data.duration?.seconds ?? 0,
    thumbnail: thumb(data.basic_info?.thumbnail ?? data.thumbnails ?? []),
    isExplicit: data.basic_info?.isExplicit ?? false,
  };
}

/**
 * Extract a playable stream URL for the given videoId.
 *
 * Returns a direct URL to Google's CDN — the phone fetches audio
 * bytes from there, not through this app. URLs expire (~6 hours)
 * and may be IP-bound. Call again on playback error.
 */
export async function getStreamUrl(
  videoId: string,
  quality: "best" | "medium" | "low" = "best"
): Promise<StreamInfo> {
  const yt = await getYT();
  const info = await yt.getBasicInfo(videoId);

  if (!info) throw new Error("Video not found");

  const streamingData = info.streaming_data;
  if (!streamingData) throw new Error("No streaming data available");

  const formats = [
    ...(streamingData.adaptive_formats ?? []),
    ...(streamingData.formats ?? []),
  ];

  // Prefer audio-only formats with a URL
  const audioFormats = formats.filter(
    (f: any) => f.mime_type?.startsWith("audio/") && f.url
  );

  let selected: any;

  if (audioFormats.length > 0) {
    const sorted = [...audioFormats].sort(
      (a: any, b: any) => (a.bitrate ?? 0) - (b.bitrate ?? 0)
    );
    if (quality === "low") selected = sorted[0];
    else if (quality === "medium") selected = sorted[Math.floor(sorted.length / 2)];
    else selected = sorted[sorted.length - 1];
  } else {
    // Fallback: any format with a URL
    selected = formats.find((f: any) => f.url);
  }

  if (!selected?.url) throw new Error("No playable format found");

  // Parse expiry from URL
  let expiresAt = Date.now() + 6 * 60 * 60 * 1000;
  try {
    const url = new URL(selected.url);
    const exp = url.searchParams.get("expire");
    if (exp) expiresAt = parseInt(exp) * 1000;
  } catch {}

  return {
    url: selected.url,
    mimeType: selected.mime_type ?? "unknown",
    bitrate: selected.bitrate ?? 0,
    expiresAt,
    contentLength: selected.content_length ?? undefined,
  };
}

export async function getRelated(videoId: string): Promise<RelatedTracks> {
  const yt = await getYT();
  const data = (await yt.music.getRelated(videoId)) as any;

  return {
    id: videoId,
    tracks: (data.contents ?? []).map(parseSong),
  };
}

export async function getLyrics(videoId: string): Promise<Lyrics> {
  const yt = await getYT();

  try {
    const data = (await yt.music.getLyrics(videoId)) as any;
    if (data && (data.plainText || data.description)) {
      return {
        videoId,
        source: "innertube",
        plain: data.plainText ?? data.description ?? "",
      };
    }
  } catch {}

  // Fallback to LRCLIB
  try {
    const info = (await yt.music.getInfo(videoId)) as any;
    const title = info.basic_info?.title ?? "";
    const artist = info.basic_info?.author ?? "";
    const duration = info.basic_info?.duration ?? 0;

    if (!title || !artist) throw new Error("No song info");

    const lrclibUrl = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(title)}&duration=${duration}`;
    const res = await fetch(lrclibUrl);
    if (!res.ok) throw new Error("Not found");

    const lrclib = await res.json();
    let plain: string | undefined;
    const synced = lrclib.syncedLyrics
      ? lrclib.syncedLyrics
          .split("\n")
          .filter((l: string) => l.startsWith("["))
          .map((l: string) => {
            const m = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/.exec(l);
            if (!m) return null;
            const ms = m[3].length === 2 ? parseInt(m[3]) * 10 : parseInt(m[3]);
            return {
              startTimeMs: parseInt(m[1]) * 60000 + parseInt(m[2]) * 1000 + ms,
              durationMs: 0,
              text: m[4].trim(),
            };
          })
          .filter(Boolean)
      : undefined;

    if (synced && synced.length > 0) {
      for (let i = 0; i < synced.length - 1; i++) {
        synced[i].durationMs = synced[i + 1].startTimeMs - synced[i].startTimeMs;
      }
      if (synced.length > 0) synced[synced.length - 1].durationMs = 3000;
    }

    plain = lrclib.plainLyrics;

    if (!plain && !synced) throw new Error("No lyrics");

    return { videoId, source: "lrclib", plain, synced };
  } catch {
    throw new Error("Lyrics not available");
  }
}

export async function getExplore(): Promise<{
  newReleases: AlbumInfo[];
  charts: Shelf[];
  moodsAndGenres: MoodChip[];
}> {
  const yt = await getYT();
  const data = (await yt.music.getExplore()) as any;

  return {
    newReleases: (data.new_releases ?? []).map(parseAlbum),
    charts: [],
    moodsAndGenres: (data.moods ?? []).map((m: any) => ({
      title: m.title?.text ?? m.title ?? "",
      id: m.id ?? "",
      color: m.color ?? undefined,
      thumbnail: thumb(m.thumbnails ?? []),
    })),
  };
}
