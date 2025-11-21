<template>
  <div
    v-if="isSplashVisible"
    class="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
  >
    <div 
      class="absolute inset-0 bg-black transition-opacity duration-1000 pointer-events-auto"
      :class="{ 'opacity-0 pointer-events-none': startFadeOut }"
    ></div>
    <img
      ref="splashLogo"
      src="/assets/images/bloblogo.webp"
      alt="Loading..."
      class="relative z-10 h-auto w-[40vw] max-w-lg object-contain"
      :style="logoStyle"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const { isSplashVisible, isAnimationDone } = useSplash()
const startFadeOut = ref(false)
const splashLogo = ref<HTMLElement | null>(null)
const logoStyle = ref<Record<string, string>>({})

onMounted(async () => {
  // Wait for a brief moment to ensure the page layout is settled
  await new Promise(resolve => setTimeout(resolve, 500))

  const targetLogo = document.getElementById('main-logo')

  if (targetLogo && splashLogo.value) {
    const targetRect = targetLogo.getBoundingClientRect()
    const startRect = splashLogo.value.getBoundingClientRect()

    // Initial state: Match the start position exactly
    // We position the element exactly where it currently is on screen
    logoStyle.value = {
      position: 'fixed',
      top: `${startRect.top}px`,
      left: `${startRect.left}px`,
      width: `${startRect.width}px`,
      height: `${startRect.height}px`,
      transform: 'none',
      transformOrigin: 'top left',
      transition: 'none',
      zIndex: '9999'
    }

    // Force reflow to apply the initial state
    void splashLogo.value.offsetWidth

    // Calculate the transform needed to reach the target
    const scale = targetRect.width / startRect.width
    const translateX = targetRect.left - startRect.left
    const translateY = targetRect.top - startRect.top

    // Target state: Animate to the target position and scale
    setTimeout(() => {
      logoStyle.value = {
        position: 'fixed',
        top: `${startRect.top}px`,
        left: `${startRect.left}px`,
        width: `${startRect.width}px`,
        height: `${startRect.height}px`,
        transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
        transformOrigin: 'top left',
        transition: 'transform 1.2s cubic-bezier(0.22, 1, 0.36, 1)', // Smooth ease-out
        zIndex: '9999'
      }
      startFadeOut.value = true
    }, 50)

    // Wait for transition to finish
    setTimeout(() => {
      isAnimationDone.value = true
      isSplashVisible.value = false
    }, 1250) // Match duration + delay
  } else {
    // Fallback if no target logo found
    startFadeOut.value = true
    setTimeout(() => {
      isAnimationDone.value = true
      isSplashVisible.value = false
    }, 1000)
  }
})
</script>

<style scoped>
/* Ensure the splash screen is on top of everything */
</style>
