<template>
  <NuxtLayout>
    <template #default>
      <Navbar />
      <NuxtPage />
      <WebFooter />
    </template>
  </NuxtLayout>
</template>

<script setup>
import WebFooter from "~/components/footer/webfooter.vue";
import Navbar from "~/components/nav/navbar.vue";
</script>