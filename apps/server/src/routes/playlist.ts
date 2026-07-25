import { Hono } from 'hono';
import { getInnertube } from '../innertube.js';
import { browseCache } from '../cache.js';
import { AppError } from '../middleware/error.js';
import type { PlaylistPage, Song, ArtistInfo, Thumbnail } from '@ytmusic/shared-types';

const playlist = new Hono();

playlist.get('/:playlistId', async (c) => {
  const playlistId = c.req.param('playlistId');
  if (!playlistId) throw new AppError('Missing playlistId', 400);

  const cacheKey = `playlist:${playlistId}`;
  const cached = browseCache.get(cacheKey) as PlaylistPage | undefined;
  if (cached) return c.json({ success: true, data: cached });

  const yt = await getInnertube();
  const playlistData = await yt.music.getPlaylist(playlistId);
  const data = playlistData as any;

  const artist: ArtistInfo | undefined = data.artist
    ? {
        id: data.artist.id ?? '',
        name: data.artist.name ?? '',
      }
    : undefined;

  const tracks: Song[] = [];

  // Parse tracks
  const contents = data.contents ?? [];
  for (const track of contents) {
    if (track.id) {
      tracks.push({
        id: track.id,
        title: track.title ?? '',
        artist: {
          id: track.artists?.[0]?.id ?? artist?.id ?? '',
          name: track.artists?.[0]?.name ?? artist?.name ?? '',
        },
        duration: track.duration?.seconds ?? track.duration ?? 0,
        thumbnail: normalizeThumbnails(track.thumbnails ?? []),
        isExplicit: track.isExplicit ?? false,
      });
    }
  }

  const playlistPage: PlaylistPage = {
    id: playlistId,
    title: data.title ?? '',
    artist,
    thumbnail: normalizeThumbnails(data.thumbnail?.thumbnails ?? data.thumbnails ?? []),
    description: data.description ?? undefined,
    trackCount: data.total_items ?? data.trackCount ?? tracks.length,
    tracks,
  };

  browseCache.set(cacheKey, playlistPage);
  return c.json({ success: true, data: playlistPage });
});

function normalizeThumbnails(thumbnails: any[]): Thumbnail[] {
  return (thumbnails ?? []).map((t) => ({
    url: t.url ?? '',
    width: t.width ?? 0,
    height: t.height ?? 0,
  }));
}

export default playlist;
