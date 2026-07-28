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
  // Metadata only (browse/search/playlists). Playback goes through the backend
  // proxy, so no po_token/BotGuard is needed here.
  if (!instance) {
    instance = await Innertube.create({ lang: "en", location: "US" });
  }
  return instance;
}

// ── Helpers ────────────────────────────────────────────────────

function thumb(arr: any): Thumbnail[] {
  const list = Array.isArray(arr) ? arr : arr ? Object.values(arr) : [];
  return list.map((t: any) => ({
    url: t?.url ?? t?.toString?.() ?? "",
    width: t?.width ?? 0,
    height: t?.height ?? 0,
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

// Walk a youtubei.js music page's `.sections` into our Shelf[]. Shared by the
// home feed and explore — same response shape, so one parser, no guessing.
function parseSections(sections: any[]): Shelf[] {
  const shelves: Shelf[] = [];

  for (const section of sections ?? []) {
    const title = section.header?.title?.text ?? "";
    const contents = section.contents ?? [];
    const items: any[] = [];
    let type: Shelf["type"] = "card_playlist";

    for (const item of contents) {
      const it = item as any;
      // MusicResponsiveListItem exposes thumbnails via .thumbnail.contents;
      // MusicTwoRowItem via a plain .thumbnail array. Cover both.
      const th = it.thumbnails ?? it.thumbnail?.contents ?? it.thumbnail ?? [];
      switch (it.item_type) {
        case "song":
        case "video":
          items.push({
            id: it.id ?? "",
            title: it.title?.text ?? it.title ?? "",
            artist: { id: "", name: it.subtitle?.text ?? it.artists?.[0]?.name ?? "" },
            duration: it.duration?.seconds ?? 0,
            thumbnail: thumb(th),
            isExplicit: false,
          });
          type = "compact_song";
          break;
        case "album":
          items.push({
            id: it.id ?? "",
            title: it.title?.text ?? it.title ?? "",
            thumbnail: thumb(th),
          });
          type = "card_album";
          break;
        case "artist":
          items.push({
            id: it.id ?? "",
            name: it.title?.text ?? it.title ?? "",
            thumbnail: thumb(th),
          });
          type = "card_artist";
          break;
        case "playlist":
        default:
          items.push({
            id: it.id ?? "",
            title: it.title?.text ?? it.title ?? "",
            thumbnail: thumb(th),
            trackCount: it.item_count ?? 0,
            subtitle: it.subtitle?.text ?? "",
          });
          type = "card_playlist";
          break;
      }
    }

    if (items.length > 0) {
      shelves.push({ id: `shelf-${shelves.length}`, title, type, items });
    }
  }

  return shelves;
}

export async function getHomeFeed(): Promise<HomeFeed> {
  const yt = await getYT();
  const data = (await yt.music.getHomeFeed()) as any;
  return { shelves: parseSections(data.sections ?? []), moods: [] };
}

export async function search(
  query: string,
  filter?: SearchFilter
): Promise<SearchResults> {
  const yt = await getYT();
  const opts: any = {};
  if (filter) opts.filter = filter;

  const response = (await yt.music.search(query, opts)) as any;

  const out: SearchResults = {
    songs: [],
    videos: [],
    albums: [],
    artists: [],
    playlists: [],
    podcasts: [],
  };

  // Each getter (.songs/.videos/...) returns a MusicShelf section (or
  // undefined); the actual items are MusicResponsiveListItem in `.contents`.
  const items = (name: string): any[] => response[name]?.contents ?? [];

  for (const s of items("songs")) {
    if (s.id) out.songs.push(parseSong(s));
  }
  for (const v of items("videos")) {
    if (v.id) out.videos.push(parseVideo(v));
  }
  for (const a of items("albums")) {
    if (a.id) out.albums.push(parseAlbum(a));
  }
  for (const a of items("artists")) {
    if (a.id) out.artists.push(parseArtist(a));
  }
  for (const p of items("playlists")) {
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
  // Returns SearchSuggestionsSection[] — each holds SearchSuggestion nodes
  // whose text lives at `.suggestion.text`. Flatten to plain strings.
  const sections = (await yt.music.getSearchSuggestions(query)) as any[];
  return (sections ?? [])
    .flatMap((s) => s.contents ?? [])
    .map((c: any) => c.suggestion?.text ?? "")
    .filter((t: string) => t);
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

  // youtubei.js exposes tracks under `.items` as MusicResponsiveListItem.
  const rawItems: any[] = data.items ?? data.contents ?? data.tracks ?? [];

  const tracks = rawItems
    .filter((it: any) => it && (it.id || it.title))
    .map((it: any) => ({
      id: it.id ?? it.videoId ?? "",
      title: it.title?.text ?? it.title ?? "",
      artist: {
        id: it.artists?.[0]?.channel_id ?? it.author?.id ?? "",
        name:
          it.artists?.[0]?.name ??
          it.author?.name ??
          it.subtitle?.text ??
          "",
      },
      duration: it.duration?.seconds ?? 0,
      thumbnail: thumb(it.thumbnail ?? it.thumbnails ?? []),
      isExplicit: it.badges?.some?.((b: any) => b?.label === "Explicit") ?? false,
    }));

  const header = data.header ?? {};
  return {
    id: playlistId,
    title: header.title?.text ?? data.title?.text ?? data.title ?? "",
    artist: undefined,
    thumbnail: thumb(header.thumbnail ?? data.thumbnails ?? []),
    description: header.description?.text ?? data.description ?? undefined,
    trackCount: tracks.length,
    tracks,
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
  // With po_token in the session, the ANDROID client returns direct stream
  // URLs (no signature/decipher needed).
  const info = await yt.getBasicInfo(videoId, "ANDROID" as any);

  if (!info) throw new Error("Video not found");

  const streamingData = info.streaming_data;
  if (!streamingData) throw new Error("No streaming data available");

  const formats = [
    ...(streamingData.adaptive_formats ?? []),
    ...(streamingData.formats ?? []),
  ];

  // youtubei.js formats are usually cipher-protected — they have NO plain
  // `.url`, only a signature that must be deciphered via the player. Filtering
  // on `.url` dropped them all ("No playable format found"). chooseFormat picks
  // the best audio format; decipher() resolves the real URL.
  let selected: any;
  try {
    selected = info.chooseFormat({ type: "audio", quality: "best" });
  } catch {
    const audio = formats.filter((f: any) => f.mime_type?.startsWith("audio/"));
    const sorted = [...audio].sort(
      (a: any, b: any) => (a.bitrate ?? 0) - (b.bitrate ?? 0)
    );
    if (quality === "low") selected = sorted[0];
    else if (quality === "medium") selected = sorted[Math.floor(sorted.length / 2)];
    else selected = sorted[sorted.length - 1];
  }

  // decipher() is ASYNC — must await it, or you get a pending Promise.
  // With a valid po_token, WEB formats carry a decipherable signature.
  // decipher() is async — await it.
  let url: string | undefined;
  try {
    const d = await selected?.decipher?.(yt.session.player);
    if (typeof d === "string") url = d;
  } catch {}
  if (!url && typeof selected?.url === "string") url = selected.url;
  if (!url) throw new Error("No playable format found");

  // Parse expiry from URL
  let expiresAt = Date.now() + 6 * 60 * 60 * 1000;
  try {
    const u = new URL(url);
    const exp = u.searchParams.get("expire");
    if (exp) expiresAt = parseInt(exp) * 1000;
  } catch {}

  return {
    url,
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
  const charts = parseSections(data.sections ?? []);

  // Same page shape as home — reuse the section walker. Charts/new-release
  // shelves render as carousels; moods stay empty (YTM shows them inline).
  return {
    newReleases: [],
    charts,
    moodsAndGenres: [],
  };
}
