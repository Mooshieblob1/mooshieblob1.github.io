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
                <div v-for="image in images" :key="image.url" class="image-item" @click="openImage(image)">
                    <img :src="image.url" :alt="image.alt" class="transform transition-transform duration-300 hover:scale-105">
                </div>
            </div>
            <div v-if="selectedImage" class="image-overlay" @click="closeImage">
                <img :src="selectedImage.url" :alt="selectedImage.alt" class="enlarged-image">
            </div>
        </div>
    </div>
</template>

<script>
import '~/assets/css/output.css';

export default {
    data() {
        return {
            images: [
                { url: 'https://cdn.aibooru.download/sample/0e/1c/__chen_touhou_generated_by_blob_artist_using_novelai__sample-0e1cc56d3a5e04638a5e4149b3c77083.jpg', alt: 'Image 1' },
                { url: 'https://cdn.aibooru.download/sample/8d/35/__kagamine_rin_vocaloid_generated_by_blob_artist_using_novelai__sample-8d354939c41875cf522f0924af593ae2.jpg', alt: 'Image 2' },
                { url: 'https://cdn.aibooru.download/sample/c3/53/__chen_touhou_generated_by_blob_artist_using_novelai__sample-c353710618f5c809d6643c5fc2ac85f4.jpg', alt: 'Image 3' },
                { url: 'https://cdn.aibooru.download/sample/0a/b5/__mofu_original_generated_by_blob_artist_using_novelai__sample-0ab5d34b1a4c8cea224548af6b23dc62.jpg', alt: 'Image 4' },
                { url: 'https://cdn.aibooru.download/sample/f0/f8/__reisen_udongein_inaba_touhou_generated_by_blob_artist_using_novelai__sample-f0f8cc355bc5e01266130b38489d3d0d.jpg', alt: 'Image 5' },
                { url: 'https://cdn.aibooru.download/sample/50/af/__momo_velia_deviluke_to_love_ru_and_1_more_generated_by_blob_artist_using_novelai__sample-50af0e58fe1494825a013cd075ef605e.jpg', alt: 'Image 6' },
                { url: 'https://cdn.aibooru.download/sample/4b/17/__original_generated_by_ai_s_love__sample-4b17749624e22a57485b7254787a9273.jpg', alt: 'Image 7' },
                { url: 'https://cdn.aibooru.download/sample/d2/e0/__original_generated_by_sinozick__sample-d2e04470a4653ee60e6c8cdaad1a49ad.jpg', alt: 'Image 8' },
                { url: 'https://cdn.aibooru.download/sample/a9/ab/__kaoru_project_kv_generated_by_qingsongzero__sample-a9ab756bae64a05ebe38e0485097c0c8.jpg', alt: 'Image 9' },
            ],
            selectedImage: null,
        };
    },
    methods: {
        openImage(image) {
            this.selectedImage = image;
        },
        closeImage() {
            this.selectedImage = null;
        },
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
