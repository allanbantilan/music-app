import { Hono } from 'hono';
import { getInnertube } from '../innertube.js';
import { browseCache } from '../cache.js';
import { AppError } from '../middleware/error.js';
import type {
  ExplorePage,
  AlbumInfo,
  Shelf,
  MoodChip,
  Thumbnail,
} from '@ytmusic/shared-types';

const explore = new Hono();

explore.get('/', async (c) => {
  const cacheKey = 'explore:page';
  const cached = browseCache.get(cacheKey) as ExplorePage | undefined;
  if (cached) return c.json({ success: true, data: cached });

  const yt = await getInnertube();
  const exploreData = await yt.music.getExplore();
  const data = exploreData as any;

  const result: ExplorePage = {
    newReleases: [],
    charts: [],
    moodsAndGenres: [],
  };

  // Parse sections
  const sections = data.contents ?? data.sections ?? [];

  for (const section of sections) {
    const title = section.header?.title ?? section.title ?? '';
    const items = section.contents ?? section.items ?? [];

    // Check if this is new releases
    if (title.toLowerCase().includes('new') || title.toLowerCase().includes('release')) {
      for (const item of items) {
        if (item.id && (item.type === 'Album' || item.title)) {
          result.newReleases.push({
            id: item.id,
            title: item.title ?? '',
            thumbnail: normalizeThumbnails(item.thumbnails ?? []),
            year: item.year ? parseInt(item.year) : undefined,
          });
        }
      }
    } else {
      // Add as a shelf
      const shelfType = inferShelfType(title);
      const shelfItems: any[] = [];

      for (const item of items) {
        if (item.type === 'Song') {
          shelfItems.push({
            id: item.id ?? '',
            title: item.title ?? '',
            artist: {
              id: item.artists?.[0]?.id ?? '',
              name: item.artists?.[0]?.name ?? '',
            },
            duration: item.duration?.seconds ?? item.duration ?? 0,
            thumbnail: normalizeThumbnails(item.thumbnails ?? []),
            isExplicit: item.isExplicit ?? false,
          });
        } else if (item.type === 'Album') {
          shelfItems.push({
            id: item.id ?? '',
            title: item.title ?? '',
            thumbnail: normalizeThumbnails(item.thumbnails ?? []),
            year: item.year ? parseInt(item.year) : undefined,
          });
        } else if (item.type === 'Playlist') {
          shelfItems.push({
            id: item.id ?? '',
            title: item.title ?? '',
            thumbnail: normalizeThumbnails(item.thumbnails ?? []),
            trackCount: item.trackCount ?? item.videoCount ?? 0,
          });
        }
      }

      if (shelfItems.length > 0) {
        result.charts.push({
          id: `chart-${result.charts.length}`,
          title,
          type: shelfType,
          items: shelfItems,
        });
      }
    }

    // Parse mood chips
    if (section.type === 'MoodChip' || section.isMoodChip) {
      for (const item of items) {
        result.moodsAndGenres.push({
          title: item.title ?? item.name ?? '',
          id: item.id ?? `mood-${result.moodsAndGenres.length}`,
          color: item.color ?? undefined,
          thumbnail: item.thumbnail ? (Array.isArray(item.thumbnail) ? item.thumbnail[0] : item.thumbnail) : undefined,
        });
      }
    }
  }

  browseCache.set(cacheKey, result);
  return c.json({ success: true, data: result });
});

function inferShelfType(title: string): Shelf['type'] {
  const lower = title.toLowerCase();
  if (lower.includes('song') || lower.includes('track')) return 'compact_song';
  if (lower.includes('album')) return 'card_album';
  if (lower.includes('playlist')) return 'card_playlist';
  if (lower.includes('artist')) return 'card_artist';
  if (lower.includes('video')) return 'card_video';
  return 'large_card';
}

function normalizeThumbnails(thumbnails: any[]): Thumbnail[] {
  return (thumbnails ?? []).map((t) => ({
    url: t.url ?? '',
    width: t.width ?? 0,
    height: t.height ?? 0,
  }));
}

export default explore;
