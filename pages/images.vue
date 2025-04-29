<template>
  <div>
    <NuxtLink to="/">
      <img
        src="~/assets/images/bloblogo.webp"
        alt="logo"
        class="logo mx-auto mt-16 h-[10vw] w-auto cursor-pointer"
      />
    </NuxtLink>

    <div class="container mx-auto">
      <p class="pb-4 text-center">This is a smaller selection of my posts.</p>

      <!-- Loading Spinner for initial load -->
      <div v-if="isLoading" class="flex h-64 items-center justify-center">
        <div class="spinner"></div>
      </div>

      <div v-else class="image-grid">
        <div
          v-for="(image, index) in images"
          :key="image.id"
          class="image-item"
          @click="openImage(image)"
        >
          <div ref="imageRefs" :data-index="index" class="h-full">
            <v-lazy-image
              :src="image.media_asset.variants[2].url"
              :src-placeholder="
                getCachedImageUrl(image.id) || '/images/placeholder.svg'
              "
              :alt="image.tag_string"
              :class="[
                'transform transition-all duration-1000 ease-in-out',
                { loaded: loadedImages[index] },
                { 'translate-y-0 opacity-100': imageInView[index] },
                {
                  'translate-y-1/4 opacity-0':
                    !imageInView[index] && scrollDirection === 'down',
                },
                {
                  '-translate-y-1/4 opacity-0':
                    !imageInView[index] && scrollDirection === 'up',
                },
                `delay-${index % 5}`,
              ]"
              @load="onImageLoad(index, image)"
            />
          </div>
        </div>
      </div>

      <transition :name="transitionDirection">
        <div
          v-if="selectedImage"
          class="image-overlay"
          @click.self="closeImage"
          @touchstart="onTouchStart"
          @touchend="onTouchEnd"
        >
          <!-- Loading Spinner for enlarged image -->
          <div v-if="!enlargedImageLoaded" class="spinner"></div>

          <img
            v-show="enlargedImageLoaded"
            :src="getCachedImageUrl(selectedImage.id) || selectedImage.file_url"
            :alt="selectedImage.tag_string"
            :class="['enlarged-image', { loaded: enlargedImageLoaded }]"
            @load="onEnlargedImageLoad"
          />

          <!-- Navigation Arrows -->
          <button class="nav-arrow left" @click.stop="showPrevImage">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              class="h-8 w-8"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button class="nav-arrow right" @click.stop="showNextImage">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              class="h-8 w-8"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <!-- Close Button -->
          <button class="close-button" @click.stop="closeImage">×</button>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { useRainEffect } from "~/composables/useRainEffect";
import "~/assets/css/output.css";
import VLazyImage from "v-lazy-image";

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
const imageInView = ref([]);
const imageRefs = ref([]);
const transitionDirection = ref("fade"); // default fallback
const scrollDirection = ref("down");
const enlargedImageLoaded = ref(false);
const isLoading = ref(true);
let lastScrollTop = 0;

// Swipe detection
const touchStartX = ref(0);
const touchEndX = ref(0);

const onTouchStart = (e) => {
  touchStartX.value = e.changedTouches[0].screenX;
};

const onTouchEnd = (e) => {
  touchEndX.value = e.changedTouches[0].screenX;
  handleSwipe();
};

const handleSwipe = () => {
  const swipeDistance = touchEndX.value - touchStartX.value;
  if (swipeDistance > 50) {
    showPrevImage();
  } else if (swipeDistance < -50) {
    showNextImage();
  }
};

const handleKeydown = (event) => {
  if (!selectedImage.value) return;

  const key = event.key.toLowerCase();

  if (key === "arrowleft" || key === "a") {
    showPrevImage();
  } else if (key === "arrowright" || key === "d") {
    showNextImage();
  } else if (key === "escape") {
    closeImage();
  }
};

const fetchImages = async () => {
  isLoading.value = true;
  const url = "https://nameless-moon-1f3f.kentvuong88-cloudflare.workers.dev/";
  try {
    const response = await fetch(url);
    const data = await response.json();
    images.value = data;
    loadedImages.value = new Array(data.length).fill(false);
    imageInView.value = new Array(data.length).fill(false);
  } catch (error) {
    console.error("Error fetching images:", error);
  } finally {
    isLoading.value = false;
  }
};

const onImageLoad = (index, image) => {
  loadedImages.value[index] = true;
  cacheImage(image.id, image.file_url);
};

const openImage = (image) => {
  selectedImage.value = image;
  enlargedImageLoaded.value = false;
  cacheImage(image.id, image.file_url);
  window.addEventListener("keydown", handleKeydown);
};

const closeImage = () => {
  selectedImage.value = null;
  enlargedImageLoaded.value = false;
  window.removeEventListener("keydown", handleKeydown);
};

const onEnlargedImageLoad = () => {
  enlargedImageLoaded.value = true;
};

const cacheImage = (id, url) => {
  localStorage.setItem(`cachedImage_${id}`, url);
};

const getCachedImageUrl = (id) => {
  return localStorage.getItem(`cachedImage_${id}`);
};

const showPrevImage = () => {
  if (!selectedImage.value) return;

  transitionDirection.value = "slide-right"; // Moving left, so slide image right

  const currentIndex = images.value.findIndex(
    (img) => img.id === selectedImage.value.id,
  );
  const prevIndex =
    (currentIndex - 1 + images.value.length) % images.value.length;
  selectedImage.value = images.value[prevIndex];
  enlargedImageLoaded.value = false;
  cacheImage(selectedImage.value.id, selectedImage.value.file_url);
};

const showNextImage = () => {
  if (!selectedImage.value) return;

  transitionDirection.value = "slide-left"; // Moving right, so slide image left

  const currentIndex = images.value.findIndex(
    (img) => img.id === selectedImage.value.id,
  );
  const nextIndex = (currentIndex + 1) % images.value.length;
  selectedImage.value = images.value[nextIndex];
  enlargedImageLoaded.value = false;
  cacheImage(selectedImage.value.id, selectedImage.value.file_url);
};

const handleScroll = () => {
  const st = window.pageYOffset || document.documentElement.scrollTop;
  const newDirection = st > lastScrollTop ? "down" : "up";

  if (newDirection !== scrollDirection.value) {
    scrollDirection.value = newDirection;
  }

  lastScrollTop = st <= 0 ? 0 : st;

  imageRefs.value.forEach((ref, index) => {
    if (ref) {
      const rect = ref.getBoundingClientRect();
      const inView = rect.top < window.innerHeight + 300 && rect.bottom > -300;
      if (inView) {
        imageInView.value[index] = true;
      }
    }
  });
};

let observer;

onMounted(() => {
  fetchImages().then(() => {
    nextTick(() => {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const index = parseInt(entry.target.dataset.index);
            imageInView.value[index] = entry.isIntersecting;
          });
        },
        { threshold: 0.05, rootMargin: "750px 0px 750px 0px" },
      );

      imageRefs.value.forEach((ref) => {
        if (ref) observer.observe(ref);
      });

      observer.takeRecords().forEach((entry) => {
        const index = parseInt(entry.target.dataset.index);
        if (entry.isIntersecting) {
          imageInView.value[index] = true;
        }
      });
    });
  });

  window.addEventListener("scroll", handleScroll, { passive: true });
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
  window.removeEventListener("scroll", handleScroll);
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

.container {
  padding: 5% 2.5%;
}

.image-grid {
  column-count: 4;
  column-gap: 10px;
  padding: 1rem 0;
}

@media (max-width: 1200px) {
  .image-grid {
    column-count: 3;
  }
}

@media (max-width: 768px) {
  .image-grid {
    column-count: 2;
  }
}

@media (max-width: 500px) {
  .image-grid {
    column-count: 1;
  }
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}
.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.image-item {
  break-inside: avoid;
  margin-bottom: 10px;
  cursor: pointer;
  overflow: hidden;
  border-radius: 4px;
  transition: transform 0.3s ease-in-out;
  width: 100%;
  display: inline-block;
}

.image-item:hover img {
  transform: scale(1.1);
}

@media (max-width: 780px) {
  .image-item {
    height: 100px;
  }
}

.image-item img,
.v-lazy-image {
  width: 100%;
  height: auto;
  object-fit: cover;
  border-radius: 4px;
  transition: transform 0.3s ease-in-out;
}

.v-lazy-image {
  opacity: 0;
  transition:
    opacity 0.3s,
    transform 0.5s ease-in-out;
  border-radius: 4px;
}

.v-lazy-image.loaded {
  opacity: 1;
}

/* Add staggered delay classes */
.delay-0 {
  transition-delay: 0ms;
}
.delay-1 {
  transition-delay: 100ms;
}
.delay-2 {
  transition-delay: 200ms;
}
.delay-3 {
  transition-delay: 300ms;
}
.delay-4 {
  transition-delay: 400ms;
}

.image-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding-top: 80px; /* <-- Reserve space for navbar */
  padding-bottom: 40px; /* <-- Nice breathing room below */
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  box-sizing: border-box;
}

.enlarged-image {
  max-width: 92.5%;
  max-height: 92.5%;
  opacity: 0;
  transform: scale(0.9);
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
  border-radius: 8px;
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

.close-button {
  position: absolute;
  top: 30px; /* push it slightly lower below nav bar */
  right: 30px;
  background: none;
  border: none;
  font-size: 2.5rem;
  color: white;
  margin-top: 10px;
  cursor: pointer;
  z-index: 9999; /* higher than your navbar */
}

.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  font-size: 2rem;
  padding: 0.5rem;
  cursor: pointer;
  z-index: 1000;
  user-select: none;
}

.nav-arrow.left {
  left: 20px;
}

.nav-arrow.right {
  right: 20px;
}

.nav-arrow:hover {
  background: rgba(0, 0, 0, 0.8);
}
</style>
