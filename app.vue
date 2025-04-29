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
    transform 0.5s ease; /* Also animate position! */
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
  transform: scale(1.03); /* slightly zoomed in when entering/leaving */
  /* ADD these lines */
  transform: translateY(20px);
  pointer-events: none;
}

/* You can tweak the scale value if you want a stronger or weaker effect */
</style>
