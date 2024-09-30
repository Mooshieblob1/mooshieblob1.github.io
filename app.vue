<!-- layouts/default.vue -->
<template>
  <div>
    <Navbar />
    <bloblogo />
    <NuxtPage />
    <WebFooter />
  </div>
</template>
<script setup>
import DigitalClock from '~/components/DigitalClock.vue';
import WebFooter from "~/components/footer/webfooter.vue";
import Navbar from "~/components/nav/navbar.vue";
import bloblogo from "~/components/header/bloblogo.vue";
</script>