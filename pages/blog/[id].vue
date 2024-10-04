<template>
  <div class="min-h-screen bg-gray-900 p-8">
    <NuxtLink to="/">
      <img src="~/assets/images/bloblogo.webp" alt="logo" class="logo h-[5vw] w-auto mx-auto mb-12 mt-12">
    </NuxtLink>
    <div v-if="loading" class="max-w-4xl mx-auto text-center text-yellow-400">
      Loading...
    </div>
    <div v-else-if="error" class="max-w-4xl mx-auto text-center text-red-400">
      {{ error }}
    </div>
    <div v-else-if="post" class="max-w-4xl mx-auto bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-lg overflow-hidden shadow-lg p-8 border border-gray-700">
      <h1 class="text-4xl font-bold text-yellow-400 mb-4">{{ post.title }}</h1>
      <p class="text-gray-300 mb-8">{{ post.content }}</p>
      <NuxtLink to="/blog" class="text-yellow-200 hover:text-yellow-100 transition-colors duration-200">
        &larr; Back to Blog
      </NuxtLink>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

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
    console.error('Error fetching post:', err);
    error.value = err instanceof Error ? err.message : 'An unknown error occurred';
    // If you want to redirect to a 404 page, you can use:
    // await navigateTo('/404');
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.logo {
  filter: drop-shadow(0 0 0.75rem rgba(255, 255, 0, 0.3));
}
</style>