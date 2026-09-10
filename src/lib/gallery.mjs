import { mediaSource } from './media.mjs';
export const GALLERY_ENDPOINT = '/api/images?rating=g';
const imageExtensions = new Set(['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif']);
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const dimension = value => Number.isFinite(Number(value)) && Number(value) > 0 ? Number(value) : 0;

function imageUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value, 'https://aibooru.online');
    if (!['https:', 'http:'].includes(url.protocol)) return null;
    url.protocol = 'https:';
    if (['mp4', 'webm', 'zip', 'swf'].includes(url.pathname.split('.').pop()?.toLowerCase())) return null;
    return mediaSource(url) ? url.href : null;
  } catch { return null; }
}
const uniqueUrls = values => [...new Set(values.map(imageUrl).filter(Boolean))];

// AIbooru's optional variants are not ordered or guaranteed to have four entries.
export function normalizePost(post) {
  if (!isRecord(post) || post.rating !== 'g' || !Number.isSafeInteger(Number(post.id)) || Number(post.id) <= 0 || post.is_deleted === true) return null;
  const asset = isRecord(post.media_asset) ? post.media_asset : {};
  const variants = (Array.isArray(asset.variants) ? asset.variants : [])
    .filter(v => isRecord(v) && imageUrl(v.url) && (!v.file_ext || imageExtensions.has(String(v.file_ext).toLowerCase())))
    .sort((a, b) => dimension(a.width) - dimension(b.width));
  const samples = variants.filter(v => v.type !== 'original');
  const thumbnail = samples.find(v => dimension(v.width) >= 500) || samples.at(-1);
  const originals = variants.filter(v => v.type === 'original');
  const fullUrls = uniqueUrls([post.file_url, ...originals.map(v => v.url), post.large_file_url, ...[...variants].reverse().map(v => v.url), post.preview_file_url]);
  const thumbnailUrls = uniqueUrls([thumbnail?.url, post.large_file_url, post.preview_file_url, ...[...samples].reverse().map(v => v.url), ...fullUrls]);
  if (!thumbnailUrls.length || !fullUrls.length) return null;
  const largest = variants.at(-1);
  const width = dimension(post.image_width) || dimension(asset.image_width) || dimension(asset.width) || dimension(largest?.width) || 1;
  const height = dimension(post.image_height) || dimension(asset.image_height) || dimension(asset.height) || dimension(largest?.height) || 1;
  const tags = typeof post.tag_string === 'string' ? post.tag_string : '';
  const characters = typeof post.tag_string_character === 'string' ? post.tag_string_character : '';
  const caption = (characters || tags).split(' ').filter(Boolean).slice(0, 8).join(', ').replaceAll('_', ' ');
  return { id: Number(post.id), width, height, thumbnailUrls: thumbnailUrls.map(url => mediaSource(new URL(url))), fullUrls: fullUrls.map(url => mediaSource(new URL(url))), alt: caption || `AIbooru image ${post.id}`, postUrl: `https://aibooru.online/posts/${Number(post.id)}` };
}

export function normalizeGallery(payload) {
  const posts = Array.isArray(payload) ? payload : isRecord(payload) && Array.isArray(payload.posts) ? payload.posts : isRecord(payload) && Array.isArray(payload.data) ? payload.data : null;
  if (!posts) throw new Error('The gallery returned an unexpected response.');
  const safePosts = posts.filter(post => isRecord(post) && post.rating === 'g');
  const seen = new Set();
  const images = safePosts.map(normalizePost).filter(image => {
    if (!image || seen.has(image.id)) return false;
    seen.add(image.id);
    return true;
  });
  if (safePosts.length && !images.length) throw new Error('The gallery did not return any viewable images.');
  return images;
}

export async function loadGallery({ fetcher = fetch, signal, endpoint = GALLERY_ENDPOINT } = {}) {
  const response = await fetcher(endpoint, { signal, headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`The image feed is unavailable (${response.status}). Please try again shortly.`);
  let payload;
  try { payload = await response.json(); }
  catch { throw new Error('The image feed returned an unreadable response. Please try again shortly.'); }
  return normalizeGallery(payload);
}
