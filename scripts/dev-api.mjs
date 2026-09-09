import { handleGalleryRequest } from '../server/gallery-api.mjs';

export default function galleryApi() {
  return {
    name: 'blob-gallery-api',
    hooks: {
      'astro:server:setup': ({ server }) => {
        server.middlewares.use(async (req, res, next) => {
          const path = req.url?.split('?')[0];
          if (!['/api/images', '/api/images/'].includes(path)) return next();
          try {
            const response = await handleGalleryRequest(new Request('http://localhost/api/images', { method: req.method || 'GET' }));
            res.writeHead(response.status, Object.fromEntries(response.headers));
            res.end(Buffer.from(await response.arrayBuffer()));
          } catch { res.writeHead(500); res.end('Unable to load the gallery.'); }
        });
      },
    },
  };
}
