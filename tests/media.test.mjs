import test from 'node:test';
import assert from 'node:assert/strict';
import { handleMediaRequest } from '../server/media-api.mjs';
import { normalizePost } from '../src/lib/gallery.mjs';

const hash = 'b9a3dbf3505097135da1bbf68d6a75a9';
const path = `/720x720/b9/a3/${hash}.webp`;
const origin = 'https://cdn.aibooru.download';
const request = (suffix = path, options) => new Request(`https://blob.example/api/media${suffix}`, options);
const png = Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a0AAAAABJRU5ErkJggg==', 'base64'));

test('all thumbnail and modal candidates use same-origin media delivery', () => {
  const post = normalizePost({ id: 176191, file_url: `${origin}/original/b9/a3/${hash}.png`,
    large_file_url: `${origin}/sample/b9/a3/sample-${hash}.jpg`,
    media_asset: { variants: [{ type: '720x720', width: 720, url: origin + path }] } });
  assert.equal(post.thumbnailUrls[0], '/api/media' + path);
  assert.equal(post.fullUrls[0], `/api/media/original/b9/a3/${hash}.png`);
  assert.ok([...post.thumbnailUrls, ...post.fullUrls].every(url => url.startsWith('/api/media/')));
  assert.equal(post.postUrl, 'https://aibooru.online/posts/176191');
});

test('media route streams verified bytes even with a generic upstream MIME type', async () => {
  const response = await handleMediaRequest(request(path, { headers: { Cookie: 'private', Authorization: 'secret' } }), {
    fetcher: async (url, options) => {
      assert.equal(url, origin + path);
      assert.equal(options.redirect, 'manual');
      assert.equal(options.headers.Cookie, undefined);
      assert.equal(options.headers.Authorization, undefined);
      assert.equal(options.headers.Referer, undefined);
      return new Response(new ReadableStream({ start(controller) {
        controller.enqueue(png.slice(0, 3)); controller.enqueue(png.slice(3, 15));
        controller.enqueue(png.slice(15)); controller.close();
      } }), { headers: { 'Content-Type': 'application/octet-stream', 'Set-Cookie': 'upstream' } });
    },
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'image/png');
  assert.equal(response.headers.get('set-cookie'), null);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.deepEqual(new Uint8Array(await response.arrayBuffer()), png);
});

test('HTML errors, forged image MIME types and redirects never become cached images', async () => {
  for (const upstream of [
    new Response('<html>Unavailable</html>', { status: 403 }),
    new Response('<html>Unavailable</html>', { headers: { 'Content-Type': 'image/webp' } }),
    new Response(null, { status: 302, headers: { Location: 'https://untrusted.example/' } }),
  ]) {
    const response = await handleMediaRequest(request(), {
      fetcher: async () => upstream,
      cache: { match: async () => null, put: () => assert.fail('Invalid image was cached') },
      context: { waitUntil: () => assert.fail('Invalid image was cached') },
    });
    assert.equal(response.status, 502);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.match(response.headers.get('content-type'), /application\/json/);
  }
});

test('visitor-supplied destinations and invalid paths cannot trigger upstream requests', async () => {
  const fetcher = () => assert.fail('Invalid target was fetched');
  for (const suffix of [
    '?url=https://untrusted.example/image.png', path + '?url=https://untrusted.example',
    '//untrusted.example/image.png', '/original/00/00/' + hash + '.png',
    '/720x720/b9/a3/' + hash + '.svg', '/%2e%2e/secrets.png',
  ]) assert.equal((await handleMediaRequest(request(suffix), { fetcher })).status, 400);
  assert.equal((await handleMediaRequest(request(path, { method: 'POST' }), { fetcher })).status, 405);
});

test('verified images are cached and HEAD can reuse them without a CDN request', async () => {
  const pending = [];
  let saved;
  const cache = { match: async () => saved?.clone(), put: async (key, value) => {
    assert.equal(key.url, 'https://blob.example/api/media' + path);
    saved = new Response(await value.arrayBuffer(), value);
  } };
  const response = await handleMediaRequest(request(), {
    fetcher: async () => new Response(png), cache, context: { waitUntil: promise => pending.push(promise) },
  });
  await response.arrayBuffer();
  await Promise.all(pending);
  const head = await handleMediaRequest(request(path, { method: 'HEAD' }), {
    cache, fetcher: () => assert.fail('Cache hit fetched upstream'),
  });
  assert.equal(head.status, 200);
  assert.equal(head.headers.get('content-type'), 'image/png');
  assert.equal(await head.text(), '');
});
