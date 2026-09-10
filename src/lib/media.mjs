export const MEDIA_ORIGIN = 'https://cdn.aibooru.download';
export const MEDIA_PREFIX = '/api/media';

// Only AIbooru's content-addressed raster files are valid proxy targets.
export function validMediaPath(path) {
  const match = /^\/(?:original|sample|\d{2,4}x\d{2,4})\/([a-f0-9]{2})\/([a-f0-9]{2})\/(?:sample-)?([a-f0-9]{32})\.(?:jpg|jpeg|png|webp|avif|gif)$/.exec(path);
  return Boolean(match && match[3].startsWith(match[1] + match[2]));
}

export function mediaSource(url) {
  if (url.origin !== MEDIA_ORIGIN) return url.href;
  if (url.username || url.password || url.search || url.hash || !validMediaPath(url.pathname)) return null;
  return MEDIA_PREFIX + url.pathname;
}
