<template>
  <div
    class="flex min-h-screen w-full items-center justify-center bg-gray-900 p-4"
  >
    <div class="w-full max-w-md rounded-lg bg-gray-800 p-6 shadow-lg">
      <NuxtLink to="/">
        <img
          src="~/assets/images/bloblogo.webp"
          alt="logo"
          class="logo mx-auto mb-6 h-[10vw] w-auto cursor-pointer"
        />
      </NuxtLink>
      <h1 class="mb-4 text-center text-2xl font-bold text-yellow-400">
        Submit Your Ideas
      </h1>
      <form
        action="https://formsubmit.co/blob@mooshieblob.com"
        method="POST"
        class="w-full"
      >
        <!-- FormSubmit honeypot to prevent spam -->
        <input type="text" name="_honey" style="display: none" />

        <!-- Disable captcha -->
        <input type="hidden" name="_captcha" value="false" />

        <!-- Redirect after submission -->
        <input
          type="hidden"
          name="_next"
          value="https://mooshieblob.com/thank-you"
        />

        <div class="mb-4">
          <label for="idea" class="mb-2 block text-yellow-300"
            >Your Idea:</label
          >
          <textarea
            id="idea"
            name="message"
            class="w-full rounded border border-gray-700 bg-gray-700 p-2 text-white placeholder-gray-400"
            rows="6"
            placeholder="Share your submission ideas here..."
            required
          ></textarea>
        </div>
        <button
          type="submit"
          class="w-full rounded bg-yellow-400 px-4 py-2 font-bold text-gray-900 transition-colors hover:bg-yellow-300"
        >
          Submit
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";

definePageMeta({
  layout: "no-rain",
  pageTransition: {
    name: "page",
    mode: "out-in",
  },
});

// Blur fix: manually remove focus on page load
onMounted(() => {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
});
</script>

<style scoped>
.logo {
  filter: drop-shadow(0 0 0.75rem rgba(255, 255, 0, 0.3));
}
</style>
