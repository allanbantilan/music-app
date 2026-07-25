import { Hono } from 'hono';
import { getInnertube } from '../innertube.js';
import { lyricsCache } from '../cache.js';
import { AppError } from '../middleware/error.js';
import type { Lyrics, SyncedLine } from '@ytmusic/shared-types';

const lyrics = new Hono();

lyrics.get('/:videoId', async (c) => {
  const videoId = c.req.param('videoId');
  if (!videoId) throw new AppError('Missing videoId', 400);

  const cacheKey = `lyrics:${videoId}`;
  const cached = lyricsCache.get(cacheKey) as Lyrics | undefined;
  if (cached) return c.json({ success: true, data: cached });

  const yt = await getInnertube();

  // Try InnerTube lyrics first
  try {
    const lyricsData = await yt.music.getLyrics(videoId);
    const data = lyricsData as any;

    if (data && (data.plainText || data.description)) {
      const plain = data.plainText ?? data.description ?? '';

      const lyricsResult: Lyrics = {
        videoId,
        source: 'innertube',
        plain,
      };

      lyricsCache.set(cacheKey, lyricsResult, 60 * 60_000);
      return c.json({ success: true, data: lyricsResult });
    }
  } catch (err) {
    console.log('[Lyrics] InnerTube lyrics not available, trying LRCLIB');
  }

  // Fallback to LRCLIB API
  try {
    const info = await yt.music.getInfo(videoId);
    const data = info as any;
    const title = data.basic_info?.title ?? data.title ?? '';
    const artist = data.basic_info?.author ?? data.artists?.[0]?.name ?? '';
    const duration = data.basic_info?.duration ?? data.duration?.seconds ?? 0;

    if (!title || !artist) {
      throw new AppError('Could not determine song info for lyrics lookup', 404);
    }

    const lrclibUrl = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(title)}&duration=${duration}`;
    const lrclibResponse = await fetch(lrclibUrl);

    if (!lrclibResponse.ok) {
      throw new AppError('Lyrics not found', 404);
    }

    const lrclibData = await lrclibResponse.json();

    let synced: SyncedLine[] | undefined;
    let plain: string | undefined;

    if (lrclibData.syncedLyrics) {
      synced = parseLrc(lrclibData.syncedLyrics);
      plain = lrclibData.plainLyrics ?? lrclibData.syncedLyrics
        .split('\n')
        .filter((line: string) => !line.startsWith('['))
        .join('\n');
    } else if (lrclibData.plainLyrics) {
      plain = lrclibData.plainLyrics;
    }

    if (!plain && !synced) {
      throw new AppError('Lyrics not found', 404);
    }

    const lyricsResult: Lyrics = {
      videoId,
      source: 'lrclib',
      plain,
      synced,
    };

    lyricsCache.set(cacheKey, lyricsResult, 60 * 60_000);
    return c.json({ success: true, data: lyricsResult });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError('Lyrics not available', 404);
  }
});

function parseLrc(lrc: string): SyncedLine[] {
  const lines: SyncedLine[] = [];
  const regex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;

  for (const line of lrc.split('\n')) {
    const match = regex.exec(line);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const ms = match[3].length === 2 ? parseInt(match[3]) * 10 : parseInt(match[3]);
      const text = match[4].trim();

      if (text) {
        lines.push({
          startTimeMs: minutes * 60_000 + seconds * 1_000 + ms,
          durationMs: 0,
          text,
        });
      }
    }
  }

  // Calculate durations
  for (let i = 0; i < lines.length; i++) {
    if (i < lines.length - 1) {
      lines[i].durationMs = lines[i + 1].startTimeMs - lines[i].startTimeMs;
    } else {
      lines[i].durationMs = 3000;
    }
  }

  return lines;
}

export default lyrics;
