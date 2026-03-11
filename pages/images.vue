<template>
  <div>
    <div class="mt-16 flex justify-center">
      <NuxtLink to="/" class="inline-block">
        <img
          src="~/assets/images/bloblogo.webp"
          alt="logo"
          class="h-[10vw] w-auto cursor-pointer"
        />
      </NuxtLink>
    </div>

    <div class="container mx-auto">
      <p class="pb-4 text-center">This is a smaller selection of my posts.</p>

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
            :ref="(el) => (imageRefs[index] = el)"
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
              @load="onImageLoad(index, image)"
            />
          </div>
        </div>
      </div>

      <Motion
        v-if="selectedImage"
        :layout="true"
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1 }"
        :leave="{ opacity: 0 }"
        class="image-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Enlarged image view"
        @click.self="closeImage"
        @touchstart="onTouchStart"
        @touchend="onTouchEnd"
        @keydown="handleModalKeyDown"
      >
        <!-- Loading Spinner for enlarged image -->
        <div v-if="!enlargedImageLoaded" role="status" aria-live="polite">
          <div class="spinner" aria-hidden="true"></div>
          <span class="sr-only">Loading full size image...</span>
        </div>

        <Motion
          :layout="true"
          :initial="{ opacity: 0, scale: 0.9 }"
          :enter="{ opacity: 1, scale: 1 }"
          :leave="{ opacity: 0, scale: 0.9 }"
          transition="ease"
        >
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
        </Motion>

        <!-- Close button for accessibility -->
        <button
          @click="closeImage"
          aria-label="Close enlarged image"
          class="absolute top-4 right-4 bg-[#fbc21b] text-[#02061a] w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#ffd966] transition-colors focus:outline-none focus:ring-2 focus:ring-[#fbc21b]"
        >
          <span aria-hidden="true" class="text-2xl font-bold">&times;</span>
        </button>
      </Motion>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { animate } from "motion";
import { useRainEffect } from "~/composables/useRainEffect";
import "~/assets/css/output.css";

const { toggleRainEffect } = useRainEffect();
toggleRainEffect(false);

definePageMeta({
  layout: "no-rain",
  layoutTransition: {
    name: "slide-in",
  },
});

const images = ref([]);
const selectedImage = ref(null);
const loadedImages = ref([]);
const shouldLoadImage = ref([]);
const imageInView = ref([]);
const imageDirection = ref([]);
const imageRefs = ref([]);
const enlargedImageLoaded = ref(false);
const isLoading = ref(true);
const hiddenIndex = ref(null);
const enlargedImageRef = ref(null);
let lastFocusedElement = null;
const { $lenis } = useNuxtApp();

const fetchImages = async () => {
  isLoading.value = true;
  const url = "https://nameless-moon-1f3f.kentvuong88-cloudflare.workers.dev/";
  try {
    const response = await fetch(url);
    const data = await response.json();
    images.value = data;
    loadedImages.value = new Array(data.length).fill(false);
    shouldLoadImage.value = new Array(data.length).fill(false);
    imageInView.value = new Array(data.length).fill(false);
    imageDirection.value = new Array(data.length).fill('below');
  } catch (error) {
    console.error("Error fetching images:", error);
  } finally {
    isLoading.value = false;
  }
};

const onImageLoad = (index, image) => {
  loadedImages.value[index] = true;
};

const openImage = (image, event) => {
  // Store the currently focused element
  lastFocusedElement = document.activeElement;
  
  const target = event.currentTarget.querySelector("img");
  if (!target) return;
  const rect = target.getBoundingClientRect();
  const scrollY = window.scrollY;
  const scrollX = window.scrollX;

  // Create a clone of the thumbnail
  const clone = target.cloneNode(true);
  Object.assign(clone.style, {
    position: "fixed",
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    zIndex: "2147483647",
    borderRadius: "4px",
    margin: "0",
    pointerEvents: "none",
    transform: "none",
    willChange: "transform",
    transformOrigin: "center center",
  });

  document.body.appendChild(clone);

  // Hide the original image
  const index = images.value.findIndex((img) => img.id === image.id);
  hiddenIndex.value = index;

  const original = imageRefs.value[index]?.querySelector("img");
  if (original) original.style.visibility = "hidden";

  // Compute aspect-ratio-constrained target size
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const aspectRatio = rect.width / rect.height;

  let targetWidth = vw * 0.8;
  let targetHeight = targetWidth / aspectRatio;

  if (targetHeight > vh * 0.8) {
    targetHeight = vh * 0.8;
    targetWidth = targetHeight * aspectRatio;
  }

  // Compute center destination
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  const translateX = centerX - (rect.left + rect.width / 2);
  const translateY = centerY - (rect.top + rect.height / 2);

  // Compute scale from thumbnail to target size
  const scaleX = targetWidth / rect.width;
  const scaleY = targetHeight / rect.height;

  // Animate using only transform (GPU smooth)
  animate(
    clone,
    {
      transform: `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`,
    },
    {
      duration: 0.5,
      easing: "ease-in-out",
      composite: "accumulate",
    },
  ).finished.then(() => {
    document.body.removeChild(clone);
    selectedImage.value = image;
    enlargedImageLoaded.value = false;
    // Focus the enlarged image for accessibility
    nextTick(() => {
      enlargedImageRef.value?.focus();
    });
  });
};

const closeImage = () => {
  const modalImg = document.querySelector(".enlarged-image.loaded");
  if (!modalImg || !selectedImage.value) {
    selectedImage.value = null;
    enlargedImageLoaded.value = false;
    // Restore focus
    if (lastFocusedElement) {
      lastFocusedElement.focus();
      lastFocusedElement = null;
    }
    return;
  }

  const gridImg =
    hiddenIndex.value !== null
      ? imageRefs.value[hiddenIndex.value]?.querySelector("img")
      : null;

  if (!gridImg) {
    document.body.removeChild(clone);
    hiddenIndex.value = null;
    return;
  }

  const gridRect = gridImg.getBoundingClientRect();
  const modalRect = modalImg.getBoundingClientRect();
  const scrollY = window.scrollY;
  const scrollX = window.scrollX;

  const clone = modalImg.cloneNode(true);
  Object.assign(clone.style, {
    position: "fixed",
    top: `${modalRect.top}px`,
    left: `${modalRect.left}px`,
    width: `${modalRect.width}px`,
    height: `${modalRect.height}px`,
    zIndex: "2147483647",
    borderRadius: "4px",
    pointerEvents: "none",
    margin: "0",
    transform: "translate(0, 0)",
    transformOrigin: "center center",
    willChange: "transform",
  });

  document.body.appendChild(clone);
  selectedImage.value = null;
  enlargedImageLoaded.value = false;

  if (gridRect) {
    const centerX = modalRect.left + scrollX + modalRect.width / 2;
    const centerY = modalRect.top + scrollY + modalRect.height / 2;

    const targetX = gridRect.left + scrollX + gridRect.width / 2;
    const targetY = gridRect.top + scrollY + gridRect.height / 2;

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
        easing: "ease-in-out",
        composite: "accumulate",
      },
    ).finished.then(() => {
      document.body.removeChild(clone);
      if (gridImg) gridImg.style.visibility = "visible";
      hiddenIndex.value = null;
      
      // Restore focus to the previously focused element
      if (lastFocusedElement) {
        lastFocusedElement.focus();
        lastFocusedElement = null;
      }
    });
  } else {
    document.body.removeChild(clone);
    hiddenIndex.value = null;
    
    // Restore focus
    if (lastFocusedElement) {
      lastFocusedElement.focus();
      lastFocusedElement = null;
    }
  }
};

const onEnlargedImageLoad = () => {
  enlargedImageLoaded.value = true;
};

let observer;

const handleKeyDown = (event) => {
  if (event.key === "Escape" && selectedImage.value) {
    closeImage();
  }
};

const handleModalKeyDown = (event) => {
  // Close modal on Escape
  if (event.key === "Escape") {
    closeImage();
  }
  
  // Navigate between images with arrow keys
  if (!selectedImage.value) return;
  
  const currentIndex = images.value.findIndex((img) => img.id === selectedImage.value?.id);
  
  if (event.key === "ArrowLeft" && currentIndex > 0) {
    event.preventDefault();
    const prevImage = images.value[currentIndex - 1];
    selectedImage.value = prevImage;
    enlargedImageLoaded.value = false;
  } else if (event.key === "ArrowRight" && currentIndex < images.value.length - 1) {
    event.preventDefault();
    const nextImage = images.value[currentIndex + 1];
    selectedImage.value = nextImage;
    enlargedImageLoaded.value = false;
  }
};

onMounted(() => {
  fetchImages().then(() => {
    nextTick(() => {
      // Animation Observer (Viewport) — tracks per-image direction + triggers loading
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const index = parseInt(entry.target.dataset.index);
            if (entry.isIntersecting) {
              imageInView.value[index] = true;
              shouldLoadImage.value[index] = true;
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
        { threshold: 0.05, rootMargin: "100% 0px 100% 0px" },
      );

      imageRefs.value.forEach((ref) => {
        if (ref) {
          observer.observe(ref);
        }
      });
    });
  });

  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  if (observer) observer.disconnect();
  window.removeEventListener("keydown", handleKeyDown);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

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

.container {
  padding: 2.5%;
}

.image-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 5px;
}

.image-item {
  flex: 1 0 auto;
  max-width: unset;
  margin-bottom: 5px;
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
    gap: 4px;
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
