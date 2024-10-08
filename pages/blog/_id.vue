<template>
  <div class="min-h-screen bg-gray-900 p-8">
    <NuxtLink to="/">
      <img
        src="~/assets/images/bloblogo.webp"
        alt="logo"
        class="logo mx-auto mb-12 mt-12 h-[5vw] w-auto"
      />
    </NuxtLink>
    <div v-if="loading" class="mx-auto max-w-4xl text-center text-yellow-400">
      Loading...
    </div>
    <div v-else-if="error" class="mx-auto max-w-4xl text-center text-red-400">
      {{ error }}
    </div>
    <div
      v-else-if="post"
      class="mx-auto max-w-4xl overflow-hidden rounded-lg border border-gray-700 bg-gray-800 bg-opacity-50 p-8 shadow-lg backdrop-blur-lg backdrop-filter"
    >
      <h1 class="mb-4 text-4xl font-bold text-yellow-400">{{ post.title }}</h1>
      <p class="mb-8 text-gray-300">{{ post.content }}</p>
      <NuxtLink
        to="/blog"
        class="text-yellow-200 transition-colors duration-200 hover:text-yellow-100"
      >
        &larr; Back to Blog
      </NuxtLink>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useRainEffect } from "~/composables/useRainEffect";

const { toggleRainEffect } = useRainEffect();

// Disable rain effect for this page
toggleRainEffect(false);

interface Post {
  id: number;
  title: string;
  excerpt: string;
  content: string;
}

const route = useRoute();
const post = ref<Post | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    const response = await fetch(`/api/posts/${route.params.id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch post: ${response.statusText}`);
    }
    post.value = await response.json();
  } catch (err) {
    console.error("Error fetching post:", err);
    error.value =
      err instanceof Error ? err.message : "An unknown error occurred";
    // If you want to redirect to a 404 page, you can use:
    // await navigateTo('/404');
  } finally {
    loading.value = false;
  }
});

definePageMeta({
  layout: "no-rain",
});
</script>

<style scoped>
.logo {
  filter: drop-shadow(0 0 0.75rem rgba(255, 255, 0, 0.3));
}
</style>
