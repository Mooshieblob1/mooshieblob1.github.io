<template>
  <div>
    <img src="~/assets/images/bloblogo.webp" alt="logo" class="logo h-[10vw] w-auto mx-auto mt-16" />
    <div>
      <h1>Blog</h1>
      <div v-for="post in posts" :key="post.id" class="post">
        <h2>{{ post.title }}</h2>
        <p>{{ post.excerpt }}</p>
        <nuxt-link :to="`/blog/${post.id}`">Read more</nuxt-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';

interface Post {
  id: number;
  title: string;
  excerpt: string;
}

const posts = ref<Post[]>([]);

onMounted(async () => {
  const response = await fetch('/api/posts');
  posts.value = await response.json();
});
</script>

<style scoped>
.post {
  margin-bottom: 20px;
}
</style>