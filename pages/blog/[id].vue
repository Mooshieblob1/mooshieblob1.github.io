<template>
    <div class="min-h-screen bg-gray-900 p-8">
      <NuxtLink to="/">
        <img src="~/assets/images/bloblogo.webp" alt="logo" class="logo h-[5vw] w-auto mx-auto mb-12 mt-12" />
      </NuxtLink>
      <div class="max-w-4xl mx-auto bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-lg overflow-hidden shadow-lg p-8 border border-gray-700">
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
  
  const route = useRoute();
  const post = ref<any>(null);
  
  onMounted(async () => {
    try {
      const response = await fetch(`/api/posts/${route.params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch post');
      }
      post.value = await response.json();
    } catch (error) {
      console.error('Error fetching post:', error);
      // Handle error (e.g., show error message to user or redirect to 404 page)
    }
  });
  </script>
  
  <style scoped>
  .logo {
    filter: drop-shadow(0 0 0.75rem rgba(255, 255, 0, 0.3));
  }
  </style>