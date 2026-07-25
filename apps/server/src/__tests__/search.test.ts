import { describe, it, expect, vi, beforeEach } from 'vitest';
import { vi as vitestVi } from 'vitest';

// Use vi.hoisted to create mock values that can be used in vi.mock factories
const mockSearch = vitestVi.fn();
const mockGetHomeFeed = vitestVi.fn();

vitestVi.mock('../innertube.js', () => ({
  getInnertube: vitestVi.fn().mockResolvedValue({
    music: {
      search: mockSearch,
      getHomeFeed: mockGetHomeFeed,
    },
    getSearchSuggestions: vitestVi.fn().mockResolvedValue({ results: [] }),
  }),
}));

// Must import app AFTER the mock is set up
const { default: app } = await import('../index.js');

describe('Search API', () => {
  beforeEach(() => {
    mockSearch.mockReset();
  });

  it('should return 400 when missing query', async () => {
    const res = await app.request('/search');
    expect(res.status).toBe(400);
  });

  it('should search with query', async () => {
    mockSearch.mockResolvedValue({
      results: {
        songs: [],
        videos: [],
        albums: [],
        artists: [],
        playlists: [],
      },
    });

    const res = await app.request('/search?q=test');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.data.songs).toBeDefined();
  });

  it('should search with filter parameter', async () => {
    mockSearch.mockResolvedValue({
      results: {
        songs: [],
        videos: [],
        albums: [],
        artists: [],
        playlists: [],
      },
    });

    const res = await app.request('/search?q=test&filter=songs');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
  });

  it('should return 400 for empty query', async () => {
    const res = await app.request('/search?q=');
    expect(res.status).toBe(400);
  });

  it('should handle special characters in query', async () => {
    mockSearch.mockResolvedValue({
      results: {
        songs: [],
        videos: [],
        albums: [],
        artists: [],
        playlists: [],
      },
    });

    const res = await app.request('/search?q=hello%20world%20%26%20more');
    expect(res.status).toBe(200);
  });

  it('should handle filter=songs', async () => {
    mockSearch.mockResolvedValue({
      results: { songs: [], videos: [], albums: [], artists: [], playlists: [] },
    });
    const res = await app.request('/search?q=test&filter=songs');
    expect(res.status).toBe(200);
  });

  it('should handle filter=videos', async () => {
    mockSearch.mockResolvedValue({
      results: { songs: [], videos: [], albums: [], artists: [], playlists: [] },
    });
    const res = await app.request('/search?q=test&filter=videos');
    expect(res.status).toBe(200);
  });

  it('should handle filter=albums', async () => {
    mockSearch.mockResolvedValue({
      results: { songs: [], videos: [], albums: [], artists: [], playlists: [] },
    });
    const res = await app.request('/search?q=test&filter=albums');
    expect(res.status).toBe(200);
  });

  it('should handle filter=artists', async () => {
    mockSearch.mockResolvedValue({
      results: { songs: [], videos: [], albums: [], artists: [], playlists: [] },
    });
    const res = await app.request('/search?q=test&filter=artists');
    expect(res.status).toBe(200);
  });

  it('should handle filter=playlists', async () => {
    mockSearch.mockResolvedValue({
      results: { songs: [], videos: [], albums: [], artists: [], playlists: [] },
    });
    const res = await app.request('/search?q=test&filter=playlists');
    expect(res.status).toBe(200);
  });

  it('should handle filter=podcasts', async () => {
    mockSearch.mockResolvedValue({
      results: { songs: [], videos: [], albums: [], artists: [], playlists: [] },
    });
    const res = await app.request('/search?q=test&filter=podcasts');
    expect(res.status).toBe(200);
  });
});
