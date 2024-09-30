<template>
  <div class="rain-container">
    <div v-for="n in raindropsCount" :key="n" class="raindrop"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      raindropsCount: 100
    }
  },
  mounted() {
    this.animateRain();
  },
  methods: {
    animateRain() {
      const raindrops = this.$el.querySelectorAll('.raindrop');
      raindrops.forEach(drop => {
        const delay = Math.random() * 5;
        const duration = Math.random() * 1 + 0.5;
        drop.style.left = `${Math.random() * 100}%`;
        drop.style.animationDelay = `${delay}s`;
        drop.style.animationDuration = `${duration}s`;
      });
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
}

.raindrop {
  position: absolute;
  width: 2px;
  height: 15px;
  background: linear-gradient(transparent, #00f);
  animation: fall linear infinite;
}

@keyframes fall {
  0% {
    transform: translateY(-100px);
  }
  100% {
    transform: translateY(100vh);
  }
}
</style>