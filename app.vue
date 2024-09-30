<!-- layouts/default.vue -->
<template>
  <div>
    <Navbar />
    <NuxtPage />
    <WebFooter />
  </div>
</template>
<script setup>
import WebFooter from "~/components/footer/webfooter.vue";
import Navbar from "~/components/nav/navbar.vue";
</script>