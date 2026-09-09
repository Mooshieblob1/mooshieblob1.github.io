import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorker } from '../server/worker.mjs';
const assets = { '/index.html': { type: 'text/html', body: btoa('<h1>Blob</h1>') }, '/images/index.html': { type: 'text/html', body: btoa('<h1>Images</h1>') } };
const worker = createWorker(assets, { 'X-Content-Type-Options': 'nosniff' });

test('Worker preserves root and separate route links with or without trailing slashes', async () => {
  for (const path of ['/', '/index.html', '/images', '/images/']) {
    const response = await worker.fetch(new Request(`https://blob.example${path}`));
    assert.equal(response.status, 200, path);
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.match(await response.text(), /<h1>/);
  }
});
test('HEAD, unknown paths and unsupported methods have correct behavior', async () => {
  assert.equal(await (await worker.fetch(new Request('https://blob.example/', { method: 'HEAD' }))).text(), '');
  assert.equal((await worker.fetch(new Request('https://blob.example/missing'))).status, 404);
  assert.equal((await worker.fetch(new Request('https://blob.example/', { method: 'POST' }))).status, 405);
});
