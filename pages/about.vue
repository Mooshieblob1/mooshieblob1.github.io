<template>
  <div
    class="min-h-screen bg-gray-900 p-8 text-gray-300"
    style="will-change: opacity, filter, transform"
  >
    <NuxtLink to="/">
      <img
        src="~/assets/images/bloblogo.webp"
        alt="logo"
        class="logo mx-auto mb-12 mt-12 h-[5vw] w-auto"
      />
    </NuxtLink>

    <div class="mx-auto max-w-4xl text-center">
      <h1 class="mb-8 text-4xl font-bold text-yellow-400">About Me</h1>

      <p class="mb-6">
        Hey there! I'm
        <span class="font-semibold text-yellow-300">MooshieBlob</span> — a
        developer who loves crafting beautiful web experiences, learning new
        tech, and making fun projects with Nuxt and Vue.
      </p>

      <p class="mb-6">
        Whether it's working with
        <span class="text-yellow-300">frontend frameworks</span>, experimenting
        with <span class="text-yellow-300">AI tools</span>, or designing
        <span class="text-yellow-300">creative layouts</span>, I'm always
        excited to bring new ideas to life.
      </p>

      <p class="mb-6">
        When I'm not coding, you might find me playing games, diving into anime,
        or exploring new tech innovations. Thanks for visiting my site!
      </p>

      <NuxtLink
        to="/"
        class="mt-8 inline-block rounded bg-yellow-400 px-6 py-3 font-bold text-gray-900 transition hover:bg-yellow-300"
      >
        Back to Home
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { useRainEffect } from "~/composables/useRainEffect";
import "~/assets/css/output.css";

const { toggleRainEffect } = useRainEffect();

// Disable rain effect for this page
toggleRainEffect(false);

// 🧠 Enable the page transition nicely
definePageMeta({
  layout: "no-rain",
  pageTransition: {
    name: "page",
    mode: "out-in",
  },
});
</script>

<style scoped>
.logo {
  filter: drop-shadow(0 0 0.75rem rgba(255, 255, 0, 0.3));
}
</style>
