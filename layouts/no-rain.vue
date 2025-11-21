<template>
  <div>
    <SkipToMain />
    <Navbar />
    <CursorFollower />
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
import CursorFollower from "~/components/effects/CursorFollower.vue";
</script>
