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

/* Global cursor fix - only disable on interactive elements */
button,
.no-select {
  user-select: none;
}

/* Ensure text in inputs and textareas is selectable */
input,
textarea,
p,
span,
h1,
h2,
h3,
h4,
h5,
h6 {
  user-select: text;
}

/* Global focus styles for accessibility */
*:focus-visible {
  outline: 2px solid #fbc21b;
  outline-offset: 2px;
}

/* Remove default focus for mouse users */
*:focus:not(:focus-visible) {
  outline: none;
}

/* Screen reader only utility class */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
