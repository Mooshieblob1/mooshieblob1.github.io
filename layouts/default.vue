<template>
    <div>
      <slot></slot>
      <RainEffect />
    </div>
  </template>
  
  <script setup>
  import RainEffect from '~/components/effects/RainEffect.vue';
  </script>