<template>
  <div>
    <!-- Loading Spinner for initial load -->
    <div v-if="isLoading" class="flex h-64 items-center justify-center" role="status" aria-live="polite">
      <div class="spinner" aria-hidden="true"></div>
      <span class="sr-only">Loading images...</span>
    </div>

    <div v-else ref="gridRef" class="image-grid">
      <div
        v-for="(col, colIdx) in columns"
        :key="colIdx"
        class="masonry-column"
      >
        <div
          v-for="item in col"
          :key="item.image.id"
          class="image-item"
          role="button"
          tabindex="0"
          :aria-label="`View image: ${item.image.tag_string || 'gallery image'}`"
          @click="(e) => openImage(item.image, e)"
          @keydown.enter="(e) => openImage(item.image, e)"
          @keydown.space.prevent="(e) => openImage(item.image, e)"
          @pointerenter="preloadFullImage(item.image)"
        >
          <div
            :ref="(el) => setImageRef(item.index, el)"
            :data-index="item.index"
            class="image-cell relative overflow-hidden rounded-[4px]"
            :class="{
              'is-visible': imageInView[item.index],
              'from-below': !imageInView[item.index] && imageDirection[item.index] === 'below',
              'from-above': !imageInView[item.index] && imageDirection[item.index] === 'above',
            }"
            :style="{
              transitionDelay: `${(item.index % 4) * 60}ms`,
              aspectRatio: getAspectRatio(item.image),
            }"
          >
            <img
              v-if="shouldLoadImage[item.index]"
              :src="item.image.media_asset.variants[1].url"
              :alt="item.image.tag_string || 'Image from gallery'"
              loading="lazy"
              class="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
              :class="{ 'opacity-100': loadedImages[item.index], 'opacity-0': !loadedImages[item.index] }"
              @load="onImageLoad(item.index)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Bokeh backdrop (fades in/out independently of modal content) -->
    <Teleport to="body">
      <div
        v-if="overlayVisible"
        ref="overlayRef"
        class="image-backdrop"
        @click="closeImage"
      ></div>
    </Teleport>

    <!-- Modal content (shown after open animation finishes) -->
    <Teleport to="body">
      <div
        v-if="selectedImage"
        class="image-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Enlarged image view"
        @click.self="closeImage"
        @keydown="handleModalKeyDown"
        tabindex="0"
      >
        <!-- Close button for accessibility -->
        <button
          @click="closeImage"
          aria-label="Close enlarged image"
          class="absolute top-4 right-4 bg-[#fbc21b] text-[#02061a] w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#ffd966] transition-colors focus:outline-none focus:ring-2 focus:ring-[#fbc21b]"
        >
          <span aria-hidden="true" class="text-2xl font-bold">&times;</span>
        </button>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { animate } from 'motion';

interface ImageVariant {
  url: string;
  width: number;
  height: number;
  file_ext: string;
  type: string;
}

interface MediaAsset {
  variants: ImageVariant[];
}

interface GalleryImage {
  id: number;
  tag_string?: string;
  image_width?: number;
  image_height?: number;
  large_file_url?: string;
  file_url?: string;
  media_asset: MediaAsset;
}

const images = ref<GalleryImage[]>([]);
const selectedImage = ref<GalleryImage | null>(null);
const loadedImages = ref<boolean[]>([]);
const shouldLoadImage = ref<boolean[]>([]);
const imageInView = ref<boolean[]>([]);
const imageDirection = ref<string[]>([]);
const imageRefs = ref<Record<number, Element | null>>({});
const isLoading = ref(true);
const hiddenIndex = ref<number | null>(null);
const gridRef = ref<HTMLElement | null>(null);
const overlayVisible = ref(false);
const overlayRef = ref<HTMLElement | null>(null);
let lastFocusedElement: Element | null = null;
let placeholderClone: HTMLElement | null = null;
let fullSizeLoader: HTMLImageElement | null = null;
let openOriginalRect: DOMRect | null = null; // untransformed rect from open

// --- Masonry layout ---
const GAP = 8;
const columns = ref<{ image: GalleryImage; index: number }[][]>([]);
const isMobile = ref(false);

function getAspectRatio(image: GalleryImage): number {
  if (image.image_width && image.image_height) return image.image_width / image.image_height;
  return 1;
}

function computeLayout() {
  if (!gridRef.value || images.value.length === 0) return;

  const containerWidth = gridRef.value.clientWidth;
  isMobile.value = containerWidth <= 780;

  if (isMobile.value) {
    // Mobile: 2 columns, simple round-robin
    const cols: { image: GalleryImage; index: number }[][] = [[], []];
    images.value.forEach((img, i) => cols[i % 2].push({ image: img, index: i }));
    columns.value = cols;
    return;
  }

  // Determine column count from container width
  const minColWidth = 200;
  const colCount = Math.max(2, Math.min(8, Math.floor((containerWidth + GAP) / (minColWidth + GAP))));
  const colWidth = (containerWidth - (colCount - 1) * GAP) / colCount;

  // Place each image into the shortest column
  const cols: { image: GalleryImage; index: number }[][] = Array.from({ length: colCount }, () => []);
  const colHeights = new Float64Array(colCount);

  for (let i = 0; i < images.value.length; i++) {
    const img = images.value[i];
    const ratio = getAspectRatio(img);
    const itemHeight = colWidth / ratio;

    // Find shortest column
    let shortest = 0;
    for (let c = 1; c < colCount; c++) {
      if (colHeights[c] < colHeights[shortest]) shortest = c;
    }

    cols[shortest].push({ image: img, index: i });
    colHeights[shortest] += itemHeight + GAP;
  }

  columns.value = cols;
}

// Spring with slight overshoot for bouncy settle
const BOUNCE_SPRING = { type: 'spring' as const, stiffness: 300, damping: 22, mass: 1 };

// Preload full-size images on hover — track which are fully cached
const preloadedUrls = new Set<string>();
const cachedUrls = new Set<string>();
function getFullUrl(image: GalleryImage): string {
  return image.media_asset.variants[3]?.url || image.large_file_url || image.file_url || '';
}
function preloadFullImage(image: GalleryImage) {
  const url = getFullUrl(image);
  if (!url || preloadedUrls.has(url)) return;
  preloadedUrls.add(url);
  const img = new Image();
  img.onload = () => { cachedUrls.add(url); };
  img.src = url;
  // Already complete (cached from a previous visit)
  if (img.complete) cachedUrls.add(url);
}

function setImageRef(index: number, el: any) {
  imageRefs.value[index] = el;
}

const fetchImages = async () => {
  isLoading.value = true;
  const url = 'https://nameless-moon-1f3f.kentvuong88-cloudflare.workers.dev/';
  try {
    const response = await fetch(url);
    const data = await response.json();
    images.value = data;
    loadedImages.value = new Array(data.length).fill(false);
    shouldLoadImage.value = new Array(data.length).fill(false);
    imageInView.value = new Array(data.length).fill(false);
    imageDirection.value = new Array(data.length).fill('below');
  } catch (error) {
    console.error('Error fetching images:', error);
  } finally {
    isLoading.value = false;
  }
};

const onImageLoad = (index: number) => {
  loadedImages.value[index] = true;
};

const openImage = (image: GalleryImage, event: Event) => {
  lastFocusedElement = document.activeElement;
  const target = (event.currentTarget as HTMLElement).querySelector('img');
  if (!target) return;
  const rect = target.getBoundingClientRect();

  const clone = target.cloneNode(true) as HTMLElement;
  Object.assign(clone.style, {
    position: 'fixed',
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    zIndex: '2147483647',
    borderRadius: '4px',
    margin: '0',
    pointerEvents: 'none',
    transform: 'none',
    willChange: 'transform',
    transformOrigin: 'center center',
  });

  document.body.appendChild(clone);
  openOriginalRect = rect;

  const index = images.value.findIndex((img) => img.id === image.id);
  hiddenIndex.value = index;

  const original = imageRefs.value[index]?.querySelector('img');
  if (original) (original as HTMLElement).style.visibility = 'hidden';

  // Fade in bokeh backdrop during the animation
  overlayVisible.value = true;
  nextTick(() => {
    if (overlayRef.value) {
      animate(
        overlayRef.value,
        { opacity: [0, 1], backdropFilter: ['blur(0px)', 'blur(16px)'] },
        { duration: 0.45, easing: [0.25, 0.46, 0.45, 0.94] },
      );
    }
  });

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const aspectRatio = rect.width / rect.height;

  let targetWidth = vw * 0.8;
  let targetHeight = targetWidth / aspectRatio;

  if (targetHeight > vh * 0.8) {
    targetHeight = vh * 0.8;
    targetWidth = targetHeight * aspectRatio;
  }

  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  const translateX = centerX - (rect.left + rect.width / 2);
  const translateY = centerY - (rect.top + rect.height / 2);

  const scaleX = targetWidth / rect.width;
  const scaleY = targetHeight / rect.height;

  animate(
    clone,
    {
      transform: `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`,
    },
    BOUNCE_SPRING,
  ).then(() => {
    placeholderClone = clone;
    selectedImage.value = image;
    nextTick(() => {
      // Focus the modal overlay for keyboard events
      const modal = document.querySelector('.image-modal') as HTMLElement | null;
      modal?.focus();
    });

    // Load the full-size image and swap it onto the clone seamlessly
    const fullUrl = getFullUrl(image);
    if (fullUrl) {
      // If already cached, swap immediately
      if (cachedUrls.has(fullUrl)) {
        swapToFullSize(fullUrl);
      } else {
        fullSizeLoader = new Image();
        fullSizeLoader.onload = () => {
          cachedUrls.add(fullUrl);
          swapToFullSize(fullUrl);
          fullSizeLoader = null;
        };
        fullSizeLoader.src = fullUrl;
      }
    }
  });
};

function swapToFullSize(url: string) {
  if (!placeholderClone) return;
  // Decode before swapping to avoid any flash
  const img = new Image();
  img.src = url;
  (img.decode ? img.decode() : Promise.resolve()).then(() => {
    if (placeholderClone) {
      (placeholderClone as HTMLImageElement).src = url;
    }
  }).catch(() => {
    // decode() can fail on some browsers/formats, swap anyway
    if (placeholderClone) {
      (placeholderClone as HTMLImageElement).src = url;
    }
  });
}

const closeImage = () => {
  if (!selectedImage.value && !placeholderClone) return;

  // Cancel any in-flight full-size load
  if (fullSizeLoader) {
    fullSizeLoader.onload = null;
    fullSizeLoader = null;
  }

  // The placeholder clone IS the displayed image — use it directly for close animation
  const clone = placeholderClone;
  placeholderClone = null;

  // Find grid target
  const gridImg =
    hiddenIndex.value !== null
      ? (imageRefs.value[hiddenIndex.value]?.querySelector('img') as HTMLElement | null)
      : null;
  const gridRect = gridImg?.getBoundingClientRect();

  // Clear modal state
  selectedImage.value = null;

  // Fade out bokeh backdrop
  if (overlayRef.value) {
    animate(
      overlayRef.value,
      { opacity: 0, backdropFilter: 'blur(0px)' },
      { duration: 0.45, easing: [0.25, 0.46, 0.45, 0.94] },
    ).then(() => { overlayVisible.value = false; });
  } else {
    overlayVisible.value = false;
  }

  // No clone or grid target — just clean up
  if (!clone || !gridRect || !openOriginalRect) {
    if (clone?.parentNode) clone.parentNode.removeChild(clone);
    hiddenIndex.value = null;
    if (gridImg) gridImg.style.visibility = 'visible';
    if (lastFocusedElement) {
      (lastFocusedElement as HTMLElement).focus();
      lastFocusedElement = null;
    }
    return;
  }

  // Compute close transform relative to the clone's original untransformed position.
  // The clone's CSS top/left/width/height are still the original thumbnail values.
  const orig = openOriginalRect!;
  const origCenterX = orig.left + orig.width / 2;
  const origCenterY = orig.top + orig.height / 2;
  const gridCenterX = gridRect.left + gridRect.width / 2;
  const gridCenterY = gridRect.top + gridRect.height / 2;

  const translateX = gridCenterX - origCenterX;
  const translateY = gridCenterY - origCenterY;
  const scaleX = gridRect.width / orig.width;
  const scaleY = gridRect.height / orig.height;

  animate(
    clone,
    {
      transform: `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`,
    },
    BOUNCE_SPRING,
  ).then(() => {
    if (clone.parentNode) clone.parentNode.removeChild(clone);
    if (gridImg) gridImg.style.visibility = 'visible';
    hiddenIndex.value = null;

    if (lastFocusedElement) {
      (lastFocusedElement as HTMLElement).focus();
      lastFocusedElement = null;
    }
  });
};

function removePlaceholder() {
  if (placeholderClone && placeholderClone.parentNode) {
    placeholderClone.parentNode.removeChild(placeholderClone);
  }
  placeholderClone = null;
}

let loadObserver: IntersectionObserver;
let animObserver: IntersectionObserver;
let resizeObserver: ResizeObserver;

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && (selectedImage.value || overlayVisible.value)) {
    closeImage();
  }
};

const handleModalKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeImage();
  }

  if (!selectedImage.value) return;

  const currentIndex = images.value.findIndex((img) => img.id === selectedImage.value?.id);

  if (event.key === 'ArrowLeft' && currentIndex > 0) {
    event.preventDefault();
    const newImage = images.value[currentIndex - 1];
    selectedImage.value = newImage;
    // Swap placeholder clone to new thumbnail, then load full-size
    if (placeholderClone) {
      (placeholderClone as HTMLImageElement).src = newImage.media_asset.variants[1].url;
    }
    const fullUrl = getFullUrl(newImage);
    if (fullUrl) swapToFullSize(fullUrl);
  } else if (event.key === 'ArrowRight' && currentIndex < images.value.length - 1) {
    event.preventDefault();
    const newImage = images.value[currentIndex + 1];
    selectedImage.value = newImage;
    if (placeholderClone) {
      (placeholderClone as HTMLImageElement).src = newImage.media_asset.variants[1].url;
    }
    const fullUrl = getFullUrl(newImage);
    if (fullUrl) swapToFullSize(fullUrl);
  }
};

onMounted(() => {
  fetchImages().then(() => {
    nextTick(() => {
      computeLayout();

      // Recompute layout when container resizes
      if (gridRef.value) {
        resizeObserver = new ResizeObserver(() => {
          computeLayout();
        });
        resizeObserver.observe(gridRef.value);
      }

      // Wait for columns to render before attaching observers
      nextTick(() => {

      // Preload observer: large margin to add <img> to DOM early
      loadObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const index = parseInt((entry.target as HTMLElement).dataset.index!);
              shouldLoadImage.value[index] = true;
              loadObserver.unobserve(entry.target); // Only need to trigger once
            }
          });
        },
        { rootMargin: '100% 0px 100% 0px' },
      );

      // Animation observer: tight margin for visible scroll enter/exit
      animObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const index = parseInt((entry.target as HTMLElement).dataset.index!);
            if (entry.isIntersecting) {
              imageInView.value[index] = true;
            } else {
              imageInView.value[index] = false;
              const rect = entry.boundingClientRect;
              if (rect.bottom < 0) {
                imageDirection.value[index] = 'above';
              } else {
                imageDirection.value[index] = 'below';
              }
            }
          });
        },
        { threshold: 0.05, rootMargin: '50px 0px 50px 0px' },
      );

      Object.values(imageRefs.value).forEach((ref) => {
        if (ref) {
          loadObserver.observe(ref);
          animObserver.observe(ref);
        }
      });
      }); // end inner nextTick
    });
  });

  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  if (loadObserver) loadObserver.disconnect();
  if (animObserver) animObserver.disconnect();
  if (resizeObserver) resizeObserver.disconnect();
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
.image-cell {
  transform: translateY(0) translateZ(0);
  opacity: 1;
  transition: transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94),
              opacity 0.4s ease;
  will-change: transform, opacity;
}

.image-cell.from-below {
  transform: translateY(60px) translateZ(0);
  opacity: 0;
}

.image-cell.from-above {
  transform: translateY(-60px) translateZ(0);
  opacity: 0;
}

.image-cell.is-visible {
  transform: translateY(0) translateZ(0);
  opacity: 1;
}

.image-grid {
  display: flex;
  gap: 8px;
  width: 100%;
}

.masonry-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.image-item {
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  cursor: pointer;
}

.image-item:hover img {
  transform: scale(1.1);
}

.image-item img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease-in-out;
  border-radius: 4px;
}

.image-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  z-index: 998;
  opacity: 0;
}

.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.spinner {
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 4px solid #ffcc00;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
