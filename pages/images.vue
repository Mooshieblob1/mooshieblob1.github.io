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
      <p class="pb-4 text-center">
        This is a smaller selection of my SFW posts. To see more, go to
        <a
          href="https://aibooru.online/posts?tags=user%3ABlob"
          target="_blank"
          rel="noopener noreferrer"
        >
          <strong><u>here</u></strong>
        </a>
        <img
          src="~/assets/icons/aibooru.svg"
          alt="AIBooru Logo"
          class="ml-2 inline-block h-4 w-4"
        />
      </p>

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
            <img
              :src="image.media_asset.variants[0].url"
              :alt="image.tag_string"
              :class="[
                'transform transition-all duration-1000 ease-out',
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
              loading="lazy"
            />
          </div>
        </div>
      </div>

      <transition name="fade">
        <div v-if="selectedImage" class="image-overlay" @click="closeImage">
          <!-- Loading Spinner for enlarged image -->
          <div v-if="!enlargedImageLoaded" class="spinner"></div>
          <img
            v-show="enlargedImageLoaded"
            :src="selectedImage.file_url"
            :alt="selectedImage.tag_string"
            :class="['enlarged-image', { loaded: enlargedImageLoaded }]"
            @load="onEnlargedImageLoad"
          />
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, onUnmounted, computed } from "vue";
import { useRainEffect } from "~/composables/useRainEffect";
import "~/assets/css/output.css";

const { toggleRainEffect } = useRainEffect();

// Disable rain effect for this page
toggleRainEffect(false);

definePageMeta({
  layout: "no-rain",
  layoutTransition: {
    name: "slide-in",
  },
});

const images = ref([]);
const selectedImage = ref(null);
const imageInView = ref({});
const imageRefs = ref([]);
const scrollDirection = ref("down");
const enlargedImageLoaded = ref(false);
const isLoading = ref(true);
let lastScrollTop = 0;

const fetchImages = async () => {
  isLoading.value = true;
  const url = "https://nameless-moon-1f3f.kentvuong88-cloudflare.workers.dev/";
  try {
    const response = await fetch(url);
    const data = await response.json();
    images.value = data;
  } catch (error) {
    console.error("Error fetching images:", error);
  } finally {
    isLoading.value = false;
  }
};

const openImage = (image) => {
  selectedImage.value = image;
  enlargedImageLoaded.value = false;
};

const closeImage = () => {
  selectedImage.value = null;
  enlargedImageLoaded.value = false;
};

const onEnlargedImageLoad = () => {
  enlargedImageLoaded.value = true;
};

const handleScroll = () => {
  const st = window.pageYOffset || document.documentElement.scrollTop;
  scrollDirection.value = st > lastScrollTop ? "down" : "up";
  lastScrollTop = st <= 0 ? 0 : st;
};

let observer;

onMounted(() => {
  fetchImages();

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const index = entry.target.dataset.index;
        imageInView.value[index] = entry.isIntersecting;
      });
    },
    { threshold: 0.1, rootMargin: "100px" },
  );

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

.image-item {
  position: relative;
  overflow: hidden;
  border-radius: 4px;
}

.image-item img {
  opacity: 0;
  transition:
    opacity 0.3s,
    transform 0.5s ease-in-out;
  border-radius: 4px;
}

.image-item img.loaded {
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

.container {
  padding: 2.5%;
}

.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.image-item {
  flex: 1 0 auto;
  max-width: unset;
  margin-bottom: 5px;
  height: 200px;
  cursor: pointer;
  transition: transform 0.3s ease-in-out;
}

.image-item:hover img {
  transform: scale(1.1);
}

@media (max-width: 780px) {
  .image-item {
    height: 100px;
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
</style>
