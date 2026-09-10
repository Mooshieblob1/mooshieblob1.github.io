import { handleGalleryRequest } from '../server/gallery-api.mjs';
import { handleMediaRequest } from '../server/media-api.mjs';
import { Readable } from 'node:stream';

export default function galleryApi() {
  return {
    name: 'blob-gallery-api',
    hooks: {
      'astro:server:setup': ({ server }) => {
        server.middlewares.use(async (req, res, next) => {
          const path = req.url?.split('?')[0];
          const handler = path?.startsWith('/api/media/') ? handleMediaRequest : ['/api/images', '/api/images/'].includes(path) ? handleGalleryRequest : null;
          if (!handler) return next();
          try {
            const response = await handler(new Request(`http://localhost${req.url}`, { method: req.method || 'GET' }));
            res.writeHead(response.status, Object.fromEntries(response.headers));
            if (response.body) {
              const stream = Readable.fromWeb(response.body);
              stream.on('error', () => res.destroy());
              res.on('close', () => stream.destroy());
              stream.pipe(res);
            } else res.end();
          } catch { res.writeHead(500); res.end('Unable to load the gallery.'); }
        });
      },
    },
  };
}
