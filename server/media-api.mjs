import { MEDIA_ORIGIN, MEDIA_PREFIX, validMediaPath } from '../src/lib/media.mjs';

const mediaError = (message, status, headers = {}) => Response.json({ error: message }, {
  status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers },
});

function rasterType(bytes) {
  const starts = values => values.every((value, index) => bytes[index] === value);
  const ascii = (start, end) => String.fromCharCode(...bytes.slice(start, end));
  if (starts([137, 80, 78, 71, 13, 10, 26, 10])) return 'image/png';
  if (starts([255, 216, 255])) return 'image/jpeg';
  if (['GIF87a', 'GIF89a'].includes(ascii(0, 6))) return 'image/gif';
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'image/webp';
  if (ascii(4, 8) === 'ftyp' && ['avif', 'avis'].includes(ascii(8, 12))) return 'image/avif';
  return null;
}

// Read only a short prefix; large originals continue streaming without buffering.
async function inspectRaster(body) {
  const reader = body.getReader();
  const chunks = [];
  const prefix = new Uint8Array(32);
  let length = 0;
  try {
    while (length < prefix.length) {
      const { value, done } = await reader.read();
      if (done) break;
      chunks.push(value);
      const part = value.subarray(0, prefix.length - length);
      prefix.set(part, length);
      length += part.length;
    }
    const type = rasterType(prefix.subarray(0, length));
    if (!type) { await reader.cancel(); return null; }
    const stream = new ReadableStream({
      start(controller) { for (const chunk of chunks) controller.enqueue(chunk); },
      async pull(controller) {
        try {
          const { value, done } = await reader.read();
          if (done) controller.close(); else controller.enqueue(value);
        } catch (error) { controller.error(error); }
      },
      cancel(reason) { return reader.cancel(reason); },
    });
    return { type, stream };
  } catch (error) { await reader.cancel().catch(() => {}); throw error; }
}

export async function handleMediaRequest(request, { fetcher = fetch, cache, context } = {}) {
  if (!['GET', 'HEAD'].includes(request.method)) return mediaError('Method not allowed.', 405, { Allow: 'GET, HEAD' });
  const url = new URL(request.url);
  const path = url.pathname.slice(MEDIA_PREFIX.length);
  if (!url.pathname.startsWith(MEDIA_PREFIX + '/') || url.search || !validMediaPath(path)) return mediaError('Invalid image path.', 400);
  const key = new Request(url.origin + MEDIA_PREFIX + path);
  const cached = cache ? await cache.match(key) : null;
  if (cached) return request.method === 'HEAD' ? new Response(null, cached) : cached;
  try {
    const upstream = await fetcher(MEDIA_ORIGIN + path, {
      headers: { Accept: 'image/avif,image/webp,image/png,image/jpeg,image/gif', 'User-Agent': 'MooshieblobGallery/1.0 (https://mooshieblob.com)' },
      redirect: 'error', signal: AbortSignal.timeout(30000),
    });
    if (!upstream.ok || !upstream.body) {
      await upstream.body?.cancel();
      console.warn('Gallery media upstream failed:', upstream.status);
      return mediaError('The image host is temporarily unavailable.', 502);
    }
    // A CDN error/challenge page must never be served or cached as an image.
    // Detect actual bytes so a valid image with a generic MIME type still works.
    const image = await inspectRaster(upstream.body);
    if (!image) {
      console.warn('Gallery media upstream returned a non-image:', upstream.headers.get('Content-Type'));
      return mediaError('The image host returned an invalid image.', 502);
    }
    const headers = {
      'Content-Type': image.type, 'X-Content-Type-Options': 'nosniff',
      'Cross-Origin-Resource-Policy': 'same-origin',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    };
    if (request.method === 'HEAD') { await image.stream.cancel(); return new Response(null, { headers }); }
    const response = new Response(image.stream, { headers });
    if (cache && context) context.waitUntil(cache.put(key, response.clone()).catch(() => {}));
    return response;
  } catch (error) {
    console.warn('Gallery media request failed:', error.name);
    return mediaError('The image host could not be reached.', 502);
  }
}
