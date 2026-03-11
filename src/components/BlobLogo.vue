<template>
  <img
    id="main-logo"
    src="/assets/images/bloblogo.webp"
    alt=""
    class="social-logo transition-opacity duration-500"
    :class="{ 'opacity-0': !isVisible, 'opacity-100': isVisible }"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { splashState } from '../stores/splash';

const isVisible = ref(splashState.isAnimationDone);

onMounted(() => {
  // Ensure visibility on mount (handles View Transitions re-hydration)
  if (sessionStorage.getItem('splash-shown')) {
    isVisible.value = true;
    splashState.isAnimationDone = true;
  }
});

// React to splash completing
watch(() => splashState.isAnimationDone, (val) => {
  if (val) isVisible.value = true;
});
</script>
