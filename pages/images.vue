<!--
    This is a current work in progress. Currently it is a simple image grid with everything being an even aspect ratio.
    My future plans are to make it dynamically shift around the page dependant on the image's aspect ratio
-->

<template>
    <div>
        <img src="~/assets/images/bloblogo.webp" alt="Logo" class="logo h-[10vw] w-auto mx-auto">
        <div class="container mx-auto">
            <h1 class="text-4xl text-center pb-4">Images Page</h1>
            <div class="image-grid">
                <div v-for="image in images" :key="image.id" class="image-item" @click="openImage(image)">
                    <img :src="image.media_asset.variants[2].url" :alt="image.tag_string" class="transform transition-transform duration-300 hover:scale-105">
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
    data() {
        return {
            images: [],
            selectedImage: null,
        };
    },
    methods: {
        async fetchImages() {
            const username = 'blob';
            const apiKey = '8W4PxfH5FUNQxJYiucdZR53Q';
            const url = `https://aibooru.online/posts.json?tags=blob_%28artist%29+-rating%3Ae+-rating%3Aq&login=${username}&api_key=${apiKey}`;

            try {
                const response = await fetch(url);

                if (response.ok) {
                    const data = await response.json();
                    this.images = data;
                } else {
                    console.error('Error fetching images:', response.statusText);
                }
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
    padding: 5%;
}

.image-grid {
    column-count: 3;
    column-gap: 20px;
}

.image-item {
    display: inline-block;
    margin-bottom: 20px;
    width: 100%;
}

.image-item img {
    width: 100%;
    height: auto;
    display: block;
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
    max-width: 80%;
    max-height: 80%;
}
</style>

