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
      <div v-for="post in posts" :key="post._path" class="mb-6">
        <div
          class="overflow-hidden rounded-lg border border-gray-700 bg-gray-800 bg-opacity-50 shadow-lg backdrop-blur-lg backdrop-filter transition-all duration-300 hover:shadow-xl"
        >
          <div class="cursor-pointer p-6" @click="openPost(post)">
            <h2 class="mb-2 text-2xl font-semibold text-yellow-300">
              {{ post.title }}
            </h2>
            <p
              v-if="post.excerpt || post.description"
              class="preview-text mb-4 text-gray-300"
            >
              {{ truncateText(post.excerpt || post.description) }}
            </p>
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

    <!-- Expanded post overlay with transition -->
    <Transition name="fade">
      <div
        v-if="expandedPost"
        class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm"
        @click.self="closePost"
      >
        <div class="my-8 w-[90vw] max-w-4xl rounded-lg bg-gray-800 p-8">
          <h2 class="mb-4 text-3xl font-bold text-yellow-300">
            {{ expandedPost.title }}
          </h2>
          <ContentRenderer :value="expandedPost" class="mb-6 text-gray-300" />
          <button
            @click="closePost"
            class="rounded bg-yellow-400 px-4 py-2 text-gray-900 hover:bg-yellow-300"
          >
            Close
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useRainEffect } from "~/composables/useRainEffect";

const { toggleRainEffect } = useRainEffect();

// Disable rain effect for this page
toggleRainEffect(false);

interface Post {
  _path: string;
  title: string;
  excerpt?: string;
  description?: string;
  body: any;
}

const posts = ref<Post[]>([]);
const page = ref(1);
const limit = 5;
const loading = ref(false);
const hasMore = ref(true);
const infiniteScrollTrigger = ref<HTMLElement | null>(null);
const expandedPost = ref<Post | null>(null);
const isScrolling = ref(false);
let scrollTimer: ReturnType<typeof setTimeout> | null = null;

const fetchPosts = async () => {
  if (loading.value || !hasMore.value) return;

  loading.value = true;
  try {
    console.log(`Fetching posts: page ${page.value}, limit ${limit}`);
    const fetchedPosts = await queryContent("blog")
      .sort({ date: -1 }) // Sort by date in descending order, adjust if needed
      .skip((page.value - 1) * limit)
      .limit(limit)
      .find();

    console.log("Fetched posts:", fetchedPosts);

    if (fetchedPosts.length === 0) {
      console.log("No posts found");
      hasMore.value = false;
    } else {
      posts.value = [...posts.value, ...fetchedPosts];
      hasMore.value = fetchedPosts.length === limit;
      page.value++;
    }
  } catch (error) {
    console.error("Error fetching posts:", error);
  } finally {
    loading.value = false;
  }
};

const truncateText = (text: string) => {
  const words = text.split(" ");
  if (words.length > 10) {
    return words.slice(0, 10).join(" ") + "...";
  }
  return text;
};

const openPost = (post: Post) => {
  expandedPost.value = post;
  document.body.style.overflow = "hidden";
  document.body.style.paddingRight = "8px"; // Add padding equal to scrollbar width
};

const closePost = () => {
  expandedPost.value = null;
  document.body.style.overflow = "";
  document.body.style.paddingRight = ""; // Remove added padding
};

const handleScroll = () => {
  isScrolling.value = true;

  if (scrollTimer) {
    clearTimeout(scrollTimer);
  }

  scrollTimer = setTimeout(() => {
    isScrolling.value = false;
  }, 1000); // Adjust this value to control how long the scrollbar remains visible after scrolling stops
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

onMounted(async () => {
  const allPosts = await queryContent("blog").find();
  console.log("All posts:", allPosts);

  setupIntersectionObserver();
  fetchPosts();
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
  window.removeEventListener("scroll", handleScroll);
  if (scrollTimer) {
    clearTimeout(scrollTimer);
  }
});

// Watch for changes in the posts array
watch(posts, () => {
  // Re-setup the intersection observer after posts are loaded
  setupIntersectionObserver();
});

// Watch for changes in isScrolling
watch(isScrolling, (newValue) => {
  if (process.client) {
    if (newValue) {
      document.body.classList.add("is-scrolling");
    } else {
      document.body.classList.remove("is-scrolling");
    }
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

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Dynamic scrollbar styles */
/* For webkit-based browsers (Chrome, Safari, etc.) */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  border: 2px solid transparent;
  background-clip: content-box;
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

/* Hide scrollbar when not scrolling */
body:not(.is-scrolling) ::-webkit-scrollbar-thumb {
  background-color: transparent;
}

/* For Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

body:not(.is-scrolling) * {
  scrollbar-color: transparent transparent;
}

/* Prevent content shift when scrollbar appears/disappears */
html {
  scrollbar-gutter: stable;
}

/* Preview text styles */
.preview-text {
  position: relative;
  max-height: 4.5em; /* Adjust this value to control the height of the preview */
  overflow: hidden;
  -webkit-mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
  mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
}
</style>
