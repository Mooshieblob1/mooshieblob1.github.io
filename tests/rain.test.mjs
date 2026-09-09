import test from 'node:test';
import assert from 'node:assert/strict';
import { firstSurfaceHit } from '../src/lib/rain-collision.mjs';

const silhouette = { left: 100, top: 100, width: 30, height: 30, maskWidth: 3, maskHeight: 3,
  mask: new Uint8Array([0, 255, 0, 0, 255, 0, 255, 255, 255]) };

test('rain passes through transparent margins and hits the actual silhouette', () => {
  assert.equal(firstSurfaceHit([silhouette], 102, 90, 102, 115), null);
  assert.deepEqual(firstSurfaceHit([silhouette], 115, 90, 115, 125), { x: 115, y: 100 });
});
test('a fast drop cannot skip a thin surface between frames', () => {
  const thin = { ...silhouette, mask: new Uint8Array([0, 255, 0, 0, 0, 0, 0, 0, 0]) };
  assert.deepEqual(firstSurfaceHit([thin], 115, 70, 115, 150), { x: 115, y: 100 });
});
test('collision coordinates follow resized artwork and ignore hidden targets', () => {
  const resized = { ...silhouette, left: 0, top: 200, width: 60, height: 60 };
  assert.deepEqual(firstSurfaceHit([resized], 30, 190, 30, 240), { x: 30, y: 200 });
  assert.equal(firstSurfaceHit([{ ...resized, width: 0 }], 30, 190, 30, 240), null);
});
test('the nearest surface wins regardless of element order', () => {
  const lower = { ...silhouette, top: 200 };
  assert.deepEqual(firstSurfaceHit([lower, silhouette], 115, 80, 115, 250), { x: 115, y: 100 });
});
