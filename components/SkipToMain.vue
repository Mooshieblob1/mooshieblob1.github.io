<template>
  <a href="#main-content" class="skip-to-main">
    Skip to main content
  </a>
</template>

<script setup lang="ts">
// Skip navigation link for keyboard accessibility
</script>

<style scoped>
.skip-to-main {
  position: absolute;
  top: -40px;
  left: 0;
  background: #fbc21b;
  color: #02061a;
  padding: 8px 16px;
  text-decoration: none;
  font-weight: bold;
  z-index: 10000;
  transition: top 0.2s;
}

.skip-to-main:focus {
  top: 0;
}
</style>
