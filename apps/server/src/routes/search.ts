import { Hono } from 'hono';
import { getInnertube } from '../innertube.js';
import { browseCache } from '../cache.js';
import { AppError } from '../middleware/error.js';
import type {
  SearchResults,
  Song,
  Video,
  AlbumInfo,
  ArtistInfo,
  Playlist,
  Podcast,
  Thumbnail,
  SearchFilter,
} from '@ytmusic/shared-types';

const search = new Hono();

search.get('/', async (c) => {
  const q = c.req.query('q');
  if (!q) throw new AppError('Missing query parameter "q"', 400);

  const filter = c.req.query('filter') as SearchFilter | undefined;

  const cacheKey = `search:${filter ?? 'all'}:${q}`;
  const cached = browseCache.get(cacheKey) as SearchResults | undefined;
  if (cached) return c.json({ success: true, data: cached });

  const yt = await getInnertube();

  // Use music search via the music client
  const searchOptions: any = {};
  if (filter) {
    searchOptions.filter = filter;
  }

  const response = await yt.music.search(q, searchOptions);
  const searchResults: SearchResults = {
    songs: [],
    videos: [],
    albums: [],
    artists: [],
    playlists: [],
    podcasts: [],
  };

  const results = (response as any).results ?? response;

  // Parse songs
  if (results.songs) {
    for (const song of results.songs) {
      if (song.id) {
        searchResults.songs.push({
          id: song.id,
          title: song.title ?? '',
          artist: {
            id: song.artists?.[0]?.id ?? '',
            name: song.artists?.[0]?.name ?? '',
          },
          duration: song.duration?.seconds ?? song.duration ?? 0,
          thumbnail: normalizeThumbnails(song.thumbnails ?? []),
          isExplicit: song.isExplicit ?? false,
        });
      }
    }
  }

  // Parse videos
  if (results.videos) {
    for (const video of results.videos) {
      if (video.id) {
        searchResults.videos.push({
          id: video.id,
          title: video.title ?? '',
          artist: {
            id: video.artists?.[0]?.id ?? '',
            name: video.artists?.[0]?.name ?? '',
          },
          duration: video.duration?.seconds ?? video.duration ?? 0,
          thumbnail: normalizeThumbnails(video.thumbnails ?? []),
          viewCount: video.viewCount ?? undefined,
        });
      }
    }
  }

  // Parse albums
  if (results.albums) {
    for (const album of results.albums) {
      if (album.id) {
        searchResults.albums.push({
          id: album.id,
          title: album.title ?? '',
          thumbnail: normalizeThumbnails(album.thumbnails ?? []),
          year: album.year ? parseInt(album.year) : undefined,
        });
      }
    }
  }

  // Parse artists
  if (results.artists) {
    for (const artist of results.artists) {
      if (artist.id) {
        searchResults.artists.push({
          id: artist.id,
          name: artist.name ?? artist.title ?? '',
          thumbnail: normalizeThumbnails(artist.thumbnails ?? []),
        });
      }
    }
  }

  // Parse playlists
  if (results.playlists || results.community_playlists) {
    const playlists = results.playlists ?? results.community_playlists ?? [];
    for (const playlist of playlists) {
      if (playlist.id) {
        searchResults.playlists.push({
          id: playlist.id,
          title: playlist.title ?? '',
          thumbnail: normalizeThumbnails(playlist.thumbnails ?? []),
          trackCount: playlist.trackCount ?? playlist.videoCount ?? 0,
        });
      }
    }
  }

  browseCache.set(cacheKey, searchResults);
  return c.json({ success: true, data: searchResults });
});

function normalizeThumbnails(thumbnails: any[]): Thumbnail[] {
  return (thumbnails ?? []).map((t) => ({
    url: t.url ?? '',
    width: t.width ?? 0,
    height: t.height ?? 0,
  }));
}

export default search;
