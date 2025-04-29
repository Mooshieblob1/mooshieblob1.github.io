<template>
  <NuxtLayout>
    <transition name="layout" mode="out-in">
      <transition name="page" mode="out-in">
        <NuxtPage />
      </transition>
    </transition>
  </NuxtLayout>
</template>

<script setup lang="ts">
// No script needed anymore!
</script>

<style>
/* Layout transitions (general page fade) */
.layout-enter-active,
.layout-leave-active {
  transition: opacity 1s ease;
}

.layout-enter-from,
.layout-leave-to {
  opacity: 0;
}

/* Page transitions (blur + zoom smoothness) */
.page-enter-active,
.page-leave-active {
  transition:
    opacity 0.7s ease,
    filter 0.7s ease,
    transform 0.7s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(0.8rem);
  transform: scale(1.02) translateY(10px);
  pointer-events: none;
}

/* Global cursor fix */
body {
  user-select: none;
}

/* Allow selecting inside inputs or textareas */
input,
textarea {
  user-select: text;
}
</style>
