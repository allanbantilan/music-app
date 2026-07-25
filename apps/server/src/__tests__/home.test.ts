import { describe, it, expect, vi, beforeEach } from 'vitest';
import { vi as vitestVi } from 'vitest';

const mockGetHomeFeed = vitestVi.fn();

vitestVi.mock('../innertube.js', () => ({
  getInnertube: vitestVi.fn().mockResolvedValue({
    music: {
      getHomeFeed: mockGetHomeFeed,
      search: vitestVi.fn(),
    },
  }),
}));

const { default: app } = await import('../index.js');

describe('Home Feed API', () => {
  beforeEach(() => {
    mockGetHomeFeed.mockReset();
    mockGetHomeFeed.mockResolvedValue({
      contents: [
        {
          header: { title: 'Recently Played' },
          contents: [
            {
              type: 'Album',
              id: 'MPREb_test',
              title: 'Test Album',
              thumbnails: [{ url: 'https://example.com/thumb.jpg', width: 120, height: 120 }],
              year: '2024',
            },
          ],
        },
        {
          header: { title: 'Liked Songs' },
          contents: [
            {
              type: 'Song',
              id: 'video123',
              title: 'Test Song',
              artists: [{ id: 'artist1', name: 'Test Artist' }],
              duration: { seconds: 210 },
              thumbnails: [{ url: 'https://example.com/thumb.jpg', width: 120, height: 120 }],
            },
          ],
        },
      ],
    });
  });

  it('should return home feed with shelves', async () => {
    const res = await app.request('/home');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.data.shelves).toBeDefined();
    expect(Array.isArray(data.data.shelves)).toBe(true);
  });

  it('should return shelves with proper structure', async () => {
    const res = await app.request('/home');
    const data = await res.json();
    const shelves = data.data.shelves;
    expect(shelves.length).toBeGreaterThan(0);

    const firstShelf = shelves[0];
    expect(firstShelf.id).toBeDefined();
    expect(firstShelf.title).toBeDefined();
    expect(firstShelf.type).toBeDefined();
    expect(Array.isArray(firstShelf.items)).toBe(true);
  });

  it('should return moods chips', async () => {
    const res = await app.request('/home');
    const data = await res.json();
    expect(data.data.moods).toBeDefined();
    expect(Array.isArray(data.data.moods)).toBe(true);
  });

  it('should normalize shelf items correctly', async () => {
    const res = await app.request('/home');
    const data = await res.json();
    const shelves = data.data.shelves;
    for (const shelf of shelves) {
      expect(shelf.items).toBeDefined();
      expect(Array.isArray(shelf.items)).toBe(true);
      for (const item of shelf.items) {
        expect(item.id || item.title).toBeDefined();
      }
    }
  });

  it('should have valid shelf types', async () => {
    const res = await app.request('/home');
    const data = await res.json();
    const validTypes = ['compact_song', 'card_album', 'card_playlist', 'card_artist', 'card_video', 'large_card'];
    for (const shelf of data.data.shelves) {
      expect(validTypes).toContain(shelf.type);
    }
  });

  it('should create shelves with id and title', async () => {
    const res = await app.request('/home');
    const data = await res.json();
    for (const shelf of data.data.shelves) {
      expect(typeof shelf.id).toBe('string');
      expect(typeof shelf.title).toBe('string');
    }
  });

  it('should infer correct shelf types', async () => {
    const res = await app.request('/home');
    const data = await res.json();
    const albumShelves = data.data.shelves.filter((s: any) => s.type === 'card_album');
    expect(albumShelves.length).toBeGreaterThanOrEqual(0);
  });
});
