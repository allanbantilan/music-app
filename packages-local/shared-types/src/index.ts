// ─── Core Media Types ───────────────────────────────────────────

export interface Song {
  id: string;          // videoId
  title: string;
  artist: ArtistInfo;
  album?: AlbumInfo;
  duration: number;    // seconds
  thumbnail: Thumbnail[];
  isExplicit: boolean;
}

export interface ArtistInfo {
  id: string;          // channelId
  name: string;
  thumbnail?: Thumbnail[];
}

export interface AlbumInfo {
  id: string;          // browseId
  title: string;
  thumbnail: Thumbnail[];
  year?: number;
}

export interface Playlist {
  id: string;          // playlistId
  title: string;
  artist?: ArtistInfo;
  thumbnail: Thumbnail[];
  trackCount: number;
}

export interface Podcast {
  id: string;
  title: string;
  artist: ArtistInfo;
  thumbnail: Thumbnail[];
  description?: string;
}

// ─── Thumbnail ──────────────────────────────────────────────────

export interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

// ─── Search ─────────────────────────────────────────────────────

export type SearchFilter = 'songs' | 'videos' | 'albums' | 'artists' | 'playlists' | 'podcasts';

export interface SearchResults {
  topResult?: SearchResult;
  songs: Song[];
  videos: Video[];
  albums: AlbumInfo[];
  artists: ArtistInfo[];
  playlists: Playlist[];
  podcasts: Podcast[];
}

export interface SearchResult {
  type: 'song' | 'video' | 'album' | 'artist' | 'playlist';
  title: string;
  subtitle: string;
  thumbnail: Thumbnail[];
  id: string;
  pageType: string;
}

export interface Video {
  id: string;          // videoId
  title: string;
  artist: ArtistInfo;
  duration: number;
  thumbnail: Thumbnail[];
  viewCount?: string;
}

// ─── Artist Page ────────────────────────────────────────────────

export interface ArtistPage {
  id: string;
  name: string;
  headerImage: Thumbnail[];
  thumbnail: Thumbnail[];
  description?: string;
  subscribers?: string;
  songs: Song[];
  albums: AlbumInfo[];
  singles: AlbumInfo[];
  videos: Video[];
  relatedArtists: ArtistInfo[];
}

// ─── Album / Playlist Page ──────────────────────────────────────

export interface AlbumPage {
  id: string;
  title: string;
  artist: ArtistInfo;
  year?: number;
  thumbnail: Thumbnail[];
  description?: string;
  tracks: Song[];
  totalDuration: number;
}

export interface PlaylistPage {
  id: string;
  title: string;
  artist?: ArtistInfo;
  thumbnail: Thumbnail[];
  description?: string;
  trackCount: number;
  tracks: Song[];
}

// ─── Stream ─────────────────────────────────────────────────────

export interface StreamInfo {
  url: string;
  mimeType: string;     // e.g. "audio/webm; codecs=\"opus\""
  bitrate: number;
  expiresAt: number;    // unix ms
  contentLength?: number;
}

export interface StreamProxyChunk {
  status: number;
  headers: Record<string, string>;
  body: ArrayBuffer;
}

// ─── Lyrics ─────────────────────────────────────────────────────

export interface Lyrics {
  videoId: string;
  source: 'innertube' | 'lrclib';
  plain?: string;           // plain text lyrics
  synced?: SyncedLine[];    // timed lyrics
}

export interface SyncedLine {
  startTimeMs: number;
  durationMs: number;
  text: string;
}

// ─── Home Feed / Shelves ────────────────────────────────────────

export type ShelfContent = Song[] | AlbumInfo[] | Playlist[] | ArtistInfo[] | Video[];

export interface Shelf {
  id: string;
  title: string;
  type: 'compact_song' | 'card_album' | 'card_playlist' | 'card_artist' | 'card_video' | 'large_card';
  items: ShelfContent;
}

export interface HomeFeed {
  shelves: Shelf[];
  moods: MoodChip[];
}

export interface MoodChip {
  title: string;
  id: string;
  color?: string;
  thumbnail?: Thumbnail;
}

// ─── Explore ────────────────────────────────────────────────────

export interface ExplorePage {
  newReleases: AlbumInfo[];
  charts: Shelf[];
  moodsAndGenres: MoodChip[];
}

// ─── Related / Radio ────────────────────────────────────────────

export interface RelatedTracks {
  id: string;           // continuation or playlist id
  tracks: Song[];
}

// ─── API Response Envelope ──────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
