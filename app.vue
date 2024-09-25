<!-- layouts/default.vue -->
<template>
  <div>
    <Clock />
    <Navbar />
    <NuxtPage />
    <WebFooter />
  </div>
</template>
<script setup>
import Clock from '~/components/clock.vue';
import WebFooter from "~/components/footer/webfooter.vue";
import Navbar from "~/components/nav/navbar.vue";
</script>