import { Hono } from 'hono';
import { getInnertube } from '../innertube.js';
import { browseCache } from '../cache.js';
import { AppError } from '../middleware/error.js';
import type { RelatedTracks, Song, Thumbnail } from '@ytmusic/shared-types';

const related = new Hono();

related.get('/:videoId', async (c) => {
  const videoId = c.req.param('videoId');
  if (!videoId) throw new AppError('Missing videoId', 400);

  const cacheKey = `related:${videoId}`;
  const cached = browseCache.get(cacheKey) as RelatedTracks | undefined;
  if (cached) return c.json({ success: true, data: cached });

  const yt = await getInnertube();

  try {
    const relatedData = await yt.music.getRelated(videoId);
    const data = relatedData as any;

    const tracks: Song[] = [];
    const contents = data.contents ?? data.items ?? [];

    for (const item of contents) {
      if (item.id) {
        tracks.push({
          id: item.id,
          title: item.title ?? '',
          artist: {
            id: item.artists?.[0]?.id ?? '',
            name: item.artists?.[0]?.name ?? '',
          },
          duration: item.duration?.seconds ?? item.duration ?? 0,
          thumbnail: normalizeThumbnails(item.thumbnails ?? []),
          isExplicit: item.isExplicit ?? false,
        });
      }
    }

    const result: RelatedTracks = {
      id: videoId,
      tracks,
    };

    browseCache.set(cacheKey, result);
    return c.json({ success: true, data: result });
  } catch (err) {
    console.error('[Related Error]', err);
    // Return empty related tracks on error
    return c.json({ success: true, data: { id: videoId, tracks: [] } });
  }
});

function normalizeThumbnails(thumbnails: any[]): Thumbnail[] {
  return (thumbnails ?? []).map((t) => ({
    url: t.url ?? '',
    width: t.width ?? 0,
    height: t.height ?? 0,
  }));
}

export default related;
