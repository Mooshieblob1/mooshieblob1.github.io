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
                <div v-for="image in images" :key="image.id" class="image-item" @click="openImage(image)">
                    <img :src="image.media_asset.variants[0].url" :alt="image.tag_string"
                        class="transform transition-transform duration-300 hover:scale-105">
                </div>
            </div>
            <div v-if="selectedImage" class="image-overlay" @click="closeImage">
                <img :src="selectedImage.file_url" :alt="selectedImage.tag_string" class="enlarged-image">
            </div>
        </div>
    </div>
</template>
  
<script>
import '~/assets/css/output.css';

export default {
    layout: 'no-rain', // This line specifies the use of the no-rain layout
    data() {
        return {
            images: [],
            selectedImage: null,
        };
    },
    methods: {
        async fetchImages() {
            const url = 'https://nameless-moon-1f3f.kentvuong88-cloudflare.workers.dev/';
            try {
                const response = await fetch(url);
                const data = await response.json();
                this.images = data; // The JSON is already an array of images
            } catch (error) {
                console.error('Error fetching images:', error);
            }
        },
        openImage(image) {
            this.selectedImage = image;
        },
        closeImage() {
            this.selectedImage = null;
        },
    },
    created() {
        this.fetchImages();
    },
};
</script>
  
<style scoped>
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
}</style>