import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { handleApiRequest } from './server/apiRouter';
import { initDatabase } from './server/db';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Connect to the database at startup. A failure is logged; requests retry later.
  try {
    await initDatabase();
  } catch {
    console.error('Database is not reachable yet. The server will keep retrying on each request.');
  }

  // Intercept all /api routes with centralized router
  app.use(async (req, res, next) => {
    if (req.url && req.url.startsWith('/api')) {
      try {
        const handled = await handleApiRequest(req, res, next);
        if (handled) return;
      } catch (err: any) {
        console.error('API error:', err?.message || err);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Database error. Please try again.' }));
        }
        return;
      }
    }
    next();
  });

  // Vite middleware in development, static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Shanghai Namutong Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
