import { handleGalleryRequest } from './gallery-api.mjs';
import { handleMediaRequest } from './media-api.mjs';

export function createWorker(assets, securityHeaders = {}) {
  return {
    async fetch(request, env, context) {
      const url = new URL(request.url);
      if (url.pathname === '/api/images' || url.pathname === '/api/images/') {
        return handleGalleryRequest(request, { cache: globalThis.caches?.default, context });
      }
      if (url.pathname.startsWith('/api/media/')) {
        return handleMediaRequest(request, { cache: globalThis.caches?.default, context });
      }
      if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
      let path;
      try { path = decodeURIComponent(url.pathname); } catch { return new Response('Invalid path', { status: 400 }); }
      const asset = assets[path] || assets[path.replace(/\/$/, '') + '/index.html'];
      if (!asset) return new Response('Page not found', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8', ...securityHeaders } });
      const headers = { ...securityHeaders, 'Content-Type': asset.type, 'Cache-Control': path.startsWith('/_astro/') ? 'public, max-age=31536000, immutable' : 'public, max-age=300' };
      if (request.method === 'HEAD') return new Response(null, { headers });
      const bytes = Uint8Array.from(atob(asset.body), c => c.charCodeAt(0));
      return new Response(bytes, { headers });
    },
  };
}
