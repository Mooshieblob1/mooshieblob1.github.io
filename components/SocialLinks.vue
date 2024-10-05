<template>
  <div class="social-links flex">
    <BlobLogo />
    <div class="social-icons flex">
      <a href="https://safe.aibooru.online/posts?tags=user%3ABlob" target="_blank" rel="noopener" class="mr-2">
        <img src="/assets/icons/aibooru.svg" alt="AIBooru" class="social-icon" style="margin-top: 4px">
      </a>
      <a href="https://x.com/mooshieblob" target="_blank" rel="noopener" class="mr-2">
        <Icon name="pajamas:twitter" style="color: #ffcc00; font-size: 35px" class="social-icon" />
      </a>
      <a href="https://github.com/Mooshieblob1/" target="_blank" rel="noopener" class="mr-2">
        <Icon name="uil:github" style="color: #ffcc00; font-size: 35px" class="social-icon" />
      </a>
    </div>
  </div>
</template>

<script setup>
import BlobLogo from '~/components/logo/bloblogo.vue';
</script>
