<template>
  <div class="social-links flex">
    <BlobLogo />
    <div class="social-icons flex">
      <a
        href="https://x.com/mooshieblob"
        target="_blank"
        rel="noopener"
        class="mr-2"
      >
        <Icon
          name="mdi:twitter"
          class="social-icon"
          :style="{ color: '#ffcc00', fontSize: '35px' }"
        />
      </a>
      <a
        href="https://github.com/Mooshieblob1/"
        target="_blank"
        rel="noopener"
        class="mr-2"
      >
        <Icon
          name="mdi:github"
          class="social-icon"
          :style="{ color: '#ffcc00', fontSize: '35px' }"
        />
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import BlobLogo from "./logo/bloblogo.vue";
</script>
