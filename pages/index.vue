<template>
  <div class="index-content">
    <SocialLinks />
    <div class="back-row-toggle splat-toggle">
      <img
        id="bg_girl"
        src="/assets/images/bg.webp"
        alt="Background Image"
        class="h-4 w-auto md:h-6 lg:h-9"
      >
    </div>
  </div>
</template>

<script setup>
import SocialLinks from '~/components/SocialLinks.vue';

useHead({
  title: "Mooshieblob",
  meta: [
    { name: "description", content: "My links page" },
    { property: "og:title", content: "Mooshieblobsite" },
    { property: "og:description", content: "My links page" },
    { property: "og:image", content: "/assets/images/page.png" },
    { name: "twitter:card", content: "summary_large_image" },
  ],
})
</script>

<style scoped>
.index-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>