<!-- layouts/default.vue -->
<template>
  <div>
    <DigitalClock />
    <Navbar />
    <NuxtPage />
    <WebFooter />
  </div>
</template>
<script setup>
import DigitalClock from '~/components/DigitalClock.vue';
import WebFooter from "~/components/footer/webfooter.vue";
import Navbar from "~/components/nav/navbar.vue";
</script>