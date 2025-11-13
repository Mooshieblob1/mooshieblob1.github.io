<template>
  <div>
    <SkipToMain />
    <Navbar />
    <main id="main-content">
      <slot />
    </main>
    <WebFooter />
  </div>
</template>

<script setup>
import WebFooter from "~/components/footer/webfooter.vue";
import Navbar from "~/components/nav/navbar.vue";
import SkipToMain from "~/components/SkipToMain.vue";
</script>
