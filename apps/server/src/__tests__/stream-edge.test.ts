import { describe, it, expect, vi, beforeEach } from 'vitest';
import { vi as vitestVi } from 'vitest';

const mockGetBasicInfo = vitestVi.fn();

vitestVi.mock('../innertube.js', () => ({
  getInnertube: vitestVi.fn().mockResolvedValue({
    music: {
      search: vitestVi.fn(),
      getHomeFeed: vitestVi.fn(),
    },
    getBasicInfo: mockGetBasicInfo,
  }),
}));

const { default: app } = await import('../index.js');

describe('Stream API - Edge Cases', () => {
  beforeEach(() => {
    mockGetBasicInfo.mockReset();
  });

  it('should return 404 when video is not found', async () => {
    mockGetBasicInfo.mockRejectedValue(new Error('Video not found'));

    const res = await app.request('/stream/nonexistent-video');
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it('should return 403 when video is private', async () => {
    mockGetBasicInfo.mockRejectedValue(new Error('This video is private'));

    const res = await app.request('/stream/private-video');
    expect(res.status).toBe(403);
  });

  it('should return 404 when no streaming data', async () => {
    mockGetBasicInfo.mockResolvedValue({
      streaming_data: null,
    });

    const res = await app.request('/stream/no-stream-data');
    expect(res.status).toBe(404);
  });

  it('should return 404 when no formats available', async () => {
    mockGetBasicInfo.mockResolvedValue({
      streaming_data: {
        adaptive_formats: [],
        formats: [],
      },
    });

    const res = await app.request('/stream/no-formats');
    expect(res.status).toBe(404);
  });

  it('should fallback to non-audio format when no audio formats have URLs', async () => {
    mockGetBasicInfo.mockResolvedValue({
      streaming_data: {
        adaptive_formats: [
          { itag: 140, mime_type: 'audio/mp4', bitrate: 128000, url: undefined },
        ],
        formats: [
          { itag: 18, mime_type: 'video/mp4', bitrate: 500000, url: 'https://example.com/video?expire=4102444800', content_length: 10000000 },
        ],
      },
    });

    const res = await app.request('/stream/fallback-video');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.mimeType).toBe('video/mp4');
  });

  it('should handle expired URL gracefully', async () => {
    mockGetBasicInfo.mockResolvedValue({
      streaming_data: {
        adaptive_formats: [
          { itag: 251, mime_type: 'audio/webm', bitrate: 160000, url: 'https://example.com/audio?expire=1000000000', content_length: 5000000 },
        ],
      },
    });

    const res = await app.request('/stream/expired-url');
    expect(res.status).toBe(200);
    const data = await res.json();
    // Should still return the URL even if expired — client handles refresh
    expect(data.data.url).toContain('expire=1000000000');
  });

  it('should use cache for repeated requests', async () => {
    mockGetBasicInfo.mockResolvedValue({
      streaming_data: {
        adaptive_formats: [
          { itag: 251, mime_type: 'audio/webm', bitrate: 160000, url: 'https://example.com/audio?expire=4102444800' },
        ],
      },
    });

    await app.request('/stream/cached-video');
    await app.request('/stream/cached-video');
    expect(mockGetBasicInfo).toHaveBeenCalledTimes(1);
  });

  it('should handle quality parameter variations', async () => {
    mockGetBasicInfo.mockResolvedValue({
      streaming_data: {
        adaptive_formats: [
          { itag: 250, mime_type: 'audio/webm', bitrate: 50000, url: 'https://example.com/low?expire=4102444800' },
          { itag: 251, mime_type: 'audio/webm', bitrate: 160000, url: 'https://example.com/high?expire=4102444800' },
        ],
      },
    });

    const resLow = await app.request('/stream/q-test?quality=low');
    const dataLow = await resLow.json();
    expect(dataLow.data.bitrate).toBe(50000);

    const resHigh = await app.request('/stream/q-test?quality=best');
    const dataHigh = await resHigh.json();
    expect(dataHigh.data.bitrate).toBe(160000);
  });
});
