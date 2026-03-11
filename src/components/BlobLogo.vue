<template>
  <img
    id="main-logo"
    src="/assets/images/bloblogo.webp"
    alt=""
    class="social-logo transition-opacity duration-300"
    :style="{ opacity: visible ? 1 : 0 }"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const splashAlreadyDone = typeof sessionStorage !== 'undefined' && !!sessionStorage.getItem('splash-shown');
const visible = ref(splashAlreadyDone);

function onSplashDone() {
  visible.value = true;
}

onMounted(() => {
  // If splash already played (return visit or View Transition navigation), always show
  if (sessionStorage.getItem('splash-shown')) {
    visible.value = true;
  }
  // Listen for splash completion event from SplashScreen
  document.addEventListener('splash-done', onSplashDone);
});

onUnmounted(() => {
  document.removeEventListener('splash-done', onSplashDone);
});
</script>
