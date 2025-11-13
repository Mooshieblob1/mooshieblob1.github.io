<template>
  <div class="social-links flex">
    <BlobLogo />
    <div class="social-icons flex" role="navigation" aria-label="Social media links">
      <a
        href="https://x.com/mooshieblob"
        target="_blank"
        rel="noopener"
        class="mr-2"
        aria-label="Follow MooshieBlob on Twitter/X"
      >
        <Icon
          name="mdi:twitter"
          class="social-icon"
          style="color: #ffcc00; font-size: 35px"
          aria-hidden="true"
        />
      </a>
      <a
        href="https://github.com/Mooshieblob1/"
        target="_blank"
        rel="noopener"
        class="mr-2"
        aria-label="Visit MooshieBlob's GitHub profile"
      >
        <Icon
          name="mdi:github"
          class="social-icon"
          style="color: #ffcc00; font-size: 35px"
          aria-hidden="true"
        />
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import BlobLogo from "./logo/bloblogo.vue";
// No need to import Icon - it's auto-imported by @nuxt/icon
</script>
