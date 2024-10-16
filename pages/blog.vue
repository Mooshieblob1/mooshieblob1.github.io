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
          <div class="cursor-pointer p-6" @click="openPost(post)">
            <h2 class="mb-2 text-2xl font-semibold text-yellow-300">
              {{ post.title }}
            </h2>
            <p class="mb-4 text-gray-300">{{ post.excerpt }}</p>
            <div class="flex items-center justify-between">
              <span
                class="text-yellow-200 transition-colors duration-200 hover:text-yellow-100"
              >
                Read more
              </span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="loading" class="mt-4 text-center text-gray-300">
        Loading more posts...
      </div>
      <div v-if="!hasMore" class="mt-4 text-center text-gray-300">
        No more posts to load
      </div>
      <div ref="infiniteScrollTrigger" class="h-10 w-full"></div>
    </div>

    <!-- Expanded post overlay -->
    <div
      v-if="expandedPost"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
    >
      <div
        class="max-h-[90vh] w-[90vw] max-w-4xl overflow-y-auto rounded-lg bg-gray-800 p-8"
      >
        <h2 class="mb-4 text-3xl font-bold text-yellow-300">
          {{ expandedPost.title }}
        </h2>
        <p class="mb-6 text-gray-300">{{ expandedPost.content }}</p>
        <button
          @click="closePost"
          class="rounded bg-yellow-400 px-4 py-2 text-gray-900 hover:bg-yellow-300"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
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

const posts = ref<Post[]>([]);
const page = ref(1);
const loading = ref(false);
const hasMore = ref(true);
const infiniteScrollTrigger = ref<HTMLElement | null>(null);
const expandedPost = ref<Post | null>(null);

const fetchPosts = async () => {
  if (loading.value || !hasMore.value) return;

  loading.value = true;
  try {
    const response = await fetch(`/api/posts?page=${page.value}&limit=5`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    posts.value = [...posts.value, ...data.posts];
    hasMore.value = data.hasMore;
    page.value++;
  } catch (error) {
    console.error("Error fetching posts:", error);
  } finally {
    loading.value = false;
  }
};

const openPost = (post: Post) => {
  expandedPost.value = post;
  document.body.style.overflow = "hidden";
};

const closePost = () => {
  expandedPost.value = null;
  document.body.style.overflow = "";
};

let observer: IntersectionObserver;

const setupIntersectionObserver = () => {
  if (observer) {
    observer.disconnect();
  }

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !loading.value && hasMore.value) {
        fetchPosts();
      }
    },
    { threshold: 0.1, rootMargin: "0px 0px 200px 0px" },
  );

  if (infiniteScrollTrigger.value) {
    observer.observe(infiniteScrollTrigger.value);
  }
};

onMounted(() => {
  setupIntersectionObserver();
  // Initial fetch
  fetchPosts();
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});

// Watch for changes in the posts array
watch(posts, () => {
  // Re-setup the intersection observer after posts are loaded
  setupIntersectionObserver();
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
