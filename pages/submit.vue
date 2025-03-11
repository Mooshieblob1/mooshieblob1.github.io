<template>
  <div class="flex h-screen w-full items-center justify-center">
    <div class="w-full max-w-md p-6">
      <NuxtLink to="/">
        <img
          src="~/assets/images/bloblogo.webp"
          alt="logo"
          class="logo mx-auto mb-6 h-[10vw] w-auto cursor-pointer"
        />
      </NuxtLink>
      <h1 class="mb-4 text-2xl font-bold">Submit Your Ideas</h1>
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
          <label for="idea" class="mb-2 block">Your Idea:</label>
          <textarea
            id="idea"
            name="message"
            class="w-full rounded border border-[#141D4A] bg-[#141D4A] p-2 text-white"
            rows="6"
            placeholder="Share your submission ideas here..."
            required
          ></textarea>
        </div>
        <button
          type="submit"
          class="rounded bg-[#141D4A] px-4 py-2 text-white hover:bg-[#060C2F]"
        >
          Submit
        </button>
      </form>
    </div>
  </div>
</template>
