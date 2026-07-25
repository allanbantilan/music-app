import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import { getInnertube } from './innertube.js';
import { AppError } from './middleware/error.js';
import home from './routes/home.js';
import search from './routes/search.js';
import suggestions from './routes/suggestions.js';
import artist from './routes/artist.js';
import album from './routes/album.js';
import playlist from './routes/playlist.js';
import song from './routes/song.js';
import stream from './routes/stream.js';
import related from './routes/related.js';
import lyrics from './routes/lyrics.js';
import explore from './routes/explore.js';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger());

// Error handler
app.onError((err, c) => {
  console.error('[Server Error]', err);
  if (err instanceof AppError) {
    return c.json({ success: false, error: err.message }, err.status as any);
  }
  const message = err instanceof Error ? err.message : 'Internal server error';
  return c.json({ success: false, error: message }, 500);
});

// Routes
app.route('/home', home);
app.route('/search', search);
app.route('/suggestions', suggestions);
app.route('/artist', artist);
app.route('/album', album);
app.route('/playlist', playlist);
app.route('/song', song);
app.route('/stream', stream);
app.route('/related', related);
app.route('/lyrics', lyrics);
app.route('/explore', explore);

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: Date.now() });
});

// Start server if not imported as module (e.g., by vitest)
const isTest = process.env.NODE_ENV === 'test';
if (!isTest) {
  const PORT = parseInt(process.env.PORT ?? '3000', 10);
  start();
}

async function start() {
  try {
    console.log('[Server] Initializing Innertube client...');
    await getInnertube();
    console.log('[Server] Innertube client ready');

    const PORT = parseInt(process.env.PORT ?? '3000', 10);
    serve(
      {
        fetch: app.fetch,
        port: PORT,
      },
      (info) => {
        console.log(`[Server] Running on http://localhost:${info.port}`);
      }
    );
  } catch (err) {
    console.error('[Server] Failed to start:', err);
    process.exit(1);
  }
}

export default app;
