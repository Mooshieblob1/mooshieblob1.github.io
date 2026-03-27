<template>
  <div
    class="cursor-follower"
    :style="{ left: x + 'px', top: y + 'px' }"
  ></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const x = ref(-100);
const y = ref(-100);
const targetX = ref(-100);
const targetY = ref(-100);
const initialized = ref(false);
let animationFrameId: number;
let lastTime = 0;
const TARGET_DT = 1000 / 60;

const updateCursor = (e: MouseEvent) => {
  targetX.value = e.clientX;
  targetY.value = e.clientY;

  if (!initialized.value) {
    x.value = e.clientX;
    y.value = e.clientY;
    initialized.value = true;
  }
};

const animate = (now: number) => {
  if (!lastTime) lastTime = now;
  const rawDt = now - lastTime;
  lastTime = now;
  const dt = Math.min(rawDt, TARGET_DT * 4) / TARGET_DT;

  const lerpFactor = 1 - Math.pow(1 - 0.15, dt);
  const dx = targetX.value - x.value;
  const dy = targetY.value - y.value;
  x.value += dx * lerpFactor;
  y.value += dy * lerpFactor;
  animationFrameId = requestAnimationFrame(animate);
};

onMounted(() => {
  window.addEventListener('mousemove', updateCursor);
  animate();
});

onUnmounted(() => {
  window.removeEventListener('mousemove', updateCursor);
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
});
</script>

<style scoped>
.cursor-follower {
  position: fixed;
  width: 40px;
  height: 40px;
  border: 2px solid #ffcc00;
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  transform: translate(-50%, -50%);
}

@media (hover: none) {
  .cursor-follower {
    display: none;
  }
}
</style>
