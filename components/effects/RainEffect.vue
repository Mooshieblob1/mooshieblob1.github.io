<template>
  <div class="rain-container">
    <div v-for="n in raindropsCount" :key="n" class="raindrop" :style="getRaindropStyle()"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      raindropsCount: 50 // Reduced for better performance
    }
  },
  mounted() {
    this.animateRain();
  },
  methods: {
    getRaindropStyle() {
      const delay = Math.random() * 5;
      const duration = Math.random() * 1 + 0.5;
      const leftPosition = Math.random() * 100;
      return {
        left: `${leftPosition}%`,
        top: '-15px', // Start above the screen
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`
      };
    },
    animateRain() {
      // This method is now optional since we're using getRaindropStyle
      // You can remove it if you're not planning to do any additional animations
    }
  }
}
</script>

<style scoped>
.rain-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;
  overflow: hidden;
}

.raindrop {
  position: absolute;
  width: 1px;
  height: 15px;
  background: linear-gradient(transparent, #fff);
  animation: fall linear infinite;
}

@keyframes fall {
  0% {
    transform: translateY(-15px);
  }
  100% {
    transform: translateY(100vh);
  }
}
</style>