<template>
  <div>
    <!-- Loading Spinner for initial load -->
    <div v-if="isLoading" class="flex h-64 items-center justify-center" role="status" aria-live="polite">
      <div class="spinner" aria-hidden="true"></div>
      <span class="sr-only">Loading images...</span>
    </div>

    <div v-else class="image-grid">
      <div
        v-for="(image, index) in images"
        :key="image.id"
        class="image-item"
        :style="{ '--img-ratio': image.image_width && image.image_height ? `${image.image_width}/${image.image_height}` : '1/1' }"
        role="button"
        tabindex="0"
        :aria-label="`View image: ${image.tag_string || 'gallery image'}`"
        @click="(e) => openImage(image, e)"
        @keydown.enter="(e) => openImage(image, e)"
        @keydown.space.prevent="(e) => openImage(image, e)"
      >
        <div
          :ref="(el) => setImageRef(index, el)"
          :data-index="index"
          class="image-cell h-full relative overflow-hidden rounded-[4px]"
          :class="{
            'is-visible': imageInView[index],
            'from-below': !imageInView[index] && imageDirection[index] === 'below',
            'from-above': !imageInView[index] && imageDirection[index] === 'above',
          }"
          :style="{ transitionDelay: `${(index % 4) * 60}ms` }"
        >
          <img
            v-if="shouldLoadImage[index]"
            :src="image.media_asset.variants[1].url"
            :alt="image.tag_string || 'Image from gallery'"
            loading="lazy"
            class="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
            :class="{ 'opacity-100': loadedImages[index], 'opacity-0': !loadedImages[index] }"
            @load="onImageLoad(index)"
          />
        </div>
      </div>
    </div>

    <!-- Enlarged Image Modal -->
    <Teleport to="body">
      <div
        v-if="selectedImage"
        class="image-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Enlarged image view"
        @click.self="closeImage"
        @keydown="handleModalKeyDown"
      >
        <!-- Loading Spinner for enlarged image -->
        <div v-if="!enlargedImageLoaded" role="status" aria-live="polite">
          <div class="spinner" aria-hidden="true"></div>
          <span class="sr-only">Loading full size image...</span>
        </div>

        <img
          v-show="enlargedImageLoaded"
          ref="enlargedImageRef"
          tabindex="0"
          :src="selectedImage.media_asset.variants[3]?.url || selectedImage.large_file_url || selectedImage.file_url"
          :alt="selectedImage.tag_string || 'Enlarged image from gallery'"
          :class="[
            'enlarged-image',
            'h-auto max-h-[40vh] w-auto max-w-[40vw] object-contain',
            { loaded: enlargedImageLoaded },
          ]"
          @load="onEnlargedImageLoad"
        />

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
const enlargedImageLoaded = ref(false);
const isLoading = ref(true);
const hiddenIndex = ref<number | null>(null);
const enlargedImageRef = ref<HTMLImageElement | null>(null);
let lastFocusedElement: Element | null = null;

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

  const index = images.value.findIndex((img) => img.id === image.id);
  hiddenIndex.value = index;

  const original = imageRefs.value[index]?.querySelector('img');
  if (original) (original as HTMLElement).style.visibility = 'hidden';

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
    {
      duration: 0.5,
      easing: 'ease-in-out',
    },
  ).then(() => {
    document.body.removeChild(clone);
    selectedImage.value = image;
    enlargedImageLoaded.value = false;
    nextTick(() => {
      enlargedImageRef.value?.focus();
    });
  });
};

const closeImage = () => {
  const modalImg = document.querySelector('.enlarged-image.loaded') as HTMLElement | null;
  if (!modalImg || !selectedImage.value) {
    selectedImage.value = null;
    enlargedImageLoaded.value = false;
    if (lastFocusedElement) {
      (lastFocusedElement as HTMLElement).focus();
      lastFocusedElement = null;
    }
    return;
  }

  const gridImg =
    hiddenIndex.value !== null
      ? (imageRefs.value[hiddenIndex.value]?.querySelector('img') as HTMLElement | null)
      : null;

  if (!gridImg) {
    selectedImage.value = null;
    enlargedImageLoaded.value = false;
    hiddenIndex.value = null;
    if (lastFocusedElement) {
      (lastFocusedElement as HTMLElement).focus();
      lastFocusedElement = null;
    }
    return;
  }

  const gridRect = gridImg.getBoundingClientRect();
  const modalRect = modalImg.getBoundingClientRect();

  const clone = modalImg.cloneNode(true) as HTMLElement;
  Object.assign(clone.style, {
    position: 'fixed',
    top: `${modalRect.top}px`,
    left: `${modalRect.left}px`,
    width: `${modalRect.width}px`,
    height: `${modalRect.height}px`,
    zIndex: '2147483647',
    borderRadius: '4px',
    pointerEvents: 'none',
    margin: '0',
    transform: 'translate(0, 0)',
    transformOrigin: 'center center',
    willChange: 'transform',
  });

  document.body.appendChild(clone);
  selectedImage.value = null;
  enlargedImageLoaded.value = false;

  const centerX = modalRect.left + modalRect.width / 2;
  const centerY = modalRect.top + modalRect.height / 2;

  const targetX = gridRect.left + gridRect.width / 2;
  const targetY = gridRect.top + gridRect.height / 2;

  const translateX = targetX - centerX;
  const translateY = targetY - centerY;

  const scaleX = gridRect.width / modalRect.width;
  const scaleY = gridRect.height / modalRect.height;

  animate(
    clone,
    {
      transform: `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`,
    },
    {
      duration: 0.5,
      easing: 'ease-in-out',
    },
  ).then(() => {
    document.body.removeChild(clone);
    if (gridImg) gridImg.style.visibility = 'visible';
    hiddenIndex.value = null;

    if (lastFocusedElement) {
      (lastFocusedElement as HTMLElement).focus();
      lastFocusedElement = null;
    }
  });
};

const onEnlargedImageLoad = () => {
  enlargedImageLoaded.value = true;
};

let loadObserver: IntersectionObserver;
let animObserver: IntersectionObserver;

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && selectedImage.value) {
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
    selectedImage.value = images.value[currentIndex - 1];
    enlargedImageLoaded.value = false;
  } else if (event.key === 'ArrowRight' && currentIndex < images.value.length - 1) {
    event.preventDefault();
    selectedImage.value = images.value[currentIndex + 1];
    enlargedImageLoaded.value = false;
  }
};

onMounted(() => {
  fetchImages().then(() => {
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
    });
  });

  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  if (loadObserver) loadObserver.disconnect();
  if (animObserver) animObserver.disconnect();
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

.image-item {
  position: relative;
  overflow: hidden;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .enlarged-image {
    max-width: 90vw;
    max-height: 70vh;
  }
}

.image-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  padding: 0;
}

.image-item {
  flex: 1 0 auto;
  max-width: unset;
  margin-bottom: 0;
  height: 200px;
  aspect-ratio: var(--img-ratio, 1/1);
  cursor: pointer;
  transition: transform 0.3s ease-in-out;
}

.image-item:hover img {
  transform: scale(1.1);
}

@media (max-width: 780px) {
  .image-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .image-item {
    height: auto;
    aspect-ratio: 1 / 1;
  }
}

.image-item img {
  object-fit: cover;
  height: 100%;
  width: fit-content;
  max-width: unset;
  transition: transform 0.3s ease-in-out;
  border-radius: 4px;
}

.image-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.enlarged-image {
  max-width: 80vw;
  max-height: 80vh;
  object-fit: contain;
  width: auto;
  border-radius: 4px;
  height: auto;
}

.enlarged-image.loaded {
  opacity: 1;
  transform: scale(1);
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
