<template>
    <div>
        <NuxtLink to="/">
            <img src="~/assets/images/bloblogo.webp" alt="logo" class="logo h-[10vw] w-auto mx-auto mt-16 cursor-pointer" />
        </NuxtLink>
        <div class="container mx-auto">
            <p class="text-center pb-4">
                This is a smaller selection of my SFW posts. To see more, go to
                <a href="https://aibooru.online/posts?tags=user%3ABlob" target="_blank" rel="noopener noreferrer">
                    <strong><u>here</u></strong>
                </a>
                <img src="~/assets/icons/aibooru.svg" alt="AIBooru Logo" class="inline-block h-4 w-4 ml-2">
            </p>
            <div class="image-grid">
                <div v-for="(image, index) in images" :key="image.id" class="image-item" @click="openImage(image)">
                    <transition name="bounce" appear>
                        <v-lazy-image :src="image.media_asset.variants[2].url"
                            :src-placeholder="getCachedImageUrl(image.id) || '/assets/images/placeholder.svg'"
                            :alt="image.tag_string" @load="onImageLoad(index, image)"
                            :class="['transform transition-transform duration-300 hover:scale-105', { 'loaded': loadedImages[index] }]" />
                    </transition>
                </div>
            </div>
            <transition name="bounce">
                <div v-if="selectedImage" class="image-overlay" @click="closeImage">
                    <img :src="getCachedImageUrl(selectedImage.id) || selectedImage.file_url"
                        :alt="selectedImage.tag_string" class="enlarged-image">
                </div>
            </transition>
        </div>
    </div>
</template>
  
<script setup>
import { onMounted, ref } from 'vue';
import { useRainEffect } from '~/composables/useRainEffect';
import '~/assets/css/output.css';
import VLazyImage from 'v-lazy-image';

const { toggleRainEffect } = useRainEffect();

// Disable rain effect for this page
toggleRainEffect(false);

definePageMeta({
    layout: 'no-rain',
});

const images = ref([]);
const selectedImage = ref(null);
const loadedImages = ref([]);

const fetchImages = async () => {
    const url = 'https://nameless-moon-1f3f.kentvuong88-cloudflare.workers.dev/';
    try {
        const response = await fetch(url);
        const data = await response.json();
        images.value = data;
        loadedImages.value = new Array(data.length).fill(false);
    } catch (error) {
        console.error('Error fetching images:', error);
    }
};

const onImageLoad = (index, image) => {
    loadedImages.value[index] = true;
    cacheImage(image.id, image.file_url);
};

const openImage = (image) => {
    selectedImage.value = image;
    cacheImage(image.id, image.file_url);
};

const closeImage = () => {
    selectedImage.value = null;
};

const cacheImage = (id, url) => {
    localStorage.setItem(`cachedImage_${id}`, url);
};

const getCachedImageUrl = (id) => {
    return localStorage.getItem(`cachedImage_${id}`);
};

onMounted(() => {
    fetchImages();
});
</script>
  
<style scoped>
.bounce-enter-active {
    animation: bounce-in 0.5s;
}

.bounce-leave-active {
    animation: bounce-in 0.5s reverse;
}

@keyframes bounce-in {
    0% {
        transform: scale(0);
    }

    50% {
        transform: scale(1.25);
    }

    100% {
        transform: scale(1);
    }
}

.image-item {
    position: relative;
}

.v-lazy-image {
    opacity: 0;
    transition: opacity 0.3s;
}

.v-lazy-image.loaded {
    opacity: 1;
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
    height: 325px;
    cursor: pointer;
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
}
</style>