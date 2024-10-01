<template>
  <div>
    <Navbar />
    <RainEffect />
    <slot />
    <WebFooter />
  </div>
</template>

<script setup>
import WebFooter from "~/components/footer/webfooter.vue";
import Navbar from "~/components/nav/navbar.vue";
import RainEffect from "~/components/effects/RainEffect.vue";
</script>