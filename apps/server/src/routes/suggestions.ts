import { Hono } from 'hono';
import { getInnertube } from '../innertube.js';
import { suggestionCache } from '../cache.js';
import { AppError } from '../middleware/error.js';

const suggestions = new Hono();

suggestions.get('/', async (c) => {
  const q = c.req.query('q');
  if (!q) throw new AppError('Missing query parameter "q"', 400);

  const cacheKey = `suggestions:${q}`;
  const cached = suggestionCache.get(cacheKey);
  if (cached) return c.json({ success: true, data: cached });

  const yt = await getInnertube();

  try {
    const response = await yt.music.getSearchSuggestions(q);
    const suggestionsList = (response as any).results ?? response ?? [];

    suggestionCache.set(cacheKey, suggestionsList);
    return c.json({ success: true, data: suggestionsList });
  } catch (err) {
    console.error('[Suggestions Error]', err);
    return c.json({ success: true, data: [] });
  }
});

export default suggestions;
