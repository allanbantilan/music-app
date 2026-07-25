import { Hono } from 'hono';
import { getInnertube } from '../innertube.js';
import { streamCache } from '../cache.js';
import { AppError } from '../middleware/error.js';
import type { StreamInfo } from '@ytmusic/shared-types';

const stream = new Hono();

stream.get('/:videoId', async (c) => {
  const videoId = c.req.param('videoId');
  if (!videoId) throw new AppError('Missing videoId', 400);

  const quality = c.req.query('quality') ?? 'best';

  const cacheKey = `stream:${videoId}:${quality}`;
  const cached = streamCache.get(cacheKey) as StreamInfo | undefined;
  if (cached) return c.json({ success: true, data: cached });

  const yt = await getInnertube();

  let info: any;
  try {
    info = await yt.getBasicInfo(videoId);
  } catch (err) {
    if (err instanceof Error && err.message.includes('private')) {
      throw new AppError('Video is private', 403);
    }
    throw new AppError('Video not found or unavailable', 404);
  }

  if (!info) {
    throw new AppError('Video not found', 404);
  }

  const streamingData = info.streaming_data;
  if (!streamingData) {
    throw new AppError('No streaming data available for this video', 404);
  }

  const formats = [
    ...(streamingData.adaptive_formats ?? []),
    ...(streamingData.formats ?? []),
  ];

  if (!formats.length) {
    throw new AppError('No formats available for this video', 404);
  }

  // Filter for audio formats
  const audioFormats = formats.filter(
    (f: any) => f.mime_type?.startsWith('audio/') && f.url
  );

  if (!audioFormats.length) {
    // Fallback to any format with a URL
    const anyFormat = formats.find((f: any) => f.url);
    if (!anyFormat?.url) {
      throw new AppError('No playable format found', 404);
    }

    const expiresAt = extractExpiry(anyFormat);
    const result: StreamInfo = {
      url: anyFormat.url,
      mimeType: anyFormat.mime_type ?? 'unknown',
      bitrate: anyFormat.bitrate ?? 0,
      expiresAt,
      contentLength: anyFormat.content_length ?? undefined,
    };

    streamCache.set(cacheKey, result, 30 * 60_000);
    return c.json({ success: true, data: result });
  }

  // Pick best audio format based on quality preference
  let selectedFormat: any;

  const sorted = [...audioFormats].sort((a: any, b: any) => (a.bitrate ?? 0) - (b.bitrate ?? 0));

  if (quality === 'low') {
    selectedFormat = sorted[0];
  } else if (quality === 'medium') {
    const mid = Math.floor(sorted.length / 2);
    selectedFormat = sorted[mid];
  } else {
    // 'best' or any other value - highest bitrate
    selectedFormat = sorted[sorted.length - 1];
  }

  if (!selectedFormat?.url) {
    throw new AppError('Selected format has no URL', 404);
  }

  const expiresAt = extractExpiry(selectedFormat);

  const result: StreamInfo = {
    url: selectedFormat.url,
    mimeType: selectedFormat.mime_type ?? 'unknown',
    bitrate: selectedFormat.bitrate ?? 0,
    expiresAt,
    contentLength: selectedFormat.content_length ?? undefined,
  };

  streamCache.set(cacheKey, result, 30 * 60_000);
  return c.json({ success: true, data: result });
});

function extractExpiry(format: any): number {
  // Try to extract expiry from the URL
  try {
    const url = new URL(format.url);
    const expires = url.searchParams.get('expire');
    if (expires) {
      return parseInt(expires) * 1000;
    }
  } catch {
    // URL parsing failed
  }

  // Default to ~6 hours from now
  return Date.now() + 6 * 60 * 60 * 1000;
}

export default stream;
