<template>
  <transition name="layout" mode="out-in">
    <NuxtLayout>
      <transition name="page" mode="out-in">
        <NuxtPage />
      </transition>
    </NuxtLayout>
  </transition>
</template>

<style>
/* Page transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.8s ease, filter 0.8s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}

/* Layout transitions */
.layout-enter-active,
.layout-leave-active {
  transition: opacity 0.8s ease;
}

.layout-enter-from,
.layout-leave-to {
  opacity: 0;
}

/* Specific slide-in transition for layouts */
.slide-in-enter-active,
.slide-in-leave-active {
  transition: all 0.8s;
}

.slide-in-enter-from {
  opacity: 0;
  filter: blur(1rem);
  transform: translateX(-20px);
}

.slide-in-leave-to {
  opacity: 0;
  filter: blur(1rem);
  transform: translateX(20px);
}

/* Ensure layout elements don't move during transitions */
.layout-wrapper, .social-links {
  transition: none;
}
</style>