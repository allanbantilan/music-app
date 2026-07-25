import { z } from 'zod';

// Track (song or video)
export const TrackSchema = z.object({
  id: z.string(),
  title: z.string(),
  artist: z.string(),
  artistId: z.string().optional(),
  album: z.string().optional(),
  albumId: z.string().optional(),
  duration: z.number(),
  artwork: z.string(),
  videoId: z.string(),
});
export type Track = z.infer<typeof TrackSchema>;

// Artist
export const ArtistSchema = z.object({
  id: z.string(),
  name: z.string(),
  thumbnail: z.string(),
  description: z.string().optional(),
  subscriberCount: z.string().optional(),
});
export type Artist = z.infer<typeof ArtistSchema>;

// Album
export const AlbumSchema = z.object({
  id: z.string(),
  title: z.string(),
  artist: z.string(),
  artistId: z.string().optional(),
  year: z.number().optional(),
  thumbnail: z.string(),
  trackCount: z.number(),
});
export type Album = z.infer<typeof AlbumSchema>;

// Playlist
export const PlaylistSchema = z.object({
  id: z.string(),
  title: z.string(),
  author: z.string().optional(),
  thumbnail: z.string(),
  trackCount: z.number(),
  description: z.string().optional(),
});
export type Playlist = z.infer<typeof PlaylistSchema>;

// Search results
export const SearchResultsSchema = z.object({
  songs: z.array(TrackSchema),
  videos: z.array(TrackSchema),
  albums: z.array(AlbumSchema),
  artists: z.array(ArtistSchema),
  playlists: z.array(PlaylistSchema),
});
export type SearchResults = z.infer<typeof SearchResultsSchema>;

// Shelf (carousel on home/explore)
export const ShelfSchema = z.object({
  title: z.string(),
  items: z.array(z.union([TrackSchema, AlbumSchema, ArtistSchema, PlaylistSchema])),
  type: z.enum(['songs', 'albums', 'artists', 'playlists']),
});
export type Shelf = z.infer<typeof ShelfSchema>;

// Stream info
export const StreamInfoSchema = z.object({
  url: z.string(),
  mimeType: z.string(),
  bitrate: z.number(),
  expiresAt: z.number(),
});
export type StreamInfo = z.infer<typeof StreamInfoSchema>;

// Lyrics
export const LyricsLineSchema = z.object({
  time: z.number(),
  text: z.string(),
});
export type LyricsLine = z.infer<typeof LyricsLineSchema>;

export const LyricsSchema = z.object({
  lines: z.array(LyricsLineSchema).optional(),
  plain: z.string().optional(),
});
export type Lyrics = z.infer<typeof LyricsSchema>;

// Artist page (extended)
export const ArtistPageSchema = z.object({
  artist: ArtistSchema,
  topSongs: z.array(TrackSchema),
  albums: z.array(AlbumSchema),
  singles: z.array(AlbumSchema),
  videos: z.array(TrackSchema),
  relatedArtists: z.array(ArtistSchema),
});
export type ArtistPage = z.infer<typeof ArtistPageSchema>;

// Album page
export const AlbumPageSchema = z.object({
  album: AlbumSchema,
  tracks: z.array(TrackSchema),
});
export type AlbumPage = z.infer<typeof AlbumPageSchema>;

// Playlist page
export const PlaylistPageSchema = z.object({
  playlist: PlaylistSchema,
  tracks: z.array(TrackSchema),
});
export type PlaylistPage = z.infer<typeof PlaylistPageSchema>;
