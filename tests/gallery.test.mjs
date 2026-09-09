import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePost, normalizeGallery, loadGallery } from '../src/lib/gallery.mjs';

test('classic fields work without media_asset', () => {
  const image = normalizePost({ id: 1, file_url: '/original.png', large_file_url: '/sample.jpg', image_width: 800, image_height: 1200 });
  assert.equal(image.thumbnailUrls[0], 'https://aibooru.online/sample.jpg');
  assert.equal(image.fullUrls[0], 'https://aibooru.online/original.png');
  assert.equal(image.width / image.height, 2 / 3);
});
test('variants are selected by size and type, independent of array order', () => {
  const variants = [{ type: 'original', width: 2000, height: 3000, url: '/original.png' }, { type: '720x720', width: 720, height: 1080, url: '/720.webp' }, { type: '180x180', width: 180, height: 270, url: '/180.webp' }];
  const image = normalizePost({ id: 2, media_asset: { variants } });
  assert.equal(image.thumbnailUrls[0], 'https://aibooru.online/720.webp');
  assert.equal(image.fullUrls[0], 'https://aibooru.online/original.png');
  assert.equal(image.height, 3000);
  assert.deepEqual(image, normalizePost({ id: 2, media_asset: { variants: variants.toReversed() } }));
});
test('a single variant is sufficient for both views', () => {
  const image = normalizePost({ id: 3, media_asset: { variants: [{ url: '/only.webp', width: 300, height: 400 }] } });
  assert.equal(image.thumbnailUrls[0], image.fullUrls[0]);
});
test('malformed/deleted records and unsupported media do not break the feed', () => {
  const post = { id: 1, file_url: '/image.png' };
  const bad = [null, {}, { id: 2, file_url: 'javascript:alert(1)' }, { id: 3, file_url: '/movie.webm' }, { ...post, id: 4, is_deleted: true }];
  assert.equal(normalizeGallery([...bad, post, post]).length, 1);
  assert.deepEqual(normalizeGallery({ posts: [post] }), normalizeGallery({ data: [post] }));
  assert.deepEqual(normalizeGallery([]), []);
  assert.throws(() => normalizeGallery({ error: 'upstream failed' }), /unexpected response/);
  assert.throws(() => normalizeGallery(bad), /viewable images/);
});
test('HTTP failures and non-JSON pages produce useful errors', async () => {
  await assert.rejects(loadGallery({ fetcher: async () => new Response('Forbidden', { status: 403 }) }), /403/);
  await assert.rejects(loadGallery({ fetcher: async () => new Response('<html>Challenge</html>') }), /unreadable/);
  const result = await loadGallery({ fetcher: async () => Response.json([{ id: 9, preview_file_url: '/preview.jpg' }]) });
  assert.equal(result.length, 1);
});

test('same-origin API uses the fixed artist query and handles unavailable upstream', async () => {
  const { handleGalleryRequest, UPSTREAM_URL } = await import('../server/gallery-api.mjs');
  const request = new Request('https://blob.example/api/images?url=https://untrusted.example');
  const result = await handleGalleryRequest(request, { fetcher: async url => {
    assert.equal(url, UPSTREAM_URL);
    return Response.json([{ id: 10, file_url: 'https://cdn.aibooru.download/a.png' }]);
  } });
  assert.equal(result.status, 200);
  assert.equal((await result.json())[0].id, 10);
  const error = await handleGalleryRequest(request, { fetcher: async () => new Response('Offline', { status: 503 }) });
  assert.equal(error.status, 502);
  assert.equal(error.headers.get('cache-control'), 'no-store');
  const invalid = await handleGalleryRequest(request, { fetcher: async () => Response.json({ unexpected: true }) });
  assert.equal(invalid.status, 502);
  const disallowed = await handleGalleryRequest(new Request(request, { method: 'POST' }));
  assert.equal(disallowed.status, 405);
});
