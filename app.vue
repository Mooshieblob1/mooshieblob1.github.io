<template>
  <transition name="layout" mode="out-in">
    <NuxtLayout>
      <transition name="page" mode="out-in">
        <template v-if="ready">
          <NuxtPage />
        </template>
      </transition>
    </NuxtLayout>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const ready = ref(false);

onMounted(() => {
  requestAnimationFrame(() => {
    ready.value = true;
    // Blur any auto-focused elements to prevent blinking cursor
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  });
});
</script>

<style>
/* Layout transitions */
.layout-enter-active,
.layout-leave-active {
  transition: opacity 0.8s ease;
}

.layout-enter-from,
.layout-leave-to {
  opacity: 0;
}

.page-enter-active,
.page-leave-active {
  transition:
    opacity 0.5s ease,
    filter 0.5s ease,
    transform 0.5s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
  transform: scale(1.03) translateY(20px);
  pointer-events: none;
}

/* NEW: Fix unwanted blinking cursor by disabling text selection */
body {
  user-select: none;
}

/* Allow selecting inside inputs or textareas */
input,
textarea {
  user-select: text;
}
</style>
