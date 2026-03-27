<template>
  <div ref="el" class="cursor-follower"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const el = ref<HTMLElement | null>(null);

let targetX = -100;
let targetY = -100;
let curX = -100;
let curY = -100;
let initialized = false;
let animationFrameId: number;
let lastTime = 0;
const TARGET_DT = 1000 / 60;

const updateCursor = (e: MouseEvent) => {
  targetX = e.clientX;
  targetY = e.clientY;

  if (!initialized) {
    curX = e.clientX;
    curY = e.clientY;
    initialized = true;
  }
};

const animate = (now: number) => {
  if (!lastTime) lastTime = now;
  const rawDt = now - lastTime;
  lastTime = now;
  const dt = Math.min(rawDt, TARGET_DT * 4) / TARGET_DT;

  const lerpFactor = 1 - Math.pow(1 - 0.15, dt);
  curX += (targetX - curX) * lerpFactor;
  curY += (targetY - curY) * lerpFactor;

  if (el.value) {
    el.value.style.transform = `translate(${curX - 20}px, ${curY - 20}px)`;
  }

  animationFrameId = requestAnimationFrame(animate);
};

function onVisibilityChange() {
  if (!document.hidden) lastTime = 0;
}

onMounted(() => {
  window.addEventListener('mousemove', updateCursor);
  document.addEventListener('visibilitychange', onVisibilityChange);
  animationFrameId = requestAnimationFrame(animate);
});

onUnmounted(() => {
  window.removeEventListener('mousemove', updateCursor);
  document.removeEventListener('visibilitychange', onVisibilityChange);
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
});
</script>

<style scoped>
.cursor-follower {
  position: fixed;
  top: 0;
  left: 0;
  width: 40px;
  height: 40px;
  border: 2px solid #ffcc00;
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  will-change: transform;
}

@media (hover: none) {
  .cursor-follower {
    display: none;
  }
}
</style>
