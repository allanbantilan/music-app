import { Hono } from 'hono';
import { getInnertube } from '../innertube.js';
import { albumCache } from '../cache.js';
import { AppError } from '../middleware/error.js';
import type { AlbumPage, Song, ArtistInfo, Thumbnail } from '@ytmusic/shared-types';

const album = new Hono();

album.get('/:browseId', async (c) => {
  const browseId = c.req.param('browseId');
  if (!browseId) throw new AppError('Missing browseId', 400);

  const cacheKey = `album:${browseId}`;
  const cached = albumCache.get(cacheKey) as AlbumPage | undefined;
  if (cached) return c.json({ success: true, data: cached });

  const yt = await getInnertube();
  const albumData = await yt.music.getAlbum(browseId);
  const data = albumData as any;

  const artist: ArtistInfo = {
    id: data.artist?.id ?? '',
    name: data.artist?.name ?? '',
  };

  const tracks: Song[] = [];
  let totalDuration = 0;

  // Parse tracks
  const contents = data.contents ?? data.songs ?? [];
  for (const track of contents) {
    if (track.id) {
      const song: Song = {
        id: track.id,
        title: track.title ?? '',
        artist: {
          id: track.artists?.[0]?.id ?? artist.id,
          name: track.artists?.[0]?.name ?? artist.name,
        },
        duration: track.duration?.seconds ?? track.duration ?? 0,
        thumbnail: normalizeThumbnails(track.thumbnails ?? []),
        isExplicit: track.isExplicit ?? false,
      };
      tracks.push(song);
      totalDuration += song.duration;
    }
  }

  const albumPage: AlbumPage = {
    id: browseId,
    title: data.title ?? '',
    artist,
    year: data.year ? parseInt(data.year) : undefined,
    thumbnail: normalizeThumbnails(data.thumbnail?.thumbnails ?? data.thumbnails ?? []),
    description: data.description ?? undefined,
    tracks,
    totalDuration,
  };

  albumCache.set(cacheKey, albumPage);
  return c.json({ success: true, data: albumPage });
});

function normalizeThumbnails(thumbnails: any[]): Thumbnail[] {
  return (thumbnails ?? []).map((t) => ({
    url: t.url ?? '',
    width: t.width ?? 0,
    height: t.height ?? 0,
  }));
}

export default album;
