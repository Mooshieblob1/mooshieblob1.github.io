// This artist tag is also present in the original gallery's AIbooru image URLs.
export const UPSTREAM_URL = 'https://aibooru.online/posts.json?tags=blob_%28artist%29+rating%3Ag&limit=100';
const json = (body, status = 200, headers = {}) => Response.json(body, { status, headers: { 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store', ...headers } });

/** A fixed upstream prevents this endpoint from becoming an open proxy. */
export async function handleGalleryRequest(request, { fetcher = fetch, cache, context } = {}) {
  if (!['GET', 'HEAD'].includes(request.method)) return json({ error: 'Method not allowed.' }, 405, { Allow: 'GET, HEAD' });
  // Keep the General-only feed separate from previously cached mixed ratings.
  const key = new Request(new URL('/api/images?rating=general-v1', request.url), { method: 'GET' });
  const cached = cache ? await cache.match(key) : null;
  if (cached) return request.method === 'HEAD' ? new Response(null, cached) : cached;
  try {
    const response = await fetcher(UPSTREAM_URL, {
      headers: { Accept: 'application/json', 'User-Agent': 'MooshieblobGallery/1.0 (https://mooshieblob.com)' },
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) return json({ error: 'AIbooru is temporarily unavailable. Please try again shortly.' }, 502);
    const payload = await response.json();
    if (!Array.isArray(payload)) return json({ error: 'AIbooru returned an unexpected response.' }, 502);
    const result = json(payload.filter(post => post?.rating === 'g'), 200, { 'Cache-Control': 'public, max-age=300, s-maxage=300' });
    if (cache && context) context.waitUntil(cache.put(key, result.clone()).catch(() => {}));
    return request.method === 'HEAD' ? new Response(null, result) : result;
  } catch {
    return json({ error: 'AIbooru could not be reached. Please try again shortly.' }, 502);
  }
}
