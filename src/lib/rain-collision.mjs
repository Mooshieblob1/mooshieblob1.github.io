/** First opaque pixel crossed by a moving drop, in scene-local CSS coordinates. */
export function firstSurfaceHit(targets, x0, y0, x1, y1) {
  const distance = Math.hypot(x1 - x0, y1 - y0);
  // Sample the swept path so fast drops cannot tunnel through ears or thin edges.
  const steps = Math.max(1, Math.ceil(distance));
  for (let step = 0; step <= steps; step++) {
    const t = step / steps;
    const x = x0 + (x1 - x0) * t;
    const y = y0 + (y1 - y0) * t;
    for (const target of targets) {
      const { left, top, width, height, mask, maskWidth, maskHeight } = target;
      if (width <= 0 || height <= 0 || x < left || y < top || x >= left + width || y >= top + height) continue;
      const ix = Math.floor((x - left) / width * maskWidth);
      const iy = Math.floor((y - top) / height * maskHeight);
      if (mask[iy * maskWidth + ix] > 128) return { x, y };
    }
  }
  return null;
}
