<template>
    <!-- Template remains the same -->
  </template>
  
  <script lang="ts" setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  
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
        throw new Error('Failed to fetch posts');
      }
      const data = await response.json();
      posts.value = [...posts.value, ...data.posts.map((post: Omit<Post, 'isExpanded'>) => ({
        ...post,
        isExpanded: false,
      }))];
      hasMore.value = data.hasMore;
      page.value++;
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Handle error (e.g., show error message to user)
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
  
  onMounted(() => {
    fetchPosts();
    
    observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !loading.value && hasMore.value) {
        fetchPosts();
      }
    }, { rootMargin: '100px' });
  
    if (intersectionTarget.value) {
      observer.observe(intersectionTarget.value);
    }
  });
  
  onUnmounted(() => {
    if (observer) {
      observer.disconnect();
    }
  });
  </script>
  
  <style scoped>
  .logo {
    filter: drop-shadow(0 0 0.75rem rgba(255, 255, 0, 0.3));
  }
  </style>