<template>
  <div class="social-links flex">
    <BlobLogo />
    <div class="social-icons flex">
      <a
        href="https://safe.aibooru.online/posts?tags=user%3ABlob"
        target="_blank"
        rel="noopener"
        class="mr-2"
      >
        <img
          src="/assets/icons/aibooru.svg"
          alt="AIBooru"
          class="social-icon"
          style="margin-top: 4px; width: 35px; height: 35px"
        />
      </a>
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
import BlobLogo from "~/components/logo/bloblogo.vue";
</script>
