<template>
    <img 
      id="main-logo" 
      src="/assets/images/bloblogo.webp" 
      alt="" 
      class="social-logo"
      :class="{ 'opacity-0': !isAnimationDone, 'opacity-100': isAnimationDone }"
    >
</template>

<script setup>
const { isAnimationDone } = useSplash()
</script>

<script>
export default {
    name: 'BlobLogo'
}
</script>