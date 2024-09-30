<template>
  <div>
    <Navbar />
    <NuxtPage />
    <WebFooter />
    <RainEffect />
  </div>
</template>

<script setup>
import WebFooter from "~/components/footer/webfooter.vue";
import Navbar from "~/components/nav/navbar.vue";
import RainEffect from '~/components/effects/RainEffect.vue';
</script>