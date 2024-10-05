<template>
  <div class="min-h-screen bg-gray-900 p-8">
    <NuxtLink to="/">
      <img
        src="~/assets/images/bloblogo.webp"
        alt="logo"
        class="logo mx-auto mb-12 mt-12 h-[5vw] w-auto"
      />
    </NuxtLink>
    <div class="mx-auto max-w-4xl">
      <h1 class="mb-8 text-center text-4xl font-bold text-yellow-400">Blog</h1>
      <div v-for="post in posts" :key="post.id" class="mb-6">
        <div
          class="overflow-hidden rounded-lg border border-gray-700 bg-gray-800 bg-opacity-50 shadow-lg backdrop-blur-lg backdrop-filter transition-all duration-300 hover:shadow-xl"
        >
          <div class="cursor-pointer p-6" @click="togglePost(post.id)">
            <h2 class="mb-2 text-2xl font-semibold text-yellow-300">
              {{ post.title }}
            </h2>
            <p class="mb-4 text-gray-300">{{ post.excerpt }}</p>
            <div class="flex items-center justify-between">
              <NuxtLink
                :to="`/blog/${post.id}`"
                class="text-yellow-200 transition-colors duration-200 hover:text-yellow-100"
              >
                Read more
              </NuxtLink>
              <span class="text-gray-400">
                {{ post.isExpanded ? "Click to collapse" : "Click to expand" }}
              </span>
            </div>
          </div>
          <div v-if="post.isExpanded" class="border-t border-gray-700 p-6">
            <p class="text-gray-300">{{ post.content }}</p>
          </div>
        </div>
      </div>
      <div v-if="loading" class="mt-4 text-center text-gray-300">
        Loading more posts...
      </div>
      <div v-if="!hasMore" class="mt-4 text-center text-gray-300">
        No more posts to load
      </div>
      <div ref="intersectionTarget" class="h-10 w-full"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRainEffect } from "~/composables/useRainEffect";

const { toggleRainEffect } = useRainEffect();

// Disable rain effect for this page
toggleRainEffect(false);

interface Post {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  isExpanded: boolean;
}

const posts = ref<Post[]>([]);
const page = ref(1);
const loading = ref(false);
const hasMore = ref(true);
const intersectionTarget = ref<HTMLElement | null>(null);

const fetchPosts = async () => {
  if (loading.value || !hasMore.value) return;

  loading.value = true;
  try {
    const response = await fetch(`/api/posts?page=${page.value}&limit=3`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    posts.value = [
      ...posts.value,
      ...data.posts.map((post: Post) => ({ ...post, isExpanded: false })),
    ];
    hasMore.value = data.hasMore;
    page.value++;
  } catch (error) {
    console.error("Error fetching posts:", error);
  } finally {
    loading.value = false;
  }
};

const togglePost = (id: number) => {
  const post = posts.value.find((p) => p.id === id);
  if (post) {
    post.isExpanded = !post.isExpanded;
  }
};

let observer: IntersectionObserver;

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !loading.value && hasMore.value) {
        fetchPosts();
      }
    },
    { threshold: 0.1 },
  );

  if (intersectionTarget.value) {
    observer.observe(intersectionTarget.value);
  }

  // Initial fetch
  fetchPosts();
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});

definePageMeta({
  layout: "no-rain",
  layoutTransition: {
    name: "slide-in",
  },
});
</script>

<style scoped>
.logo {
  filter: drop-shadow(0 0 0.75rem rgba(255, 255, 0, 0.3));
}
</style>
