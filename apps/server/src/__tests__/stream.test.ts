import { describe, it, expect, vi, beforeEach } from 'vitest';
import { vi as vitestVi } from 'vitest';

const mockFormats = [
  {
    itag: 140,
    mime_type: 'audio/mp4; codecs="mp4a.40.2"',
    bitrate: 128000,
    url: 'https://example.com/audio1?expire=4102444800',
    content_length: 5000000,
  },
  {
    itag: 251,
    mime_type: 'audio/webm; codecs="opus"',
    bitrate: 160000,
    url: 'https://example.com/audio2?expire=4102444800',
    content_length: 6000000,
  },
  {
    itag: 250,
    mime_type: 'audio/webm; codecs="opus"',
    bitrate: 70000,
    url: 'https://example.com/audio3?expire=4102444800',
    content_length: 3000000,
  },
];

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

describe('Stream API', () => {
  beforeEach(() => {
    mockGetBasicInfo.mockReset();
    mockGetBasicInfo.mockResolvedValue({
      basic_info: {
        title: 'Test Song',
        author: 'Test Artist',
        duration: 210,
        thumbnail: [{ url: 'https://example.com/thumb.jpg', width: 120, height: 120 }],
        channel_id: 'UC1234567890',
      },
      streaming_data: {
        adaptive_formats: mockFormats,
        formats: [],
      },
    });
  });

  it('should return stream info with default quality', async () => {
    const res = await app.request('/stream/test-video-id');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.data.url).toBeDefined();
    expect(data.data.mimeType).toBeDefined();
    expect(data.data.bitrate).toBeDefined();
    expect(data.data.expiresAt).toBeDefined();
  });

  it('should return stream info with quality=best', async () => {
    const res = await app.request('/stream/test-video-id?quality=best');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    // Should pick highest bitrate (160000)
    expect(data.data.bitrate).toBe(160000);
  });

  it('should return stream info with quality=low', async () => {
    const res = await app.request('/stream/test-video-id?quality=low');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    // Should pick lowest bitrate (70000)
    expect(data.data.bitrate).toBe(70000);
  });

  it('should return stream info with quality=medium', async () => {
    const res = await app.request('/stream/test-video-id?quality=medium');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.bitrate).toBeDefined();
  });

  it('should include content length when available', async () => {
    const res = await app.request('/stream/test-video-id');
    const data = await res.json();
    expect(data.data.contentLength).toBeDefined();
  });

  it('should set expiresAt to future timestamp', async () => {
    const res = await app.request('/stream/test-video-id');
    const data = await res.json();
    expect(data.data.expiresAt).toBeGreaterThan(Date.now());
  });
});
