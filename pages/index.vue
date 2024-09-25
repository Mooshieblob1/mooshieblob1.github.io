<template>
  <div class="back-row-toggle splat-toggle">
    <div class="social-links flex">
      <img src="assets/images/bloblogo.webp" alt="" class="social-logo">
      <div class="social-icons flex">
        <a href="https://safe.aibooru.online/posts?tags=user%3ABlob" target="_blank" rel="noopener" class="mr-2">
          <img src="assets/icons/aibooru.svg" alt="AIBooru" class="social-icon" style="margin-top: 4px">
        </a>
        <a href="https://x.com/mooshieblob" target="_blank" rel="noopener" class="mr-2">
          <Icon name="pajamas:twitter" style="color: #ffcc00; font-size: 35px" class="social-icon" />
        </a>
        <a href="https://github.com/Mooshieblob1/" target="_blank" rel="noopener" class="mr-2">
          <Icon name="uil:github" style="color: #ffcc00; font-size: 35px" class="social-icon" />
        </a>
      </div>
    </div>
    <img id="bg_girl" src="assets/images/bg.webp" alt="Background Image" class="h-4 md:h-6 lg:h-9 w-auto">
  </div>
</template>

<script>
export default {
  head() {
    return {
      title: 'Mooshieblob',
      meta: [
        { name: 'description', content: 'My links page' },
        { property: 'og:title', content: 'Mooshieblobsite' },
        { property: 'og:description', content: 'My links page' },
        { property: 'og:image', content: '~/assets/images/page.png' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
        { charset: 'UTF-8' },
      ],
      link: [
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css',
        },
        { rel: 'stylesheet', href: '/assets/css/style.css' },
      ],
      script: [
        {
          src: 'https://code.jquery.com/jquery-3.7.1.min.js',
          integrity: 'sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=',
          crossorigin: 'anonymous',
        },
        {
          src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
        },
        { src: '/assets/js/script.js' },
      ],
    };
  },
};
</script>

<style>
/* Your CSS styles here */
</style>
