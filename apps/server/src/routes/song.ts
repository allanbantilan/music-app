import { Hono } from 'hono';
import { getInnertube } from '../innertube.js';
import { browseCache } from '../cache.js';
import { AppError } from '../middleware/error.js';
import type { Song, Thumbnail } from '@ytmusic/shared-types';

const song = new Hono();

song.get('/:videoId', async (c) => {
  const videoId = c.req.param('videoId');
  if (!videoId) throw new AppError('Missing videoId', 400);

  const cacheKey = `song:${videoId}`;
  const cached = browseCache.get(cacheKey) as Song | undefined;
  if (cached) return c.json({ success: true, data: cached });

  const yt = await getInnertube();
  const info = await yt.music.getInfo(videoId);

  if (!info) {
    throw new AppError('Song not found', 404);
  }

  const data = info as any;

  const result: Song = {
    id: videoId,
    title: data.basic_info?.title ?? data.title ?? '',
    artist: {
      id: data.basic_info?.channel_id ?? data.artists?.[0]?.id ?? '',
      name: data.basic_info?.author ?? data.artists?.[0]?.name ?? '',
    },
    duration: data.basic_info?.duration ?? data.duration?.seconds ?? 0,
    thumbnail: normalizeThumbnails(data.basic_info?.thumbnail ?? data.thumbnails ?? []),
    isExplicit: data.isExplicit ?? false,
  };

  browseCache.set(cacheKey, result);
  return c.json({ success: true, data: result });
});

function normalizeThumbnails(thumbnails: any[]): Thumbnail[] {
  return (thumbnails ?? []).map((t) => ({
    url: t.url ?? t.thumbnails?.[0]?.url ?? '',
    width: t.width ?? t.thumbnails?.[0]?.width ?? 0,
    height: t.height ?? t.thumbnails?.[0]?.height ?? 0,
  }));
}

export default song;
