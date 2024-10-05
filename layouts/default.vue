<template>
  <div class="layout-wrapper">
    <div class="page-wrapper">
    <Navbar />
    <RainEffect />
    <main class="main-content">
      <slot />
    </main>
    <WebFooter />
  </div>
</div>
</template>

<script setup>
import WebFooter from "~/components/footer/webfooter.vue";
import Navbar from "~/components/nav/navbar.vue";
import RainEffect from "~/components/effects/RainEffect.vue";
</script>

<style scoped>
.layout-wrapper,
.page-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
}
</style>