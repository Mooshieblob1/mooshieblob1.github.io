<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { loadGallery } from '../lib/gallery.mjs';
interface GalleryImage {
  id: number; width: number; height: number;
  thumbnailUrls: string[]; fullUrls: string[]; alt: string; postUrl: string;
}
const images = ref<GalleryImage[]>([]);
const loading = ref(true);
const error = ref('');
const attempts = ref<Record<number, number>>({});
const selectedIndex = ref(-1);
const selectedImage = computed(() => images.value[selectedIndex.value] || null);
const dialog = ref<HTMLDialogElement | null>(null);
const fullAttempt = ref(0);
const fullLoaded = ref(false);
let controller: AbortController | null = null;
let active = true;
let previousFocus: HTMLElement | null = null;
let previousOverflow = '';

async function fetchImages() {
  controller?.abort();
  const request = new AbortController();
  controller = request;
  const timeout = window.setTimeout(() => request.abort(), 15000);
  loading.value = true;
  error.value = '';
  try {
    const result = await loadGallery({ signal: request.signal });
    if (active && controller === request) { images.value = result; attempts.value = {}; }
  } catch (reason) {
    if (active && controller === request) {
      error.value = request.signal.aborted ? 'The image feed took too long to respond. Please try again.' :
        reason instanceof TypeError ? 'The image feed could not be reached. Please try again shortly.' :
        reason instanceof Error ? reason.message : 'The gallery could not be loaded.';
    }
  } finally {
    window.clearTimeout(timeout);
    if (active && controller === request) loading.value = false;
  }
}
async function openImage(index: number) {
  previousFocus = document.activeElement as HTMLElement;
  previousOverflow = document.body.style.overflow;
  selectImage(index);
  await nextTick();
  dialog.value?.showModal();
  document.body.style.overflow = 'hidden';
}
function selectImage(index: number) {
  if (index < 0 || index >= images.value.length) return;
  selectedIndex.value = index;
  fullAttempt.value = 0;
  fullLoaded.value = false;
}
function closeImage() { dialog.value?.close(); }
function onClose() {
  selectedIndex.value = -1;
  document.body.style.overflow = previousOverflow;
  if (previousFocus?.isConnected) previousFocus.focus();
}
function onKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowLeft') { event.preventDefault(); selectImage(selectedIndex.value - 1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); selectImage(selectedIndex.value + 1); }
}
onMounted(fetchImages);
onUnmounted(() => {
  active = false;
  controller?.abort();
  if (selectedIndex.value !== -1) document.body.style.overflow = previousOverflow;
  dialog.value?.close();
});
</script>

<template>
  <section class="gallery" aria-label="Blob's image gallery" :aria-busy="loading">
    <div v-if="loading" class="gallery-state" role="status">
      <span class="gallery-spinner" aria-hidden="true"></span><p>Loading the collection…</p>
    </div>
    <div v-else-if="error" class="gallery-state" role="alert">
      <span class="state-symbol" aria-hidden="true">!</span>
      <h2>The gallery is taking a rain check.</h2><p>{{ error }}</p>
      <button class="button primary" @click="fetchImages">Try again</button>
    </div>
    <div v-else-if="!images.length" class="gallery-state">
      <h2>No images here just yet.</h2><p>Check back for more from Blob.</p>
      <button class="button secondary" @click="fetchImages">Refresh gallery</button>
    </div>
    <template v-else>
      <div class="gallery-meta"><span>{{ images.length }} images</span><span>Click an image to take a closer look</span></div>
      <div class="image-grid">
        <button v-for="(item, index) in images" :key="item.id" type="button" class="image-item"
          :style="{ aspectRatio: `${item.width} / ${item.height}` }" :aria-label="`View ${item.alt}`" @click="openImage(index)">
          <img v-if="(attempts[item.id] || 0) < item.thumbnailUrls.length" :key="item.thumbnailUrls[attempts[item.id] || 0]"
            :src="item.thumbnailUrls[attempts[item.id] || 0]" :alt="item.alt" :width="item.width" :height="item.height"
            loading="lazy" decoding="async" referrerpolicy="no-referrer" @error="attempts[item.id] = (attempts[item.id] || 0) + 1" />
          <span v-else class="image-unavailable">Preview unavailable<br /><small>Open image details</small></span>
          <span class="image-caption"><span>#{{ item.id }}</span><span aria-hidden="true">↗</span></span>
        </button>
      </div>
    </template>
    <dialog ref="dialog" class="image-dialog" aria-label="Enlarged image" @close="onClose" @click.self="closeImage" @keydown="onKeydown">
      <div v-if="selectedImage" class="viewer">
        <div class="viewer-toolbar">
          <span>{{ selectedIndex + 1 }} / {{ images.length }}</span>
          <a :href="selectedImage.postUrl" target="_blank" rel="noopener noreferrer">View on AIbooru ↗</a>
          <button class="icon-button" type="button" aria-label="Close image" autofocus @click="closeImage">×</button>
        </div>
        <div class="viewer-image">
          <img v-if="fullAttempt < selectedImage.fullUrls.length" :key="`${selectedImage.id}-${fullAttempt}`"
            :src="selectedImage.fullUrls[fullAttempt]" :alt="selectedImage.alt" referrerpolicy="no-referrer"
            @load="fullLoaded = true" @error="fullAttempt++; fullLoaded = false" />
          <span v-if="!fullLoaded && fullAttempt < selectedImage.fullUrls.length" class="viewer-loading" role="status">Loading image…</span>
          <div v-if="fullAttempt >= selectedImage.fullUrls.length" class="viewer-error" role="status">
            <p>This image couldn’t be loaded.</p><a :href="selectedImage.postUrl" target="_blank" rel="noopener noreferrer">Open the original post ↗</a>
          </div>
        </div>
        <div class="viewer-navigation">
          <button class="button secondary" :disabled="selectedIndex === 0" @click="selectImage(selectedIndex - 1)">← Previous</button>
          <span class="viewer-hint">← → to browse · Esc to close</span>
          <button class="button secondary" :disabled="selectedIndex === images.length - 1" @click="selectImage(selectedIndex + 1)">Next →</button>
        </div>
      </div>
    </dialog>
  </section>
</template>

<style scoped>
.gallery-state { min-height: 380px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px; text-align: center; padding: 32px 20px; border: 1px dashed var(--border, #2a3044); border-radius: 18px; }
.gallery-state h2 { font-size: 1.5rem; color: var(--text, white); }
.gallery-state p { color: var(--muted, #b4bdd3); max-width: 540px; }
.gallery-spinner { width: 32px; height: 32px; border: 2px solid #ffffff26; border-top-color: var(--yellow, #ffcc00); border-radius: 50%; animation: spin .8s linear infinite; }
.state-symbol { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; color: var(--yellow, #ffcc00); border: 1px solid currentColor; font-size: 1.4rem; }
.gallery-meta { display: flex; justify-content: space-between; gap: 16px; color: var(--muted, #b4bdd3); font-size: .875rem; margin-bottom: 22px; }
.image-grid { columns: 4; column-gap: 16px; }
.image-item { display: block; width: 100%; break-inside: avoid; overflow: hidden; position: relative; margin: 0 0 16px; padding: 0; border: 0; border-radius: 10px; background: var(--surface, #111b31); cursor: pointer; }
.image-item img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform .3s ease; }
.image-item:hover img { transform: scale(1.025); }
.image-caption { position: absolute; display: flex; justify-content: space-between; align-items: end; inset: auto 0 0; padding: 34px 16px 14px; color: #fff; font-size: .875rem; background: linear-gradient(transparent, #000b); opacity: 0; transition: opacity .2s; }
.image-item:hover .image-caption, .image-item:focus-visible .image-caption { opacity: 1; }
.image-unavailable { display: grid; align-content: center; min-height: 160px; height: 100%; padding: 20px; color: var(--muted, #b4bdd3); font-size: 1rem; }
.image-unavailable small { font-size: .875rem; margin-top: 8px; color: var(--yellow, #ffcc00); }
.image-dialog { position: fixed; inset: 0; width: min(1200px, calc(100vw - 40px)); max-width: none; max-height: calc(100dvh - 40px); padding: 0; margin: auto; border: 1px solid #ffffff26; border-radius: 18px; background: #0c1223; color: #f7f8fc; overflow: auto; }
.image-dialog::backdrop { background: #030714d9; backdrop-filter: blur(8px); }
.viewer { padding: 16px 22px; }
.viewer-toolbar { display: flex; align-items: center; gap: 20px; font-size: .875rem; }
.viewer-toolbar > a { margin-left: auto; color: #ffcc00; }
.icon-button { width: 42px; height: 42px; border-radius: 50%; background: #ffffff10; color: white; border: 1px solid #ffffff20; font-size: 1.75rem; cursor: pointer; }
.viewer-image { position: relative; min-height: 150px; display: grid; place-items: center; margin: 16px 0; }
.viewer-image img { display: block; width: auto; max-width: 100%; height: auto; max-height: calc(100dvh - 235px); object-fit: contain; }
.viewer-loading { position: absolute; background: #0c1223; padding: 10px 20px; border-radius: 8px; }
.viewer-error { padding: 50px 20px; text-align: center; }
.viewer-error a { display: inline-block; margin-top: 16px; color: #ffcc00; }
.viewer-navigation { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
.viewer-hint { color: #acb6cb; font-size: .875rem; }
@keyframes spin { to { transform: rotate(360deg); } }
@media(max-width: 1000px) { .image-grid { columns: 3; } }
@media(max-width: 650px) { .image-grid { columns: 2; column-gap: 10px; } .image-item { margin-bottom: 10px; } .gallery-meta span:last-child, .viewer-hint { display: none; } .viewer { padding: 12px; } .image-dialog { width: calc(100vw - 16px); } }
@media(prefers-reduced-motion: reduce) { .gallery-spinner { animation: none; } .image-item img, .image-caption { transition: none; } }
</style>
