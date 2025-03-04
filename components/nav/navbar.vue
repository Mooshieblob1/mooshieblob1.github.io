<!--
    This component represents the navigation bar of the application.
    It includes links to various sections of the site, providing
    users with an easy way to navigate through the app.
-->

<template>
  <nav class="fixed right-0 top-0 w-full bg-transparent p-4">
    <div class="container mx-auto flex items-center justify-end space-x-4">
      <div class="group relative">
        <nuxt-link
          to="/blog"
          class="hover:glow text-white transition duration-700 hover:text-yellow-400"
        >
          Blog
        </nuxt-link>
      </div>
      <div class="group relative">
        <nuxt-link
          to="/images"
          class="hover:glow text-white transition duration-700 hover:text-yellow-400"
        >
          Images
        </nuxt-link>
      </div>
    </div>
  </nav>
</template>

<script>
import "~/assets/css/output.css";

export default {
  name: "Navbar",
};
</script>

<style>
/* Add any additional styles here if needed */
@keyframes glow {
  0% {
    text-shadow: 0 0 0 rgba(255, 255, 255, 0.5);
  }
  50% {
    text-shadow: 0 0 10px 5px rgba(255, 255, 255, 0.5);
  }
  100% {
    text-shadow: 0 0 0 rgba(255, 255, 255, 0.5);
  }
}

.hover\:glow:hover {
  animation: glow 1s infinite;
}
</style>
