<template>
  <div>
    <Navbar />
    <slot />
    <WebFooter />
  </div>
</template>

<script setup>
import WebFooter from "~/components/footer/webfooter.vue";
import Navbar from "~/components/nav/navbar.vue";
</script>