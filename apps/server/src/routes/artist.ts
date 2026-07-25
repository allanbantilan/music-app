import { Hono } from 'hono';
import { getInnertube } from '../innertube.js';
import { artistCache } from '../cache.js';
import { AppError } from '../middleware/error.js';
import type {
  ArtistPage,
  Song,
  AlbumInfo,
  Video,
  ArtistInfo,
  Thumbnail,
} from '@ytmusic/shared-types';

const artist = new Hono();

artist.get('/:channelId', async (c) => {
  const channelId = c.req.param('channelId');
  if (!channelId) throw new AppError('Missing channelId', 400);

  const cacheKey = `artist:${channelId}`;
  const cached = artistCache.get(cacheKey) as ArtistPage | undefined;
  if (cached) return c.json({ success: true, data: cached });

  const yt = await getInnertube();
  const artistData = await yt.music.getArtist(channelId);
  const data = artistData as any;

  const result: ArtistPage = {
    id: channelId,
    name: data.name ?? data.header?.title ?? '',
    headerImage: normalizeThumbnails(data.header?.image?.thumbnails ?? data.header?.banner?.thumbnails ?? []),
    thumbnail: normalizeThumbnails(data.header?.thumbnail?.thumbnails ?? []),
    description: data.header?.description ?? data.description ?? undefined,
    subscribers: data.header?.subscriberCount ?? undefined,
    songs: [],
    albums: [],
    singles: [],
    videos: [],
    relatedArtists: [],
  };

  // Parse songs
  if (data.songs) {
    for (const song of (data.songs as any).contents ?? data.songs) {
      if (song.id) {
        result.songs.push({
          id: song.id,
          title: song.title ?? '',
          artist: {
            id: channelId,
            name: result.name,
          },
          duration: song.duration?.seconds ?? song.duration ?? 0,
          thumbnail: normalizeThumbnails(song.thumbnails ?? []),
          isExplicit: song.isExplicit ?? false,
        });
      }
    }
  }

  // Parse albums
  if (data.albums) {
    for (const album of (data.albums as any).contents ?? data.albums) {
      if (album.id) {
        result.albums.push({
          id: album.id,
          title: album.title ?? '',
          thumbnail: normalizeThumbnails(album.thumbnails ?? []),
          year: album.year ? parseInt(album.year) : undefined,
        });
      }
    }
  }

  // Parse singles
  if (data.singles) {
    for (const single of (data.singles as any).contents ?? data.singles) {
      if (single.id) {
        result.singles.push({
          id: single.id,
          title: single.title ?? '',
          thumbnail: normalizeThumbnails(single.thumbnails ?? []),
          year: single.year ? parseInt(single.year) : undefined,
        });
      }
    }
  }

  // Parse videos
  if (data.videos) {
    for (const video of (data.videos as any).contents ?? data.videos) {
      if (video.id) {
        result.videos.push({
          id: video.id,
          title: video.title ?? '',
          artist: {
            id: channelId,
            name: result.name,
          },
          duration: video.duration?.seconds ?? video.duration ?? 0,
          thumbnail: normalizeThumbnails(video.thumbnails ?? []),
          viewCount: video.viewCount ?? undefined,
        });
      }
    }
  }

  // Parse related artists
  if (data.related) {
    for (const related of (data.related as any).contents ?? data.related) {
      if (related.id) {
        result.relatedArtists.push({
          id: related.id,
          name: related.name ?? related.title ?? '',
          thumbnail: normalizeThumbnails(related.thumbnails ?? []),
        });
      }
    }
  }

  artistCache.set(cacheKey, result);
  return c.json({ success: true, data: result });
});

function normalizeThumbnails(thumbnails: any[]): Thumbnail[] {
  return (thumbnails ?? []).map((t) => ({
    url: t.url ?? '',
    width: t.width ?? 0,
    height: t.height ?? 0,
  }));
}

export default artist;
