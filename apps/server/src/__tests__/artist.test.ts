import { describe, it, expect, vi, beforeEach } from 'vitest';
import { vi as vitestVi } from 'vitest';

const mockGetArtist = vitestVi.fn();

vitestVi.mock('../innertube.js', () => ({
  getInnertube: vitestVi.fn().mockResolvedValue({
    music: {
      getArtist: mockGetArtist,
      search: vitestVi.fn(),
      getHomeFeed: vitestVi.fn(),
    },
  }),
}));

const { default: app } = await import('../index.js');

describe('Artist API', () => {
  beforeEach(() => {
    mockGetArtist.mockReset();
  });

  it('should return 200 with artist data', async () => {
    mockGetArtist.mockResolvedValue({
      name: 'Test Artist',
      header: {
        title: 'Test Artist',
        image: { thumbnails: [{ url: 'https://example.com/header.jpg', width: 1200, height: 400 }] },
        thumbnail: { thumbnails: [{ url: 'https://example.com/thumb.jpg', width: 200, height: 200 }] },
        description: 'A great artist',
        subscriberCount: '1M subscribers',
      },
      songs: {
        contents: [
          { id: 'song1', title: 'Song 1', duration: { seconds: 200 }, thumbnails: [] },
          { id: 'song2', title: 'Song 2', duration: { seconds: 180 }, thumbnails: [] },
        ],
      },
      albums: {
        contents: [
          { id: 'album1', title: 'Album 1', thumbnails: [], year: '2024' },
        ],
      },
      singles: {
        contents: [
          { id: 'single1', title: 'Single 1', thumbnails: [], year: '2023' },
        ],
      },
      videos: {
        contents: [
          { id: 'video1', title: 'Video 1', duration: { seconds: 240 }, thumbnails: [] },
        ],
      },
      related: {
        contents: [
          { id: 'related1', name: 'Related Artist', thumbnails: [] },
        ],
      },
    });

    const res = await app.request('/artist/UC1234567890');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.id).toBe('UC1234567890');
    expect(data.data.name).toBe('Test Artist');
    expect(data.data.songs).toHaveLength(2);
    expect(data.data.albums).toHaveLength(1);
    expect(data.data.singles).toHaveLength(1);
    expect(data.data.videos).toHaveLength(1);
    expect(data.data.relatedArtists).toHaveLength(1);
  });

  it('should handle empty artist data gracefully', async () => {
    mockGetArtist.mockResolvedValue({
      name: 'Empty Artist',
    });

    const res = await app.request('/artist/UC_EMPTY');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.songs).toHaveLength(0);
    expect(data.data.albums).toHaveLength(0);
  });

  it('should cache artist results', async () => {
    mockGetArtist.mockResolvedValue({
      name: 'Cached Artist',
      songs: { contents: [] },
    });

    await app.request('/artist/UC_CACHE');
    await app.request('/artist/UC_CACHE');
    expect(mockGetArtist).toHaveBeenCalledTimes(1);
  });
});
