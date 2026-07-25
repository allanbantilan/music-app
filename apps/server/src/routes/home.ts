import { Hono } from 'hono';
import { getInnertube } from '../innertube.js';
import { browseCache } from '../cache.js';
import { AppError } from '../middleware/error.js';
import type {
  HomeFeed,
  Shelf,
  MoodChip,
  Song,
  AlbumInfo,
  Playlist,
  ArtistInfo,
  Video,
  Thumbnail,
} from '@ytmusic/shared-types';

const home = new Hono();

home.get('/', async (c) => {
  const cacheKey = 'home:feed';
  const cached = browseCache.get(cacheKey) as HomeFeed | undefined;
  if (cached) return c.json({ success: true, data: cached });

  const yt = await getInnertube();
  const homeData = await yt.music.getHomeFeed();

  const shelves: Shelf[] = [];
  const moods: MoodChip[] = [];

  // Parse sections from the home feed
  const sections = (homeData as any).contents ?? [];

  for (const section of sections) {
    if (section.header && section.contents) {
      const title = section.header?.title ?? '';
      const items: any[] = [];
      let type: Shelf['type'] = 'card_playlist';

      for (const item of section.contents) {
        if (item.type === 'Song') {
          items.push({
            id: item.id ?? item.videoId ?? '',
            title: item.title ?? '',
            artist: {
              id: item.artists?.[0]?.id ?? '',
              name: item.artists?.[0]?.name ?? '',
            },
            duration: item.duration?.seconds ?? item.duration ?? 0,
            thumbnail: normalizeThumbnails(item.thumbnails ?? []),
            isExplicit: item.isExplicit ?? false,
          });
          type = 'compact_song';
        } else if (item.type === 'Album') {
          items.push({
            id: item.id ?? '',
            title: item.title ?? '',
            thumbnail: normalizeThumbnails(item.thumbnails ?? []),
            year: item.year ? parseInt(item.year) : undefined,
          });
          type = 'card_album';
        } else if (item.type === 'Artist') {
          items.push({
            id: item.id ?? '',
            name: item.name ?? item.title ?? '',
            thumbnail: normalizeThumbnails(item.thumbnails ?? []),
          });
          type = 'card_artist';
        } else if (item.type === 'Playlist') {
          items.push({
            id: item.id ?? '',
            title: item.title ?? '',
            thumbnail: normalizeThumbnails(item.thumbnails ?? []),
            trackCount: item.trackCount ?? item.videoCount ?? 0,
          });
          type = 'card_playlist';
        } else if (item.type === 'Video') {
          items.push({
            id: item.id ?? item.videoId ?? '',
            title: item.title ?? '',
            artist: {
              id: item.artists?.[0]?.id ?? '',
              name: item.artists?.[0]?.name ?? '',
            },
            duration: item.duration?.seconds ?? item.duration ?? 0,
            thumbnail: normalizeThumbnails(item.thumbnails ?? []),
            viewCount: item.viewCount ?? undefined,
          });
          type = 'card_video';
        }
      }

      if (items.length > 0) {
        shelves.push({
          id: `shelf-${shelves.length}`,
          title,
          type,
          items,
        });
      }
    }
  }

  const feed: HomeFeed = { shelves, moods };
  browseCache.set(cacheKey, feed);
  return c.json({ success: true, data: feed });
});

function normalizeThumbnails(thumbnails: any[]): Thumbnail[] {
  return (thumbnails ?? []).map((t) => ({
    url: t.url ?? '',
    width: t.width ?? 0,
    height: t.height ?? 0,
  }));
}

export default home;
