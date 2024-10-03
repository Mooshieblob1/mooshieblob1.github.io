<template>
  <div class="min-h-screen bg-gray-900 p-8">
    <NuxtLink to="/">
      <img src="~/assets/images/bloblogo.webp" alt="logo" class="logo h-[5vw] w-auto mx-auto mb-12 mt-12">
    </NuxtLink>
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-bold text-yellow-400 mb-8 text-center">Blog</h1>
      <div v-for="post in posts" :key="post.id" class="mb-6">
        <div
          class="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl border border-gray-700"
        >
          <div
            class="p-6 cursor-pointer"
            @click="togglePost(post.id)"
          >
            <h2 class="text-2xl font-semibold text-yellow-300 mb-2">{{ post.title }}</h2>
            <p class="text-gray-300 mb-4">{{ post.excerpt }}</p>
            <div class="flex justify-between items-center">
              <NuxtLink
                :to="`/blog/${post.id}`"
                class="text-yellow-200 hover:text-yellow-100 transition-colors duration-200"
              >
                Read more
              </NuxtLink>
              <span class="text-gray-400">
                {{ post.isExpanded ? 'Click to collapse' : 'Click to expand' }}
              </span>
            </div>
          </div>
          <div
            v-if="post.isExpanded"
            class="p-6 border-t border-gray-700"
          >
            <p class="text-gray-300">{{ post.content }}</p>
          </div>
        </div>
      </div>
      <div v-if="loading" class="text-center text-gray-300 mt-4">Loading more posts...</div>
      <div v-if="!hasMore" class="text-center text-gray-300 mt-4">No more posts to load</div>
      <div ref="intersectionTarget" class="h-16 mt-4 bg-gray-800 opacity-0">Intersection target</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';

interface Post {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  isExpanded: boolean;
}

const route = useRoute();
const posts = ref<Post[]>([]);
const page = ref(1);
const loading = ref(false);
const hasMore = ref(true);
const intersectionTarget = ref<HTMLElement | null>(null);

const fetchPosts = async () => {
  if (loading.value || !hasMore.value) {
    console.log('Fetching stopped: loading =', loading.value, 'hasMore =', hasMore.value);
    return;
  }
  
  loading.value = true;
  console.log('Fetching posts for page', page.value);
  try {
    const response = await fetch(`/api/posts?page=${page.value}&limit=3`);
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    const data = await response.json();
    console.log('Received data:', data);
    posts.value = [...posts.value, ...data.posts.map((post: Omit<Post, 'isExpanded'>) => ({
      ...post,
      isExpanded: false,
    }))];
    hasMore.value = data.hasMore;
    page.value++;
    console.log('Updated posts. Total count:', posts.value.length, 'hasMore:', hasMore.value);
  } catch (error) {
    console.error('Error fetching posts:', error);
  } finally {
    loading.value = false;
  }
};

const togglePost = (id: number) => {
  const post = posts.value.find(p => p.id === id);
  if (post) {
    post.isExpanded = !post.isExpanded;
  }
};

let observer: IntersectionObserver | null = null;

const setupIntersectionObserver = () => {
  if (observer) {
    observer.disconnect();
  }

  observer = new IntersectionObserver(([entry]) => {
    console.log('Intersection observed:', entry.isIntersecting, 'loading:', loading.value, 'hasMore:', hasMore.value);
    if (entry.isIntersecting && !loading.value && hasMore.value) {
      fetchPosts();
    }
  }, { rootMargin: '100px', threshold: 0.1 });

  if (intersectionTarget.value) {
    observer.observe(intersectionTarget.value);
    console.log('Intersection observer set up');
  } else {
    console.warn('Intersection target not found');
  }
};

const resetAndFetch = () => {
  posts.value = [];
  page.value = 1;
  hasMore.value = true;
  fetchPosts();
  setupIntersectionObserver();
};

onMounted(() => {
  console.log('Component mounted');
  resetAndFetch();
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});

watch(() => route.path, (newPath, oldPath) => {
  if (newPath === '/blog' && oldPath !== '/blog') {
    console.log('Returned to blog page, resetting and fetching posts');
    resetAndFetch();
  }
});
</script>

<style scoped>
.logo {
  filter: drop-shadow(0 0 0.75rem rgba(255, 255, 0, 0.3));
}
</style>