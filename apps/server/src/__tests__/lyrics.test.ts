import { describe, it, expect, vi, beforeEach } from 'vitest';
import { vi as vitestVi } from 'vitest';

const mockGetLyrics = vitestVi.fn();
const mockGetInfo = vitestVi.fn();

vitestVi.mock('../innertube.js', () => ({
  getInnertube: vitestVi.fn().mockResolvedValue({
    music: {
      getLyrics: mockGetLyrics,
      getInfo: mockGetInfo,
      search: vitestVi.fn(),
      getHomeFeed: vitestVi.fn(),
    },
  }),
}));

const { default: app } = await import('../index.js');

describe('Lyrics API', () => {
  beforeEach(() => {
    mockGetLyrics.mockReset();
    mockGetInfo.mockReset();
  });

  it('should return lyrics from InnerTube', async () => {
    mockGetLyrics.mockResolvedValue({
      plainText: 'Line 1\nLine 2\nLine 3',
    });

    const res = await app.request('/lyrics/test-video');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.plain).toBe('Line 1\nLine 2\nLine 3');
    expect(data.data.source).toBe('innertube');
  });

  it('should fall back to LRCLIB when InnerTube fails', async () => {
    mockGetLyrics.mockRejectedValue(new Error('Not available'));
    mockGetInfo.mockResolvedValue({
      basic_info: { title: 'Test Song', author: 'Test Artist', duration: 200 },
    });

    // Mock LRCLIB response
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        plainLyrics: 'LRCLIB lyrics here',
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const res = await app.request('/lyrics/test-video-lrclib');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.source).toBe('lrclib');
    expect(data.data.plain).toBe('LRCLIB lyrics here');

    vi.unstubAllGlobals();
  });

  it('should return 404 when no lyrics available', async () => {
    mockGetLyrics.mockResolvedValue(null);
    mockGetInfo.mockResolvedValue({
      basic_info: { title: 'No Lyrics', author: 'Artist', duration: 180 },
    });

    const mockFetch = vi.fn().mockResolvedValue({ ok: false });
    vi.stubGlobal('fetch', mockFetch);

    const res = await app.request('/lyrics/no-lyrics-video');
    expect(res.status).toBe(404);

    vi.unstubAllGlobals();
  });

  it('should parse synced LRC lyrics correctly', async () => {
    mockGetLyrics.mockRejectedValue(new Error('No innertube lyrics'));
    mockGetInfo.mockResolvedValue({
      basic_info: { title: 'Synced Song', author: 'Artist', duration: 300 },
    });

    const lrcContent = `[00:01.00]First line
[00:05.50]Second line
[00:10.00]Third line`;

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        syncedLyrics: lrcContent,
        plainLyrics: 'First line\nSecond line\nThird line',
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const res = await app.request('/lyrics/synced-video');
    const data = await res.json();
    expect(data.data.synced).toBeDefined();
    expect(data.data.synced).toHaveLength(3);
    expect(data.data.synced[0].text).toBe('First line');
    expect(data.data.synced[0].startTimeMs).toBe(1000);
    expect(data.data.synced[1].startTimeMs).toBe(5500);
    expect(data.data.synced[2].startTimeMs).toBe(10000);

    vi.unstubAllGlobals();
  });
});
